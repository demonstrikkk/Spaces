import { KnowledgeGraphData, NodeType } from './types';

export const INITIAL_DATA: KnowledgeGraphData = {
  nodes: [
    {
      id: '1',
      spaceId: 's1',
      type: NodeType.VIDEO,
      title: 'Neural Networks from Scratch',
      summary: 'A comprehensive guide to building neural networks using Python and NumPy, covering forward and backward propagation.',
      tags: ['AI', 'Python', 'Math', 'Deep Learning'],
      createdAt: new Date().toISOString(),
      url: 'https://youtube.com/watch?v=sample1',
      status: 'new',
      pinned: true
    },
    {
      id: '2',
      spaceId: 's1',
      type: NodeType.ARTICLE,
      title: 'The Future of Generative Models',
      summary: 'Analysis of transformer architectures and their impact on NLP and Computer Vision tasks.',
      tags: ['AI', 'Generative', 'Research'],
      createdAt: new Date().toISOString(),
      url: 'https://arxiv.org/abs/sample2',
      status: 'learned',
      pinned: false
    },
    {
      id: '3',
      spaceId: 's2',
      type: NodeType.NOTE,
      title: 'Startup Ideas 2024',
      summary: 'Focus on vertical SaaS for construction and AI-driven personalized education tools.',
      tags: ['Business', 'Ideas', 'SaaS'],
      createdAt: new Date().toISOString(),
      status: 'new',
      pinned: true
    },
    {
      id: '4',
      spaceId: 's3',
      type: NodeType.IMAGE,
      title: 'System Architecture Diagram',
      summary: 'Microservices layout for the new social graph engine.',
      tags: ['Engineering', 'Architecture', 'System Design'],
      createdAt: new Date().toISOString(),
      status: 'new',
      pinned: false
    },
    {
      id: '5',
      spaceId: 's2',
      type: NodeType.TWEET,
      title: 'Naval Ravikant on Wealth',
      summary: 'Seek wealth, not money or status. Wealth is having assets that earn while you sleep.',
      tags: ['Philosophy', 'Wealth', 'Mindset'],
      createdAt: new Date().toISOString(),
      url: 'https://twitter.com/naval/status/sample5',
      status: 'archived',
      pinned: false
    }
  ],
  edges: [
    { source: '1', target: '2', relation: 'Related Topic' },
    { source: '3', target: '5', relation: 'Inspiration' },
    { source: '1', target: '4', relation: 'Technical Concept' }
  ]
};