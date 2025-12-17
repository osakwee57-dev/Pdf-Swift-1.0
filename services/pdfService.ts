
// @ts-ignore
const { jsPDF } = window.jspdf;

export const generatePdfFromImages = async (images: string[]): Promise<Blob> => {
  const doc = new jsPDF();
  
  for (let i = 0; i < images.length; i++) {
    if (i > 0) doc.addPage();
    
    const imgData = images[i];
    const imgProps = doc.getImageProperties(imgData);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    const ratio = Math.min(pageWidth / imgProps.width, pageHeight / imgProps.height);
    const width = imgProps.width * ratio;
    const height = imgProps.height * ratio;
    
    doc.addImage(imgData, 'JPEG', (pageWidth - width) / 2, (pageHeight - height) / 2, width, height);
  }
  
  return doc.output('blob');
};

export const generatePdfFromText = async (text: string, title: string = 'Document'): Promise<Blob> => {
  const doc = new jsPDF();
  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const splitText = doc.splitTextToSize(text, pageWidth - margin * 2);
  
  doc.setFontSize(18);
  doc.text(title, margin, margin + 5);
  doc.setFontSize(12);
  doc.text(splitText, margin, margin + 20);
  
  return doc.output('blob');
};

export const sharePdf = async (blob: Blob, filename: string) => {
  const file = new File([blob], filename, { type: 'application/pdf' });
  
  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: 'Share PDF',
        text: 'Sent from PDF Swift',
      });
    } catch (error: any) {
      // Detect if the share was cancelled by the user.
      // 'AbortError' is standard, but we check message content for broader compatibility.
      const isCancel = error.name === 'AbortError' || 
                       error.message?.toLowerCase().includes('cancel') || 
                       error.message?.toLowerCase().includes('abort');
      
      if (isCancel) {
        // User deliberately cancelled the share dialog. Do nothing.
        return;
      }
      
      console.error('Error sharing:', error);
      // Only fallback to download if it's a technical error, not a user cancellation.
      downloadPdf(blob, filename);
    }
  } else {
    downloadPdf(blob, filename);
  }
};

export const downloadPdf = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
