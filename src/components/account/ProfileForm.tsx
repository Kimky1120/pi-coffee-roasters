"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PreparationNotice } from "@/components/shop/PreparationNotice";

export function ProfileForm({
  email,
  nickname: initialNickname,
  phone: initialPhone,
  birth: initialBirth,
}: {
  email: string;
  nickname: string;
  phone: string;
  birth: string;
}) {
  const [nickname, setNickname] = useState(initialNickname);
  const [phone, setPhone] = useState(initialPhone);
  const [birth, setBirth] = useState(initialBirth);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);
    setSaving(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErrorMessage("로그인이 필요합니다.");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        nickname,
        phone,
        birth: birth || null,
      })
      .eq("id", user.id);

    setSaving(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage("저장되었습니다.");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-sm border border-border bg-surface px-5 py-6"
    >
      <label className="flex flex-col gap-2 text-sm text-foreground/70">
        닉네임
        <input
          type="text"
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          placeholder="닉네임을 입력해 주세요"
          className="h-12 rounded-sm border border-border bg-background px-4 text-base text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-primary"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm text-foreground/70">
        휴대폰
        <input
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="010-0000-0000"
          className="h-12 rounded-sm border border-border bg-background px-4 text-base text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-primary"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm text-foreground/70">
        생년월일
        <input
          type="date"
          value={birth}
          onChange={(event) => setBirth(event.target.value)}
          className="h-12 rounded-sm border border-border bg-background px-4 text-base text-foreground outline-none transition-colors focus:border-primary"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm text-foreground/70">
        이메일
        <input
          type="email"
          value={email}
          disabled
          className="h-12 rounded-sm border border-border bg-background px-4 text-base text-foreground/50 outline-none disabled:opacity-50"
        />
      </label>

      <button
        type="submit"
        disabled={saving}
        className="mt-2 h-12 rounded-full bg-primary px-6 text-sm tracking-wide text-background transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {saving ? "저장 중..." : "저장하기"}
      </button>

      {successMessage && <PreparationNotice>{successMessage}</PreparationNotice>}

      {errorMessage && (
        <p className="text-center text-xs text-red-600">{errorMessage}</p>
      )}
    </form>
  );
}
