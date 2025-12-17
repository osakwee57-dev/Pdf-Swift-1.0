
import React from 'react';
import { Camera, FileText, Image as ImageIcon, FileSearch, Shrink } from 'lucide-react';
import { AppSection } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeSection: AppSection;
  onSectionChange: (section: AppSection) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeSection, onSectionChange }) => {
  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto bg-white shadow-xl relative overflow-hidden">
      {/* Header */}
      <header className="bg-indigo-600 text-white p-4 sticky top-0 z-50 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-white/20 rounded-lg">
            <FileSearch size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">PDF Swift</h1>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-24 p-4">
        {children}
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white border-t border-slate-200 grid grid-cols-4 px-2 py-3 z-50">
        <button
          onClick={() => onSectionChange(AppSection.SCANNER)}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeSection === AppSection.SCANNER ? 'text-indigo-600' : 'text-slate-400'
          }`}
        >
          <Camera size={20} />
          <span className="text-[10px] font-bold">Scanner</span>
        </button>
        <button
          onClick={() => onSectionChange(AppSection.TEXT_TO_PDF)}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeSection === AppSection.TEXT_TO_PDF ? 'text-indigo-600' : 'text-slate-400'
          }`}
        >
          <FileText size={20} />
          <span className="text-[10px] font-bold">Text</span>
        </button>
        <button
          onClick={() => onSectionChange(AppSection.PHOTOS_TO_PDF)}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeSection === AppSection.PHOTOS_TO_PDF ? 'text-indigo-600' : 'text-slate-400'
          }`}
        >
          <ImageIcon size={20} />
          <span className="text-[10px] font-bold">Photos</span>
        </button>
        <button
          onClick={() => onSectionChange(AppSection.COMPRESS_PDF)}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeSection === AppSection.COMPRESS_PDF ? 'text-indigo-600' : 'text-slate-400'
          }`}
        >
          <Shrink size={20} />
          <span className="text-[10px] font-bold">Compress</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
