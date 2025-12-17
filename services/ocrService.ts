
// @ts-ignore
const Tesseract = window.Tesseract;

export const extractTextFromImage = async (imageSrc: string, onProgress?: (progress: number) => void): Promise<string> => {
  try {
    const worker = await Tesseract.createWorker('eng', 1, {
      logger: (m: any) => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress(m.progress);
        }
      },
    });
    
    const { data: { text } } = await worker.recognize(imageSrc);
    await worker.terminate();
    return text;
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to extract text from image');
  }
};
