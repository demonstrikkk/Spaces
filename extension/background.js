// Background Service Worker for Spaces Extension
// Handles context menu interactions and content capture

// Context menu IDs
const MENU_IDS = {
  SAVE_SELECTION: 'saveSelection',
  SAVE_IMAGE: 'saveImage',
  SAVE_VIDEO: 'saveVideo',
  SAVE_LINK: 'saveLink',
  SAVE_PAGE: 'savePage',
  EXTRACT_PAGE: 'extractPageContent'
};

// Create context menus on installation
chrome.runtime.onInstalled.addListener(() => {
  // Save selected text
  chrome.contextMenus.create({
    id: MENU_IDS.SAVE_SELECTION,
    title: 'Save to Spaces 📝',
    contexts: ['selection']
  });

  // Save image
  chrome.contextMenus.create({
    id: MENU_IDS.SAVE_IMAGE,
    title: 'Save Image to Spaces 🖼️',
    contexts: ['image']
  });

  // Save video
  chrome.contextMenus.create({
    id: MENU_IDS.SAVE_VIDEO,
    title: 'Save Video to Spaces 🎬',
    contexts: ['video']
  });

  // Save link
  chrome.contextMenus.create({
    id: MENU_IDS.SAVE_LINK,
    title: 'Save Link to Spaces 🔗',
    contexts: ['link']
  });

  // Save entire page
  chrome.contextMenus.create({
    id: MENU_IDS.SAVE_PAGE,
    title: 'Save Page to Spaces 📄',
    contexts: ['page']
  });

  // Extract and analyze page content
  chrome.contextMenus.create({
    id: MENU_IDS.EXTRACT_PAGE,
    title: 'Extract & Analyze Page 🧠',
    contexts: ['page']
  });

  console.log('Spaces context menus created!');
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  try {
    const captureData = await buildCaptureData(info, tab);
    
    // Store in chrome.storage for popup to access
    await chrome.storage.local.set({
      pendingCapture: captureData,
      captureTimestamp: Date.now()
    });

    // Show notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon.png', // Make sure to add an icon
      title: 'Content Captured!',
      message: `${captureData.type} saved. Click to organize in Spaces.`
    });

    // Always just open the popup - it will handle everything
    // Don't redirect to website, keep user on current page
    chrome.action.openPopup();
  } catch (error) {
    console.error('Error handling context menu:', error);
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon.png',
      title: 'Capture Failed',
      message: 'Unable to capture content. Please try again.'
    });
  }
});

// Build capture data based on context menu selection
async function buildCaptureData(info, tab) {
  const baseData = {
    tabTitle: tab.title,
    tabUrl: tab.url,
    timestamp: Date.now(),
    favicon: tab.favIconUrl
  };

  switch (info.menuItemId) {
    case MENU_IDS.SAVE_SELECTION:
      return {
        ...baseData,
        type: 'TEXT',
        nodeType: 'NOTE',
        content: info.selectionText,
        title: `"${info.selectionText.substring(0, 50)}${info.selectionText.length > 50 ? '...' : ''}"`,
        requiresProcessing: false
      };

    case MENU_IDS.SAVE_IMAGE:
      return {
        ...baseData,
        type: 'IMAGE',
        nodeType: 'IMAGE',
        content: info.srcUrl,
        mediaUrl: info.srcUrl,
        title: extractFilenameFromUrl(info.srcUrl) || 'Saved Image',
        requiresProcessing: true, // May need OCR
        ocrEnabled: true
      };

    case MENU_IDS.SAVE_VIDEO:
      const isYoutube = info.pageUrl?.includes('youtube.com') || info.srcUrl?.includes('youtube.com');
      return {
        ...baseData,
        type: 'VIDEO',
        nodeType: 'VIDEO',
        content: info.srcUrl || info.pageUrl,
        mediaUrl: info.srcUrl,
        title: tab.title || 'Saved Video',
        requiresProcessing: true,
        isYoutube,
        extractTranscript: isYoutube
      };

    case MENU_IDS.SAVE_LINK:
      return {
        ...baseData,
        type: 'LINK',
        nodeType: 'LINK',
        content: info.linkUrl,
        url: info.linkUrl,
        title: info.linkUrl,
        requiresProcessing: true, // Will scrape metadata
        scrapeContent: true
      };

    case MENU_IDS.SAVE_PAGE:
      return {
        ...baseData,
        type: 'PAGE',
        nodeType: 'ARTICLE',
        content: tab.url,
        url: tab.url,
        title: tab.title,
        requiresProcessing: true,
        scrapeContent: true,
        fullPage: true
      };

    case MENU_IDS.EXTRACT_PAGE:
      // Inject content script to extract full page content
      const pageContent = await extractPageContent(tab.id);
      return {
        ...baseData,
        type: 'ARTICLE',
        nodeType: 'ARTICLE',
        content: pageContent.text,
        html: pageContent.html,
        url: tab.url,
        title: tab.title,
        metadata: pageContent.metadata,
        requiresProcessing: true,
        scrapeContent: false, // Already extracted
        aiAnalysis: true
      };

    default:
      throw new Error('Unknown menu item');
  }
}

// Extract full page content using content script
async function extractPageContent(tabId) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        // Extract main content
        const article = document.querySelector('article') || document.querySelector('main') || document.body;
        
        // Get metadata
        const getMetaContent = (name) => {
          const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"], meta[property="og:${name}"]`);
          return meta ? meta.content : null;
        };

        // Extract headings for structure
        const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => ({
          level: h.tagName,
          text: h.textContent.trim()
        }));

        // Extract images with alt text
        const images = Array.from(document.querySelectorAll('img')).slice(0, 10).map(img => ({
          src: img.src,
          alt: img.alt
        }));

        // Extract links
        const links = Array.from(document.querySelectorAll('a[href]')).slice(0, 20).map(a => ({
          url: a.href,
          text: a.textContent.trim()
        }));

        return {
          text: article.innerText.substring(0, 10000), // Limit to 10k chars
          html: article.innerHTML.substring(0, 50000),
          metadata: {
            title: document.title,
            description: getMetaContent('description'),
            author: getMetaContent('author'),
            published: getMetaContent('article:published_time') || getMetaContent('datePublished'),
            keywords: getMetaContent('keywords'),
            headings,
            images,
            links
          }
        };
      }
    });

    return results[0].result;
  } catch (error) {
    console.error('Error extracting page content:', error);
    return {
      text: '',
      html: '',
      metadata: {}
    };
  }
}

// Utility: Extract filename from URL
function extractFilenameFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
    return decodeURIComponent(filename);
  } catch {
    return null;
  }
}

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPendingCapture') {
    chrome.storage.local.get(['pendingCapture', 'captureTimestamp'], (result) => {
      // Clear pending capture if older than 5 minutes
      if (result.captureTimestamp && Date.now() - result.captureTimestamp > 5 * 60 * 1000) {
        chrome.storage.local.remove(['pendingCapture', 'captureTimestamp']);
        sendResponse({ capture: null });
      } else {
        sendResponse({ capture: result.pendingCapture || null });
      }
    });
    return true; // Keep channel open for async response
  }

  if (request.action === 'clearPendingCapture') {
    chrome.storage.local.remove(['pendingCapture', 'captureTimestamp'], () => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === 'scrapeUrl') {
    // Handle URL scraping request
    fetch(request.url)
      .then(res => res.text())
      .then(html => {
        sendResponse({ html, success: true });
      })
      .catch(err => {
        sendResponse({ success: false, error: err.message });
      });
    return true;
  }
});

// Listen for tab updates to detect YouTube videos
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    if (tab.url.includes('youtube.com/watch')) {
      // Could show a badge or notification that content is capturable
      chrome.action.setBadgeText({ text: '📺', tabId });
      chrome.action.setBadgeBackgroundColor({ color: '#FF0000', tabId });
    }
  }
});

console.log('Spaces background service worker initialized!');
