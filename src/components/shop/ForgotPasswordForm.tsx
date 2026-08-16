"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setMessage("회원 서비스를 연결하는 중입니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/account/password-reset`,
    });
    setSubmitting(false);

    if (error) {
      setMessage("메일을 보내지 못했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/5 text-primary">
          <MailCheck className="h-7 w-7" strokeWidth={1.5} aria-hidden />
        </div>
        <h1 className="mt-6 font-display text-4xl font-medium text-primary">
          이메일을 확인해 주세요
        </h1>
        <p className="mt-4 text-sm leading-7 text-foreground/60">
          가입한 이메일로 비밀번호 재설정 링크를 보냈습니다.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-full border border-primary px-8 text-sm text-primary transition-colors hover:bg-primary hover:text-background"
        >
          로그인으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center">
        <span className="text-xs tracking-[0.18em] text-primary/50">
          PASSWORD RESET
        </span>
        <h1 className="mt-3 font-display text-4xl font-medium text-primary">
          비밀번호 찾기
        </h1>
        <p className="mt-4 text-sm leading-7 text-foreground/60">
          가입한 이메일로 재설정 링크를 보내드려요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
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

        <button
          type="submit"
          disabled={submitting}
          className="h-12 rounded-full bg-primary px-6 text-sm text-background transition-colors hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60"
        >
          {submitting ? "전송 중..." : "재설정 링크 받기"}
        </button>

        {message && (
          <p role="alert" className="text-center text-sm text-red-800">
            {message}
          </p>
        )}
      </form>

      <div className="mt-8 text-center">
        <Link
          href="/login"
          className="text-sm text-foreground/60 underline-offset-4 hover:text-primary hover:underline"
        >
          로그인으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
