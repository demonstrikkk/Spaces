import React from 'react';
import { motion } from 'framer-motion';
import { MousePointer, Download } from 'lucide-react';

const ExtensionPreview: React.FC = () => {
    return (
        <div className="mt-20 border-t border-white/5 pt-16">
            <div className="flex flex-col md:flex-row items-center gap-12">
                {/* Left Side: Pitch */}
                <div className="flex-1 space-y-6">
                    <h2 className="text-4xl font-heading font-bold text-white">
                        Capture Ideas <span className="text-indigo-400">Instantly</span>
                    </h2>
                    <p className="text-lg text-slate-400 leading-relaxed">
                        Stop switching tabs. The Spaces Chrome Extension lets you save articles, videos, and tweets directly to your knowledge graph with a single click.
                    </p>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 text-slate-300">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">✓</div>
                            <span>Right-click to save any text selection</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-300">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">✓</div>
                            <span>Smart auto-tagging with Gemini AI</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-300">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">✓</div>
                            <span>Offline support with local sync</span>
                        </div>
                    </div>

                    <button
                        onClick={() => window.open('https://chrome.google.com/webstore', '_blank')}
                        className="mt-4 px-8 py-4 bg-white text-slate-900 font-bold rounded-xl flex items-center gap-2 hover:bg-slate-100 transition-colors"
                    >
                        <Download className="w-5 h-5" />
                        Install Extension (Coming Soon)
                    </button>
                </div>

                {/* Right Side: Interactive Mockup */}
                <div className="flex-1 relative w-full flex justify-center">
                    {/* Browser Frame */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden relative"
                    >
                        {/* Address Bar */}
                        <div className="bg-slate-100 p-3 flex items-center gap-2 border-b border-slate-200">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-400" />
                                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                <div className="w-3 h-3 rounded-full bg-green-400" />
                            </div>
                            <div className="flex-1 bg-white h-8 rounded-md border border-slate-200 shadow-sm flex items-center px-3 text-xs text-slate-400">
                                research-paper.com/ai-trends
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 space-y-4 bg-white min-h-[300px]">
                            <h1 className="text-2xl font-bold text-slate-900">The Future of Generative AI</h1>
                            <p className="text-slate-600 leading-relaxed">
                                <span className="bg-indigo-100 text-slate-900">
                                    Generative models are shifting from simple text completion to complex reasoning engines capable of planning and execution.
                                </span>
                            </p>
                            <p className="text-slate-600 leading-relaxed blur-sm select-none">
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatum.
                            </p>
                        </div>

                        {/* Fake Cursor Animation */}
                        <motion.div
                            initial={{ x: 300, y: 300 }}
                            animate={{ x: 150, y: 150 }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                            className="absolute z-20"
                        >
                            <MousePointer className="w-6 h-6 text-black fill-white drop-shadow-xl" />
                        </motion.div>

                        {/* Simulated Context Menu */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: [0, 1, 1, 0] }}
                            transition={{ duration: 4, repeat: Infinity, repeatDelay: 1, times: [0, 0.4, 0.8, 1] }}
                            className="absolute top-[160px] left-[180px] bg-white rounded-lg shadow-xl border border-slate-200 py-2 w-48 z-10"
                        >
                            <div className="px-4 py-2 hover:bg-indigo-50 text-sm text-slate-700 flex justify-between items-center cursor-pointer">
                                Save to Space
                                <span className="text-xs text-slate-400">▶</span>
                            </div>
                            <div className="px-4 py-2 hover:bg-indigo-50 text-sm text-slate-700 font-medium text-indigo-600 bg-indigo-50/50">
                                🧠 AI Research
                            </div>
                            <div className="px-4 py-2 hover:bg-slate-50 text-sm text-slate-700">
                                Copy
                            </div>
                        </motion.div>

                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ExtensionPreview;
