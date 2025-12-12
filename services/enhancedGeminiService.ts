// Enhanced Gemini Service with RAG, Google Search, and Multi-Agent Support
import { GoogleGenAI } from '@google/genai';
import { getEnv } from '../utils/env';
import { Node } from '../types';

let ai: GoogleGenAI | null = null;

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

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface RAGResult {
  response: string;
  sources: string[];
  matchedTitles?: string[];
}

// Memory cache for one-shot learning
const spaceMemoryCache = new Map<string, {
  summary: string;
  keyTopics: string[];
  lastUpdated: number;
}>();

/**
 * Generate one-shot learning summary for a space's content
 */
export async function generateSpaceMemory(nodes: Node[], spaceName: string): Promise<string> {
  if (nodes.length === 0) return '';
  
  const cacheKey = `${spaceName}_${nodes.length}`;
  const cached = spaceMemoryCache.get(cacheKey);
  
  // Use cache if less than 5 minutes old
  if (cached && Date.now() - cached.lastUpdated < 5 * 60 * 1000) {
    return cached.summary;
  }

  const client = getAiClient();
  if (!client) return '';

  // For large content sets, do random sampling
  const maxNodes = 20;
  let selectedNodes = nodes;
  
  if (nodes.length > maxNodes) {
    // Prioritize pinned and recent items, then random sample
    const pinned = nodes.filter(n => n.pinned);
    const recent = nodes.filter(n => !n.pinned).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 5);
    
    const remaining = nodes.filter(n => !n.pinned && !recent.includes(n));
    const randomSample = remaining.sort(() => Math.random() - 0.5).slice(0, maxNodes - pinned.length - recent.length);
    
    selectedNodes = [...pinned, ...recent, ...randomSample];
  }

  const contentSummary = selectedNodes.map(n => 
    `- "${n.title}": ${n.summary || n.content?.substring(0, 100) || 'No description'}`
  ).join('\n');

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{
        role: 'user',
        parts: [{ text: `Analyze this knowledge base and create a concise memory summary (2-3 paragraphs) highlighting key themes, important topics, and connections. This will be used as context for future conversations.

SPACE: ${spaceName}
CONTENT (${nodes.length} total items, showing ${selectedNodes.length}):
${contentSummary}

Create a comprehensive yet concise memory summary:` }]
      }],
      config: { temperature: 0.3, maxOutputTokens: 500 }
    });

    const summary = response.text || '';
    
    spaceMemoryCache.set(cacheKey, {
      summary,
      keyTopics: selectedNodes.map(n => n.title).slice(0, 10),
      lastUpdated: Date.now()
    });

    return summary;
  } catch (e) {
    console.error('Memory generation failed:', e);
    return '';
  }
}

/**
 * Search for nodes by title - returns matching titles for user's query
 */
export function searchByTitle(query: string, nodes: Node[]): Node[] {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
  
  return nodes.filter(node => {
    const title = node.title?.toLowerCase() || '';
    // Exact title match
    if (title.includes(queryLower)) return true;
    // Word-by-word title matching
    return queryWords.some(word => title.includes(word));
  }).slice(0, 5);
}

/**
 * Retrieve relevant nodes based on query similarity with enhanced title matching
 */
export function retrieveRelevantNodes(query: string, nodes: Node[], topK: number = 5): Node[] {
  if (nodes.length === 0) return [];

  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/);

  // First, check for title matches (high priority)
  const titleMatches = searchByTitle(query, nodes);

  // Score each node
  const scored = nodes.map(node => {
    let score = 0;

    // If it's a title match, give huge bonus
    if (titleMatches.includes(node)) {
      score += 20;
    }

    // Title exact match bonus
    if (node.title?.toLowerCase().includes(queryLower)) {
      score += 15;
    }

    // Title word matches (user might be asking about a specific item)
    const titleWords = node.title?.toLowerCase().split(/\s+/) || [];
    queryWords.forEach(word => {
      if (word.length >= 3 && titleWords.some(tw => tw.includes(word) || word.includes(tw))) {
        score += 5;
      }
    });

    // Summary match
    if (node.summary?.toLowerCase().includes(queryLower)) {
      score += 8;
    }

    // Content match
    if (node.content?.toLowerCase().includes(queryLower)) {
      score += 6;
    }

    // Word-by-word matching
    queryWords.forEach(word => {
      if (word.length < 3) return; // Skip short words
      if (node.title?.toLowerCase().includes(word)) score += 3;
      if (node.summary?.toLowerCase().includes(word)) score += 1;
      if (node.tags?.some(tag => tag.toLowerCase().includes(word))) score += 4;
    });

    // Pinned items get bonus
    if (node.pinned) score += 3;

    // Recency bonus (newer = slightly better)
    const ageInDays = node.createdAt
      ? (Date.now() - new Date(node.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      : 999;
    if (ageInDays < 7) score += 2;
    else if (ageInDays < 30) score += 1;

    return { node, score };
  });

  // Sort by score and return top K
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(s => s.node);
}

/**
 * Google search (placeholder - requires Google Custom Search API)
 */
export async function googleSearch(query: string): Promise<string[]> {
  // TODO: Implement Google Custom Search API
  // For now, return placeholder
  console.log('Google search requested for:', query);
  return [
    `Google search for "${query}" - integrate Google Custom Search API`,
    `Add GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_CX to env`
  ];
}

/**
 * Build context from nodes with enhanced formatting
 */
function buildContext(nodes: Node[], includeContent: boolean = false): string {
  if (nodes.length === 0) return 'No relevant knowledge found.';

  return nodes
    .map(
      (node, i) => {
        let context = `[${i + 1}] "${node.title}"`;
        context += `\nSummary: ${node.summary || 'No summary'}`;
        if (includeContent && node.content) {
          context += `\nContent: ${node.content.substring(0, 500)}`;
        }
        context += `\nTags: ${node.tags?.join(', ') || 'none'}`;
        if (node.url) context += `\nSource: ${node.url}`;
        return context;
      }
    )
    .join('\n\n---\n\n');
}

/**
 * Chat with RAG (Retrieval-Augmented Generation) - Enhanced with one-shot learning
 */
export async function chatWithRAG(
  query: string,
  spaceNodes: Node[],
  chatHistory: ChatMessage[],
  useGoogleSearch: boolean = false,
  spaceName: string = 'Current Space',
  spaceMemory?: string
): Promise<RAGResult> {
  const client = getAiClient();
  if (!client) {
    throw new Error('Gemini API not initialized');
  }

  // 1. Check if user is asking about a specific item by title
  const titleMatches = searchByTitle(query, spaceNodes);
  const isAskingAboutSpecificItem = titleMatches.length > 0;

  // 2. Retrieve relevant nodes with enhanced title matching
  const relevantNodes = retrieveRelevantNodes(query, spaceNodes, isAskingAboutSpecificItem ? 3 : 5);

  // 3. Optionally get Google search results
  let googleResults: string[] = [];
  if (useGoogleSearch) {
    googleResults = await googleSearch(query);
  }

  // 4. Build context with one-shot memory
  const knowledgeContext = buildContext(relevantNodes, isAskingAboutSpecificItem);
  const googleContext = googleResults.length > 0
    ? `\n\nWEB SEARCH RESULTS:\n${googleResults.join('\n')}`
    : '';

  // Build matched titles list for the UI
  const matchedTitles = titleMatches.map(n => n.title);

  const systemPrompt = `You are an intelligent AI assistant with deep knowledge of the user's personal knowledge base called "${spaceName}".

${spaceMemory ? `ONE-SHOT MEMORY (Key insights from this space):
${spaceMemory}

` : ''}YOUR KNOWLEDGE BASE (${spaceNodes.length} total items):
${knowledgeContext}
${googleContext}

${isAskingAboutSpecificItem ? `NOTE: User appears to be asking about specific item(s): ${matchedTitles.join(', ')}. Provide detailed information about these items.

` : ''}INSTRUCTIONS:
- Answer based on the knowledge base when possible
- When referencing items, cite them by title in quotes (e.g., "Article Title")
- If the user asks about something specific, check if it matches any saved item titles
- If knowledge is insufficient, say so clearly but offer to help with what you know
- Be conversational, helpful, and provide insights that connect different pieces of knowledge
- If you notice patterns or connections between saved items, mention them

Now help the user with their query.`;

  // 5. Build conversation with history
  const historyText = chatHistory.length > 0 
    ? '\n\nPREVIOUS CONVERSATION:\n' + chatHistory.map(msg => 
        `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`
      ).join('\n\n') + '\n\n---\n\n'
    : '';

  // 6. Call Gemini - include system prompt and history
  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [{ text: systemPrompt + historyText + 'Current user query: ' + query }]
      }
    ],
    config: {
      temperature: 0.7,
      maxOutputTokens: 2048
    }
  });

  const responseText = response.text || 'No response generated.';

  // 7. Extract sources
  const sources = relevantNodes.map(n => n.title || 'Untitled');

  return {
    response: responseText,
    sources,
    matchedTitles
  };
}

/**
 * Summarize chat session
 */
export async function summarizeChatSession(messages: ChatMessage[]): Promise<string> {
  const client = getAiClient();
  if (!client) {
    throw new Error('Gemini API not initialized');
  }

  const chatTranscript = messages
    .map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`)
    .join('\n\n');

  const prompt = `Summarize this conversation in 2-3 concise sentences. Focus on key topics and outcomes:\n\n${chatTranscript}`;

  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{
      role: 'user',
      parts: [{ text: prompt }]
    }],
    config: {
      temperature: 0.3,
      maxOutputTokens: 200
    }
  });

  return response.text || 'Summary unavailable.';
}

/**
 * Compare two spaces (multi-agent collaboration) - Enhanced with memory loading
 */
export async function compareSpaces(
  space1Nodes: Node[],
  space2Nodes: Node[],
  space1Name: string,
  space2Name: string,
  question: string
): Promise<string> {
  const client = getAiClient();
  if (!client) {
    throw new Error('Gemini API not initialized');
  }

  // Generate memories for both spaces (one-shot learning)
  const [memory1, memory2] = await Promise.all([
    generateSpaceMemory(space1Nodes, space1Name),
    generateSpaceMemory(space2Nodes, space2Name)
  ]);

  // Get relevant content from both spaces
  const relevant1 = retrieveRelevantNodes(question, space1Nodes, 5);
  const relevant2 = retrieveRelevantNodes(question, space2Nodes, 5);

  const context1 = buildContext(relevant1, true);
  const context2 = buildContext(relevant2, true);

  const prompt = `You are a collaborative AI facilitating a conversation between two knowledge spaces. Each space has its own memory and expertise.

═══════════════════════════════════════════════════════════════
🧠 AGENT 1: "${space1Name}" Knowledge Expert
═══════════════════════════════════════════════════════════════
${memory1 ? `MEMORY SUMMARY:\n${memory1}\n\n` : ''}RELEVANT KNOWLEDGE (${space1Nodes.length} total items):
${context1}

═══════════════════════════════════════════════════════════════
🧠 AGENT 2: "${space2Name}" Knowledge Expert  
═══════════════════════════════════════════════════════════════
${memory2 ? `MEMORY SUMMARY:\n${memory2}\n\n` : ''}RELEVANT KNOWLEDGE (${space2Nodes.length} total items):
${context2}

═══════════════════════════════════════════════════════════════
USER QUESTION: ${question}
═══════════════════════════════════════════════════════════════

As a mediator between these two knowledge agents:
1. First, have Agent 1 share its perspective based on its knowledge
2. Then, have Agent 2 respond with its perspective
3. Identify connections, synergies, and differences between the spaces
4. Synthesize a comprehensive answer that leverages both knowledge bases
5. Suggest how these spaces could complement each other

Format your response as a dialogue between the agents, then provide a unified synthesis.`;

  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{
      role: 'user',
      parts: [{ text: prompt }]
    }],
    config: {
      temperature: 0.8,
      maxOutputTokens: 3000
    }
  });

  return response.text || 'Comparison unavailable.';
}
