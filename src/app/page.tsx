import { Hero } from "@/sections/hero/Hero";
import { About } from "@/sections/about/About";
import { History } from "@/sections/history/History";
import { OurCoffee } from "@/sections/our-coffee/OurCoffee";
import { Roasting } from "@/sections/roasting/Roasting";
import { Wholesale } from "@/sections/wholesale/Wholesale";
import { Gallery } from "@/sections/gallery/Gallery";
import { Contact } from "@/sections/contact/Contact";
import { AuthNotice } from "@/components/shop/AuthNotice";
import { HomeScrollReset } from "@/components/ui/HomeScrollReset";
import { getWebSiteJsonLd } from "@/lib/seo/jsonld";

const AUTH_MESSAGES: Record<string, string> = {
  "check-email":
    "가입 확인 메일을 보냈습니다. 이메일 인증 후 로그인해 주세요.",
  "signup-complete": "회원가입이 완료되었습니다.",
  "logged-out": "로그아웃되었습니다.",
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ auth?: string }>;
}) {
  const { auth } = await searchParams;
  const authMessage = auth ? AUTH_MESSAGES[auth] : undefined;

  return (
    <main className="flex-1">
      <HomeScrollReset />
      {authMessage && <AuthNotice message={authMessage} />}
      <Hero />
      <About />
      <History />
      <OurCoffee />
      <Roasting />
      <Wholesale />
      <Gallery />
      <Contact />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getWebSiteJsonLd()),
        }}
      />
    </main>
  );
}
