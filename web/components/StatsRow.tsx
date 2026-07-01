"use client";

import { useCases } from "@/lib/useCases";
import { Status, type CaseSummary } from "@/lib/genlayer";
import { Container } from "./ui";

function computeStats(cases: CaseSummary[] | null) {
  if (!cases) return null;
  const total = cases.length;
  const resolved = cases.filter((c) => c.status === Status.RESOLVED).length;
  const pending = cases.filter(
    (c) => c.status === Status.SERVED || c.status === Status.RESPONDED,
  ).length;
  return { total, resolved, pending };
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2 px-6 py-8 sm:px-8">
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
        {label}
      </span>
      <span className="font-mono text-4xl font-semibold tabular-nums tracking-tight sm:text-5xl">
        {value}
      </span>
    </div>
  );
}

export function StatsRow() {
  const { cases } = useCases();
  const stats = computeStats(cases);
  const fmt = (n?: number) => (n == null ? "—" : String(n).padStart(2, "0"));

  return (
    <section className="border-b border-border">
      <Container>
        <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <Stat label="Total Claims" value={fmt(stats?.total)} />
          <Stat label="Resolved" value={fmt(stats?.resolved)} />
          <Stat label="Pending" value={fmt(stats?.pending)} />
        </div>
      </Container>
    </section>
  );
}
