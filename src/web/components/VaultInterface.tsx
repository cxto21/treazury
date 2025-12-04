
import React, { useState, useEffect } from 'react';
import type { StarknetWindowObject } from 'get-starknet-core';
import { TransferFormState, Theme } from '../types';
import ZKPassportModal from './ZKPassportModal';
import { getEncryptedBalance, transfer, isVaultPaused, formatUSDC } from '../vault-service';

interface VaultInterfaceProps {
  theme: Theme;
  toggleTheme: () => void;
  onLogout: () => void;
  wallet: StarknetWindowObject;
}

const VaultInterface: React.FC<VaultInterfaceProps> = ({ theme, toggleTheme, onLogout, wallet }) => {
  const [formData, setFormData] = useState<TransferFormState>({
    amount: '',
    recipient: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBalanceRevealed, setIsBalanceRevealed] = useState(false);
  const [showZKModal, setShowZKModal] = useState(false);
  const [isZKVerified, setIsZKVerified] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [balance, setBalance] = useState<string>('******');
  const [balanceCommitment, setBalanceCommitment] = useState<string>('0x0');
  const [vaultPaused, setVaultPaused] = useState(false);
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  
  // Wallet Interaction States - Extract from connected wallet
  const [walletAddress, setWalletAddress] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  
  // Extract wallet address on mount
  useEffect(() => {
    if (wallet?.selectedAddress) {
      setFullAddress(wallet.selectedAddress);
      // Show abbreviated version
      const addr = wallet.selectedAddress;
      setWalletAddress(`${addr.slice(0, 6)}...${addr.slice(-4)}`);
      
      // Load vault data
      loadVaultData(addr);
    }
  }, [wallet]);

  // Load balance and vault status
  const loadVaultData = async (address: string) => {
    try {
      // Check if vault is paused
      const paused = await isVaultPaused();
      setVaultPaused(paused);

      // Get encrypted balance
      const balanceData = await getEncryptedBalance(address);
      setBalanceCommitment(balanceData.commitment);
      
      // For MVP: Show mock balance (in production, decrypt client-side with user's key)
      if (!balanceData.isZero) {
        // Mock: Extract "balance" from commitment for demo purposes
        const mockBalance = Math.abs(parseInt(balanceData.commitment.slice(-6), 16) % 10000) / 100;
        setBalance(mockBalance.toFixed(2));
      } else {
        setBalance('0.00');
      }
    } catch (error) {
      console.error('Failed to load vault data:', error);
      setBalance('0.00');
    }
  };
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setTxError(null);
  };

  const handleTransfer = async () => {
    if (!formData.amount || !formData.recipient) {
      setTxError('Amount and recipient are required');
      return;
    }

    // Validate amount
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setTxError('Invalid amount');
      return;
    }

    // Validate recipient address
    if (!formData.recipient.startsWith('0x') || formData.recipient.length !== 66) {
      setTxError('Invalid recipient address (must be 0x + 64 hex chars)');
      return;
    }

    // Check if vault is paused
    if (vaultPaused) {
      setTxError('Vault is currently paused. Transfers disabled.');
      return;
    }

    setIsProcessing(true);
    setTxError(null);
    setTxStatus('Preparing transfer...');

    try {
      setTxStatus('Generating ZK proof and submitting transaction...');
      
      const result = await transfer(wallet, formData.recipient, amount);
      
      if (result.success) {
        setTxStatus(`Success! TX: ${result.txHash.slice(0, 20)}...`);
        setFormData({ amount: '', recipient: '' });
        
        // Reload balance after transfer
        setTimeout(() => {
          if (wallet?.selectedAddress) {
            loadVaultData(wallet.selectedAddress);
          }
          setTxStatus(null);
        }, 3000);
      } else {
        throw new Error(result.error || 'Transfer failed');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Transfer failed';
      setTxError(message);
      setTxStatus(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handlers for "Hold to Reveal"
  const startReveal = () => setIsBalanceRevealed(true);
  const endReveal = () => setIsBalanceRevealed(false);

  // Copy Address Handler
  const copyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(fullAddress);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 animate-[fadeIn_1s_ease-in] text-cyber-black dark:text-white transition-colors duration-300 relative">
      
      {/* ZKPassport Modal Overlay */}
      {showZKModal && (
        <ZKPassportModal 
          onClose={() => setShowZKModal(false)}
          onSuccess={() => {
            setIsZKVerified(true);
            setShowZKModal(false);
          }}
        />
      )}

      {/* Receive/Deposit Modal Overlay */}
      {showReceiveModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s] p-4" onClick={() => setShowReceiveModal(false)}>
           <div className="bg-white dark:bg-black border border-black dark:border-white rounded-3xl p-8 max-w-sm w-full relative shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-black text-center mb-6 dark:text-white uppercase tracking-widest">Deposit USDC</h3>
              
              <div className="bg-white p-4 rounded-xl mx-auto mb-6 w-48 h-48 border-2 border-black/10 flex items-center justify-center">
                 {/* CSS QR Code Placeholder */}
                 <div className="w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_20px),repeating-linear-gradient(-45deg,transparent,transparent_10px,#000_10px,#000_20px)] opacity-80"></div>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500 font-mono mb-2 uppercase">Your Starknet Address</p>
                <div 
                    onClick={copyAddress}
                    className="bg-gray-100 dark:bg-white/10 p-3 rounded-lg text-xs font-mono break-all cursor-pointer hover:bg-gray-200 dark:hover:bg-white/20 transition-colors flex items-center justify-center group"
                >
                    {fullAddress}
                    <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">📋</span>
                </div>
                {copyFeedback && <p className="text-xs text-green-500 mt-2 font-bold animate-pulse">Address Copied!</p>}
              </div>

              <button onClick={() => setShowReceiveModal(false)} className="mt-6 w-full py-3 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest rounded-xl hover:opacity-90">
                Done
              </button>
           </div>
        </div>
      )}

      {/* T&C Modal Overlay */}
      {showTerms && (
        <div className="fixed inset-0 z-[70] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-[fadeIn_0.3s]" onClick={() => setShowTerms(false)}>
           <div className="bg-white dark:bg-black border border-black dark:border-white rounded-t-3xl md:rounded-3xl p-8 max-w-2xl w-full relative shadow-[0_0_50px_rgba(255,255,255,0.1)] animate-[slideUp_0.3s]" onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowTerms(false)} className="absolute top-4 right-6 text-2xl opacity-50 hover:opacity-100 transition-opacity">×</button>
              
              <h3 className="text-xl font-black mb-6 dark:text-white uppercase tracking-widest border-b border-gray-200 dark:border-white/10 pb-4">
                Protocol Liability & Privacy
              </h3>
              
              <div className="space-y-4 text-sm font-mono text-gray-600 dark:text-gray-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
                <p>
                  <strong className="text-black dark:text-white">1. Zero-Knowledge Architecture:</strong> Treazury operates as a purely non-custodial interface. We do not store, process, view, or transmit your unencrypted personal KYC data to our servers.
                </p>
                <p>
                  <strong className="text-black dark:text-white">2. Third-Party Verification:</strong> Identity verification is performed entirely client-side using Zero-Knowledge Proofs via ZKPassport. The "verification" is a mathematical proof generated on your device and verified on-chain.
                </p>
                <p>
                  <strong className="text-black dark:text-white">3. No Auditable Contract:</strong> Please understand that our guarantees are cryptographic, not bureaucratic. We rely on the mathematical integrity of the ZK-STARK protocol and our providers.
                </p>
                <p className="p-4 bg-gray-100 dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/10 text-xs italic">
                  "We build the vault, but we don't hold the keys—or the liability. Your data stays on your device. We trust the math, and we invite you to verify the proofs. If the cryptography fails, we all have bigger problems than legal recourse."
                </p>
              </div>

              <div className="mt-8 text-center">
                 <button onClick={() => setShowTerms(false)} className="text-xs uppercase font-bold tracking-widest hover:underline decoration-1 underline-offset-4">
                    I Understand & Agree
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-10 md:mb-12 pb-6 border-b border-black/10 dark:border-white/20 gap-4 transition-colors duration-300">
        <div className="flex items-center space-x-3 w-full md:w-auto justify-center md:justify-start">
          <div className="w-2 h-2 bg-black dark:bg-white rounded-full animate-pulse-fast shadow-ink dark:shadow-neon transition-colors"></div>
          <span className="text-xs text-black/80 dark:text-white/80 font-bold uppercase tracking-widest drop-shadow-ink dark:drop-shadow-neon transition-all">TERMINAL ACTIVE</span>
        </div>
        
        <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button 
                onClick={toggleTheme}
                className="text-xs bg-white/60 dark:bg-black/40 text-black dark:text-white p-2 rounded-lg backdrop-blur-sm border border-black/10 dark:border-white/20 hover:border-black dark:hover:border-white hover:shadow-ink dark:hover:shadow-neon transition-all"
                title="Toggle Theme"
            >
                {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* Wallet Address Chip */}
            <div 
                className="text-xs bg-white/60 dark:bg-black/40 text-black dark:text-white px-4 py-2 rounded-full backdrop-blur-sm border border-black/10 dark:border-white/20 hover:border-black dark:hover:border-white transition-all cursor-pointer font-mono group relative"
                onClick={copyAddress}
            >
                {walletAddress}
                {copyFeedback && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-black text-white text-[9px] rounded uppercase whitespace-nowrap">Copied!</div>
                )}
            </div>

             {/* Logout Button */}
             <button 
                onClick={onLogout}
                className="text-xs bg-white/60 dark:bg-black/40 text-red-500 hover:text-red-600 p-2 rounded-lg backdrop-blur-sm border border-black/10 dark:border-white/20 hover:border-red-500/50 transition-all"
                title="Disconnect Wallet"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
            </button>
        </div>
      </header>

      {/* Hero / Logo */}
      <div className="flex justify-center mb-8 w-full">
        <h1 className="font-black tracking-widest text-black dark:text-white drop-shadow-ink-strong dark:drop-shadow-neon-strong transition-all whitespace-nowrap text-center text-[min(6vw,2.5rem)] md:text-4xl">
          █▀▀▀ TREAZURY ▀▀▀█
        </h1>
      </div>

      <div className="max-w-4xl mx-auto flex-grow">
        
        {/* Slogan */}
        <div className="text-center mb-6 animate-[fadeIn_1s_ease-out]">
            <p className="text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-black/50 dark:text-white/50 drop-shadow-ink dark:drop-shadow-neon">
                Truly Invisible USD Vault
            </p>
        </div>

        {/* Encrypted Balance Card - SECURE MODE */}
        <div 
          className="mb-8 md:mb-12 p-6 md:p-8 bg-white/60 dark:bg-black/40 backdrop-blur-md border border-black/10 dark:border-white/20 rounded-3xl relative overflow-hidden group transition-all duration-300 cursor-pointer select-none hover:border-black/50 dark:hover:border-white hover:shadow-ink dark:hover:shadow-neon"
          onMouseDown={startReveal}
          onMouseUp={endReveal}
          onMouseLeave={endReveal}
          onTouchStart={startReveal}
          onTouchEnd={endReveal}
        >
          <div className="absolute inset-0 bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="flex items-center justify-between mb-6 relative z-10">
            <span className="text-xs uppercase tracking-wider text-black/60 dark:text-white/60 font-bold transition-colors">PRIVATE BALANCE</span>
            
            {/* Receive Button (Top Right) */}
            <button 
                onClick={(e) => {
                    e.stopPropagation(); // Prevent reveal
                    setShowReceiveModal(true);
                }}
                className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider hover:opacity-80 transition-all shadow-ink dark:shadow-neon z-20"
            >
                <span className="text-xs">↓</span> Receive
            </button>
          </div>
          
          <div className="flex flex-col gap-2 relative z-10">
            <div className="flex items-center md:items-baseline flex-wrap">
                <span className={`text-3xl md:text-5xl font-black tracking-tight text-black dark:text-white mr-2 transition-all drop-shadow-ink dark:drop-shadow-neon ${isBalanceRevealed ? 'opacity-100' : 'opacity-50'}`}>$</span>
                
                {/* Secure Display Logic */}
                {isBalanceRevealed ? (
                  <span className="text-4xl sm:text-5xl md:text-6xl font-black tracking-widest text-black dark:text-white drop-shadow-ink-strong dark:drop-shadow-neon-strong break-all animate-[fadeIn_0.2s]">
                    {balance}
                  </span>
                ) : (
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="text-4xl sm:text-5xl md:text-6xl font-black tracking-widest text-black dark:text-white opacity-20 dark:opacity-40 blur-sm transition-all">
                      ******
                    </span>
                    <span className="md:ml-4 px-3 py-1 border border-black/20 dark:border-white/40 text-black/60 dark:text-white/80 text-[10px] uppercase tracking-widest rounded-full animate-pulse shadow-ink dark:shadow-neon bg-white/50 dark:bg-black/50">
                      Hold to Decrypt
                    </span>
                  </div>
                )}
            </div>
            
            <div className="flex justify-between items-center mt-2">
                <span className="text-base md:text-lg text-black dark:text-white font-bold uppercase tracking-wider border border-black/20 dark:border-white/50 px-2 rounded shadow-ink dark:shadow-neon transition-all">
                    USDC
                </span>
                {!isBalanceRevealed && (
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono transition-colors">
                    <span className="text-black dark:text-white drop-shadow-ink dark:drop-shadow-neon">●</span> SECURE VIEW ENABLED
                  </span>
                )}
            </div>
          </div>
        </div>

        {/* Transfer Terminal */}
        <div className="bg-white/60 dark:bg-black/40 border border-black/10 dark:border-white/20 rounded-3xl p-6 md:p-8 mb-8 md:mb-12 backdrop-blur-md glitch-hover relative overflow-hidden transition-colors duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-30">
            <svg width="40" height="40" viewBox="0 0 40 40">
              <path d="M0 0 H40 V40" fill="none" stroke="currentColor" strokeWidth="2" className="text-black dark:text-white drop-shadow-ink dark:drop-shadow-neon" />
            </svg>
          </div>

          <div className="mb-8">
            <div className="flex items-center">
              <div className="w-1.5 h-1.5 bg-black dark:bg-white rounded-full mr-4 animate-pulse shadow-ink dark:shadow-neon"></div>
              <span className="text-lg md:text-xl font-black uppercase tracking-widest text-black dark:text-white drop-shadow-ink dark:drop-shadow-neon transition-all">PRIVATE ZK TRANSFER</span>
            </div>
            <div className="ml-5 mt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-black/50 dark:text-white/50">
                    Public Destination • Encrypted Amount
                </span>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-wider mb-2 text-black/70 dark:text-white/70 font-bold drop-shadow-ink dark:drop-shadow-neon transition-colors">{'>>'} AMOUNT</label>
              <input 
                type="number" 
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0.00" 
                className="w-full bg-white dark:bg-black/50 border border-black/10 dark:border-white/20 rounded-2xl px-6 py-4 text-lg font-mono text-black dark:text-white
                          focus:border-black dark:focus:border-white focus:shadow-ink dark:focus:shadow-neon focus:outline-none focus:bg-white dark:focus:bg-white/5
                          transition-all backdrop-blur-sm placeholder-black/30 dark:placeholder-white/20"
              />
            </div>
            
            <div>
              <label className="block text-xs uppercase tracking-wider mb-2 text-black/70 dark:text-white/70 font-bold drop-shadow-ink dark:drop-shadow-neon transition-colors">{'>>'} RECIPIENT</label>
              <input 
                type="text" 
                name="recipient"
                value={formData.recipient}
                onChange={handleInputChange}
                placeholder="0xDestination..." 
                className="w-full bg-white dark:bg-black/50 border border-black/10 dark:border-white/20 rounded-2xl px-6 py-4 font-mono text-lg text-black dark:text-white
                          focus:border-black dark:focus:border-white focus:shadow-ink dark:focus:shadow-neon focus:outline-none focus:bg-white dark:focus:bg-white/5
                          backdrop-blur-sm placeholder-black/30 dark:placeholder-white/20 transition-all"
              />
            </div>
            
            {/* Error Message */}
            {txError && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-2xl text-red-600 dark:text-red-400 text-sm font-mono">
                ⚠️ {txError}
              </div>
            )}

            {/* Status Message */}
            {txStatus && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/50 rounded-2xl text-blue-600 dark:text-blue-400 text-sm font-mono animate-pulse">
                ⚡ {txStatus}
              </div>
            )}

            {/* Vault Paused Warning */}
            {vaultPaused && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-2xl text-yellow-600 dark:text-yellow-400 text-sm font-mono">
                ⚠️ Vault is paused. Transfers temporarily disabled.
              </div>
            )}
            
            <button 
              onClick={handleTransfer}
              disabled={isProcessing}
              className={`w-full group relative overflow-hidden bg-black dark:bg-black/60 
                       border border-transparent dark:border-white/50 hover:border-black dark:hover:border-white hover:shadow-ink dark:hover:shadow-neon text-white font-black py-6 rounded-2xl uppercase 
                       tracking-widest text-sm md:text-lg transition-all transform hover:scale-[1.01]
                       ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="relative z-10 flex items-center justify-center drop-shadow-neon">
                {isProcessing ? (txStatus || 'PROCESSING...') : '▶ GENERATE ZK PROOF + TRANSFER'}
              </span>
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
            </button>
          </div>
        </div>

        {/* Status Panel with ZKPassport Integration */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-white/60 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-2xl transition-colors duration-300">
            
            {/* Identity Status */}
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              <div className="flex items-center gap-2">
                 <span className="font-bold text-sm dark:text-white">IDENTITY:</span>
                 {isZKVerified ? (
                    <div className="flex space-x-2">
                      <span className="px-2 py-1 bg-green-500/10 border border-green-500/50 text-green-600 dark:text-green-400 text-xs font-bold rounded shadow-sm">
                        ZKPassport VALID✓
                      </span>
                    </div>
                 ) : (
                   <span className="text-xs text-red-500/80 font-mono">UNVERIFIED</span>
                 )}
              </div>
              
              {!isZKVerified && (
                <button 
                  onClick={() => setShowZKModal(true)}
                  className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider rounded hover:scale-105 transition-transform shadow-ink dark:shadow-neon"
                >
                  Verify with ZKPassport
                </button>
              )}
            </div>

            <span className="text-xs text-black/50 dark:text-white/50 font-mono mt-4 md:mt-0">
               SESSION: <span className="font-bold text-black dark:text-white">SECURE</span>
            </span>
          </div>
          
          <div className="text-[10px] md:text-xs text-black/40 dark:text-white/30 font-mono uppercase tracking-widest text-center px-4 leading-relaxed transition-colors">
            🔒 PRIVACY MODE ACTIVE | STARKNET L2 | POST-QUANTUM SECURE | USDC NATIVE
          </div>
        </div>
      </div>

      {/* T&C Footer Trigger */}
      <div className="mt-8 py-4 flex justify-center">
         <button 
           onClick={() => setShowTerms(true)}
           className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600 hover:text-black dark:hover:text-white transition-colors border-b border-transparent hover:border-current pb-0.5"
         >
           Legal & Data Privacy
         </button>
      </div>
    </div>
  );
};

export default VaultInterface;
