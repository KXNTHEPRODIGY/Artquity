"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useWallet } from "./WalletProvider";
import { friendlyError, getCase, isNoSuchCase } from "@/lib/contract";
import {
  explorerAddressUrl,
  sameAddr,
  shortAddr,
  Status,
  Verdict,
  verdictLabel,
  type CaseFull,
} from "@/lib/genlayer";
import { StatusBadge } from "./StatusBadge";
import { EvidenceImage } from "./EvidenceImage";
import { RespondForm } from "./RespondForm";
import { AdjudicateButton } from "./AdjudicateButton";
import { Container } from "./ui";

function fmtTime(unix: number): string {
  if (!unix) return "—";
  return new Date(unix * 1000).toLocaleString();
}

function BackLink() {
  return (
    <Link
      href="/disputes"
      className="font-mono text-xs text-muted transition-colors hover:text-accent"
    >
      ← All disputes
    </Link>
  );
}

function Party({ label, addr }: { label: string; addr: string }) {
  return (
    <div className="border border-border bg-surface p-4">
      <div className="font-mono text-[11px] uppercase tracking-wider text-faint">
        {label}
      </div>
      <a
        href={explorerAddressUrl(addr)}
        target="_blank"
        rel="noreferrer"
        className="mt-1.5 block font-mono text-sm text-text transition-colors hover:text-accent"
        title={addr}
      >
        {shortAddr(addr)} ↗
      </a>
    </div>
  );
}

function Panel({
  title,
  children,
  tone = "default",
}: {
  title: string;
  children: React.ReactNode;
  tone?: "default" | "accent";
}) {
  return (
    <div
      className={`border p-6 ${
        tone === "accent"
          ? "border-accent/40 bg-accent-soft"
          : "border-border bg-surface"
      }`}
    >
      <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
        {title}
      </h3>
      <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-text">
        {children}
      </div>
    </div>
  );
}

export function CaseDetail({ id }: { id: number }) {
  const { account } = useWallet();
  const [c, setCase] = useState<CaseFull | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    setNotFound(false);
    try {
      setCase(await getCase(id));
    } catch (e) {
      if (isNoSuchCase(e)) setNotFound(true);
      else setError(friendlyError(e));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading)
    return (
      <Container className="py-16">
        <p className="font-mono text-sm text-muted">Loading dispute…</p>
      </Container>
    );

  if (notFound)
    return (
      <Container className="py-16">
        <BackLink />
        <div className="mt-8 border border-dashed border-border p-16 text-center">
          <p className="text-muted">
            Dispute #{id} doesn&apos;t exist yet.
          </p>
          <Link
            href="/file"
            className="mt-3 inline-block font-mono text-sm text-accent hover:underline"
          >
            File a claim →
          </Link>
        </div>
      </Container>
    );

  if (error)
    return (
      <Container className="py-16">
        <BackLink />
        <p className="mt-8 border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-300">
          {error}
        </p>
      </Container>
    );

  if (!c) return null;

  const nowSec = Math.floor(Date.now() / 1000);
  const isDefendant = sameAddr(account, c.defendant);
  const deadlinePassed =
    c.status === Status.SERVED && nowSec >= c.response_deadline;
  const canRespond =
    c.status === Status.SERVED && isDefendant && !deadlinePassed;
  const canAdjudicate =
    c.status === Status.RESPONDED ||
    (c.status === Status.SERVED && deadlinePassed);

  return (
    <Container className="py-12">
      <BackLink />

      {/* Header */}
      <header className="mt-6 border-b border-border pb-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-2xl font-semibold tracking-tight">
            Dispute #{String(c.id).padStart(3, "0")}
          </span>
          <StatusBadge status={c.status} size="md" />
        </div>

        {c.status === Status.RESOLVED && (
          <div className="mt-5 inline-flex items-center gap-3 border border-accent/40 bg-accent-soft px-4 py-2.5">
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
              Verdict
            </span>
            <span
              className={`text-sm font-semibold ${
                c.verdict === Verdict.FOR_PLAINTIFF
                  ? "text-accent"
                  : "text-sky-300"
              }`}
            >
              {verdictLabel(c.verdict)}
            </span>
          </div>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Party label="Claimant" addr={c.plaintiff} />
          <Party label="Respondent" addr={c.defendant} />
        </div>

        <p className="mt-4 font-mono text-xs text-faint">
          Filed {fmtTime(c.created_at)}
          {c.status === Status.SERVED &&
            ` · response deadline ${fmtTime(c.response_deadline)}`}
        </p>
      </header>

      {/* Evidence */}
      <section className="mt-10">
        <h2 className="eyebrow">Evidence</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <EvidenceImage url={c.original_art_url} label="Claimant's original" index={1} />
          <EvidenceImage url={c.collection_url} label="Accused collection" index={2} />
          <EvidenceImage
            url={c.defendant_evidence_url}
            label="Respondent's evidence"
            index={3}
          />
        </div>
      </section>

      {/* Arguments */}
      <section className="mt-10 grid gap-5 sm:grid-cols-2">
        <Panel title="Claimant's argument">
          {c.plaintiff_argument || "—"}
        </Panel>
        <Panel title="Respondent's argument">
          {c.defendant_argument || "No response submitted."}
        </Panel>
      </section>

      {/* Intelligent Contract reasoning */}
      <section className="mt-10 space-y-5">
        <h2 className="eyebrow">Adjudication</h2>
        {c.intake_reasoning && (
          <Panel title="Intake screening">{c.intake_reasoning}</Panel>
        )}
        {c.status === Status.RESOLVED && c.final_reasoning && (
          <Panel title="Verdict reasoning · validator consensus" tone="accent">
            {c.final_reasoning}
          </Panel>
        )}
        {c.status === Status.REJECTED && (
          <p className="border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-300">
            Rejected at intake as implausible or frivolous — never served on the
            respondent.
          </p>
        )}
      </section>

      {/* Actions */}
      <section className="mt-10 space-y-5">
        {canRespond && <RespondForm caseId={c.id} onResponded={load} />}
        {c.status === Status.SERVED && isDefendant && deadlinePassed && (
          <p className="font-mono text-sm text-amber-300">
            The response window has closed — you can no longer respond.
          </p>
        )}
        {c.status === Status.SERVED && !isDefendant && !deadlinePassed && (
          <p className="border border-border bg-surface p-4 text-sm text-muted">
            Awaiting the respondent&apos;s reply. Adjudication unlocks after the
            deadline if they stay silent.
          </p>
        )}
        {canAdjudicate && (
          <AdjudicateButton
            caseId={c.id}
            byDefault={c.status === Status.SERVED}
            onResolved={load}
          />
        )}
      </section>

      {/* Service notice */}
      {c.service_template && (
        <details className="mt-10 border border-border bg-surface p-6">
          <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
            Notice of dispute · service template
          </summary>
          <pre className="mt-4 whitespace-pre-wrap font-mono text-xs leading-relaxed text-muted">
            {c.service_template}
          </pre>
        </details>
      )}
    </Container>
  );
}
