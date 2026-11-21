/**
 * PDF Text Extraction Utility for PaperVerse
 * Uses pdfjs-dist with Vite-compatible worker resolution via ?url.
 * Explained for first-year students:
 * 1. Loads the PDF binary in memory as an ArrayBuffer.
 * 2. Reads each page in sequence and extracts plain text items.
 * 3. Detects scanned or image-only PDFs if the total text count is too low.
 */

import * as pdfjsLib from 'pdfjs-dist';
// Vite syntax: ?url imports the worker file as an asset URL in both dev and production
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';

// Configure the worker source for pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * Extracts plain text from a File or ArrayBuffer
 * @param {File | ArrayBuffer} fileOrBuffer
 * @returns {Promise<{text: string, numPages: number, isScanned: boolean, wordCount: number}>}
 */
export async function extractTextFromPdf(fileOrBuffer) {
  try {
    let arrayBuffer;
    if (fileOrBuffer instanceof ArrayBuffer) {
      arrayBuffer = fileOrBuffer;
    } else if (fileOrBuffer && typeof fileOrBuffer.arrayBuffer === 'function') {
      arrayBuffer = await fileOrBuffer.arrayBuffer();
    } else {
      throw new Error('Invalid file input. Please upload a valid PDF document.');
    }

    // Load document in pdfjs
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true
    });

    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    let fullText = '';

    // Extract text from each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ')
        .replace(/\s+/g, ' ');

      fullText += `\n--- Page ${pageNum} ---\n` + pageText;
    }

    const cleanedText = fullText.trim();
    const words = cleanedText.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // Detect image-only or scanned PDFs: if less than 40 words total across all pages
    const isScanned = wordCount < 40;

    return {
      text: cleanedText,
      numPages,
      isScanned,
      wordCount
    };
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error(
      error?.message?.includes('password')
        ? 'This PDF is password-protected. Please upload an unlocked PDF.'
        : `Could not parse PDF: ${error.message || 'Corrupt or unsupported file.'}`
    );
  }
}

/**
 * Truncate paper text to keep Gemini within prompt context limits
 * User requirement: "Truncate each paper to its first 30,000 characters."
 */
export function truncatePaperText(text, maxChars = 30000) {
  if (!text) return '';
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + `\n\n[... Truncated for token limit at ${maxChars.toLocaleString()} characters ...]`;
}
