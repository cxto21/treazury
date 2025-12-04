
import React, { useEffect } from 'react';
import { connect } from 'starknetkit';
import { ArgentX } from 'starknetkit/argentX';
import { Braavos } from 'starknetkit/braavos';
import type { StarknetWindowObject } from '@starknet-io/types-js';

interface ConnectWalletModalProps {
  onConnected: (wallet: StarknetWindowObject) => void;
}

const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({ onConnected }) => {
  useEffect(() => {
    // Auto-trigger wallet connection modal on mount
    handleConnect();
  }, []);

  const handleConnect = async () => {
    try {
      // Use starknetkit 3.4.0 with explicit connectors
      const { wallet } = await connect({
        modalMode: "alwaysAsk",
        modalTheme: "system",
        connectors: [new ArgentX(), new Braavos()],
        dappName: "Treazury"
      });
      
      if (!wallet) {
        return;
      }

      // Enable the wallet
      if (!wallet.isConnected) {
        await wallet.enable({ starknetVersion: "v5" });
      }
      
      if (!wallet.isConnected) {
        throw new Error('Failed to connect to wallet');
      }
      
      // Wait for connection to stabilize
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onConnected(wallet);
    } catch (err) {
      console.error('Wallet connection error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-[fadeIn_0.5s_ease-in-out]">
      <div className="w-full max-w-md bg-white dark:bg-black border border-black/10 dark:border-white/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black uppercase tracking-widest text-black dark:text-white mb-2 drop-shadow-ink dark:drop-shadow-neon">
            Connect Wallet
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
            Wallet modal should appear automatically
          </p>
        </div>

        {/* Retry Button */}
        <div className="space-y-4">
          <button 
            onClick={handleConnect}
            className="w-full flex items-center justify-center p-4 rounded-xl border border-gray-200 dark:border-white/10 hover:border-black dark:hover:border-white bg-gray-50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 transition-all group"
          >
            <span className="font-bold text-black dark:text-white group-hover:drop-shadow-ink dark:group-hover:drop-shadow-neon">
              Open Wallet Modal
            </span>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">
            get-starknet-core
          </p>
        </div>

        {/* Decorative Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-5 dark:opacity-10 bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      </div>
    </div>
  );
};

export default ConnectWalletModal;
