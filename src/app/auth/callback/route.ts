import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const requestedNext = searchParams.get("next") ?? "/";
  const next = requestedNext.startsWith("/") ? requestedNext : "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const response = NextResponse.redirect(`${origin}${next}`);

      if (next === "/account?verified=kakao") {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const hasKakaoIdentity = user?.identities?.some(
          (identity) => identity.provider === "kakao",
        );

        if (hasKakaoIdentity) {
          response.cookies.set("pi_account_reauth", "kakao", {
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
