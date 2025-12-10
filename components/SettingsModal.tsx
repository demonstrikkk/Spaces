import React, { useState, useEffect } from 'react';
import { X, Key, Save, Database, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsModalProps {
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
    const [geminiKey, setGeminiKey] = useState('');
    const [supabaseUrl, setSupabaseUrl] = useState('');
    const [supabaseKey, setSupabaseKey] = useState('');
    const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    useEffect(() => {
        // Load existing keys (masking sensitive parts)
        setGeminiKey(localStorage.getItem('ENV_GEMINI_API_KEY') || '');
        setSupabaseUrl(localStorage.getItem('ENV_SUPABASE_URL') || '');
        setSupabaseKey(localStorage.getItem('ENV_SUPABASE_ANON_KEY') || '');
    }, []);

    const handleSave = () => {
        setStatus('saving');
        // Save to localStorage so env.ts helper can pick them up
        if (geminiKey) localStorage.setItem('ENV_GEMINI_API_KEY', geminiKey);
        if (supabaseUrl) localStorage.setItem('ENV_SUPABASE_URL', supabaseUrl);
        if (supabaseKey) localStorage.setItem('ENV_SUPABASE_ANON_KEY', supabaseKey);

        setTimeout(() => {
            setStatus('saved');
            setTimeout(() => {
                setStatus('idle');
                onClose();
                window.location.reload(); // Reload to re-init clients
            }, 800);
        }, 500);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                    className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                        <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
                            <Key className="w-5 h-5 text-indigo-400" />
                            Service Configuration
                        </h2>
                        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Gemini Section */}
                        <div className="space-y-3">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Google Gemini AI</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={geminiKey}
                                    onChange={(e) => setGeminiKey(e.target.value)}
                                    placeholder="AIzaSy..."
                                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all"
                                />
                                <div className="absolute right-3 top-3 text-xs text-slate-500 pointer-events-none">API KEY</div>
                            </div>
                            <p className="text-[10px] text-slate-400">
                                Required for content analysis and chat. <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-indigo-400 hover:underline">Get key →</a>
                            </p>
                        </div>

                        {/* Supabase Section */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Supabase (Optional)</label>
                                <div className="flex items-center gap-1 text-[10px] text-amber-500">
                                    <Database className="w-3 h-3" />
                                    <span>Cloud Sync</span>
                                </div>
                            </div>

                            <input
                                type="text"
                                value={supabaseUrl}
                                onChange={(e) => setSupabaseUrl(e.target.value)}
                                placeholder="https://xyz.supabase.co"
                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all mb-2"
                            />
                            <input
                                type="password"
                                value={supabaseKey}
                                onChange={(e) => setSupabaseKey(e.target.value)}
                                placeholder="public-anon-key"
                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                            />
                        </div>

                        {/* Warning */}
                        <div className="flex gap-3 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                            <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0" />
                            <p className="text-xs text-indigo-200">
                                Keys are stored securely in your browser's local storage. They are never sent to our servers.
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-slate-950/50 border-t border-white/5 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={status !== 'idle'}
                            className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2"
                        >
                            {status === 'saving' ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : status === 'saved' ? (
                                <>Saved!</>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default SettingsModal;
