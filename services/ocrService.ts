
// @ts-ignore
const Tesseract = window.Tesseract;

/**
 * Extracts text from an image using Tesseract.js (Client-side WASM OCR).
 * This runs locally in the browser and does not call any external API.
 */
export const extractTextFromImage = async (imageSrc: string, onProgress?: (progress: number) => void): Promise<string> => {
  try {
    // Initialize the worker with specific configuration for speed
    const worker = await Tesseract.createWorker('eng', 1, {
      logger: (m: any) => {
        if (onProgress && m.status === 'recognizing text') {
          onProgress(m.progress);
        }
      },
      // Using corePath and workerPath from CDN to ensure WASM is loaded
      // but the actual execution is local.
      workerPath: 'https://unpkg.com/tesseract.js@v5.0.0/dist/worker.min.js',
      corePath: 'https://unpkg.com/tesseract.js-core@v5.0.0/tesseract-core.wasm.js',
    });
    
    // Perform recognition
    const { data: { text } } = await worker.recognize(imageSrc);
    
    // Clean up
    await worker.terminate();
    
    return text || "No text could be recognized.";
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Local OCR failed. Please check image quality.');
  }
};
