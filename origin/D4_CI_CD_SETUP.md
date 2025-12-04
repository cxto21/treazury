# D4.2: GitHub Actions CI/CD Setup Guide

**Purpose**: Configure GitHub Actions workflow for automated deployment to Sepolia and Cloudflare Pages  
**Status**: Workflow created (`.github/workflows/d4-deploy.yml`)  
**Time Estimate**: 10-15 minutes for secret configuration

---

## Overview

The GitHub Actions workflow (`d4-deploy.yml`) automates:

1. **Cairo Contract Testing** - Verify tests pass on every push
2. **TypeScript Testing** - Type-check and E2E tests
3. **Cairo Deployment** - Auto-declare and deploy to Sepolia (main branch only)
4. **Frontend Deployment** - Auto-build and deploy to Cloudflare Pages
5. **Verification** - Confirm on-chain deployment
6. **Notifications** - Send status to Slack (optional)

---

## Step 1: Configure GitHub Secrets

Go to: **Settings → Secrets and variables → Actions → New repository secret**

Add the following secrets:

### 1.1 Starknet Deployment Secrets

| Secret | Value | Description |
|--------|-------|-------------|
| `STARKNET_PRIVATE_KEY` | `0x...` | Your Sepolia account private key |
| `STARKNET_PUBLIC_KEY` | `0x...` | Your Sepolia account public key |
| `STARKNET_ACCOUNT_ADDRESS` | `0x...` | Your Sepolia deployer account address |
| `STARKNET_RPC_URL` | `https://starknet-sepolia.g.alchemy.com/...` | Sepolia RPC endpoint |

**How to get these values**:

```bash
# If using Argent X or Braavos
# Export from wallet UI

# Or via sncast
sncast account info

# Output:
# Account address: 0x...
# Public key: 0x...
```

### 1.2 Frontend Environment Secrets

| Secret | Value | Description |
|--------|-------|-------------|
| `VITE_STARKNET_RPC` | `https://starknet-sepolia.public.blastapi.io` | Public Sepolia RPC |
| `VITE_ZKPASSPORT_CONTRACT` | `0x...` | Deployed ZKPassport contract address (set after deployment) |
| `VITE_TONGO_CONTRACT` | `0x...` | Tongo contract address (if using) |

### 1.3 Cloudflare Deployment Secrets

| Secret | Value | Description |
|--------|-------|-------------|
| `CLOUDFLARE_API_TOKEN` | `(token)` | Cloudflare API token with Pages access |
| `CLOUDFLARE_ACCOUNT_ID` | `(account-id)` | Cloudflare account ID |

**How to get Cloudflare secrets**:

1. Go to **Cloudflare Dashboard → Pages**
2. Create a new project or use existing `treazury-sepolia`
3. Get API Token: **Account Home → API Tokens → Create Token**
   - Use "Edit Cloudflare Workers" template
   - Include "Accounts" and "Account.Cloudflare Pages"
4. Get Account ID: **Account Home → Copy Account ID**

### 1.4 Optional: Slack Notification

| Secret | Value |
|--------|-------|
| `SLACK_WEBHOOK_URL` | Incoming webhook from Slack workspace |

---

## Step 2: Verify Workflow File

Check that `.github/workflows/d4-deploy.yml` exists:

```bash
ls -la .github/workflows/
# Expected: d4-deploy.yml (3.2 KB)
```

---

## Step 3: Test Workflow Trigger

### 3.1 Manual Trigger (Recommended first test)

1. Go to **GitHub Repo → Actions**
2. Select **"D4 - Deploy to Sepolia & Cloudflare Pages"**
3. Click **"Run workflow"**
4. Select branch: **main**
5. Click **"Run workflow"**

Monitor the run in Actions tab.

### 3.2 Push Trigger

Once manual trigger succeeds, push a small change to main:

```bash
git add .
git commit -m "test: trigger D4 workflow [skip ci]"
git push origin main
```

The workflow will run automatically.

---

## Step 4: Monitor Workflow Execution

### 4.1 Workflow Structure

The workflow runs in this order:

```
Parallel:
├─ test-cairo (3-5 min)
│  ├─ Build Cairo
│  └─ Run snforge tests
│
└─ test-typescript (5-10 min)
   ├─ Type check
   ├─ Run E2E tests
   └─ Build frontend

Then (if main branch):
├─ deploy-cairo (5-10 min)
│  ├─ Declare contract
│  ├─ Deploy contract
│  └─ Update deployments/sepolia.json
│
├─ deploy-frontend (5-10 min)
│  ├─ Build for production
│  └─ Deploy to Cloudflare Pages
│
├─ verify-deployment (2-3 min)
│  └─ Call on-chain functions
│
└─ notify-slack (1 min, optional)
   └─ Send status notification
```

**Total time**: 15-25 minutes on first run

### 4.2 View Workflow Results

1. **Go to**: Repo → Actions → Latest run
2. **Check**:
   - ✓ All jobs show green checkmarks
   - ✓ No red X marks (failures)
   - ✓ Logs visible for each step
3. **Check deployment**:
   - Sepolia: https://sepolia.starkscan.co (search contract address)
   - Cloudflare: https://treazury-sepolia.pages.dev

---

## Step 5: Handle Workflow Failures

### Common Failures

| Error | Cause | Fix |
|-------|-------|-----|
| "Secrets not found" | Secret not configured | Double-check secret name spelling in `.github/workflows/` |
| "scarb not found" | Scarb installation failed | Workflow will retry on next push |
| "Cairo build failed" | Contract compilation error | Check `zkpassport_verifier/src/` for syntax errors |
| "Insufficient balance" | STRK funds ran out | Fund account at faucet.starknet.io |
| "Transaction timeout" | Network congestion | Workflow retries automatically |

### Debug Logs

1. Click on failed job
2. Expand any step to see full logs
3. Search for error message
4. Fix issue and commit to main

---

## Step 6: Post-Deployment Configuration

### 6.1 Update VITE_ZKPASSPORT_CONTRACT

After first deployment, the workflow will:
1. Deploy contract to Sepolia
2. Update `deployments/sepolia.json`
3. Auto-commit back to repo

**However**, you need to manually update the GitHub Secret:

1. Go to **Settings → Secrets → VITE_ZKPASSPORT_CONTRACT**
2. Update value with deployed address from `deployments/sepolia.json`
3. Save

This ensures frontend always uses current contract.

### 6.2 Update Frontend .env Files

Also create `.env.production.local`:

```bash
cat > .env.production.local << 'EOF'
VITE_STARKNET_RPC=https://starknet-sepolia.public.blastapi.io
VITE_ZKPASSPORT_CONTRACT=0x...
VITE_ENVIRONMENT=production
EOF
```

### 6.3 Verify Cloudflare Deployment

After first frontend deployment:

1. Go to **Cloudflare Dashboard → Pages → treazury-sepolia**
2. Verify:
   - ✓ Latest deployment shows green
   - ✓ URL: `https://treazury-sepolia.pages.dev` is live
   - ✓ Build logs show success

---

## Step 7: Workflow Customization (Optional)

### 7.1 Change Deployment Triggers

Edit `.github/workflows/d4-deploy.yml`:

```yaml
on:
  push:
    branches:
      - main          # ← Change to 'develop' for staging
    paths:
      - 'zkpassport_verifier/**'
      - 'src/**'
  workflow_dispatch:  # Manual trigger always available
```

### 7.2 Add Branch Protections

1. Go to **Settings → Branches → Add rule**
2. Set **Branch name pattern**: `main`
3. Enable:
   - ✓ Require status checks to pass
   - ✓ Require code reviews
   - ✓ Dismiss stale reviews

This ensures workflow passes before merging.

### 7.3 Add Matrix Testing (Optional)

Already included for TypeScript (node 18 and 20), can extend for Cairo versions:

```yaml
strategy:
  matrix:
    scarb-version: ['2.8.0', '2.9.2']
```

---

## Troubleshooting

### Issue: "Workflow not triggering on push"

**Check**:
1. Push to `main` branch (not other branches)
2. Changes match `paths` filter in workflow
3. Commit message not containing `[skip ci]`

**Solution**:
```bash
git push origin main
# Workflow should trigger within 1 minute
```

### Issue: "sncast command not found"

**Cause**: Scarb installation in workflow failed  
**Solution**: Workflow has retry logic, will succeed on next push

### Issue: "Transaction rejected: invalid account"

**Cause**: STARKNET_ACCOUNT_ADDRESS doesn't match private key  
**Solution**: 
1. Get fresh keypair from wallet
2. Update all Starknet secrets
3. Fund new account
4. Retry workflow

### Issue: "Cloudflare deployment failed"

**Cause**: Invalid API token or account ID  
**Solution**:
1. Regenerate Cloudflare API token
2. Verify account ID correct
3. Update GitHub secrets
4. Manually deploy: `wrangler pages deploy dist`

---

## Monitoring & Alerts

### Enable Slack Notifications

To receive deployment status on Slack:

1. Create Slack App: https://api.slack.com/apps
2. Enable "Incoming Webhooks"
3. Copy webhook URL
4. Add to GitHub Secrets as `SLACK_WEBHOOK_URL`
5. Workflow will automatically send status

### Monitor in GitHub

1. **Repo → Actions** - View all workflow runs
2. **Set up branch protection** - Require workflow success before merge
3. **Email notifications** - GitHub sends alerts on workflow failure

---

## Next Steps (D4.3+)

1. **D4.3**: Update environment variables in `.env.local`
2. **D4.4**: Execute manual E2E testing on Sepolia
3. **D4.5**: Prepare security audit package
4. **D4.6**: Create D4 completion report

---

## Quick Reference

```bash
# Manually trigger workflow
# Go to: GitHub Repo → Actions → Run workflow

# View latest run
# Go to: GitHub Repo → Actions → Latest run

# Monitor logs
# Click on job name → Expand step

# Rollback deployment
# Revert commit and push (workflow auto-triggers)

# Update secrets
# Settings → Secrets → Edit secret → Save
```

---

**Last Updated**: December 4, 2025  
**Status**: Workflow ready for first run  
**Next**: Execute manual test trigger

---

## File Manifest

- `.github/workflows/d4-deploy.yml` - Main workflow (3.2 KB)
- `deployments/sepolia.json` - Contract registry (updated by workflow)
- `.env.local` - Local environment (not in git)
- `.env.production.local` - Production environment (not in git)

**Total**: ~500 lines of workflow configuration for fully automated Sepolia deployment
