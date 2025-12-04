# Treazury - Privacy-First USDC Vault on Starknet

> **A zero-knowledge KYC + encrypted USDC treasury leveraging ZKPassport, Tongo, and Cairo verification**

Treazury is a non-custodial, privacy-preserving vault for USDC on Starknet that enables users to verify identity through zero-knowledge proofs without exposing personal data, manage encrypted USDC balances, and settle transactions verified by Cairo smart contracts—all through a cyberpunk-themed, mobile-first web interface deployed on Cloudflare Pages.

**Core Principle**: Your data stays on your device. The vault trusts math, not intermediaries.

---

## 📊 System Architecture

| Layer | Technology | Purpose |
| ----- | ---------- | ------- |
| **Frontend** | React 19.2.1 + Vite + Tailwind | Cyberpunk UI + proof generation orchestration |
| **Services** | TypeScript + Starknet.js | Bridge between UI and contracts |
| **Proof Generation** | Noir + Barretenberg + Garaga | ZK circuit compilation and STARK proofs |
| **Smart Contracts** | Cairo + Scarb | On-chain proof verification + USDC state |
| **Encrypted State** | Tongo SDK v1.3.0 | Hidden balances + private transfer operations |
| **Hosting** | Cloudflare Pages + Wrangler | Global CDN deployment |

### Data Flow: Private Transfer

```
[User Interface]
       ↓
[1] Click "Generate Proof + Transfer"
       ↓
[Frontend Services]
  ├─ Generate ZK Proof (Noir → Barretenberg → Garaga)
  ├─ Verify on Cairo contract
  └─ Execute encrypted Tongo transfer
       ↓
[Starknet Network]
  ├─ Contract validation
  ├─ State update
  └─ Emit verification event
```

### Deployed Contracts (Sepolia Testnet)

| Component | Address | Purpose |
| --------- | ------- | ------- |
| ZKPassport Verifier | `0x0...` (TBD) | Validates KYC proofs from Noir circuits |
| Tongo Vault | `0x00b4cca30f0f641e01140c1c388f55641f1c3fe5515484e622b6cb91d8cee585` | Manages encrypted USDC balances |
| STRK Token (Testnet) | `0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d` | Gas + funding token |
| USDC (Mainnet) | `0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8` | Target asset for vault |

> **D2 Status**: Frontend + service layer complete. D3 will deploy verifier to Sepolia.

---

## ✅ Development Status

| Phase | Status | Deliverables |
| ----- | ------ | ------------ |
| **D1** | ✅ Complete | Origin docs (SRS, checklist, README) |
| **D2** | ✅ Complete | Frontend integration + Vite build + service layer |
| **D3** | 🔄 In Progress | E2E tests + Sepolia deployment + Noir integration |
| **D4-D8** | 📋 Future | Mainnet, security audit, multi-chain support, DAO |

### D2 Achievements
- ✅ React 19.2.1 + Vite frontend cloned and integrated
- ✅ Service layer (`src/web/services.ts`) bridging UI to backend
- ✅ Vite production build optimized for Cloudflare Pages (3.23 kB HTML, 212 kB assets)
- ✅ TypeScript compilation: 0 errors
- ✅ Dev server running on port 3000
- ✅ English documentation created (CHECKLIST.md, README_ORIGIN.md)

### D3 Tasks (Next)
- [ ] Implement E2E test suite in `/.Tests/`
- [ ] Deploy Cairo verifier to Starknet Sepolia
- [ ] Integrate Noir circuit (replace mock proofs)
- [ ] Connect frontend services to real on-chain verification
- [ ] Setup Cloudflare Pages CI/CD pipeline

---

## 🛠️ Tech Stack

| Component | Version | Purpose |
| --------- | ------- | ------- |
| **Noir** | `1.0.0-beta.1` | ZK circuit compilation |
| **Barretenberg** | `0.67.0` | Proof generation backend |
| **Garaga** | `0.15.5` | Cairo verifier code generation |
| **Cairo / Scarb** | `2.9.2` | Smart contract development |
| **Starknet Foundry** | Latest | Contract testing + deployment |
| **React** | `19.2.1` | Frontend framework |
| **Vite** | `7.2.4` | Build tool + dev server |
| **TypeScript** | `5.9.3` | Type safety |
| **Starknet.js** | `8.9.1` | Blockchain SDK |
| **Tongo SDK** | `1.3.0` | Encrypted wallet operations |
| **Bun** | Latest | Runtime + package manager |
| **Cloudflare Pages** | Latest | Hosting + global CDN |

> **Version Pinning**: Mismatched Noir/Barretenberg/Garaga combinations produce incompatible proofs. See `BADGE_SETUP.md` for troubleshooting.

---

## 📁 Project Structure

```
treazury/
├── src/web/                         # Frontend (React + Vite)
│   ├── App.tsx                      # Root component + lifecycle
│   ├── index.tsx                    # Vite entry point
│   ├── services.ts                  # Backend bridge (6 core functions)
│   ├── types.ts                     # TypeScript interfaces
│   ├── components/
│   │   ├── LoadingGate.tsx          # Hexagon security intro
│   │   ├── VaultInterface.tsx       # Main vault UI
│   │   ├── ZKPassportModal.tsx      # KYC verification flow
│   │   └── ConnectWalletModal.tsx   # Wallet connection
│   └── index.html                   # Static entry (Tailwind CDN)
│
├── src/                             # Backend services
│   ├── zkpassport-service.ts        # Proof orchestration
│   ├── tongo-service.ts             # Encrypted transfers
│   ├── wallet-config.ts             # RPC + network config
│   ├── deployments.ts               # Contract registry
│   ├── types.ts                     # Shared types
│   ├── config.ts                    # App configuration
│   └── badge-service.ts             # Badge contract helpers
│
├── zkpassport_verifier/             # Cairo verifier (Scarb)
│   ├── Scarb.toml
│   ├── src/
│   │   ├── lib.cairo
│   │   ├── zkpassport_verifier.cairo
│   │   └── badge_contract.cairo     # Badge minting contract
│   └── tests/
│       └── zkpassport_verifier_test.cairo
│
├── zk-badges/                       # Noir circuits
│   ├── README.md
│   ├── generate-proof.sh            # One-touch proof pipeline
│   └── donation_badge/
│       ├── Nargo.toml
│       ├── src/main.nr              # Noir circuit logic
│       └── compute_commitment.js    # Poseidon helper
│
├── .Tests/                          # E2E test suite (D3)
│   ├── test_zkpassport_verifier.test.ts
│   ├── test_tongo_usdc.test.ts
│   ├── test_e2e_private_flow.test.ts
│   └── test_security_thresholds.test.ts
│
├── origin/                          # Documentation (English)
│   ├── SRS.md                       # Requirements (MoSCoW)
│   ├── CHECKLIST.md                 # Integration tasks
│   ├── README_ORIGIN.md             # Architecture details
│   ├── D2_SUMMARY.md                # Phase 2 completion
│   └── D3_ROADMAP.md                # Phase 3 planning
│
├── deployments/                     # Contract metadata
│   ├── sepolia.json                 # Sepolia testnet registry
│   └── mainnet.json                 # Mainnet registry (future)
│
├── dist/                            # Production build (Vite output)
├── index.html                       # Vite entry point (root)
├── vite.config.ts                   # Vite configuration
├── tsconfig.json                    # TypeScript + JSX config
├── package.json                     # Dependencies + scripts
├── wrangler.toml                    # Cloudflare Pages config
├── README.md                        # This file (English)
└── LICENSE                          # ISC license
```

### Key Documents

- **[origin/SRS.md](origin/SRS.md)** – Complete requirements specification (MoSCoW analysis)
- **[origin/CHECKLIST.md](origin/CHECKLIST.md)** – Integration tasks (Resource2 → Treazury mapping)
- **[origin/README_ORIGIN.md](origin/README_ORIGIN.md)** – Detailed architecture overview
- **[origin/D2_SUMMARY.md](origin/D2_SUMMARY.md)** – Phase 2 completion report with metrics
- **[origin/D3_ROADMAP.md](origin/D3_ROADMAP.md)** – Phase 3 detailed planning
- **[BADGE_SETUP.md](BADGE_SETUP.md)** – Toolchain setup + troubleshooting
- **[DEPLOY.md](DEPLOY.md)** – Deployment policy + procedure
- **[zk-badges/README.md](zk-badges/README.md)** – Noir circuit guide
- **[donation_badge_verifier/README.md](donation_badge_verifier/README.md)** – Cairo verifier guide

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun runtime
- Braavos / Argent X wallet (for testnet)
- STRK (testnet) or USDC (mainnet)

### Installation

```bash
git clone https://github.com/cxto21/treazury.git
cd treazury
bun install
```

### Local Development

```bash
# Development server (http://localhost:3000)
bun run dev:web

# Type checking
bun run type-check

# Production build
bun run build:web
```

### Environment Setup

Create `.env.local`:
```bash
STARKNET_RPC=https://starknet-sepolia.public.blastapi.io
STARKNET_CHAIN_ID=SN_SEPOLIA
ZKPASSPORT_CONTRACT=0x0...  # Will be set after deploy
TONGO_CONTRACT=0x00b4cca30f0f641e01140c1c388f55641f1c3fe5515484e622b6cb91d8cee585
```

---

## Generating Proofs Locally

> macOS bb binaries are flaky. For deterministic results, use GitHub Codespaces or any Linux VM with ≥8 GB RAM as documented in `BADGE_SETUP.md`.

```bash
cd zk-badges
./generate-proof.sh \
  --amount 1000 \
  --threshold 1000 \
  --donor-secret hunter2 \
  --tier 1
```

The script performs:

1. Poseidon commitment via `compute_commitment.js`
2. `nargo compile` + `nargo execute witness`
3. `bb prove` + `bb write_vk`
4. `garaga calldata --system ultra_keccak_honk --format starkli`

Outputs land in `zk-badges/donation_badge/target` plus `zk-badges/calldata.txt`.

---

## Contract Deployment + Verification

1. **Build verifier project**
   ```bash
   cd donation_badge_verifier
   scarb build
   ```

2. **Declare + deploy via sncast**
   ```bash
   sncast --profile sepolia declare \
     --contract target/release/donation_badge_verifier_UltraKeccakHonkVerifier.contract_class.json

   sncast --profile sepolia deploy \
     --class-hash <verifier_class_hash>
   ```

3. **Deploy badge contract (takes verifier address as constructor arg).**

4. **Record everything in `deployments/sepolia.json`.**

5. **Test verification**
   ```bash
   garaga calldata --system ultra_keccak_honk \
     --vk zk-badges/donation_badge/target/vk \
     --proof zk-badges/donation_badge/target/proof \
     --format starkli > zk-badges/calldata.txt

   sncast --profile sepolia call \
     --contract-address <verifier_addr> \
     --function verify_ultra_keccak_honk_proof \
     --calldata $(cat zk-badges/calldata.txt)
   ```
   When the call returns `0x1`, the proof is valid on-chain.

---

## Claiming a Badge

The `DonationBadge::claim_badge` entrypoint expects:

1. `full_proof_with_hints: Span<felt252>` – the Garaga calldata array.
2. `threshold: u256`
3. `donation_commitment: u256`
4. `badge_tier: u8`

Example invocation (once Sepolia account has STRK for fees):

```bash
cd donation_badge_verifier
PROOF_CALLDATA=$(cat ../zk-badges/calldata.txt)

sncast --profile sepolia invoke \
  --contract-address 0x077ca6f2ee4624e51ed6ea6d5ca292889ca7437a0c887bf0d63f055f42ad7010 \
  --function claim_badge \
  --calldata $PROOF_CALLDATA \
             1000 0 \
             0x4e18cb16fc23b735e3a2022c1e422ef4 0x1947661d0c48f766f31005bb473a16ad \
             1
```

After the transaction is accepted, `sncast call --function get_badge_tier` should return `1` for the caller.

---

## Frontend + API

### API (`api/generate-proof.ts`)
Runs under Bun; it shells out to Noir/bb/Garaga and streams the calldata back to the client. Ensure the host machine has the toolchain installed and reachable in `$PATH`.

```bash
bun run api
```

POST payload:
```json
{
  "donation_amount": 1500,
  "threshold": 1000,
  "donor_secret": "hunter2",
  "badge_tier": 2
}
```
Response contains `{ "calldata": [ "...felt array..." ] }`.

### Frontend (`src/web/index.html`)
Served via Vite:
```bash
bun run dev
```
Key facts:
- The Tongo card honors the network toggle (Mainnet = USDC, Sepolia = STRK).
- The badge section is always visible once a wallet connects and now shows an explicit "Sepolia only" banner.
- `badge-service.ts` instantiates a Sepolia `RpcProvider` under the hood, so badge generation/claims never touch mainnet until we deploy mainnet badge contracts.
- Contract addresses are fetched from `src/deployments.ts`, which reads all JSON files under `deployments/`.

---

## Deployment Records

- All contract declarations and deployments must be captured in `deployments/<network>.json`.
- Each entry records class hashes, addresses, tx hashes, and artifact locations.
- `DEPLOY.md` documents the policy so that frontend/backend consumers share consistent metadata.

This approach keeps the repo network-agnostic—adding a mainnet deployment is just another JSON file.

---

## Testing Matrix

| Component | Command |
| --------- | ------- |
| Noir circuit unit test | `cd zk-badges/donation_badge && nargo test` |
| Cairo verifier build   | `cd donation_badge_verifier && scarb build` |
| Badge contract tests   | `snforge test` (tests WIP; the contract currently relies on live verifier interaction) |
| Frontend type-check    | `bun run type-check` |
| End-to-end proof       | `./zk-badges/generate-proof.sh` followed by `sncast call` as shown above |

---

## Security & Privacy Notes

- Proof commitments are Poseidon hashes over `(amount, donor_secret)`; the badge contract stores only the hashed commitment.
- `DonationBadge` prevents commitment reuse, enforces tier monotonicity, and exposes on-chain badge counts for analytics.
- All calldata arrays are validated for public input ordering before upgrading a badge.
- Use fresh STRK-funded Sepolia accounts for experiments; never store production keys in this repository (the `.secrets` file is for demo purposes only).

---

## Roadmap Ideas

- Add recursive proofs for multi-donation attestations.
- Build a backend service that queues proof jobs (to avoid running `bb` client-side).
- Expose REST/GraphQL APIs that wallets can consume for badge status.
- Port the verifier + badge combo to Starknet mainnet when proof generation is production-ready.

---

## Tongo Private Donation Demo

This repository is intentionally dual-purpose: it is both a Garaga/Noir badge tutorial **and** a living walkthrough of Tongo’s private donation rails. The Tongo integration is fully supported (not legacy) and demonstrates how privacy-preserving wallets coexist with ZK attestations inside one Starknet UI.

### Feature Overview

- Wallet integration with Braavos and Argent X.
- Network support for Starknet Mainnet (USDC) and Sepolia testnet (STRK).
- Fund → Transfer → Rollover → Withdraw operations over encrypted balances.
- Real-time balance display, transaction logging, and key-backup helpers.

### Technology Stack

- **Tongo SDK v1.3.0** – zero-knowledge proof generation + encryption.
- **Starknet.js v8.9.1** and **get-starknet v3.3.3** – wallet + chain interactions.
- **Vite + Bun + TypeScript** – application runtime/build.

### Prerequisites

- Bun runtime (`curl -fsSL https://bun.sh/install | bash`).
- Braavos or Argent X wallet extension.
- USDC (mainnet) or STRK (testnet) for funding.
- Optional Alchemy API keys for custom RPC endpoints.

### Installation

```bash
git clone https://github.com/omarespejel/tongo-ukraine-donations.git
cd tongo-donation-demo
bun install
```

To run the CLI demo, copy `.env.example` to `.env` and fill in `STARKNET_MAINNET_RPC_URL`, `STARKNET_SEPOLIA_RPC_URL`, and (for CLI usage) `STARKNET_ACCOUNT_ADDRESS`/`STARKNET_PRIVATE_KEY`.

### Usage

#### Web Frontend

```bash
bun run dev:web
# open http://localhost:5173
```

1. Connect Braavos or Argent X.
2. The Tongo private key auto-generates and stores in `localStorage`.
3. Choose network (Mainnet USDC or Sepolia STRK) and perform fund/transfer/withdraw operations.

#### CLI Demo

```bash
bun run demo
```

Requires the `.env` values mentioned above.

### Configuration + Contracts

| Network | Tongo Contract | Token | Notes |
| ------- | -------------- | ----- | ----- |
| Mainnet | `0x72098b84989a45cc00697431dfba300f1f5d144ae916e98287418af4e548d96` | USDC `0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8` | Matches SDK v1.3.0 |
| Sepolia | `0x00b4cca30f0f641e01140c1c388f55641f1c3fe5515484e622b6cb91d8cee585` | STRK `0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d` | Uses Alchemy RPC |
| Sepolia (Badges) | `DonationBadge` `0x077ca6f2ee4624e51ed6ea6d5ca292889ca7437a0c887bf0d63f055f42ad7010` | N/A | Calls into verifier `0x022b20fef3764d09293c5b377bc399ae7490e60665797ec6654d478d74212669` |

Edit `src/wallet-config.ts` for RPCs; the `.env` file affects CLI usage only.

### How Tongo Works (recap)

- **ElGamal encryption** on Stark curve; balances stored as ciphertexts `Enc[y](b, r)`.
- **Two-balance model** (current vs pending) with rollover.
- **Operations**: Fund (public amount), Transfer (hidden), Rollover (internal), Withdraw (public).
- **Security**: proofs bind `chain_id`, `contract_address`, `nonce`; only whitelisted senders can execute.

### Development Commands

```bash
bun run build        # TypeScript build
bun run build:web   # Vite build
bun run type-check  # tsconfig checks
bun run preview     # Preview production build
```

### Troubleshooting

| Issue | Fix |
| ----- | --- |
| Module not found | `bun install` |
| Private key error | Check `.env` or allow auto-generation |
| RPC failures | Verify `STARKNET_RPC_URL` / `wallet-config.ts` |
| Insufficient balance | Fund the account first |
| CORS errors | Use dev server, not `file://` |

### Additional Notes

- `temp-commitment/` contains throwaway scripts used to benchmark Poseidon commitment logic while designing the badge circuit. Keep them for reference or delete if not needed.
- `test-mainnet-rpc.ts` is a quick CLI that pings the configured RPC endpoints and contract addresses. Use it when rotating provider URLs or debugging wallet issues.
- If you fork this repo and do not rely on those helpers, feel free to remove them—just remember why they existed before stripping them out.
- Address padding quirks: the UI automatically normalizes Starknet addresses.
- Tongo private key differs from Starknet account key; losing it forfeits encrypted funds.
- Manual key generation example:
  ```bash
  node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
  ```

For deeper protocol details, see the official [Tongo docs](https://docs.tongo.cash/).

---

## License

MIT License — see [LICENSE](LICENSE).

For questions or contributions, open an issue or PR referencing the section you’re extending (circuit, verifier, contracts, API, or frontend). This repo is intentionally transparent so other Starknet teams can reuse the tooling for privacy-enhancing governance badges, compliance proofs, or donation attestations.
