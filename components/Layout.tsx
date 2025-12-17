
import React from 'react';
import { Camera, FileText, Image as ImageIcon, ShieldCheck, Shrink } from 'lucide-react';
import { AppSection } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeSection: AppSection;
  onSectionChange: (section: AppSection) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeSection, onSectionChange }) => {
  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto bg-white shadow-2xl relative">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <ShieldCheck className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-slate-900 leading-none">PDF Swift</h1>
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              On-Device Processing
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-28 p-6">
        {children}
      </main>

      {/* Navigation - Glassmorphism */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] glass border border-white/20 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex justify-around items-center p-2 z-50">
        <NavItem 
          icon={<Camera size={22} />} 
          label="Scanner" 
          active={activeSection === AppSection.SCANNER} 
          onClick={() => onSectionChange(AppSection.SCANNER)} 
        />
        <NavItem 
          icon={<FileText size={22} />} 
          label="Text" 
          active={activeSection === AppSection.TEXT_TO_PDF} 
          onClick={() => onSectionChange(AppSection.TEXT_TO_PDF)} 
        />
        <NavItem 
          icon={<ImageIcon size={22} />} 
          label="Photos" 
          active={activeSection === AppSection.PHOTOS_TO_PDF} 
          onClick={() => onSectionChange(AppSection.PHOTOS_TO_PDF)} 
        />
        <NavItem 
          icon={<Shrink size={22} />} 
          label="Shrink" 
          active={activeSection === AppSection.COMPRESS_PDF} 
          onClick={() => onSectionChange(AppSection.COMPRESS_PDF)} 
        />
      </nav>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300 ${
      active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110' : 'text-slate-400 hover:text-slate-600'
    }`}
  >
    {icon}
    <span className={`text-[9px] font-bold mt-1 transition-opacity ${active ? 'opacity-100' : 'opacity-0'}`}>{label}</span>
  </button>
);

export default Layout;
