import { SITE_CONFIG } from "@/constants/site";

/**
 * Contact 섹션 구현 시 SITE_CONFIG.contact 값이 채워지면
 * address/telephone/sameAs 필드가 자동으로 채워진다.
 */
export function getLocalBusinessJsonLd() {
  const { contact } = SITE_CONFIG;

  return {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    ...(contact.address && {
      address: {
        "@type": "PostalAddress",
        streetAddress: contact.address,
        addressCountry: "KR",
      },
    }),
    ...(contact.phone && { telephone: contact.phone }),
    ...(contact.instagramUrl && { sameAs: [contact.instagramUrl] }),
  };
}
