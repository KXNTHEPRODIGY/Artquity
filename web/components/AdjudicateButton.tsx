"use client";

import { useState } from "react";
import { useWallet } from "./WalletProvider";
import { adjudicate, friendlyError, waitForTx } from "@/lib/contract";
import { Button } from "./ui";

export function AdjudicateButton({
  caseId,
  byDefault,
  onResolved,
}: {
  caseId: number;
  byDefault: boolean;
  onResolved: () => void;
}) {
  const { account, client, connect } = useWallet();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setError(null);
    if (!client || !account) {
      connect();
      return;
    }
    setBusy(true);
    try {
      const hash = await adjudicate(client, caseId);
      await waitForTx(client, hash);
      onResolved();
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border border-accent/30 bg-accent-soft p-6">
      <h3 className="text-base font-semibold tracking-tight">
        Ready for adjudication
      </h3>
      <p className="mt-1 text-sm text-muted">
        {byDefault
          ? "The response deadline passed with no reply. The case will be judged on the claimant's evidence alone."
          : "Both sides are on record. Trigger the Intelligent Contract to weigh the evidence under validator consensus."}
      </p>
      <div className="mt-5 flex items-center gap-3">
        <Button onClick={run} variant="accent" disabled={busy}>
          {busy
            ? "Reaching consensus…"
            : byDefault
              ? "Adjudicate by default"
              : "Adjudicate case"}
        </Button>
        {busy && (
          <span className="flex items-center gap-2 font-mono text-xs text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent dot-live" />
            Running the multimodal model…
          </span>
        )}
      </div>
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </div>
  );
}
