
import React, { useState, useEffect } from 'react';
import { connect, disconnect } from 'get-starknet';
import type { StarknetWindowObject } from 'get-starknet-core';

interface ConnectWalletModalProps {
  onConnected: (wallet: StarknetWindowObject) => void;
}

const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({ onConnected }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async (walletId?: string) => {
    setIsConnecting(true);
    setError(null);
    
    try {
      // Use get-starknet to connect to wallet
      const wallet = await connect({ 
        modalMode: "neverAsk",
        modalTheme: "dark",
        ...(walletId && { include: [walletId] })
      });
      
      if (!wallet) {
        throw new Error('No wallet found. Please install Argent X or Braavos.');
      }

      // Enable wallet and get account
      await wallet.enable({ starknetVersion: "v5" });
      
      if (!wallet.isConnected) {
        throw new Error('Failed to connect to wallet');
      }

      // Wait a moment for connection to stabilize
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onConnected(wallet);
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
      setIsConnecting(false);
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
            Select a Starknet wallet to access Treazury
          </p>
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-600 dark:text-red-400 text-xs">
              {error}
            </div>
          )}
        </div>

        {/* Wallet Options */}
        <div className="space-y-4">
          <button 
            onClick={() => handleConnect('argentX')}
            disabled={isConnecting}
            className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-white/10 hover:border-black dark:hover:border-white bg-gray-50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">A</div>
              <span className="font-bold text-black dark:text-white group-hover:drop-shadow-ink dark:group-hover:drop-shadow-neon">Argent X</span>
            </div>
            {isConnecting && <div className="w-4 h-4 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin"></div>}
          </button>

          <button 
            onClick={() => handleConnect('braavos')}
            disabled={isConnecting}
            className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-white/10 hover:border-black dark:hover:border-white bg-gray-50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">B</div>
              <span className="font-bold text-black dark:text-white group-hover:drop-shadow-ink dark:group-hover:drop-shadow-neon">Braavos</span>
            </div>
          </button>
          
          <button 
            onClick={() => handleConnect()}
            disabled={isConnecting}
            className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-white/10 hover:border-black dark:hover:border-white bg-gray-50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
          >
             <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold">?</div>
              <span className="font-bold text-black dark:text-white group-hover:drop-shadow-ink dark:group-hover:drop-shadow-neon">Auto-detect</span>
            </div>
             <span className="text-[10px] uppercase tracking-wider bg-black/10 dark:bg-white/20 px-2 py-1 rounded text-black dark:text-white">Any Wallet</span>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">
            Powered by StarknetKit
          </p>
        </div>

        {/* Decorative Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-5 dark:opacity-10 bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      </div>
    </div>
  );
};

export default ConnectWalletModal;
