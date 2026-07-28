import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "프로필 조회 테스트",
  robots: { index: false, follow: false },
};

type Profile = {
  id: string;
  name: string | null;
  phone: string | null;
  nickname: string | null;
  birth: string | null;
  created_at: string;
};

export default async function TestProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] flex-1 items-center justify-center bg-background px-6 py-28 sm:py-32">
        <div className="w-full max-w-md rounded-sm border border-border bg-surface px-5 py-6 text-center text-sm text-foreground/60">
          로그인이 필요합니다.
          <div className="mt-4">
            <Link
              href="/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              로그인 화면으로 이동
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, name, phone, nickname, birth, created_at")
    .eq("id", user.id)
    .single<Profile>();

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-1 items-center justify-center bg-background px-6 py-28 sm:py-32">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-lg font-medium text-primary">
          profiles 조회 테스트
        </h1>

        {error || !profile ? (
          <div className="rounded-sm border border-border bg-surface px-5 py-6 text-sm text-foreground/60">
            profiles row를 찾을 수 없습니다.
            {error && (
              <pre className="mt-3 overflow-x-auto rounded-sm bg-background p-3 text-xs text-red-600">
                {error.message}
              </pre>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4 rounded-sm border border-border bg-surface px-5 py-6 text-sm">
            <Row label="id" value={profile.id} />
            <Row label="name" value={profile.name ?? "(없음)"} />
            <Row label="phone" value={profile.phone ?? "(없음)"} />
            <Row label="nickname" value={profile.nickname ?? "(없음)"} />
            <Row label="birth" value={profile.birth ?? "(없음)"} />
            <Row label="created_at" value={profile.created_at} />
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
