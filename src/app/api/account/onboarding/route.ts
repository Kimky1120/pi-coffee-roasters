import { NextResponse } from "next/server";
import { getSocialProvider } from "@/lib/auth/social-profile";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type OnboardingBody = {
  name?: string;
  nickname?: string;
  phone?: string;
  birth?: string;
  termsAgree?: boolean;
  privacyAgree?: boolean;
  marketingAgree?: boolean;
};

function errorResponse(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

function isValidBirth(value: string) {
  if (!value) return true;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const birth = new Date(Date.UTC(year, month - 1, day));
  const today = new Date();

  return (
    year >= 1900 &&
    birth.getUTCFullYear() === year &&
    birth.getUTCMonth() === month - 1 &&
    birth.getUTCDate() === day &&
    birth.getTime() <=
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  );
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return errorResponse("로그인이 필요합니다.", 401);
  const provider = getSocialProvider(user);
  if (!provider) return errorResponse("간편가입 계정을 확인해 주세요.", 400);

  const body = (await request.json().catch(() => null)) as OnboardingBody | null;
  if (!body?.termsAgree || !body.privacyAgree) {
    return errorResponse("필수 약관에 동의해 주세요.", 400);
  }

  const name = body.name?.trim() ?? "";
  const nickname = body.nickname?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const birth = body.birth?.trim() ?? "";

  if (name.length < 2 || name.length > 30) {
    return errorResponse("성명은 2자 이상 30자 이하로 입력해 주세요.", 400);
  }
  if (nickname.length < 2 || nickname.length > 20) {
    return errorResponse("닉네임은 2자 이상 20자 이하로 입력해 주세요.", 400);
  }
  if (!/^010-\d{4}-\d{4}$/.test(phone)) {
    return errorResponse("휴대폰 번호를 확인해 주세요.", 400);
  }
  if (!isValidBirth(birth)) {
    return errorResponse("생년월일을 확인해 주세요.", 400);
  }

  try {
    const admin = getSupabaseAdminClient();
    const { error: profileError } = await admin
      .from("profiles")
      .update({
        name,
        nickname,
        phone,
        birth: birth || null,
        marketing_agree: body.marketingAgree === true,
      })
      .eq("id", user.id);

    if (profileError) {
      return errorResponse("회원정보를 저장하지 못했습니다.", 500);
    }

    const completedAt = new Date().toISOString();
    const { error: metadataError } = await admin.auth.admin.updateUserById(
      user.id,
      {
        app_metadata: {
          ...(user.app_metadata ?? {}),
          social_provider: provider,
          social_onboarding_completed: true,
          social_onboarding_completed_at: completedAt,
          terms_agreed_at: completedAt,
          privacy_agreed_at: completedAt,
        },
      },
    );

    if (metadataError) {
      return errorResponse("가입 정보를 완료하지 못했습니다.", 500);
    }

    return NextResponse.json({ success: true });
  } catch {
    return errorResponse("회원가입 기능의 서버 설정을 확인해 주세요.", 503);
  }
}
