/**
 * AI Content Analysis Service
 * Uses Gemini to analyze content and generate tags, summaries, and insights
 */

import { GoogleGenAI } from "@google/genai";
import { Node, NodeType } from '../types';
import { getEnv } from '../utils/env';

let ai: GoogleGenAI | null = null;
const MODEL_NAME = 'gemini-2.5-flash';

const getAiClient = (): GoogleGenAI | null => {
  if (ai) return ai;
  const apiKey = getEnv('VITE_GEMINI_API_KEY');
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }
  try {
    ai = new GoogleGenAI({ apiKey });
    return ai;
  } catch (e) {
    console.error("Failed to init Gemini:", e);
    return null;
  }
};

export interface ContentAnalysis {
  tags: string[];
  summary: string;
  keyPoints?: string[];
  category?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  topics?: string[];
  entities?: string[];
  language?: string;
  readingTime?: number;
}

/**
 * Analyze content and generate tags, summary, and insights
 */
export async function analyzeContent(
  content: string,
  title: string,
  type: NodeType,
  url?: string
): Promise<ContentAnalysis> {
  const client = getAiClient();
  
  if (!client) {
    return generateFallbackAnalysis(content, title, type);
  }

  try {
    const prompt = buildAnalysisPrompt(content, title, type, url);
    // @ts-ignore - GoogleGenAI API compatibility
    const model = client.getGenerativeModel({ model: MODEL_NAME });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return parseAnalysisResponse(text, content);
  } catch (error) {
    console.error('Content analysis error:', error);
    return generateFallbackAnalysis(content, title, type);
  }
}

/**
 * Build analysis prompt based on content type
 */
function buildAnalysisPrompt(content: string, title: string, type: NodeType, url?: string): string {
  const contentPreview = content.substring(0, 5000); // Limit content length
  
  let typeContext = '';
  switch (type) {
    case NodeType.VIDEO:
      typeContext = 'This is a video transcript or description. Focus on main topics discussed.';
      break;
    case NodeType.ARTICLE:
      typeContext = 'This is an article. Extract key concepts and themes.';
      break;
    case NodeType.CODE_SNIPPET:
      typeContext = 'This is a code snippet. Identify programming language and purpose.';
      break;
    case NodeType.IMAGE:
      typeContext = 'This is text extracted from an image via OCR.';
      break;
    case NodeType.TWEET:
      typeContext = 'This is a social media post. Capture main message and tone.';
      break;
    default:
      typeContext = 'Analyze this content.';
  }

  return `You are an AI assistant helping to organize and tag knowledge.

${typeContext}

Title: ${title}
${url ? `URL: ${url}` : ''}

Content:
${contentPreview}

Please analyze this content and provide:
1. 5-7 relevant tags (specific topics, concepts, technologies mentioned)
2. A concise 2-3 sentence summary
3. 3-5 key points or takeaways
4. Overall category (e.g., Technology, Business, Science, etc.)
5. Main topics/themes

Format your response as JSON:
{
  "tags": ["tag1", "tag2", ...],
  "summary": "...",
  "keyPoints": ["point1", "point2", ...],
  "category": "...",
  "topics": ["topic1", "topic2", ...]
}`;
}

/**
 * Parse AI response into structured analysis
 */
function parseAnalysisResponse(response: string, content: string): ContentAnalysis {
  try {
    // Try to extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        tags: parsed.tags || [],
        summary: parsed.summary || '',
        keyPoints: parsed.keyPoints || [],
        category: parsed.category,
        topics: parsed.topics || [],
        sentiment: detectSentiment(content),
        readingTime: estimateReadingTime(content)
      };
    }
  } catch (error) {
    console.error('Failed to parse AI response:', error);
  }

  // Fallback parsing
  return {
    tags: extractTagsFromText(response),
    summary: extractFirstSentences(response, 2),
    sentiment: detectSentiment(content),
    readingTime: estimateReadingTime(content)
  };
}

/**
 * Generate fallback analysis without AI
 */
function generateFallbackAnalysis(content: string, title: string, type: NodeType): ContentAnalysis {
  const tags = extractKeywordsSimple(content, title, 5);
  
  return {
    tags,
    summary: extractFirstSentences(content, 2),
    category: getCategoryFromType(type),
    sentiment: detectSentiment(content),
    readingTime: estimateReadingTime(content),
    keyPoints: extractKeyPointsSimple(content)
  };
}

/**
 * Extract keywords using simple frequency analysis
 */
function extractKeywordsSimple(content: string, title: string, count: number): string[] {
  const text = `${title} ${content}`.toLowerCase();
  const words = text.split(/\W+/).filter(w => w.length > 3);
  
  // Common stop words to exclude
  const stopWords = new Set([
    'this', 'that', 'with', 'from', 'have', 'will', 'would', 'could',
    'their', 'there', 'about', 'which', 'when', 'where', 'what', 'who',
    'been', 'were', 'said', 'they', 'them', 'than', 'then', 'these',
    'those', 'such', 'into', 'through', 'during', 'before', 'after',
    'above', 'below', 'between', 'under', 'again', 'further', 'once'
  ]);

  // Count word frequency
  const frequency: { [key: string]: number } = {};
  for (const word of words) {
    if (!stopWords.has(word)) {
      frequency[word] = (frequency[word] || 0) + 1;
    }
  }

  // Sort by frequency and return top keywords
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([word]) => word);
}

/**
 * Extract first N sentences from text
 */
function extractFirstSentences(text: string, n: number): string {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  return sentences.slice(0, n).join(' ').trim();
}

/**
 * Extract tags from AI response text
 */
function extractTagsFromText(text: string): string[] {
  // Look for common tag patterns
  const tagPatterns = [
    /tags?:\s*\[([^\]]+)\]/i,
    /tags?:\s*([^\n]+)/i,
    /#(\w+)/g
  ];

  for (const pattern of tagPatterns) {
    const match = text.match(pattern);
    if (match) {
      if (pattern === tagPatterns[2]) {
        // Hashtag pattern returns multiple matches
        return Array.from(text.matchAll(pattern)).map(m => m[1]);
      }
      // Split by comma for other patterns
      return match[1].split(/,\s*/).map(t => t.trim().replace(/^["']|["']$/g, ''));
    }
  }

  return [];
}

/**
 * Get category from node type
 */
function getCategoryFromType(type: NodeType): string {
  const categoryMap: { [key in NodeType]?: string } = {
    [NodeType.ARTICLE]: 'Article',
    [NodeType.VIDEO]: 'Video',
    [NodeType.CODE_SNIPPET]: 'Programming',
    [NodeType.IMAGE]: 'Visual',
    [NodeType.NOTE]: 'Note',
    [NodeType.TWEET]: 'Social Media',
    [NodeType.PDF]: 'Document'
  };
  return categoryMap[type] || 'General';
}

/**
 * Detect sentiment (simple implementation)
 */
function detectSentiment(text: string): 'positive' | 'negative' | 'neutral' {
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'best', 'love', 'happy'];
  const negativeWords = ['bad', 'terrible', 'awful', 'worst', 'hate', 'poor', 'disappointing', 'sad', 'angry'];

  const lowerText = text.toLowerCase();
  const positiveCount = positiveWords.filter(w => lowerText.includes(w)).length;
  const negativeCount = negativeWords.filter(w => lowerText.includes(w)).length;

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

/**
 * Estimate reading time in minutes
 */
function estimateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const words = text.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Extract key points using simple heuristics
 */
function extractKeyPointsSimple(content: string): string[] {
  // Look for sentences with numbers, questions, or emphasis
  const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
  
  const keyPoints = sentences
    .filter(s => {
      const hasNumber = /\d+/.test(s);
      const isQuestion = s.includes('?');
      const hasEmphasis = /important|key|note|remember|crucial|essential/i.test(s);
      return hasNumber || isQuestion || hasEmphasis;
    })
    .slice(0, 5)
    .map(s => s.trim());

  return keyPoints;
}

/**
 * Batch analyze multiple nodes
 */
export async function analyzeNodeBatch(nodes: Node[]): Promise<Map<string, ContentAnalysis>> {
  const results = new Map<string, ContentAnalysis>();
  
  for (const node of nodes) {
    try {
      const content = node.content || node.summary;
      const analysis = await analyzeContent(content, node.title, node.type, node.url);
      results.set(node.id, analysis);
    } catch (error) {
      console.error(`Failed to analyze node ${node.id}:`, error);
    }
  }
  
  return results;
}

/**
 * Suggest related tags based on existing tags in the space
 */
export async function suggestRelatedTags(
  content: string,
  existingTags: string[]
): Promise<string[]> {
  const client = getAiClient();
  
  if (!client) {
    return [];
  }

  try {
    const prompt = `Based on this content and existing tags, suggest 3-5 additional relevant tags:

Content preview: ${content.substring(0, 1000)}

Existing tags in space: ${existingTags.join(', ')}

Suggest tags that would help connect this content to existing knowledge. Return only the tags as a comma-separated list.`;

    const model = client.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text.split(/,\s*/).map(t => t.trim()).filter(t => t.length > 0);
  } catch (error) {
    console.error('Tag suggestion error:', error);
    return [];
  }
}

/**
 * Generate smart summary for long content
 */
export async function generateSmartSummary(content: string, maxLength = 200): Promise<string> {
  const client = getAiClient();
  
  if (!client) {
    return extractFirstSentences(content, 2);
  }

  try {
    const prompt = `Summarize this content in ${maxLength} characters or less. Be concise and capture the main idea:

${content.substring(0, 10000)}`;

    const model = client.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Summary generation error:', error);
    return extractFirstSentences(content, 2);
  }
}

/**
 * Extract entities (people, places, organizations) from content
 */
export async function extractEntities(content: string): Promise<string[]> {
  const client = getAiClient();
  
  if (!client) {
    return [];
  }

  try {
    const prompt = `Extract named entities (people, places, organizations, technologies) from this text. Return as comma-separated list:

${content.substring(0, 5000)}`;

    const model = client.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text.split(/,\s*/).map(t => t.trim()).filter(t => t.length > 0);
  } catch (error) {
    console.error('Entity extraction error:', error);
    return [];
  }
}
