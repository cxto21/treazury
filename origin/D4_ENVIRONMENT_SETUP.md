# D4.3: Environment Variables Configuration

**Purpose**: Configure frontend and backend environment variables for Sepolia testnet deployment  
**Status**: Template created (`.env.local.example`)  
**Time Estimate**: 5 minutes

---

## Overview

Environment variables control:
- **Network**: Which Starknet network to use (Sepolia for testnet, Mainnet for production)
- **Contracts**: Smart contract addresses (ZKPassport, Tongo, etc.)
- **APIs**: RPC endpoints and optional services
- **Environment**: Build profile (development vs production)

---

## Step 1: Create .env.local

### 1.1 Copy Template

```bash
cd /workspaces/treazury

# Copy example to .env.local
cp .env.local.example .env.local
```

### 1.2 Edit .env.local

Open `.env.local` and update values:

```bash
# Starknet Network Configuration
VITE_STARKNET_RPC=https://starknet-sepolia.public.blastapi.io
STARKNET_CHAIN_ID=SN_SEPOLIA

# Contract Addresses (UPDATE AFTER DEPLOYMENT)
VITE_ZKPASSPORT_CONTRACT=0x0YOUR_DEPLOYED_ADDRESS_HERE
VITE_TONGO_CONTRACT=0x0TONGO_ADDRESS_IF_AVAILABLE

# Environment
VITE_NETWORK=sepolia
VITE_ENVIRONMENT=development
```

**⚠️ Important**: `.env.local` is gitignored - never commit secrets

---

## Step 2: Update Contract Addresses

After deploying to Sepolia (D4.1), update addresses:

### 2.1 Get Deployed Address

From `deployments/sepolia.json`:

```bash
cat deployments/sepolia.json | jq '.contracts.ZKPassportVerifier.address'
# Output: "0x0fedcba9876543210..."
```

### 2.2 Update .env.local

```bash
# Edit and set:
VITE_ZKPASSPORT_CONTRACT=0x0fedcba9876543210...
```

### 2.3 Verify Configuration

```bash
# Type check (detects env var usage)
bun run type-check
# Expected: 0 errors

# Check in frontend code
grep -r "VITE_ZKPASSPORT_CONTRACT" src/
# Should see it referenced in src/web/services.ts
```

---

## Step 3: Verify Environment Variables in Frontend

### 3.1 Build with Env Vars

```bash
# Development build
bun run build:web

# Check dist/ for environment variable injection
grep -r "ZKPASSPORT_CONTRACT" dist/
```

### 3.2 Test in Dev Server

```bash
# Start dev server
bun run dev:web

# In browser console:
# - Check for "RPC connected to Sepolia"
# - Verify contract address loaded correctly
```

### 3.3 Verify Vite Configuration

Check `vite.config.ts` for environment variable handling:

```typescript
// vite.config.ts should have:
define: {
  __VITE_ZKPASSPORT_CONTRACT__: JSON.stringify(process.env.VITE_ZKPASSPORT_CONTRACT),
}
```

---

## Step 4: Environment Variable Reference

### Frontend Variables (Vite)

| Variable | Value | Required | Example |
|----------|-------|----------|---------|
| `VITE_STARKNET_RPC` | RPC URL | ✓ | `https://starknet-sepolia.public.blastapi.io` |
| `VITE_ZKPASSPORT_CONTRACT` | Contract address | ✓ | `0x0fedcba9876543210...` |
| `VITE_TONGO_CONTRACT` | Tongo address | ✗ | `0x0...` |
| `VITE_NETWORK` | Network name | ✗ | `sepolia` or `mainnet` |
| `VITE_ENVIRONMENT` | Environment | ✗ | `development`, `staging`, `production` |

### Backend Variables (Node.js)

| Variable | Value | Required | Default |
|----------|-------|----------|---------|
| `STARKNET_CHAIN_ID` | Chain ID | ✗ | `SN_SEPOLIA` |
| `STARKNET_RPC_URL` | RPC endpoint | ✗ | Inferred from chain |
| `ZKPASSPORT_ADDRESS` | Verifier contract | ✗ | From deployments/ |
| `TONGO_ADDRESS` | Tongo contract | ✗ | Loaded at runtime |

### Deployment Variables (CI/CD)

| Secret | Scope | Purpose |
|--------|-------|---------|
| `STARKNET_PRIVATE_KEY` | GitHub Actions | Signing transactions |
| `VITE_STARKNET_RPC` | Build time | RPC endpoint for Vite build |
| `VITE_ZKPASSPORT_CONTRACT` | Build time | Contract address in frontend |
| `CLOUDFLARE_API_TOKEN` | GitHub Actions | Deploying to Pages |

---

## Step 5: Network Configuration

### 5.1 Sepolia Testnet (Recommended for D4)

```env
VITE_STARKNET_RPC=https://starknet-sepolia.public.blastapi.io
STARKNET_CHAIN_ID=SN_SEPOLIA
VITE_NETWORK=sepolia
VITE_ENVIRONMENT=development
```

**RPC Endpoint Options**:
- Alchemy: `https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_10/<API_KEY>`
- Blast API: `https://starknet-sepolia.public.blastapi.io`
- Infura: `https://starknet-sepolia.infura.io/v3/<API_KEY>`

### 5.2 Mainnet (D5 - Post-Audit)

```env
VITE_STARKNET_RPC=https://starknet-mainnet.public.blastapi.io
STARKNET_CHAIN_ID=SN_MAIN
VITE_NETWORK=mainnet
VITE_ENVIRONMENT=production
```

---

## Step 6: Production Build Configuration

### 6.1 Create .env.production.local

For production Cloudflare Pages deployment:

```bash
cat > .env.production.local << 'EOF'
VITE_STARKNET_RPC=https://starknet-sepolia.public.blastapi.io
VITE_ZKPASSPORT_CONTRACT=0x0fedcba9876543210...
VITE_TONGO_CONTRACT=0x0...
VITE_ENVIRONMENT=production
VITE_NETWORK=sepolia
EOF
```

**Usage**:
```bash
# Build uses .env.production.local (has priority)
bun run build:web

# Or explicitly
NODE_ENV=production bun run build:web
```

### 6.2 Build Output Verification

```bash
# Check built files for environment injection
cat dist/index.html | grep "ZKPASSPORT"
# Should show contract address embedded
```

---

## Step 7: Development vs Production

### Development (.env.local)

```env
VITE_ENVIRONMENT=development
VITE_STARKNET_RPC=https://starknet-sepolia.public.blastapi.io
# ✓ Console logging enabled
# ✓ Error stack traces visible
# ✓ Development RPC rate limits higher
```

### Production (.env.production.local)

```env
VITE_ENVIRONMENT=production
VITE_STARKNET_RPC=https://starknet-sepolia.public.blastapi.io
# ✓ Minified bundle
# ✓ Console logging minimized
# ✓ Production optimizations
```

### Staging (Optional)

```env
VITE_ENVIRONMENT=staging
VITE_NETWORK=sepolia
# For pre-production testing
```

---

## Step 8: Verify All Variables

### 8.1 Checklist

```bash
# Run this after setting .env.local
cat .env.local | grep VITE_

# Expected output:
# VITE_STARKNET_RPC=https://starknet-sepolia.public.blastapi.io
# VITE_ZKPASSPORT_CONTRACT=0x0fedcba9876543210...
# VITE_NETWORK=sepolia
# VITE_ENVIRONMENT=development
```

### 8.2 Test Frontend Loading

```bash
# Start dev server
bun run dev:web

# In browser console, check:
console.log(import.meta.env.VITE_ZKPASSPORT_CONTRACT)
# Should output contract address

# Check network connection
console.log('RPC:', import.meta.env.VITE_STARKNET_RPC)
# Should output RPC URL
```

### 8.3 Test Build

```bash
# Clean build
bun run build:web

# Verify
ls -lh dist/
# dist/index.html should be < 5KB
# dist/assets/ should contain JS bundles
```

---

## Step 9: Advanced Configuration

### 9.1 Custom RPC Endpoints

For higher rate limits or better performance:

```env
# Option 1: Alchemy (requires API key)
VITE_STARKNET_RPC=https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_10/YOUR_API_KEY

# Option 2: Infura (requires API key)
VITE_STARKNET_RPC=https://starknet-sepolia.infura.io/v3/YOUR_API_KEY

# Option 3: Local node (for development)
VITE_STARKNET_RPC=http://localhost:5050
```

### 9.2 Feature Flags

Optional feature toggles:

```env
# Enable debug mode
VITE_DEBUG=true

# Enable mock data (for UI testing without RPC)
VITE_USE_MOCK_DATA=false

# API URL for backend proving (if not client-side)
VITE_API_URL=https://api.treazury.xyz
```

### 9.3 Monitoring & Analytics

```env
# Optional: Sentry for error tracking
VITE_SENTRY_DSN=https://...

# Optional: Mixpanel for analytics
VITE_MIXPANEL_TOKEN=...
```

---

## Troubleshooting

### Issue: "Contract not found" in console

**Cause**: `VITE_ZKPASSPORT_CONTRACT` not set  
**Solution**:
```bash
# Check .env.local
grep VITE_ZKPASSPORT_CONTRACT .env.local

# Restart dev server
bun run dev:web
```

### Issue: "RPC endpoint error" in console

**Cause**: `VITE_STARKNET_RPC` pointing to wrong network  
**Solution**:
```bash
# Test RPC endpoint manually
curl $VITE_STARKNET_RPC -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"starknet_blockNumber","params":[],"id":1}'
```

### Issue: Environment variables not injecting into build

**Cause**: Variable name doesn't start with `VITE_`  
**Solution**: Vite only injects `VITE_*` variables for security
- Use `VITE_MY_VAR` for frontend access
- Use `process.env.MY_VAR` for Node.js backend

---

## Next Steps (D4.4+)

Once environment is configured:

1. **D4.4**: Execute E2E testing on Sepolia
2. **D4.5**: Prepare security audit
3. **D4.6**: Create completion report

---

**Last Updated**: December 4, 2025  
**Status**: Configuration templates ready  
**Next**: Complete D4.1 deployment and update contract addresses

---

## File Manifest

- `.env.local.example` - Template (committed to git)
- `.env.local` - Personal config (gitignored - create locally)
- `.env.production.local` - Production config (gitignored)
- `vite.config.ts` - Vite configuration (how vars are injected)
- `deployments/sepolia.json` - Contract registry (source of truth)

**Security Note**: Never commit `.env.local` to git. Use GitHub Secrets for CI/CD deployments.
