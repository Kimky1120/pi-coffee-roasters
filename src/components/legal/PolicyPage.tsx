import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export type PolicySection = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

export function PolicyPage({
  eyebrow,
  title,
  effectiveDate,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  effectiveDate: string;
  intro: string;
  sections: PolicySection[];
}) {
  return (
    <main className="min-h-screen flex-1 bg-background px-5 pb-24 pt-28 sm:px-8 sm:pb-32 sm:pt-36">
      <article className="mx-auto w-full max-w-3xl">
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 text-sm text-foreground/55 transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          회원가입으로 돌아가기
        </Link>

        <header className="mt-10 border-b border-border pb-8">
          <span className="text-xs tracking-[0.18em] text-primary/50">
            {eyebrow}
          </span>
          <h1 className="mt-3 font-display text-4xl font-medium text-primary sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 text-sm leading-7 text-foreground/60">{intro}</p>
          <p className="mt-3 text-xs text-foreground/40">
            시행일 {effectiveDate}
          </p>
        </header>

        <div className="mt-10 flex flex-col gap-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-display text-2xl font-medium text-primary">
                {section.title}
              </h2>
              {section.paragraphs?.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-4 text-sm leading-7 text-foreground/65"
                >
                  {paragraph}
                </p>
              ))}
              {section.items && (
                <ul className="mt-4 flex list-disc flex-col gap-2 pl-5 text-sm leading-7 text-foreground/65">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
