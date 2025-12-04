# D4: Interactive Sepolia Deployment Guide

**Purpose**: Step-by-step deployment of ZKPassport verifier to Starknet Sepolia testnet with validation checks.  
**Status**: Ready to execute  
**Time Estimate**: 30-45 minutes  
**Prerequisites**: STRK-funded Sepolia account, `sncast` + `scarb` installed

---

## Phase Overview

| Step | Task | Status | Est. Time |
|------|------|--------|-----------|
| 1 | Verify environment + toolchain | ⧳ Ready | 2 min |
| 2 | Build Cairo contract | ⧳ Ready | 3 min |
| 3 | Run Cairo tests | ⧳ Ready | 2 min |
| 4 | Declare contract on Sepolia | ⧳ Ready | 5 min |
| 5 | Deploy contract instance | ⧳ Ready | 5 min |
| 6 | Record contract address | ⧳ Ready | 1 min |
| 7 | Verify on-chain | ⧳ Ready | 5 min |
| 8 | Update frontend .env.local | ⧳ Ready | 2 min |
| **Total** | | | **25-30 min** |

---

## Step 1: Verify Environment & Toolchain

**Objective**: Confirm all required tools are installed and configured.

### 1.1 Check Starknet Toolchain

```bash
# Verify scarb installed
scarb --version
# Expected: scarb 2.9.2 (or similar)

# Verify sncast installed
sncast --version
# Expected: sncast 0.x.x

# Verify snforge available
snforge --version
# Expected: snforge 0.x.x
```

**Expected Output**:
```
✓ scarb 2.9.2 (210d97d5a)
✓ sncast 0.1.0
✓ snforge 0.1.0
```

If any tool is missing:
- **scarb**: `curl --proto '=https' --tlsv1.2 -sSf https://install.scarb.io | sh`
- **sncast**: Part of Starknet CLI, installed with scarb

### 1.2 Verify Sepolia Account

```bash
# Check .sncast.toml exists
cat ~/.sncast.toml
# Expected: Account private key configured

# Verify STRK balance on Sepolia
sncast --profile sepolia account info
# Expected: Account with STRK balance > 0.01
```

**✓ Continue if**: All tools present and account funded

---

## Step 2: Build Cairo Contract

**Objective**: Compile `zkpassport_verifier.cairo` to contract class.

```bash
cd /workspaces/treazury/zkpassport_verifier

# Clean previous builds
scarb clean

# Build contract
scarb build
```

**Expected Output**:
```
✓ Compiling zkpassport_verifier v0.1.0
✓ Cairo build complete
  Generated: target/release/zkpassport_verifier_zkpassport_verifier.compiled_contract_class.json
  Class Hash: 0x...
```

**Troubleshooting**:
- **Error**: "Contract not found" → Check `src/lib.cairo` imports
- **Error**: "Compiler version mismatch" → Update Scarb: `scarb install-extension --github-token <TOKEN>`
- **Error**: "Starknet dependency error" → Run `scarb update`

**✓ Next Step if**: Build succeeds with 0 errors

---

## Step 3: Run Cairo Tests

**Objective**: Execute snforge tests to validate verifier logic.

```bash
cd /workspaces/treazury/zkpassport_verifier

# Run all tests
snforge test

# Verbose output
snforge test --verbose
```

**Expected Output**:
```
running 13 tests from /workspaces/treazury/zkpassport_verifier/tests
test zkpassport_verifier_test::test_verify_kyc_tier1 ... ok
test zkpassport_verifier_test::test_verify_kyc_tier2 ... ok
test zkpassport_verifier_test::test_replay_protection ... ok
test zkpassport_verifier_test::test_level_enforcement ... ok
...
test result: ok. 13 passed; 0 failed
```

**Test Coverage** (13 cases):
- ✓ Valid KYC verification (Tier 1-4)
- ✓ Invalid proof rejection
- ✓ Replay protection
- ✓ Level enforcement (no downgrades)
- ✓ Storage updates
- ✓ Event emission
- ✓ Edge cases (zero address, max array size, etc.)

**Troubleshooting**:
- **Error**: "Test panicked" → Check storage initialization in contract
- **Error**: "Function not found" → Verify entrypoint names match test calls

**✓ Next Step if**: All 13 tests pass

---

## Step 4: Declare Contract on Sepolia

**Objective**: Register contract class on Sepolia testnet (creates class hash).

```bash
cd /workspaces/treazury/zkpassport_verifier

# Declare contract
sncast --profile sepolia declare \
  --contract-name zkpassport_verifier \
  --compiled-contract target/release/zkpassport_verifier_zkpassport_verifier.compiled_contract_class.json
```

**Expected Output**:
```
declare transaction hash: 0x01234567890abcdef...
class hash: 0xabcdef1234567890...

Wait for transaction to be mined... (usually 30-60 seconds)
✓ Transaction ACCEPTED_ON_L2
```

**Save this information**:
- `CLASS_HASH`: Noted from above
- `DECLARE_TX`: Noted from above

**Update deployments/sepolia.json**:
```json
{
  "ZKPassportVerifier": {
    "class_hash": "0xabcdef1234567890...",
    "declaration_tx": "0x01234567890abcdef...",
    "status": "Declared - Ready for deployment"
  }
}
```

**Troubleshooting**:
- **Error**: "Account error" → Check private key in `.sncast.toml`
- **Error**: "Insufficient balance" → Fund Sepolia account at faucet.starknet.io
- **Error**: "Contract not found" → Verify compiled artifact path

**✓ Next Step if**: Declaration succeeds with ACCEPTED_ON_L2

---

## Step 5: Deploy Contract Instance

**Objective**: Create contract instance from class hash on Sepolia.

```bash
# Set CLASS_HASH from Step 4
CLASS_HASH="0xabcdef1234567890..."

cd /workspaces/treazury/zkpassport_verifier

# Deploy contract instance
sncast --profile sepolia deploy \
  --class-hash $CLASS_HASH \
  --constructor-calldata 0x$(sncast signer address)
```

**Expected Output**:
```
deploy transaction hash: 0x9876543210fedcba...
contract address: 0x0fedcba9876543210...

Wait for transaction to be mined... (usually 30-60 seconds)
✓ Transaction ACCEPTED_ON_L2
```

**Save this information**:
- `CONTRACT_ADDRESS`: The deployed contract address
- `DEPLOY_TX`: Transaction hash

**Update deployments/sepolia.json**:
```json
{
  "ZKPassportVerifier": {
    "address": "0x0fedcba9876543210...",
    "deployment_tx": "0x9876543210fedcba...",
    "status": "Deployed on Sepolia"
  }
}
```

**Troubleshooting**:
- **Error**: "Class not found" → Verify class_hash from Step 4
- **Error**: "Transaction timeout" → Wait 60+ seconds and check on Starkscan
- **Error**: "Gas limit exceeded" → Class hash verification may take longer

**✓ Next Step if**: Deployment succeeds with contract address

---

## Step 6: Record Contract Address

**Objective**: Update configuration files with deployed contract address.

### 6.1 Update deployments/sepolia.json

```bash
# Edit file and set:
# - class_hash (from Step 4)
# - address (from Step 5)
# - declaration_tx (from Step 4)
# - deployment_tx (from Step 5)
# - status: "Active on Sepolia"
```

File structure:
```json
{
  "network": "sepolia",
  "contracts": {
    "ZKPassportVerifier": {
      "class_hash": "0x...",
      "address": "0x...",
      "declaration_tx": "0x...",
      "deployment_tx": "0x...",
      "status": "Active on Sepolia"
    }
  }
}
```

### 6.2 Create .env.local

```bash
# Create .env.local in project root
cat > .env.local << 'EOF'
# Starknet
VITE_STARKNET_RPC=https://starknet-sepolia.public.blastapi.io
STARKNET_CHAIN_ID=SN_SEPOLIA

# Contracts (UPDATE WITH YOUR DEPLOYED ADDRESS)
VITE_ZKPASSPORT_CONTRACT=0x0fedcba9876543210...
VITE_TONGO_CONTRACT=0x0...

# Optional
VITE_NETWORK=sepolia
VITE_ENVIRONMENT=testnet
EOF
```

**✓ Verify**: Files updated with correct address

---

## Step 7: Verify On-Chain

**Objective**: Confirm contract is deployed and callable on Sepolia.

```bash
# View contract on Starkscan
# https://sepolia.starkscan.co/contract/0x0fedcba9876543210...

# Or verify via sncast
sncast --profile sepolia call \
  --contract-address 0x0fedcba9876543210... \
  --function-name is_kyc_verified \
  --calldata 0x0123456789abcdef
```

**Expected Output**:
```
Contract verified on Sepolia
✓ Response: 0x0 (not verified, as expected for new account)
```

### 7.1 Manual Verification Checklist

- [ ] Contract visible on Starkscan: `sepolia.starkscan.co/contract/<ADDRESS>`
- [ ] Constructor args match deployment
- [ ] Read functions accessible (is_kyc_verified, get_kyc_level, etc.)
- [ ] Events visible in transaction details

**✓ Deployment Success if**: Contract callable and matches expected ABI

---

## Step 8: Update Frontend Environment

**Objective**: Wire frontend to deployed verifier contract.

### 8.1 Update .env.local

```bash
# Already created in Step 6, verify:
VITE_ZKPASSPORT_CONTRACT=0x0fedcba9876543210...
VITE_STARKNET_RPC=https://starknet-sepolia.public.blastapi.io
```

### 8.2 Verify Frontend Configuration

```bash
# Type check frontend
bun run type-check
# Expected: 0 errors

# Build frontend
bun run build:web
# Expected: Build succeeds, dist/ created
```

### 8.3 Test Frontend Connection

```bash
# Start dev server
bun run dev:web

# In browser:
# 1. Navigate to http://localhost:3000
# 2. Open DevTools Console
# 3. Check for connection errors
# 4. Connect wallet on Sepolia
# 5. Try to verify KYC (should call deployed contract)
```

**Expected Console Output**:
```
✓ RPC connected to Sepolia
✓ Verifier contract: 0x0fedcba9876543210...
✓ Wallet connected: 0x1234...
```

**✓ Deployment Complete if**: Frontend connects and contract is callable

---

## Deployment Checklist

Use this checklist to track progress:

```
☐ Step 1: Environment verified (scarb, sncast, snforge, account funded)
☐ Step 2: Contract builds successfully
☐ Step 3: All 13 tests pass
☐ Step 4: Contract declared (class_hash recorded)
☐ Step 5: Contract deployed (address recorded)
☐ Step 6: deployments/sepolia.json updated
☐ Step 7: Contract verified on Starkscan
☐ Step 8: Frontend .env.local configured
☐ Step 9: Frontend connects to contract
☐ Step 10: End-to-end flow tested
```

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "Contract not found" | Build failed | Run `scarb clean && scarb build` |
| "Account error" | Private key not configured | Check `~/.sncast.toml` |
| "Insufficient balance" | STRK funds depleted | Get testnet STRK from faucet |
| "Transaction timeout" | Network congestion | Wait 60+ seconds, check Starkscan |
| "Class hash mismatch" | Recompiled with changes | Declare new class hash |
| "Frontend can't connect" | .env.local not loaded | Restart dev server after .env changes |

### Support Resources

- **Starkscan Sepolia**: https://sepolia.starkscan.co
- **Starknet Faucet**: https://faucet.starknet.io
- **Cairo Docs**: https://docs.cairo-lang.org
- **sncast Reference**: https://docs.starknet.io/tools/sncast

---

## Next Steps (D4.2+)

Once Sepolia deployment succeeds:

1. **CI/CD Setup** (D4.2)
   - Create GitHub Actions workflow
   - Configure automatic deployment on push
   - Test automated workflow

2. **E2E Testing** (D4.4)
   - Connect wallet on Sepolia testnet
   - Execute full private transfer flow
   - Verify balance updates

3. **Security Audit** (D4.5)
   - Prepare audit package
   - Schedule third-party review
   - Address findings

4. **Mainnet Planning** (D5)
   - Post-audit review
   - Mainnet contract deployment
   - Production verification

---

**Last Updated**: December 4, 2025  
**Phase**: D4.1 (Deployment)  
**Status**: Ready to execute

---

## Post-Deployment Verification

Once deployed, verify with this command:

```bash
# Store contract address
CONTRACT=0x0fedcba9876543210...

# Verify contract exists
sncast --profile sepolia call \
  --contract-address $CONTRACT \
  --function-name total_verifications

# Expected output: 0x0 (no verifications yet, as expected)
```

**Success**: Contract is live on Sepolia and ready for E2E testing.
