import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { COFFEE_BEANS } from "@/data/coffee";
import { PurchaseOptions } from "@/components/shop/PurchaseOptions";

const DETAIL_IMAGES = Array.from(
  { length: 11 },
  (_, index) => `/images/detail/detail-${String(index + 1).padStart(2, "0")}.png`,
);

export function generateStaticParams() {
  return COFFEE_BEANS.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const bean = COFFEE_BEANS.find((item) => item.slug === slug);

  if (!bean) return {};

  return {
    title: `${bean.name} | PI Coffee Roasters`,
    description: `${bean.name} 원두와 파이커피 로스터스의 커피 이야기를 소개합니다.`,
  };
}

export default async function CoffeeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const bean = COFFEE_BEANS.find((item) => item.slug === slug);

  if (!bean) notFound();

  return (
    <main className="min-h-screen bg-[#f4f4f4] pt-14 sm:pt-16">
      <div className="sticky top-14 z-20 border-b border-black/10 bg-[#f4f4f4]/90 backdrop-blur-md sm:top-16">
        <div className="mx-auto flex max-w-[860px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link
            href="/#our-coffee"
            className="inline-flex items-center gap-2 font-sans text-xs tracking-[0.12em] text-foreground/70 transition-colors hover:text-primary"
          >
            <ArrowLeft aria-hidden size={16} />
            OUR COFFEE
          </Link>
          <span className="font-display text-lg text-primary sm:text-xl">
            {bean.name}
          </span>
        </div>
      </div>

      <article className="mx-auto w-full max-w-[860px] bg-[#f4f4f4]">
        <PurchaseOptions productName={bean.name} productSlug={bean.slug} />
        {DETAIL_IMAGES.map((src, index) => (
          <Image
            key={src}
            src={src}
            alt={
              index === 0
                ? "PI Coffee Roasters 상세페이지"
                : `PI Coffee Roasters 상세 이미지 ${index + 1}`
            }
            width={1720}
            height={5160}
            sizes="(min-width: 1720px) 1720px, 100vw"
            priority={index === 0}
            className="block h-auto w-full"
          />
        ))}
      </article>
    </main>
  );
}
