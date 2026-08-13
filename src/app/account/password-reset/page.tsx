import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PasswordResetForm } from "@/components/account/PasswordResetForm";

export const metadata: Metadata = {
  title: "비밀번호 재설정",
  robots: { index: false, follow: false },
};

export default async function PasswordResetPage() {
  const cookieStore = await cookies();
  const hasRecoveryVerification =
    cookieStore.get("pi_password_recovery")?.value === "verified";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !hasRecoveryVerification) redirect("/account");

  return (
    <main className="min-h-screen flex-1 bg-background px-5 pb-24 pt-28 sm:px-8 sm:pb-32 sm:pt-36">
      <section className="mx-auto w-full max-w-lg rounded-sm border border-border bg-surface p-6 sm:p-9">
        <span className="text-xs tracking-[0.18em] text-primary/50">
          PASSWORD RESET
        </span>
        <h1 className="mt-3 font-display text-4xl font-medium text-primary">
          새 비밀번호 설정
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-foreground/55">
          이메일 본인확인이 완료되었습니다. 다른 사이트에서 사용하지 않는
          비밀번호를 입력해 주세요.
        </p>
        <PasswordResetForm />
      </section>
    </main>
  );
}
