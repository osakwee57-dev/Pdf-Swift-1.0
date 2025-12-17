
import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Download, Share2, Type, X, ScanLine, Image as ImageIcon, RotateCcw } from 'lucide-react';
import { extractTextFromImage } from '../services/ocrService';
import { generatePdfFromImages, generatePdfFromText, sharePdf, downloadPdf } from '../services/pdfService';

const Scanner: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);

  const startCamera = async () => {
    stopCamera();
    try {
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 4096 }, // Try for highest resolution available
          height: { ideal: 2160 }
        },
        audio: false
      };
      const s = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.play().catch(e => console.error("Play blocked:", e));
      }
      setError(null);
    } catch (err) {
      setError("Unable to access camera. Please check browser permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (video.videoWidth === 0) return;

      // Create a momentary flash effect
      setFlash(true);
      setTimeout(() => setFlash(false), 150);

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Apply slight sharpening/contrast boost for OCR "perfect" scanning
        ctx.filter = 'contrast(1.1) brightness(1.05) saturate(1.1)';
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleAction = async (format: 'image' | 'typed', action: 'download' | 'share') => {
    if (!capturedImage) return;
    setIsProcessing(true);
    setProgress(0);
    
    try {
      let blob: Blob;
      let filename: string;

      if (format === 'typed') {
        const text = await extractTextFromImage(capturedImage, (p) => setProgress(p));
        blob = await generatePdfFromText(text, 'Scanned Document');
        filename = `OCR_Scan_${Date.now()}.pdf`;
      } else {
        blob = await generatePdfFromImages([capturedImage]);
        filename = `Image_Scan_${Date.now()}.pdf`;
      }

      if (action === 'share') {
        await sharePdf(blob, filename);
      } else {
        downloadPdf(blob, filename);
      }
    } catch (err) {
      alert("Processing failed. Please try a clearer photo.");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  return (
    <div className="space-y-6">
      <div className={`bg-black rounded-3xl overflow-hidden aspect-[3/4] relative shadow-2xl transition-all duration-300 ${flash ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
        {!capturedImage ? (
          <>
            {stream ? (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center">
                <Camera size={48} className="mb-4 opacity-20" />
                <p className="text-sm font-medium">{error || "Preparing High-Res Camera..."}</p>
                {error && (
                   <button onClick={startCamera} className="mt-6 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/30">Grant Permission</button>
                )}
              </div>
            )}
            
            {stream && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-4/5 h-4/5 border border-white/40 rounded-3xl relative">
                   {/* Corner markers */}
                   <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-400 rounded-tl-xl"></div>
                   <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-400 rounded-tr-xl"></div>
                   <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-400 rounded-bl-xl"></div>
                   <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-400 rounded-br-xl"></div>
                   <div className="absolute top-0 left-0 w-full h-0.5 bg-indigo-500/80 shadow-[0_0_20px_rgba(99,102,241,1)] animate-scan-line"></div>
                </div>
              </div>
            )}

            {stream && (
              <div className="absolute bottom-8 w-full flex justify-center items-center gap-6">
                <button 
                  onClick={capture}
                  className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)] active:scale-90 transition-transform"
                >
                  <div className="w-16 h-16 border-4 border-slate-900 rounded-full"></div>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="h-full flex flex-col bg-slate-900">
            <div className="flex-1 relative">
               <img src={capturedImage} className="w-full h-full object-contain" />
               <button 
                onClick={() => {setCapturedImage(null); startCamera();}}
                className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white p-3 rounded-full border border-white/20"
              >
                <RotateCcw size={20} />
              </button>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-8 z-30">
            <RefreshCw size={48} className="text-indigo-600 animate-spin mb-6" />
            <h3 className="text-xl font-bold text-slate-900">Local OCR Processing</h3>
            <p className="text-sm text-slate-500 mt-2 text-center">Using your device's power for a secure, API-free experience.</p>
            <div className="w-full mt-8 bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${progress * 100}%` }}></div>
            </div>
            <p className="mt-4 text-xs font-bold text-indigo-600 tracking-tighter uppercase">
              Analyzing Data: {Math.round(progress * 100)}%
            </p>
          </div>
        )}
      </div>

      {capturedImage && !isProcessing && (
        <div className="grid grid-cols-1 gap-4 animate-fade-in">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-slate-100 p-2.5 rounded-xl text-slate-600"><ImageIcon size={22}/></div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Perfect Scan</h4>
                <p className="text-xs text-slate-500">Exact visual copy</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleAction('image', 'download')} className="p-2.5 bg-slate-50 text-slate-600 rounded-xl border border-slate-100"><Download size={18}/></button>
              <button onClick={() => handleAction('image', 'share')} className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100"><Share2 size={18}/></button>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-indigo-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600"><Type size={22}/></div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Convert to Text</h4>
                <p className="text-xs text-slate-500">Searchable & editable</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleAction('typed', 'download')} className="p-2.5 bg-slate-50 text-slate-600 rounded-xl border border-slate-100"><Download size={18}/></button>
              <button onClick={() => handleAction('typed', 'share')} className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100"><Share2 size={18}/></button>
            </div>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      <style>{`
        @keyframes scan-line {
          0% { top: 10%; }
          100% { top: 90%; }
        }
        .animate-scan-line {
          animation: scan-line 2.5s ease-in-out infinite alternate;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Scanner;
