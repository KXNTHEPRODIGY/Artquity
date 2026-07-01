import { TransactionStatus } from "genlayer-js/types";
import {
  CONTRACT_ADDRESS,
  getReadClient,
  toCalldataAddress,
  type CaseFull,
  type CaseSummary,
  type Client,
} from "./genlayer";

// The exact hash type the client's receipt waiter expects (branded by genlayer-js).
type TxHash = Parameters<Client["waitForTransactionReceipt"]>[0]["hash"];

// User-facing errors the contract raises via gl.vm.UserError. GenLayer embeds
// the raw message inside a large genvm.VMResult dump; we surface it cleanly.
const CONTRACT_USER_ERRORS = [
  "No such case",
  "Both artwork and collection URLs are required",
  "Defendant address is required",
  "Plaintiff and defendant must be different addresses",
  "Case is not open for response",
  "Only the named defendant may respond to this case",
  "Defendant evidence URL is required",
  "Case already resolved",
  "Defendant still has time to respond",
  "Case is not ready for adjudication",
];

export function isNoSuchCase(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  return msg.includes("No such case");
}

/** Map raw RPC / GenVM errors to actionable messages for the UI. */
export function friendlyError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (/contract (code )?not found/i.test(msg)) {
    return (
      `No contract found at ${CONTRACT_ADDRESS} on Testnet Bradbury. ` +
      `That address may be a Studionet deployment — Studionet and Bradbury are ` +
      `separate chains. Deploy ArtDisputeRegistry to Bradbury, set ` +
      `NEXT_PUBLIC_CONTRACT_ADDRESS in web/.env.local to the new address, and ` +
      `restart the dev server.`
    );
  }
  for (const known of CONTRACT_USER_ERRORS) {
    if (msg.includes(known)) return known;
  }
  if (/genvm|VMResult|execution failed/i.test(msg)) {
    return "The contract rejected this call. See the browser console for the full GenVM trace.";
  }
  return msg;
}

/** Parse a view-method return that may arrive as a JSON string or already-parsed value. */
function parseJson<T>(raw: unknown): T {
  if (typeof raw === "string") return JSON.parse(raw) as T;
  return raw as T;
}

export async function listCases(client?: Client): Promise<CaseSummary[]> {
  const c = client ?? getReadClient();
  const raw = await c.readContract({
    address: CONTRACT_ADDRESS,
    functionName: "list_cases",
    args: [],
  });
  return parseJson<CaseSummary[]>(raw);
}

export async function getCase(id: number, client?: Client): Promise<CaseFull> {
  const c = client ?? getReadClient();
  const raw = await c.readContract({
    address: CONTRACT_ADDRESS,
    functionName: "get_case",
    args: [BigInt(id)],
  });
  return parseJson<CaseFull>(raw);
}

export async function getCaseCount(client?: Client): Promise<number> {
  const c = client ?? getReadClient();
  const raw = await c.readContract({
    address: CONTRACT_ADDRESS,
    functionName: "get_case_count",
    args: [],
  });
  return Number(raw);
}

export interface FileClaimInput {
  defendant: string;
  originalArtUrl: string;
  collectionUrl: string;
  plaintiffArgument: string;
}

// The write client is already bound to the connected account (see getWriteClient),
// so writeContract picks up the signer from config — no `account` arg needed.

export async function fileClaim(
  client: Client,
  input: FileClaimInput,
): Promise<TxHash> {
  return client.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: "file_claim",
    args: [
      toCalldataAddress(input.defendant),
      input.originalArtUrl,
      input.collectionUrl,
      input.plaintiffArgument,
    ],
    value: 0n,
  });
}

export interface RespondInput {
  caseId: number;
  evidenceUrl: string;
  argument: string;
}

export async function respond(
  client: Client,
  input: RespondInput,
): Promise<TxHash> {
  return client.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: "respond",
    args: [BigInt(input.caseId), input.evidenceUrl, input.argument],
    value: 0n,
  });
}

export async function adjudicate(client: Client, caseId: number): Promise<TxHash> {
  return client.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: "adjudicate",
    args: [BigInt(caseId)],
    value: 0n,
  });
}

/**
 * Wait for a write tx to reach ACCEPTED (state is applied at acceptance on
 * GenLayer) and surface a reverted execution as a thrown error.
 */
export async function waitForTx(client: Client, hash: TxHash) {
  const receipt = await client.waitForTransactionReceipt({
    hash,
    status: TransactionStatus.ACCEPTED,
  });
  if (receipt?.txExecutionResultName === "FINISHED_WITH_ERROR") {
    throw new Error("Transaction reverted (contract raised an error).");
  }
  return receipt;
}
