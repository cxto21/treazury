/**
 * TreazuryVault v2.0 Service
 * Direct integration with deployed contract on Ztarknet
 */

import { Contract, RpcProvider, Account, cairo, num } from 'starknet';
import type { StarknetWindowObject } from 'get-starknet-core';

// Contract addresses from deployment
const TREAZURY_VAULT_ADDRESS = '0x04cbe8011bddc3fa7d7832db096122f3ec5bb937f5bf5b3db852319664239196';
const ZTARKNET_RPC = 'https://ztarknet-madara.d.karnot.xyz';

// Simplified ABI - only methods we need
const VAULT_ABI = [
  {
    type: 'function',
    name: 'get_encrypted_balance',
    inputs: [{ name: 'account', type: 'core::starknet::contract_address::ContractAddress' }],
    outputs: [{ type: 'core::felt252' }],
    state_mutability: 'view',
  },
  {
    type: 'function',
    name: 'deposit',
    inputs: [
      { name: 'encrypted_amount', type: 'core::felt252' },
      { name: 'commitment', type: 'core::felt252' },
    ],
    outputs: [],
    state_mutability: 'external',
  },
  {
    type: 'function',
    name: 'withdraw',
    inputs: [
      { name: 'encrypted_amount', type: 'core::felt252' },
      { name: 'proof', type: 'core::felt252' },
    ],
    outputs: [],
    state_mutability: 'external',
  },
  {
    type: 'function',
    name: 'transfer',
    inputs: [
      { name: 'to', type: 'core::starknet::contract_address::ContractAddress' },
      { name: 'encrypted_amount', type: 'core::felt252' },
      { name: 'proof', type: 'core::felt252' },
    ],
    outputs: [],
    state_mutability: 'external',
  },
  {
    type: 'function',
    name: 'is_paused',
    inputs: [],
    outputs: [{ type: 'core::bool' }],
    state_mutability: 'view',
  },
  {
    type: 'function',
    name: 'get_owner',
    inputs: [],
    outputs: [{ type: 'core::starknet::contract_address::ContractAddress' }],
    state_mutability: 'view',
  },
] as const;

/**
 * Get RPC provider
 */
function getProvider(): RpcProvider {
  return new RpcProvider({ nodeUrl: ZTARKNET_RPC });
}

/**
 * Get contract instance (read-only)
 */
function getContract(): Contract {
  const provider = getProvider();
  return new Contract(VAULT_ABI, TREAZURY_VAULT_ADDRESS, provider);
}

/**
 * Get contract instance with wallet for transactions
 */
function getContractWithWallet(wallet: StarknetWindowObject): Contract {
  if (!wallet.account) {
    throw new Error('Wallet not connected');
  }
  return new Contract(VAULT_ABI, TREAZURY_VAULT_ADDRESS, wallet.account);
}

/**
 * Check if vault is paused
 */
export async function isVaultPaused(): Promise<boolean> {
  try {
    const contract = getContract();
    const result = await contract.is_paused();
    return Boolean(result);
  } catch (error) {
    console.error('Error checking vault status:', error);
    return false;
  }
}

/**
 * Get encrypted balance for an account
 * Returns the Poseidon commitment (not decryptable on-chain)
 */
export async function getEncryptedBalance(address: string): Promise<{
  commitment: string;
  isZero: boolean;
}> {
  try {
    const contract = getContract();
    const balance = await contract.get_encrypted_balance(address);
    
    const commitment = num.toHex(balance);
    const isZero = commitment === '0x0' || commitment === '0x00';

    console.log('✓ Balance retrieved:', { address: address.slice(0, 10) + '...', commitment: commitment.slice(0, 20) + '...' });

    return { commitment, isZero };
  } catch (error) {
    console.error('Error fetching balance:', error);
    return { commitment: '0x0', isZero: true };
  }
}

/**
 * Deposit funds (mock encrypted amount for now)
 */
export async function deposit(
  wallet: StarknetWindowObject,
  amount: number
): Promise<{ txHash: string; success: boolean; error?: string }> {
  try {
    const contract = getContractWithWallet(wallet);
    
    // For MVP: Use simple encryption (replace with real Poseidon in production)
    const encryptedAmount = cairo.felt(Math.floor(amount * 1e6)); // USDC has 6 decimals
    const commitment = cairo.felt(Math.floor(Math.random() * 1e15)); // Mock commitment

    const tx = await contract.deposit(encryptedAmount, commitment);
    await wallet.account!.waitForTransaction(tx.transaction_hash);

    console.log('✓ Deposit successful:', tx.transaction_hash);

    return {
      txHash: tx.transaction_hash,
      success: true,
    };
  } catch (error) {
    console.error('Deposit failed:', error);
    return {
      txHash: '',
      success: false,
      error: error instanceof Error ? error.message : 'Deposit failed',
    };
  }
}

/**
 * Transfer funds to another account
 */
export async function transfer(
  wallet: StarknetWindowObject,
  recipient: string,
  amount: number
): Promise<{ txHash: string; success: boolean; error?: string }> {
  try {
    const contract = getContractWithWallet(wallet);
    
    // For MVP: Simple encryption (replace with real Poseidon + ZK proof)
    const encryptedAmount = cairo.felt(Math.floor(amount * 1e6));
    const mockProof = cairo.felt(12345); // TODO: Generate real ZK proof

    const tx = await contract.transfer(recipient, encryptedAmount, mockProof);
    await wallet.account!.waitForTransaction(tx.transaction_hash);

    console.log('✓ Transfer successful:', tx.transaction_hash);

    return {
      txHash: tx.transaction_hash,
      success: true,
    };
  } catch (error) {
    console.error('Transfer failed:', error);
    return {
      txHash: '',
      success: false,
      error: error instanceof Error ? error.message : 'Transfer failed',
    };
  }
}

/**
 * Withdraw funds (mock for now)
 */
export async function withdraw(
  wallet: StarknetWindowObject,
  amount: number
): Promise<{ txHash: string; success: boolean; error?: string }> {
  try {
    const contract = getContractWithWallet(wallet);
    
    const encryptedAmount = cairo.felt(Math.floor(amount * 1e6));
    const mockProof = cairo.felt(54321); // TODO: Generate real ZK proof

    const tx = await contract.withdraw(encryptedAmount, mockProof);
    await wallet.account!.waitForTransaction(tx.transaction_hash);

    console.log('✓ Withdrawal successful:', tx.transaction_hash);

    return {
      txHash: tx.transaction_hash,
      success: true,
    };
  } catch (error) {
    console.error('Withdrawal failed:', error);
    return {
      txHash: '',
      success: false,
      error: error instanceof Error ? error.message : 'Withdrawal failed',
    };
  }
}

/**
 * Get vault owner (for debugging)
 */
export async function getVaultOwner(): Promise<string> {
  try {
    const contract = getContract();
    const owner = await contract.get_owner();
    return num.toHex(owner);
  } catch (error) {
    console.error('Error getting owner:', error);
    return '0x0';
  }
}

/**
 * Format amount from on-chain (6 decimals) to display
 */
export function formatUSDC(amount: number | bigint): string {
  const value = typeof amount === 'bigint' ? Number(amount) : amount;
  return (value / 1e6).toFixed(2);
}

/**
 * Parse display amount to on-chain format (6 decimals)
 */
export function parseUSDC(amount: string): number {
  return Math.floor(parseFloat(amount) * 1e6);
}
