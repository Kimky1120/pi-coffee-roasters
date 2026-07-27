import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "계정 확인",
  description: "로그인한 계정 정보를 확인하는 테스트 페이지입니다.",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-1 items-center justify-center bg-background px-6 py-28 sm:py-32">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <span className="font-sans text-xs tracking-[0.2em] text-primary/55">
            ACCOUNT CHECK
          </span>
          <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-primary sm:text-5xl">
            계정 정보
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-foreground/60">
            로그인 연동 테스트용 페이지입니다.
          </p>
        </div>

        {user ? (
          <div className="flex flex-col gap-4 rounded-sm border border-border bg-surface px-5 py-6 text-sm">
            <Row label="이메일" value={user.email ?? "(이메일 없음)"} />
            <Row
              label="로그인 provider"
              value={user.app_metadata?.provider ?? "(알 수 없음)"}
            />
            <Row label="User ID" value={user.id} />
            <div className="border-t border-border pt-4">
              <p className="mb-2 text-xs tracking-wide text-foreground/50">
                RAW user_metadata
              </p>
              <pre className="overflow-x-auto rounded-sm bg-background p-3 text-xs text-foreground/70">
                {JSON.stringify(user.user_metadata, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div className="rounded-sm border border-border bg-surface px-5 py-6 text-center text-sm text-foreground/60">
            로그인된 계정이 없습니다.
            <div className="mt-4">
              <Link
                href="/login"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                로그인 화면으로 이동
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-foreground/50">{label}</span>
      <span className="truncate text-right text-foreground">{value}</span>
    </div>
  );
}
