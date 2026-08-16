import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncSocialProfile } from "@/lib/auth/social-profile";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const requestedNext = searchParams.get("next") ?? "/";
  const next = requestedNext.startsWith("/") ? requestedNext : "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      let destination = next;

      if (data.user) {
        try {
          const socialProfile = await syncSocialProfile({
            user: data.user,
            providerToken: data.session?.provider_token,
          });

          if (next === "/" && socialProfile.needsOnboarding) {
            destination = "/account/onboarding";
          }
        } catch {
          // 프로필 자동 입력이 실패해도 로그인은 정상 완료한다.
        }
      }

      const response = NextResponse.redirect(`${origin}${destination}`);

      if (
        next === "/account?verified=kakao" ||
        next === "/account?verified=naver"
      ) {
        const socialProvider = next.endsWith("naver") ? "naver" : "kakao";
        const identityProvider =
          socialProvider === "naver" ? "custom:naver" : "kakao";
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const hasSocialIdentity = user?.identities?.some(
          (identity) => identity.provider === identityProvider,
        );

        if (hasSocialIdentity) {
          response.cookies.set("pi_account_reauth", socialProvider, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 5 * 60,
            path: "/",
          });
        }
      }

      if (next === "/account?verified=email") {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user?.email) {
          response.cookies.set("pi_account_reauth", "email", {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 5 * 60,
            path: "/",
          });
        }
      }

      if (next === "/account/password-reset") {
        response.cookies.set("pi_password_recovery", "verified", {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: 10 * 60,
          path: "/",
        });
      }

      return response;
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth-callback`);
}
