import type { Metadata } from "next";
import { AuthForm } from "@/components/shop/AuthForm";

export const metadata: Metadata = {
  title: "로그인",
  description: "PI Coffee Roasters 회원 로그인 화면입니다.",
};

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth-callback":
    "로그인 연결을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.",
  "confirmation-failed":
    "인증 링크가 만료되었거나 이미 사용되었습니다. 이미 인증했다면 로그인하고, 그렇지 않다면 회원가입을 다시 진행해 주세요.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const { error } = await searchParams;
  const errorCode = Array.isArray(error) ? error[0] : error;
  const initialError = errorCode
    ? AUTH_ERROR_MESSAGES[errorCode]
    : undefined;

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-1 items-center justify-center bg-background px-6 py-28 sm:py-32">
      <AuthForm mode="login" initialError={initialError} />
    </main>
  );
}
