
import React, { useState } from 'react';
import Layout from './components/Layout';
import Scanner from './components/Scanner';
import TextToPdf from './components/TextToPdf';
import PhotosToPdf from './components/PhotosToPdf';
import Compressor from './components/Compressor';
import { AppSection } from './types';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AppSection>(AppSection.SCANNER);

  const renderSection = () => {
    switch (activeSection) {
      case AppSection.SCANNER:
        return <Scanner />;
      case AppSection.TEXT_TO_PDF:
        return <TextToPdf />;
      case AppSection.PHOTOS_TO_PDF:
        return <PhotosToPdf />;
      case AppSection.COMPRESS_PDF:
        return <Compressor />;
      default:
        return <Scanner />;
    }
  };

  return (
    <Layout activeSection={activeSection} onSectionChange={setActiveSection}>
      <div className="animate-fade-in" key={activeSection}>
        <div className="mb-6">
          <h2 className="text-2xl font-black text-slate-800">
            {activeSection === AppSection.SCANNER && "Document Scanner"}
            {activeSection === AppSection.TEXT_TO_PDF && "Text to PDF"}
            {activeSection === AppSection.PHOTOS_TO_PDF && "Photos to PDF"}
            {activeSection === AppSection.COMPRESS_PDF && "PDF Compressor"}
          </h2>
          <p className="text-slate-500 text-sm">
            {activeSection === AppSection.SCANNER && "Convert physical documents to digital PDFs."}
            {activeSection === AppSection.TEXT_TO_PDF && "Type or paste text to generate a PDF."}
            {activeSection === AppSection.PHOTOS_TO_PDF && "Combine multiple images into one PDF."}
            {activeSection === AppSection.COMPRESS_PDF && "Reduce PDF file size for easier sharing."}
          </p>
        </div>
        
        {renderSection()}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
      `}</style>
    </Layout>
  );
};

export default App;
