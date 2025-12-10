import React, { useState } from 'react';
import { Node, NodeType } from '../types';
import { createNode } from '../services/dataService';
import ContentCard from './ContentCard';
import AIChat from './AIChat';
import GraphView from './GraphView';
import { Search, Plus, X, LayoutGrid, MessageSquare, Share2, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SpaceDeckProps {
    spaceId: string;
    spaceName: string;
    nodes: Node[];
    onClose: () => void;
    onRefresh: () => void;
}

const SpaceDeck: React.FC<SpaceDeckProps> = ({ spaceId, spaceName, nodes, onClose, onRefresh }) => {
    const [activeTab, setActiveTab] = useState<'cards' | 'graph' | 'chat'>('cards');
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState<NodeType | 'ALL'>('ALL');
    const [isAdding, setIsAdding] = useState(false);
    const [newNote, setNewNote] = useState({ title: '', content: '' });

    const filteredNodes = nodes.filter(n => {
        const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) ||
            n.summary.toLowerCase().includes(search.toLowerCase());
        const matchesType = filterType === 'ALL' || n.type === filterType;
        return matchesSearch && matchesType;
    });

    const handleAddNote = async () => {
        if (!newNote.title.trim()) return;

        await createNode({
            id: Date.now().toString(),
            spaceId,
            type: NodeType.NOTE,
            title: newNote.title,
            summary: newNote.content,
            content: newNote.content,
            tags: ['Manual'],
            createdAt: new Date().toISOString(),
            status: 'new',
            pinned: false,
            source: 'web'
        });

        setNewNote({ title: '', content: '' });
        setIsAdding(false);
        onRefresh();
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-slate-950 flex flex-col"
        >
            {/* Top Bar */}
            <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors group">
                        <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-white" />
                    </button>
                    <h2 className="text-xl font-heading font-bold text-white tracking-wide">{spaceName}</h2>
                    <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-slate-400 font-mono">
                        {nodes.length} Items
                    </span>
                </div>

                <div className="flex items-center gap-2 bg-slate-800/50 p-1 rounded-xl border border-white/5">
                    <button
                        onClick={() => setActiveTab('cards')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'cards' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <LayoutGrid className="w-4 h-4" />
                        Cards
                    </button>
                    <button
                        onClick={() => setActiveTab('graph')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'graph' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <Share2 className="w-4 h-4" />
                        Graph
                    </button>
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'chat' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <MessageSquare className="w-4 h-4" />
                        AI Chat
                    </button>
                </div>

                <div className="w-32" /> {/* Spacer for balance */}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden relative bg-slate-950">

                {activeTab === 'cards' && (
                    <div className="h-full flex flex-col">
                        {/* Toolbar */}
                        <div className="px-8 py-6 flex items-center justify-between">
                            <div className="relative w-96">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Search your knowledge..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                />
                            </div>

                            <div className="flex gap-2">
                                {/* Quick Add Button */}
                                <button
                                    onClick={() => setIsAdding(true)}
                                    className="px-4 py-2.5 bg-white text-slate-900 hover:bg-indigo-50 font-bold rounded-xl flex items-center gap-2 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Note
                                </button>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="px-8 pb-4 flex gap-2 overflow-x-auto no-scrollbar">
                            {(['ALL', ...Object.values(NodeType)] as const).map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type as any)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${filterType === type
                                            ? 'bg-indigo-500 border-indigo-500 text-white'
                                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    {type === 'ALL' ? 'All Items' : type}
                                </button>
                            ))}
                        </div>

                        {/* Grid */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar px-8 pb-20">
                            {filteredNodes.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    <AnimatePresence>
                                        {filteredNodes.map(node => (
                                            <ContentCard key={node.id} node={node} />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                                    <div className="text-4xl mb-4 opacity-20">📭</div>
                                    <p>No items found</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Other Tabs */}
                {activeTab === 'graph' && (
                    <div className="h-full w-full">
                        <GraphView nodes={nodes} />
                    </div>
                )}

                {activeTab === 'chat' && (
                    <div className="h-full max-w-4xl mx-auto p-6">
                        <AIChat spaceId={spaceId} spaceName={spaceName} />
                    </div>
                )}

            </div>

            {/* Add Note Modal Overlay */}
            <AnimatePresence>
                {isAdding && (
                    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-white">Create Note</h3>
                                <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <input
                                type="text"
                                placeholder="Title"
                                value={newNote.title}
                                onChange={e => setNewNote({ ...newNote, title: e.target.value })}
                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 mb-3 text-white focus:ring-2 focus:ring-indigo-500"
                                autoFocus
                            />
                            <textarea
                                placeholder="Write your thoughts..."
                                value={newNote.content}
                                onChange={e => setNewNote({ ...newNote, content: e.target.value })}
                                className="w-full h-32 bg-slate-800 border border-white/10 rounded-xl px-4 py-3 mb-6 text-white focus:ring-2 focus:ring-indigo-500 resize-none"
                            />
                            <button
                                onClick={handleAddNote}
                                className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition-colors"
                            >
                                Save to {spaceName}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </motion.div>
    );
};

export default SpaceDeck;
