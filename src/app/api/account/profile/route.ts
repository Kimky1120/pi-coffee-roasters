import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type ProfileUpdateBody =
  | {
      action: "nickname";
      nickname?: string;
      currentPassword?: string;
    }
  | {
      action: "identity";
      name?: string;
      phone?: string;
      birth?: string;
      currentPassword?: string;
    }
  | {
      action: "marketing";
      marketingAgree?: boolean;
    };

function errorResponse(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return errorResponse("로그인이 필요합니다.", 401);

  const body = (await request.json().catch(() => null)) as ProfileUpdateBody | null;
  if (!body || !["nickname", "identity", "marketing"].includes(body.action)) {
    return errorResponse("요청 내용을 확인해 주세요.", 400);
  }

  const hasEmailPassword =
    user.identities?.some((identity) => identity.provider === "email") ??
    user.app_metadata.provider === "email";
  const cookieStore = await cookies();
  const recentReauthentication = cookieStore.get("pi_account_reauth")?.value;
  const requiresReauthentication = body.action !== "marketing";

  if (requiresReauthentication && recentReauthentication === "email") {
    // 등록 이메일로 받은 1회용 링크를 방금 확인한 경우
  } else if (requiresReauthentication && hasEmailPassword) {
    if (!user.email || !body.currentPassword) {
      return errorResponse("현재 비밀번호를 입력해 주세요.", 400);
    }

    const { error: passwordError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: body.currentPassword,
    });

    if (passwordError) {
      return errorResponse("현재 비밀번호가 올바르지 않습니다.", 403);
    }
  } else if (requiresReauthentication) {
    const hasKakaoIdentity = user.identities?.some(
      (identity) => identity.provider === "kakao",
    );
    const hasRecentKakaoAuth = recentReauthentication === "kakao";

    if (!hasKakaoIdentity || !hasRecentKakaoAuth) {
      return errorResponse("카카오 계정 재인증이 필요합니다.", 403);
    }
  }

  try {
    const admin = getSupabaseAdminClient();
    const updates: Record<string, string | boolean | null> = {};

    if (body.action === "marketing") {
      if (typeof body.marketingAgree !== "boolean") {
        return errorResponse("마케팅 수신 설정을 확인해 주세요.", 400);
      }
      updates.marketing_agree = body.marketingAgree;
    } else if (body.action === "nickname") {
      const nickname = body.nickname?.trim() ?? "";
      if (nickname.length < 2 || nickname.length > 20) {
        return errorResponse("닉네임은 2자 이상 20자 이하로 입력해 주세요.", 400);
      }
      updates.nickname = nickname;
    } else {
      const { data: currentProfile, error: profileError } = await admin
        .from("profiles")
        .select("name, phone, birth")
        .eq("id", user.id)
        .single();

      if (profileError || !currentProfile) {
        return errorResponse("회원정보를 확인하지 못했습니다.", 500);
      }

      const name = body.name?.trim() ?? "";
      const phone = body.phone?.trim() ?? "";
      const birth = body.birth?.trim() ?? "";

      if (name.length < 2 || name.length > 30) {
        return errorResponse("성명은 2자 이상 30자 이하로 입력해 주세요.", 400);
      }
      if (!/^010-\d{4}-\d{4}$/.test(phone)) {
        return errorResponse(
          "휴대폰 번호를 010-0000-0000 형식으로 입력해 주세요.",
          400,
        );
      }
      if (birth && !/^\d{4}-\d{2}-\d{2}$/.test(birth)) {
        return errorResponse("생년월일을 확인해 주세요.", 400);
      }

      if (name !== (currentProfile.name ?? "")) {
        updates.name = name;
      }
      if (phone !== (currentProfile.phone ?? "")) {
        updates.phone = phone;
      }
      if (birth !== (currentProfile.birth ?? "")) {
        updates.birth = birth || null;
      }

      if (Object.keys(updates).length === 0) {
        return errorResponse("새로 등록할 정보가 없습니다.", 400);
      }
    }

    const { data: updatedProfile, error: updateError } = await admin
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select("marketing_agree, marketing_agree_updated_at")
      .single();

    if (updateError) {
      return errorResponse("회원정보를 저장하지 못했습니다.", 500);
    }

    const response = NextResponse.json({
      success: true,
      updates,
      marketingAgreeUpdatedAt:
        updatedProfile?.marketing_agree_updated_at ?? null,
    });
    if (requiresReauthentication) {
      response.cookies.delete("pi_account_reauth");
    }
    return response;
  } catch {
    return errorResponse(
      "회원정보 수정 기능의 서버 설정이 아직 완료되지 않았습니다.",
      503,
    );
  }
}
