import { Hero } from "@/components/sections/hero";
import { Why } from "@/components/sections/why";
import { Features } from "@/components/sections/features";
import { RouteSection } from "@/components/sections/route";
import { Legacy } from "@/components/sections/legacy";
import { Difference } from "@/components/sections/difference";
import { Brands } from "@/components/sections/brands";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Why />
      <Features />
      <RouteSection />
      <Legacy />
      <Difference />
      <Brands />
    </>
  );
}
