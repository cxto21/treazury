import { RpcProvider, Account } from 'starknet';
import { connect, disconnect } from 'starknetkit';

/**
 * Network configuration for Starknet
 */
export type Network = 'sepolia' | 'mainnet';

export interface NetworkConfig {
  name: string;
  rpcUrl: string;
  tongoContractAddress: string;
  strkAddress: string;
  chainId: string;
}

/**
 * Network configurations
 */
export const NETWORKS: Record<Network, NetworkConfig> = {
  sepolia: {
    name: 'Sepolia Testnet',
    rpcUrl: 'https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_9/cf52O0RwFy1mEB0uoYsel',
    // STRK wrapper (1:1 rate for testing)
    tongoContractAddress: '0x00b4cca30f0f641e01140c1c388f55641f1c3fe5515484e622b6cb91d8cee585',
    strkAddress: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
    chainId: 'SN_SEPOLIA'
  },
  mainnet: {
    name: 'Starknet Mainnet',
    rpcUrl: 'https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_10/cf52O0RwFy1mEB0uoYsel',
    // Tongo contract (Nov 14, 2024 - compatible with SDK v1.3.0)
    tongoContractAddress: '0x72098b84989a45cc00697431dfba300f1f5d144ae916e98287418af4e548d96',
    // USDC mainnet address (NOT STRK!)
    strkAddress: '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8',
    chainId: 'SN_MAIN'
  }
};

/**
 * Get network configuration
 */
export function getNetworkConfig(network: Network = 'mainnet'): NetworkConfig {
  return NETWORKS[network];
}

/**
 * Create RPC provider for a network
 */
export function createProvider(network: Network = 'mainnet'): RpcProvider {
  const config = getNetworkConfig(network);
  return new RpcProvider({
    nodeUrl: config.rpcUrl
    // specVersion is auto-detected from RPC URL
  });
}

/**
 * Normalizar nombre de wallet para mostrar correctamente
 * get-starknet-core devuelve nombres normalizados
 */
function normalizeWalletName(wallet: any): string {
  if (!wallet) return 'Unknown';
  
  const name = wallet.name?.toLowerCase() || '';
  const id = wallet.id?.toLowerCase() || '';
  
  // Mapear nombres y IDs a nombres amigables
  if (name.includes('argent') || id.includes('argent')) return 'Argent X';
  if (name.includes('braavos') || id.includes('braavos')) return 'Braavos';
  if (name.includes('webwallet') || name.includes('web')) return 'Argent Webwallet';
  
  // Return original name if no match
  return wallet.name || 'Unknown';
}

/**
 * Browser-only: Connect to Starknet wallet
 * Returns Account if connected, null if cancelled
 */
const WALLET_CONNECTION_TIMEOUT = 30000; // 30 seconds

export async function connectWallet(): Promise<Account | null> {
  if (typeof window === 'undefined') {
    throw new Error('Wallet connection is only available in browser environment');
  }

  try {
    console.log('[wallet-config] Starting wallet connection...');
    
    // Show loading indication early
    const statusEl = document.getElementById('status');
    if (statusEl) {
      statusEl.textContent = 'Opening wallet modal...';
      statusEl.className = 'status loading';
    }
    
    // Use starknetkit's connect - it has the visual modal with wallet detection
    const result = await Promise.race([
      connect(),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error('Wallet connection timeout - try again or use a different wallet')),
          WALLET_CONNECTION_TIMEOUT
        )
      ),
    ]);

    console.log('[wallet-config] Connection result:', {
      id: result?.id,
      name: result?.name,
      isConnected: result?.isConnected,
    });

    if (!result) {
      console.log('[wallet-config] User cancelled wallet connection');
      if (statusEl) {
        statusEl.textContent = 'Connection cancelled';
        statusEl.className = 'status';
      }
      return null;
    }

    // Enable wallet if not already connected
    if (!result.isConnected) {
      console.log('[wallet-config] Wallet not connected, enabling...');
      try {
        await result.enable();
      } catch (enableError) {
        console.warn('[wallet-config] Enable error (might be already connected):', enableError);
      }
    }

    if (!result.account) {
      throw new Error('Wallet account not available after connection');
    }

    const walletName = normalizeWalletName(result);
    
    console.log('[wallet-config] ✅ Wallet connected successfully:', {
      name: walletName,
      address: result.account.address,
      id: result.id,
    });
    
    if (statusEl) {
      statusEl.textContent = `${walletName} connected`;
      statusEl.className = 'status success';
    }
    
    return result.account as Account;
  } catch (error) {
    console.error('[wallet-config] Wallet connection error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    const statusEl = document.getElementById('status');
    if (statusEl) {
      statusEl.textContent = `Connection failed: ${errorMessage}`;
      statusEl.className = 'status error';
    }
    
    throw new Error(`Failed to connect wallet: ${errorMessage}`);
  }
}

/**
 * Browser-only: Disconnect wallet
 */
export async function disconnectWallet(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const { getStarknet } = await import('@starknet-io/get-starknet-core');
    const starknet = await getStarknet({ silent: true });
    if (starknet?.disconnect) {
      await starknet.disconnect();
    }
    console.log('[wallet-config] Wallet disconnected successfully');
  } catch (error) {
    console.error('[wallet-config] Wallet disconnection error:', error);
  }
}

/**
 * Browser-only: Get connected wallet account
 */
export async function getConnectedAccount(): Promise<Account | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    // Check window.starknet first (faster - directly injected by wallet)
    const starknet = (window as any).starknet;
    if (starknet?.isConnected && starknet?.account) {
      console.log('[wallet-config] Found existing connection via window.starknet');
      return starknet.account as Account;
    }

    // Try get-starknet for silent reconnection
    const { getStarknet } = await import('@starknet-io/get-starknet-core');
    const wallet = await getStarknet({ silent: true });
    
    if (wallet?.isConnected && wallet?.account) {
      console.log('[wallet-config] Found existing connection via get-starknet');
      return wallet.account as Account;
    }

    console.log('[wallet-config] No existing wallet connection found');
    return null;
  } catch (error) {
    console.log('[wallet-config] No existing wallet connection (this is normal if not connected)');
    return null;
  }
}

