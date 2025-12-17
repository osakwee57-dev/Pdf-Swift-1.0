
import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Download, Share2, Type, ShieldCheck, RotateCcw, AlertCircle } from 'lucide-react';
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
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false
      };
      const s = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.play();
      }
      setError(null);
    } catch (err) {
      setError("Camera permission is required for on-device scanning.");
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
      setFlash(true);
      setTimeout(() => setFlash(false), 150);

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.filter = 'contrast(1.1) brightness(1.05)';
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setCapturedImage(canvas.toDataURL('image/jpeg', 0.9));
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
        blob = await generatePdfFromText(text, 'Local OCR Scan');
        filename = `OCR_Doc_${Date.now()}.pdf`;
      } else {
        blob = await generatePdfFromImages([capturedImage]);
        filename = `Scan_${Date.now()}.pdf`;
      }

      if (action === 'share') await sharePdf(blob, filename);
      else downloadPdf(blob, filename);
    } catch (err) {
      alert("Local processing error. Is the image clear?");
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
      <div className={`relative bg-slate-900 rounded-[40px] overflow-hidden aspect-[3/4] shadow-2xl transition-all duration-300 ${flash ? 'opacity-0' : 'opacity-100'}`}>
        {!capturedImage ? (
          <>
            {stream ? (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-white/50">
                <AlertCircle size={48} className="mb-4 text-indigo-400" />
                <p className="text-sm font-medium">{error || "Starting Secure Camera..."}</p>
                {error && <button onClick={startCamera} className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-full text-xs font-bold uppercase tracking-widest">Retry</button>}
              </div>
            )}
            
            {stream && (
              <>
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">Device-Only Feed</span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-4/5 h-4/5 border-2 border-white/20 rounded-[32px] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,1)] animate-scan"></div>
                  </div>
                </div>
                <div className="absolute bottom-8 w-full flex justify-center">
                  <button onClick={capture} className="w-20 h-20 bg-white rounded-full p-1.5 shadow-2xl active:scale-90 transition-transform">
                    <div className="w-full h-full rounded-full border-[3px] border-slate-900"></div>
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="h-full relative">
            <img src={capturedImage} className="w-full h-full object-contain" />
            <button onClick={() => {setCapturedImage(null); startCamera();}} className="absolute top-6 right-6 bg-white/10 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/20 transition-colors">
              <RotateCcw size={20} />
            </button>
          </div>
        )}

        {isProcessing && (
          <div className="absolute inset-0 bg-white flex flex-col items-center justify-center p-8 z-50 text-center">
            <div className="relative mb-8">
              <RefreshCw size={64} className="text-indigo-600 animate-spin" />
              <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">On-Device OCR</h3>
            <p className="text-slate-500 text-sm mt-2 max-w-[200px]">Extracting text locally without any internet connection.</p>
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-8 overflow-hidden max-w-[240px]">
              <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${progress * 100}%` }}></div>
            </div>
            <span className="mt-3 text-[10px] font-black text-indigo-600 uppercase tracking-widest">{Math.round(progress * 100)}% Complete</span>
          </div>
        )}
      </div>

      {capturedImage && !isProcessing && (
        <div className="space-y-3 animate-slide-up">
           <ActionRow title="Visual Scan" sub="Exact PDF copy" icon={<Camera size={20}/>} onDownload={() => handleAction('image', 'download')} onShare={() => handleAction('image', 'share')} />
           <ActionRow title="Searchable Text" sub="OCR conversion" icon={<Type size={20}/>} onDownload={() => handleAction('typed', 'download')} onShare={() => handleAction('typed', 'share')} />
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      <style>{`
        @keyframes scan { 0% { top: 0%; } 100% { top: 100%; } }
        .animate-scan { animation: scan 3s ease-in-out infinite alternate; }
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

const ActionRow = ({ title, sub, icon, onDownload, onShare }: any) => (
  <div className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center justify-between shadow-sm">
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-slate-100">{icon}</div>
      <div>
        <h4 className="font-bold text-slate-800 text-sm leading-none">{title}</h4>
        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">{sub}</p>
      </div>
    </div>
    <div className="flex gap-2">
      <button onClick={onDownload} className="p-2.5 text-slate-400 hover:text-indigo-600 transition-colors"><Download size={20}/></button>
      <button onClick={onShare} className="w-10 h-10 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 flex items-center justify-center active:scale-90 transition-transform"><Share2 size={18}/></button>
    </div>
  </div>
);

export default Scanner;
