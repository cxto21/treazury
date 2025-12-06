# 🪙 USDC Deposit Service - Developer Guide

## Overview

El servicio de depósito USDC proporciona una interfaz completa para:
- ✅ Obtener balance de USDC
- ✅ Aprobar gasto de USDC al contrato Tongo
- ✅ Depositar USDC en Tongo vault
- ✅ Monitorear progreso con feedback paso a paso

## Architecture

```
┌────────────────────────────────────────┐
│     USDCDepositComponent (UI)          │
│  ├─ Input: amount                      │
│  ├─ Display: balance, progress         │
│  └─ Callback: onDepositComplete        │
└────────────┬───────────────────────────┘
             │
             ↓
┌────────────────────────────────────────┐
│   executeCompleteDeposit (Service)     │
│  ├─ Step 1: Verify balance             │
│  ├─ Step 2: Approve spending           │
│  ├─ Step 3: Deposit to Tongo           │
│  └─ Step 4: Verify deposit             │
└────────────┬───────────────────────────┘
             │
             ↓
┌────────────────────────────────────────┐
│   Starknet Smart Contracts             │
│  ├─ USDC ERC-20 (approve/transfer)     │
│  ├─ Tongo vault (receive deposit)      │
│  └─ Account (executes transactions)    │
└────────────────────────────────────────┘
```

## Usage

### 1. Backend Service (Node.js)

```typescript
import {
  getUSDCBalance,
  approveUSDCSpending,
  depositToTongo,
  executeCompleteDeposit,
  formatUSDC,
  parseUSDC
} from './usdc-deposit-service';
import { Account, RpcProvider } from 'starknet';

// Setup
const account = new Account(provider, address, signer);
const network = 'sepolia';

// Get balance
const balance = await getUSDCBalance(account, provider, network);
console.log('Balance:', formatUSDC(balance), 'USDC');

// Deposit 10 USDC
const amount = parseUSDC('10');
const result = await executeCompleteDeposit(
  account,
  provider,
  amount,
  network,
  (progress) => {
    console.log(`Step ${progress.currentStep}: ${progress.steps[progress.currentStep].title}`);
  }
);

if (result.success) {
  console.log('Deposit complete! TxHash:', result.depositTx);
} else {
  console.error('Deposit failed:', result.error);
}
```

### 2. React Component

```typescript
import USDCDepositComponent from './web/components/USDCDepositComponent';

export function MyApp() {
  return (
    <USDCDepositComponent
      account={walletAccount}
      provider={rpcProvider}
      network="sepolia"
      onDepositComplete={(amount, txHash) => {
        console.log(`Deposited ${formatUSDC(amount)} USDC`);
        console.log('TxHash:', txHash);
      }}
    />
  );
}
```

## API Reference

### Functions

#### `getUSDCBalance(account, provider, network)`

Get current USDC balance.

```typescript
const balance = await getUSDCBalance(account, provider, 'sepolia');
// Returns: BigInt (in 6 decimal format)

console.log(formatUSDC(balance)); // "10.5"
```

#### `formatUSDC(amount, decimals = 6)`

Format bigint to human-readable string.

```typescript
formatUSDC(BigInt('10500000')) // "10.5"
formatUSDC(BigInt('1000000'))  // "1"
```

#### `parseUSDC(amount, decimals = 6)`

Parse string to bigint (6 decimals).

```typescript
parseUSDC('10.5')  // BigInt('10500000')
parseUSDC('10')    // BigInt('10000000')
```

#### `approveUSDCSpending(account, provider, amount, network)`

Approve Tongo contract to spend USDC.

```typescript
const txHash = await approveUSDCSpending(
  account,
  provider,
  parseUSDC('10'),
  'sepolia'
);
```

**Returns**: Transaction hash (string)

#### `depositToTongo(account, provider, amount, network)`

Transfer USDC to Tongo vault.

```typescript
const txHash = await depositToTongo(
  account,
  provider,
  parseUSDC('10'),
  'sepolia'
);
```

**Returns**: Transaction hash (string)

#### `executeCompleteDeposit(account, provider, amount, network, onProgress?)`

Execute complete deposit flow (approve + deposit + verify).

```typescript
const result = await executeCompleteDeposit(
  account,
  provider,
  parseUSDC('10'),
  'sepolia',
  (progress) => {
    console.log('Current step:', progress.currentStep);
    console.log('Steps:', progress.steps);
  }
);

// Result:
// {
//   success: boolean;
//   approvalTx?: string;
//   depositTx?: string;
//   finalBalance?: bigint;
//   error?: string;
// }
```

#### `getDepositSteps()`

Get list of deposit process steps.

```typescript
const steps = getDepositSteps();
// Returns: Array of 4 USDCDepositStep objects
```

#### `getSetupInstructions()`

Get human-readable setup guide.

```typescript
const guide = getSetupInstructions();
console.log(guide);
```

#### `waitForTransaction(provider, txHash, maxWaitTime = 60000)`

Wait for transaction confirmation.

```typescript
await waitForTransaction(provider, txHash);
console.log('Transaction confirmed!');
```

### Types

```typescript
interface USDCDepositStep {
  step: number;
  title: string;
  description: string;
  action: string;
  timeEstimate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  error?: string;
}

interface DepositProgress {
  currentStep: number;
  steps: USDCDepositStep[];
  txHash?: string;
  fundedAmount?: bigint;
  tongoBalance?: bigint;
}
```

## Contract Addresses

### Sepolia Testnet

```typescript
USDC_SEPOLIA = '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8'
TONGO_SEPOLIA = '0x00b4cca30f0f641e01140c1c388f55641f1c3fe5515484e622b6cb91d8cee585'
```

### Mainnet

```typescript
USDC_MAINNET = '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8'
TONGO_MAINNET = '0x72098b84989a45cc00697431dfba300f1f5d144ae916e98287418af4e548d96'
```

## Transaction Flow

```
User clicks "Deposit 10 USDC"
  │
  ├─→ Step 1: Check Balance
  │   └─ Call: balanceOf(userAddress)
  │   └─ Verify: balance >= 10 USDC
  │
  ├─→ Step 2: Approve Spending
  │   └─ Call: approve(tongoAddress, 10 USDC)
  │   └─ Result: Tongo can now spend 10 USDC
  │   └─ TxHash: 0xabc...
  │
  ├─→ Step 3: Deposit to Tongo
  │   └─ Call: transfer(tongoAddress, 10 USDC)
  │   └─ Result: USDC moves to Tongo vault
  │   └─ TxHash: 0xdef...
  │
  ├─→ Step 4: Verify Deposit
  │   └─ Wait for confirmation
  │   └─ Check new balance
  │   └─ Display success
  │
  └─ ✅ Deposit Complete!
```

## Error Handling

All functions throw errors with descriptive messages:

```typescript
try {
  await approveUSDCSpending(account, provider, amount, 'sepolia');
} catch (error) {
  if (error.message.includes('Insufficient balance')) {
    console.log('User does not have enough USDC');
  } else if (error.message.includes('User rejected')) {
    console.log('User rejected transaction in wallet');
  } else {
    console.log('Unknown error:', error.message);
  }
}
```

## Testing

### Local Testnet Flow

```bash
# 1. Start dev server
bun run dev:web

# 2. In browser:
# - Connect wallet to Starknet Sepolia
# - Ensure USDC balance > 0
# - Click "Deposit USDC"
# - Confirm transactions in wallet
# - Monitor progress panel
# - Verify success message
```

### Manual Testing

```bash
# Check balance
# - Go to: https://starkscan.co
# - Contract: USDC address
# - Function: balanceOf
# - Input: your wallet address

# Verify transfer
# - Go to: https://starkscan.co
# - Transaction: <txHash>
# - Check "to_address" is Tongo
# - Check "value" is correct amount
```

## Best Practices

1. **Always call `getUSDCBalance()` before depositing**
   - Verify user has enough USDC
   - Update UI with current balance

2. **Use `formatUSDC()` for display**
   - Always show human-readable format
   - Never show raw bigint to users

3. **Handle progress callbacks**
   - Show step-by-step feedback
   - Disable UI during transaction
   - Show error messages clearly

4. **Wait for confirmation**
   - Don't assume success immediately
   - Use `waitForTransaction()` if needed
   - Check final balance after deposit

5. **Test on Sepolia first**
   - Get testnet USDC via faucet
   - Verify flow works
   - Then deploy to mainnet

## Troubleshooting

### Error: "Insufficient balance"

```typescript
const balance = await getUSDCBalance(account, provider, network);
if (balance < requestedAmount) {
  console.log('Need more USDC - visit Starkgate bridge');
}
```

### Error: "Approve call not generated"

- Check network is correct
- Verify Tongo contract address
- Ensure account has STRK for gas

### Transaction pending too long

```typescript
// Manually check status
const receipt = await provider.getTransactionReceipt(txHash);
console.log('Status:', receipt.status);
```

### UI not updating

- Reload page after transaction
- Use interval to refresh balance
- Check React key props

## Integration Example

Complete example in `src/web/components/USDCDepositComponent.tsx`

See:
- State management
- Progress tracking
- Error handling
- User feedback

## Performance

- Balance check: ~200ms
- Approve transaction: ~1-2 seconds (+ network time)
- Deposit transaction: ~1-2 seconds (+ network time)
- Total: ~5-10 minutes (including network confirmation)

## Security Considerations

1. **Private key protection**
   - Never expose private keys
   - Always use wallet interface
   - Account parameter already has signer

2. **Amount validation**
   - Parse user input carefully
   - Always check balance first
   - Prevent negative amounts

3. **Contract addresses**
   - Use official addresses only
   - Verify on Starkscan
   - Don't accept user input for addresses

4. **Gas fee management**
   - User wallet handles gas
   - Approve might fail if insufficient gas
   - Show clear error messages

---

For full integration example, see the React component at:
`src/web/components/USDCDepositComponent.tsx`

¡Que disfrutes integrando USDC deposits! 🚀
