"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthMode = "login" | "signup";
type SocialProvider = "kakao" | "naver";

const SAVED_EMAIL_KEY = "pi-coffee-saved-login-email";

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
  if (message.toLowerCase().includes("provider")) {
    return "간편 로그인 설정을 확인하고 있습니다. 잠시 후 다시 시도해 주세요.";
  }
  if (message.toLowerCase().includes("password")) {
    return "비밀번호는 8자 이상 입력해 주세요.";
  }
  return "잠시 후 다시 시도해 주세요.";
}

function formatBirthInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

function formatPhoneInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function isValidBirth(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));
  const today = new Date();

  return (
    year >= 1900 &&
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day &&
    date.getTime() <=
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  );
}

function KakaoSymbol() {
  return (
    <svg
      viewBox="0 0 28 28"
      className="h-6 w-6"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M14 4C7.9 4 3 7.9 3 12.7c0 3 2 5.7 5 7.2l-1.1 4 4.7-3.1c.8.2 1.6.3 2.4.3 6.1 0 11-3.8 11-8.5S20.1 4 14 4Z"
      />
    </svg>
  );
}

function NaverSymbol() {
  return (
    <span
      className="font-sans text-[19px] font-black leading-none tracking-[-0.08em]"
      aria-hidden="true"
    >
      N
    </span>
  );
}

export function AuthForm({
  mode,
  initialError,
}: {
  mode: AuthMode;
  initialError?: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(initialError ?? null);
  const [isError, setIsError] = useState(Boolean(initialError));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState<SocialProvider | null>(
    null,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const rememberEmailRef = useRef<HTMLInputElement>(null);
  const isLogin = mode === "login";

  useEffect(() => {
    if (!isLogin) return;

    const savedEmail = window.localStorage.getItem(SAVED_EMAIL_KEY);
    if (savedEmail && emailInputRef.current && rememberEmailRef.current) {
      emailInputRef.current.value = savedEmail;
      rememberEmailRef.current.checked = true;
    }
  }, [isLogin]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setIsError(false);

    const formData = new FormData(event.currentTarget);
    const submittedEmail = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const passwordConfirm = String(formData.get("password-confirm") ?? "");
    const name = String(formData.get("name") ?? "").trim();
    const nickname = String(formData.get("nickname") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const birth = String(formData.get("birth") ?? "");
    const marketingAgree = formData.get("marketing_agree") === "on";
    const shouldRememberEmail = formData.get("remember-email") === "on";

    if (!isLogin && password !== passwordConfirm) {
      setIsError(true);
      setMessage("비밀번호가 서로 일치하지 않습니다.");
      return;
    }

    if (!isLogin && birth && !isValidBirth(birth)) {
      setIsError(true);
      setMessage("생년월일 숫자 8자리를 정확히 입력해 주세요.");
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
          email: submittedEmail,
          password,
        });

        if (error) {
          setIsError(true);
          setMessage(getAuthErrorMessage(error.message));
          return;
        }

        if (shouldRememberEmail) {
          window.localStorage.setItem(SAVED_EMAIL_KEY, submittedEmail);
        } else {
          window.localStorage.removeItem(SAVED_EMAIL_KEY);
        }

        router.replace("/");
        router.refresh();
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: submittedEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/`,
          data: {
            name,
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

  async function handleSocialLogin(provider: SocialProvider) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setIsError(true);
      setMessage("회원 서비스를 연결하는 중입니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    setMessage(null);
    setIsError(false);
    setSocialLoading(provider);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider === "kakao" ? "kakao" : "custom:naver",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/`,
        ...(provider === "kakao"
          ? { scopes: "profile_nickname profile_image" }
          : {}),
      },
    });

    if (error) {
      setIsError(true);
      setMessage(
        provider === "naver"
          ? "네이버 간편 로그인을 연결하지 못했습니다. 설정을 확인한 뒤 다시 시도해 주세요."
          : getAuthErrorMessage(error.message),
      );
      setSocialLoading(null);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <span className="font-sans text-xs tracking-[0.2em] text-primary/55">
          {isLogin ? "MEMBER LOGIN" : "JOIN PI COFFEE"}
        </span>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-primary sm:text-5xl">
          {isLogin ? "로그인" : "회원가입"}
        </h1>
      </div>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2 text-sm text-foreground/70">
          이메일
          <input
            type="email"
            name="email"
            ref={emailInputRef}
            autoComplete="email"
            required
            placeholder="example@email.com"
            className="h-12 rounded-sm border border-border bg-background px-4 text-base text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-primary"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-foreground/70">
          비밀번호
          <span className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              minLength={8}
              required
              placeholder="8자 이상 입력해 주세요"
              className="h-12 w-full rounded-sm border border-border bg-background px-4 pr-12 text-base text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
              aria-pressed={showPassword}
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-foreground/45 transition-colors hover:text-primary"
            >
              {showPassword ? (
                <EyeOff className="h-4.5 w-4.5" aria-hidden />
              ) : (
                <Eye className="h-4.5 w-4.5" aria-hidden />
              )}
            </button>
          </span>
        </label>

        {isLogin && (
          <div className="-mt-1 flex items-center justify-between gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-foreground/60">
              <input
                type="checkbox"
                name="remember-email"
                ref={rememberEmailRef}
                onChange={(event) => {
                  if (!event.target.checked) {
                    window.localStorage.removeItem(SAVED_EMAIL_KEY);
                  }
                }}
                className="h-4 w-4 rounded border-border accent-primary"
              />
              이메일 저장
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-foreground/60 underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              비밀번호 찾기
            </Link>
          </div>
        )}

        {!isLogin && (
          <>
            <label className="flex flex-col gap-2 text-sm text-foreground/70">
              비밀번호 확인
              <span className="relative">
                <input
                  type={showPasswordConfirm ? "text" : "password"}
                  name="password-confirm"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  placeholder="비밀번호를 한 번 더 입력해 주세요"
                  className="h-12 w-full rounded-sm border border-border bg-background px-4 pr-12 text-base text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm((value) => !value)}
                  aria-label={
                    showPasswordConfirm
                      ? "비밀번호 확인 숨기기"
                      : "비밀번호 확인 보기"
                  }
                  aria-pressed={showPasswordConfirm}
                  className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-foreground/45 transition-colors hover:text-primary"
                >
                  {showPasswordConfirm ? (
                    <EyeOff className="h-4.5 w-4.5" aria-hidden />
                  ) : (
                    <Eye className="h-4.5 w-4.5" aria-hidden />
                  )}
                </button>
              </span>
            </label>

            <label className="flex flex-col gap-2 text-sm text-foreground/70">
              성명
              <input
                type="text"
                name="name"
                autoComplete="name"
                minLength={2}
                maxLength={30}
                required
                placeholder="주문자 실명을 입력해 주세요"
                className="h-12 rounded-sm border border-border bg-background px-4 text-base text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-primary"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-foreground/70">
              닉네임
              <input
                type="text"
                name="nickname"
                autoComplete="nickname"
                minLength={2}
                maxLength={20}
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
                inputMode="numeric"
                maxLength={13}
                pattern="010-[0-9]{4}-[0-9]{4}"
                required
                placeholder="예: 01012345678"
                onInput={(event) => {
                  event.currentTarget.value = formatPhoneInput(
                    event.currentTarget.value,
                  );
                }}
                className="h-12 rounded-sm border border-border bg-background px-4 text-base text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-primary"
              />
              <span className="text-xs leading-relaxed text-foreground/40">
                ‘-’ 없이 숫자만 입력해 주세요.
              </span>
            </label>

            <label className="flex flex-col gap-2 text-sm text-foreground/70">
              생년월일 <span className="text-xs text-foreground/40">(선택)</span>
              <input
                type="text"
                name="birth"
                autoComplete="bday"
                inputMode="numeric"
                maxLength={10}
                pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
                placeholder="예: 19950816"
                onInput={(event) => {
                  event.currentTarget.value = formatBirthInput(
                    event.currentTarget.value,
                  );
                }}
                className="h-12 rounded-sm border border-border bg-background px-4 text-base text-foreground outline-none transition-colors focus:border-primary"
              />
              <span className="text-xs leading-relaxed text-foreground/40">
                ‘-’ 없이 숫자 8자리만 입력해 주세요.
              </span>
            </label>

            <div className="flex items-start gap-3 rounded-sm bg-primary/5 px-4 py-3.5">
              <ShieldCheck
                className="mt-0.5 h-4 w-4 shrink-0 text-primary/55"
                aria-hidden
              />
              <p className="text-xs leading-relaxed text-foreground/50">
                성명·휴대폰은 본인확인 후 변경할 수 있습니다. 생년월일은 가입 후
                변경할 수 없습니다.
              </p>
            </div>

            <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-foreground/65">
              <input
                type="checkbox"
                name="marketing_agree"
                className="mt-1 h-4 w-4 accent-primary"
              />
              이메일·문자로 할인, 신상품 등 마케팅 정보를 받는 데 동의합니다.
              (선택)
            </label>

            <div className="flex items-start gap-3 text-sm leading-relaxed text-foreground/65">
              <input
                id="required-policy-agree"
                type="checkbox"
                required
                className="mt-1 h-4 w-4 accent-primary"
              />
              <label htmlFor="required-policy-agree" className="cursor-pointer">
                <Link
                  href="/terms"
                  target="_blank"
                  className="font-medium text-primary underline underline-offset-4"
                >
                  이용약관
                </Link>{" "}
                및{" "}
                <Link
                  href="/privacy"
                  target="_blank"
                  className="font-medium text-primary underline underline-offset-4"
                >
                  개인정보 처리방침
                </Link>
                에 동의합니다.
              </label>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 h-12 rounded-full bg-primary px-6 text-sm tracking-wide text-background transition-colors hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60"
        >
          {isSubmitting
            ? "처리 중..."
            : isLogin
              ? "이메일 로그인"
              : "이메일로 가입하기"}
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

      {isLogin && (
        <>
          <div className="my-8 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs tracking-[0.12em] text-foreground/40">
              간편 로그인/회원가입
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <section aria-label="간편 로그인 및 회원가입">
            <div className="grid gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin("kakao")}
                disabled={socialLoading !== null}
                className="relative flex h-13 items-center justify-center rounded-xl bg-[#FEE500] px-14 text-[15px] font-medium text-[#191919] transition-[filter,transform] hover:brightness-[0.98] active:translate-y-px disabled:cursor-wait disabled:opacity-60"
              >
                <span className="absolute left-5 flex items-center justify-center">
                  <KakaoSymbol />
                </span>
                {socialLoading === "kakao"
                  ? "카카오 연결 중..."
                  : "카카오 1초 로그인/회원가입"}
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin("naver")}
                disabled={socialLoading !== null}
                className="relative flex h-13 items-center justify-center rounded-xl bg-[#03C75A] px-14 text-[15px] font-medium text-white transition-[filter,transform] hover:brightness-[0.97] active:translate-y-px disabled:cursor-wait disabled:opacity-60"
              >
                <span className="absolute left-5 flex h-6 w-6 items-center justify-center">
                  <NaverSymbol />
                </span>
                {socialLoading === "naver"
                  ? "네이버 연결 중..."
                  : "네이버 간편 로그인/회원가입"}
              </button>
            </div>
          </section>
        </>
      )}

      <div className="mt-8 text-center text-sm text-foreground/60">
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
