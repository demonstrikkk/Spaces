import React from 'react';
import { Node, NodeType } from '../types';
import { FileText, Link as LinkIcon, Image, Film, MessageCircle, Twitter, Pin, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface ContentCardProps {
  node: Node;
  onClick?: () => void;
}

const TypeIcon = ({ type }: { type: NodeType }) => {
  switch (type) {
    case NodeType.VIDEO: return <Film className="w-4 h-4 text-rose-400" />;
    case NodeType.LINK: return <LinkIcon className="w-4 h-4 text-blue-400" />;
    case NodeType.IMAGE: return <Image className="w-4 h-4 text-purple-400" />;
    case NodeType.TWEET: return <Twitter className="w-4 h-4 text-sky-400" />;
    case NodeType.CHAT_LOG: return <MessageCircle className="w-4 h-4 text-emerald-400" />;
    default: return <FileText className="w-4 h-4 text-slate-400" />;
  }
};

const ContentCard: React.FC<ContentCardProps> = ({ node, onClick }) => {
  return (
    <motion.div
      layoutId={`card-${node.id}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative bg-white/5 backdrop-blur-md border border-white/10 hover:border-indigo-500/30 rounded-2xl p-4 cursor-pointer overflow-hidden transition-colors"
    >
      {/* Hover Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Header */}
      <div className="relative flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
            <TypeIcon type={node.type} />
          </div>
          {node.pinned && <Pin className="w-3 h-3 text-amber-400 rotate-45" />}
        </div>
        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
          {new Date(node.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* Content */}
      <div className="relative">
        <h3 className="text-sm font-bold text-white mb-1 line-clamp-2 leading-tight group-hover:text-indigo-200 transition-colors">
          {node.title}
        </h3>
        <p className="text-xs text-slate-400 line-clamp-3 mb-3">
          {node.summary}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {node.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[10px] text-slate-400">
              #{tag}
            </span>
          ))}
          {node.tags.length > 3 && (
            <span className="px-2 py-0.5 text-[10px] text-slate-500">+{node.tags.length - 3}</span>
          )}
        </div>
      </div>

      {/* External Link Action */}
      {node.url && (
        <a
          href={node.url}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-4 right-4 p-1.5 rounded-full bg-indigo-500/20 text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-500 hover:text-white"
        >
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </motion.div>
  );
};

export default ContentCard;
