
import React, { useState } from 'react';
import { Image as ImageIcon, Plus, X, Share2, Download, Layers, Trash2 } from 'lucide-react';
import { generatePdfFromImages, sharePdf, downloadPdf } from '../services/pdfService';

const PhotosToPdf: React.FC = () => {
  const [images, setImages] = useState<{ id: string; url: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    const newImages = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file)
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleAction = async (type: 'share' | 'download') => {
    if (images.length === 0) return;
    setIsGenerating(true);
    try {
      const urls = images.map(img => img.url);
      const blob = await generatePdfFromImages(urls);
      const filename = `photos_${Date.now()}.pdf`;
      if (type === 'share') {
        await sharePdf(blob, filename);
      } else {
        downloadPdf(blob, filename);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Layers size={20} className="text-indigo-600" />
              Document Gallery
            </h3>
            <p className="text-xs text-slate-400 font-medium">{images.length} items added</p>
          </div>
          <div className="flex gap-2">
            {images.length > 0 && (
              <button 
                onClick={() => setImages([])}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                title="Clear all"
              >
                <Trash2 size={20} />
              </button>
            )}
            <label className="cursor-pointer bg-indigo-50 text-indigo-600 p-3 rounded-2xl hover:bg-indigo-100 transition-all active:scale-90 border border-indigo-100">
              <Plus size={24} />
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange} 
              />
            </label>
          </div>
        </div>

        {images.length === 0 ? (
          <label className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-slate-100 rounded-3xl cursor-pointer hover:bg-slate-50 transition-all group group">
            <div className="bg-slate-50 p-6 rounded-full group-hover:bg-indigo-50 transition-colors mb-4">
              <ImageIcon size={48} className="text-slate-200 group-hover:text-indigo-300 transition-colors" />
            </div>
            <span className="text-sm text-slate-400 font-bold">Tap to add images</span>
            <p className="text-[10px] text-slate-300 mt-2 uppercase tracking-widest">Supports JPEG, PNG</p>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange} 
            />
          </label>
        ) : (
          <div className="grid grid-cols-3 gap-3 max-h-[50vh] overflow-y-auto pr-1 pb-2">
            {images.map(img => (
              <div key={img.id} className="aspect-square relative group rounded-2xl overflow-hidden shadow-sm border border-slate-100 bg-slate-50">
                <img src={img.url} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={() => removeImage(img.id)}
                    className="bg-red-500 text-white p-2 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 animate-fade-in">
          <button
            disabled={isGenerating}
            onClick={() => handleAction('download')}
            className="flex flex-col items-center justify-center gap-1 bg-white text-slate-700 p-4 rounded-3xl font-bold shadow-sm border border-slate-200 disabled:opacity-50 active:scale-95 transition-all"
          >
            <Download size={22} className="mb-1 text-slate-400" />
            <span className="text-sm">Download</span>
          </button>
          <button
            disabled={isGenerating}
            onClick={() => handleAction('share')}
            className="flex flex-col items-center justify-center gap-1 bg-indigo-600 text-white p-4 rounded-3xl font-bold shadow-xl shadow-indigo-100 disabled:opacity-50 active:scale-95 transition-all"
          >
            <Share2 size={22} className="mb-1 text-indigo-200" />
            <span className="text-sm">Share</span>
          </button>
        </div>
      )}

      <style>{`
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

export default PhotosToPdf;
