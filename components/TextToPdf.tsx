
import React, { useState } from 'react';
import { FileText, Download, Share2, Trash2 } from 'lucide-react';
import { generatePdfFromText, sharePdf, downloadPdf } from '../services/pdfService';

const TextToPdf: React.FC = () => {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAction = async (type: 'share' | 'download') => {
    if (!text.trim()) return;
    setIsGenerating(true);
    try {
      const blob = await generatePdfFromText(text, title || 'Note');
      const filename = `${(title || 'Note').replace(/\s+/g, '_')}_${Date.now()}.pdf`;
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
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Document Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="E.g. Project Requirements"
            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all placeholder:text-slate-300 font-medium"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Document Content</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text here..."
            className="w-full h-80 px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all resize-none placeholder:text-slate-300 leading-relaxed font-medium"
          />
        </div>

        <div className="flex justify-between items-center pt-2">
          <button 
            onClick={() => {setText(''); setTitle('');}}
            className="text-slate-400 hover:text-red-500 flex items-center gap-2 text-sm font-bold transition-colors p-2 hover:bg-red-50 rounded-xl"
          >
            <Trash2 size={16} />
            Reset Editor
          </button>
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter bg-slate-100 px-3 py-1 rounded-full">{text.length} Characters</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          disabled={!text.trim() || isGenerating}
          onClick={() => handleAction('download')}
          className="flex flex-col items-center justify-center gap-1 bg-white text-slate-700 p-4 rounded-3xl font-bold shadow-sm border border-slate-200 disabled:opacity-50 active:scale-95 transition-all"
        >
          <Download size={22} className="mb-1 text-slate-400" />
          <span className="text-sm">Download</span>
        </button>
        <button
          disabled={!text.trim() || isGenerating}
          onClick={() => handleAction('share')}
          className="flex flex-col items-center justify-center gap-1 bg-indigo-600 text-white p-4 rounded-3xl font-bold shadow-xl shadow-indigo-100 disabled:opacity-50 active:scale-95 transition-all"
        >
          <Share2 size={22} className="mb-1 text-indigo-200" />
          <span className="text-sm">Share</span>
        </button>
      </div>
    </div>
  );
};

export default TextToPdf;
