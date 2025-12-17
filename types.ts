
export enum AppSection {
  SCANNER = 'scanner',
  TEXT_TO_PDF = 'text_to_pdf',
  PHOTOS_TO_PDF = 'photos_to_pdf',
  COMPRESS_PDF = 'compress_pdf'
}

export interface ScannedImage {
  id: string;
  url: string;
  blob: Blob;
}
