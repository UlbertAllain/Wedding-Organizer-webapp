"use client";

import { useEffect, useState } from "react";

import { ClosingSection } from "@/components/landing/ClosingSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { PackageSection } from "@/components/landing/PackageSection";
import { ProcessSection } from "@/components/landing/ProcessSection";
import { PromiseSection } from "@/components/landing/PromiseSection";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { StorySection } from "@/components/landing/StorySection";
import { ValueStrip } from "@/components/landing/ValueStrip";
import { apiRequest } from "@/lib/api-client";
import type { PackageRecord } from "@/types/domain";

export function LandingPage() {
  const [packages, setPackages] = useState<PackageRecord[]>([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);

  useEffect(() => {
    let cancelled = false;

    apiRequest<PackageRecord[]>("/api/packages?active=true")
      .then((data) => {
        if (!cancelled) setPackages(data);
      })
      .catch(() => {
        if (!cancelled) setPackages([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingPackages(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="studio-site">
      <LandingHeader />
      <HeroSection />
      <ValueStrip />
      <StorySection />
      <ServicesSection />
      <ProcessSection />
      <PackageSection packages={packages} isLoading={isLoadingPackages} />
      <PromiseSection />
      <ClosingSection />
      <LandingFooter />
    </main>
  );
}
