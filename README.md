<<<<<<< HEAD
# Artquity

An NFT / art-IP adjudication dApp on GenLayer. A plaintiff who believes
their artwork was copied into an NFT collection files a claim against a
named defendant wallet; an Intelligent Contract screens the claim with a
multimodal LLM, lets the defendant respond, then weighs both sides via
validator consensus and records a binding verdict on-chain.

## Architecture

- `contracts/art_dispute_registry.py` — the Intelligent Contract
- Frontend (Phase 2, separate) — Next.js + genlayer-js

## Phase 1: Contract deployment

1. Lint locally:

   ```
   npm install -g genlayer
   genvm-lint check contracts/art_dispute_registry.py
   ```

2. Open https://studio.genlayer.com in a browser. Use the account
   selector to pick an account; click the 💧 button to fund it.

3. Paste the contents of `contracts/art_dispute_registry.py` into
   Studio's editor. Studio auto-detects the `response_window_seconds`
   constructor parameter from `__init__`. Default value (259200 seconds
   = 3 days) is fine for testing; set lower for default-judgment tests.

4. Click **Deploy**. Copy the resulting contract address.

5. Smoke-test via Studio's Execute Transaction UI:
   - As Account 1: `file_claim(defendant=<account_2_address>,
     original_art_url=<direct image URL>,
     collection_url=<direct image URL>,
     plaintiff_argument=<text>)`
   - Watch Node Logs — leader fetches both images, calls the vision LLM,
     validators reach consensus. Read `get_case(0)` after; status should
     be `1` (SERVED) or `0` (REJECTED).
   - As Account 2: `respond(case_id=0,
     defendant_evidence_url=<direct image URL>,
     defendant_argument=<text>)`. Status → `2` (RESPONDED).
   - As any account: `adjudicate(case_id=0)`. Status → `3` (RESOLVED),
     `verdict` is `1` (plaintiff) or `2` (defendant), `final_reasoning`
     carries the LLM's written justification.

6. Save the contract address into `.env.local`:

   ```
   NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
   ```

## Important testing notes

- Use **direct image URLs** (`.jpg`/`.png`), not Google Image Search
  results pages. The latter produce oversized screenshots that can
  blow `exec_prompt`'s encoder.
- Studionet state is **temporary** — your contract will eventually be
  wiped. For production submission, redeploy to Testnet Bradbury.
- Only the wallet named as `defendant` in `file_claim` may call
  `respond` for that case. This is enforced on-chain.

## Networks

- **Studionet** (dev): https://studio.genlayer.com/api · chainId 61999
- **Testnet Bradbury** (submission): https://rpc-bradbury.genlayer.com ·
  chainId 4221 · faucet at https://testnet-faucet.genlayer.foundation

## Phase 2: Frontend (`web/`)

A Next.js (App Router) + genlayer-js dApp that drives the full case lifecycle:
file a claim, browse the docket, view a case with its evidence images and the
contract's LLM reasoning, respond as the named defendant, and adjudicate.

- Wallet: **Privy** (embedded wallet via email/social, or an external wallet).
  No browser-extension wallet required — Privy's EIP-1193 provider signs the
  GenLayer transactions directly (on Bradbury a write is a standard EVM tx to
  the consensus contract, so no MetaMask Snap is involved).
- Network: **Testnet Bradbury** (chainId 4221).

```
cd web
cp .env.local.example .env.local   # set the two NEXT_PUBLIC_* vars below
npm install
npm run dev                         # http://localhost:3000
```

Required env vars in `web/.env.local`:

- `NEXT_PUBLIC_CONTRACT_ADDRESS` — the deployed `ArtDisputeRegistry` address on
  Bradbury.
- `NEXT_PUBLIC_PRIVY_APP_ID` — your Privy app ID (Privy dashboard → App
  settings → App ID). Without it the app runs but wallet login is disabled.

Fund the logged-in wallet's address with Bradbury GEN via the faucet
(https://testnet-faucet.genlayer.foundation) before filing a claim.

Notes:
- Use **direct** image URLs (`.jpg`/`.png`) for artwork/collection/evidence —
  the same constraint as the contract's `web.render` screenshots.
- `file_claim` and `adjudicate` run multimodal LLM + validator consensus, so
  those transactions take noticeably longer than a plain write to confirm.
=======
# Artquity
>>>>>>> dba5caf76aa41f81363aed2c52a21e167ec90234
