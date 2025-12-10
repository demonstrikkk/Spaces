import React, { useState } from 'react';
import { analyzeContentWithGemini } from '../services/geminiService';
import { Node } from '../types';

interface AddContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (node: Partial<Node>) => void;
}

const AddContentModal: React.FC<AddContentModalProps> = ({ isOpen, onClose, onSave }) => {
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedData, setAnalyzedData] = useState<Partial<Node> | null>(null);

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setIsAnalyzing(true);
    const result = await analyzeContentWithGemini(input);
    
    // Auto-fill URL if input is a URL
    if (input.startsWith('http')) {
      result.url = input;
    }
    
    setAnalyzedData(result);
    setIsAnalyzing(false);
  };

  const handleConfirmSave = () => {
    if (analyzedData) {
      onSave(analyzedData);
      // Reset
      setAnalyzedData(null);
      setInput('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">Add to Spaces</h2>
          <p className="text-slate-400 text-sm mt-1">Paste a link, note, or idea. AI will analyze it.</p>
        </div>

        <div className="p-6">
          {!analyzedData ? (
            <div className="space-y-4">
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="https://youtube.com/... or 'Idea for new app...'"
                className="w-full h-32 bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-primary resize-none"
              />
              <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing || !input}
                className="w-full py-3 bg-primary hover:bg-indigo-600 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                    Analyze & Categorize
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Title</label>
                <input 
                  type="text" 
                  value={analyzedData.title}
                  onChange={(e) => setAnalyzedData({...analyzedData, title: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Summary</label>
                <textarea 
                  value={analyzedData.summary}
                  onChange={(e) => setAnalyzedData({...analyzedData, summary: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-300 text-sm h-20"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                 {analyzedData.tags?.map((tag, i) => (
                   <span key={i} className="px-2 py-1 bg-slate-800 text-xs rounded-full text-primary border border-slate-700">#{tag}</span>
                 ))}
              </div>
              
              <div className="pt-4 flex gap-3">
                 <button 
                  onClick={() => setAnalyzedData(null)}
                  className="flex-1 py-2 text-slate-400 hover:text-white transition-colors"
                 >
                   Back
                 </button>
                 <button 
                  onClick={handleConfirmSave}
                  className="flex-1 py-2 bg-secondary hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors"
                 >
                   Save to Graph
                 </button>
              </div>
            </div>
          )}
        </div>
        
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
    </div>
  );
};

export default AddContentModal;
