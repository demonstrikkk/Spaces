import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import '../index.css';
import { Space, Node, NodeType } from '../types';
import { getSpaces, createNode, createSpace } from '../services/dataService';
import { Zap, Plus, ExternalLink, Check } from 'lucide-react';

const Popup = () => {
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState<'main' | 'create'>('main');
    const [newSpaceName, setNewSpaceName] = useState('');
    const [currentTab, setCurrentTab] = useState<{ title: string, url: string } | null>(null);
    const [savedStatus, setSavedStatus] = useState<string | null>(null);

    useEffect(() => {
        loadData();
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                setCurrentTab({
                    title: tabs[0].title || 'Unknown Page',
                    url: tabs[0].url || ''
                });
            }
        });
    }, []);

    const loadData = async () => {
        const data = await getSpaces();
        setSpaces(data);
    };

    const handleSaveToSpace = async (space: Space) => {
        if (!currentTab) return;
        setLoading(true);
        try {
            // Check for selection
            let selection = '';
            try {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                if (tab.id) {
                    const results = await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: () => window.getSelection()?.toString() || ''
                    });
                    if (results[0]?.result) selection = results[0].result;
                }
            } catch (e) {
                console.log('Script injection failed (restricted page?)', e);
            }

            const newNode: Node = {
                id: Date.now().toString(),
                spaceId: space.id,
                type: selection ? NodeType.NOTE : NodeType.LINK,
                title: currentTab.title,
                summary: selection || 'Quick saved from extension',
                content: selection || currentTab.url,
                url: currentTab.url,
                tags: ['QuickSave'],
                createdAt: new Date().toISOString(),
                status: 'new',
                pinned: false,
                source: 'extension'
            };

            await createNode(newNode);
            setSavedStatus(space.id);
            setTimeout(() => setSavedStatus(null), 2000);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSpace = async () => {
        if (!newSpaceName.trim()) return;
        setLoading(true);
        const newSpace: Space = {
            id: Date.now().toString(),
            name: newSpaceName,
            description: 'Created via Extension',
            createdAt: new Date().toISOString(),
            icon: '✨',
            color: 'bg-indigo-500'
        };
        await createSpace(newSpace);
        await loadData();
        setView('main');
        setNewSpaceName('');
        setLoading(false);
    };

    const openDashboard = () => {
        // Open the bundled index.html to ensure we share chrome.storage.local context
        chrome.tabs.create({ url: 'index.html' });
    };

    return (
        <div className="w-full h-full bg-slate-950 flex flex-col font-sans text-white">
            {/* Header */}
            <div className="px-4 py-3 bg-slate-900 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Zap className="w-4 h-4 text-white fill-current" />
                    </div>
                    <span className="font-heading font-bold text-base">Spaces</span>
                </div>
                <button
                    onClick={openDashboard}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    title="Open Full Dashboard"
                >
                    <ExternalLink className="w-4 h-4 text-slate-400 hover:text-white" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                {view === 'main' ? (
                    <div className="space-y-4">
                        {/* Current Page Info */}
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                            <h3 className="text-xs font-bold text-slate-400 uppercase mb-1">Current Page</h3>
                            <p className="text-sm font-medium text-white truncate">{currentTab?.title}</p>
                            <p className="text-xs text-slate-500 truncate">{currentTab?.url}</p>
                        </div>

                        {/* Spaces Grid */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xs font-bold text-slate-400 uppercase">Save To Space</h3>
                                <button onClick={() => setView('create')} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                                    <Plus className="w-3 h-3" /> New
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                {spaces.map(space => (
                                    <button
                                        key={space.id}
                                        onClick={() => handleSaveToSpace(space)}
                                        className="group relative h-24 bg-slate-900 border border-white/10 hover:border-indigo-500/50 rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all hover:bg-slate-800 active:scale-95"
                                    >
                                        {savedStatus === space.id ? (
                                            <div className="absolute inset-0 bg-emerald-500/90 rounded-xl flex items-center justify-center animate-in fade-in zoom-in">
                                                <Check className="w-8 h-8 text-white" />
                                            </div>
                                        ) : null}

                                        <div className="text-2xl group-hover:scale-110 transition-transform">{space.icon}</div>
                                        <div className="text-xs font-medium text-center line-clamp-1">{space.name}</div>
                                    </button>
                                ))}
                            </div>

                            {spaces.length === 0 && (
                                <div className="text-center py-8 text-slate-500 text-xs">
                                    No spaces yet. Create one!
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <h3 className="text-lg font-heading font-bold">New Space</h3>
                        <input
                            type="text"
                            value={newSpaceName}
                            onChange={(e) => setNewSpaceName(e.target.value)}
                            placeholder="Space Name (e.g. Recipes)"
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => setView('main')}
                                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateSpace}
                                disabled={!newSpaceName.trim() || loading}
                                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<React.StrictMode><Popup /></React.StrictMode>);
