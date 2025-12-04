// TreazuryVault v2.0 - Ztarknet Testnet Deployment
// Generated: December 4, 2025

export const TREAZURY_VAULT_V2 = {
  network: 'ztarknet-testnet',
  version: 'v2.0',
  status: 'LIVE',
  
  // Contract addresses
  address: '0x04cbe8011bddc3fa7d7832db096122f3ec5bb937f5bf5b3db852319664239196',
  classHash: '0x1013514cd2b7426a7d28962fb02b93d68fc74c046b0a67153cb14fe8467750f',
  owner: '0x5b7213d74268643e884c026569b800f463fd9f5b86493fb2551c38507f045fa',
  
  // Transaction hashes
  declarationTx: '0x161809e9b73993d12583541738f4f7cf19a83ec8132c5d7687c38b1d98d8d2e',
  deploymentTx: '0x07494c36e2e181b6c78b711a9e841af883b3131638989f0bf88e6b5fa685d6f2',
  
  // Explorers
  explorer: 'https://sepolia.starkscan.co/contract/0x04cbe8011bddc3fa7d7832db096122f3ec5bb937f5bf5b3db852319664239196',
  
  // Security features
  securityFeatures: [
    'ZK Proof validation framework',
    'Reentrancy guards',
    'Owner access control',
    'Emergency pause mechanism',
    'Comprehensive input validation',
    'Balance sufficiency checks',
  ],
  
  // Contract functions
  functions: {
    core: [
      'set_encryption_key',
      'deposit',
      'withdraw',
      'transfer',
      'get_encrypted_balance',
      'rollover_pending_balance',
    ],
    owner: [
      'get_owner',
      'transfer_ownership',
      'pause',
      'unpause',
      'is_paused',
    ],
  },
} as const;

// Deprecated v1.0 (DO NOT USE)
export const TREAZURY_VAULT_V1_DEPRECATED = {
  address: '0x0320385a4441d93c9e24497f80c96806b5e0f30c3896ecccf710f91bc25521b4',
  status: 'DEPRECATED - VULNERABLE',
  reason: '10 critical/high/medium vulnerabilities',
  note: 'DO NOT USE - Replaced by v2.0',
} as const;

// Network configuration
export const ZTARKNET_CONFIG = {
  name: 'ztarknet-testnet',
  rpc: 'https://ztarknet-madara.d.karnot.xyz',
  chainId: 'ZTARKNET',
  explorer: 'https://explorer.ztarknet.cash/',
  faucet: 'https://faucet.ztarknet.cash/',
} as const;

// Helper function to get contract address
export function getTreazuryVaultAddress(): string {
  return TREAZURY_VAULT_V2.address;
}

// Helper function to check if paused (requires RPC call)
export async function isContractPaused(provider: any): Promise<boolean> {
  try {
    const result = await provider.callContract({
      contractAddress: TREAZURY_VAULT_V2.address,
      entrypoint: 'is_paused',
      calldata: [],
    });
    return result[0] === '0x1';
  } catch (error) {
    console.error('Error checking pause status:', error);
    return false;
  }
}
