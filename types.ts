export enum NodeType {
  VIDEO = 'VIDEO',
  ARTICLE = 'ARTICLE',
  NOTE = 'NOTE',
  IMAGE = 'IMAGE',
  TWEET = 'TWEET',
  CHAT_LOG = 'CHAT_LOG',
  LINK = 'LINK'
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