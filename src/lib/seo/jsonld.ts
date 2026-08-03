import { SITE_CONFIG } from "@/constants/site";

/**
 * Contact 섹션 구현 시 SITE_CONFIG.contact 값이 채워지면
 * address/telephone/sameAs 필드가 자동으로 채워진다.
 */
export function getLocalBusinessJsonLd() {
  const { businessAddress, contact, openingHours } = SITE_CONFIG;

  return {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    name: SITE_CONFIG.name,
    alternateName: SITE_CONFIG.alternateName,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    image: `${SITE_CONFIG.url}/og-image.jpg`,
    ...(contact.address && {
      address: {
        "@type": "PostalAddress",
        ...businessAddress,
      },
    }),
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: openingHours.days,
      opens: openingHours.opens,
      closes: openingHours.closes,
    },
    ...(contact.phone && { telephone: contact.phone }),
    ...(contact.naverMapUrl && { hasMap: contact.naverMapUrl }),
    sameAs: [contact.instagramUrl, contact.naverMapUrl].filter(Boolean),
  };
}

export function getWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.name,
    alternateName: SITE_CONFIG.alternateName,
    url: SITE_CONFIG.url,
  };
}
