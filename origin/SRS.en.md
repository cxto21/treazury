# Treazury — Security-First SRS (MoSCoW)

## Vision
Treazury is a USDC vault with private transfers on Starknet. It combines ZKPassport (ZK KYC), Tongo (encrypted balance + ZK ops), and Noir/Garaga (STARK) with a mobile cyberpunk UI.

## Scope & Assumptions
- Environment: Linux (Codespaces/DevContainer Ubuntu 24.04), Bun/Node, Starknet toolchain.
- Build/Frontend: Vite present in template; target deployment is Cloudflare Pages.
- Networks: Sepolia first; Mainnet later.
- Privacy: Amounts are not exposed; Poseidon commitments over (amount, secret).
- Security: No secrets in repo; `.secrets` gitignored; RPC authenticated.

## Requirements (MoSCoW)
### MUST
- ZKPassport: frontend → backend flow verifying KYC proof in Cairo.
- Tongo USDC: private transfer integration (encrypted funds, ZK proof, submission).
- Tests: `/.Tests/` with per-file cases (contracts, services, e2e, AML thresholds).

### SHOULD
- Prototype UI: private transfer form, encrypted balance state, proof generation.
- Deployment registry: `deployments/<network>.json` consumed by frontend.
- Build/Deploy pipeline: `vite build` and Cloudflare Pages (Wrangler/CI).

### COULD
- STRK fee automation (basic estimation and provisioning).
- Lightweight API to orchestrate ZK proving server-side.

### WON'T
- Advanced analytics dashboard.
- Heavy proving in browser for production (prefer backend).

## Deliverables
- `/origin/` docs (SRS, checklist, README_origin).
- Treazury-adapted integration of `starknet-privacy-toolkit`.
- Cairo contracts (ZKPassport KYC verifier; reuse patterns from Garaga).
- TypeScript services for Tongo and ZK flows.
- Tests in `/.Tests/` passing at 100%.
- Deployment config: Vite build scripts and Cloudflare Pages guide/CI.

## Acceptance Criteria
- E2E flow: compute commitment, produce proof, verify in contract, execute private Tongo transfer.
- Unit/integration/e2e tests green.
- Security: no repo secrets; input validation; robust error handling.

## Dependencies
- Noir, Barretenberg, Garaga, Scarb, Starknet Foundry, Starknet.js, Tongo SDK.
- `DEPENDENCIES.md` scripts/Makefile for reproducible installs.

## Risks
- ZK version incompatibilities (bb/Garaga/Noir).
- Gas costs / proving latency.
- ZK KYC complexity (demo vs production).
