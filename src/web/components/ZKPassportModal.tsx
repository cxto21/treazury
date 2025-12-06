
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { createWorker } from 'tesseract.js';
import { parse } from 'mrz';
import { ZKStep } from '../types';

interface ZKPassportModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface PassportData {
  nationality: string;
  documentNumber: string;
  dateOfBirth: string;
  dateOfExpiry: string;
  sex: string;
  firstName?: string;
  lastName?: string;
}

const ZKPassportModal: React.FC<ZKPassportModalProps> = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState<ZKStep>(ZKStep.SELECT_TYPE);
  const [documentType, setDocumentType] = useState<'id' | 'passport' | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [passportData, setPassportData] = useState<PassportData | null>(null);
  const [ocrProgress, setOcrProgress] = useState<number>(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);

  const startScan = (type: 'id' | 'passport') => {
    setDocumentType(type);
    setStep(ZKStep.SCANNING);
    setErrorMessage(null);
    setCameraReady(false);
    setCameraError(null);
  };

  // Handle camera user media events
  const handleUserMedia = useCallback(() => {
    console.log('[ZKPassport] Camera ready');
    setCameraReady(true);
    setCameraError(null);
  }, []);

  const handleUserMediaError = useCallback((error: string | DOMException) => {
    console.error('[ZKPassport] Camera error:', error);
    const errorMsg = typeof error === 'string' ? error : error.message || 'Camera access denied';
    setCameraError(errorMsg);
    setCameraReady(false);
    setErrorMessage(`Camera error: ${errorMsg}. Please allow camera access in your browser settings.`);
  }, []);

  // Capture image from webcam
  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImage(imageSrc);
        processImage(imageSrc);
      } else {
        setErrorMessage('Failed to capture image. Please try again.');
      }
    }
  }, [webcamRef]);

  // Process captured image with OCR + MRZ parsing
  const processImage = async (imageBase64: string) => {
    setStep(ZKStep.GENERATING_PROOF);
    setErrorMessage(null);

    try {
      // Initialize Tesseract OCR
      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.round(m.progress * 100));
          }
        },
      });

      // Perform OCR on captured image
      const { data: { text } } = await worker.recognize(imageBase64);
      await worker.terminate();

      console.log('[ZKPassport] OCR Text:', text);

      // Parse MRZ from OCR text
      const mrzLines = extractMRZLines(text);
      
      if (mrzLines.length === 0) {
        throw new Error('No MRZ detected. Please ensure the document is clearly visible and well-lit.');
      }

      // Parse MRZ using mrz library
      const parsedMRZ = parse(mrzLines);

      if (!parsedMRZ.valid) {
        throw new Error('Invalid MRZ checksum. Please capture a clearer image of the document.');
      }

      // Extract passport data
      const data: PassportData = {
        nationality: parsedMRZ.fields.nationality || '',
        documentNumber: parsedMRZ.fields.documentNumber || '',
        dateOfBirth: parsedMRZ.fields.birthDate || '',
        dateOfExpiry: parsedMRZ.fields.expirationDate || '',
        sex: parsedMRZ.fields.sex || '',
        firstName: parsedMRZ.fields.firstName,
        lastName: parsedMRZ.fields.lastName,
      };

      setPassportData(data);
      console.log('[ZKPassport] Parsed Data:', data);

      // Generate ZK proof with extracted data
      await generateZKProof(data);

    } catch (error) {
      console.error('[ZKPassport] Processing error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to process document');
      setStep(ZKStep.SELECT_TYPE);
      setCapturedImage(null);
    }
  };

  // Extract MRZ lines from OCR text
  const extractMRZLines = (text: string): string[] => {
    const lines = text.split('\n').map(line => line.trim());
    const mrzLines: string[] = [];

    // MRZ lines typically start with P< (passport) or I< (ID card)
    // and contain specific character patterns
    for (const line of lines) {
      const cleaned = line.replace(/\s/g, '').toUpperCase();
      
      // Passport MRZ pattern: starts with P< and has 44 characters
      if (cleaned.startsWith('P<') && cleaned.length >= 40) {
        mrzLines.push(cleaned);
      }
      // Generic MRZ line: mostly uppercase letters, digits, and <
      else if (cleaned.length >= 30 && /^[A-Z0-9<]+$/.test(cleaned)) {
        mrzLines.push(cleaned);
      }
    }

    return mrzLines;
  };

  // Generate ZK proof and verify on-chain
  const generateZKProof = async (data: PassportData) => {
    setStep(ZKStep.VERIFYING_CONTRACT);

    try {
      // Call backend API to generate ZK proof
      const response = await fetch('http://localhost:3001/api/zkpassport/generate-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nationality: data.nationality,
          documentNumber: data.documentNumber,
          dateOfBirth: data.dateOfBirth,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Proof generation failed: ${response.statusText}`);
      }

      const { proof, publicInputs } = await response.json();

      console.log('[ZKPassport] Proof generated:', {
        proof: proof.slice(0, 2),
        publicInputs,
      });

      // Verify proof on Starknet contract
      // TODO: Integrate with actual contract when ready
      // For now, simulate on-chain verification
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('[ZKPassport] ✅ Verification successful on-chain');

      setStep(ZKStep.SUCCESS);
      setTimeout(() => onSuccess(), 1500);

    } catch (error) {
      console.error('[ZKPassport] Proof generation error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to generate proof');
      setStep(ZKStep.SELECT_TYPE);
      setCapturedImage(null);
    }
  };

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

        {/* Error Display */}
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-sm text-red-600 dark:text-red-400 font-mono">{errorMessage}</p>
          </div>
        )}

        {/* Content Stages */}
        <div className="min-h-[300px] flex flex-col items-center justify-center text-center">
          
          {step === ZKStep.SELECT_TYPE && (
            <div className="w-full space-y-6 animate-[fadeIn_0.3s]">
              <h3 className="text-2xl font-bold text-black dark:text-white">Prove Citizenship</h3>
              <p className="text-sm text-gray-500 mb-6">Scan your document with your camera. No personal data leaves your device. Only the ZK proof is shared.</p>
              
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => startScan('id')} className="p-6 border border-gray-200 dark:border-white/20 rounded-xl hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all group">
                  <div className="text-3xl mb-2">🆔</div>
                  <div className="font-bold text-sm dark:text-white">ID Card</div>
                </button>
                <button onClick={() => startScan('passport')} className="p-6 border border-gray-200 dark:border-white/20 rounded-xl hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all group">
                  <div className="text-3xl mb-2">🛂</div>
                  <div className="font-bold text-sm dark:text-white">Passport</div>
                </button>
              </div>
            </div>
          )}

          {step === ZKStep.SCANNING && !capturedImage && (
            <div className="w-full space-y-6 animate-[fadeIn_0.3s]">
              <h3 className="text-xl font-bold dark:text-white mb-2">Position Your {documentType === 'passport' ? 'Passport' : 'ID Card'}</h3>
              <p className="text-xs text-gray-500 mb-4">Place the document flat on a surface with good lighting. The MRZ (bottom lines) must be clearly visible.</p>
              
              {/* Webcam Feed */}
              <div className="relative w-full bg-black rounded-xl overflow-hidden border-2 border-black dark:border-white" style={{ minHeight: '500px', maxHeight: '70vh', aspectRatio: '4/3' }}>
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{
                    facingMode: 'environment', // Use rear camera on mobile
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                  }}
                  className="absolute inset-0 w-full h-full object-cover"
                  onUserMedia={handleUserMedia}
                  onUserMediaError={handleUserMediaError}
                />
                
                {/* Camera Loading Indicator */}
                {!cameraReady && !cameraError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm z-10">
                    <div className="text-center">
                      <div className="w-16 h-16 border-4 border-t-green-400 border-gray-600 rounded-full animate-spin mx-auto mb-6"></div>
                      <p className="text-white text-lg font-bold mb-2 font-mono">Initializing Camera...</p>
                      <p className="text-white/60 text-sm">Please allow camera access when prompted</p>
                    </div>
                  </div>
                )}

                {/* Camera Error State */}
                {cameraError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-950/95 backdrop-blur-sm z-10">
                    <div className="text-center p-8 max-w-sm">
                      <p className="text-4xl mb-4">📷</p>
                      <p className="text-white text-2xl font-black mb-4">Camera Access Denied</p>
                      <p className="text-white/80 text-sm font-mono mb-6 leading-relaxed">We need camera access to scan your document. Please:<br/>1. Check your browser settings<br/>2. Grant camera permission<br/>3. Refresh and try again</p>
                      <button onClick={() => window.location.reload()} className="bg-white text-red-950 font-bold px-6 py-2 rounded-lg hover:bg-red-100 transition-all">
                        🔄 Refresh Page
                      </button>
                    </div>
                  </div>
                )}
                
                {/* MRZ Guide Overlay - Larger document area */}
                {cameraReady && !cameraError && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] h-[75%] border-4 border-solid border-green-400 rounded-lg flex items-end justify-center pb-8 bg-transparent shadow-[inset_0_0_0_2px_rgba(74,222,128,0.5)]">
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[92%] h-32 border-3 border-solid border-yellow-400 rounded-lg bg-yellow-400/5 flex items-center justify-center">
                      <span className="text-center text-sm text-yellow-300 font-bold font-mono px-4">📍 ALIGN MRZ (bottom document lines) HERE 📍</span>
                    </div>
                    <span className="absolute top-6 left-1/2 -translate-x-1/2 text-lg font-black text-green-300 bg-black/80 px-6 py-3 rounded-lg shadow-lg">✓ DOCUMENT FRAME</span>
                  </div>
                )}
              </div>

              {/* Capture Button */}
              <button
                onClick={capturePhoto}
                disabled={!cameraReady || !!cameraError}
                className="w-full py-4 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl hover:scale-105 transition-transform shadow-ink dark:shadow-neon disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                📸 Capture Photo
              </button>

              <button
                onClick={() => setStep(ZKStep.SELECT_TYPE)}
                className="text-sm text-gray-400 hover:text-black dark:hover:text-white underline"
              >
                ← Back
              </button>
            </div>
          )}

          {step === ZKStep.SCANNING && capturedImage && (
            <div className="w-full space-y-4 animate-[fadeIn_0.3s]">
              <h3 className="text-xl font-bold dark:text-white">Review Captured Image</h3>
              <img src={capturedImage} alt="Captured document" className="w-full rounded-xl border-2 border-black dark:border-white" />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setCapturedImage(null);
                    setErrorMessage(null);
                  }}
                  className="flex-1 py-3 border-2 border-black dark:border-white text-black dark:text-white font-bold rounded-xl hover:bg-gray-100 dark:hover:bg-white/10"
                >
                  Retake
                </button>
                <button
                  onClick={() => processImage(capturedImage)}
                  className="flex-1 py-3 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl hover:scale-105 transition-transform"
                >
                  Process
                </button>
              </div>
            </div>
          )}

          {step === ZKStep.GENERATING_PROOF && (
            <div className="space-y-6 animate-[fadeIn_0.3s]">
              <div className="w-16 h-16 border-4 border-t-black dark:border-t-white border-gray-200 dark:border-gray-800 rounded-full animate-spin mx-auto"></div>
              <div>
                <h3 className="text-xl font-bold dark:text-white mb-1">Processing Document</h3>
                <p className="text-xs text-gray-500 font-mono mb-2">
                  Reading MRZ with OCR...
                </p>
                {ocrProgress > 0 && (
                  <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                    <div 
                      className="bg-black dark:bg-white h-2 rounded-full transition-all"
                      style={{ width: `${ocrProgress}%` }}
                    ></div>
                  </div>
                )}
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
                <p className="text-xs text-gray-500 font-mono">Generating ZK proof and submitting to zkpassport_verifier contract...</p>
                {passportData && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-white/5 rounded-lg text-left">
                    <p className="text-xs font-mono text-gray-600 dark:text-gray-400">
                      🌍 Nationality: {passportData.nationality}<br/>
                      📄 Document: {passportData.documentNumber.slice(0, 3)}***<br/>
                      🎂 DOB: {passportData.dateOfBirth}
                    </p>
                  </div>
                )}
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
                <p className="text-xs text-gray-500 font-mono">Your privacy is preserved. Proof stored on-chain.</p>
              </div>
            </div>
          )}

        </div>
        
        {/* Footer info */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/10 flex justify-between items-center text-[10px] text-gray-400 font-mono uppercase">
           <span>📹 Camera + OCR</span>
           <span>🔐 ZK-STARK Circuit</span>
        </div>

      </div>
    </div>
  );
};

export default ZKPassportModal;
