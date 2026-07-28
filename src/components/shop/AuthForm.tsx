"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PreparationNotice } from "./PreparationNotice";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "signup";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSignupLoading, setIsSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [isKakaoLoading, setIsKakaoLoading] = useState(false);
  const [kakaoError, setKakaoError] = useState<string | null>(null);
  const isLogin = mode === "login";

  async function handleLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    setIsLoginLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoginError(error.message);
      setIsLoginLoading(false);
      return;
    }

    router.push("/account");
    router.refresh();
  }

  async function handleSignupSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSignupError(null);
    setSignupSuccess(false);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const passwordConfirm = String(formData.get("password-confirm") ?? "");
    const nickname = String(formData.get("nickname") ?? "");
    const phone = String(formData.get("phone") ?? "");
    const birth = String(formData.get("birth") ?? "");
    const marketingAgree = formData.get("marketing_agree") === "on";

    if (password !== passwordConfirm) {
      setSignupError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsSignupLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          phone,
          nickname,
          birth: birth || null,
          marketing_agree: marketingAgree,
        },
      },
    });

    if (error) {
      setSignupError(error.message);
      setIsSignupLoading(false);
      return;
    }

    setIsSignupLoading(false);

    if (data.session) {
      router.push("/account");
      router.refresh();
      return;
    }

    setSignupSuccess(true);
    form.reset();
  }

  async function handleKakaoLogin() {
    setKakaoError(null);
    setIsKakaoLoading(true);

    const supabase = createClient();
    const oauthRequest = {
      provider: "kakao" as const,
      options: {
        redirectTo: "https://www.pi-coffeeroasters.com/auth/callback",
        scopes: "profile_nickname profile_image",
      },
    };
    // TEMP DEBUG: remove after account_email scope investigation is resolved
    console.log("[kakao-oauth-debug] signInWithOAuth request:", oauthRequest);

    const { data, error } = await supabase.auth.signInWithOAuth(oauthRequest);

    // TEMP DEBUG: remove after account_email scope investigation is resolved
    console.log("[kakao-oauth-debug] signInWithOAuth response:", {
      data,
      error,
    });

    if (error) {
      setKakaoError(error.message);
      setIsKakaoLoading(false);
    }
  }

  const isSubmitting = isLogin ? isLoginLoading : isSignupLoading;
  const submitLabel = isLogin
    ? isLoginLoading
      ? "로그인 중..."
      : "로그인"
    : isSignupLoading
      ? "가입 중..."
      : "가입하기";

  return (
    <div className="w-full max-w-md">
      <div className="mb-10 text-center">
        <span className="font-sans text-xs tracking-[0.2em] text-primary/55">
          {isLogin ? "MEMBER LOGIN" : "JOIN PI COFFEE"}
        </span>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-primary sm:text-5xl">
          {isLogin ? "로그인" : "회원가입"}
        </h1>
      </div>

      <form
        className="flex flex-col gap-5"
        onSubmit={isLogin ? handleLoginSubmit : handleSignupSubmit}
      >
        <label className="flex flex-col gap-2 text-sm text-foreground/70">
          이메일
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            placeholder="example@email.com"
            className="h-12 rounded-sm border border-border bg-background px-4 text-base text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-primary"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-foreground/70">
          비밀번호
          <input
            type="password"
            name="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            minLength={8}
            required
            placeholder="8자 이상 입력해 주세요"
            className="h-12 rounded-sm border border-border bg-background px-4 text-base text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-primary"
          />
        </label>

        {!isLogin && (
          <>
            <label className="flex flex-col gap-2 text-sm text-foreground/70">
              비밀번호 확인
              <input
                type="password"
                name="password-confirm"
                autoComplete="new-password"
                minLength={8}
                required
                placeholder="비밀번호를 한 번 더 입력해 주세요"
                className="h-12 rounded-sm border border-border bg-background px-4 text-base text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-primary"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-foreground/70">
              닉네임
              <input
                type="text"
                name="nickname"
                autoComplete="nickname"
                required
                placeholder="사용하실 닉네임을 입력해 주세요"
                className="h-12 rounded-sm border border-border bg-background px-4 text-base text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-primary"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-foreground/70">
              휴대폰 번호
              <input
                type="tel"
                name="phone"
                autoComplete="tel"
                required
                placeholder="010-0000-0000"
                className="h-12 rounded-sm border border-border bg-background px-4 text-base text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-primary"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-foreground/70">
              생년월일
              <input
                type="date"
                name="birth"
                autoComplete="bday"
                className="h-12 rounded-sm border border-border bg-background px-4 text-base text-foreground outline-none transition-colors focus:border-primary"
              />
            </label>

            <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-foreground/65">
              <input
                type="checkbox"
                name="marketing_agree"
                className="mt-1 h-4 w-4 accent-primary"
              />
              마케팅 정보 수신에 동의합니다. (선택)
            </label>

            <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-foreground/65">
              <input
                type="checkbox"
                required
                className="mt-1 h-4 w-4 accent-primary"
              />
              이용약관 및 개인정보 처리방침에 동의합니다.
            </label>
          </>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 h-12 rounded-full bg-primary px-6 text-sm tracking-wide text-background transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {submitLabel}
        </button>

        {isLogin && loginError && (
          <p className="text-center text-xs text-red-600">{loginError}</p>
        )}

        {!isLogin && signupError && (
          <p className="text-center text-xs text-red-600">{signupError}</p>
        )}

        {!isLogin && signupSuccess && (
          <PreparationNotice>
            가입 확인 이메일을 보내드렸습니다. 메일함에서 인증 링크를
            확인해 주세요.
          </PreparationNotice>
        )}
      </form>

      <div className="mt-8 flex items-center gap-4 text-xs text-foreground/40">
        <span className="h-px flex-1 bg-border" />
        또는
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={handleKakaoLogin}
          disabled={isKakaoLoading}
          className="h-12 w-full rounded-full border border-border text-sm tracking-wide text-foreground transition-colors hover:border-primary disabled:opacity-50"
        >
          {isKakaoLoading ? "카카오 로그인 연결 중..." : "카카오로 로그인 (테스트)"}
        </button>
        {kakaoError && (
          <p className="mt-3 text-center text-xs text-red-600">
            {kakaoError}
          </p>
        )}
      </div>

      <div className="mt-8 border-t border-border pt-6 text-center text-sm text-foreground/60">
        {isLogin ? "아직 회원이 아니신가요?" : "이미 회원이신가요?"}{" "}
        <Link
          href={isLogin ? "/signup" : "/login"}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {isLogin ? "회원가입" : "로그인"}
        </Link>
      </div>
    </div>
  );
}
