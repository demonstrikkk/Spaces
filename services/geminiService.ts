import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Node, NodeType } from '../types';
import { createNode, getNodesForSpace } from './dataService';
import { getEnv } from '../utils/env';

let ai: GoogleGenAI | null = null;
const MODEL_NAME = 'gemini-2.5-flash';

const getAiClient = (): GoogleGenAI | null => {
  if (ai) return ai;
  const apiKey = getEnv('GEMINI_API_KEY');
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

// Tool definitions for new Gemini 2.0 SDK
const toolDeclarations: FunctionDeclaration[] = [
  {
    name: 'search_knowledge_base',
    description: 'Search existing notes and knowledge for information.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: 'Search term or topic' }
      },
      required: ['query']
    }
  },
  {
    name: 'create_knowledge_node',
    description: 'Save a new note or idea to the knowledge base.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: 'Note title' },
        summary: { type: Type.STRING, description: 'Note content/summary' },
        tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Tags' }
      },
      required: ['title', 'summary']
    }
  }
];

// RAG-powered chat
export const chatWithSpace = async (
  userMessage: string,
  history: any[],
  activeSpaceId: string
): Promise<string> => {
  const client = getAiClient();
  if (!client) return `[MOCK] I'd search your knowledge for "${userMessage}" but API key is missing. Please add it in Settings.`;

  // Function implementations
  const functions = {
    search_knowledge_base: async ({ query }: { query: string }) => {
      const spaceNodes = await getNodesForSpace(activeSpaceId);
      const terms = query.toLowerCase().split(' ');
      const results = spaceNodes.filter(n =>
        terms.some(t =>
          n.title.toLowerCase().includes(t) ||
          n.summary.toLowerCase().includes(t) ||
          n.tags.some(tag => tag.toLowerCase().includes(t))
        )
      ).slice(0, 5);

      return results.length === 0
        ? { result: "No matching notes found." }
        : { result: `Found ${results.length} notes`, data: results.map(n => ({ title: n.title, summary: n.summary })) };
    },

    create_knowledge_node: async ({ title, summary, tags }: any) => {
      const newNode: Node = {
        id: Date.now().toString(),
        spaceId: activeSpaceId,
        type: NodeType.NOTE,
        title,
        summary,
        tags: tags || ['AI-Generated'],
        createdAt: new Date().toISOString(),
        status: 'new',
        pinned: false,
        source: 'chat'
      };
      await createNode(newNode);
      return { result: "Successfully saved memory." };
    }
  };

  try {
    // 1. Load context window (Naive RAG)
    const spaceNodes = await getNodesForSpace(activeSpaceId);
    const knowledgeContext = spaceNodes.slice(0, 20).map(n =>
      `- [${n.type}] ${n.title}: ${n.summary} (Tags: ${n.tags.join(', ')})`
    ).join('\n');

    // 2. Start Chat
    const chat = client.chats.create({
      model: MODEL_NAME,
      history,
      config: {
        systemInstruction: `You are a knowledge agent for space ${activeSpaceId}.
        
CONTEXT (Priority 60%):
${knowledgeContext}

Use 'create_knowledge_node' to save new ideas. Be concise.`,
        tools: [{ functionDeclarations: toolDeclarations }],
      }
    });

    // 3. Send Message
    let response = await chat.sendMessage({ message: userMessage });

    // 4. Handle Function Calls Loop
    let turns = 0;
    while (response.functionCalls && response.functionCalls.length > 0 && turns < 5) {
      turns++;
      // Gemini 2.0 SDK structure
      const call = response.functionCalls[0];
      const name = call.name;
      const args = call.args;

      const fn = functions[name as keyof typeof functions];

      if (fn) {
        const functionResult = await fn(args as any);
        // Feed result back
        response = await chat.sendMessage({
          message: [{ functionResponse: { name, response: functionResult } }]
        });
      } else {
        break;
      }
    }

    return response.text || "Processed.";
  } catch (error) {
    console.error("Agent Error:", error);
    return "I encountered an error processing that request. Please check your API key.";
  }
};

export const analyzeContentWithGemini = async (input: string): Promise<Partial<Node>> => {
  const client = getAiClient();
  if (!client) return { title: `Note: ${input.substring(0, 15)}...`, summary: 'Mock Analysis', tags: ['Mock'], type: NodeType.NOTE };

  try {
    const response = await client.models.generateContent({
      model: MODEL_NAME,
      contents: `Analyze this for a knowledge base. Extract title, summary, tags, type. Input: "${input}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            type: { type: Type.STRING, enum: Object.values(NodeType) }
          },
          required: ["title", "summary", "tags", "type"]
        }
      }
    });

    // Safety check for parsing
    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No text response");
  } catch (error) {
    console.error("Analysis Error:", error);
    return { title: 'Analysis Failed', summary: input.substring(0, 50), tags: ['Error'], type: NodeType.NOTE };
  }
};