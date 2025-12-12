/**
 * YouTube Transcript Service
 * Extracts subtitles/transcripts from YouTube videos
 */

export interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

export interface YouTubeTranscript {
  videoId: string;
  title: string;
  transcript: string;
  segments: TranscriptSegment[];
  language: string;
  success: boolean;
  error?: string;
}

/**
 * Extract transcript from YouTube video
 * Uses multiple fallback methods
 */
export async function getYouTubeTranscript(videoUrl: string): Promise<YouTubeTranscript> {
  try {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    // Method 1: Try direct API endpoint (works without API key for some videos)
    try {
      const transcript = await fetchTranscriptDirect(videoId);
      if (transcript.success) {
        return transcript;
      }
    } catch (error) {
      console.log('Direct method failed, trying alternative:', error.message);
    }

    // Method 2: Try using caption tracks from video page
    try {
      const transcript = await fetchTranscriptFromPage(videoId);
      if (transcript.success) {
        return transcript;
      }
    } catch (error) {
      console.log('Page scraping method failed:', error.message);
    }

    // If all methods fail
    return {
      videoId,
      title: 'YouTube Video',
      transcript: '',
      segments: [],
      language: 'en',
      success: false,
      error: 'Unable to fetch transcript. Video may not have captions.'
    };
  } catch (error) {
    return {
      videoId: '',
      title: '',
      transcript: '',
      segments: [],
      language: 'en',
      success: false,
      error: error.message
    };
  }
}

/**
 * Extract video ID from various YouTube URL formats
 */
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
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
 * Method 1: Fetch transcript using direct endpoint
 */
async function fetchTranscriptDirect(videoId: string): Promise<YouTubeTranscript> {
  // This uses the YouTube transcript API that some third-party libraries use
  // Note: This may not work in all environments due to CORS
  
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const response = await fetch(url);
  const html = await response.text();

  // Extract captions data from page
  const captionsRegex = /"captions":(\{[^}]*"playerCaptionsTracklistRenderer":\{[^}]*\})/;
  const match = html.match(captionsRegex);

  if (!match) {
    throw new Error('No captions found');
  }

  // Parse caption tracks
  const captionsData = JSON.parse(match[1]);
  const tracks = captionsData.playerCaptionsTracklistRenderer?.captionTracks;

  if (!tracks || tracks.length === 0) {
    throw new Error('No caption tracks available');
  }

  // Get the first available track (usually auto-generated or first language)
  const track = tracks[0];
  const captionUrl = track.baseUrl;

  // Fetch the actual captions
  const captionResponse = await fetch(captionUrl);
  const captionXml = await captionResponse.text();

  // Parse XML captions
  const segments = parseTranscriptXml(captionXml);
  const transcript = segments.map(s => s.text).join(' ');

  return {
    videoId,
    title: extractTitleFromHtml(html),
    transcript,
    segments,
    language: track.languageCode || 'en',
    success: true
  };
}

/**
 * Method 2: Fetch transcript by scraping video page
 */
async function fetchTranscriptFromPage(videoId: string): Promise<YouTubeTranscript> {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  
  // This is a simplified version. In production, you'd need a more robust scraper
  // or use youtube-transcript npm package
  
  const response = await fetch(url);
  const html = await response.text();

  // Look for caption data in page
  const captionsMatch = html.match(/"captionTracks":\[(\{[^\]]+\})\]/);
  if (!captionsMatch) {
    throw new Error('No captions in page data');
  }

  const captionsData = JSON.parse(`[${captionsMatch[1]}]`);
  if (captionsData.length === 0) {
    throw new Error('No caption tracks');
  }

  const captionUrl = captionsData[0].baseUrl;
  const captionResponse = await fetch(captionUrl);
  const captionXml = await captionResponse.text();

  const segments = parseTranscriptXml(captionXml);
  const transcript = segments.map(s => s.text).join(' ');

  return {
    videoId,
    title: extractTitleFromHtml(html),
    transcript,
    segments,
    language: captionsData[0].languageCode || 'en',
    success: true
  };
}

/**
 * Parse YouTube transcript XML format
 */
function parseTranscriptXml(xml: string): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];
  
  // Match all <text> tags with their attributes
  const textRegex = /<text start="([^"]*)" dur="([^"]*)">([^<]*)<\/text>/g;
  let match;

  while ((match = textRegex.exec(xml)) !== null) {
    const text = decodeHtml(match[3].trim());
    if (text) {
      segments.push({
        text,
        start: parseFloat(match[1]),
        duration: parseFloat(match[2])
      });
    }
  }

  return segments;
}

/**
 * Extract video title from HTML
 */
function extractTitleFromHtml(html: string): string {
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (titleMatch) {
    return decodeHtml(titleMatch[1].replace(' - YouTube', ''));
  }
  return 'YouTube Video';
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
    '&nbsp;': ' ',
    '&#x2F;': '/'
  };

  return html.replace(/&[#a-zA-Z0-9]+;/g, match => entities[match] || match);
}

/**
 * Format transcript with timestamps for better readability
 */
export function formatTranscriptWithTimestamps(segments: TranscriptSegment[]): string {
  return segments.map(segment => {
    const time = formatTimestamp(segment.start);
    return `[${time}] ${segment.text}`;
  }).join('\n');
}

/**
 * Format seconds to MM:SS or HH:MM:SS
 */
function formatTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${padZero(minutes)}:${padZero(secs)}`;
  }
  return `${minutes}:${padZero(secs)}`;
}

function padZero(num: number): string {
  return num.toString().padStart(2, '0');
}

/**
 * Search transcript for specific keywords
 */
export function searchTranscript(
  segments: TranscriptSegment[],
  query: string
): Array<{ segment: TranscriptSegment; index: number }> {
  const lowerQuery = query.toLowerCase();
  return segments
    .map((segment, index) => ({ segment, index }))
    .filter(({ segment }) => segment.text.toLowerCase().includes(lowerQuery));
}

/**
 * Get transcript summary by extracting key segments
 */
export function summarizeTranscript(segments: TranscriptSegment[], maxLength = 500): string {
  const fullText = segments.map(s => s.text).join(' ');
  
  if (fullText.length <= maxLength) {
    return fullText;
  }

  // Simple extractive summary - take first few segments
  let summary = '';
  for (const segment of segments) {
    if (summary.length + segment.text.length > maxLength) {
      break;
    }
    summary += segment.text + ' ';
  }

  return summary.trim() + '...';
}

/**
 * Alternative: Use youtube-transcript package wrapper
 * This function demonstrates how to use it when the package is installed
 */
export async function getTranscriptUsingPackage(videoId: string): Promise<YouTubeTranscript> {
  try {
    // When youtube-transcript is installed:
    // import { YoutubeTranscript } from 'youtube-transcript';
    // const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
    
    // For now, return mock data indicating package is needed
    return {
      videoId,
      title: 'YouTube Video',
      transcript: '',
      segments: [],
      language: 'en',
      success: false,
      error: 'Install youtube-transcript package for enhanced support'
    };
  } catch (error) {
    return {
      videoId,
      title: '',
      transcript: '',
      segments: [],
      language: 'en',
      success: false,
      error: error.message
    };
  }
}
