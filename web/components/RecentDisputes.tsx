"use client";

import Link from "next/link";
import { useCases } from "@/lib/useCases";
import { Container, Eyebrow } from "./ui";
import { DisputeCard } from "./DisputeCard";

export function RecentDisputes() {
  const { cases, error } = useCases();
  const recent = cases?.slice(0, 4) ?? null;

  return (
    <section className="py-20">
      <Container>
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-3">
            <Eyebrow>Live registry</Eyebrow>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Recent disputes
            </h2>
          </div>
          <Link
            href="/disputes"
            className="hidden font-mono text-sm text-muted transition-colors hover:text-accent sm:inline"
          >
            View all →
          </Link>
        </div>

        {error && (
          <p className="mt-8 border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-300">
            {error}
          </p>
        )}

        {recent && recent.length === 0 && !error && (
          <div className="mt-8 border border-dashed border-border p-10 text-center">
            <p className="text-muted">No disputes filed yet.</p>
            <Link
              href="/file"
              className="mt-3 inline-block font-mono text-sm text-accent hover:underline"
            >
              File the first claim →
            </Link>
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recent === null && !error
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/3] animate-pulse border border-border bg-surface"
                />
              ))
            : recent?.map((c) => <DisputeCard key={c.id} summary={c} />)}
        </div>
      </Container>
    </section>
  );
}
