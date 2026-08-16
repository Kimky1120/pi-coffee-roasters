import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/shop/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "비밀번호 찾기",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-1 items-center justify-center bg-background px-6 py-28 sm:py-32">
      <section className="w-full max-w-md">
        <ForgotPasswordForm />
      </section>
    </main>
  );
}
