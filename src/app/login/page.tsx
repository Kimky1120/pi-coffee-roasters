import type { Metadata } from "next";
import { AuthForm } from "@/components/shop/AuthForm";

export const metadata: Metadata = {
  title: "로그인",
  description: "PI Coffee Roasters 회원 로그인 화면입니다.",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-1 items-center justify-center bg-background px-6 py-28 sm:py-32">
      <AuthForm mode="login" />
    </main>
  );
}
