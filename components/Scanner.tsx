
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

  const startCamera = async () => {
    stopCamera(); // Ensure clean slate
    try {
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };
      const s = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        // Force play just in case
        videoRef.current.play().catch(e => console.error("Video play error:", e));
      }
      setError(null);
    } catch (err) {
      setError("Camera access failed. Please ensure permissions are granted.");
      console.error(err);
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
      
      // Ensure video is ready
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
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
        blob = await generatePdfFromText(text, 'Scanned Text Output');
        filename = `typed_scan_${Date.now()}.pdf`;
      } else {
        blob = await generatePdfFromImages([capturedImage]);
        filename = `scan_${Date.now()}.pdf`;
      }

      if (action === 'share') {
        await sharePdf(blob, filename);
      } else {
        downloadPdf(blob, filename);
      }
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("An error occurred during conversion.");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setCapturedImage(null);
    startCamera();
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-3xl overflow-hidden aspect-[3/4] relative shadow-2xl border-2 border-slate-200">
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
              <div className="flex flex-col items-center justify-center h-full text-slate-500 p-6 text-center">
                <Camera size={48} className="mb-4 opacity-30 animate-pulse" />
                <p className="text-sm font-medium">{error || "Waking up camera..."}</p>
                {error && (
                   <button onClick={startCamera} className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-full font-bold shadow-lg">Retry Camera</button>
                )}
              </div>
            )}
            
            {stream && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-4/5 h-4/5 border-2 border-white/30 rounded-3xl relative overflow-hidden">
                   <div className="absolute inset-0 border-[40px] border-black/10"></div>
                   <div className="absolute top-0 left-0 w-full h-0.5 bg-indigo-400 shadow-[0_0_15px_rgba(99,102,241,1)] animate-scan-line"></div>
                </div>
              </div>
            )}

            {stream && (
              <button 
                onClick={capture}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 w-20 h-20 bg-white/20 backdrop-blur-md rounded-full border-4 border-white flex items-center justify-center shadow-2xl active:scale-90 transition-transform"
              >
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-inner">
                   <Camera className="text-indigo-600" size={28} />
                </div>
              </button>
            )}
          </>
        ) : (
          <div className="h-full flex flex-col bg-slate-900">
            <div className="flex-1 relative overflow-hidden">
               <img src={capturedImage} className="w-full h-full object-contain" />
               <button 
                onClick={reset}
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-3 rounded-full transition-colors border border-white/20"
              >
                <RotateCcw size={20} />
              </button>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-8 z-30">
            <RefreshCw size={48} className="text-indigo-600 animate-spin mb-6" />
            <h3 className="text-xl font-bold text-slate-900">Creating Your PDF</h3>
            <p className="text-sm text-slate-500 mt-2 text-center">We're processing your document offline for maximum privacy.</p>
            <div className="w-full mt-8 bg-slate-100 rounded-full h-3 overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(79,70,229,0.5)]" style={{ width: `${progress * 100}%` }}></div>
            </div>
            <p className="mt-3 text-xs font-bold text-indigo-600 uppercase tracking-widest">
              {progress > 0 ? `Recognizing Text: ${Math.round(progress * 100)}%` : "Initializing..."}
            </p>
          </div>
        )}
      </div>

      {capturedImage && !isProcessing && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 gap-4">
            {/* Image PDF Section */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-slate-100 p-2 rounded-lg"><ImageIcon className="text-slate-600" size={20}/></div>
                <div>
                  <h4 className="font-bold text-slate-800">Image PDF</h4>
                  <p className="text-xs text-slate-500">Fast & exact visual copy</p>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => handleAction('image', 'download')}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
                >
                  <Download size={16} /> Save
                </button>
                <button 
                  onClick={() => handleAction('image', 'share')}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-100"
                >
                  <Share2 size={16} /> Share
                </button>
              </div>
            </div>

            {/* Typed PDF Section */}
            <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-50 p-2 rounded-lg"><Type className="text-indigo-600" size={20}/></div>
                <div>
                  <h4 className="font-bold text-slate-800">Typed PDF</h4>
                  <p className="text-xs text-slate-500">Editable text format (OCR)</p>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => handleAction('typed', 'download')}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
                >
                  <Download size={16} /> Save
                </button>
                <button 
                  onClick={() => handleAction('typed', 'share')}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-100"
                >
                  <Share2 size={16} /> Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      <style>{`
        @keyframes scan-line {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .animate-scan-line {
          animation: scan-line 3s ease-in-out infinite alternate;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Scanner;
