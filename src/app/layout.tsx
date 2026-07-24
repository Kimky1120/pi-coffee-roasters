import type { Metadata } from "next";
import { cormorantGaramond, pretendard } from "@/lib/fonts";
import { defaultMetadata } from "@/lib/seo/metadata";
import { getLocalBusinessJsonLd } from "@/lib/seo/jsonld";
import { Header } from "@/sections/header/Header";
import { Footer } from "@/sections/footer/Footer";
import "@/styles/globals.css";

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${cormorantGaramond.variable} ${pretendard.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        {children}
        <Footer />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getLocalBusinessJsonLd()),
          }}
        />
      </body>
    </html>
  );
}
