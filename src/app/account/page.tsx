import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/account/ProfileForm";

export const metadata: Metadata = {
  title: "마이페이지",
  description: "PI Coffee Roasters 마이페이지입니다.",
  robots: { index: false, follow: false },
};

type Profile = {
  nickname: string | null;
  phone: string | null;
  birth: string | null;
};

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user
    ? (
        await supabase
          .from("profiles")
          .select("nickname, phone, birth")
          .eq("id", user.id)
          .single<Profile>()
      ).data
    : null;

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-1 items-center justify-center bg-background px-6 py-28 sm:py-32">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <h1 className="font-display text-4xl font-medium tracking-tight text-primary sm:text-5xl">
            마이페이지
          </h1>
        </div>

        {user ? (
          <ProfileForm
            email={user.email ?? ""}
            nickname={profile?.nickname ?? ""}
            phone={profile?.phone ?? ""}
            birth={profile?.birth ?? ""}
          />
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
