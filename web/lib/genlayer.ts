import { createClient } from "genlayer-js";
import { testnetBradbury } from "genlayer-js/chains";
import { CalldataAddress } from "genlayer-js/types";
import type { GenLayerClient } from "genlayer-js/types";

// The deployed ArtDisputeRegistry address (Testnet Bradbury), injected at build time.
export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ??
  "") as `0x${string}`;

export const CHAIN = testnetBradbury;
export const NETWORK_NAME = "testnetBradbury" as const;
export const EXPLORER_URL = "https://explorer-bradbury.genlayer.com/";

export type Client = GenLayerClient<typeof testnetBradbury>;

/**
 * A wallet-less client used for view calls (list_cases / get_case). Safe to
 * create anywhere; it never touches `window`.
 */
export function getReadClient(): Client {
  return createClient({ chain: testnetBradbury }) as Client;
}

/**
 * A write client bound to a wallet address + its EIP-1193 provider. On Bradbury
 * a GenLayer write is a standard EVM tx to the consensus contract, so any
 * EIP-1193 provider (e.g. a Privy embedded wallet) can sign it — genlayer-js
 * routes eth_sendTransaction/personal_sign to this provider. No Snap required.
 */
export function getWriteClient(
  address: `0x${string}`,
  provider: EthereumProvider,
): Client {
  return createClient({
    chain: testnetBradbury,
    account: address,
    provider,
  }) as Client;
}

/**
 * Encode a hex wallet address as a GenVM Address calldata value so the
 * contract receives a real `Address` (not a bare int). The contract also
 * tolerates the int form, but this is the clean path.
 */
export function toCalldataAddress(hex: string): CalldataAddress {
  const clean = hex.trim().replace(/^0x/i, "");
  if (clean.length !== 40 || /[^0-9a-fA-F]/.test(clean)) {
    throw new Error(`Invalid wallet address: ${hex}`);
  }
  const bytes = new Uint8Array(20);
  for (let i = 0; i < 20; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return new CalldataAddress(bytes);
}

// ---- Domain enums (mirror contracts/art_dispute_registry.py) ----

export const Status = {
  REJECTED: 0,
  SERVED: 1,
  RESPONDED: 2,
  RESOLVED: 3,
} as const;

export const Verdict = {
  NONE: 0,
  FOR_PLAINTIFF: 1,
  FOR_DEFENDANT: 2,
} as const;

export function statusLabel(s: number): string {
  switch (s) {
    case Status.REJECTED:
      return "Rejected at intake";
    case Status.SERVED:
      return "Served — awaiting response";
    case Status.RESPONDED:
      return "Responded — ready to adjudicate";
    case Status.RESOLVED:
      return "Resolved";
    default:
      return "Unknown";
  }
}

export function verdictLabel(v: number): string {
  switch (v) {
    case Verdict.FOR_PLAINTIFF:
      return "For the claimant";
    case Verdict.FOR_DEFENDANT:
      return "For the respondent";
    default:
      return "—";
  }
}

// ---- Case shapes returned by the view methods (JSON strings) ----

export interface CaseSummary {
  id: number;
  plaintiff: string;
  defendant: string;
  status: number;
  verdict: number;
}

export interface CaseFull {
  id: number;
  plaintiff: string;
  defendant: string;
  original_art_url: string;
  collection_url: string;
  plaintiff_argument: string;
  defendant_evidence_url: string;
  defendant_argument: string;
  status: number;
  verdict: number;
  intake_reasoning: string;
  service_template: string;
  final_reasoning: string;
  created_at: number;
  response_deadline: number;
}

export function shortAddr(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function explorerTxUrl(hash: string): string {
  return `${EXPLORER_URL}tx/${hash}`;
}

export function explorerAddressUrl(addr: string): string {
  return `${EXPLORER_URL}address/${addr}`;
}

export function sameAddr(a?: string | null, b?: string | null): boolean {
  if (!a || !b) return false;
  return a.toLowerCase() === b.toLowerCase();
}
