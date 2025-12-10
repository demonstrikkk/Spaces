import { Node, Space, NodeType } from '../types';
import { supabase } from './supabaseClient';

const STORAGE_KEYS = {
  SPACES: 'spaces_data_v1',
  NODES: 'nodes_data_v1'
};

// Detect if running in Chrome extension (popup or background)
const isExtension = () => {
  try {
    return typeof chrome !== 'undefined' && !!chrome.storage && !!chrome.storage.local;
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
    const { data, error } = await supabase.from('spaces').select('*');
    if (!error && data) return data;
  }
  // Fallback to local storage
  return getStorage(STORAGE_KEYS.SPACES, DEFAULT_SPACES);
};

export const getNodesForSpace = async (spaceId: string): Promise<Node[]> => {
  if (supabase) {
    const query = supabase.from('nodes').select('*');
    if (spaceId !== 'all') query.eq('spaceId', spaceId);

    const { data, error } = await query;
    if (!error && data) return data;
  }

  const allNodes = await getStorage(STORAGE_KEYS.NODES, DEFAULT_NODES);
  return spaceId === 'all' ? allNodes : allNodes.filter((n: Node) => n.spaceId === spaceId);
};

export const createNode = async (node: Node): Promise<void> => {
  if (supabase) {
    await supabase.from('nodes').insert(node);
  } else {
    // Local update
    const current = await getStorage(STORAGE_KEYS.NODES, DEFAULT_NODES);
    await setStorage(STORAGE_KEYS.NODES, [node, ...current]);
  }
};

export const createSpace = async (space: Space): Promise<void> => {
  if (supabase) {
    await supabase.from('spaces').insert(space);
  } else {
    const current = await getStorage(STORAGE_KEYS.SPACES, DEFAULT_SPACES);
    await setStorage(STORAGE_KEYS.SPACES, [...current, space]);
  }
};
