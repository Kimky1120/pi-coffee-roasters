"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthMode = "login" | "signup";

const KAKAO_LOGIN_ENABLED = false;

function getAuthErrorMessage(message: string): string {
  if (message.includes("Invalid login credentials")) {
    return "이메일 또는 비밀번호를 다시 확인해 주세요.";
  }
  if (message.includes("Email not confirmed")) {
    return "이메일 인증을 완료한 뒤 로그인해 주세요.";
  }
  if (message.includes("User already registered")) {
    return "이미 가입된 이메일입니다. 로그인해 주세요.";
  }
  if (message.toLowerCase().includes("password")) {
    return "비밀번호는 8자 이상 입력해 주세요.";
  }
  return "잠시 후 다시 시도해 주세요.";
}

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isKakaoLoading, setIsKakaoLoading] = useState(false);
  const isLogin = mode === "login";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setIsError(false);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const passwordConfirm = String(formData.get("password-confirm") ?? "");
    const nickname = String(formData.get("nickname") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const birth = String(formData.get("birth") ?? "");
    const marketingAgree = formData.get("marketing_agree") === "on";

    if (!isLogin && password !== passwordConfirm) {
      setIsError(true);
      setMessage("비밀번호가 서로 일치하지 않습니다.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setIsError(true);
      setMessage("회원 서비스를 연결하는 중입니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setIsError(true);
          setMessage(getAuthErrorMessage(error.message));
          return;
        }

        router.replace("/");
        router.refresh();
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/`,
          data: {
            phone,
            nickname,
            birth: birth || null,
            marketing_agree: marketingAgree,
          },
        },
      });

      if (error) {
        setIsError(true);
        setMessage(getAuthErrorMessage(error.message));
        return;
      }

      router.replace(
        data.session ? "/?auth=signup-complete" : "/?auth=check-email",
      );
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleKakaoLogin() {
    if (!KAKAO_LOGIN_ENABLED) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setIsError(true);
      setMessage("회원 서비스를 연결하는 중입니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    setMessage(null);
    setIsError(false);
    setIsKakaoLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/`,
        scopes: "profile_nickname profile_image",
      },
    });

    if (error) {
      setIsError(true);
      setMessage(getAuthErrorMessage(error.message));
      setIsKakaoLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-10 text-center">
        <span className="font-sans text-xs tracking-[0.2em] text-primary/55">
          {isLogin ? "MEMBER LOGIN" : "JOIN PI COFFEE"}
        </span>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-primary sm:text-5xl">
          {isLogin ? "로그인" : "회원가입"}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-foreground/60">
          {isLogin
            ? "가입한 이메일과 비밀번호로 로그인해 주세요."
            : "회원이 되어 PI Coffee의 새로운 소식을 받아보세요."}
        </p>
      </div>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
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
          className="mt-2 h-12 rounded-full bg-primary px-6 text-sm tracking-wide text-background transition-colors hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60"
        >
          {isSubmitting ? "처리 중..." : isLogin ? "로그인" : "가입하기"}
        </button>

        {message && (
          <p
            role={isError ? "alert" : "status"}
            className={`rounded-sm border px-4 py-3 text-sm leading-relaxed ${
              isError
                ? "border-red-900/20 bg-red-950/5 text-red-900"
                : "border-primary/15 bg-primary/5 text-primary"
            }`}
          >
            {message}
          </p>
        )}
      </form>

      <div className="mt-8">
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs tracking-[0.15em] text-foreground/40">
            간편 로그인
          </span>
          <span className="h-px flex-1 bg-border" />
        </div>
        <div className="mt-5 grid gap-3">
          <button
            type="button"
            onClick={handleKakaoLogin}
            disabled={!KAKAO_LOGIN_ENABLED || isKakaoLoading}
            className="h-12 rounded-full bg-[#FEE500] px-6 text-sm font-medium text-[#191919] opacity-60"
          >
            {isKakaoLoading
              ? "카카오 로그인 연결 중..."
              : "카카오로 시작하기 · 준비 중"}
          </button>
          <button
            type="button"
            disabled
            className="h-12 rounded-full bg-[#03C75A] px-6 text-sm font-medium text-white opacity-60"
          >
            네이버로 시작하기 · 준비 중
          </button>
        </div>
        <p className="mt-3 text-center text-xs leading-relaxed text-foreground/45">
          간편 로그인은 서비스 승인 후 순차적으로 제공됩니다.
        </p>
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
