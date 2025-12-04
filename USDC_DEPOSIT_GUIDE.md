# 🪙 Deposit USDC on Testnet - Complete Guide

## 📋 Quick Summary

To test Treazury with USDC on testnet you need:

1. **Get ETH on Ethereum Sepolia** (faucet)
2. **Swap ETH → USDC** on Ethereum
3. **Bridge USDC to Starknet Sepolia** (Starkgate)
4. **Deposit USDC to Tongo** (via Treazury UI)

**Total time: ~30 minutes**

---

## 🚀 Step 1: Get ETH on Ethereum Sepolia

### What is Ethereum Sepolia?
- Test network **SEPARATE** from Starknet
- You need ETH here to pay for gas on Ethereum
- Don't confuse with Starknet

### Option A: Alchemy Faucet (Recommended)

1. Go to https://sepoliafaucet.com
2. Connect wallet (Argent X, Braavos, MetaMask)
3. **⚠️ SWITCH TO ETHEREUM SEPOLIA IN YOUR WALLET**
4. Click "Send me ETH"
5. Receive 0.5 ETH in ~1 minute

### Option B: Google Cloud Faucet

1. Go to https://cloud.google.com/application/web3/faucet/ethereum/sepolia
2. Enter your Ethereum address
3. Receive 0.5 ETH

### ✅ Verify

In your wallet on **Ethereum Sepolia**, you should see:
```
Balance: 0.5 ETH
Network: Ethereum Sepolia
```

---

## 💱 Step 2: Swap ETH → USDC on Ethereum Sepolia

### On Uniswap

1. Go to https://app.uniswap.org
2. **Verify that it says "Ethereum Sepolia"** in the network selector
3. Connect your wallet
4. Swap:
   - From: 0.1 ETH
   - To: USDC
5. Click "Swap"
6. Confirm in your wallet
7. Wait ~1 minute

### How much USDC will I receive?

```
0.1 ETH ≈ 20-30 USDC (depends on price)
```

### ✅ Verify

In your wallet on **Ethereum Sepolia**, you should see:
```
Balance: ~0.4 ETH, ~20 USDC
Network: Ethereum Sepolia
```

### Option: Mint USDC Directly

If you prefer not to swap, you can mint testnet USDC:

1. Go to https://sepolia.etherscan.io/token/0x6aed99757d547b8e39cd1cebf11b45ff7e1bfd65
2. Click "Write Contract"
3. Connect your wallet
4. Call the `mint()` function (with your address)
5. Receive testnet USDC

---

## 🌉 Step 3: Bridge USDC to Starknet Sepolia

### Use Starkgate (Official)

1. Go to https://starkgate.starknet.io/
2. Connect your wallet (verify it's on **Ethereum Sepolia**)
3. Select:
   - Origin: "Ethereum Sepolia"
   - Destination: "Starknet Sepolia"
   - Token: "USDC"
4. Enter amount (recommended: 10 USDC minimum)
5. Click "Bridge"
6. Confirm in your wallet
7. **WAIT 5-10 MINUTES** ⏳

### During the Bridge

```
Status: "Bridging in progress"
Estimated: 5-10 minutes
```

Don't close the tab.

### ✅ After the Bridge

In your wallet on **Starknet Sepolia**, you should see:
```
Balance: 10 USDC
Network: Starknet Sepolia
```

---

## 🔗 Step 4: Deposit to Tongo via Treazury

### Use Treazury UI

1. Open http://localhost:3000 (or your Treazury instance)
2. Connect wallet → "Starknet Sepolia"
3. Verify USDC balance (should show ~10 USDC)
4. Click "💰 Deposit USDC"
5. Enter amount (e.g., 5 USDC)
6. Click "💳 Deposit to Tongo"
7. **IMPORTANT: Complete KYC first** (if not verified)
8. Confirm in your wallet:
   - Approval (approve)
   - Deposit (transfer)
9. Wait for confirmation (~1-2 minutes)

### Progress Panel

You will see 4 steps:
```
✅ Verify Balance
   ↓
⏳ Approve USDC
   ↓
⏳ Deposit to Tongo
   ↓
⏳ Verify Deposit
```

### ✅ After Deposit

```
✅ Balance updated
✅ Funds in Tongo (encrypted)
✅ Ready for private transfers
```

---

## 🔧 Troubleshooting

### ❌ Error: "Insufficient Balance"

**Cause**: You don't have enough USDC
**Solution**: 
- Check your wallet balance
- Log in to https://starkgate.starknet.io/ to see bridge status
- Wait for confirmation if still in progress

### ❌ Error: "Network Mismatch"

**Cause**: Wallet connected to wrong network
**Solution**:
- In wallet, select "Ethereum Sepolia" for swaps
- In wallet, select "Starknet Sepolia" for bridge and Treazury
- Verify network selector on each site

### ❌ Error: "KYC Required"

**Cause**: You haven't completed identity verification
**Solution**:
- In Treazury, click "Verify Identity" or "Verify KYC"
- Follow the verification steps
- Wait for confirmation (~1 minute)
- Retry deposit

### ❌ Bridge not confirmed after 15 minutes

**Cause**: Network congestion or delay
**Solution**:
- Wait longer (up to 30 minutes sometimes)
- Check hash on https://starkscan.co/
- Contact Starkgate support if persists

---

## 📊 Complete Flow (Diagram)

```
┌─ ETHEREUM SEPOLIA ────────────────────────────────┐
│                                                   │
│  1. Faucet → 0.5 ETH                             │
│     ↓                                             │
│  2. Uniswap → 0.1 ETH → 20 USDC                  │
│     ↓                                             │
│  3. Starkgate Bridge                             │
│     └──────────────────────────────────┐          │
│                                        │          │
└────────────────────────────────────────┼──────────┘
                                         │
                                   (5-10 min)
                                         │
                                         ↓
┌─ STARKNET SEPOLIA ────────────────────────────────┐
│                                                   │
│  4. USDC Balance                                  │
│     ↓                                             │
│  5. KYC Verification (if not done)                │
│     ↓                                             │
│  6. Treazury → Deposit USDC                       │
│     ├─ Approve (signature 1)                     │
│     ├─ Deposit (signature 2)                     │
│     └─ ✅ Funds in Tongo                         │
│                                                   │
│  7. Ready to use                                  │
│                                                   │
└───────────────────────────────────────────────────┘
```

---

## 💡 Useful Tips

### Keep Gas Fees in Reserve
```
Keep ~0.05 ETH on Ethereum Sepolia for gas fees
Keep ~0.01 STRK on Starknet Sepolia for gas fees
```

### For Testnet

```
USDC on Ethereum Sepolia: 0x6aed99757d547b8e39cd1cebf11b45ff7e1bfd65
USDC on Starknet Sepolia: 0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8
Tongo Sepolia: 0x00b4cca30f0f641e01140c1c388f55641f1c3fe5515484e622b6cb91d8cee585
```

### Monitor Transactions

```
Ethereum: https://sepolia.etherscan.io
Starknet: https://starkscan.co (select Sepolia)
```

### Timeline

| Step | Time |
|------|------|
| Faucet | 1 min |
| Swap | 1 min |
| Bridge | 5-10 min |
| Deposit | 1-2 min |
| **Total** | **~20 min** |

---

## ✅ Final Checklist

- [ ] 0.5 ETH on Ethereum Sepolia
- [ ] ~20 USDC on Ethereum Sepolia
- [ ] 10 USDC on Starknet Sepolia (via bridge)
- [ ] Wallet connected to Starknet Sepolia in Treazury
- [ ] Balance shows USDC in Treazury
- [ ] KYC verified (if necessary)
- [ ] Deposit completed successfully
- [ ] Funds visible in Tongo vault

---

## 🎉 All Set!

You now have USDC on Starknet Sepolia and can fully test Treazury.

### Next Steps

- Private transfers (Private Transfer)
- Lightning Network integration
- Anonymous donations
- Fund withdrawal

---

## 📞 Support

If you have issues:
1. Check the checklist above
2. Review status on Starkscan.co
3. Wait for bridge confirmation (may take 10 min)
4. Ensure network selector is correct

Enjoy testing Treazury! 🚀
