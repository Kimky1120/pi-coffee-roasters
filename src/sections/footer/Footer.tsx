import { NAV_ITEMS } from "@/constants/nav";
import { SITE_CONFIG } from "@/constants/site";
import { FOOTER_CONTACT_CHANNELS } from "@/data/footer";
import { FooterContent } from "./FooterContent";

export function Footer() {
  return (
    <footer className="relative w-full overflow-hidden border-t border-border bg-surface">
      <div className="mx-auto w-full max-w-6xl px-6 py-16">
        <FooterContent
          brandName={SITE_CONFIG.name}
          tagline={SITE_CONFIG.slogan}
          navItems={NAV_ITEMS}
          contactChannels={FOOTER_CONTACT_CHANNELS}
          contact={SITE_CONFIG.contact}
        />
      </div>
    </footer>
  );
}
