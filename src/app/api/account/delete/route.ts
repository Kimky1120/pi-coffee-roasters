import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { message: "로그인이 필요합니다." },
      { status: 401 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    confirmText?: string;
    currentPassword?: string;
  } | null;

  if (body?.confirmText !== "회원탈퇴") {
    return NextResponse.json(
      { message: "회원탈퇴 확인 문구가 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const hasEmailPassword =
    user.identities?.some((identity) => identity.provider === "email") ??
    user.app_metadata.provider === "email";

  if (hasEmailPassword) {
    if (!user.email || !body.currentPassword) {
      return NextResponse.json(
        { message: "현재 비밀번호를 입력해 주세요." },
        { status: 400 },
      );
    }

    const { error: passwordError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: body.currentPassword,
    });

    if (passwordError) {
      return NextResponse.json(
        { message: "현재 비밀번호가 올바르지 않습니다." },
        { status: 403 },
      );
    }
  } else {
    const hasKakaoIdentity = user.identities?.some(
      (identity) => identity.provider === "kakao",
    );
    const cookieStore = await cookies();
    const hasRecentKakaoAuth =
      cookieStore.get("pi_account_reauth")?.value === "kakao";

    if (!hasKakaoIdentity || !hasRecentKakaoAuth) {
      return NextResponse.json(
        { message: "회원탈퇴 전 카카오 계정으로 다시 인증해 주세요." },
        { status: 403 },
      );
    }
  }

  try {
    const admin = getSupabaseAdminClient();
    const { error } = await admin.auth.admin.deleteUser(user.id);

    if (error) {
      return NextResponse.json(
        { message: "회원탈퇴를 처리하지 못했습니다. 잠시 후 다시 시도해 주세요." },
        { status: 500 },
      );
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete("pi_account_reauth");
    return response;
  } catch {
    return NextResponse.json(
      { message: "회원탈퇴 기능의 서버 설정이 아직 완료되지 않았습니다." },
      { status: 503 },
    );
  }
}
