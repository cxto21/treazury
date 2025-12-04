
import React, { useState, useCallback, useEffect } from 'react';
import type { StarknetWindowObject } from 'get-starknet-core';
import LoadingGate from './components/LoadingGate';
import VaultInterface from './components/VaultInterface';
import ConnectWalletModal from './components/ConnectWalletModal';
import { AppState, Theme } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.LOADING);
  const [theme, setTheme] = useState<Theme>('dark');
  const [wallet, setWallet] = useState<StarknetWindowObject | null>(null);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  // Update HTML class for Tailwind dark mode
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleLoadingComplete = useCallback(() => {
    setAppState(AppState.CONNECT_WALLET);
  }, []);

  const handleWalletConnected = useCallback((walletObj: StarknetWindowObject) => {
    setWallet(walletObj);
    setAppState(AppState.ACTIVE);
  }, []);

  const handleLogout = useCallback(() => {
    if (wallet && 'disable' in wallet && typeof wallet.disable === 'function') {
      // Disconnect wallet if possible
      wallet.disable();
    }
    setWallet(null);
    setAppState(AppState.CONNECT_WALLET);
  }, [wallet]);

  return (
    <div className={`relative min-h-screen font-mono transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-gray-900 bg-gray-100'}`}>
       {/* Background for Light/Dark */}
       <div className="fixed inset-0 z-[-1] bg-gray-100 dark:bg-gradient-to-b dark:from-cyber-black dark:to-cyber-gray transition-colors duration-500"></div>

      {/* Scanline Overlay Effect */}
      <div className="fixed inset-0 scanline-overlay z-40 pointer-events-none opacity-50 dark:opacity-100"></div>

      <div className="relative z-0">
        {appState === AppState.LOADING && (
          <LoadingGate onComplete={handleLoadingComplete} />
        )}

        {appState === AppState.CONNECT_WALLET && (
          <ConnectWalletModal onConnected={handleWalletConnected} />
        )}
        
        {appState === AppState.ACTIVE && wallet && (
          <VaultInterface 
            theme={theme} 
            toggleTheme={toggleTheme} 
            onLogout={handleLogout}
            wallet={wallet}
          />
        )}
      </div>
    </div>
  );
};

export default App;
