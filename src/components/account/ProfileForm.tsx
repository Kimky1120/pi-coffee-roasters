"use client";

import { useState, type FormEvent } from "react";
import {
  BellRing,
  Check,
  ChevronDown,
  LockKeyhole,
  Pencil,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { AccountDeletion } from "@/components/account/AccountDeletion";

function formatBirth(value: string) {
  if (!value) return "미등록";
  const [year, month, day] = value.split("-");
  return `${year}. ${month}. ${day}.`;
}

function formatChangedAt(value: string) {
  if (!value) return "기록 없음";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "기록 없음";

  const koreaTime = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  const year = koreaTime.getUTCFullYear();
  const month = koreaTime.getUTCMonth() + 1;
  const day = koreaTime.getUTCDate();
  const hour24 = koreaTime.getUTCHours();
  const period = hour24 < 12 ? "오전" : "오후";
  const hour12 = hour24 % 12 || 12;
  const minute = String(koreaTime.getUTCMinutes()).padStart(2, "0");

  return `${year}. ${month}. ${day}. ${period} ${hour12}:${minute}`;
}

function ReadonlyField({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="grid gap-1.5 border-b border-border py-5 last:border-b-0 sm:grid-cols-[132px_minmax(0,1fr)] sm:gap-5">
      <span className="text-sm text-foreground/50">{label}</span>
      <div>
        <p className="break-all text-sm font-medium text-primary sm:text-base">
          {value || "미등록"}
        </p>
        {helper && (
          <p className="mt-1 text-xs leading-relaxed text-foreground/40">
            {helper}
          </p>
        )}
      </div>
    </div>
  );
}

function Feedback({
  type,
  children,
}: {
  type: "success" | "error";
  children: React.ReactNode;
}) {
  return (
    <p
      role={type === "error" ? "alert" : "status"}
      className={`rounded-sm border px-4 py-3 text-sm leading-relaxed ${
        type === "error"
          ? "border-red-900/15 bg-red-950/5 text-red-800"
          : "border-primary/15 bg-primary/5 text-primary"
      }`}
    >
      {children}
    </p>
  );
}

export function ProfileForm({
  email,
  name: initialName,
  nickname: initialNickname,
  phone: initialPhone,
  birth: initialBirth,
  hasEmailPassword,
  socialProvider,
  hasRecentSocialAuth,
  hasRecentEmailAuth,
  marketingAgree: initialMarketingAgree,
  marketingAgreeUpdatedAt: initialMarketingAgreeUpdatedAt,
}: {
  email: string;
  name: string;
  nickname: string;
  phone: string;
  birth: string;
  hasEmailPassword: boolean;
  socialProvider: "kakao" | "naver" | null;
  hasRecentSocialAuth: boolean;
  hasRecentEmailAuth: boolean;
  marketingAgree: boolean;
  marketingAgreeUpdatedAt: string;
}) {
  const [name, setName] = useState(initialName);
  const [nickname, setNickname] = useState(initialNickname);
  const [phone, setPhone] = useState(initialPhone);
  const birth = initialBirth;
  const [draftNickname, setDraftNickname] = useState(initialNickname);
  const [isEditing, setIsEditing] = useState(false);
  const [isIdentityOpen, setIsIdentityOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isMarketingOpen, setIsMarketingOpen] = useState(false);
  const [marketingAgree, setMarketingAgree] = useState(initialMarketingAgree);
  const [draftMarketingAgree, setDraftMarketingAgree] = useState(
    initialMarketingAgree,
  );
  const [marketingAgreeUpdatedAt, setMarketingAgreeUpdatedAt] = useState(
    initialMarketingAgreeUpdatedAt,
  );
  const [saving, setSaving] = useState(false);
  const [marketingSaving, setMarketingSaving] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [reauthEmailSent, setReauthEmailSent] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [identityFeedback, setIdentityFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [passwordFeedback, setPasswordFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [marketingFeedback, setMarketingFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextNickname = draftNickname.trim();

    if (nextNickname.length < 2 || nextNickname.length > 20) {
      setProfileFeedback({
        type: "error",
        message: "닉네임은 2자 이상 20자 이하로 입력해 주세요.",
      });
      return;
    }

    setSaving(true);
    setProfileFeedback(null);
    const response = await fetch("/api/account/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "nickname",
        nickname: nextNickname,
      }),
    });
    const result = (await response.json()) as { message?: string };

    setSaving(false);
    if (!response.ok) {
      setProfileFeedback({
        type: "error",
        message:
          result.message ??
          "닉네임을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      });
      return;
    }

    setNickname(nextNickname);
    setDraftNickname(nextNickname);
    setIsEditing(false);
    setProfileFeedback({ type: "success", message: "닉네임을 변경했습니다." });
  }

  async function handleIdentitySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextName = String(formData.get("name") ?? name).trim();
    const nextPhone = String(formData.get("phone") ?? phone).trim();
    const currentPassword = String(formData.get("current-password") ?? "");

    if (nextName.length < 2 || nextName.length > 30) {
      setIdentityFeedback({
        type: "error",
        message: "성명은 2자 이상 30자 이하로 입력해 주세요.",
      });
      return;
    }
    if (!/^010-\d{4}-\d{4}$/.test(nextPhone)) {
      setIdentityFeedback({
        type: "error",
        message: "휴대폰 번호를 010-0000-0000 형식으로 입력해 주세요.",
      });
      return;
    }

    setSaving(true);
    setIdentityFeedback(null);
    const response = await fetch("/api/account/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "identity",
        name: nextName,
        phone: nextPhone,
        currentPassword,
      }),
    });
    const result = (await response.json()) as { message?: string };

    setSaving(false);
    if (!response.ok) {
      setIdentityFeedback({
        type: "error",
        message:
          result.message ??
          "본인정보를 저장하지 못했습니다. 입력 내용을 다시 확인해 주세요.",
      });
      return;
    }

    setName(nextName);
    setPhone(nextPhone);
    setIsIdentityOpen(false);
    setIdentityFeedback({
      type: "success",
      message: "본인정보를 안전하게 변경했습니다.",
    });
  }

  async function handlePasswordResetRequest() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setPasswordFeedback({
        type: "error",
        message: "회원 서비스를 연결하는 중입니다. 잠시 후 다시 시도해 주세요.",
      });
      return;
    }

    setSaving(true);
    setPasswordFeedback(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/account/password-reset`,
    });
    setSaving(false);

    if (error) {
      setPasswordFeedback({
        type: "error",
        message: "재설정 메일을 보내지 못했습니다. 잠시 후 다시 시도해 주세요.",
      });
      return;
    }

    setResetEmailSent(true);
    setPasswordFeedback({
      type: "success",
      message: "이메일로 비밀번호 재설정 링크를 보냈습니다.",
    });
  }

  async function handleSocialReauthentication() {
    const provider = socialProvider ?? "kakao";
    const providerLabel = provider === "naver" ? "네이버" : "카카오";
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setIdentityFeedback({
        type: "error",
        message: "회원 서비스를 연결하는 중입니다. 잠시 후 다시 시도해 주세요.",
      });
      return;
    }

    setSaving(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider === "naver" ? "custom:naver" : "kakao",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/account?verified=${provider}`,
        ...(provider === "kakao"
          ? { queryParams: { prompt: "login" } }
          : {}),
      },
    });

    if (error) {
      setSaving(false);
      setIdentityFeedback({
        type: "error",
        message: `${providerLabel} 재인증을 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.`,
      });
    }
  }

  async function handleEmailReauthentication() {
    const supabase = getSupabaseBrowserClient();

    if (!supabase || !email) {
      setIdentityFeedback({
        type: "error",
        message: "등록 이메일을 확인할 수 없습니다. 소셜 계정 재인증을 이용해 주세요.",
      });
      return;
    }

    setSaving(true);
    setIdentityFeedback(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/account?verified=email`,
      },
    });
    setSaving(false);

    if (error) {
      setIdentityFeedback({
        type: "error",
        message: "인증 메일을 보내지 못했습니다. 잠시 후 다시 시도해 주세요.",
      });
      return;
    }

    setReauthEmailSent(true);
    setIdentityFeedback({
      type: "success",
      message: "등록 이메일로 1회용 인증 링크를 보냈습니다.",
    });
  }

  function renderReauthentication() {
    if (hasRecentEmailAuth) {
      return (
        <p className="rounded-sm bg-primary/5 px-4 py-3 text-xs text-primary">
          이메일 인증이 완료되었습니다. 5분 안에 저장해 주세요.
        </p>
      );
    }

    if (hasEmailPassword) {
      return (
        <div className="space-y-3">
          <label className="flex flex-col gap-2 text-sm text-foreground/65">
            현재 비밀번호 확인
            <input
              type="password"
              name="current-password"
              autoComplete="current-password"
              required
              placeholder="저장하려면 현재 비밀번호를 입력해 주세요"
              className="h-12 rounded-sm border border-border bg-background px-4 text-base text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-primary"
            />
          </label>
          <button
            type="button"
            onClick={handleEmailReauthentication}
            disabled={saving || reauthEmailSent}
            className="text-xs font-medium text-primary underline underline-offset-4 disabled:opacity-50"
          >
            {reauthEmailSent
              ? "인증 메일을 보냈습니다"
              : "비밀번호 대신 이메일로 인증하기"}
          </button>
        </div>
      );
    }

    if (email) {
      return (
        <button
          type="button"
          onClick={handleEmailReauthentication}
          disabled={saving || reauthEmailSent}
          className="h-11 w-fit rounded-full border border-primary/20 px-5 text-sm font-medium text-primary disabled:opacity-50"
        >
          {reauthEmailSent ? "인증 메일 전송 완료" : "등록 이메일로 인증"}
        </button>
      );
    }

    if (hasRecentSocialAuth) {
      return (
        <p className="rounded-sm bg-primary/5 px-4 py-3 text-xs text-primary">
          {socialProvider === "naver" ? "네이버" : "카카오"} 계정 재인증이
          완료되었습니다. 5분 안에 저장해 주세요.
        </p>
      );
    }

    return (
      <button
        type="button"
        onClick={handleSocialReauthentication}
        disabled={saving}
        className={`h-11 w-fit rounded-full px-5 text-sm font-medium disabled:opacity-50 ${
          socialProvider === "naver"
            ? "bg-[#03C75A] text-white"
            : "bg-[#FEE500] text-[#191919]"
        }`}
      >
        {socialProvider === "naver" ? "네이버" : "카카오"} 계정으로 다시 인증
      </button>
    );
  }

  async function handleMarketingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMarketingSaving(true);
    setMarketingFeedback(null);

    const response = await fetch("/api/account/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "marketing",
        marketingAgree: draftMarketingAgree,
      }),
    });
    const result = (await response.json()) as {
      message?: string;
      marketingAgreeUpdatedAt?: string | null;
    };
    setMarketingSaving(false);

    if (!response.ok) {
      setMarketingFeedback({
        type: "error",
        message:
          result.message ??
          "마케팅 수신 설정을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      });
      return;
    }

    setMarketingAgree(draftMarketingAgree);
    setMarketingAgreeUpdatedAt(
      result.marketingAgreeUpdatedAt ?? new Date().toISOString(),
    );
    setIsMarketingOpen(false);
    setMarketingFeedback({
      type: "success",
      message: draftMarketingAgree
        ? "마케팅 정보 수신 동의가 처리되었습니다."
        : "마케팅 정보 수신 동의 철회가 처리되었습니다.",
    });
  }

  return (
    <div className="grid gap-7 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
      <aside className="rounded-sm border border-border bg-surface p-6 lg:sticky lg:top-24">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-background">
          <UserRound className="h-6 w-6" aria-hidden />
        </div>
        <p className="mt-6 font-display text-2xl font-medium text-primary">
          {name ? `${name}님` : "회원님"}
        </p>
        <p className="mt-1 break-all text-sm text-foreground/50">{email}</p>

        <div className="mt-7 border-t border-border pt-5">
          {isEditing ? (
            <form onSubmit={handleProfileSubmit}>
              <label
                htmlFor="profile-nickname"
                className="text-xs text-foreground/50"
              >
                닉네임
              </label>
              <input
                id="profile-nickname"
                type="text"
                value={draftNickname}
                onChange={(event) => setDraftNickname(event.target.value)}
                minLength={2}
                maxLength={20}
                required
                autoComplete="nickname"
                placeholder="2~20자로 입력해 주세요"
                className="mt-2 h-11 w-full rounded-sm border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-primary"
              />
              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDraftNickname(nickname);
                    setIsEditing(false);
                    setProfileFeedback(null);
                  }}
                  className="inline-flex h-9 items-center gap-1 rounded-full border border-border px-3 text-xs text-foreground/60 transition-colors hover:border-primary/30 hover:text-primary"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                  취소
                </button>
                <button
                  type="submit"
                  disabled={saving || draftNickname.trim() === nickname}
                  className="inline-flex h-9 items-center gap-1 rounded-full bg-primary px-3 text-xs text-background transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Check className="h-3.5 w-3.5" aria-hidden />
                  {saving ? "저장 중..." : "저장"}
                </button>
              </div>
            </form>
          ) : (
            <div className="min-w-0">
              <span className="text-xs text-foreground/50">닉네임</span>
              <div className="mt-1 flex items-center gap-1">
                <p className="break-all text-lg font-medium text-primary">
                  {nickname || "미등록"}
                </p>
                <button
                  type="button"
                  aria-label="닉네임 변경"
                  title="닉네임 변경"
                  onClick={() => {
                    setDraftNickname(nickname);
                    setProfileFeedback(null);
                    setIsEditing(true);
                  }}
                  className="inline-flex h-6 w-6 shrink-0 items-center justify-center text-primary/55 transition-colors hover:text-primary"
                >
                  <Pencil className="h-2.5 w-2.5" aria-hidden />
                </button>
              </div>
            </div>
          )}
        </div>

        {profileFeedback && (
          <div className="mt-4">
            <Feedback type={profileFeedback.type}>
              {profileFeedback.message}
            </Feedback>
          </div>
        )}
      </aside>

      <div className="flex min-w-0 flex-col gap-6">

      <section className="rounded-sm border border-border bg-surface">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-5 sm:px-7">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-2xl font-medium text-primary">
                본인 정보
              </h2>
              <span className="rounded-full bg-primary/7 px-2.5 py-1 text-[10px] font-medium tracking-wide text-primary/65">
                본인확인 후 변경
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-foreground/45">
              주문 확인과 배송지 자동 입력에 필요한 정보입니다.
            </p>
          </div>
          {!isIdentityOpen && (
            <button
              type="button"
              onClick={() => {
                setIdentityFeedback(null);
                setIsIdentityOpen(true);
              }}
              className="inline-flex h-9 shrink-0 items-center rounded-full bg-primary px-4 text-xs font-medium text-background transition-colors hover:bg-primary/90"
            >
              {name && phone ? "정보 변경" : "필수 정보 등록"}
            </button>
          )}
        </div>

        {isIdentityOpen ? (
          <form onSubmit={handleIdentitySubmit} className="space-y-5 p-5 sm:p-7">
            <label className="flex flex-col gap-2 text-sm text-foreground/65">
              성명
              <input
                type="text"
                name="name"
                defaultValue={name}
                minLength={2}
                maxLength={30}
                required
                autoComplete="name"
                placeholder="실명을 입력해 주세요"
                className="h-12 rounded-sm border border-border bg-background px-4 text-base text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-primary"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-foreground/65">
              휴대폰 번호
              <input
                type="tel"
                name="phone"
                defaultValue={phone}
                required
                autoComplete="tel"
                inputMode="tel"
                pattern="010-[0-9]{4}-[0-9]{4}"
                placeholder="010-0000-0000"
                className="h-12 rounded-sm border border-border bg-background px-4 text-base text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-primary"
              />
            </label>
            {renderReauthentication()}
            <label className="flex cursor-pointer items-start gap-3 rounded-sm bg-primary/5 p-4 text-xs leading-relaxed text-foreground/65">
              <input
                type="checkbox"
                required
                className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
              />
              변경할 성명·휴대폰 번호가 정확한지 확인했습니다.
            </label>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsIdentityOpen(false)}
                className="h-11 rounded-full border border-border px-5 text-sm text-foreground/60 transition-colors hover:text-primary"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={
                  saving ||
                  (!hasEmailPassword &&
                    !hasRecentEmailAuth &&
                    !hasRecentSocialAuth)
                }
                className="h-11 rounded-full bg-primary px-5 text-sm text-background transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? "저장 중..." : "본인확인 후 저장"}
              </button>
            </div>
          </form>
        ) : (
          <div className="px-5 sm:px-7">
            <ReadonlyField label="성명" value={name} />
            <ReadonlyField label="휴대폰" value={phone} />
            <ReadonlyField label="생년월일" value={formatBirth(birth)} />
          </div>
        )}
        {identityFeedback && (
          <div className="px-5 pb-5 sm:px-7 sm:pb-7">
            <Feedback type={identityFeedback.type}>
              {identityFeedback.message}
            </Feedback>
          </div>
        )}
        <div className="flex items-start gap-3 border-t border-border bg-background/45 px-5 py-4 sm:px-7">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary/60" aria-hidden />
          <p className="text-xs leading-relaxed text-foreground/45">
            성명·휴대폰은 본인확인 후 변경할 수 있습니다. 생년월일은 가입 후
            변경할 수 없습니다.
          </p>
        </div>
      </section>

      <section className="rounded-sm border border-border bg-surface">
        <button
          type="button"
          onClick={() => {
            setPasswordFeedback(null);
            setIsPasswordOpen((open) => !open);
          }}
          className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-7"
          aria-expanded={isPasswordOpen}
        >
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/7 text-primary">
              <LockKeyhole className="h-4 w-4" aria-hidden />
            </span>
            <span>
              <span className="block font-display text-xl font-medium text-primary sm:text-2xl">
                비밀번호 변경
              </span>
              <span className="mt-0.5 block text-xs text-foreground/45">
                본인 이메일로 안전한 재설정 링크를 보내드립니다.
              </span>
            </span>
          </span>
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-primary/50 transition-transform ${
              isPasswordOpen ? "rotate-180" : ""
            }`}
            aria-hidden
          />
        </button>

        {isPasswordOpen && (
          <div className="border-t border-border p-5 sm:p-7">
            {hasEmailPassword ? (
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-primary">{email}</p>
                  <p className="mt-1 text-xs leading-relaxed text-foreground/45">
                    메일의 1회용 링크를 연 뒤 새 비밀번호를 설정할 수 있습니다.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handlePasswordResetRequest}
                  disabled={saving || resetEmailSent}
                  className="h-11 shrink-0 rounded-full bg-primary px-6 text-sm text-background transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {saving
                    ? "메일 전송 중..."
                    : resetEmailSent
                      ? "재설정 메일 전송 완료"
                      : "재설정 링크 받기"}
                </button>
              </div>
            ) : (
              <p className="rounded-sm bg-primary/5 px-4 py-4 text-sm leading-relaxed text-foreground/60">
                카카오 가입자의 비밀번호는 카카오에서 관리합니다. 비밀번호 변경은
                카카오 계정 설정에서 진행해 주세요.
              </p>
            )}
          </div>
        )}
        {passwordFeedback && (
          <div className="px-5 pb-5 sm:px-7 sm:pb-7">
            <Feedback type={passwordFeedback.type}>
              {passwordFeedback.message}
            </Feedback>
          </div>
        )}
      </section>

      <section className="rounded-sm border border-border bg-surface">
        <div className="flex flex-col gap-4 border-b border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/7 text-primary">
              <BellRing className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-xl font-medium text-primary sm:text-2xl">
                  마케팅 수신 설정
                </h2>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${
                    marketingAgree
                      ? "bg-primary/10 text-primary"
                      : "bg-foreground/5 text-foreground/45"
                  }`}
                >
                  {marketingAgree ? "수신 동의" : "수신 안 함"}
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-foreground/45">
                이메일·문자로 할인, 신상품 및 이벤트 소식을 받을지 설정합니다.
              </p>
            </div>
          </div>
          {!isMarketingOpen && (
            <button
              type="button"
              onClick={() => {
                setDraftMarketingAgree(marketingAgree);
                setMarketingFeedback(null);
                setIsMarketingOpen(true);
              }}
              className="h-9 w-fit shrink-0 rounded-full border border-primary/20 px-4 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-background"
            >
              설정 변경
            </button>
          )}
        </div>

        {isMarketingOpen ? (
          <form onSubmit={handleMarketingSubmit} className="p-5 sm:p-7">
            <div className="flex items-center justify-between gap-5 rounded-sm bg-background p-4 sm:p-5">
              <div>
                <p className="text-sm font-medium text-primary">
                  마케팅 정보 수신
                </p>
                <p className="mt-1 text-xs leading-relaxed text-foreground/45">
                  동의는 선택이며 언제든 다시 철회할 수 있습니다.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={draftMarketingAgree}
                aria-label="마케팅 정보 수신 동의"
                onClick={() => setDraftMarketingAgree((agree) => !agree)}
                className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                  draftMarketingAgree ? "bg-primary" : "bg-foreground/20"
                }`}
              >
                <span
                  className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                    draftMarketingAgree ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-foreground/45">
              수신 동의를 철회하면 이후 광고성 정보는 발송하지 않습니다. 주문,
              결제, 배송 등 서비스 이용에 필요한 안내는 계속 제공될 수 있습니다.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setDraftMarketingAgree(marketingAgree);
                  setMarketingFeedback(null);
                  setIsMarketingOpen(false);
                }}
                className="h-11 rounded-full border border-border px-5 text-sm text-foreground/60 transition-colors hover:text-primary"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={
                  marketingSaving || draftMarketingAgree === marketingAgree
                }
                className="h-11 rounded-full bg-primary px-5 text-sm text-background transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {marketingSaving ? "처리 중..." : "설정 저장"}
              </button>
            </div>
          </form>
        ) : (
          <div className="px-5 py-4 text-xs text-foreground/45 sm:px-7">
            마지막 변경: {formatChangedAt(marketingAgreeUpdatedAt)}
          </div>
        )}

        {marketingFeedback && (
          <div className="px-5 pb-5 sm:px-7 sm:pb-7">
            <Feedback type={marketingFeedback.type}>
              {marketingFeedback.message}
            </Feedback>
          </div>
        )}
      </section>

      <AccountDeletion
        hasEmailPassword={hasEmailPassword}
        socialProvider={socialProvider}
        hasRecentSocialAuth={hasRecentSocialAuth}
      />
      </div>
    </div>
  );
}
