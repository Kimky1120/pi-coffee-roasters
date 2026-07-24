import { Hero } from "@/sections/hero/Hero";
import { About } from "@/sections/about/About";
import { OurCoffee } from "@/sections/our-coffee/OurCoffee";
import { Roasting } from "@/sections/roasting/Roasting";
import { Wholesale } from "@/sections/wholesale/Wholesale";
import { Gallery } from "@/sections/gallery/Gallery";
import { Contact } from "@/sections/contact/Contact";

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <About />
      <OurCoffee />
      <Roasting />
      <Wholesale />
      <Gallery />
      <Contact />
    </main>
  );
}
