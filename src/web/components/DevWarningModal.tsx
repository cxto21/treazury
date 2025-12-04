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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fadeIn">
      <div className="relative max-w-2xl mx-4 bg-gradient-to-br from-cyber-gray to-cyber-black border-2 border-yellow-500/50 rounded-lg shadow-[0_0_30px_rgba(234,179,8,0.3)] animate-scaleIn">
        {/* Header */}
        <div className="bg-yellow-500/10 border-b border-yellow-500/30 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 animate-ping">
                <svg className="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <svg className="relative w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-yellow-500 tracking-wider">
              ⚠️ TESTNET - EN DESARROLLO
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-4">
          <div className="space-y-3 text-gray-300">
            <p className="text-lg font-semibold text-white">
              Este sitio está en fase de desarrollo y pruebas
            </p>
            
            <div className="bg-red-500/10 border border-red-500/30 rounded-md p-4 space-y-2">
              <p className="text-red-400 font-bold flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                ADVERTENCIAS IMPORTANTES:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-sm">
                <li>Solo funciona en <strong className="text-yellow-400">Ztarknet Testnet</strong></li>
                <li>NO uses fondos reales - solo tokens de prueba</li>
                <li>Pueden ocurrir errores, bugs o pérdida de datos</li>
                <li>Las funciones de ZK están en modo mock/simulación</li>
                <li>La encriptación de balances es experimental</li>
              </ul>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-md p-4 space-y-2">
              <p className="text-blue-400 font-semibold flex items-center gap-2">
                <span className="text-xl">ℹ️</span>
                Para obtener tokens de prueba:
              </p>
              <a 
                href="https://faucet.ztarknet.cash" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block text-cyan-400 hover:text-cyan-300 underline text-sm"
              >
                🚰 Ztarknet Faucet →
              </a>
            </div>

            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-md p-3">
              <p className="text-xs text-gray-400">
                <strong>Contrato:</strong> TreazuryVault v2.0<br />
                <strong>Network:</strong> Ztarknet Testnet<br />
                <strong>Status:</strong> MVP - Minimum Viable Product
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-cyber-gray/50 border-t border-yellow-500/20 px-6 py-4 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer group">
            <input 
              type="checkbox" 
              className="w-4 h-4 rounded border-gray-600 bg-cyber-black text-yellow-500 focus:ring-yellow-500 focus:ring-offset-0"
              defaultChecked
            />
            <span className="group-hover:text-gray-300">No mostrar de nuevo</span>
          </label>

          <button
            onClick={handleAccept}
            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold rounded-md shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 transition-all duration-300 transform hover:scale-105"
          >
            ENTIENDO LOS RIESGOS
          </button>
        </div>
      </div>
    </div>
  );
};

export default DevWarningModal;
