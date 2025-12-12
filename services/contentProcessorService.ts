/**
 * Content Processor Service
 * Orchestrates all content processing: scraping, OCR, transcript extraction, and AI analysis
 */

import { Node, NodeType } from '../types';
import { scrapeUrl } from './contentScraperService';
import { getYouTubeTranscript } from './youtubeTranscriptService';
import { extractTextFromImage } from './ocrService';
import { analyzeContent } from './aiAnalysisService';

export interface ProcessingOptions {
  enableScraping?: boolean;
  enableOCR?: boolean;
  enableTranscripts?: boolean;
  enableAIAnalysis?: boolean;
  autoGenerateTags?: boolean;
}

export interface ProcessedContent {
  node: Node;
  processingLog: string[];
  success: boolean;
  errors?: string[];
}

/**
 * Process content from context menu capture
 */
export async function processContextMenuCapture(
  captureData: any,
  spaceId: string,
  options: ProcessingOptions = {}
): Promise<ProcessedContent> {
  const {
    enableScraping = true,
    enableOCR = true,
    enableTranscripts = true,
    enableAIAnalysis = true,
    autoGenerateTags = true
  } = options;

  const log: string[] = [];
  const errors: string[] = [];
  let node: Node = {
    id: Date.now().toString(),
    spaceId,
    type: captureData.nodeType,
    title: captureData.title,
    summary: captureData.content.substring(0, 200),
    content: captureData.content,
    url: captureData.url,
    tags: [captureData.type],
    createdAt: new Date().toISOString(),
    status: 'new',
    pinned: false,
    source: 'extension',
    metadata: {}
  };

  try {
    // Process based on content type
    switch (captureData.type) {
      case 'IMAGE':
        if (enableOCR && captureData.mediaUrl) {
          log.push('Extracting text from image...');
          const ocrResult = await extractTextFromImage(captureData.mediaUrl);
          if (ocrResult.success && ocrResult.text) {
            node.metadata!.extractedText = ocrResult.text;
            node.content = `${node.content}\n\nExtracted Text:\n${ocrResult.text}`;
            log.push(`OCR successful: ${ocrResult.text.length} characters extracted`);
          } else {
            errors.push('OCR failed or no text found');
          }
        }
        node.mediaUrl = captureData.mediaUrl;
        node.thumbnail = captureData.mediaUrl;
        break;

      case 'VIDEO':
        if (captureData.isYoutube && enableTranscripts) {
          log.push('Fetching YouTube transcript...');
          const transcript = await getYouTubeTranscript(captureData.content);
          if (transcript.success && transcript.transcript) {
            node.metadata!.transcript = transcript.transcript;
            node.content = transcript.transcript;
            node.summary = transcript.transcript.substring(0, 300);
            node.title = transcript.title || node.title;
            log.push(`Transcript extracted: ${transcript.transcript.length} characters`);
          } else {
            errors.push('Transcript extraction failed');
          }
        }
        node.mediaUrl = captureData.mediaUrl;
        break;

      case 'LINK':
      case 'PAGE':
        if (enableScraping && captureData.url) {
          log.push('Scraping URL content...');
          const scraped = await scrapeUrl(captureData.url);
          if (scraped.success) {
            node.title = scraped.title || node.title;
            node.summary = scraped.summary;
            node.content = scraped.content;
            node.metadata = {
              ...node.metadata,
              ...scraped.metadata,
              scrapedAt: new Date().toISOString(),
              scrapeSuccess: true
            };
            if (scraped.metadata.thumbnail) {
              node.thumbnail = scraped.metadata.thumbnail;
            }
            log.push('Content scraped successfully');
          } else {
            errors.push(`Scraping failed: ${scraped.error}`);
          }
        }
        break;

      case 'TEXT':
        // Text content is already captured
        node.type = NodeType.NOTE;
        break;
    }

    // AI Analysis
    if (enableAIAnalysis && node.content) {
      log.push('Analyzing content with AI...');
      try {
        const analysis = await analyzeContent(
          node.content,
          node.title,
          node.type,
          node.url
        );

        if (autoGenerateTags && analysis.tags.length > 0) {
          node.tags = [...new Set([...node.tags, ...analysis.tags])];
          log.push(`Generated ${analysis.tags.length} tags`);
        }

        if (analysis.summary && node.summary === node.content.substring(0, 200)) {
          node.summary = analysis.summary;
          log.push('AI-generated summary created');
        }

        if (analysis.keyPoints) {
          node.metadata!.keyPoints = analysis.keyPoints;
        }

        if (analysis.category) {
          node.metadata!.category = analysis.category;
        }

        if (analysis.readingTime) {
          node.readingTime = analysis.readingTime;
        }

        node.metadata!.aiAnalyzed = true;
        node.aiGenerated = true;
      } catch (error: any) {
        errors.push(`AI analysis failed: ${error.message}`);
        log.push('AI analysis skipped or failed');
      }
    }

    // Calculate reading time if not set
    if (!node.readingTime && node.content) {
      const wordCount = node.content.split(/\s+/).length;
      node.readingTime = Math.ceil(wordCount / 200);
    }

    return {
      node,
      processingLog: log,
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error: any) {
    errors.push(`Processing failed: ${error.message}`);
    return {
      node,
      processingLog: log,
      success: false,
      errors
    };
  }
}

/**
 * Process a batch of URLs
 */
export async function processBatchUrls(
  urls: string[],
  spaceId: string,
  options: ProcessingOptions = {}
): Promise<ProcessedContent[]> {
  const results: ProcessedContent[] = [];

  for (const url of urls) {
    const captureData = {
      type: 'LINK',
      nodeType: NodeType.LINK,
      title: url,
      content: url,
      url,
      requiresProcessing: true
    };

    const result = await processContextMenuCapture(captureData, spaceId, options);
    results.push(result);
  }

  return results;
}

/**
 * Re-process existing node with updated options
 */
export async function reprocessNode(
  node: Node,
  options: ProcessingOptions = {}
): Promise<ProcessedContent> {
  const captureData = {
    type: node.type,
    nodeType: node.type,
    title: node.title,
    content: node.content || '',
    url: node.url,
    mediaUrl: node.mediaUrl,
    isYoutube: node.url?.includes('youtube.com') || node.url?.includes('youtu.be')
  };

  return processContextMenuCapture(captureData, node.spaceId, options);
}

/**
 * Extract and process code snippets
 */
export async function processCodeSnippet(
  code: string,
  language: string,
  spaceId: string
): Promise<ProcessedContent> {
  const lines = code.split('\n').length;
  
  const node: Node = {
    id: Date.now().toString(),
    spaceId,
    type: NodeType.CODE_SNIPPET,
    title: `${language} snippet (${lines} lines)`,
    summary: code.substring(0, 200),
    content: code,
    tags: [language, 'code'],
    createdAt: new Date().toISOString(),
    status: 'new',
    pinned: false,
    source: 'extension',
    metadata: {
      language,
      lines
    },
    language
  };

  // Try to analyze code with AI
  try {
    const analysis = await analyzeContent(code, node.title, NodeType.CODE_SNIPPET);
    if (analysis.tags.length > 0) {
      node.tags = [...new Set([...node.tags, ...analysis.tags])];
    }
    node.summary = analysis.summary || node.summary;
  } catch (error) {
    console.error('Code analysis failed:', error);
  }

  return {
    node,
    processingLog: ['Code snippet processed'],
    success: true
  };
}

/**
 * Process quote/highlight
 */
export async function processQuote(
  text: string,
  source: string,
  author: string | undefined,
  spaceId: string
): Promise<ProcessedContent> {
  const node: Node = {
    id: Date.now().toString(),
    spaceId,
    type: NodeType.QUOTE,
    title: `"${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
    summary: text,
    content: text,
    url: source,
    tags: ['quote'],
    createdAt: new Date().toISOString(),
    status: 'new',
    pinned: false,
    source: 'extension',
    metadata: {
      author,
      source
    }
  };

  if (author) {
    node.tags.push(author);
  }

  return {
    node,
    processingLog: ['Quote saved'],
    success: true
  };
}

/**
 * Validate and sanitize node data
 */
export function validateNode(node: Node): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!node.title || node.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (!node.spaceId) {
    errors.push('Space ID is required');
  }

  if (!node.type) {
    errors.push('Node type is required');
  }

  if (node.title && node.title.length > 500) {
    errors.push('Title is too long (max 500 characters)');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get processing status message
 */
export function getProcessingStatusMessage(result: ProcessedContent): string {
  if (result.success) {
    return `✅ Processed successfully!\n${result.processingLog.join('\n')}`;
  } else {
    return `⚠️ Processed with errors:\n${result.errors?.join('\n')}`;
  }
}
