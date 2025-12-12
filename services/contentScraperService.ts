/**
 * Content Scraper Service
 * Extracts metadata, structured content, and media from URLs
 */

export interface ScrapedContent {
  title: string;
  summary: string;
  content: string;
  url: string;
  type: 'article' | 'video' | 'image' | 'tweet' | 'unknown';
  metadata: {
    author?: string;
    published?: string;
    description?: string;
    keywords?: string[];
    images?: string[];
    favicon?: string;
    siteName?: string;
    duration?: string; // for videos
    thumbnail?: string;
  };
  success: boolean;
  error?: string;
}

/**
 * Main scraping function - attempts multiple strategies
 */
export async function scrapeUrl(url: string): Promise<ScrapedContent> {
  try {
    // Detect content type from URL
    const contentType = detectContentType(url);

    // Use specialized scrapers
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return await scrapeYouTube(url);
    } else if (url.includes('twitter.com') || url.includes('x.com')) {
      return await scrapeTwitter(url);
    } else if (contentType === 'image') {
      return await scrapeImage(url);
    } else {
      return await scrapeGenericPage(url);
    }
  } catch (error) {
    console.error('Scraping error:', error);
    return {
      title: url,
      summary: 'Failed to scrape content',
      content: '',
      url,
      type: 'unknown',
      metadata: {},
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Detect content type from URL
 */
function detectContentType(url: string): string {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
  
  const lowerUrl = url.toLowerCase();
  
  if (imageExtensions.some(ext => lowerUrl.includes(ext))) return 'image';
  if (videoExtensions.some(ext => lowerUrl.includes(ext))) return 'video';
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return 'video';
  
  return 'article';
}

/**
 * Scrape YouTube video information
 */
async function scrapeYouTube(url: string): Promise<ScrapedContent> {
  try {
    // Extract video ID
    const videoId = extractYouTubeId(url);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    // For now, use basic extraction. In production, use YouTube API or oEmbed
    const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    
    const response = await fetch(oEmbedUrl);
    const data = await response.json();

    return {
      title: data.title || 'YouTube Video',
      summary: `YouTube video by ${data.author_name}`,
      content: `Video URL: https://www.youtube.com/watch?v=${videoId}`,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      type: 'video',
      metadata: {
        author: data.author_name,
        thumbnail: data.thumbnail_url,
        siteName: 'YouTube'
      },
      success: true
    };
  } catch (error) {
    return {
      title: 'YouTube Video',
      summary: 'Failed to extract video details',
      content: url,
      url,
      type: 'video',
      metadata: {},
      success: false,
      error: error.message
    };
  }
}

/**
 * Extract YouTube video ID from various URL formats
 */
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

/**
 * Scrape Twitter/X post
 */
async function scrapeTwitter(url: string): Promise<ScrapedContent> {
  // Twitter requires authentication for API access
  // Using basic metadata extraction
  return {
    title: 'Twitter Post',
    summary: 'Captured from Twitter/X',
    content: url,
    url,
    type: 'tweet',
    metadata: {
      siteName: 'Twitter'
    },
    success: true
  };
}

/**
 * Scrape image metadata
 */
async function scrapeImage(url: string): Promise<ScrapedContent> {
  const filename = url.split('/').pop()?.split('?')[0] || 'image';
  
  return {
    title: filename,
    summary: 'Image captured from web',
    content: url,
    url,
    type: 'image',
    metadata: {
      thumbnail: url,
      images: [url]
    },
    success: true
  };
}

/**
 * Scrape generic web page using Open Graph and meta tags
 */
async function scrapeGenericPage(url: string): Promise<ScrapedContent> {
  try {
    // Fetch the page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SpacesBot/1.0)'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    
    // Parse metadata
    const metadata = parseHtmlMetadata(html);
    
    // Extract main content (simplified - in production use Readability.js)
    const textContent = extractTextContent(html);

    return {
      title: metadata.title || metadata.ogTitle || new URL(url).hostname,
      summary: metadata.description || metadata.ogDescription || textContent.substring(0, 200),
      content: textContent,
      url,
      type: 'article',
      metadata: {
        author: metadata.author,
        published: metadata.published,
        description: metadata.description,
        keywords: metadata.keywords,
        images: metadata.images,
        favicon: metadata.favicon,
        siteName: metadata.siteName,
        thumbnail: metadata.ogImage
      },
      success: true
    };
  } catch (error) {
    return {
      title: new URL(url).hostname,
      summary: 'Unable to scrape content',
      content: url,
      url,
      type: 'article',
      metadata: {},
      success: false,
      error: error.message
    };
  }
}

/**
 * Parse HTML metadata (Open Graph, Twitter Cards, etc.)
 */
function parseHtmlMetadata(html: string): any {
  const metadata: any = {
    images: [],
    keywords: []
  };

  // Helper to extract meta content
  const extractMeta = (pattern: RegExp, group = 1): string | null => {
    const match = html.match(pattern);
    return match ? decodeHtml(match[group]) : null;
  };

  // Title
  metadata.title = extractMeta(/<title[^>]*>([^<]+)<\/title>/i);
  metadata.ogTitle = extractMeta(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
  metadata.twitterTitle = extractMeta(/<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']+)["']/i);

  // Description
  metadata.description = extractMeta(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  metadata.ogDescription = extractMeta(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);

  // Author
  metadata.author = extractMeta(/<meta[^>]*name=["']author["'][^>]*content=["']([^"']+)["']/i);
  metadata.author = metadata.author || extractMeta(/<meta[^>]*property=["']article:author["'][^>]*content=["']([^"']+)["']/i);

  // Published date
  metadata.published = extractMeta(/<meta[^>]*property=["']article:published_time["'][^>]*content=["']([^"']+)["']/i);

  // Keywords
  const keywordsStr = extractMeta(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i);
  if (keywordsStr) {
    metadata.keywords = keywordsStr.split(',').map(k => k.trim());
  }

  // Images
  metadata.ogImage = extractMeta(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
  metadata.twitterImage = extractMeta(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i);
  
  if (metadata.ogImage) metadata.images.push(metadata.ogImage);
  if (metadata.twitterImage && metadata.twitterImage !== metadata.ogImage) {
    metadata.images.push(metadata.twitterImage);
  }

  // Site name
  metadata.siteName = extractMeta(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i);

  // Favicon
  metadata.favicon = extractMeta(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i);

  return metadata;
}

/**
 * Extract text content from HTML (simplified)
 */
function extractTextContent(html: string): string {
  // Remove scripts and styles
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, ' ');
  
  // Decode HTML entities
  text = decodeHtml(text);
  
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text.substring(0, 5000); // Limit to 5000 chars
}

/**
 * Decode HTML entities
 */
function decodeHtml(html: string): string {
  const entities: { [key: string]: string } = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' '
  };

  return html.replace(/&[^;]+;/g, match => entities[match] || match);
}

/**
 * Get readable article content using Readability-like extraction
 */
export function extractArticleContent(html: string): { title: string; content: string; excerpt: string } {
  // This is a simplified version. For production, use @mozilla/readability
  const text = extractTextContent(html);
  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || '';
  
  return {
    title: decodeHtml(title),
    content: text,
    excerpt: text.substring(0, 300)
  };
}
