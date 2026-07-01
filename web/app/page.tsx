import { Hero } from "@/components/Hero";
import { StatsRow } from "@/components/StatsRow";
import { HowItWorks } from "@/components/HowItWorks";
import { RecentDisputes } from "@/components/RecentDisputes";
import { SetupNotice } from "@/components/SetupNotice";

export default function Home() {
  return (
    <>
      <SetupNotice />
      <Hero />
      <StatsRow />
      <HowItWorks />
      <RecentDisputes />
    </>
  );
}
