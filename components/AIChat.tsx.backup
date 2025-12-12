import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { chatWithSpace } from '../services/geminiService';
import { ChatMessage } from '../types';

interface AIChatProps {
  spaceId: string;
  spaceName: string;
}

const AIChat: React.FC<AIChatProps> = ({ spaceId, spaceName }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: `Hello! I'm your AI assistant for the **${spaceName}** space. Ask me anything about your saved notes, or ask me to save new ideas!`, timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Convert to Gemini history format
    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    try {
      const responseText = await chatWithSpace(input, history, spaceId);
      const aiMsg: ChatMessage = { role: 'model', text: responseText, timestamp: Date.now() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      const errorMsg: ChatMessage = { role: 'model', text: "I ran into a glitch. Try again?", timestamp: Date.now() };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden">
      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6"
      >
        {messages.map((msg, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={msg.timestamp + idx}
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'model'
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-glow'
                : 'bg-slate-700'
              }`}>
              {msg.role === 'model' ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-slate-300" />}
            </div>

            {/* Bubble */}
            <div className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'model'
                  ? 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none'
                  : 'bg-indigo-600 text-white rounded-tr-none'
                }`}>
                {/* Basic Markdown Rendering */}
                {msg.text.split('\n').map((line, i) => (
                  <p key={i} className="mb-1 last:mb-0">
                    {line.includes('**') ? (
                      // Super basic bold parsing
                      line.split('**').map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)
                    ) : (
                      line
                    )}
                  </p>
                ))}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 opacity-50">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 animate-pulse">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-1 h-10 px-4 bg-white/5 rounded-2xl rounded-tl-none">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-950/50 border-t border-white/10">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Ask '${spaceName}' AI...`}
            disabled={loading}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3.5 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-2 p-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg transition-colors disabled:opacity-50 disabled:bg-transparent"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;