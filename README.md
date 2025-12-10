# Spaces - AI Second Brain 🧠

**Spaces** is a powerful next-generation "Second Brain" application that combines a Chrome Extension with a modern React Web Dashboard. It allows you to capture ideas, links, and selections from around the web, organize them into "Spaces", and use Google Gemini AI to analyze and chat with your knowledge base.

## ✨ Features
- **Chrome Extension**: Quick-save text selections, links, and pages directly from your browser.
- **Unified Dashboard**: A beautiful, glassmorphic UI to manage your knowledge graph.
- **AI-Powered**: Auto-tagging and summarization using Google Gemini 2.0.
- **RAG Chat**: Chat with your saved content to generate new insights.
- **Knowledge Graph**: Visual force-directed graph of your ideas.
- **Live Sync**: Seamless synchronization between the Extension and the Dashboard.
- **Local & Cloud**: Works 100% offline with local storage, or syncs to the cloud via Supabase (optional).

---

## 🚀 Installation & Setup

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **Google Chrome** (or Chromium-based browser)

### 2. Build the Project
Open your terminal in the project folder and run:

```bash
# Install dependencies
npm install

# Build the application and extension
npm run build
```

This will create a `dist` folder containing the compiled Web App and Chrome Extension.

### 3. Install the Extension
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Toggle **Developer mode** in the top-right corner.
3. Click **Load unpacked** (top-left).
4. Select the `dist` folder generated in the previous step (`.../spaces/dist`).

---

## 🖥️ Usage Guide

### Opening the Dashboard (Important!)
For the **best experience** and to ensure your data syncs correctly between the extension and the app:
1. Click the **Spaces Icon** (⚡) in your Chrome toolbar.
2. Click the **"Open Full App"** icon (External Link arrow on the top right of the popup).

> **Note:** You can run `npm run dev` to develop the UI locally at `http://localhost:5173`, but data saved via the Extension **will not appear** there because they use separate storage systems. Use the "Open Full App" method for actual usage.

### Capturing Content
- **Right-Click**: Select any text on a webpage, right-click, and choose **"Save to Space"**.
- **Quick Save**: Click the extension icon and hit the "Save" button to capture the current page URL.

### AI Features (Chat & Auto-Tagging)
To enable AI features:
1. Open the Dashboard.
2. Click the **Settings (Gear)** icon in the top right.
3. Enter your **Google Gemini API Key**. (Get one from [Google AI Studio](https://aistudio.google.com/)).
4. The key is stored locally in your browser.

---

## ☁️ Cloud Sync (Optional)
By default, Spaces runs 100% locally. To enable cloud sync across devices:
1. Create a project on [Supabase](https://supabase.com/).
2. Run the SQL in `supabase_schema.sql` in your Supabase SQL Editor.
3. In the Spaces Dashboard Settings, enter your **Supabase URL** and **Anon Key**.

---

## 🛠️ Development
If you want to modify the code:
- **Web App**: Edit files in `src` or `components`. Run `npm run dev` for hot-reloading (UI only).
- **Extension**: Edit files in `extension`.
- **Rebuild**: After making changes to the extension, you **MUST** run `npm run build` and then click the **Refresh** icon on the card in `chrome://extensions/`.

## ❓ Troubleshooting
- **"It doesn't save!"**: Make sure you have refreshed the extension in `chrome://extensions` after building.
- **"I don't see my data"**: Ensure you opened the dashboard via the Extension Popup, not `localhost`.
- **"Script error"**: The extension cannot capture content from restricted Chrome pages (like `chrome://` or the Web Store). Try a normal website.
