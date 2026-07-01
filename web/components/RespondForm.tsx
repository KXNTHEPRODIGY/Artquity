"use client";

import { useState } from "react";
import { useWallet } from "./WalletProvider";
import { friendlyError, respond, waitForTx } from "@/lib/contract";
import { Button } from "./ui";

const INPUT =
  "w-full border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-faint focus:border-accent";
const LABEL =
  "mb-2 block font-mono text-[11px] uppercase tracking-[0.16em] text-muted";

export function RespondForm({
  caseId,
  onResponded,
}: {
  caseId: number;
  onResponded: () => void;
}) {
  const { account, client } = useWallet();
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [argument, setArgument] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!client || !account) return;
    if (!/^https?:\/\/\S+$/i.test(evidenceUrl.trim())) {
      setError("Enter a direct image URL for your evidence.");
      return;
    }
    setBusy(true);
    try {
      const hash = await respond(client, { caseId, evidenceUrl, argument });
      await waitForTx(client, hash);
      onResponded();
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-5 border border-sky-500/30 bg-sky-500/[0.04] p-6"
    >
      <div>
        <h3 className="text-base font-semibold tracking-tight">
          Respond as respondent
        </h3>
        <p className="mt-1 text-sm text-muted">
          You are the named respondent. Submit your defense before the deadline,
          or the case may be judged by default.
        </p>
      </div>
      <div>
        <label className={LABEL}>Supporting evidence URL</label>
        <input
          className={INPUT}
          placeholder="https://…/evidence.jpg"
          value={evidenceUrl}
          onChange={(e) => setEvidenceUrl(e.target.value)}
        />
      </div>
      <div>
        <label className={LABEL}>Your argument</label>
        <textarea
          className={`${INPUT} min-h-28 resize-y`}
          placeholder="Independent creation, license, fair use…"
          value={argument}
          onChange={(e) => setArgument(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <Button type="submit" variant="accent" disabled={busy}>
        {busy ? "Submitting…" : "Submit response"}
      </Button>
    </form>
  );
}
