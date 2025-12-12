/**
 * OCR Service for extracting text from images
 * Uses Tesseract.js for optical character recognition
 */

export interface OcrResult {
  text: string;
  confidence: number;
  success: boolean;
  error?: string;
  language?: string;
  blocks?: TextBlock[];
}

export interface TextBlock {
  text: string;
  confidence: number;
  bbox: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
}

/**
 * Extract text from image URL using OCR
 */
export async function extractTextFromImage(imageUrl: string, language = 'eng'): Promise<OcrResult> {
  try {
    // Check if we're in a browser environment that supports Tesseract
    if (typeof window === 'undefined') {
      return {
        text: '',
        confidence: 0,
        success: false,
        error: 'OCR not available in this environment'
      };
    }

    // Check if Tesseract is loaded
    // @ts-ignore - Tesseract will be loaded via CDN or npm package
    if (typeof Tesseract === 'undefined') {
      return await ocrFallback(imageUrl);
    }

    // @ts-ignore
    const worker = await Tesseract.createWorker(language);
    
    try {
      const result = await worker.recognize(imageUrl);
      await worker.terminate();

      return {
        text: result.data.text,
        confidence: result.data.confidence,
        success: true,
        language,
        blocks: result.data.blocks?.map((block: any) => ({
          text: block.text,
          confidence: block.confidence,
          bbox: block.bbox
        }))
      };
    } catch (error) {
      await worker.terminate();
      throw error;
    }
  } catch (error) {
    console.error('OCR error:', error);
    return {
      text: '',
      confidence: 0,
      success: false,
      error: error.message
    };
  }
}

/**
 * Fallback OCR method using a simple API or mock
 */
async function ocrFallback(_imageUrl: string): Promise<OcrResult> {
  // This could integrate with cloud OCR services like:
  // - Google Cloud Vision API
  // - Azure Computer Vision
  // - AWS Textract
  // For now, return a placeholder
  
  return {
    text: '[OCR not configured - install Tesseract.js or configure cloud OCR service]',
    confidence: 0,
    success: false,
    error: 'Tesseract.js not loaded. Add it to your project for OCR functionality.'
  };
}

/**
 * Extract text from image with preprocessing for better accuracy
 */
export async function extractTextWithPreprocessing(imageUrl: string): Promise<OcrResult> {
  try {
    // Load image and preprocess
    const preprocessedImage = await preprocessImage(imageUrl);
    
    // Run OCR on preprocessed image
    return await extractTextFromImage(preprocessedImage);
  } catch (error) {
    // Fallback to original image if preprocessing fails
    return await extractTextFromImage(imageUrl);
  }
}

/**
 * Preprocess image for better OCR accuracy
 */
async function preprocessImage(imageUrl: string): Promise<string> {
  return new Promise((resolve, _reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve(imageUrl);
        return;
      }

      // Scale up small images
      const scale = Math.max(1, 1200 / Math.max(img.width, img.height));
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      // Draw with enhancements
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Convert to grayscale and increase contrast
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        // Convert to grayscale
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        
        // Increase contrast
        const contrast = 1.5;
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        const adjusted = factor * (gray - 128) + 128;
        
        data[i] = adjusted;     // R
        data[i + 1] = adjusted; // G
        data[i + 2] = adjusted; // B
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL());
    };

    img.onerror = () => resolve(imageUrl);
    img.src = imageUrl;
  });
}

/**
 * Detect if image contains text
 */
export async function hasText(imageUrl: string): Promise<boolean> {
  const result = await extractTextFromImage(imageUrl);
  return result.success && result.text.trim().length > 10 && result.confidence > 50;
}

/**
 * Extract structured data from specific document types
 */
export async function extractStructuredData(imageUrl: string, documentType: 'receipt' | 'business-card' | 'form'): Promise<any> {
  const ocrResult = await extractTextFromImage(imageUrl);
  
  if (!ocrResult.success) {
    return null;
  }

  switch (documentType) {
    case 'receipt':
      return parseReceipt(ocrResult.text);
    case 'business-card':
      return parseBusinessCard(ocrResult.text);
    case 'form':
      return parseForm(ocrResult.text);
    default:
      return { text: ocrResult.text };
  }
}

/**
 * Parse receipt text
 */
function parseReceipt(text: string): any {
  const lines = text.split('\n');
  const receipt: any = {
    items: [],
    total: null,
    date: null,
    merchant: null
  };

  // Look for total amount
  const totalMatch = text.match(/total[:\s]*\$?(\d+\.?\d*)/i);
  if (totalMatch) {
    receipt.total = parseFloat(totalMatch[1]);
  }

  // Look for date
  const dateMatch = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
  if (dateMatch) {
    receipt.date = dateMatch[1];
  }

  // Merchant is usually first line
  receipt.merchant = lines[0]?.trim();

  return receipt;
}

/**
 * Parse business card text
 */
function parseBusinessCard(text: string): any {
  const card: any = {
    name: null,
    title: null,
    company: null,
    email: null,
    phone: null
  };

  // Extract email
  const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
  if (emailMatch) {
    card.email = emailMatch[1];
  }

  // Extract phone
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) {
    card.phone = phoneMatch[0];
  }

  return card;
}

/**
 * Parse form text
 */
function parseForm(text: string): any {
  const fields: any = {};
  const lines = text.split('\n');

  for (const line of lines) {
    // Look for "label: value" patterns
    const match = line.match(/^([^:]+):\s*(.+)$/);
    if (match) {
      const key = match[1].trim().toLowerCase().replace(/\s+/g, '_');
      fields[key] = match[2].trim();
    }
  }

  return fields;
}

/**
 * Batch OCR processing for multiple images
 */
export async function processImageBatch(imageUrls: string[]): Promise<OcrResult[]> {
  const results = await Promise.all(
    imageUrls.map(url => extractTextFromImage(url))
  );
  return results;
}

/**
 * Get OCR status and availability
 */
export function getOcrStatus(): { available: boolean; provider: string } {
  // @ts-ignore
  if (typeof window !== 'undefined' && typeof Tesseract !== 'undefined') {
    return { available: true, provider: 'Tesseract.js' };
  }
  return { available: false, provider: 'none' };
}
