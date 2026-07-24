import { SITE_CONFIG } from "@/constants/site";
import { CONTACT_CHANNELS } from "@/data/contact";
import { ContactContent } from "./ContactContent";

export function Contact() {
  return (
    <section
      id="contact"
      className="relative w-full overflow-hidden bg-background py-24 sm:py-32"
    >
      <div className="mx-auto w-full max-w-6xl px-6">
        <ContactContent channels={CONTACT_CHANNELS} contact={SITE_CONFIG.contact} />
      </div>
    </section>
  );
}
