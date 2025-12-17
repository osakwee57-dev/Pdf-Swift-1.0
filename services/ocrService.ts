
// @ts-ignore
const Tesseract = window.Tesseract;

/**
 * Executes OCR entirely in the client's browser using Tesseract.js WASM.
 * No data is transmitted externally.
 */
export const extractTextFromImage = async (imageSrc: string, onProgress?: (progress: number) => void): Promise<string> => {
  try {
    // Re-initialize the worker for each scan to ensure memory is cleared on low-end devices
    const worker = await Tesseract.createWorker('eng', 1, {
      logger: (m: any) => {
        if (onProgress && m.status === 'recognizing text') {
          onProgress(m.progress);
        }
      },
      workerPath: 'https://unpkg.com/tesseract.js@v5.0.0/dist/worker.min.js',
      corePath: 'https://unpkg.com/tesseract.js-core@v5.0.0/tesseract-core.wasm.js',
    });

    const { data: { text } } = await worker.recognize(imageSrc);
    
    // Explicitly terminate to release browser memory back to the device
    await worker.terminate();
    
    return text.trim() || "No clear text found in the image.";
  } catch (error) {
    console.error('Local OCR Execution Failed:', error);
    throw new Error('On-device OCR failed. Ensure good lighting and clear focus.');
  }
};
