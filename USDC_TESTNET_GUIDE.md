# 🪙 Testing Native USDC on Starknet Sepolia Testnet

## 📋 Overview

This guide shows how to test complete USDC native support on Starknet Sepolia testnet using Treazury + Tongo SDK + AVNU for DEX swaps.

### Current Status
- ✅ **Mainnet**: Native USDC fully supported
- ⚠️ **Sepolia**: STRK wrapper (for testnet)
- 🔄 **Goal**: Add USDC testnet support to Sepolia

### References
- [Native USDC Live on Starknet](https://www.starknet.io/blog/native-usdc-live-on-starknet/)
- [Circle USDC Bridge](https://www.circle.com/usdc)
- [Starknet Bridge](https://starkgate.starknet.io/)
- [AVNU DEX Aggregator](https://www.avnu.fi/)

---

## 🛠️ Step 1: Get USDC on Testnet

### Option A: Bridge from Ethereum Sepolia (Recommended)

**1.1 Get ETH on Ethereum Sepolia**
```bash
# Alchemy Faucet (recommended)
https://sepoliafaucet.com/

# Or Google Cloud Faucet
https://cloud.google.com/application/web3/faucet/ethereum/sepolia
```

**1.2 Swap ETH → USDC on Sepolia**
```bash
# Use Uniswap Sepolia
https://app.uniswap.org/

# Or mint USDC testnet directly:
# https://sepolia.etherscan.io/token/0x6aed99757d547b8e39cd1cebf11b45ff7e1bfd65
# (USDC Test Contract)
```

**1.3 Bridge USDC from Ethereum Sepolia to Starknet Sepolia**
```bash
# URL: https://starkgate.starknet.io/
# Select: Ethereum Sepolia → Starknet Sepolia
# Token: USDC
# Amount: 10-100 USDC
# Wait: ~5-10 minutes
```

**1.4 Verify Balance on Sepolia**
```bash
# In your wallet connected to Starknet Sepolia
# You should see USDC in your balance
```

### Option B: Testnet USDC Faucet (If available)

```bash
# Some providers offer USDC testnet directly
# Circle Testnet: https://testnet.circle.com/
```

---

## 🔗 Step 2: Configure Sepolia USDC Address

### 2.1 Update wallet-config.ts

Currently Sepolia uses STRK. Add USDC testnet support:

```typescript
export const NETWORKS: Record<Network, NetworkConfig> = {
  sepolia: {
    name: 'Sepolia Testnet',
    rpcUrl: 'https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_9/...',
    tongoContractAddress: '0x00b4cca30f0f641e01140c1c388f55641f1c3fe5515484e622b6cb91d8cee585',
    // Update to USDC testnet when available
    strkAddress: '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8', // USDC testnet
    chainId: 'SN_SEPOLIA'
  },
  // ...
};
```

### 2.2 USDC Addresses on Starknet

| Network | USDC Contract | Decimals |
|---------|---------------|----------|
| **Mainnet** | `0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8` | 6 |
| **Sepolia** | `0x0...` (TBD - awaiting Circle implementation) | 6 |
| **Testnet Legacy** | STRK wrapper | 18 |

---

## 🔄 Step 3: Tongo Private Fund Flow with AVNU

### 3.1 Complete Flow Architecture

```
User USDC → Tongo Fund → ZK Proof → Encrypted Balance
                        ↓
                  AVNU Swap Available
                 (STRK ↔ USDC)
```

### 3.2 Fund Operation

```typescript
// In VaultInterface.tsx or Tongo Card
const amountInUsdc = 10n * 10n ** 6n; // 10 USDC (decimals = 6)

// Flow:
// 1. User approves USDC to Tongo contract
// 2. Tongo SDK generates ZK proof of ownership
// 3. Transaction submitted to blockchain
// 4. Amount stored encrypted in Tongo
```

**Manual wallet steps:**
```
1. Click "Fund" in Tongo Card
2. Enter amount: 10
3. Click "Approve USDC"
4. Approve in wallet extension
5. Click "Fund" again
6. Approve transaction in wallet
7. Wait for confirmation (~30-60s)
```

### 3.3 Verify Transaction

```bash
# On Starkscan Sepolia
https://sepolia.starkscan.io/

# Search your wallet address
# You should see:
# 1. Approval tx (USDC transfer approval)
# 2. Fund tx (Tongo.fund call)
```

### 3.4 Transfer Flow (Encrypted)

```
Encrypted Balance → [Transfer] → Recipient Encrypted
                   1 tx with ZK proof
```

### 3.5 Withdraw Flow

```
Encrypted Balance → [Withdraw] → User USDC
                   1 tx
```

---

## 💱 Step 4: AVNU Swap Integration (Native Starknet DEX)

### 4.1 Why AVNU?

- **Native Starknet DEX Aggregator**: Best rates across all Starknet DEXes
- **STRK ↔ USDC Swaps**: Essential for mainnet donation flow
- **Low Fees**: Direct contract interaction
- **No Bridge Needed**: Works directly on Starknet
- **Liquidity**: Access to Ekubo, Jediswap, SithSwap, 10k Swap pools

### 4.2 AVNU Setup (Already Integrated)

```typescript
// avnu-service.ts - Already configured
import { getSwapQuote, buildSwapTransaction } from './avnu-service';

// Get quote for STRK → USDC on mainnet
const { quote } = await getSwapQuote(
  MAINNET_TOKENS.STRK,
  MAINNET_TOKENS.USDC,
  strkAmount,
  takerAddress
);

// Build transaction
const { calls } = await buildSwapTransaction(quote.quoteId, takerAddress, 0.01);
```

### 4.3 Complete STRK → USDC → Donation Flow

```typescript
// Step-by-step flow using AVNU on mainnet

// 1. Get STRK balance
const strkBalance = await getStrkBalance(userAddress);

// 2. Get AVNU quote for best rate
const { quote, usdcAmount } = await getStrkToUsdcQuote(
  strkBalance,
  userAddress,
  { slippage: 0.01 } // 1% slippage tolerance
);

// 3. Build AVNU swap transaction
const swapCalls = await buildStrkToUsdcSwap(
  strkBalance,
  userAddress,
  0.01
);

// 4. Execute swap
await wallet.account.execute(swapCalls);

// 5. Fund Tongo with resulting USDC
await tongoService.fundDonationAccount(usdcAmount);

// Now user can fund, transfer, and withdraw USDC privately!
```

### 4.4 Test AVNU on Mainnet (After Sepolia Works)

```bash
# 1. Get STRK on mainnet (from exchange or earned via activity)
# 2. Use AVNU to swap STRK → USDC
# 3. Compare rates vs direct bridge cost
# 4. Verify USDC received correctly
# 5. Fund donation account with swapped USDC
```

---

## 🧪 Step 5: CLI Testing (For Developers)

### 5.1 Setup .env

```bash
cp .env.example .env

# Set variables
STARKNET_RPC_URL=https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_9/YOUR_KEY
STARKNET_ACCOUNT_ADDRESS=0x...  # Your Sepolia wallet
STARKNET_PRIVATE_KEY=0x...       # Your private key (KEEP SAFE!)
STARKNET_NETWORK=sepolia
TONGO_CONTRACT_ADDRESS=0x00b4cca30f0f641e01140c1c388f55641f1c3fe5515484e622b6cb91d8cee585
USDC_ADDRESS=0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8
AVNU_API_URL=https://api.avnu.fi/v1  # AVNU API (optional for quotes)
```

### 5.2 Run CLI Demo

```bash
# Full USDC testnet flow
bun run demo

# Expected output:
# [CLI] Connecting to Starknet Sepolia...
# [CLI] Account: 0x...
# [CLI] Balance: X USDC
# [CLI] Generating Tongo private key...
# [CLI] Funding Tongo account with 10 USDC...
# [Transaction Hash: 0x...]
# [CLI] Transfer 5 USDC to recipient...
# [Transaction Hash: 0x...]
# [CLI] Withdraw 5 USDC to main account...
# [Transaction Hash: 0x...]
```

### 5.3 Manual RPC Calls

```bash
# 1. Check USDC balance
cast call 0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8 \
  "balanceOf(address)" 0x...YOUR_ADDRESS \
  --rpc-url https://starknet-sepolia.g.alchemy.com/...

# 2. Check Tongo contract
cast call 0x00b4cca30f0f641e01140c1c388f55641f1c3fe5515484e622b6cb91d8cee585 \
  "get_balance(address)" 0x...YOUR_ADDRESS \
  --rpc-url https://starknet-sepolia.g.alchemy.com/...

# 3. Approve USDC to Tongo
cast send 0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8 \
  "approve(address,uint256)" \
  0x00b4cca30f0f641e01140c1c388f55641f1c3fe5515484e622b6cb91d8cee585 \
  1000000 \
  --private-key 0x... \
  --rpc-url https://starknet-sepolia.g.alchemy.com/...
```

### 5.4 Test AVNU Integration (On Mainnet)

```bash
# Get AVNU quote for STRK → USDC
curl https://api.avnu.fi/v1/quotes \
  -X GET \
  -G \
  --data-urlencode 'sellTokenAddress=0x04718f5a...' \
  --data-urlencode 'buyTokenAddress=0x053c91...' \
  --data-urlencode 'sellAmount=1000000000000000000' \
  --data-urlencode 'takerAddress=0x...YOUR_ADDRESS'

# Build and execute swap
bun run build-swap --swap-quote '<quote_id>'
```

---

## 📊 Complete Testing Checklist

- [ ] **Wallet Connection**
  - [ ] Connect Argent X to Sepolia
  - [ ] Connect Braavos to Sepolia
  - [ ] Verify network selector shows "Sepolia"

- [ ] **Balance Display**
  - [ ] Show USDC balance (if present)
  - [ ] Show STRK balance for gas fees
  - [ ] Update balance after transaction

- [ ] **Fund Flow**
  - [ ] Approve USDC to Tongo
  - [ ] Fund Tongo account with USDC
  - [ ] Verify encrypted balance updated
  - [ ] Check transaction on Starkscan

- [ ] **Transfer Flow**
  - [ ] Generate ZK proof
  - [ ] Transfer USDC to recipient
  - [ ] Recipient receives encrypted amount
  - [ ] Verify transactions on Starkscan

- [ ] **Withdraw Flow**
  - [ ] Generate ZK proof of ownership
  - [ ] Withdraw USDC to main wallet
  - [ ] Verify balance in wallet
  - [ ] Check transaction on Starkscan

- [ ] **AVNU Integration (Mainnet)**
  - [ ] Get AVNU quote STRK → USDC
  - [ ] Build and execute swap
  - [ ] Verify received USDC

- [ ] **Edge Cases**
  - [ ] Insufficient USDC balance
  - [ ] Insufficient STRK for gas
  - [ ] Network disconnection
  - [ ] Invalid recipient address
  - [ ] Large amounts (> 1000 USDC)

---

## 🔍 Debugging

### Issue: "USDC Address not found"

```typescript
// Verify correct address in wallet-config.ts
console.log('USDC Address:', NETWORKS.sepolia.strkAddress);

// Alternative: Add dynamic token selector
const TOKENS = {
  sepolia: {
    usdc: '0x...', // When available
    strk: '0x04718f5a...' // Fallback for testnet
  }
};
```

### Issue: "Insufficient balance for approval"

```bash
# 1. Verify you have USDC in your wallet
# 2. Ensure you have STRK for gas fees
# 3. Request both from faucet
```

### Issue: "Tongo contract not found"

```typescript
// Verify contract address
const contractAddress = NETWORKS.sepolia.tongoContractAddress;
console.log('Tongo Contract:', contractAddress);

// If not exists, deploy test contract
sncast --profile sepolia deploy --contract-name TongoTest
```

### Issue: "Transaction rejected by wallet"

```
1. Verify network is correct (Sepolia)
2. Validate recipient address
3. Confirm you approved token before
4. Try with smaller amount first
```

### Issue: "AVNU Quote Failed"

```typescript
// Verify AVNU service is accessible
// Check API response for slippage errors
const quote = await getSwapQuote(
  STRK_TOKEN,
  USDC_TOKEN,
  amount,
  userAddress
);

if (!quote.success) {
  console.error('AVNU Error:', quote.error);
  // May need higher slippage tolerance
}
```

---

## 📈 Performance Benchmarks

| Operation | Time | Gas (STRK) | Notes |
|-----------|------|-----------|-------|
| Connect Wallet | 1-2s | 0 | Local |
| Fund (Approve) | 10-15s | 0.001 | 1 tx |
| Fund (Deposit) | 10-15s | 0.002 | 1 tx |
| Transfer | 10-15s | 0.002 | ZK proof gen: ~2s |
| Withdraw | 10-15s | 0.002 | 1 tx |
| AVNU Swap | 15-20s | 0.003 | STRK ↔ USDC |

---

## 🚢 Migration to Mainnet

Once tested on Sepolia:

### 1. Update wallet-config.ts

```typescript
mainnet: {
  name: 'Starknet Mainnet',
  rpcUrl: 'https://starknet-mainnet.g.alchemy.com/...',
  tongoContractAddress: '0x72098b84989a45cc00697431dfba300f1f5d144ae916e98287418af4e548d96',
  strkAddress: '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8', // USDC mainnet
  chainId: 'SN_MAIN'
}
```

### 2. Get USDC Mainnet

```bash
# Bridge from Ethereum Mainnet
# https://starkgate.starknet.io/
# ETH Mainnet → Starknet Mainnet
# USDC (Ethereum) → USDC (Starknet)
```

### 3. Update Deployment Records

```json
// deployments/mainnet.json
{
  "network": "mainnet",
  "contracts": {
    "tongo": {
      "address": "0x72098b...",
      "notes": "USDC native support"
    },
    "usdc": {
      "address": "0x053c91...",
      "notes": "Native Circle USDC"
    },
    "avnu": {
      "notes": "DEX aggregator for STRK ↔ USDC swaps"
    }
  }
}
```

---

## 📚 Useful References

- [Starknet Native USDC Blog](https://www.starknet.io/blog/native-usdc-live-on-starknet/)
- [Starkgate Bridge](https://starkgate.starknet.io/)
- [Tongo SDK Docs](https://github.com/omarespejel/tongo-sdk)
- [AVNU DEX Aggregator](https://www.avnu.fi/)
- [Starkscan Sepolia Explorer](https://sepolia.starkscan.io/)
- [Starknet Sepolia RPC](https://starknet-sepolia.public.blastapi.io)
- [Circle USDC Cross-Chain](https://www.circle.com/usdc)
- [Starknet Docs](https://docs.starknet.io/)

---

## ⚠️ Security Considerations

### Never

- ❌ Commit `.env` with private keys
- ❌ Share private keys in logs or console
- ❌ Use production keys for testing
- ❌ Deploy without contract audits

### Always

- ✅ Use testnets for development
- ✅ Rotate keys after testing
- ✅ Validate addresses before transfers
- ✅ Test with small amounts first
- ✅ Keep secure backups of private keys
- ✅ Monitor AVNU slippage settings

---

## 📞 Support

If you encounter issues:

1. Check [GitHub Issues](https://github.com/cxto21/treazury/issues)
2. Review [Starknet Docs](https://docs.starknet.io/)
3. Ask in [Starknet Discord](https://discord.gg/starknet)
4. Create detailed bug report with:
   - Network (Sepolia/Mainnet)
   - Wallet (Argent/Braavos)
   - Complete error message
   - Transaction hash (if applicable)
   - Screenshots

---

## 📊 Advanced: AVNU Mainnet Flow

### Complete STRK → USDC Flow on Mainnet

```typescript
// 1. Get STRK balance
const strkBalance = await getStrkBalance(userAddress);

// 2. Get AVNU quote
const { quote, usdcAmount } = await getStrkToUsdcQuote(
  strkBalance,
  userAddress
);

// 3. Execute swap
const swapCalls = await buildStrkToUsdcSwap(
  strkBalance,
  userAddress,
  0.01 // 1% slippage
);

// 4. Send transaction
await wallet.account.execute(swapCalls);

// 5. Fund Tongo with resulting USDC
await tongoService.fundDonationAccount(usdcAmount);
```

---

✅ **Ready to test USDC on Starknet!** 🚀
