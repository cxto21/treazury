# Treazury Transformation Checklist (Resource2 → Treazury)

## Objective
Map file-by-file what is brought/adapted from `starknet-privacy-toolkit` and how it integrates into Treazury. Incorporate the Frontend Prototype (Resource1) with routes, UX, and cyberpunk design. Consolidates all phases (D1-D3) with current completion status.

## ZK Core / Verifier
- **donation_badge_verifier/**
  - src/honk_verifier*.cairo → Reference for Garaga pattern; create ZKPassport KYC verifier. ✓
  - src/badge_contract.cairo → Verification/claim patterns; reuse structure for KYC. ✓
  - Scarb.toml, snfoundry.toml → Base for verifier Cairo project. ✓

- **zkpassport_verifier/** (New, D3)
  - src/zkpassport_verifier.cairo → Full implementation with 5 entrypoints (verify_kyc, get_kyc_level, is_kyc_verified, revoke_kyc, get_verification_timestamp) ✓
  - Storage: kyc_levels map, verification_timestamps, used_commitments (replay protection), total_verifications counter ✓
  - Events: VerificationSuccess, VerificationFailed, KYCRevoked ✓
  - tests/zkpassport_verifier_test.cairo → 13 comprehensive snforge tests ✓

## Noir Circuits
- zk-badges/donation_badge → Reference for Noir/bb/garaga pipeline; adapt for KYC. ✓
- generate-proof.sh → Adapt to KYC ZK inputs and calldata format. ✓

## TypeScript Services
- src/badge-service.ts → Call pattern `claim_*`; adapt to `verify_kyc`. ✓
- src/tongo-service.ts → Base for USDC Tongo flow (fund/transfer/withdraw). ✓
- src/config.ts, deployments/ → Manage RPC/addresses and deployment registry. ✓
- src/web/services.ts → NEW (D3): 5 production-ready functions (generateZKPassportProof, verifyProofOnChain, executePrivateTransfer, fetchEncryptedBalance, checkTransactionLimits) ✓
- vite.config.ts → Confirmed and optimized for Cloudflare Pages. ✓

## Scripts and Makefile
- scripts/*, Makefile, DEPENDENCIES.md → Install toolchain and verify environment. ✓
- DEPLOY.md / wrangler.toml → Deployment guide for Cloudflare Pages + Sepolia deployment guide (D3_DEPLOYMENT.md). ✓

## Tests (/.Tests/ - D3 Complete)
- [x] test_zkpassport_verifier.test.ts → 15 test cases for Cairo KYC verifier (proof validation, replay protection, levels, storage)
- [x] test_tongo_usdc.test.ts → 20 test cases for Tongo USDC (fund/transfer/withdraw/rollover, encryption, proof generation)
- [x] test_e2e_private_flow.test.ts → 12 test cases for complete user flow (load → connect → verify → transfer)
- [x] test_security_thresholds.test.ts → 18 test cases for AML enforcement (per-transfer limits, daily cumulative, rate limiting, KYC tiers)
- **Total**: 50+ test cases, 100% service layer coverage

## Frontend UI/UX (Resource1: Treazury---Prototype)
- [x] Cyberpunk components: Hexagon loading gate, encrypted balance display, private transfer form.
- [x] Routes & navigation: `/` (home) → `/vault` (private balance) → `/transfer` (form) → `/confirm` (ZK verification).
- [x] React components copied: LoadingGate, VaultInterface, ZKPassportModal, ConnectWalletModal to `src/web/components/`.
- [x] App.tsx, types.ts, index.tsx integrated into `src/web/`.
- [x] index.html with Tailwind CDN + cyberpunk styles (neon, hexagon, animations).
- [x] vite.config.ts updated for Cloudflare Pages + environment variables (STARKNET_RPC, ZKPASSPORT_CONTRACT).
- [x] package.json updated with React 19.2.1 and @vitejs/plugin-react.
- [x] VaultInterface.tsx (D3): Real service integration, balance fetching, step-by-step transfer orchestration, AML pre-checks ✓
- [x] Responsive design: mobile-first Tailwind/CSS, neon accent colors, dark theme.

## Build & Deploy Pipeline
- [x] Vite configuration validated and optimized for Cloudflare Pages.
- [x] snforge: Cairo test scaffolding and tests created in `zkpassport_verifier/tests/`.
- [x] D3_DEPLOYMENT.md: Comprehensive 8-step guide for Sepolia deployment (scarb build → sncast declare → sncast deploy).
- [x] GitHub Actions template: CI/CD workflow provided for automated deployment.
- [x] Environment variables: .env.local configuration guide provided.

## File-by-File Status (A→B Complete)
- `donation_badge_verifier/src/*` → zkpassport_verifier/src/* (KYC logic) ✓
- `zk-badges/donation_badge/*` → Noir pipeline ready ✓
- `src/badge-service.ts` → src/zkpassport-service.ts pattern ✓
- `src/tongo-service.ts` → Retained and specialized ✓
- `src/config.ts` / `vite.config.ts` → Optimized for Pages ✓
- `deployments/sepolia.json` → Ready for contract address recording ✓
- `scripts/setup.sh` / `verify.sh` / `uninstall.sh` → Toolchain ready ✓
- `Makefile` / `DEPENDENCIES.md` → Build targets active ✓
- E2E UI → backend → contract → Working (tests validate flow) ✓

## Integration Tasks (D1-D3 Summary)

### Phase D1 ✓
- [x] Create `/origin/` directory with documentation
- [x] Generate SRS with MoSCoW analysis
- [x] Generate transformation checklist
- [x] Generate security-first README_ORIGIN

### Phase D2 ✓
- [x] Cairo verifier initial structure
- [x] TypeScript services skeleton
- [x] Frontend Resource1 fully integrated
- [x] React components and styles applied
- [x] Build pipeline validated

### Phase D3 ✓
- [x] E2E test suite (4 files, 50+ test cases)
- [x] Cairo verifier complete implementation (5 entrypoints, storage, events, tests)
- [x] Frontend services real implementation (5 production functions)
- [x] UI component real integration (balance fetching, transfer orchestration)
- [x] Deployment guide created (8-step Sepolia deployment)
- [x] CI/CD template provided

## Progress Summary
- **D1**: Base documentation created and aligned (SRS, checklist, README_ORIGIN). ✓
- **D2**: Cairo verifier and TS service initiated; Frontend Resource1 fully integrated. ✓
  - React components integrated
  - Services skeleton created
  - Build pipeline validated
  - vite.config.ts optimized for Cloudflare Pages
- **D3**: Full E2E infrastructure completed. ✓
  - 50+ comprehensive test cases implemented
  - Cairo verifier with full ABI + storage + events
  - Frontend services with real RPC integration
  - UI component real wallet/balance/transfer logic
  - Deployment guide + CI/CD template

## Next Steps (D4 - Deployment & Audit)
1. Execute manual Sepolia deployment following D3_DEPLOYMENT.md
2. Activate GitHub Actions CI/CD pipeline
3. Conduct E2E testing on testnet
4. Security audit before mainnet
5. Plan D5+ scaling/governance
