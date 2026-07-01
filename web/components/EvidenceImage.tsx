"use client";

import { useState } from "react";

export function EvidenceImage({
  url,
  label,
  index,
}: {
  url: string;
  label: string;
  index?: number;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <figure className="space-y-2.5">
      <figcaption className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted">
        {index != null && <span className="text-accent">IMG {index}</span>}
        {label}
      </figcaption>
      <div className="relative flex aspect-square items-center justify-center overflow-hidden border border-border bg-bg-soft">
        {!url ? (
          <span className="font-mono text-xs text-faint">none submitted</span>
        ) : failed ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="px-4 text-center font-mono text-xs text-accent underline"
          >
            preview unavailable — open ↗
          </a>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={label}
            className="h-full w-full object-contain"
            onError={() => setFailed(true)}
          />
        )}
      </div>
    </figure>
  );
}
