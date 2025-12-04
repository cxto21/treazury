# D4.4: E2E Testing Checklist (Sepolia Testnet)

**Purpose**: Manual end-to-end testing on deployed Sepolia verifier  
**Status**: Ready to execute after D4.1 & D4.3  
**Time Estimate**: 15-20 minutes  
**Requirements**: Wallet funded on Sepolia, deployed verifier contract

---

## Pre-Testing Checklist

Before starting E2E tests, verify:

- [ ] ZKPassport verifier deployed to Sepolia (contract address recorded)
- [ ] Frontend .env.local configured with contract address
- [ ] Frontend dev server running (`bun run dev:web`)
- [ ] Wallet (Argent X or Braavos) installed and funded on Sepolia
- [ ] At least 0.01 STRK on Sepolia for gas fees
- [ ] Starkscan access: https://sepolia.starkscan.co

---

## Test Scenario 1: Wallet Connection

**Objective**: Verify frontend connects to wallet and reads basic account info

### 1.1 Start Frontend

```bash
bun run dev:web
# Expected output:
# VITE v... ready in XX ms
# ➜ Local: http://localhost:3000/
```

### 1.2 Open Browser

1. Navigate to `http://localhost:3000`
2. Should see **LoadingGate** component with hexagon animation
3. Verify styling loads (neon colors, dark theme)

### 1.3 Connect Wallet

1. Click **"Connect Wallet"** button
2. Wallet extension should popup
3. Select account
4. Click **"Connect"**
5. Check browser console for connection message

**Expected Results**:
- ✓ Wallet connected message appears
- ✓ Account address displayed
- ✓ No console errors
- ✓ UI transitions to VaultInterface

**Test Status**: ◻️ Pass / ◻️ Fail  
**Notes**: _______________

---

## Test Scenario 2: KYC Verification

**Objective**: Verify ZKPassport KYC proof generation and on-chain verification

### 2.1 Access KYC Modal

1. From VaultInterface, click **"Verify KYC"** or **"Generate ZK Proof"**
2. Should see ZKPassportModal with proof generation form
3. Form should have fields:
   - Identity proof (text input)
   - KYC Level selector (Tier 1-4)
   - Submit button

### 2.2 Generate Proof

1. **Enter test data**:
   - Identity Proof: `test_identity_proof_12345`
   - KYC Level: Select **Tier 1**
   
2. **Click "Generate ZK Proof"**

3. **Monitor**:
   - Loading spinner should appear
   - Console should show "Generating proof..."
   - Should take 1-3 seconds

**Expected Output**:
```
✓ Proof generated successfully
✓ Proof hash: 0x1234...
✓ Calldata: 0xabcd...
```

### 2.3 Verify On-Chain

1. **Click "Verify on Starknet"**

2. **Expected wallet interaction**:
   - Wallet popup: "Sign transaction"
   - Transaction details visible
   - Click "Sign"

3. **Monitor transaction**:
   - Console should show tx hash: `0x...`
   - Page should show "Verification in progress..."
   - Wait 30-60 seconds for confirmation

**Expected Result**:
```
✓ Verification successful
✓ Transaction hash: 0x...
✓ Your KYC Level: Tier 1
✓ Verified badge displayed
```

### 2.4 Verify on Starkscan

1. **Go to**: https://sepolia.starkscan.co
2. **Search**: Transaction hash from step 2.3
3. **Expected**:
   - Transaction shows ACCEPTED_ON_L2
   - Function: `verify_kyc`
   - Contract: Your ZKPassportVerifier address
   - Calldata matches proof

**Test Status**: ◻️ Pass / ◻️ Fail  
**Proof Hash**: _______________  
**Tx Hash**: _______________  
**Notes**: _______________

---

## Test Scenario 3: Encrypted Balance Display

**Objective**: Verify encrypted balance fetching and display

### 3.1 View Balance

1. From VaultInterface, look for **"Encrypted Balance"** section
2. Should display:
   - Locked icon 🔒
   - Balance appears as: `***1,234.56 USDC` (masked)
   - "Hold to reveal" tooltip

### 3.2 Reveal Balance (Optional)

1. **Hold** on encrypted balance display
2. Should reveal temporarily:
   - `1,234.56 USDC`
3. Release to re-encrypt

**Expected**:
- ✓ Balance encrypted by default
- ✓ Reveal on hold (security feature)
- ✓ No balance stored in console history

### 3.3 Check Console Logs

1. Open DevTools → Console
2. Search for "balance" logs
3. Should see:
   ```
   ✓ Fetching encrypted balance...
   ✓ Balance commitment: 0x...
   ✓ Nonce: 0x...
   ✓ Balance loaded
   ```

**Test Status**: ◻️ Pass / ◻️ Fail  
**Displayed Balance**: _______________  
**Notes**: _______________

---

## Test Scenario 4: Transaction Limits Check

**Objective**: Verify AML policy enforcement before transfer

### 4.1 Check Available Tier

1. From VaultInterface, check **"Your KYC Level"** display
2. Should show verified badge with **Tier 1**

### 4.2 View Limits

1. Look for **"Transaction Limits"** info
2. Should display for Tier 1:
   - Per-transaction: $1,000
   - Daily limit: $2,000
   - Remaining today: $2,000 (first transaction)

### 4.3 Test Limit Enforcement

1. **Try transfer amount**: `$500` (within limit)
   - Should show: ✓ Amount within limits

2. **Try transfer amount**: `$1,500` (exceeds per-tx limit)
   - Should show: ✗ Exceeds transaction limit ($1,000)
   - Button disabled

3. **Try transfer amount**: `$1,000` then another `$1,500` (exceeds daily)
   - First: ✓ Allowed
   - Second: ✗ Would exceed daily limit ($2,000)

**Expected Console Output**:
```
✓ Checking transaction limits...
✓ KYC Tier: 1
✓ Per-transaction limit: $1,000
✓ Daily limit: $2,000
✓ Amount $500: ALLOWED
✓ Amount $1,500: REJECTED (exceeds per-tx limit)
```

**Test Status**: ◻️ Pass / ◻️ Fail  
**Tier**: _______________  
**Limits Displayed**: _______________  
**Notes**: _______________

---

## Test Scenario 5: Private Transfer Flow

**Objective**: Execute complete private transfer (proof → verify → transfer)

### 5.1 Prepare Transfer

1. **Set amount**: `$500` (within Tier 1 limit)
2. **Set recipient**: `0x1234...` (test address on Sepolia)
3. **Verify**:
   - Amount within limits: ✓
   - Recipient is different from sender: ✓
   - KYC verified: ✓

### 5.2 Generate Proof

1. **Click "Generate ZK Proof"**
2. **Monitor**:
   - Progress display: "Step 1/4: Generating proof..."
   - Console logs proof generation
   - Takes 2-5 seconds

**Expected**:
```
✓ Proof generated
✓ Public inputs: [0x..., 0x...]
```

### 5.3 Verify On-Chain

1. **Automatically continues**: Step 2/4
2. **Expected**:
   - Wallet popup for verification transaction
   - Transaction submitted to Sepolia
   - Confirmation in 30-60 seconds

**Expected**:
```
✓ Verification successful
✓ Tx: 0x...
```

### 5.4 Execute Transfer

1. **Automatically continues**: Step 3/4
2. **Expected**:
   - Another wallet popup
   - Transfer transaction to Tongo
   - Gas estimation visible

**Expected**:
```
✓ Transfer submitted
✓ Tx: 0x...
```

### 5.5 Confirm Completion

1. **Final step**: 4/4
2. **Page should display**:
   - ✓ Success message
   - ✓ Final transaction hash
   - ✓ Recipient address
   - ✓ Amount transferred: $500 USDC

### 5.6 Verify on Starkscan

1. **Go to**: https://sepolia.starkscan.co
2. **Search**: Transfer transaction hash
3. **Expected**:
   - Status: ACCEPTED_ON_L2
   - Function: Private transfer function
   - Contract: ZKPassportVerifier or Tongo
   - Calldata includes encryption elements

**Test Status**: ◻️ Pass / ◻️ Fail  
**Amount**: _______________  
**Recipient**: _______________  
**Tx Hash**: _______________  
**Notes**: _______________

---

## Test Scenario 6: Balance Update

**Objective**: Verify balance reflects after transfer

### 6.1 Wait for Confirmation

After transfer (Test 5), wait 60 seconds for Sepolia confirmation.

### 6.2 Refresh Balance

1. **Click "Refresh Balance"** button (if available)
2. Or wait 30 seconds for automatic refresh

### 6.3 Verify New Balance

1. **Check encrypted balance**:
   - Should have decreased by $500
   - If started with $1,000, now shows ~$500

2. **Console should show**:
   ```
   ✓ Fetching encrypted balance...
   ✓ Balance updated
   ✓ New balance commitment: 0x...
   ```

**Expected**:
- ✓ Balance decreased by transferred amount
- ✓ UI reflects new balance
- ✓ No errors in console

**Test Status**: ◻️ Pass / ◻️ Fail  
**New Balance**: _______________  
**Notes**: _______________

---

## Test Scenario 7: Error Handling

**Objective**: Verify error messages and recovery

### 7.1 Test Invalid Recipient

1. **Try transfer with**:
   - Recipient: `0x0` (zero address)
2. **Expected error**: "Invalid recipient address"
3. **Button disabled**: ✓

### 7.2 Test Insufficient Balance

1. **Try transfer with**:
   - Amount: > current balance
2. **Expected error**: "Insufficient balance"
3. **UI shows remaining: X USDC**

### 7.3 Test Network Error Recovery

1. **Disconnect internet** (or mock in DevTools)
2. **Try to transfer**
3. **Expected**:
   - Loading spinner
   - Timeout after 15 seconds
   - Error: "Network timeout"
   - Retry button appears

4. **Reconnect internet** and click Retry
5. **Expected**: Transaction succeeds or shows specific error

### 7.4 Test Wallet Rejection

1. **Click "Generate Transfer"**
2. **When wallet popup appears, click "Reject"**
3. **Expected**:
   - Transfer cancelled
   - Error message: "User rejected transaction"
   - UI returns to transfer form
   - Can retry

**Test Status**: ◻️ Pass / ◻️ Fail  
**Errors Tested**: _______________  
**Notes**: _______________

---

## Test Scenario 8: Security Features

**Objective**: Verify security features are working

### 8.1 Replay Protection

1. **Copy previous transfer transaction hash**
2. **Try to resubmit** (manual, simulated):
   - Should fail with "Proof already used"
3. **Expected**:
   - Commitment deduplication prevents re-use
   - Contract rejects with error

### 8.2 Level Enforcement

1. **After KYC Tier 1 verification**
2. **Try to downgrade to Tier 0**:
   - Should fail with "Cannot downgrade KYC level"
   - Contract prevents downgrades

### 8.3 Session Protection

1. **Open two browser tabs** with app
2. **Verify in tab 1**
3. **Check tab 2**:
   - Should detect wallet connection in other tab
   - May show warning or auto-sync

### 8.4 Console Security

1. **Open DevTools → Console**
2. **Type**: `import.meta.env.VITE_STARKNET_RPC`
3. **Expected**: RPC URL visible (public info)
4. **Type**: `localStorage`
5. **Expected**: Private keys NOT stored in localStorage

**Test Status**: ◻️ Pass / ◻️ Fail  
**Security Notes**: _______________

---

## Performance Testing

### 9.1 Page Load Time

1. **Open DevTools → Network**
2. **Hard refresh**: Ctrl+Shift+R
3. **Measure**:
   - DOM Content Loaded: ___ ms
   - Full Page Load: ___ ms
   - Largest resource: ___ KB

**Target**:
- [ ] < 2000ms total
- [ ] < 500ms DOM ready

### 9.2 Proof Generation Time

1. **Generate proof** (Test 5.2)
2. **Measure time**: ___ seconds
3. **Target**: < 5 seconds

### 9.3 Transaction Confirmation Time

1. **Submit transfer** (Test 5.4)
2. **Measure time to ACCEPTED_ON_L2**: ___ seconds
3. **Target**: < 60 seconds

**Performance Status**: ◻️ Pass / ◻️ Fail

---

## Overall Test Results

| Test | Status | Notes |
|------|--------|-------|
| 1. Wallet Connection | ◻️ | |
| 2. KYC Verification | ◻️ | |
| 3. Balance Display | ◻️ | |
| 4. Limits Check | ◻️ | |
| 5. Private Transfer | ◻️ | |
| 6. Balance Update | ◻️ | |
| 7. Error Handling | ◻️ | |
| 8. Security Features | ◻️ | |
| 9. Performance | ◻️ | |

---

## Summary

### Tests Passed: ___ / 9
### Critical Issues: ___
### Minor Issues: ___

### Blockers for Production

- [ ] All transfers succeeded on Sepolia
- [ ] No critical console errors
- [ ] Balance updates correctly
- [ ] Error handling graceful
- [ ] Security features working
- [ ] Performance acceptable

---

## Logs & Evidence

For audit purposes, save:

- [ ] Screenshots of each test
- [ ] Console logs (copy to file)
- [ ] Starkscan transaction links
- [ ] Performance measurements
- [ ] Browser versions tested
- [ ] Wallet versions used

---

## Next Steps

1. **If all tests pass** → D4.5 (Security audit preparation)
2. **If failures found** → Fix and re-test
3. **If blockers** → Address before audit

---

**Test Date**: _______________  
**Tester**: _______________  
**Environment**: Sepolia Testnet  
**Build Version**: _______________

**Last Updated**: December 4, 2025
