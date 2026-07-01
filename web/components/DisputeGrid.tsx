"use client";

import { useState } from "react";
import Link from "next/link";
import { useCases } from "@/lib/useCases";
import { Status } from "@/lib/genlayer";
import { DisputeCard } from "./DisputeCard";
import { Button } from "./ui";

type Filter = "all" | "pending" | "resolved" | "rejected";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "resolved", label: "Resolved" },
  { key: "rejected", label: "Rejected" },
];

function matches(status: number, f: Filter): boolean {
  if (f === "all") return true;
  if (f === "pending")
    return status === Status.SERVED || status === Status.RESPONDED;
  if (f === "resolved") return status === Status.RESOLVED;
  if (f === "rejected") return status === Status.REJECTED;
  return true;
}

export function DisputeGrid() {
  const { cases, error, reload } = useCases();
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = cases?.filter((c) => matches(c.status, filter)) ?? null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`border px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                filter === f.key
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-border text-muted hover:border-border-strong hover:text-text"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={reload}
          className="font-mono text-xs text-faint transition-colors hover:text-accent"
        >
          ↻ Refresh
        </button>
      </div>

      {error && (
        <p className="mt-8 border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-300">
          {error}
        </p>
      )}

      {filtered && filtered.length === 0 && !error && (
        <div className="mt-16 flex flex-col items-center gap-4 border border-dashed border-border py-20 text-center">
          <p className="text-muted">
            {filter === "all"
              ? "No disputes on the registry yet."
              : `No ${filter} disputes.`}
          </p>
          <Button href="/file" variant="outline">
            File a Claim →
          </Button>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered === null && !error
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3] animate-pulse border border-border bg-surface"
              />
            ))
          : filtered?.map((c) => <DisputeCard key={c.id} summary={c} />)}
      </div>
    </div>
  );
}
