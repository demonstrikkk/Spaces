import { Node, Space, NodeType } from '../types';
import { supabase } from './supabaseClient';

const STORAGE_KEYS = {
  SPACES: 'spaces_data_v1',
  NODES: 'nodes_data_v1'
};

// Detect if running in Chrome extension (popup or background)
const isExtension = () => {
  try {
    // More robust check - must have chrome.runtime.id (only available in extension context)
    return typeof chrome !== 'undefined' && 
           typeof chrome.runtime !== 'undefined' && 
           typeof chrome.runtime.id === 'string' &&
           typeof chrome.storage !== 'undefined' &&
           typeof chrome.storage.local !== 'undefined';
  } catch {
    return false;
  }
};

// Unified storage getter
const getStorage = <T>(key: string, defaultVal: T): Promise<T> => {
  return new Promise((resolve) => {
    if (isExtension()) {
      chrome.storage.local.get([key], (result) => {
        if (chrome.runtime.lastError) {
          console.error("Storage error:", chrome.runtime.lastError);
          resolve(defaultVal);
        } else {
          resolve((result[key] as T) || defaultVal);
        }
      });
    } else {
      try {
        const item = localStorage.getItem(key);
        resolve(item ? JSON.parse(item) : defaultVal);
      } catch (e) {
        resolve(defaultVal);
      }
    }
  });
};

// Unified storage setter
const setStorage = (key: string, data: any): Promise<void> => {
  return new Promise((resolve) => {
    if (isExtension()) {
      chrome.storage.local.set({ [key]: data }, () => {
        resolve();
      });
    } else {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e) {
        console.error("Storage error:", e);
      }
      resolve();
    }
  });
};

// Default mock data for first-time users
const DEFAULT_SPACES: Space[] = [
  { id: 's1', name: 'AI Research', description: 'Deep learning papers and notes', createdAt: new Date().toISOString(), icon: '🧠', color: 'bg-purple-100' },
  { id: 's2', name: 'Startup Ideas', description: 'SaaS concepts and market research', createdAt: new Date().toISOString(), icon: '🚀', color: 'bg-amber-100' },
  { id: 's3', name: 'Web Dev', description: 'React, Supabase, and extensions', createdAt: new Date().toISOString(), icon: '💻', color: 'bg-blue-100' }
];

const DEFAULT_NODES: Node[] = [
  {
    id: '1',
    spaceId: 's1',
    type: NodeType.ARTICLE,
    title: 'Attention is All You Need',
    summary: 'Foundational Transformers paper',
    content: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks...',
    tags: ['AI', 'Transformers'],
    createdAt: new Date().toISOString(),
    status: 'new',
    pinned: true,
    url: 'https://arxiv.org/abs/1706.03762'
  }
];

// --- PUBLIC API ---

export const getSpaces = async (): Promise<Space[]> => {
  // If Supabase is connected, try to fetch from there first
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('spaces')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        console.log(`✅ Fetched ${data.length} spaces from Supabase`);
        // Transform Supabase data to match local Space type
        return data.map((s: any) => ({
          id: s.id,
          name: s.name,
          description: s.description || '',
          createdAt: s.created_at,
          icon: s.icon || '📁',
          color: s.color || 'bg-blue-100'
        }));
      }
      console.error('❌ Supabase spaces error:', error);
    } catch (err) {
      console.error('❌ Supabase fetch spaces failed:', err);
    }
  } else {
    console.log('⚠️ Supabase not connected, using local storage');
  }
  // Fallback to local storage
  return getStorage(STORAGE_KEYS.SPACES, DEFAULT_SPACES);
};

export const getNodesForSpace = async (spaceId: string): Promise<Node[]> => {
  if (supabase) {
    try {
      let query = supabase
        .from('nodes')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      
      if (spaceId !== 'all') {
        query = query.eq('space_id', spaceId);
      }

      const { data, error } = await query;
      
      if (!error && data) {
        console.log(`✅ Fetched ${data.length} nodes from Supabase for space: ${spaceId}`);
        // Transform Supabase data to match local Node type
        return data.map((n: any) => ({
          id: n.id,
          spaceId: n.space_id,
          type: (n.type?.toUpperCase() || 'NOTE') as NodeType, // Normalize type to uppercase
          title: n.title || '',
          summary: n.ai_summary || n.content?.substring(0, 200) || '',
          content: n.content,
          url: n.source_url || n.url,
          tags: n.tags || [], // Include tags if available
          createdAt: n.created_at,
          status: 'new',
          pinned: n.is_favorite || false,
          source: n.captured_from || 'web',
          metadata: n.metadata,
          mediaUrl: n.metadata?.mediaUrl,
          thumbnail: n.metadata?.thumbnail
        }));
      }
      console.error('❌ Supabase nodes error:', error);
    } catch (err) {
      console.error('❌ Supabase fetch nodes failed:', err);
    }
  }

  const allNodes = await getStorage(STORAGE_KEYS.NODES, DEFAULT_NODES);
  return spaceId === 'all' ? allNodes : allNodes.filter((n: Node) => n.spaceId === spaceId);
};

export const createNode = async (node: Node): Promise<void> => {
  // ALWAYS save to local storage first for immediate feedback
  const current = await getStorage(STORAGE_KEYS.NODES, DEFAULT_NODES);
  await setStorage(STORAGE_KEYS.NODES, [node, ...current]);
  console.log('✅ Node saved to local storage:', node.title);

  // Then try to sync with Supabase if available
  if (supabase) {
    try {
      // Transform local Node type to Supabase schema
      const supabaseNode = {
        space_id: node.spaceId,
        type: node.type.toLowerCase(), // Convert to lowercase for consistency
        title: node.title,
        content: node.content,
        source_url: node.url,
        url: node.url,
        metadata: {
          ...node.metadata,
          mediaUrl: node.mediaUrl,
          thumbnail: node.thumbnail
        },
        ai_summary: node.summary,
        extracted_text: node.metadata?.extractedText,
        source_title: node.title,
        source_domain: node.url ? new URL(node.url).hostname : null,
        captured_from: node.source || 'extension',
        is_favorite: node.pinned || false
      };
      
      const { data, error } = await supabase.from('nodes').insert(supabaseNode).select().single();
      if (error) {
        console.error('⚠️ Supabase insert error:', error);
        throw error;
      }
      console.log('☁️ Node synced to Supabase:', data);
    } catch (err) {
      console.warn('⚠️ Could not sync node to Supabase:', err);
      console.log('✓ Node is still saved locally and will work fine!');
    }
  } else {
    console.log('ℹ️ Supabase not connected, node saved locally only');
  }
};

export const createSpace = async (space: Space): Promise<void> => {
  // ALWAYS save to local storage first for immediate feedback
  const current = await getStorage(STORAGE_KEYS.SPACES, DEFAULT_SPACES);
  await setStorage(STORAGE_KEYS.SPACES, [...current, space]);
  console.log('✅ Space saved to local storage:', space.name);

  // Then try to sync with Supabase if available
  if (supabase) {
    try {
      // Transform local Space type to Supabase schema
      const supabaseSpace = {
        name: space.name,
        description: space.description,
        color: space.color,
        icon: space.icon
      };
      
      const { data, error } = await supabase.from('spaces').insert(supabaseSpace).select().single();
      if (error) {
        console.error('⚠️ Supabase space insert error:', error);
        throw error;
      }
      console.log('☁️ Space synced to Supabase:', data);
    } catch (err) {
      console.warn('⚠️ Could not sync space to Supabase (tables may not exist yet):', err);
      console.log('✓ Space is still saved locally and will work fine!');
    }
  } else {
    console.log('ℹ️ Supabase not connected, space saved locally only');
  }
};

// DELETE operations
export const deleteNode = async (nodeId: string): Promise<void> => {
  const current = await getStorage(STORAGE_KEYS.NODES, DEFAULT_NODES);
  const updated = current.filter((n: Node) => n.id !== nodeId);
  await setStorage(STORAGE_KEYS.NODES, updated);
  console.log('🗑️ Node deleted locally:', nodeId);
  
  // Try Supabase
  if (supabase) {
    try {
      await supabase.from('nodes').update({ deleted_at: new Date().toISOString() }).eq('id', nodeId);
      console.log('☁️ Node marked deleted in Supabase');
    } catch (err) {
      console.warn('⚠️ Could not sync deletion to Supabase:', err);
    }
  }
};

export const deleteSpace = async (spaceId: string): Promise<void> => {
  const current = await getStorage(STORAGE_KEYS.SPACES, DEFAULT_SPACES);
  const updated = current.filter((s: Space) => s.id !== spaceId);
  await setStorage(STORAGE_KEYS.SPACES, updated);
  console.log('🗑️ Space deleted locally:', spaceId);
  
  // Also delete all nodes in that space
  const nodes = await getStorage(STORAGE_KEYS.NODES, DEFAULT_NODES);
  const updatedNodes = nodes.filter((n: Node) => n.spaceId !== spaceId);
  await setStorage(STORAGE_KEYS.NODES, updatedNodes);
  
  // Try Supabase
  if (supabase) {
    try {
      await supabase.from('spaces').update({ deleted_at: new Date().toISOString() }).eq('id', spaceId);
      console.log('☁️ Space marked deleted in Supabase');
    } catch (err) {
      console.warn('⚠️ Could not sync deletion to Supabase:', err);
    }
  }
};

// CHAT HISTORY operations
const CHAT_STORAGE_KEY = 'chat_histories_v1';

export interface ChatHistory {
  id: string;
  spaceId: string;
  title: string;
  messages: Array<{
    role: 'user' | 'model';
    content: string;
    timestamp: number;
    sources?: string[];
  }>;
  summary?: string;
  createdAt: string;
  updatedAt: string;
}

export const getChatHistories = async (spaceId?: string): Promise<ChatHistory[]> => {
  const histories = await getStorage<ChatHistory[]>(CHAT_STORAGE_KEY, []);
  return spaceId ? histories.filter(h => h.spaceId === spaceId) : histories;
};

export const saveChatHistory = async (history: ChatHistory): Promise<void> => {
  const current = await getStorage<ChatHistory[]>(CHAT_STORAGE_KEY, []);
  const existing = current.findIndex(h => h.id === history.id);
  
  if (existing >= 0) {
    current[existing] = { ...history, updatedAt: new Date().toISOString() };
  } else {
    current.push(history);
  }
  
  await setStorage(CHAT_STORAGE_KEY, current);
  console.log('💬 Chat history saved');
};

export const deleteChatHistory = async (historyId: string): Promise<void> => {
  const current = await getStorage<ChatHistory[]>(CHAT_STORAGE_KEY, []);
  const updated = current.filter(h => h.id !== historyId);
  await setStorage(CHAT_STORAGE_KEY, updated);
  console.log('🗑️ Chat history deleted');
};
