import Link from "next/link";
import { NAV_ITEMS } from "@/constants/nav";
import { SITE_CONFIG } from "@/constants/site";
import { FOOTER_CONTACT_CHANNELS } from "@/data/footer";
import { FooterContent } from "./FooterContent";

export function Footer() {
  return (
    <footer className="relative w-full overflow-hidden border-t border-border bg-surface">
      <div className="mx-auto w-full max-w-6xl px-6 py-12 sm:py-16">
        <FooterContent
          brandName={SITE_CONFIG.name}
          tagline={SITE_CONFIG.slogan}
          navItems={NAV_ITEMS}
          contactChannels={FOOTER_CONTACT_CHANNELS}
          contact={SITE_CONFIG.contact}
        />
        <section
          aria-label="사업자 정보"
          className="mt-8 border-t border-border pt-6 font-sans text-sm leading-7 text-foreground/70"
        >
          <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-wrap gap-x-2">
              <dt className="font-medium text-foreground">상호명</dt>
              <dd>{SITE_CONFIG.business.name}</dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="font-medium text-foreground">대표자명</dt>
              <dd>{SITE_CONFIG.business.representative}</dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="font-medium text-foreground">사업자등록번호</dt>
              <dd>{SITE_CONFIG.business.registrationNumber}</dd>
            </div>
            <div className="flex flex-wrap gap-x-2 sm:col-span-2">
              <dt className="font-medium text-foreground">사업장 주소</dt>
              <dd className="break-keep">{SITE_CONFIG.contact.address}</dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="font-medium text-foreground">전화번호</dt>
              <dd>
                <a
                  href={`tel:${SITE_CONFIG.contact.phone}`}
                  className="underline-offset-4 hover:text-primary hover:underline"
                >
                  {SITE_CONFIG.contact.phone}
                </a>
              </dd>
            </div>
          </dl>
          <nav aria-label="이용 정책" className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
              이용약관
            </Link>
            <Link href="/privacy" className="font-medium underline underline-offset-4 hover:text-primary">
              개인정보 처리방침
            </Link>
          </nav>
        </section>
      </div>
    </footer>
  );
}
