"use client";

import { CONTRACT_ADDRESS } from "@/lib/genlayer";
import { Container } from "./ui";

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

export function SetupNotice() {
  const missing: string[] = [];
  if (!CONTRACT_ADDRESS) missing.push("NEXT_PUBLIC_CONTRACT_ADDRESS");
  if (!PRIVY_APP_ID) missing.push("NEXT_PUBLIC_PRIVY_APP_ID");
  if (missing.length === 0) return null;

  return (
    <div className="border-b border-amber-500/30 bg-amber-500/5">
      <Container className="py-3">
        <p className="font-mono text-xs text-amber-300">
          Missing env: {missing.join(", ")} — set in{" "}
          <code>web/.env.local</code> and restart the dev server.
        </p>
      </Container>
    </div>
  );
}
