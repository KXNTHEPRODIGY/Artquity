Artquity

Autonomous IP dispute adjudication for NFT art, built on GenLayer Intelligent Contracts.

Instead of relying on centralized arbitration or slow off-chain review, disputes over NFT intellectual property are resolved directly on-chain. Validators running LLMs reach consensus on evidence, and the verdict is written to the contract — verifiable, deterministic-by-consensus, and permissionless.

Over 80% of NFTs minted through OpenSea's free tool IN 2022 were flagged by the platform itself as plagiarized, fake, or spam. IP disputes in NFT art are rampant — and adjudicating them is slow, centralized, and manual. Artquity fixes that.

How It Works


Submit evidence — A claimant files a dispute against an NFT, describing the alleged infringement and attaching evidence URIs.
Validators reach consensus — GenLayer's Intelligent Contract runs the adjudication logic across validators, who independently evaluate the claim and converge on an outcome, if the Claimant'c complaint is true the Defandant gets served to defend their collection, if it the claimant's complaint is false it's inatantly rejected.
On-chain verdict — The consensus verdict and reasoning are stored on-chain and surfaced in the registry.



Features


File claims against any NFT with structured evidence
Autonomous adjudication via GenLayer Intelligent Contracts (no human arbiter)
Public dispute registry with status tracking (pending, under review, resolved)
Verdict transparency — adjudication reasoning and validator consensus visible per dispute
Web3-native UI — wallet connect, live on-chain stats, responsive design



Tech Stack


Contracts: GenLayer Intelligent Contracts (Python) — art_dispute_registry.py
Frontend: React + wallet integration
Tooling: GenLayer CLI, genvm-lint



Adjust this section to match your actual frontend stack (Next.js / Vite, styling, etc.).




Getting Started

Prerequisites


Node.js (LTS)
GenLayer CLI


bashnpm install -g genlayer

If genvm-lint or genlayer isn't found after install, ensure npm's global bin is on your PATH:

bashnpm config get prefix
# add <prefix>/bin to your PATH, then restart your shell

Install

bashgit clone https://github.com/<your-username>/art-dispute-registry.git
cd art-dispute-registry
npm install

Run the frontend

bashnpm run dev

Deploy the contract

bash# via GenLayer CLI / Studio — see docs.genlayer.com
genlayer deploy art_dispute_registry.py


Project Structure

.
├── contracts/
│   └── art_dispute_registry.py   # Intelligent Contract: claims, adjudication, verdicts
├── frontend/
│   ├── src/
│   │   ├── pages/                # Home, File Claim, Disputes
│   │   ├── components/           # Button, Card, Badge, StatusPill, ...
│   │   └── lib/                  # contract bindings, wallet
│   └── ...
└── README.md


Usage


Connect wallet on the homepage.
File a Claim — enter the NFT contract address, token ID, infringement description, and evidence links.
Track it in the Disputes registry as validators adjudicate.
View the verdict — consensus outcome and reasoning appear on the dispute detail page once resolved.
