
import React, { useState, useEffect } from 'react';
import { ZKStep } from '../types';

interface ZKPassportModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const ZKPassportModal: React.FC<ZKPassportModalProps> = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState<ZKStep>(ZKStep.SELECT_TYPE);

  // Simulation Logic
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (step === ZKStep.SCANNING) {
      timer = setTimeout(() => setStep(ZKStep.GENERATING_PROOF), 2000);
    } else if (step === ZKStep.GENERATING_PROOF) {
      timer = setTimeout(() => setStep(ZKStep.VERIFYING_CONTRACT), 3000);
    } else if (step === ZKStep.VERIFYING_CONTRACT) {
      timer = setTimeout(() => setStep(ZKStep.SUCCESS), 2000);
    } else if (step === ZKStep.SUCCESS) {
      timer = setTimeout(() => onSuccess(), 1500);
    }

    return () => clearTimeout(timer);
  }, [step, onSuccess]);

  const startScan = () => setStep(ZKStep.SCANNING);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-[fadeIn_0.3s_ease-out]">
      <div className="w-full max-w-lg bg-white dark:bg-black border-2 border-black dark:border-white rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.2)] dark:shadow-[0_0_50px_rgba(255,255,255,0.15)] relative overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-black tracking-tighter text-black dark:text-white">ZKPassport</span>
            <span className="bg-black text-white dark:bg-white dark:text-black text-[10px] px-2 py-0.5 rounded font-bold uppercase">Identity</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black dark:hover:text-white">✕</button>
        </div>

        {/* Content Stages */}
        <div className="min-h-[300px] flex flex-col items-center justify-center text-center">
          
          {step === ZKStep.SELECT_TYPE && (
            <div className="w-full space-y-6 animate-[fadeIn_0.3s]">
              <h3 className="text-2xl font-bold text-black dark:text-white">Prove Citizenship</h3>
              <p className="text-sm text-gray-500 mb-6">Select a document to scan. No personal data leaves your device. Only the proof is shared.</p>
              
              <div className="grid grid-cols-2 gap-4">
                <button onClick={startScan} className="p-6 border border-gray-200 dark:border-white/20 rounded-xl hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all group">
                  <div className="text-3xl mb-2">🆔</div>
                  <div className="font-bold text-sm dark:text-white">ID Card</div>
                </button>
                <button onClick={startScan} className="p-6 border border-gray-200 dark:border-white/20 rounded-xl hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all group">
                  <div className="text-3xl mb-2">🛂</div>
                  <div className="font-bold text-sm dark:text-white">Passport</div>
                </button>
              </div>
            </div>
          )}

          {step === ZKStep.SCANNING && (
            <div className="space-y-6 animate-[fadeIn_0.3s]">
              <div className="relative w-24 h-24 mx-auto">
                 <div className="absolute inset-0 border-4 border-black dark:border-white rounded-xl"></div>
                 <div className="absolute inset-0 bg-black/10 dark:bg-white/10 animate-pulse"></div>
                 <div className="absolute top-0 left-0 w-full h-1 bg-black dark:bg-white shadow-ink dark:shadow-neon animate-[scanline_1.5s_infinite]"></div>
              </div>
              <div>
                <h3 className="text-xl font-bold dark:text-white mb-1">Scanning NFC...</h3>
                <p className="text-xs text-gray-500 font-mono">Hold device near document</p>
              </div>
            </div>
          )}

          {step === ZKStep.GENERATING_PROOF && (
            <div className="space-y-6 animate-[fadeIn_0.3s]">
              <div className="w-16 h-16 border-4 border-t-black dark:border-t-white border-gray-200 dark:border-gray-800 rounded-full animate-spin mx-auto"></div>
              <div>
                <h3 className="text-xl font-bold dark:text-white mb-1">Generating ZK Proof</h3>
                <p className="text-xs text-gray-500 font-mono max-w-xs mx-auto">
                  Creating a mathematical proof that allows verification without revealing your actual data.
                </p>
              </div>
            </div>
          )}

          {step === ZKStep.VERIFYING_CONTRACT && (
            <div className="space-y-6 animate-[fadeIn_0.3s]">
               <div className="flex justify-center space-x-2">
                 <div className="w-3 h-3 bg-black dark:bg-white rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                 <div className="w-3 h-3 bg-black dark:bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                 <div className="w-3 h-3 bg-black dark:bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
               </div>
              <div>
                <h3 className="text-xl font-bold dark:text-white mb-1">Verifying on Starknet</h3>
                <p className="text-xs text-gray-500 font-mono">Checking proof validity on-chain...</p>
              </div>
            </div>
          )}

          {step === ZKStep.SUCCESS && (
            <div className="space-y-6 animate-[scaleIn_0.3s]">
              <div className="w-20 h-20 bg-black dark:bg-white rounded-full flex items-center justify-center mx-auto shadow-ink dark:shadow-neon">
                <svg className="w-10 h-10 text-white dark:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <div>
                <h3 className="text-2xl font-black dark:text-white mb-1">Identity Verified</h3>
                <p className="text-xs text-gray-500 font-mono">Your privacy is preserved.</p>
              </div>
            </div>
          )}

        </div>
        
        {/* Footer info */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/10 flex justify-between items-center text-[10px] text-gray-400 font-mono uppercase">
           <span>Secure Enclave</span>
           <span>ZK-STARK Circuit</span>
        </div>

      </div>
    </div>
  );
};

export default ZKPassportModal;
