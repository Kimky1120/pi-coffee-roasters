"use client";

import { useState, type FormEvent } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function AccountDeletion({
  hasEmailPassword,
  hasRecentKakaoAuth,
}: {
  hasEmailPassword: boolean;
  hasRecentKakaoAuth: boolean;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleKakaoReauthentication() {
    setErrorMessage(null);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setErrorMessage("회원 서비스를 연결하는 중입니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/account?verified=kakao`,
        queryParams: { prompt: "login" },
      },
    });

    if (error) {
      setSubmitting(false);
      setErrorMessage("카카오 계정 인증을 시작하지 못했습니다. 다시 시도해 주세요.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const confirmText = String(formData.get("confirm-text") ?? "").trim();
    const currentPassword = String(formData.get("current-password") ?? "");

    if (confirmText !== "회원탈퇴") {
      setErrorMessage("확인 문구에 ‘회원탈퇴’를 정확히 입력해 주세요.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setErrorMessage("회원 서비스를 연결하는 중입니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    setSubmitting(true);

    const response = await fetch("/api/account/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmText, currentPassword }),
    });

    const result = (await response.json()) as { message?: string };
    if (!response.ok) {
      setSubmitting(false);
      setErrorMessage(
        result.message ?? "회원탈퇴를 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      );
      return;
    }

    await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
    router.replace("/");
    router.refresh();
  }

  return (
    <section className="rounded-sm border border-red-900/10 bg-surface">
      <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div>
          <h2 className="font-display text-xl font-medium text-primary sm:text-2xl">
            회원탈퇴
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-foreground/45">
            탈퇴 후 계정과 회원정보는 복구할 수 없습니다.
          </p>
        </div>
        {!isOpen && (hasEmailPassword || hasRecentKakaoAuth) && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex h-10 w-fit items-center gap-2 rounded-full border border-red-900/20 px-4 text-xs font-medium text-red-800 transition-colors hover:bg-red-900 hover:text-white"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
            탈퇴하기
          </button>
        )}
        {!isOpen && !hasEmailPassword && !hasRecentKakaoAuth && (
          <button
            type="button"
            onClick={handleKakaoReauthentication}
            disabled={submitting}
            className="inline-flex h-10 w-fit items-center gap-2 rounded-full border border-red-900/20 px-4 text-xs font-medium text-red-800 transition-colors hover:bg-red-900 hover:text-white disabled:opacity-50"
          >
            {submitting ? "카카오 인증 중..." : "카카오 인증 후 탈퇴"}
          </button>
        )}
      </div>

      {!isOpen && errorMessage && (
        <p role="alert" className="px-5 pb-5 text-sm text-red-700 sm:px-7">
          {errorMessage}
        </p>
      )}

      {isOpen && (
        <form onSubmit={handleSubmit} className="border-t border-border p-5 sm:p-7">
          <div className="flex items-start gap-3 rounded-sm bg-red-950/5 p-4">
            <AlertTriangle
              className="mt-0.5 h-4 w-4 shrink-0 text-red-800"
              aria-hidden
            />
            <div className="text-xs leading-6 text-foreground/60">
              <p>닉네임, 성명, 휴대폰 등 회원 프로필은 삭제됩니다.</p>
              <p>
                주문·결제·배송 및 분쟁 처리 기록은 관계 법령에 따라 회원정보와
                분리하여 정해진 기간 동안 보관됩니다.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {hasEmailPassword ? (
              <label className="flex flex-col gap-2 text-sm text-foreground/65">
                현재 비밀번호
                <input
                  type="password"
                  name="current-password"
                  autoComplete="current-password"
                  required
                  className="h-12 rounded-sm border border-border bg-background px-4 text-base text-foreground outline-none transition-colors focus:border-red-800"
                />
              </label>
            ) : (
              <p className="rounded-sm bg-primary/5 px-4 py-3 text-xs leading-relaxed text-foreground/55">
                방금 다시 인증한 카카오 계정의 회원정보가 삭제됩니다.
              </p>
            )}

            <label className="flex flex-col gap-2 text-sm text-foreground/65">
              확인을 위해 <strong className="font-medium text-red-800">회원탈퇴</strong>를
              입력해 주세요.
              <input
                type="text"
                name="confirm-text"
                required
                autoComplete="off"
                placeholder="회원탈퇴"
                className="h-12 rounded-sm border border-border bg-background px-4 text-base text-foreground outline-none transition-colors placeholder:text-foreground/25 focus:border-red-800"
              />
            </label>

            <label className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-foreground/60">
              <input
                type="checkbox"
                required
                className="mt-0.5 h-4 w-4 shrink-0 accent-red-800"
              />
              탈퇴 후 계정과 회원 프로필을 복구할 수 없음을 확인했습니다.
            </label>
          </div>

          {errorMessage && (
            <p role="alert" className="mt-4 text-sm text-red-700">
              {errorMessage}
            </p>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setErrorMessage(null);
              }}
              className="inline-flex h-11 items-center gap-1.5 rounded-full border border-border px-5 text-sm text-foreground/60 transition-colors hover:text-primary"
            >
              <X className="h-4 w-4" aria-hidden />
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-11 rounded-full bg-red-800 px-5 text-sm text-white transition-colors hover:bg-red-900 disabled:opacity-50"
            >
              {submitting ? "처리 중..." : "회원탈퇴 확인"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
