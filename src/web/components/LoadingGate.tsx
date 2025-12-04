
import React, { useEffect, useState, useMemo } from 'react';

const HexSegment: React.FC<{ rotation: number; delay: string }> = ({ rotation, delay }) => {
  const style = {
    transform: `rotate(${rotation}deg)`,
    animationDelay: delay,
  };

  return (
    <div 
      className="absolute inset-0 border-4 border-white shadow-neon opacity-0 animate-hex-open rounded-full hex-clip hover:opacity-100 transition-opacity duration-1000"
      style={style}
    />
  );
};

interface LoadingGateProps {
  onComplete: () => void;
}

const MESSAGES = [
  { title: "POST-QUANTUM SECURE", subtitle: "Security that stands the test of tomorrow’s quantum threats." },
  { title: "USDC NATIVE", subtitle: "Seamless, instantaneous, trusted native USD Coin on Starknet." },
  { title: "ZKPassport Verified", subtitle: "Zero-Knowledge Identity Verification: Privacy-first regulatory compliance." },
  { title: "PRIVATE TRANSACTIONS", subtitle: "End-to-end encrypted transfers, your wealth stays your secret." },
  { title: "COMPLIANCE WITHOUT COMPROMISE", subtitle: "AML/KYC proven with zero exposure — trust and privacy in perfect harmony." },
  { title: "SCALABLE LAYER 2", subtitle: "Lightning-fast, ultra-low cost Starknet L2 ensures frictionless payments." },
  { title: "SOVEREIGNTY ENABLED", subtitle: "You control your data, your keys, your destiny." },
  { title: "TRUSTED BY WEB3 LEADERS", subtitle: "Built on open-source privacy tech, empowered by Starknet’s ecosystem." }
];

const LoadingGate: React.FC<LoadingGateProps> = ({ onComplete }) => {
  const [isFading, setIsFading] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  
  // Shuffle messages once on mount
  const shuffledMessages = useMemo(() => {
    return [...MESSAGES].sort(() => Math.random() - 0.5);
  }, []);

  useEffect(() => {
    // Message cycle timer
    // Slower cycle: 2.5s per message
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex(prev => (prev + 1) % shuffledMessages.length);
    }, 2500);

    // Extended loading time to allow reading
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 7500);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 8000);

    return () => {
      clearInterval(messageInterval);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete, shuffledMessages.length]);

  const currentMessage = shuffledMessages[currentMessageIndex];

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-cyber-black transition-all duration-500 ease-in-out ${isFading ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}
    >
      <div className="relative w-80 h-80 group mb-12">
        {/* Core Glow */}
        <div className="absolute inset-16 bg-white/5 rounded-full blur-xl animate-pulse-fast shadow-[0_0_20px_rgba(255,255,255,0.1)]"></div>
        
        {/* Hexagon Segments */}
        <HexSegment rotation={0} delay="0s" />
        <HexSegment rotation={60} delay="0.1s" />
        <HexSegment rotation={120} delay="0.2s" />
        <HexSegment rotation={180} delay="0.3s" />
        <HexSegment rotation={240} delay="0.4s" />
        <HexSegment rotation={300} delay="0.5s" />

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
          <div className="text-3xl font-black tracking-widest mb-4 animate-pulse text-white drop-shadow-neon">
            TREAZURY
          </div>
          <div className="text-xs uppercase tracking-widest text-white/80 font-bold mb-6 animate-pulse drop-shadow-neon">
            Truly Invisible USD Vault
          </div>
          <div className="w-16 h-16 border-2 border-white shadow-neon rounded-full flex items-center justify-center animate-spin" style={{ animationDuration: '3s' }}>
            <span className="text-xs font-mono text-white drop-shadow-neon">ZK✓</span>
          </div>
        </div>
      </div>

      {/* Loading Content Wrapper */}
      <div className="w-80 md:w-96 max-w-[90vw] flex flex-col items-center">
        
        {/* Rotating Text - MOVED ABOVE BAR */}
        <div className="h-28 text-center mb-6 flex items-end justify-center pb-2 w-full">
            <div className="transition-all duration-500 animate-[fadeIn_0.5s_ease-in-out]" key={currentMessageIndex}>
                <div className="text-base text-white font-bold uppercase tracking-widest mb-3 drop-shadow-neon px-2">
                    {currentMessage.title}
                </div>
                <div className="text-xs text-white/60 font-mono tracking-wide leading-relaxed px-4 max-w-xs mx-auto">
                    {currentMessage.subtitle}
                </div>
            </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden border border-white/10">
          <div className="h-full bg-white shadow-neon rounded-full animate-loading-bar w-0" style={{ animationDuration: '8s' }}></div>
        </div>
        
      </div>
    </div>
  );
};

export default LoadingGate;
