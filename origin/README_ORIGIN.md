# Treazury - Security-First Architecture (Origin)

## Overview
Treazury is a non-custodial, privacy-first USDC vault deployed on Starknet. It combines:
- **ZKPassport**: Zero-knowledge KYC verification (no data exposure)
- **Tongo**: Encrypted USDC balance management + ZK-proven transfers
- **Cairo Verifier**: Smart contract proof validation
- **Frontend**: Cyberpunk UI for seamless private transfers
- **Deployment**: Vite + Cloudflare Pages (serverless, scalable)

## Architecture Layers

### 1. Frontend Layer (`src/web/`)
**Technology**: React 19.2.1 + Vite + Tailwind CDN
- **Components**:
  - `LoadingGate.tsx` - Hexagon-animated security intro
  - `VaultInterface.tsx` - Main vault interface + transfer form
  - `ZKPassportModal.tsx` - KYC verification flow
  - `ConnectWalletModal.tsx` - Wallet connection (get-starknet)
- **Styling**: Cyberpunk (neon + scanlines + hexagon animations)
- **Responsive**: Mobile-first design

### 2. Service Layer (`src/web/services.ts` + backend)
**Technology**: TypeScript + Starknet.js
- **Frontend Services**:
  - `generateZKPassportProof()` - Generates KYC proofs (Noir → Garaga)
  - `executePrivateTransfer()` - Submits encrypted Tongo transfers
  - `verifyProofOnChain()` - Calls Cairo verifier contract
  - `fetchEncryptedBalance()` - Retrieves encrypted balance
- **Backend Services**:
  - `zkpassport-service.ts` - Proof generation orchestration
  - `tongo-service.ts` - Encrypted USDC operations
  - `wallet-config.ts` - RPC and network management

### 3. Contract Layer (`zkpassport_verifier/`)
**Technology**: Cairo + Scarb + Starknet Foundry
- **Verifier Contract**: `zkpassport_verifier.cairo`
  - `verify_kyc(proof: FullProofWithHints, subject: ContractAddress, level: u32) -> bool`
  - Storage: `kyc_levels: LegacyMap<ContractAddress, u32>`
  - Events: KYC verification events
- **Tests**: `zkpassport_verifier_test.cairo` (snforge)

### 4. Proof Generation (`zk-badges/`)
**Technology**: Noir + Barretenberg + Garaga
- **Circuit**: Custom ZKPassport identity circuit
- **Inputs**: 
  - Public: `subject_address`, `kyc_level`
  - Private: `identity_proof`, `signature`
- **Output**: STARK proof compatible with Cairo verification

### 5. Deployment (`dist/` + Cloudflare)
**Technology**: Vite (build) + Wrangler (deploy) + Pages (hosting)
- **Build**: `vite build` → production artifacts (3.23 kB HTML + 212 kB assets)
- **Hosting**: Cloudflare Pages (global CDN, automatic scaling)
- **Routing**: `_redirects` for SPA routing
- **Environment**: `wrangler.toml` configuration

## Data Flow

### Private Transfer Flow
```
User Interface
  ↓
  └─ [1] Click "Generate ZK Proof + Transfer"
  
Services Layer
  ↓
  ├─ [2] generateZKPassportProof()
  │  └─ Noir circuit → Barretenberg prover → calldata
  │
  ├─ [3] verifyProofOnChain()
  │  └─ Cairo verifier contract → returns bool
  │
  └─ [4] executePrivateTransfer()
     └─ Tongo SDK → encrypted transaction → Starknet RPC
     
Starknet Network
  ├─ Smart Contract Verification
  ├─ Encrypted USDC State Update
  └─ Event: TransferExecuted
```

### Security Model
- **No secret storage**: All keys remain client-side
- **No data exposure**: KYC data never leaves device
- **On-chain verification**: Proofs validated by Cairo contract
- **Encrypted transfers**: Amounts hidden (Poseidon commitments)
- **Rate limiting**: AML thresholds enforced

## File Structure

```
treazury/
├── src/web/                           # Frontend
│   ├── App.tsx                        # React app root + lifecycle
│   ├── index.tsx                      # Vite entry
│   ├── services.ts                    # Frontend ↔ backend bridge
│   ├── types.ts                       # TypeScript interfaces
│   └── components/
│       ├── LoadingGate.tsx
│       ├── VaultInterface.tsx
│       ├── ZKPassportModal.tsx
│       └── ConnectWalletModal.tsx
├── src/
│   ├── zkpassport-service.ts          # Proof orchestration
│   ├── tongo-service.ts               # Encrypted transfers
│   ├── wallet-config.ts               # RPC + network config
│   ├── deployments.ts                 # Contract addresses
│   └── types.ts                       # Backend types
├── zkpassport_verifier/               # Cairo verifier
│   ├── Scarb.toml
│   ├── src/
│   │   ├── lib.cairo
│   │   └── zkpassport_verifier.cairo
│   └── tests/
│       └── zkpassport_verifier_test.cairo
├── zk-badges/                         # Noir circuits
│   ├── donation_badge/
│   │   ├── Nargo.toml
│   │   └── src/main.nr
│   └── generate-proof.sh
├── .Tests/                            # E2E tests
│   ├── test_zkpassport_verifier.test.ts
│   ├── test_tongo_usdc.test.ts
│   ├── test_e2e_private_flow.test.ts
│   └── test_security_thresholds.test.ts
├── dist/                              # Production build
│   ├── index.html
│   ├── assets/
│   └── _redirects
├── origin/                            # Documentation
│   ├── SRS.md                         # Requirements
│   ├── CHECKLIST.md                   # Integration tasks
│   ├── README_ORIGIN.md               # This file
│   ├── D2_SUMMARY.md                  # Phase summary
│   └── D3_ROADMAP.md                  # Next phase
├── index.html                         # Vite entry (Tailwind CDN)
├── vite.config.ts                     # Vite configuration
├── tsconfig.json                      # TypeScript config (JSX + React)
├── package.json                       # Dependencies
├── wrangler.toml                      # Cloudflare config
└── Makefile                           # Build tasks
```

## Development Workflow

### Local Development
```bash
# Install dependencies
bun install

# Start dev server
bun run dev:web                        # http://localhost:3000

# Type checking
bun run type-check                     # TypeScript validation

# Production build
bun run build:web                      # Creates dist/
bun run preview                        # Preview production build
```

### Testing
```bash
# Frontend tests
bun run test:e2e                       # E2E tests in /.Tests/

# Cairo tests
cd zkpassport_verifier
scarb test                             # snforge tests
```

### Deployment
```bash
# Build for Cloudflare
bun run build:deploy                   # Optimized for Pages

# Deploy to testnet
wrangler pages deploy dist --project-name=treazury-sepolia

# Deploy to mainnet (after audit)
wrangler pages deploy dist --project-name=treazury
```

## Environment Variables

```bash
# .env.local

# Starknet
STARKNET_RPC=https://starknet-sepolia.public.blastapi.io
STARKNET_CHAIN_ID=SN_SEPOLIA

# Contracts
ZKPASSPORT_CONTRACT=0x0...             # Will be set after deploy
TONGO_CONTRACT=0x0...                  # Tongo address

# Proving
NOIR_COMPILER_PATH=/path/to/nargo     # Noir binary
BARRETENBERG_PATH=/path/to/bb          # Barretenberg binary

# Optional
GEMINI_API_KEY=...                     # For demo features
```

## Deployment Checklist

- [ ] **D1**: Origin docs created ✓
- [ ] **D2**: Frontend integrated + build working ✓
- [ ] **D3**: E2E tests + Cairo deployed to Sepolia
- [ ] **D4**: Security audit + Mainnet deployment
- [ ] **D5**: Scaling (multi-chain, mobile)
- [ ] **D6**: Governance (DAO, treasury)

## Security Considerations

1. **Private Keys**: Never stored in repo (use wallet provider)
2. **API Keys**: Environment variables only (never hardcoded)
3. **Contract Audit**: Before mainnet deployment
4. **Frontend Audit**: Dependency scanning + code review
5. **AML Compliance**: Rate limiting + threshold enforcement
6. **Privacy Guarantees**: Client-side proof generation

## Performance Targets

- **Core HTML**: < 5 kB (gzipped)
- **React Bundle**: < 15 kB (gzipped)
- **Total Page Load**: < 2s (on 3G)
- **Proof Generation**: < 5s (Barretenberg)
- **Transfer Confirmation**: < 10s (Starknet L2)

## Resources

- **Starknet Docs**: https://docs.starknet.io
- **Cairo**: https://docs.cairo-lang.org
- **Noir**: https://noir-lang.org
- **Tongo SDK**: https://github.com/fatsolutions/tongo-sdk
- **Garaga**: https://github.com/keep-starknet-strange/garaga

## License
ISC (as per package.json)

---

**Last Updated**: Dec 4, 2025  
**Current Phase**: D2 Complete ✓ → D3 Ready  
**Repository**: github.com/cxto21/treazury
