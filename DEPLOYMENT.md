# Treazury - Deployment Guide

## 🚀 Quick Deploy to Cloudflare Pages

### Prerequisites
- Cloudflare account
- GitHub repo connected to Cloudflare Pages
- Bun installed locally

### 1. Local Build Test
```bash
bun install
bun run build:web
```

Expected output: `✓ built in ~9s`

### 2. Cloudflare Pages Setup

#### Via Dashboard:
1. Go to https://dash.cloudflare.com
2. Pages > Create a project > Connect to Git
3. Select `cxto21/treazury` repository
4. Configure build:
   - **Build command:** `bun run build:web`
   - **Build output directory:** `dist`
   - **Root directory:** `/`
   - **Node version:** `20`

#### Environment Variables (Required):
```
VITE_NETWORK=ztarknet-testnet
VITE_STARKNET_RPC=https://ztarknet-madara.d.karnot.xyz
VITE_TREAZURY_VAULT_ADDRESS=0x04cbe8011bddc3fa7d7832db096122f3ec5bb937f5bf5b3db852319664239196
VITE_TREAZURY_VAULT_OWNER=0x5b7213d74268643e884c026569b800f463fd9f5b86493fb2551c38507f045fa
VITE_EXPLORER_URL=https://explorer.ztarknet.cash
VITE_FAUCET_URL=https://faucet.ztarknet.cash
```

### 3. Deploy via CLI (Optional)
```bash
# Login to Cloudflare
bun run deploy:login

# Deploy
bun run deploy
```

### 4. Verify Deployment

Test these features:
- [ ] Loading animation displays
- [ ] Wallet connection modal appears
- [ ] Can connect Argent X or Braavos
- [ ] Balance loads from TreazuryVault v2.0
- [ ] Transfer form validates inputs
- [ ] Transactions submit to Ztarknet

### 5. Production URLs

**Mainnet (Future):**
- URL: https://treazury.xyz (or .pages.dev)
- Network: Starknet Mainnet
- Update VITE_STARKNET_RPC to mainnet RPC

**Testnet (Current):**
- URL: https://treazury.pages.dev
- Network: Ztarknet Testnet
- Contract: 0x04cbe8011bddc3fa7d7832db096122f3ec5bb937f5bf5b3db852319664239196

## 📊 Bundle Analysis

Current build output:
```
dist/index.html                2.18 kB
dist/assets/index.css         31.75 kB  (5.96 kB gzipped)
dist/assets/react.js          11.21 kB  (3.97 kB gzipped)
dist/assets/index.js         214.61 kB  (65.51 kB gzipped)
dist/assets/starknet.js      460.86 kB  (124.12 kB gzipped) ⚠️ Large
```

**Optimization Opportunities:**
- Starknet.js bundle is large (460KB) - consider code splitting
- Most users will only use transfer functionality
- Could lazy load deposit/withdraw features

## 🔒 Security Checklist

- [x] No private keys in code
- [x] All secrets in environment variables
- [x] HTTPS enforced by Cloudflare
- [x] No CDN dependencies (all bundled)
- [x] Contract address hardcoded from verified deployment
- [ ] CSP headers configured (TODO in Cloudflare)
- [ ] Rate limiting on RPC calls (TODO)

## 🐛 Troubleshooting

### Build fails with "Cannot find module"
```bash
rm -rf node_modules bun.lock
bun install
bun run build:web
```

### Wallet doesn't connect
- Check browser console for errors
- Ensure wallet extension is installed
- Try different wallet (Argent X vs Braavos)
- Clear browser cache

### Transactions fail
- Check wallet has sufficient ETH for gas
- Verify vault is not paused: `is_paused()` returns false
- Check transaction on explorer
- Try smaller amount

### Balance shows 0.00
- First deposit may take 1-2 minutes to confirm
- Check transaction status on explorer
- Refresh page after transaction confirms

## 📞 Support

- GitHub Issues: https://github.com/cxto21/treazury/issues
- Contract Explorer: https://explorer.ztarknet.cash/contract/0x04cbe8011bddc3fa7d7832db096122f3ec5bb937f5bf5b3db852319664239196
- Ztarknet Faucet: https://faucet.ztarknet.cash

## 📝 Next Steps

1. **Performance:** Implement code splitting for Starknet.js
2. **Features:** Add deposit/withdraw UI
3. **ZK Proofs:** Replace mock proofs with real Noir/Barretenberg
4. **Encryption:** Implement Poseidon encryption for balances
5. **History:** Add transaction history view
6. **Analytics:** Integrate Cloudflare Analytics
7. **Monitoring:** Set up error tracking (Sentry)
