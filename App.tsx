import { useState, useEffect } from 'react';
import { Space, Node } from './types';
import { getSpaces, getNodesForSpace, createSpace } from './services/dataService';
import SpaceDeck from './components/SpaceDeck';
import ExtensionPreview from './components/ExtensionPreview';
import SettingsModal from './components/SettingsModal';
import { Plus, Settings, Zap, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [activeSpaceId, setActiveSpaceId] = useState<string | null>(null);
    const [spaceNodes, setSpaceNodes] = useState<Node[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [isExtensionCtx, setIsExtensionCtx] = useState(false);

    useEffect(() => {
        loadSpaces();

        // 1. Check extension context
        try {
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
                setIsExtensionCtx(true);

                // 2. Setup Live Listener for Chrome Storage
                const handleStorageChange = (changes: any, namespace: string) => {
                    if (namespace === 'local') {
                        // Reload spaces if spaces changed
                        if (changes['spaces_data_v1']) {
                            loadSpaces();
                        }
                        // Reload active space nodes if nodes changed
                        if (changes['nodes_data_v1'] && activeSpaceId) {
                            handleOpenSpace(activeSpaceId); // This might be tricky with stale state, but let's try
                        }
                    }
                };

                chrome.storage.onChanged.addListener(handleStorageChange);
                return () => chrome.storage.onChanged.removeListener(handleStorageChange);
            }
        } catch (e) { }
    }, [activeSpaceId]); // Re-bind listener if activeSpaceId changes so we can refresh it

    const loadSpaces = async () => {
        const data = await getSpaces();
        setSpaces(data);
        setLoading(false);
    };

    const handleOpenSpace = async (spaceId: string) => {
        setLoading(true);
        const nodes = await getNodesForSpace(spaceId);
        setSpaceNodes(nodes);
        setActiveSpaceId(spaceId);
        setLoading(false);
    };



    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center animate-pulse shadow-glow">
                        <Zap className="w-6 h-6 text-white fill-current" />
                    </div>
                    <p className="text-slate-400 text-sm font-mono animate-pulse">Initializing Neural Link...</p>
                </div>
            </div>
        );
    }

    const activeSpace = spaces.find(s => s.id === activeSpaceId);

    return (
        <div className="min-h-screen font-sans bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 h-20 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group cursor-pointer hover:scale-105 transition-transform">
                            <Zap className="w-5 h-5 text-white fill-current group-hover:rotate-12 transition-transform" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-heading font-bold text-xl text-white leading-none">Spaces</span>
                            <span className="text-[10px] text-indigo-400 font-mono tracking-widest uppercase">Second Brain</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {isExtensionCtx && (
                            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                                ● Synced
                            </span>
                        )}
                        <button
                            onClick={() => setShowSettings(true)}
                            className="p-2.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-all"
                            title="Settings"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">

                {/* Hero Header (Only show if no spaces or just starting) */}
                {!isExtensionCtx && spaces.length < 5 && (
                    <header className="mb-16 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 tracking-tight">
                                <span className="block text-slate-200 mb-2">Curate Your</span>
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-shine bg-[length:200%_auto]">
                                    Digital Universe
                                </span>
                            </h1>
                            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                                Capture, organize, and synthesize your knowledge with the power of Gemini 2.0.
                                Your personal knowledge graph, automated.
                            </p>
                        </motion.div>
                    </header>
                )}

                {/* Space Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Create New Space Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            const name = prompt("Name your new space (e.g., 'Deep Learning', 'Design System'):");
                            if (name) {
                                createSpace({
                                    id: Date.now().toString(),
                                    name,
                                    description: 'A new frontier of knowledge.',
                                    createdAt: new Date().toISOString(),
                                    icon: ['🪐', '🚀', '💡', '⚡', '🔮'][Math.floor(Math.random() * 5)],
                                    color: 'bg-indigo-500'
                                }).then(loadSpaces);
                            }
                        }}
                        className="h-[280px] rounded-3xl border-2 border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-900/20 hover:bg-slate-900/40 flex flex-col items-center justify-center cursor-pointer transition-all group"
                    >
                        <div className="w-16 h-16 rounded-full bg-slate-800 group-hover:bg-indigo-500/20 flex items-center justify-center mb-4 transition-colors">
                            <Plus className="w-8 h-8 text-slate-600 group-hover:text-indigo-400" />
                        </div>
                        <span className="font-heading font-bold text-lg text-slate-500 group-hover:text-slate-300">Create New Space</span>
                    </motion.div>

                    {/* Existing Spaces */}
                    {spaces.map((space, idx) => (
                        <motion.div
                            key={space.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => handleOpenSpace(space.id)}
                            className="group h-[280px] glass-card rounded-3xl p-8 cursor-pointer relative overflow-hidden"
                        >
                            {/* Hover Glow */}
                            <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="text-4xl p-3 bg-white/5 rounded-2xl border border-white/5 shadow-inner">
                                        {space.icon || '🛸'}
                                    </div>
                                    <div className="p-2 rounded-full hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Star className="w-4 h-4 text-slate-400" />
                                    </div>
                                </div>

                                <h3 className="text-2xl font-heading font-bold text-white mb-2 group-hover:text-indigo-200 transition-colors">
                                    {space.name}
                                </h3>
                                <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed">
                                    {space.description}
                                </p>

                                <div className="mt-auto pt-4 flex items-center gap-2 text-xs text-slate-500 font-mono">
                                    <span>ID: {space.id.substring(0, 4)}...</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Show preview only on web */}
                {!isExtensionCtx && (
                    <ExtensionPreview />
                )}
            </main>

            {/* Footer */}
            <footer className="py-8 text-center text-slate-600 text-sm">
                <p>Use ⌘+K to search all spaces (coming soon)</p>
            </footer>

            {/* Modals */}
            <AnimatePresence>
                {activeSpaceId && activeSpace && (
                    <SpaceDeck
                        spaceId={activeSpaceId}
                        spaceName={activeSpace.name}
                        nodes={spaceNodes}
                        onClose={() => setActiveSpaceId(null)}
                        onRefresh={() => handleOpenSpace(activeSpaceId)}
                    />
                )}
                {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
            </AnimatePresence>
        </div>
    );
}

export default App;
