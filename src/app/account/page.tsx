import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/account/ProfileForm";

export const metadata: Metadata = {
  title: "마이페이지",
  description: "파이커피로스터스 회원정보 관리 페이지입니다.",
  robots: { index: false, follow: false },
};

type Profile = {
  name: string | null;
  nickname: string | null;
  phone: string | null;
  birth: string | null;
  marketing_agree: boolean | null;
  marketing_agree_updated_at: string | null;
};

export default async function AccountPage() {
  const cookieStore = await cookies();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user
    ? (
        await supabase
          .from("profiles")
          .select(
            "name, nickname, phone, birth, marketing_agree, marketing_agree_updated_at",
          )
          .eq("id", user.id)
          .single<Profile>()
      ).data
    : null;

  const hasEmailPassword =
    user?.identities?.some((identity) => identity.provider === "email") ??
    user?.app_metadata.provider === "email";
  const socialProvider = user?.identities?.some(
    (identity) => identity.provider === "kakao",
  )
    ? "kakao"
    : user?.identities?.some(
          (identity) => identity.provider === "custom:naver",
        )
      ? "naver"
      : null;
  const recentReauthentication = cookieStore.get("pi_account_reauth")?.value;

  return (
    <main className="min-h-screen flex-1 bg-background px-5 pb-24 pt-28 sm:px-8 sm:pb-32 sm:pt-36">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-10 border-b border-border pb-8 sm:mb-12 sm:pb-10">
          <span className="font-sans text-xs tracking-[0.2em] text-primary/50">
            MEMBER ACCOUNT
          </span>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-4xl font-medium tracking-tight text-primary sm:text-5xl">
                마이페이지
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-foreground/55">
                회원정보와 계정 보안을 관리할 수 있습니다.
              </p>
            </div>
            <Link
              href="/"
              className="w-fit text-sm text-foreground/55 underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              홈페이지로 돌아가기
            </Link>
          </div>
        </header>

        {user ? (
          <ProfileForm
            email={user.email ?? ""}
            name={profile?.name ?? ""}
            nickname={profile?.nickname ?? ""}
            phone={profile?.phone ?? ""}
            birth={profile?.birth ?? ""}
            hasEmailPassword={hasEmailPassword}
            socialProvider={socialProvider}
            marketingAgree={profile?.marketing_agree ?? false}
            marketingAgreeUpdatedAt={
              profile?.marketing_agree_updated_at ?? ""
            }
            hasRecentSocialAuth={recentReauthentication === socialProvider}
            hasRecentEmailAuth={recentReauthentication === "email"}
          />
        ) : (
          <div className="rounded-sm border border-border bg-surface px-6 py-10 text-center text-sm text-foreground/60">
            로그인된 계정이 없습니다.
            <div className="mt-5">
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
