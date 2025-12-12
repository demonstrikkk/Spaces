# 🚀 COMPLETE INSTALLATION GUIDE

## Step-by-Step Setup for Spaces Extension

Follow this guide carefully to get Spaces up and running in under 5 minutes!

---

## ✅ Prerequisites (Check These First)

- [x] **Node.js 18+** installed ([Download](https://nodejs.org/))
- [x] **Google Chrome** or Chromium browser
- [x] **Gemini API Key** ([Get free key](https://ai.google.dev/))
- [x] **Supabase account** (optional, [Sign up](https://supabase.com))

---

## 📥 Step 1: Download & Install Dependencies

1. Open your terminal in the project folder

2. Install all packages:
   ```bash
   npm install
   ```
   
   This will install:
   - React 19 + TypeScript
   - Tailwind CSS 4
   - Gemini AI SDK
   - Supabase client
   - Framer Motion
   - D3.js + more

---

## 🔑 Step 2: Configure API Keys

### Option A: Using .env file (Recommended)

1. Create a file named `.env` in the project root

2. Add your credentials:
   ```env
   VITE_GEMINI_API_KEY=AIzaSy_your_actual_key_here
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

### Option B: Using the Settings Modal (Alternative)

You can also configure keys later in the app's settings modal after installation.

---

## 🗄️ Step 3: Setup Supabase Database

### Quick Setup:

1. **Log into Supabase**
   - Go to [app.supabase.com](https://app.supabase.com)
   - Create a new project (or use existing)

2. **Run the SQL Schema**
   - Click "SQL Editor" in the left sidebar
   - Create a new query
   - Open `supabase_schema.sql` from the project
   - Copy ALL contents
   - Paste into Supabase SQL Editor
   - Click **"Run"** button

3. **Verify Tables Created**
   - Click "Table Editor" in sidebar
   - You should see 4 tables:
     - ✅ `spaces`
     - ✅ `nodes`
     - ✅ `tags`
     - ✅ `node_tags`

4. **Get Your Credentials**
   - Go to Project Settings → API
   - Copy "Project URL" → This is your `SUPABASE_URL`
   - Copy "anon public" key → This is your `SUPABASE_ANON_KEY`

### Skip Supabase? (Local Mode)

No problem! The app works perfectly without Supabase:
- Just leave the env variables empty
- Everything saves to localStorage/Chrome storage
- No cloud sync, but fully functional

---

## 🔨 Step 4: Build the Extension

Run the build command:
```bash
npm run build
```

You should see:
```
✓ 2755 modules transformed.
✓ built in 5.10s
✅ Extension files copied to dist/
📦 Load the extension from the dist/ folder in Chrome
```

---

## 🧩 Step 5: Load Extension in Chrome

1. **Open Chrome Extensions**
   - Go to `chrome://extensions/`
   - Or click menu → More Tools → Extensions

2. **Enable Developer Mode**
   - Toggle switch in top-right corner

3. **Load the Extension**
   - Click "Load unpacked" button
   - Navigate to your project folder
   - Select the `dist` folder
   - Click "Select Folder"

4. **Verify Installation**
   - You should see "Spaces" extension card
   - Status should show "Enabled"
   - Pin it to toolbar (optional)

---

## 🎯 Step 6: Test the Extension

### Test 1: Open Popup
1. Click the Spaces icon in Chrome toolbar
2. You should see the beautiful popup UI
3. Try creating a space

### Test 2: Context Menu
1. Go to any website
2. Select some text
3. Right-click → "Save to Spaces 📝"
4. Choose a space to save to

### Test 3: Image Capture
1. Right-click on any image
2. Select "Save Image to Spaces 🖼️"
3. Check the popup preview

---

## 🌐 Step 7: Run Web Dashboard (Optional)

Want to use the web interface too?

```bash
npm run dev
```

Visit: `http://localhost:5173`

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Extension loads without errors
- [ ] Can create new spaces
- [ ] Can save current page to space
- [ ] Context menu shows 6 options
- [ ] Popup shows your spaces
- [ ] Settings modal opens
- [ ] Web dashboard loads (if running dev server)

---

## 🐛 Troubleshooting

### Extension Won't Load

**Error: "Manifest version 3 is required"**
- Make sure you built with `npm run build`
- Load the `dist` folder, not project root

**Error: "Failed to load extension"**
- Check Chrome version (must be 88+)
- Rebuild: `npm run build`
- Try removing and re-loading extension

### Can't Save Content

**Issue: "Failed to save" error**
- Open browser console (F12)
- Check for error messages
- Verify API keys are set correctly
- Try Settings modal → Re-enter keys → Save

**Issue: "Supabase 400 error"**
- Make sure you ran the FULL SQL schema
- Check all 4 tables exist
- Verify API URL and key are correct

### Context Menu Missing

**Issue: Right-click shows no Spaces options**
- Extension must be loaded and enabled
- Try reloading extension in chrome://extensions
- Check extension icon shows in toolbar
- Some pages block context menus (chrome://, file://)

### API Key Issues

**Issue: "Invalid API key" for Gemini**
- Get new key: https://ai.google.dev/
- Key should start with `AIzaSy`
- No quotes needed in .env file
- Restart dev server after changing .env

**Issue: "Unauthorized" for Supabase**
- Check anon key is correct (starts with `eyJ`)
- Verify project URL is correct
- RLS policies should be disabled for testing

---

## 🎨 First-Time Usage Guide

### Creating Your First Space

1. Click extension icon
2. Click "+ Create New Space"
3. Enter a name (e.g., "Research Notes")
4. Click "Create Space"

### Capturing Content

**Method 1: Quick Save Current Page**
1. Visit any webpage
2. Click extension icon
3. Click on a space
4. Done! Page saved

**Method 2: Context Menu (Best)**
1. Select text on any page
2. Right-click → "Save to Spaces 📝"
3. Choose destination space
4. Content is AI-analyzed automatically

**Method 3: Image/Video Capture**
1. Right-click on media
2. Choose appropriate save option
3. Select space

### Using the Web Dashboard

1. Run `npm run dev`
2. Open http://localhost:5173
3. Click on any space to view contents
4. Use tabs to switch between:
   - Cards (grid view)
   - Graph (visual connections)
   - Chat (AI Q&A)

---

## 📱 Browser Compatibility

| Browser | Status | Notes |
|---------|--------|-------|
| Chrome | ✅ Fully Supported | Recommended |
| Edge | ✅ Works | Chromium-based |
| Brave | ✅ Works | May need shields down |
| Opera | ✅ Works | Chromium-based |
| Firefox | ❌ Not yet | Manifest V3 differences |
| Safari | ❌ Not yet | Different extension system |

---

## 🔄 Updating the Extension

When you make changes:

1. Make your code edits
2. Rebuild:
   ```bash
   npm run build
   ```
3. Go to chrome://extensions
4. Click reload icon on Spaces extension
5. Test your changes

---

## 📊 Performance Notes

- **First load:** ~2-3 seconds (AI model loading)
- **Page capture:** Instant (local save) + 2-5s (AI analysis)
- **Extension size:** ~500 KB (optimized)
- **Memory usage:** ~30-50 MB
- **Supabase sync:** Real-time when online

---

## 🔒 Privacy & Security

- All API keys stored locally in your browser
- No data sent to our servers
- Supabase is YOUR own database
- Open source - audit the code yourself
- Can run 100% offline (without Supabase)

---

## 🆘 Getting Help

1. **Check console logs** (F12 → Console)
2. **Review this guide** again carefully
3. **Check GitHub issues** for similar problems
4. **Ask for help** by creating a new issue

---

## 🎉 You're All Set!

If you've completed all steps, you now have:
- ✅ A working Chrome extension
- ✅ AI-powered content capture
- ✅ Beautiful web dashboard (optional)
- ✅ Cloud sync (if configured)
- ✅ Production-ready setup

**Start capturing knowledge like a pro! 🚀**

---

## 📚 Next Steps

- Explore the context menu options
- Try the AI chat feature
- Visualize connections in graph view
- Customize spaces with icons/colors
- Share your feedback!

**Enjoy Spaces!** 🌟
