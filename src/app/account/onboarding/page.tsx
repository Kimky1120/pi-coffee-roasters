import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SocialOnboardingForm } from "@/components/account/SocialOnboardingForm";
import { getSocialProvider } from "@/lib/auth/social-profile";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "간편가입 정보 확인",
  description: "파이커피로스터스 간편가입 정보 확인 페이지입니다.",
  robots: { index: false, follow: false },
};

type Profile = {
  name: string | null;
  nickname: string | null;
  phone: string | null;
  birth: string | null;
  marketing_agree: boolean | null;
};

export default async function SocialOnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  const provider = getSocialProvider(user);
  if (!provider) redirect("/account");
  if (user.app_metadata?.social_onboarding_completed === true) {
    redirect("/account");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, nickname, phone, birth, marketing_agree")
    .eq("id", user.id)
    .single<Profile>();

  const providerName = provider === "naver" ? "네이버" : "카카오";
  const email = String(
    user.email ??
      user.app_metadata?.social_email ??
      user.user_metadata?.email ??
      "",
  );

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-background px-5 pb-24 pt-28 sm:px-8 sm:pb-32 sm:pt-36">
      <section className="w-full max-w-xl rounded-sm border border-border bg-surface px-6 py-8 sm:px-10 sm:py-10">
        <span className="font-sans text-xs tracking-[0.18em] text-primary/50">
          EASY SIGN UP
        </span>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-primary sm:text-5xl">
          간편가입 정보 확인
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-foreground/55">
          {providerName}에서 받은 정보를 확인하고, 비어 있는 항목만 입력해
          주세요.
        </p>

        <SocialOnboardingForm
          provider={provider}
          email={email}
          initialName={profile?.name ?? ""}
          initialNickname={profile?.nickname ?? ""}
          initialPhone={profile?.phone ?? ""}
          initialBirth={profile?.birth ?? ""}
          initialMarketingAgree={profile?.marketing_agree ?? false}
        />
      </section>
    </main>
  );
}
