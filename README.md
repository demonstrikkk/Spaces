# 🚀 Spaces - Your AI-Powered Knowledge Universe

**The ultimate browser extension and web app for capturing, organizing, and connecting your digital knowledge with the power of Gemini AI.**

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)
![Status](https://img.shields.io/badge/status-production-success)

---

## ✨ Features

### 🎯 **Smart Capture**
- **Right-click context menu** - Capture text, images, videos, links instantly
- **YouTube transcripts** - Automatically extract video subtitles  
- **OCR text extraction** - Pull text from any image
- **Web scraping** - Parse metadata from any website
- **Quick save** - One-click save from toolbar popup

### 🤖 **AI-Powered Organization**
- **Gemini 2.5 Flash integration** - Smart summarization and tagging
- **Auto-categorization** - Content analyzed and organized automatically
- **Entity extraction** - People, places, topics identified
- **Related content** - AI suggests connections between nodes

### 🌌 **Beautiful UI**
- **Glassmorphism design** - Modern, elegant interface
- **Smooth animations** - Framer Motion powered transitions
- **Dark mode optimized** - Easy on the eyes
- **Responsive** - Works on all screen sizes
- **Custom icons** - Personalize your spaces

### 📊 **Multiple Views**
- **Card view** - Traditional grid layout for browsing
- **Graph view** - Visual knowledge connections (D3.js)
- **AI chat** - Ask questions about your content
- **Search & filter** - Find anything instantly

### ☁️ **Cloud Sync**
- **Supabase backend** - Real-time sync across devices
- **Local-first architecture** - Works offline, syncs when online
- **Fast & reliable** - Optimized for speed and performance

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **Google Chrome** (or any Chromium browser)
- **Gemini API Key** ([Get one free](https://ai.google.dev/))
- **Supabase Account** (optional, [Sign up](https://supabase.com))

### Installation

1. **Clone & Install**
   ```bash
   git clone <your-repo-url>
   cd spaces
   npm install
   ```

2. **Configure Environment**
   
   Create a `.env` file in the project root:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Setup Supabase Database**
   
   - Go to your [Supabase Dashboard](https://app.supabase.com)
   - Open SQL Editor
   - Copy and paste the contents of `supabase_schema.sql`
   - Click "Run" to create all tables

4. **Build Everything**
   ```bash
   npm run build
   ```

5. **Load Extension in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `dist/` folder from your project

6. **Run Web App** (optional)
   ```bash
   npm run dev
   ```
   Visit `http://localhost:5173`

---

## 🎨 Usage

### Extension

1. **Right-click anywhere** on any webpage
2. Choose from 6 capture options:
   - 📝 Capture Selected Text
   - 🖼️ Capture Image
   - 🎥 Capture Video
   - 🔗 Capture Link
   - 📄 Capture Full Page
   - ✂️ Extract Text from Image (OCR)

3. **Review the preview** in the popup
4. **Select a space** to save it to
5. **Done!** Content is processed by AI and saved

### Web Dashboard

1. **Create spaces** - Organize content by topic
2. **Browse cards** - See all your captured content
3. **Use graph view** - Visualize connections
4. **Chat with AI** - Ask questions about your knowledge
5. **Search & filter** - Find anything quickly

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 19, TypeScript 5.8, Vite 6 |
| **Styling** | Tailwind CSS 4, Framer Motion |
| **AI** | Google Gemini 2.5 Flash |
| **Database** | Supabase (PostgreSQL) |
| **Extension** | Chrome Manifest V3 |
| **Charts** | D3.js |
| **ML/Vision** | Tesseract.js (OCR) |

---

## 📁 Project Structure

```
spaces/
├── components/          # React components
│   ├── SpaceDeck.tsx   # Space viewer modal
│   ├── ContentCard.tsx # Content item cards
│   ├── AIChat.tsx      # AI chat interface
│   ├── GraphView.tsx   # Knowledge graph
│   └── ...
├── extension/          # Chrome extension files
│   ├── manifest.json   # Extension manifest
│   ├── popup.tsx       # Extension popup
│   ├── background.js   # Service worker
│   └── icon.svg        # Extension icon
├── services/           # Business logic
│   ├── dataService.ts  # Storage abstraction
│   ├── geminiService.ts # AI integration
│   ├── supabaseClient.ts # Database client
│   ├── contentScraperService.ts # Web scraping
│   ├── youtubeTranscriptService.ts # Video captions
│   ├── ocrService.ts   # Image text extraction
│   ├── aiAnalysisService.ts # Content analysis
│   └── contentProcessorService.ts # Processing orchestration
├── utils/              # Helpers
│   └── env.ts          # Environment variables
├── App.tsx             # Main React app
├── types.ts            # TypeScript definitions
├── index.css           # Global styles
├── supabase_schema.sql # Database schema
└── README.md           # This file
```

---

## ⚙️ Configuration

### Gemini AI
Get your API key from [Google AI Studio](https://ai.google.dev/) and add it to `.env`:
```env
VITE_GEMINI_API_KEY=your_key_here
```

### Supabase (Optional)
For cloud sync:
1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `supabase_schema.sql`
3. Add credentials to `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Local-Only Mode
The app works perfectly without Supabase! Just leave those env variables empty and everything will save to localStorage/Chrome storage.

---

## 🐛 Troubleshooting

### Extension doesn't load
- Make sure you built the project: `npm run build`
- Load the `dist/` folder, not the project root
- Check for errors in `chrome://extensions/`

### Can't save content
- Check browser console for errors
- Verify API keys in `.env`
- Make sure Supabase tables are created
- Try creating a space first

### AI features not working
- Verify `VITE_GEMINI_API_KEY` is set correctly
- Check your API quota at [Google AI Studio](https://ai.google.dev/)
- Restart the dev server after changing `.env`

### Database errors
- Run the full `supabase_schema.sql` script
- Check Supabase dashboard for table creation
- Verify RLS policies are disabled (or configured)

---

## 🚀 Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Making Changes

1. **Extension popup** - Edit `extension/popup.tsx`
2. **Main app** - Edit `App.tsx` and `components/`
3. **Services** - Edit files in `services/`
4. **Styles** - Edit `index.css`

After changes, rebuild:
```bash
npm run build
```

Then reload the extension in Chrome.

---

## 📝 Database Schema

The `supabase_schema.sql` file includes:
- ✅ Drop existing tables (clean slate)
- ✅ 4 core tables (spaces, nodes, tags, node_tags)
- ✅ Full-text search with tsvector
- ✅ Indexes for performance
- ✅ Triggers for auto-updates
- ✅ No authentication required (RLS disabled)

Just run it once in Supabase SQL Editor and you're done!

---

## 🎯 Roadmap

- [ ] Browser extension for Firefox & Edge
- [ ] Mobile apps (React Native)
- [ ] Collaborative spaces
- [ ] PDF parsing
- [ ] Twitter/X integration
- [ ] Notion export
- [ ] Obsidian sync
- [ ] Chrome sync storage
- [ ] Keyboard shortcuts
- [ ] Bulk import/export

---

## 📄 License

MIT License - feel free to use this for anything!

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 💬 Support

Having issues? Found a bug? Want a feature?
- Open an issue on GitHub
- Check existing issues first
- Include error messages and screenshots

---

## 🌟 Credits

Built with:
- React & TypeScript
- Gemini AI by Google
- Supabase
- Tailwind CSS
- Framer Motion
- D3.js
- Tesseract.js
- And lots of ☕

---

**Made with ❤️ for knowledge workers everywhere.**

*"Your second brain, powered by AI."*
