import React, { useState, useEffect } from 'react';

interface DevWarningModalProps {
  onAccept: () => void;
}

const DevWarningModal: React.FC<DevWarningModalProps> = ({ onAccept }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted the warning
    const hasAccepted = localStorage.getItem('treazury_dev_warning_accepted');
    if (!hasAccepted) {
      // Show modal after a short delay for better UX
      setTimeout(() => setIsVisible(true), 500);
    } else {
      onAccept();
    }
  }, [onAccept]);

  const handleAccept = () => {
    localStorage.setItem('treazury_dev_warning_accepted', 'true');
    setIsVisible(false);
    onAccept();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md animate-fadeIn">
      <div className="relative max-w-2xl mx-4 bg-gradient-to-br from-cyber-gray via-cyber-black to-ink-black border-2 border-cyan-500/40 rounded-lg shadow-[0_0_40px_rgba(6,182,212,0.2)] animate-scaleIn">
        {/* Header */}
        <div className="border-b border-cyan-500/20 px-6 py-4 bg-gradient-to-r from-cyan-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 animate-ping opacity-75">
                <svg className="w-8 h-8 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <svg className="relative w-8 h-8 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-neon-white tracking-wider drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
              ⚠️ TESTNET - DEVELOPMENT BUILD
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-4">
          <div className="space-y-3 text-gray-300">
            <p className="text-lg font-semibold text-neon-white">
              This site is in development and testing phase
            </p>
            
            <div className="border border-cyan-500/30 rounded-md p-4 space-y-2 bg-cyan-500/5">
              <p className="text-cyan-400 font-bold flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                IMPORTANT WARNINGS:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-sm text-gray-400">
                <li>Only works on <strong className="text-cyan-400">Ztarknet Testnet</strong></li>
                <li>DO NOT use real funds - testnet tokens only</li>
                <li>Errors, bugs, or data loss may occur</li>
                <li>ZK proof features are in mock/simulation mode</li>
                <li>Balance encryption is experimental</li>
              </ul>
            </div>

            <div className="border border-gray-700 rounded-md p-4 space-y-2">
              <p className="text-gray-300 font-semibold flex items-center gap-2">
                <span className="text-xl">ℹ️</span>
                Get testnet tokens:
              </p>
              <a 
                href="https://faucet.ztarknet.cash" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block text-cyan-400 hover:text-cyan-300 underline text-sm transition-colors"
              >
                🚰 Ztarknet Faucet →
              </a>
            </div>

            <div className="border border-gray-800 rounded-md p-3 bg-black/30">
              <p className="text-xs text-gray-500 font-mono">
                <strong className="text-gray-400">Contract:</strong> TreazuryVault v2.0<br />
                <strong className="text-gray-400">Network:</strong> Ztarknet Testnet<br />
                <strong className="text-gray-400">Status:</strong> MVP - Minimum Viable Product
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-cyber-gray/30 border-t border-cyan-500/20 px-6 py-4 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer group">
            <input 
              type="checkbox" 
              className="w-4 h-4 rounded border-gray-600 bg-cyber-black text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
              defaultChecked
            />
            <span className="group-hover:text-gray-300 transition-colors">Don't show again</span>
          </label>

          <button
            onClick={handleAccept}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-md shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105"
          >
            I UNDERSTAND THE RISKS
          </button>
        </div>
      </div>
    </div>
  );
};

export default DevWarningModal;
