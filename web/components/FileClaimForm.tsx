"use client";

import { useState } from "react";
import Link from "next/link";
import { useWallet } from "./WalletProvider";
import { fileClaim, friendlyError, getCaseCount, waitForTx } from "@/lib/contract";
import { explorerTxUrl, sameAddr, shortAddr } from "@/lib/genlayer";
import { Button } from "./ui";

type Phase = "idle" | "submitting" | "confirming" | "success" | "error";

const isAddress = (v: string) => /^0x[0-9a-fA-F]{40}$/.test(v.trim());
const isUrl = (v: string) => /^https?:\/\/\S+$/i.test(v.trim());

function composeArgument(input: {
  description: string;
  nftContract: string;
  tokenId: string;
  evidence: string;
}): string {
  const parts: string[] = [];
  const ref: string[] = [];
  if (input.nftContract.trim()) ref.push(`contract ${input.nftContract.trim()}`);
  if (input.tokenId.trim()) ref.push(`token #${input.tokenId.trim()}`);
  if (ref.length) parts.push(`NFT reference: ${ref.join(", ")}.`);
  parts.push(input.description.trim());
  if (input.evidence.trim())
    parts.push(`Supporting evidence: ${input.evidence.trim()}`);
  return parts.join("\n\n");
}

function Field({
  label,
  hint,
  error,
  children,
  optional,
}: {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
          {label}
          {optional && <span className="ml-2 text-faint">optional</span>}
        </span>
        {error && <span className="text-[11px] text-red-400">{error}</span>}
      </div>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-faint">{hint}</p>}
    </label>
  );
}

const INPUT =
  "w-full border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-faint focus:border-accent";

export function FileClaimForm() {
  const { account, client, connect } = useWallet();

  const [defendant, setDefendant] = useState("");
  const [originalArtUrl, setOriginalArtUrl] = useState("");
  const [collectionUrl, setCollectionUrl] = useState("");
  const [nftContract, setNftContract] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState("");

  const [phase, setPhase] = useState<Phase>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [newId, setNewId] = useState<number | null>(null);

  const busy = phase === "submitting" || phase === "confirming";

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!isAddress(defendant)) e.defendant = "Enter a valid 0x… address";
    else if (sameAddr(defendant, account)) e.defendant = "Can't be your own wallet";
    if (!isUrl(originalArtUrl)) e.originalArtUrl = "Enter a direct image URL";
    if (!isUrl(collectionUrl)) e.collectionUrl = "Enter a direct image URL";
    if (nftContract.trim() && !isAddress(nftContract))
      e.nftContract = "Invalid address";
    if (!description.trim()) e.description = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    setFormError(null);
    if (!client || !account) {
      connect();
      return;
    }
    if (!validate()) return;

    try {
      setPhase("submitting");
      const before = await getCaseCount(client).catch(() => null);
      const hash = await fileClaim(client, {
        defendant,
        originalArtUrl,
        collectionUrl,
        plaintiffArgument: composeArgument({
          description,
          nftContract,
          tokenId,
          evidence,
        }),
      });
      setTxHash(hash);
      setPhase("confirming");
      await waitForTx(client, hash);
      setNewId(before);
      setPhase("success");
    } catch (e) {
      setFormError(friendlyError(e));
      setPhase("error");
    }
  }

  if (phase === "success") {
    return (
      <div className="border border-accent/40 bg-accent-soft p-8">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center border border-accent text-accent">
            ✓
          </span>
          <h2 className="text-xl font-bold tracking-tight">Claim filed</h2>
        </div>
        <p className="mt-4 text-sm text-muted">
          Your claim was submitted and screened at intake by the Intelligent
          Contract. Open the dispute to see whether it was served or rejected.
        </p>
        {txHash && (
          <a
            href={explorerTxUrl(txHash)}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 font-mono text-xs text-accent hover:underline"
          >
            tx {shortAddr(txHash)} ↗
          </a>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          {newId != null && (
            <Button href={`/disputes/${newId}`} variant="accent">
              View dispute →
            </Button>
          )}
          <Button href="/disputes" variant="outline">
            All disputes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      {/* Parties */}
      <fieldset className="space-y-5 border border-border bg-surface p-6">
        <legend className="px-2 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
          Parties
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
              Claimant
            </span>
            <div className="mt-2 border border-border bg-bg-soft px-3.5 py-2.5 font-mono text-sm text-muted">
              {account ? shortAddr(account) : "Connect wallet to file"}
            </div>
          </div>
          <Field label="Respondent wallet" error={errors.defendant}>
            <input
              className={INPUT}
              placeholder="0x… the wallet you're accusing"
              value={defendant}
              onChange={(e) => setDefendant(e.target.value)}
            />
          </Field>
        </div>
      </fieldset>

      {/* Evidence */}
      <fieldset className="space-y-5 border border-border bg-surface p-6">
        <legend className="px-2 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
          Evidence
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Your original artwork"
            error={errors.originalArtUrl}
            hint="Direct image URL (.jpg / .png)"
          >
            <input
              className={INPUT}
              placeholder="https://…/original.jpg"
              value={originalArtUrl}
              onChange={(e) => setOriginalArtUrl(e.target.value)}
            />
          </Field>
          <Field
            label="Accused NFT / collection"
            error={errors.collectionUrl}
            hint="Direct image URL of the infringing piece"
          >
            <input
              className={INPUT}
              placeholder="https://…/collection.png"
              value={collectionUrl}
              onChange={(e) => setCollectionUrl(e.target.value)}
            />
          </Field>
          <Field label="NFT contract address" optional error={errors.nftContract}>
            <input
              className={INPUT}
              placeholder="0x…"
              value={nftContract}
              onChange={(e) => setNftContract(e.target.value)}
            />
          </Field>
          <Field label="Token ID" optional>
            <input
              className={INPUT}
              placeholder="e.g. 1234"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
            />
          </Field>
        </div>
      </fieldset>

      {/* Claim */}
      <fieldset className="space-y-5 border border-border bg-surface p-6">
        <legend className="px-2 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
          The claim
        </legend>
        <Field
          label="Description of infringement"
          error={errors.description}
          hint="Explain how the collection copies or uses your work."
        >
          <textarea
            className={`${INPUT} min-h-32 resize-y`}
            placeholder="Describe the alleged infringement…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
        <Field
          label="Evidence links / URIs"
          optional
          hint="IPFS URIs, marketplace listings, prior-art links — comma separated."
        >
          <input
            className={INPUT}
            placeholder="ipfs://…, https://opensea.io/…"
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
          />
        </Field>
      </fieldset>

      {formError && (
        <p className="border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-300">
          {formError}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" variant="accent" disabled={busy}>
          {!account
            ? "Connect wallet to file"
            : phase === "submitting"
              ? "Confirm in wallet…"
              : phase === "confirming"
                ? "Reaching consensus…"
                : "Submit claim"}
        </Button>
        {phase === "confirming" && (
          <span className="flex items-center gap-2 font-mono text-xs text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent dot-live" />
            Validators are screening the evidence — this can take a bit.
          </span>
        )}
        <Link
          href="/disputes"
          className="font-mono text-xs text-faint hover:text-muted"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
