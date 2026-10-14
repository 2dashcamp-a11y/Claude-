import { EarlyAccess } from "@/components/EarlyAccess";
import { Founder } from "@/components/Founder";
import { Hero } from "@/components/Hero";
import { Problem } from "@/components/Problem";
import { Process } from "@/components/Process";
import { RevealObserver } from "@/components/RevealObserver";
import { Services } from "@/components/Services";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero />
        <Problem />
        <Services />
        <Process />
        <Founder />
        <EarlyAccess />
      </main>
      <SiteFooter />
      <RevealObserver />
    </>
  );
}
