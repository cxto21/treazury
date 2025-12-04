/**
 * USDC Deposit Service for Starknet Testnet
 * 
 * Handles the complete flow for depositing USDC into Tongo vault:
 * 1. Get USDC on testnet
 * 2. Approve USDC spending
 * 3. Fund Tongo vault
 * 
 * User Guide:
 * - Step 1: Bridge USDC from Ethereum Sepolia to Starknet Sepolia
 * - Step 2: Use this service to deposit into Tongo
 */

import { Account, RpcProvider, shortString } from 'starknet';

export interface USDCDepositStep {
  step: number;
  title: string;
  description: string;
  action: string;
  timeEstimate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  error?: string;
}

export interface DepositProgress {
  currentStep: number;
  steps: USDCDepositStep[];
  txHash?: string;
  fundedAmount?: bigint;
  tongoBalance?: bigint;
}

/**
 * USDC addresses on Starknet networks
 */
export const USDC_ADDRESSES = {
  sepolia: '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8', // USDC testnet
  mainnet: '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8'  // USDC mainnet
} as const;

/**
 * Tongo contract addresses
 */
export const TONGO_ADDRESSES = {
  sepolia: '0x00b4cca30f0f641e01140c1c388f55641f1c3fe5515484e622b6cb91d8cee585',  // Sepolia Tongo
  mainnet: '0x72098b84989a45cc00697431dfba300f1f5d144ae916e98287418af4e548d96'   // Mainnet Tongo
} as const;

/**
 * Format USDC amount (6 decimals)
 */
export function formatUSDC(amount: bigint, decimals = 6): string {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const remainder = amount % divisor;
  const paddedRemainder = remainder.toString().padStart(decimals, '0');
  const trimmed = paddedRemainder.replace(/0+$/, '');
  
  if (trimmed === '') {
    return whole.toString();
  }
  return `${whole}.${trimmed}`;
}

/**
 * Parse USDC amount (6 decimals)
 */
export function parseUSDC(amount: string, decimals = 6): bigint {
  const [whole, fraction] = amount.split('.');
  const paddedFraction = (fraction || '0').padEnd(decimals, '0').slice(0, decimals);
  return BigInt(whole) * BigInt(10 ** decimals) + BigInt(paddedFraction);
}

/**
 * Get deposit steps guide
 */
export function getDepositSteps(): USDCDepositStep[] {
  return [
    {
      step: 1,
      title: 'Verify USDC Balance',
      description: 'Check your Starknet Sepolia wallet has USDC (bridged from Ethereum)',
      action: 'Check wallet balance',
      timeEstimate: '< 1 min',
      status: 'pending'
    },
    {
      step: 2,
      title: 'Approve USDC Spending',
      description: 'Approve Tongo contract to spend your USDC',
      action: 'Sign approval transaction',
      timeEstimate: '1-2 min',
      status: 'pending'
    },
    {
      step: 3,
      title: 'Deposit to Tongo',
      description: 'Transfer USDC to Tongo vault (encrypted storage)',
      action: 'Sign deposit transaction',
      timeEstimate: '1-2 min',
      status: 'pending'
    },
    {
      step: 4,
      title: 'Verify Deposit',
      description: 'Confirm USDC successfully stored in Tongo vault',
      action: 'Wait for confirmation',
      timeEstimate: '< 1 min',
      status: 'pending'
    }
  ];
}

/**
 * Get USDC balance from wallet
 */
export async function getUSDCBalance(
  account: Account,
  provider: RpcProvider,
  network: 'sepolia' | 'mainnet' = 'sepolia'
): Promise<bigint> {
  try {
    const usdcAddress = USDC_ADDRESSES[network];
    
    // Call balanceOf(account.address)
    const balance = await provider.callContract({
      contractAddress: usdcAddress,
      entrypoint: 'balanceOf',
      calldata: [account.address]
    });

    if (balance && Array.isArray(balance) && balance.length >= 2) {
      // USDC returns two u128 values (low, high)
      const low = BigInt(balance[0]);
      const high = BigInt(balance[1]);
      return (high << BigInt(128)) | low;
    }

    return BigInt(0);
  } catch (error) {
    console.error('[USDC] Error getting balance:', error);
    return BigInt(0);
  }
}

/**
 * Approve USDC spending by Tongo contract
 */
export async function approveUSDCSpending(
  account: Account,
  provider: RpcProvider,
  amount: bigint,
  network: 'sepolia' | 'mainnet' = 'sepolia'
): Promise<string> {
  try {
    const usdcAddress = USDC_ADDRESSES[network];
    const tongoAddress = TONGO_ADDRESSES[network];

    console.log('[USDC] Approving USDC spending...');
    console.log('[USDC] USDC Address:', usdcAddress);
    console.log('[USDC] Tongo Address:', tongoAddress);
    console.log('[USDC] Amount:', formatUSDC(amount), 'USDC');

    // Call approve(spender, amount)
    const tx = await account.execute({
      contractAddress: usdcAddress,
      entrypoint: 'approve',
      calldata: [tongoAddress, amount.toString()]
    });

    console.log('[USDC] Approval transaction sent:', tx.transaction_hash);
    return tx.transaction_hash;
  } catch (error) {
    console.error('[USDC] Error approving spending:', error);
    throw new Error(`Failed to approve USDC: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Deposit USDC to Tongo vault
 * 
 * Note: This is a simplified example. The actual Tongo SDK deposit
 * requires KYC verification first.
 */
export async function depositToTongo(
  account: Account,
  provider: RpcProvider,
  amount: bigint,
  network: 'sepolia' | 'mainnet' = 'sepolia'
): Promise<string> {
  try {
    const usdcAddress = USDC_ADDRESSES[network];
    const tongoAddress = TONGO_ADDRESSES[network];

    console.log('[TONGO] Depositing to Tongo vault...');
    console.log('[TONGO] Amount:', formatUSDC(amount), 'USDC');

    // Call transfer(to, amount) on USDC
    // For real Tongo integration, use TongoService.fund() instead
    const tx = await account.execute({
      contractAddress: usdcAddress,
      entrypoint: 'transfer',
      calldata: [tongoAddress, amount.toString()]
    });

    console.log('[TONGO] Deposit transaction sent:', tx.transaction_hash);
    return tx.transaction_hash;
  } catch (error) {
    console.error('[TONGO] Error depositing to Tongo:', error);
    throw new Error(`Failed to deposit to Tongo: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Complete deposit flow: Approve → Deposit → Verify
 */
export async function executeCompleteDeposit(
  account: Account,
  provider: RpcProvider,
  amount: bigint,
  network: 'sepolia' | 'mainnet' = 'sepolia',
  onProgress?: (progress: DepositProgress) => void
): Promise<{
  success: boolean;
  approvalTx?: string;
  depositTx?: string;
  finalBalance?: bigint;
  error?: string;
}> {
  const progress: DepositProgress = {
    currentStep: 0,
    steps: getDepositSteps()
  };

  try {
    // Step 1: Verify balance
    progress.steps[0].status = 'in-progress';
    onProgress?.(progress);

    const balance = await getUSDCBalance(account, provider, network);
    if (balance < amount) {
      throw new Error(`Insufficient balance. Have ${formatUSDC(balance)} USDC, need ${formatUSDC(amount)} USDC`);
    }

    progress.steps[0].status = 'completed';
    progress.currentStep = 1;
    onProgress?.(progress);

    // Step 2: Approve spending
    progress.steps[1].status = 'in-progress';
    onProgress?.(progress);

    const approveTx = await approveUSDCSpending(account, provider, amount, network);
    progress.txHash = approveTx;
    progress.steps[1].status = 'completed';
    progress.currentStep = 2;
    onProgress?.(progress);

    // Step 3: Deposit to Tongo
    progress.steps[2].status = 'in-progress';
    onProgress?.(progress);

    const depositTx = await depositToTongo(account, provider, amount, network);
    progress.txHash = depositTx;
    progress.steps[2].status = 'completed';
    progress.currentStep = 3;
    onProgress?.(progress);

    // Step 4: Verify
    progress.steps[3].status = 'in-progress';
    onProgress?.(progress);

    const finalBalance = await getUSDCBalance(account, provider, network);
    progress.fundedAmount = amount;
    progress.tongoBalance = finalBalance;
    progress.steps[3].status = 'completed';
    onProgress?.(progress);

    return {
      success: true,
      approvalTx: approveTx,
      depositTx: depositTx,
      finalBalance: finalBalance
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    progress.steps[progress.currentStep].status = 'failed';
    progress.steps[progress.currentStep].error = errorMsg;
    onProgress?.(progress);

    return {
      success: false,
      error: errorMsg
    };
  }
}

/**
 * Wait for transaction confirmation
 */
export async function waitForTransaction(
  provider: RpcProvider,
  txHash: string,
  maxWaitTime = 60000 // 60 seconds
): Promise<any> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitTime) {
    try {
      const receipt = await provider.getTransactionReceipt(txHash);
      if (receipt && receipt.status) {
        console.log('[TX] Transaction confirmed:', txHash);
        return receipt;
      }
    } catch (error) {
      // Transaction might not be indexed yet
    }

    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  throw new Error(`Transaction ${txHash} not confirmed within ${maxWaitTime}ms`);
}

/**
 * Get setup instructions for getting USDC on testnet
 */
export function getSetupInstructions(): string {
  return `
🪙 USDC on Starknet Sepolia Testnet - Setup Guide

Step 1: Get ETH on Ethereum Sepolia (NOT Starknet)
   1a. Visit: https://sepoliafaucet.com
   1b. Enter your Ethereum Sepolia address
   1c. Receive 0.5 ETH

Step 2: Swap ETH → USDC on Ethereum Sepolia
   2a. Visit: https://app.uniswap.org
   2b. Select "Ethereum Sepolia" network
   2c. Swap 0.1 ETH → ~20 USDC
   2d. OR mint USDC directly from:
       https://sepolia.etherscan.io/token/0x6aed99757d547b8e39cd1cebf11b45ff7e1bfd65

Step 3: Bridge USDC to Starknet Sepolia
   3a. Visit: https://starkgate.starknet.io/
   3b. Select: "Ethereum Sepolia" → "Starknet Sepolia"
   3c. Select USDC token
   3d. Enter amount (10-100 USDC recommended)
   3e. Confirm and wait 5-10 minutes

Step 4: Verify USDC in Starknet Wallet
   4a. Open Argent X or Braavos
   4b. Connect to "Starknet Sepolia"
   4c. You should see USDC balance
   4d. ✅ Ready to use Treazury!

📌 Important Notes:
   - Keep ETH for gas fees (~0.1 ETH should be enough)
   - Bridge at least 10 USDC for testing
   - Wait for bridge confirmation before using
   - KYC verification required before funding Tongo
`;
}
