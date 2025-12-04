# USDC Testnet - 5-Minute Quick Start

## 🎯 What You Need to Do in 5 MINUTES

### Phase 1: Setup (2 min)

```bash
# 1. Create wallet on Starknet Sepolia (if you don't have one)
# → https://www.argent.xyz or https://www.braavos.app/
# ⚠️ These are STARKNET wallets

# 2. Get ETH on ETHEREUM Sepolia (external to Starknet)
# → https://sepoliafaucet.com
# 📌 This is on Ethereum Sepolia, NOT Starknet yet

# 3. Swap ETH → USDC on Ethereum Sepolia
# → Uniswap: https://app.uniswap.org (select Sepolia)
# → Or any Ethereum DEX
# 📌 You're still on Ethereum, not Starknet

# 4. Bridge USDC from Ethereum Sepolia → Starknet Sepolia
# → https://starkgate.starknet.io/
# Select: Ethereum Sepolia → Starknet Sepolia
# 📌 Now your USDC is native on Starknet!
```

### Phase 2: Testing (3 min)

```bash
# 1. Start Treazury
bun run dev:web

# 2. Open http://localhost:3000

# 3. Connect wallet → Argent X or Braavos

# 4. Verify USDC balance is visible

# 5. Test the Fund flow:
#    Click "Fund" → "Approve USDC" → Confirm in wallet
#    Click "Fund again" → Confirm in wallet
#    View transaction on Starkscan Sepolia
```

---

## 📊 What to Look for on Each Screen

### Main Screen

```
┌─────────────────────────────────────┐
│  Connected: Your Address            │
│  Network: Starknet Sepolia ✓        │
│  Balance: 10 USDC                   │
└─────────────────────────────────────┘
```

**✅ Green = Correct**
- Network selector: "Sepolia Testnet"
- Balance shows a number (any amount of USDC)
- Status says "Connected"

### Tongo Card

```
┌─────────────────────────────────────┐
│  💰 Private Fund (Tongo)            │
│                                     │
│  Available: 10 USDC                 │
│  [Fund]      [Transfer]  [Withdraw] │
│                                     │
│  Status: Ready                      │
└─────────────────────────────────────┘
```

**✅ Green = Correct**
- Buttons are enabled (not grayed out)
- Status says "Ready"
- Available amount is positive

---

## 🔄 Step-by-Step Flows

### Flow 1: FUND (Deposit)

```
1. Click [Fund] button
   ↓
2. Enter "10" (or any amount)
   ↓
3. Click "Approve USDC"
   ↓
4. Wallet extension popup
   → Click "Approve"
   ↓
5. Wait 20-30 seconds
   ↓
6. Click "Fund" again
   ↓
7. Wallet extension popup
   → Click "Confirm"
   ↓
8. Wait 30-60 seconds
   ↓
✅ See "Fund successful!"
   → Tx Hash: 0x...
```

**Verify on Starkscan:**
```
https://sepolia.starkscan.io/

1. Search your wallet address (top right)
2. You should see:
   - 1 Approval tx (USDC approve)
   - 1 Fund tx (Tongo.fund call)
3. Click each one for details
```

---

### Flow 2: TRANSFER (Encrypted Transfer)

```
1. Click [Transfer] button
   ↓
2. Enter recipient address (another Sepolia wallet)
   ↓
3. Enter amount (ex: 5 USDC)
   ↓
4. Click "Transfer"
   ↓
5. Wallet extension popup
   → Click "Confirm"
   ↓
6. Wait 30-60 seconds
   ↓
✅ See "Transfer successful!"
   → Tx Hash: 0x...
   → 5 USDC sent encrypted
```

**Note:** The recipient CANNOT see the amount on-chain (encrypted with Tongo)

---

### Flow 3: WITHDRAW (Withdrawal)

```
1. Click [Withdraw] button
   ↓
2. Enter amount (ex: 5 USDC)
   ↓
3. Click "Withdraw"
   ↓
4. Wallet extension popup
   → Click "Confirm"
   ↓
5. Wait 30-60 seconds
   ↓
✅ See "Withdraw successful!"
   → Tx Hash: 0x...
   → 5 USDC sent to your wallet
```

**Verify:** Check balance in your wallet afterwards

---

## 🐛 Quick Troubleshooting

### ❌ "No USDC balance"

**Fix:**
1. Did you bridge USDC to Starknet Sepolia?
   → If not: Do bridge from Ethereum Sepolia
2. Is your wallet connected?
   → Click [Connect] again
3. Are you on Sepolia?
   → Switch to "Starknet Sepolia" in selector

---

### ❌ "Insufficient STRK for gas"

**Fix:**
1. You need STRK to pay gas fees
2. Get STRK at https://www.starkgate.io/
   Or request from Starknet faucet
3. Recommended minimum: 0.01 STRK

---

### ❌ "Approve failed"

**Fix:**
1. Verify you have USDC balance
2. Check you have STRK for gas
3. Try again
4. If persists: See USDC_TESTNET_GUIDE.md

---

### ❌ "Transfer/Fund times out"

**Fix:**
1. Wait a few more minutes
2. Check Starkscan if tx was sent
3. If not shown: Try with smaller amount
4. Verify no network issues

---

## ✅ Success = What It Looks Like

```
✅ EVERYTHING works if you see:

1. Wallet connected to Sepolia
2. USDC balance visible
3. Tongo card status "Ready"
4. Can execute Fund
5. Transaction appears on Starkscan
6. Balance updates after
7. Can do Transfer
8. Can do Withdraw
9. All balances match
```

---

## 📊 Verification Checklist

Mark as you complete:

- [ ] Wallet connected to Sepolia
- [ ] Have USDC balance
- [ ] Have STRK for gas
- [ ] Saw complete Fund flow
- [ ] Transaction on Starkscan
- [ ] Transfer worked
- [ ] Withdraw worked
- [ ] All balances correct

---

## 🎬 Next Steps

When EVERYTHING works:

```bash
# 1. Document what worked/what failed
# 2. Create GitHub issue/PR
# 3. Share logs and tx hashes if issues

# Info we need:
- Network (Sepolia)
- Wallet (Argent X / Braavos)
- Transactions executed
- Specific errors (if any)
- Screenshots of flows
```

---

## 🚀 Next: MAINNET

When Sepolia is 100% working:

```bash
# 1. Switch to Mainnet
# 2. Bridge real USDC from Ethereum Mainnet
# 3. Repeat all tests
# 4. Monitor real gas costs

⚠️ MAINNET = REAL MONEY
   Test with SMALL amounts first
```

---

## 📞 Support

If something doesn't work:

1. **Check browser console** (`F12` → Console tab)
2. **Read USDC_TESTNET_GUIDE.md**
3. **Check Starkscan** to see if tx arrived
4. **Restart server** (`bun run dev:web`)
5. **Ask in Starknet Discord**

---

⏱️ **Total time:** ~5 min setup + 5 min per flow = 15 min total

Ready to test! 🚀
