export enum NodeType {
  VIDEO = 'VIDEO',
  ARTICLE = 'ARTICLE',
  NOTE = 'NOTE',
  IMAGE = 'IMAGE',
  TWEET = 'TWEET',
  CHAT_LOG = 'CHAT_LOG',
  LINK = 'LINK',
  PDF = 'PDF',
  CODE_SNIPPET = 'CODE_SNIPPET',
  QUOTE = 'QUOTE',
  AUDIO = 'AUDIO',
  BOOKMARK = 'BOOKMARK'
}

export interface Space {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  icon?: string;
  color?: string;
}

export interface Node {
  id: string;
  spaceId: string;
  type: NodeType;
  title: string;
  summary: string;
  content?: string;
  url?: string;
  tags: string[];
  createdAt: string;
  status: 'new' | 'learned' | 'archived';
  pinned: boolean;
  source?: 'extension' | 'web' | 'chat';
  // Enhanced metadata
  metadata?: NodeMetadata;
  // Media URLs
  mediaUrl?: string;
  thumbnail?: string;
  // Content analysis
  aiGenerated?: boolean;
  language?: string;
  readingTime?: number; // in minutes
}

export interface NodeMetadata {
  // Common metadata
  author?: string;
  published?: string;
  siteName?: string;
  favicon?: string;
  keywords?: string[];
  description?: string;
  
  // Media metadata
  images?: string[];
  duration?: string; // for videos/audio
  resolution?: string;
  fileSize?: string;
  
  // YouTube specific
  transcript?: string;
  channelName?: string;
  views?: string;
  
  // Article specific
  wordCount?: number;
  headings?: string[];
  
  // Code snippet specific
  language?: string;
  lines?: number;
  
  // Extracted data
  extractedText?: string; // from images via OCR
  structuredData?: any; // JSON-LD or other structured data
  
  // Scraping metadata
  scrapedAt?: string;
  scrapeSuccess?: boolean;
  
  // AI analysis
  keyPoints?: string[];
  category?: string;
  aiAnalyzed?: boolean;
  
  // Quote/highlight specific
  source?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Edge {
  source: string;
  target: string;
  relation: string;
}

export interface KnowledgeGraphData {
  nodes: Node[];
  edges: Edge[];
}