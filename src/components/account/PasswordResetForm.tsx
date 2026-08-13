"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function PasswordResetForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const passwordConfirm = String(formData.get("password-confirm") ?? "");

    if (password.length < 8) {
      setMessage("새 비밀번호는 8자 이상 입력해 주세요.");
      return;
    }
    if (password !== passwordConfirm) {
      setMessage("새 비밀번호가 서로 일치하지 않습니다.");
      return;
    }

    setSubmitting(true);
    const response = await fetch("/api/account/password-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, passwordConfirm }),
    });
    const result = (await response.json()) as { message?: string };
    setSubmitting(false);

    if (!response.ok) {
      setMessage(
        result.message ??
          "비밀번호를 변경하지 못했습니다. 재설정 메일을 다시 받아 주세요.",
      );
      return;
    }

    router.replace("/account?password=changed");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <label className="flex flex-col gap-2 text-sm text-foreground/65">
        새 비밀번호
        <input
          type="password"
          name="password"
          autoComplete="new-password"
          minLength={8}
          required
          placeholder="8자 이상 입력해 주세요"
          className="h-12 rounded-sm border border-border bg-background px-4 text-base text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-primary"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-foreground/65">
        새 비밀번호 확인
        <input
          type="password"
          name="password-confirm"
          autoComplete="new-password"
          minLength={8}
          required
          placeholder="새 비밀번호를 한 번 더 입력해 주세요"
          className="h-12 rounded-sm border border-border bg-background px-4 text-base text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-primary"
        />
      </label>

      {message && (
        <p role="alert" className="text-sm text-red-800">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="h-12 w-full rounded-full bg-primary px-6 text-sm text-background transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {submitting ? "변경 중..." : "새 비밀번호 저장"}
      </button>
    </form>
  );
}
