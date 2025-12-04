# Treazury D3 - Sepolia Deployment Guide

> **Phase D3**: Deploy zkpassport_verifier to Starknet Sepolia testnet + Configure CI/CD  
> **Target**: E2E testing on testnet with real on-chain verification  
> **Timeline**: 2-3 days for manual deployment + CI/CD setup

---

## Prerequisites

### System Requirements
- **Bun 1.x** or **Node.js 18+**
- **Scarb 2.9.2** (Cairo build tool)
- **Starknet Foundry** (`sncast`, `snforge`)
- **Python 3.10+** (for Garaga)
- **Noir 1.0.0-beta.1** (for circuit compilation)

### Accounts & Keys
1. **Starknet Sepolia Account** with STRK balance (testnet gas)
   - Use Braavos or Argent X wallet
   - Fund from [Starknet Faucet](https://faucet.goerli.starknet.io/)

2. **Cloudflare Account** (Pages deployment)
   - Project already created: `treazury-sepolia`
   - Wrangler auth configured locally

3. **GitHub Secrets** (for CI/CD)
   - `STARKNET_PRIVATE_KEY`
   - `STARKNET_ACCOUNT_ADDRESS`
   - `STARKNET_RPC_URL`
   - `CLOUDFLARE_API_TOKEN`

---

## Step 1: Build Cairo Verifier Contract

### 1.1 Compile zkpassport_verifier

```bash
cd zkpassport_verifier
scarb build
```

**Expected Output:**
```
Building cairo project at /workspaces/treazury/zkpassport_verifier
Compiling zkpassport_verifier v0.1.0 (/workspaces/treazury/zkpassport_verifier/Scarb.toml) [COMPILING VERSIONINFO]
...
Finished `release` profile [optimized] target(s) in X.XXs
```

**Build Artifacts:**
- `target/release/zkpassport_verifier_UltraKeccakHonkVerifier.contract_class.json`
- `target/release/zkpassport_verifier_UltraKeccakHonkVerifier.casm.json`

### 1.2 Run Cairo Tests (Optional, but Recommended)

```bash
cd zkpassport_verifier
snforge test
```

**Expected Output:**
```
running 13 tests
test test_verify_kyc_with_valid_proof_tier_1 ... ok
test test_verify_kyc_with_valid_proof_tier_2 ... ok
test test_verify_kyc_rejects_empty_proof ... ok
test test_verify_kyc_rejects_invalid_kyc_level_0 ... ok
...
test result: ok. 13 passed; 0 failed
```

---

## Step 2: Deploy Contract to Sepolia

### 2.1 Setup Starknet Credentials

Create or verify `.secrets` file in `zkpassport_verifier/`:

```bash
# Option A: Use existing account
cat .secrets
# OUTPUT should contain:
# STARKNET_ACCOUNT=0x...
# STARKNET_PRIVATE_KEY=0x...

# Option B: Create new testnet account (recommended)
# Use Braavos/Argent X on Sepolia, then export private key
```

### 2.2 Configure snfoundry.toml

**Already configured** (Sepolia profile exists):

```toml
[tool.snforge]

[profiles.sepolia]
account_address = "0x..." # Your testnet account
private_key_path = ".secrets"
rpc_url = "https://starknet-sepolia.public.blastapi.io"
```

### 2.3 Declare Contract on Sepolia

```bash
cd zkpassport_verifier

# Declare (register class hash)
sncast --profile sepolia declare \
  --contract target/release/zkpassport_verifier_UltraKeccakHonkVerifier.contract_class.json \
  --account-address $STARKNET_ACCOUNT \
  --private-key $STARKNET_PRIVATE_KEY
```

**Expected Output:**
```
✓ Contract declared successfully.
Class hash: 0x...verifier_class_hash...
Transaction hash: 0x...tx_hash...
```

**Record the class hash** for deployment.

### 2.4 Deploy Contract Instance

```bash
# Deploy instance
sncast --profile sepolia deploy \
  --class-hash 0x...verifier_class_hash... \
  --constructor-calldata 0x...owner_address...
```

**Expected Output:**
```
✓ Contract deployed successfully.
Contract address: 0x...verifier_contract_address...
Transaction hash: 0x...deploy_tx_hash...
```

**Save these values** to `deployments/sepolia.json`.

### 2.5 Verify Contract on Sepolia

Test contract interaction:

```bash
# Check KYC level (should be 0 for new address)
sncast --profile sepolia call \
  --contract-address 0x...verifier_contract_address... \
  --function get_kyc_level \
  --calldata 0x...test_address...
```

**Expected Output:**
```
[0x0]
```

---

## Step 3: Update Deployment Registry

### 3.1 Record in deployments/sepolia.json

```json
{
  "zkpassportVerifier": {
    "address": "0x...verifier_contract_address...",
    "classHash": "0x...verifier_class_hash...",
    "deploymentTx": "0x...deploy_tx_hash...",
    "declarationTx": "0x...declaration_tx_hash...",
    "blockNumber": 12345,
    "network": "Sepolia",
    "timestamp": "2025-12-04T10:30:00Z",
    "version": "1.0.0",
    "owner": "0x...owner_address...",
    "description": "Garaga Ultra Keccak Honk verifier + KYC contract"
  },
  "tongo": {
    "address": "0x00b4cca30f0f641e01140c1c388f55641f1c3fe5515484e622b6cb91d8cee585",
    "token": "STRK",
    "network": "Sepolia",
    "version": "1.3.0"
  },
  "rpcEndpoint": "https://starknet-sepolia.public.blastapi.io",
  "chainId": "SN_SEPOLIA"
}
```

### 3.2 Update src/deployments.ts

```typescript
// src/deployments.ts
export const DEPLOYMENTS = {
  sepolia: {
    zkpassportVerifier: '0x...verifier_contract_address...',
    tongo: '0x00b4cca30f0f641e01140c1c388f55641f1c3fe5515484e622b6cb91d8cee585',
    rpc: 'https://starknet-sepolia.public.blastapi.io',
  },
  mainnet: {
    zkpassportVerifier: '0x0', // TBD (D4)
    tongo: '0x72098b84989a45cc00697431dfba300f1f5d144ae916e98287418af4e548d96',
    rpc: 'https://starknet-mainnet.public.blastapi.io',
  },
};

export function getDeployment(network: 'sepolia' | 'mainnet') {
  return DEPLOYMENTS[network];
}
```

---

## Step 4: Configure Environment Variables

### 4.1 Frontend .env.local

```bash
# .env.local
VITE_STARKNET_RPC=https://starknet-sepolia.public.blastapi.io
VITE_STARKNET_CHAIN_ID=SN_SEPOLIA
VITE_ZKPASSPORT_CONTRACT=0x...verifier_contract_address...
VITE_TONGO_CONTRACT=0x00b4cca30f0f641e01140c1c388f55641f1c3fe5515484e622b6cb91d8cee585
VITE_API_KEY=<your_api_key>
VITE_GEMINI_API_KEY=<your_gemini_key>
```

### 4.2 Wrangler Configuration

**Already configured** in `wrangler.toml`:

```toml
[env.sepolia]
name = "treazury-sepolia"
route = "treazury-sepolia.pages.dev"
vars = { VITE_STARKNET_RPC = "https://starknet-sepolia.public.blastapi.io", VITE_ZKPASSPORT_CONTRACT = "0x..." }
```

### 4.3 GitHub Secrets

Create in GitHub repo settings → Secrets and variables:

| Secret | Value |
| ------ | ----- |
| `STARKNET_PRIVATE_KEY` | Your testnet account private key |
| `STARKNET_ACCOUNT_ADDRESS` | Your testnet account address |
| `STARKNET_RPC_URL` | https://starknet-sepolia.public.blastapi.io |
| `CLOUDFLARE_API_TOKEN` | Cloudflare Pages API token |
| `ZKPASSPORT_CONTRACT_ADDRESS` | Deployed verifier contract address |

---

## Step 5: Setup CI/CD Pipeline

### 5.1 Create GitHub Actions Workflow

**File:** `.github/workflows/d3-deploy.yml`

```yaml
name: D3 Deploy - Sepolia + Cloudflare Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment: sepolia

    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install

      - name: Type check
        run: bun run type-check

      - name: Build frontend
        run: bun run build:web
        env:
          VITE_STARKNET_RPC: ${{ secrets.STARKNET_RPC_URL }}
          VITE_ZKPASSPORT_CONTRACT: ${{ secrets.ZKPASSPORT_CONTRACT_ADDRESS }}

      - name: Deploy to Cloudflare Pages
        run: bunx wrangler pages deploy dist --project-name=treazury-sepolia --branch=main
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}

      - name: Post-deployment verification
        run: |
          echo "✓ Build complete: treazury-sepolia.pages.dev"
          echo "✓ Contract: ${{ secrets.ZKPASSPORT_CONTRACT_ADDRESS }}"
```

### 5.2 Manual Deployment Command

```bash
# Build production
bun run build:deploy

# Deploy to Cloudflare
wrangler pages deploy dist \
  --project-name=treazury-sepolia \
  --branch=main
```

**Expected Output:**
```
✓ Project: treazury-sepolia
✓ Environment: main
✓ URL: https://treazury-sepolia.pages.dev
```

---

## Step 6: E2E Testing on Testnet

### 6.1 Manual Testing Checklist

- [ ] Access `https://treazury-sepolia.pages.dev`
- [ ] Connect wallet (Braavos/Argent X) on Sepolia
- [ ] Verify KYC (generate proof locally)
- [ ] Check proof verification on-chain (call verifier contract)
- [ ] Execute private transfer with Tongo
- [ ] Verify encrypted balance updated
- [ ] Check browser console for errors

### 6.2 Automated E2E Tests

```bash
# Run full test suite
bun run test

# Watch mode
bun run test --watch

# Coverage report
bun run test --coverage
```

### 6.3 Monitor on-chain Activity

```bash
# Check verifier contract events
sncast --profile sepolia events \
  --contract-address 0x...verifier_contract_address... \
  --from-block 12345

# Verify transaction receipt
sncast --profile sepolia receipt \
  --transaction-hash 0x...tx_hash...
```

---

## Step 7: Troubleshooting

| Issue | Solution |
| ----- | --------- |
| **Class hash mismatch** | Rebuild contract: `cd zkpassport_verifier && scarb build --release` |
| **Insufficient STRK gas** | Fund account from [faucet](https://faucet.goerli.starknet.io/) |
| **RPC timeout** | Switch to different Starknet RPC endpoint (see wrangler.toml) |
| **Contract deploy fails** | Check owner address matches account: `sncast account info` |
| **Cloudflare deploy fails** | Verify token: `wrangler whoami` |
| **Proof verification rejects** | Check proof format matches Garaga calldata spec |

---

## Step 8: Post-Deployment Tasks

### 8.1 Security Audit Preparation

- [ ] Test all contract entrypoints
- [ ] Verify proof validation logic
- [ ] Check access control (owner-only functions)
- [ ] Test event emission
- [ ] Audit Tongo integration

### 8.2 Monitoring Setup

- [ ] Configure Starknet block explorer alerts
- [ ] Track contract event logs
- [ ] Monitor Cloudflare Pages analytics
- [ ] Setup RPC failover monitoring

### 8.3 Documentation Updates

- [ ] Update README.md with deployed addresses
- [ ] Document API endpoints
- [ ] Create user guide for testnet
- [ ] Prepare deployment changelog

---

## Success Criteria (D3 Complete)

✅ **Cairo Verifier**
- Deployed to Sepolia testnet
- All snforge tests passing
- Event emission working
- Storage state persisting

✅ **Frontend**
- Connected to real verifier contract
- Proof generation working (local Noir/Barretenberg)
- On-chain verification flow complete
- E2E tests passing

✅ **CI/CD**
- GitHub Actions workflow active
- Automatic Pages deployment on push
- Environment variables secured
- Build artifacts versioned

✅ **Testing**
- Full E2E flow tested on Sepolia
- Performance within targets (< 10s per transfer)
- Error handling verified
- Security checks passing

---

## Next: D4 Phase

- **Timeline**: 1 week
- **Scope**: Security audit + mainnet deployment
- **Deliverables**: Production contract on mainnet, public beta launch

See `D3_ROADMAP.md` for full phase planning.

---

**Last Updated**: December 4, 2025  
**Phase**: D3 🔄  
**Status**: Deployment guide complete - ready for implementation
