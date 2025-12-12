-- ============================================
-- SPACES - PRODUCTION DATABASE SCHEMA
-- Drop all existing tables and recreate fresh
-- ============================================

-- DROP ALL EXISTING TABLES (Clean Slate)
DROP TABLE IF EXISTS public.node_tags CASCADE;
DROP TABLE IF EXISTS public.tags CASCADE;
DROP TABLE IF EXISTS public.nodes CASCADE;
DROP TABLE IF EXISTS public.spaces CASCADE;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- ============================================
-- 1. SPACES TABLE (Collections/Folders)
-- ============================================
CREATE TABLE IF NOT EXISTS public.spaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3b82f6',
    icon TEXT DEFAULT '📁',
    is_favorite BOOLEAN DEFAULT FALSE,
    node_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- 2. NODES TABLE (Content Items)
-- ============================================
CREATE TABLE IF NOT EXISTS public.nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    space_id UUID REFERENCES public.spaces(id) ON DELETE CASCADE,
    
    -- Basic Info
    type TEXT NOT NULL DEFAULT 'note' CHECK (type IN ('video', 'article', 'note', 'image', 'tweet', 'chat_log', 'link', 'pdf', 'code_snippet', 'quote', 'audio', 'bookmark', 'text')),
    title TEXT,
    content TEXT,
    url TEXT,
    
    -- Enhanced Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- AI Processing Results
    ai_summary TEXT,
    ai_key_points TEXT[],
    ai_entities JSONB,
    ai_sentiment TEXT CHECK (ai_sentiment IN ('positive', 'negative', 'neutral', 'mixed')),
    ai_category TEXT,
    
    -- Extracted Content
    extracted_text TEXT,
    extracted_at TIMESTAMP WITH TIME ZONE,
    
    -- Source Information
    source_url TEXT,
    source_title TEXT,
    source_domain TEXT,
    captured_from TEXT DEFAULT 'extension',
    
    -- Organization
    is_favorite BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Full-text search
    search_vector tsvector
);

-- ============================================
-- 3. TAGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#6366f1',
    icon TEXT,
    usage_count INTEGER DEFAULT 0,
    is_auto_generated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. NODE_TAGS TABLE (Many-to-Many Junction)
-- ============================================
CREATE TABLE IF NOT EXISTS public.node_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    node_id UUID REFERENCES public.nodes(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
    confidence FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(node_id, tag_id)
);

-- ============================================
-- INDEXES for Performance
-- ============================================

-- Spaces indexes
CREATE INDEX IF NOT EXISTS idx_spaces_deleted_at ON public.spaces(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_spaces_created_at ON public.spaces(created_at DESC);

-- Nodes indexes
CREATE INDEX IF NOT EXISTS idx_nodes_space_id ON public.nodes(space_id);
CREATE INDEX IF NOT EXISTS idx_nodes_type ON public.nodes(type);
CREATE INDEX IF NOT EXISTS idx_nodes_created_at ON public.nodes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_nodes_deleted_at ON public.nodes(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_nodes_source_domain ON public.nodes(source_domain);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_nodes_search_vector ON public.nodes USING GIN(search_vector);

-- Tags indexes
CREATE INDEX IF NOT EXISTS idx_tags_name ON public.tags(name);
CREATE INDEX IF NOT EXISTS idx_tags_usage_count ON public.tags(usage_count DESC);

-- Node tags indexes
CREATE INDEX IF NOT EXISTS idx_node_tags_node_id ON public.node_tags(node_id);
CREATE INDEX IF NOT EXISTS idx_node_tags_tag_id ON public.node_tags(tag_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function: Update search_vector for full-text search
CREATE OR REPLACE FUNCTION update_node_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.extracted_text, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(NEW.ai_summary, '')), 'D');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_node_search_vector ON public.nodes;
CREATE TRIGGER trigger_update_node_search_vector
    BEFORE INSERT OR UPDATE OF title, content, extracted_text, ai_summary
    ON public.nodes
    FOR EACH ROW
    EXECUTE FUNCTION update_node_search_vector();

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_spaces_timestamp ON public.spaces;
CREATE TRIGGER trigger_update_spaces_timestamp
    BEFORE UPDATE ON public.spaces
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_update_nodes_timestamp ON public.nodes;
CREATE TRIGGER trigger_update_nodes_timestamp
    BEFORE UPDATE ON public.nodes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Function: Update space node count
CREATE OR REPLACE FUNCTION update_space_node_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.spaces 
        SET node_count = node_count + 1 
        WHERE id = NEW.space_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.spaces 
        SET node_count = GREATEST(node_count - 1, 0)
        WHERE id = OLD.space_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.space_id != NEW.space_id THEN
        UPDATE public.spaces 
        SET node_count = GREATEST(node_count - 1, 0)
        WHERE id = OLD.space_id;
        UPDATE public.spaces 
        SET node_count = node_count + 1 
        WHERE id = NEW.space_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_space_node_count ON public.nodes;
CREATE TRIGGER trigger_update_space_node_count
    AFTER INSERT OR UPDATE OR DELETE ON public.nodes
    FOR EACH ROW
    EXECUTE FUNCTION update_space_node_count();

-- Function: Update tag usage count
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.tags 
        SET usage_count = usage_count + 1 
        WHERE id = NEW.tag_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.tags 
        SET usage_count = GREATEST(usage_count - 1, 0)
        WHERE id = OLD.tag_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_tag_usage_count ON public.node_tags;
CREATE TRIGGER trigger_update_tag_usage_count
    AFTER INSERT OR DELETE ON public.node_tags
    FOR EACH ROW
    EXECUTE FUNCTION update_tag_usage_count();

-- ============================================
-- DISABLE RLS (For Simple Setup)
-- Enable this when you add authentication
-- ============================================

ALTER TABLE public.spaces DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.nodes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.node_tags DISABLE ROW LEVEL SECURITY;

-- ============================================
-- GRANTS (Allow anon access for now)
-- ============================================

GRANT ALL ON public.spaces TO anon, authenticated;
GRANT ALL ON public.nodes TO anon, authenticated;
GRANT ALL ON public.tags TO anon, authenticated;
GRANT ALL ON public.node_tags TO anon, authenticated;

-- ============================================
-- INSERT DEFAULT DATA
-- ============================================

-- Insert default spaces if table is empty
INSERT INTO public.spaces (name, description, icon, color)
SELECT 'Getting Started', 'Welcome to Spaces! Start capturing your knowledge here.', '🚀', '#3b82f6'
WHERE NOT EXISTS (SELECT 1 FROM public.spaces LIMIT 1);

INSERT INTO public.spaces (name, description, icon, color)
SELECT 'AI & Tech', 'AI research, tech articles, and innovations', '🤖', '#8b5cf6'
WHERE (SELECT COUNT(*) FROM public.spaces) = 1;

INSERT INTO public.spaces (name, description, icon, color)
SELECT 'Ideas & Projects', 'Brainstorming and project planning', '💡', '#f59e0b'
WHERE (SELECT COUNT(*) FROM public.spaces) = 2;

-- ============================================
-- COMPLETION
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Spaces Schema (Simplified) created successfully!';
    RAISE NOTICE '';
    RAISE NOTICE 'Tables created: 4 core tables';
    RAISE NOTICE 'RLS: DISABLED (for easy setup)';
    RAISE NOTICE 'Auth: NOT REQUIRED';
    RAISE NOTICE '';
    RAISE NOTICE 'You can now:';
    RAISE NOTICE '1. Create spaces without authentication';
    RAISE NOTICE '2. Save nodes from your extension';
    RAISE NOTICE '3. Test all features immediately';
    RAISE NOTICE '';
    RAISE NOTICE 'To enable authentication later, run the full schema with RLS enabled.';
END $$;
