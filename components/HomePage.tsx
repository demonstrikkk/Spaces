import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Brain, Zap, Globe, Share2, Lock, Search, 
  MessageSquare, Grid3X3, ArrowRight, Check, Star,
  BookOpen, Link as LinkIcon, Image, Film, Twitter,
  FileText, ChevronDown, Play, Rocket, Shield, Cloud
} from 'lucide-react';

interface HomePageProps {
  onGetStarted: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onGetStarted }) => {
  const [activeFeature, setActiveFeature] = useState(0);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  // Parallax effects
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -300]);

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Powered Intelligence",
      description: "Gemini 2.5 analyzes, summarizes, and connects your knowledge automatically",
      color: "#d4af37",
      gradient: "from-yellow-500/20 to-amber-600/20"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "One-Click Capture",
      description: "Save anything from the web instantly with our powerful browser extension",
      color: "#f59e0b",
      gradient: "from-orange-500/20 to-yellow-600/20"
    },
    {
      icon: <Share2 className="w-6 h-6" />,
      title: "Knowledge Graph",
      description: "Visualize connections between your ideas in beautiful, interactive graphs",
      color: "#8b5cf6",
      gradient: "from-purple-500/20 to-pink-600/20"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "AI Chat Assistant",
      description: "Ask questions about your saved content and get instant, intelligent answers",
      color: "#10b981",
      gradient: "from-emerald-500/20 to-teal-600/20"
    },
    {
      icon: <Cloud className="w-6 h-6" />,
      title: "Cloud Sync",
      description: "Access your knowledge from anywhere with real-time Supabase synchronization",
      color: "#3b82f6",
      gradient: "from-blue-500/20 to-cyan-600/20"
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Privacy First",
      description: "Your data stays yours. Works offline with local-first architecture",
      color: "#ec4899",
      gradient: "from-pink-500/20 to-rose-600/20"
    }
  ];

  const contentTypes = [
    { icon: <Film />, label: "Videos", color: "#f43f5e" },
    { icon: <FileText />, label: "Articles", color: "#f59e0b" },
    { icon: <LinkIcon />, label: "Links", color: "#3b82f6" },
    { icon: <Image />, label: "Images", color: "#a855f7" },
    { icon: <Twitter />, label: "Tweets", color: "#0ea5e9" },
    { icon: <BookOpen />, label: "Notes", color: "#10b981" },
  ];

  const stats = [
    { value: "2.5s", label: "Average Capture Time" },
    { value: "99.9%", label: "Uptime" },
    { value: "10K+", label: "Items Processed" },
    { value: "∞", label: "Possibilities" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: 'var(--color-background)' }}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ 
            background: 'radial-gradient(circle, #d4af37 0%, transparent 70%)',
            top: '10%',
            left: '10%'
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ 
            background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
            bottom: '10%',
            right: '10%'
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.25, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute w-64 h-64 rounded-full blur-3xl opacity-20"
          style={{ 
            background: 'radial-gradient(circle, #10b981 0%, transparent 70%)',
            top: '50%',
            right: '20%'
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      {/* Hero Section */}
      <motion.section 
        className="relative min-h-screen flex items-center justify-center px-6 py-20"
        style={{ opacity, scale }}
      >
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{ 
              background: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid rgba(212, 175, 55, 0.3)'
            }}
          >
            <Sparkles className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
              Powered by Gemini AI
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
            style={{ color: 'var(--color-text-light)' }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Your{' '}
            <span 
              className="relative inline-block"
              style={{ color: 'var(--color-primary)' }}
            >
              Second Brain
              <motion.div
                className="absolute -bottom-2 left-0 right-0 h-2 rounded-full"
                style={{ background: 'var(--gradient-gold)' }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
              />
            </span>
            <br />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              Powered by AI
            </motion.span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed"
            style={{ color: 'var(--color-text-muted)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Capture, organize, and connect your digital knowledge with the power of AI. 
            Transform scattered information into meaningful insights.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.button
              onClick={onGetStarted}
              className="px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 group"
              style={{ 
                background: 'var(--gradient-gold)',
                color: 'var(--color-background)',
                boxShadow: 'var(--shadow-gold-lg)'
              }}
              whileHover={{ scale: 1.05, boxShadow: '0 20px 60px rgba(212, 175, 55, 0.6)' }}
              whileTap={{ scale: 0.95 }}
            >
              <Rocket className="w-6 h-6" />
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <motion.button
              className="px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-3"
              style={{ 
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'var(--color-text-light)'
              }}
              whileHover={{ 
                scale: 1.05,
                background: 'rgba(255, 255, 255, 0.1)',
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-5 h-5" />
              Watch Demo
            </motion.button>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
          </motion.div>
        </div>

        {/* Floating Elements */}
        <motion.div style={{ y: y1 }} className="absolute top-1/4 left-10 hidden lg:block">
          <div 
            className="p-4 rounded-2xl backdrop-blur-md"
            style={{ 
              background: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid rgba(212, 175, 55, 0.3)'
            }}
          >
            <Brain className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
          </div>
        </motion.div>

        <motion.div style={{ y: y2 }} className="absolute top-1/3 right-20 hidden lg:block">
          <div 
            className="p-4 rounded-2xl backdrop-blur-md"
            style={{ 
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.3)'
            }}
          >
            <Share2 className="w-8 h-8" style={{ color: '#8b5cf6' }} />
          </div>
        </motion.div>

        <motion.div style={{ y: y3 }} className="absolute bottom-1/4 right-10 hidden lg:block">
          <div 
            className="p-4 rounded-2xl backdrop-blur-md"
            style={{ 
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}
          >
            <Zap className="w-8 h-8" style={{ color: '#10b981' }} />
          </div>
        </motion.div>
      </motion.section>

      {/* Stats Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="text-center"
              >
                <motion.div
                  className="text-5xl font-bold mb-2"
                  style={{ color: 'var(--color-primary)' }}
                  whileHover={{ scale: 1.1 }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold mb-4" style={{ color: 'var(--color-text-light)' }}>
              Supercharge Your Knowledge
            </h2>
            <p className="text-xl" style={{ color: 'var(--color-text-muted)' }}>
              Everything you need to capture, organize, and connect ideas
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="p-6 rounded-2xl backdrop-blur-md cursor-pointer group relative overflow-hidden"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                {/* Gradient overlay on hover */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}
                />

                <div className="relative z-10">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ 
                      background: `${feature.color}20`,
                      color: feature.color
                    }}
                  >
                    {feature.icon}
                  </div>

                  <h3 
                    className="text-xl font-bold mb-2"
                    style={{ color: 'var(--color-text-light)' }}
                  >
                    {feature.title}
                  </h3>

                  <p 
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Types Showcase */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold mb-4" style={{ color: 'var(--color-text-light)' }}>
              Capture Everything
            </h2>
            <p className="text-xl" style={{ color: 'var(--color-text-muted)' }}>
              From videos to tweets, we've got you covered
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4">
            {contentTypes.map((type, idx) => (
              <motion.div
                key={type.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="px-6 py-4 rounded-2xl backdrop-blur-md flex items-center gap-3 cursor-pointer"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <div style={{ color: type.color }}>
                  {type.icon}
                </div>
                <span className="font-medium" style={{ color: 'var(--color-text-light)' }}>
                  {type.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Feature Demo */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Feature List */}
            <div>
              <h2 className="text-4xl font-bold mb-8" style={{ color: 'var(--color-text-light)' }}>
                Built for Power Users
              </h2>

              <div className="space-y-4">
                {features.map((feature, idx) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    whileHover={{ x: 8 }}
                    onClick={() => setActiveFeature(idx)}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                      activeFeature === idx ? 'scale-105' : ''
                    }`}
                    style={{
                      background: activeFeature === idx 
                        ? 'rgba(212, 175, 55, 0.15)' 
                        : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${
                        activeFeature === idx 
                          ? 'var(--color-border-gold)' 
                          : 'rgba(255, 255, 255, 0.1)'
                      }`
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ 
                          background: `${feature.color}20`,
                          color: feature.color
                        }}
                      >
                        {feature.icon}
                      </div>
                      <div>
                        <h3 
                          className="font-bold"
                          style={{ color: 'var(--color-text-light)' }}
                        >
                          {feature.title}
                        </h3>
                        <p 
                          className="text-sm"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right: Visual Demo */}
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                  transition={{ duration: 0.5 }}
                  className="aspect-square rounded-3xl p-8 flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${features[activeFeature].color}20 0%, rgba(42, 36, 33, 0.9) 100%)`,
                    border: `2px solid ${features[activeFeature].color}40`,
                    boxShadow: `0 20px 60px ${features[activeFeature].color}40`
                  }}
                >
                  <div className="text-center">
                    <motion.div
                      className="w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                      style={{ 
                        background: `${features[activeFeature].color}30`,
                        color: features[activeFeature].color
                      }}
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, 0, -5, 0]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      {React.cloneElement(features[activeFeature].icon, { className: 'w-12 h-12' })}
                    </motion.div>
                    <h3 
                      className="text-2xl font-bold mb-3"
                      style={{ color: 'var(--color-text-light)' }}
                    >
                      {features[activeFeature].title}
                    </h3>
                    <p 
                      className="text-lg"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {features[activeFeature].description}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Progress Indicators */}
              <div className="flex justify-center gap-2 mt-6">
                {features.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveFeature(idx)}
                    className="relative"
                  >
                    <div 
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === activeFeature ? 'w-8' : ''
                      }`}
                      style={{ 
                        background: idx === activeFeature 
                          ? 'var(--color-primary)' 
                          : 'rgba(255, 255, 255, 0.2)'
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        {/* Background gradient */}
        <div 
          className="absolute inset-0"
          style={{ 
            background: 'radial-gradient(circle at center, rgba(212, 175, 55, 0.15) 0%, transparent 70%)'
          }}
        />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6" style={{ color: 'var(--color-text-light)' }}>
              Ready to Transform Your Knowledge?
            </h2>
            <p className="text-xl mb-10" style={{ color: 'var(--color-text-muted)' }}>
              Join thousands of knowledge workers already using Spaces
            </p>

            <motion.button
              onClick={onGetStarted}
              className="px-12 py-5 rounded-2xl font-bold text-xl flex items-center gap-3 mx-auto group"
              style={{ 
                background: 'var(--gradient-gold)',
                color: 'var(--color-background)',
                boxShadow: 'var(--shadow-gold-lg)'
              }}
              whileHover={{ 
                scale: 1.05, 
                boxShadow: '0 25px 70px rgba(212, 175, 55, 0.7)' 
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Rocket className="w-6 h-6" />
              Start Building Your Second Brain
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </motion.button>

            <p className="text-sm mt-6" style={{ color: 'var(--color-text-muted)' }}>
              No credit card required • Free forever • Setup in 2 minutes
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t" style={{ borderColor: 'var(--color-border-dark)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--gradient-gold)' }}
              >
                <Brain className="w-6 h-6" style={{ color: 'var(--color-background)' }} />
              </div>
              <span className="text-xl font-bold" style={{ color: 'var(--color-text-light)' }}>
                Spaces
              </span>
            </div>

            <div className="flex gap-6">
              <button 
                className="text-sm hover:text-[var(--color-primary)] transition-colors"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Features
              </button>
              <button 
                className="text-sm hover:text-[var(--color-primary)] transition-colors"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Pricing
              </button>
              <button 
                className="text-sm hover:text-[var(--color-primary)] transition-colors"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Docs
              </button>
              <button 
                className="text-sm hover:text-[var(--color-primary)] transition-colors"
                style={{ color: 'var(--color-text-muted)' }}
              >
                GitHub
              </button>
            </div>

            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              © 2025 Spaces. Built with ❤️
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
