"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type Props = {
  provider: "kakao" | "naver";
  email: string;
  initialName: string;
  initialNickname: string;
  initialPhone: string;
  initialBirth: string;
  initialMarketingAgree: boolean;
};

function formatPhoneInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function formatBirthInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

export function SocialOnboardingForm({
  provider,
  email,
  initialName,
  initialNickname,
  initialPhone,
  initialBirth,
  initialMarketingAgree,
}: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const providerName = provider === "naver" ? "네이버" : "카카오";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/account/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(formData.get("name") ?? "").trim(),
        nickname: String(formData.get("nickname") ?? "").trim(),
        phone: String(formData.get("phone") ?? "").trim(),
        birth: String(formData.get("birth") ?? "").trim(),
        termsAgree: formData.get("terms_agree") === "on",
        privacyAgree: formData.get("privacy_agree") === "on",
        marketingAgree: formData.get("marketing_agree") === "on",
      }),
    });
    const result = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;

    if (!response.ok) {
      setMessage(result?.message ?? "입력한 정보를 다시 확인해 주세요.");
      setIsSubmitting(false);
      return;
    }

    router.replace("/account?welcome=1");
    router.refresh();
  }

  const inputClassName =
    "h-12 rounded-sm border border-border bg-background px-4 text-base text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-primary";

  return (
    <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit}>
      {email && (
        <label className="flex flex-col gap-2 text-sm text-foreground/65">
          이메일
          <input
            type="email"
            value={email}
            readOnly
            className={`${inputClassName} cursor-default bg-primary/[0.025] text-foreground/60`}
          />
        </label>
      )}

      <label className="flex flex-col gap-2 text-sm text-foreground/65">
        성명
        <input
          type="text"
          name="name"
          defaultValue={initialName}
          autoComplete="name"
          minLength={2}
          maxLength={30}
          required
          placeholder="성명을 입력해 주세요"
          className={inputClassName}
        />
      </label>

      <label className="flex flex-col gap-2 text-sm text-foreground/65">
        휴대폰 번호
        <input
          type="tel"
          name="phone"
          defaultValue={initialPhone}
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
          className={inputClassName}
        />
      </label>

      <label className="flex flex-col gap-2 text-sm text-foreground/65">
        닉네임
        <input
          type="text"
          name="nickname"
          defaultValue={initialNickname}
          autoComplete="nickname"
          minLength={2}
          maxLength={20}
          required
          placeholder="닉네임을 입력해 주세요"
          className={inputClassName}
        />
      </label>

      <label className="flex flex-col gap-2 text-sm text-foreground/65">
        생년월일 <span className="text-xs text-foreground/40">(선택)</span>
        <input
          type="text"
          name="birth"
          defaultValue={initialBirth}
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
          className={inputClassName}
        />
      </label>

      <div className="mt-2 border-t border-border pt-5">
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-foreground/65">
          <input
            type="checkbox"
            name="terms_agree"
            required
            className="mt-1 h-4 w-4 accent-primary"
          />
          <span>
            <Link
              href="/terms"
              target="_blank"
              className="font-medium text-primary underline underline-offset-4"
            >
              이용약관
            </Link>
            에 동의합니다. (필수)
          </span>
        </label>
        <label className="mt-3 flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-foreground/65">
          <input
            type="checkbox"
            name="privacy_agree"
            required
            className="mt-1 h-4 w-4 accent-primary"
          />
          <span>
            <Link
              href="/privacy"
              target="_blank"
              className="font-medium text-primary underline underline-offset-4"
            >
              개인정보 처리방침
            </Link>
            에 동의합니다. (필수)
          </span>
        </label>
        <label className="mt-3 flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-foreground/65">
          <input
            type="checkbox"
            name="marketing_agree"
            defaultChecked={initialMarketingAgree}
            className="mt-1 h-4 w-4 accent-primary"
          />
          마케팅 정보 수신에 동의합니다. (선택)
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 h-12 rounded-full bg-primary px-6 text-sm tracking-wide text-background transition-colors hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60"
      >
        {isSubmitting ? "저장 중..." : "가입 완료"}
      </button>

      {message && (
        <p
          role="alert"
          className="rounded-sm border border-red-900/20 bg-red-950/5 px-4 py-3 text-sm leading-relaxed text-red-900"
        >
          {message}
        </p>
      )}

      <p className="text-center text-xs leading-relaxed text-foreground/40">
        {providerName}에서 동의한 정보만 자동 입력됩니다.
      </p>
    </form>
  );
}
