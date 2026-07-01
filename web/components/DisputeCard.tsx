"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCase } from "@/lib/contract";
import {
  shortAddr,
  Status,
  verdictLabel,
  Verdict,
  type CaseSummary,
  type CaseFull,
} from "@/lib/genlayer";
import { StatusBadge } from "./StatusBadge";

function timeAgo(unix: number): string {
  if (!unix) return "";
  const s = Math.floor(Date.now() / 1000) - unix;
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function DisputeCard({ summary }: { summary: CaseSummary }) {
  const [full, setFull] = useState<CaseFull | null>(null);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getCase(summary.id)
      .then((c) => !cancelled && setFull(c))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [summary.id]);

  const img = full?.collection_url;

  return (
    <Link
      href={`/disputes/${summary.id}`}
      className="group flex flex-col border border-border bg-surface transition-colors hover:border-accent/60"
    >
      <div className="relative aspect-[4/3] overflow-hidden border-b border-border bg-bg-soft">
        {img && !imgFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt=""
            className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-[1.03]"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="grid h-full place-items-center">
            <span className="font-mono text-xs text-faint">
              {full ? "no preview" : "loading…"}
            </span>
          </div>
        )}
        <div className="absolute left-3 top-3">
          <StatusBadge status={summary.status} />
        </div>
        <div className="absolute right-3 top-3 bg-bg/80 px-2 py-0.5 font-mono text-[11px] text-muted backdrop-blur">
          #{String(summary.id).padStart(3, "0")}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-wider text-faint">
            Claimant
          </span>
          <span className="font-mono text-xs text-muted">
            {full ? timeAgo(full.created_at) : ""}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm text-text">
            {shortAddr(summary.plaintiff)}
          </span>
          <span className="text-muted transition-colors group-hover:text-accent">
            →
          </span>
        </div>
        {summary.status === Status.RESOLVED && (
          <div className="mt-1 border-t border-border pt-2">
            <span
              className={`font-mono text-xs ${
                summary.verdict === Verdict.FOR_PLAINTIFF
                  ? "text-accent"
                  : "text-sky-300"
              }`}
            >
              Verdict · {verdictLabel(summary.verdict)}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
