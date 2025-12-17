
import React, { useState } from 'react';
import { FileUp, Shrink, Download, Share2, Trash2, CheckCircle2, FileWarning } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { sharePdf, downloadPdf } from '../services/pdfService';

const Compressor: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [newSize, setNewSize] = useState<number>(0);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setOriginalSize(selectedFile.size);
      setCompressedBlob(null);
    } else if (selectedFile) {
      alert("Please select a valid PDF file.");
    }
  };

  const compressPdf = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Basic optimization: re-saving with pdf-lib often reduces size by cleaning unused objects
      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      setCompressedBlob(blob);
      setNewSize(blob.size);
    } catch (err) {
      console.error(err);
      alert("Error processing PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAction = async (type: 'share' | 'download') => {
    if (!compressedBlob) return;
    const filename = `compressed_${file?.name || 'document'}`;
    if (type === 'share') {
      await sharePdf(compressedBlob, filename);
    } else {
      downloadPdf(compressedBlob, filename);
    }
  };

  const reset = () => {
    setFile(null);
    setCompressedBlob(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
        {!file ? (
          <label className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-slate-100 rounded-3xl cursor-pointer hover:bg-slate-50 transition-all group">
            <div className="bg-slate-50 p-6 rounded-full group-hover:bg-indigo-50 transition-colors mb-4">
              <FileUp size={48} className="text-slate-200 group-hover:text-indigo-300 transition-colors" />
            </div>
            <span className="text-sm text-slate-400 font-bold">Tap to upload PDF</span>
            <p className="text-[10px] text-slate-300 mt-2 uppercase tracking-widest">Supports .pdf only</p>
            <input 
              type="file" 
              accept="application/pdf" 
              className="hidden" 
              onChange={handleFileChange} 
            />
          </label>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
                  <Shrink size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 truncate max-w-[180px]">{file.name}</h3>
                  <p className="text-xs text-slate-400 font-medium">Original Size: {formatSize(originalSize)}</p>
                </div>
              </div>
              <button onClick={reset} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                <Trash2 size={20} />
              </button>
            </div>

            {!compressedBlob ? (
              <button
                disabled={isProcessing}
                onClick={compressPdf}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                {isProcessing ? (
                  <>
                    <Shrink className="animate-spin" size={20} />
                    Processing...
                  </>
                ) : (
                  <>
                    <Shrink size={20} />
                    Optimize & Compress
                  </>
                )}
              </button>
            ) : (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-4">
                <div className="bg-white p-2 rounded-lg text-emerald-500 shadow-sm">
                  <CheckCircle2 size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-emerald-900">Successfully Optimized!</h4>
                  <p className="text-xs text-emerald-700">
                    New size: <span className="font-bold">{formatSize(newSize)}</span> 
                    {newSize < originalSize && ` (${Math.round((1 - newSize / originalSize) * 100)}% smaller)`}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {compressedBlob && (
        <div className="grid grid-cols-2 gap-4 animate-fade-in">
          <button
            onClick={() => handleAction('download')}
            className="flex flex-col items-center justify-center gap-1 bg-white text-slate-700 p-4 rounded-3xl font-bold shadow-sm border border-slate-200 active:scale-95 transition-all"
          >
            <Download size={22} className="mb-1 text-slate-400" />
            <span className="text-sm">Download</span>
          </button>
          <button
            onClick={() => handleAction('share')}
            className="flex flex-col items-center justify-center gap-1 bg-indigo-600 text-white p-4 rounded-3xl font-bold shadow-xl shadow-indigo-100 active:scale-95 transition-all"
          >
            <Share2 size={22} className="mb-1 text-indigo-200" />
            <span className="text-sm">Share</span>
          </button>
        </div>
      )}

      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3">
        <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-200 mt-0.5">
           <FileWarning size={16} className="text-amber-500" />
        </div>
        <div>
          <h4 className="font-bold text-slate-800 text-xs">Note on Compression</h4>
          <p className="text-[10px] text-slate-500 leading-relaxed mt-1">This tool optimizes internal structures and removes redundant data. Size reduction varies based on the document's initial complexity.</p>
        </div>
      </div>
    </div>
  );
};

export default Compressor;
