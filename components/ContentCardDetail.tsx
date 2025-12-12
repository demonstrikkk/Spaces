import React from 'react';
import { Node, NodeType } from '../types';
import { FileText, Link as LinkIcon, Image, Film, MessageCircle, Twitter, Pin, ExternalLink, X, Calendar, Tag, Clock, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

interface ContentCardDetailProps {
  node: Node | null;
  isOpen: boolean;
  onClose: () => void;
}

const TypeIcon = ({ type }: { type: NodeType }) => {
  const iconClasses = "w-5 h-5";
  switch (type) {
    case NodeType.VIDEO: return <Film className={iconClasses} style={{ color: '#f43f5e' }} />;
    case NodeType.LINK: return <LinkIcon className={iconClasses} style={{ color: '#3b82f6' }} />;
    case NodeType.IMAGE: return <Image className={iconClasses} style={{ color: '#a855f7' }} />;
    case NodeType.TWEET: return <Twitter className={iconClasses} style={{ color: '#0ea5e9' }} />;
    case NodeType.CHAT_LOG: return <MessageCircle className={iconClasses} style={{ color: '#10b981' }} />;
    case NodeType.ARTICLE: return <FileText className={iconClasses} style={{ color: '#f59e0b' }} />;
    case NodeType.PDF: return <FileText className={iconClasses} style={{ color: '#ef4444' }} />;
    default: return <FileText className={iconClasses} style={{ color: 'var(--color-text-muted)' }} />;
  }
};

const TypeBadge = ({ type }: { type: NodeType }) => {
  const colors: Record<string, { bg: string; text: string }> = {
    VIDEO: { bg: 'rgba(244, 63, 94, 0.15)', text: '#f43f5e' },
    LINK: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6' },
    IMAGE: { bg: 'rgba(168, 85, 247, 0.15)', text: '#a855f7' },
    TWEET: { bg: 'rgba(14, 165, 233, 0.15)', text: '#0ea5e9' },
    CHAT_LOG: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981' },
    ARTICLE: { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' },
    NOTE: { bg: 'rgba(212, 175, 55, 0.15)', text: '#d4af37' },
    PDF: { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' },
  };

  const color = colors[type] || colors.NOTE;

  return (
    <span 
      className="px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider"
      style={{ background: color.bg, color: color.text }}
    >
      {type}
    </span>
  );
};

const ContentCardDetail: React.FC<ContentCardDetailProps> = ({ node, isOpen, onClose }) => {
  if (!node) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <motion.div 
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-3xl"
            style={{ 
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border-gold)',
              boxShadow: 'var(--shadow-gold-lg)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with gradient */}
            <div 
              className="relative h-32 flex items-end p-6"
              style={{ 
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.3) 0%, rgba(42, 36, 33, 0.9) 100%)'
              }}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full transition-all hover:scale-110"
                style={{ background: 'rgba(0, 0, 0, 0.3)' }}
              >
                <X className="w-5 h-5" style={{ color: 'var(--color-text-light)' }} />
              </button>

              {/* Thumbnail if available */}
              {node.thumbnail && (
                <div className="absolute inset-0">
                  <img 
                    src={node.thumbnail} 
                    alt={node.title}
                    className="w-full h-full object-cover opacity-30"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface)] to-transparent" />
                </div>
              )}

              <div className="relative flex items-center gap-4 w-full">
                <div 
                  className="p-3 rounded-xl"
                  style={{ background: 'rgba(212, 175, 55, 0.2)', border: '1px solid var(--color-border-gold)' }}
                >
                  <TypeIcon type={node.type} />
                </div>
                <div className="flex-1">
                  <TypeBadge type={node.type} />
                </div>
                {node.pinned && (
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full" style={{ background: 'rgba(251, 191, 36, 0.2)' }}>
                    <Pin className="w-3 h-3 rotate-45" style={{ color: '#fbbf24' }} />
                    <span className="text-xs font-medium" style={{ color: '#fbbf24' }}>Pinned</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-8rem)]">
              {/* Title */}
              <h2 
                className="text-2xl font-bold mb-4 leading-tight"
                style={{ color: 'var(--color-text-light)' }}
              >
                {node.title}
              </h2>

              {/* Meta info */}
              <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b" style={{ borderColor: 'var(--color-border-dark)' }}>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                  <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    {new Date(node.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                {node.readingTime && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                    <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      {node.readingTime} min read
                    </span>
                  </div>
                )}
                {node.url && (
                  <a 
                    href={node.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 hover:underline"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    <Globe className="w-4 h-4" />
                    <span className="text-sm">View Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Summary */}
              {node.summary && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-primary)' }}>
                    Summary
                  </h3>
                  <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-light)' }}>
                    {node.summary}
                  </p>
                </div>
              )}

              {/* Content */}
              {node.content && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-primary)' }}>
                    Content
                  </h3>
                  <div 
                    className="prose prose-invert prose-sm max-w-none p-4 rounded-xl"
                    style={{ background: 'rgba(0, 0, 0, 0.2)' }}
                  >
                    <ReactMarkdown>{node.content}</ReactMarkdown>
                  </div>
                </div>
              )}

              {/* Tags */}
              {node.tags && node.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--color-primary)' }}>
                    <Tag className="w-4 h-4" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {node.tags.map(tag => (
                      <span 
                        key={tag}
                        className="px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105"
                        style={{ 
                          background: 'rgba(212, 175, 55, 0.1)',
                          border: '1px solid rgba(212, 175, 55, 0.3)',
                          color: 'var(--color-primary)'
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              {node.metadata && Object.keys(node.metadata).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-primary)' }}>
                    Additional Info
                  </h3>
                  <div 
                    className="grid grid-cols-2 gap-3 p-4 rounded-xl"
                    style={{ background: 'rgba(0, 0, 0, 0.2)' }}
                  >
                    {node.metadata.author && (
                      <div>
                        <span className="text-xs uppercase" style={{ color: 'var(--color-text-muted)' }}>Author</span>
                        <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>{node.metadata.author}</p>
                      </div>
                    )}
                    {node.metadata.siteName && (
                      <div>
                        <span className="text-xs uppercase" style={{ color: 'var(--color-text-muted)' }}>Source</span>
                        <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>{node.metadata.siteName}</p>
                      </div>
                    )}
                    {node.metadata.duration && (
                      <div>
                        <span className="text-xs uppercase" style={{ color: 'var(--color-text-muted)' }}>Duration</span>
                        <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>{node.metadata.duration}</p>
                      </div>
                    )}
                    {node.metadata.wordCount && (
                      <div>
                        <span className="text-xs uppercase" style={{ color: 'var(--color-text-muted)' }}>Word Count</span>
                        <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>{node.metadata.wordCount.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContentCardDetail;
