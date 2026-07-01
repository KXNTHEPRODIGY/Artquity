import type { Metadata } from "next";
import { DisputeGrid } from "@/components/DisputeGrid";
import { Button, Container, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Disputes — Artquity",
};

export default function DisputesPage() {
  return (
    <Container className="py-16">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <Eyebrow>The registry</Eyebrow>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Disputes
          </h1>
          <p className="mt-4 max-w-xl text-muted">
            Every claim filed to the ArtDisputeRegistry, with its on-chain status
            and — once adjudicated — the Intelligent Contract&apos;s verdict.
          </p>
        </div>
        <Button href="/file" variant="accent">
          File a Claim →
        </Button>
      </div>

      <div className="mt-12">
        <DisputeGrid />
      </div>
    </Container>
  );
}
