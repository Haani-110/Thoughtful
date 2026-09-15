import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Categories } from "@/components/sections/categories";
import { Details } from "@/components/sections/details";
import { FinalCta } from "@/components/sections/final-cta";
import { Marquee } from "@/components/ui/marquee";

export default function Home() {
  return (
    <div id="top">
      <Navbar />
      <main id="main">
        <Hero />
        <Marquee />
        <HowItWorks />
        <Categories />
        <Details />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
