import React from 'react';
import { Node, NodeType } from '../types';
import { FileText, Link as LinkIcon, Image, Film, MessageCircle, Twitter, Pin, ExternalLink, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface ContentCardProps {
  node: Node;
  onClick?: () => void;
  index?: number;
}

const TypeIcon = ({ type }: { type: NodeType }) => {
  const iconClasses = "w-4 h-4";
  switch (type) {
    case NodeType.VIDEO: return <Film className={iconClasses} style={{ color: '#f43f5e' }} />;
    case NodeType.LINK: return <LinkIcon className={iconClasses} style={{ color: '#3b82f6' }} />;
    case NodeType.IMAGE: return <Image className={iconClasses} style={{ color: '#a855f7' }} />;
    case NodeType.TWEET: return <Twitter className={iconClasses} style={{ color: '#0ea5e9' }} />;
    case NodeType.CHAT_LOG: return <MessageCircle className={iconClasses} style={{ color: '#10b981' }} />;
    case NodeType.ARTICLE: return <FileText className={iconClasses} style={{ color: '#f59e0b' }} />;
    default: return <FileText className={iconClasses} style={{ color: 'var(--color-text-muted)' }} />;
  }
};

const getTypeColor = (type: NodeType): { gradient: string; glow: string; border: string } => {
  const colors: Record<string, { gradient: string; glow: string; border: string }> = {
    VIDEO: { 
      gradient: 'linear-gradient(135deg, rgba(244, 63, 94, 0.15) 0%, rgba(42, 36, 33, 0.9) 100%)',
      glow: 'rgba(244, 63, 94, 0.3)',
      border: 'rgba(244, 63, 94, 0.3)'
    },
    LINK: { 
      gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(42, 36, 33, 0.9) 100%)',
      glow: 'rgba(59, 130, 246, 0.3)',
      border: 'rgba(59, 130, 246, 0.3)'
    },
    IMAGE: { 
      gradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(42, 36, 33, 0.9) 100%)',
      glow: 'rgba(168, 85, 247, 0.3)',
      border: 'rgba(168, 85, 247, 0.3)'
    },
    TWEET: { 
      gradient: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(42, 36, 33, 0.9) 100%)',
      glow: 'rgba(14, 165, 233, 0.3)',
      border: 'rgba(14, 165, 233, 0.3)'
    },
    ARTICLE: { 
      gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(42, 36, 33, 0.9) 100%)',
      glow: 'rgba(245, 158, 11, 0.3)',
      border: 'rgba(245, 158, 11, 0.3)'
    },
    NOTE: { 
      gradient: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(42, 36, 33, 0.9) 100%)',
      glow: 'rgba(212, 175, 55, 0.4)',
      border: 'rgba(212, 175, 55, 0.4)'
    },
  };
  return colors[type] || colors.NOTE;
};

const ContentCard: React.FC<ContentCardProps> = ({ node, onClick, index = 0 }) => {
  const colors = getTypeColor(node.type);
  
  return (
    <motion.div
      layoutId={`card-${node.id}`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: { delay: index * 0.05, duration: 0.3 }
      }}
      whileHover={{ 
        scale: 1.03, 
        y: -8,
        boxShadow: `0 20px 40px ${colors.glow}`,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-2xl"
      style={{
        background: colors.gradient,
        border: `1px solid ${colors.border}`,
        minWidth: '280px',
        maxWidth: '320px',
        height: '200px',
      }}
    >
      {/* Animated gradient overlay on hover */}
      <motion.div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${colors.glow} 0%, transparent 70%)`
        }}
      />

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-2 h-2 rounded-full opacity-30"
          style={{ background: 'var(--color-primary)', top: '20%', left: '10%' }}
          animate={{ y: [-10, 10], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-1.5 h-1.5 rounded-full opacity-20"
          style={{ background: 'var(--color-primary)', top: '60%', right: '15%' }}
          animate={{ y: [10, -10], opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      {/* Thumbnail overlay if available */}
      {node.thumbnail && (
        <div className="absolute inset-0">
          <img 
            src={node.thumbnail} 
            alt=""
            className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2a2421] via-[#2a2421]/80 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="relative h-full flex flex-col p-5">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <motion.div 
              className="p-2 rounded-xl"
              style={{ 
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <TypeIcon type={node.type} />
            </motion.div>
            {node.pinned && (
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 45 }}
                className="text-amber-400"
              >
                <Pin className="w-4 h-4" />
              </motion.div>
            )}
            {node.aiGenerated && (
              <Sparkles className="w-3 h-3" style={{ color: 'var(--color-primary)' }} />
            )}
          </div>
          <span 
            className="text-[10px] uppercase tracking-wider font-medium px-2 py-1 rounded-full"
            style={{ 
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--color-text-muted)'
            }}
          >
            {new Date(node.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Title & Summary */}
        <div className="flex-1">
          <h3 
            className="text-base font-bold mb-2 line-clamp-2 leading-snug group-hover:text-[var(--color-primary)] transition-colors"
            style={{ color: 'var(--color-text-light)' }}
          >
            {node.title}
          </h3>
          <p 
            className="text-xs line-clamp-2 leading-relaxed"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {node.summary}
          </p>
        </div>

        {/* Footer - Tags */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex flex-wrap gap-1.5">
            {node.tags.slice(0, 2).map(tag => (
              <span 
                key={tag} 
                className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                style={{ 
                  background: 'rgba(212, 175, 55, 0.1)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  color: 'var(--color-primary)'
                }}
              >
                #{tag}
              </span>
            ))}
            {node.tags.length > 2 && (
              <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                +{node.tags.length - 2}
              </span>
            )}
          </div>

          {/* External Link Action */}
          {node.url && (
            <motion.a
              href={node.url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all"
              style={{ 
                background: 'rgba(212, 175, 55, 0.2)',
              }}
              whileHover={{ scale: 1.2, background: 'rgba(212, 175, 55, 0.4)' }}
              whileTap={{ scale: 0.9 }}
            >
              <ExternalLink className="w-3 h-3" style={{ color: 'var(--color-primary)' }} />
            </motion.a>
          )}
        </div>
      </div>

      {/* Bottom shine effect on hover */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: 'var(--gradient-gold)' }}
      />
    </motion.div>
  );
};

export default ContentCard;

