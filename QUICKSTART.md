# ⚡ QUICK START - Get Running in 5 Minutes!

## 🎯 The Absolute Fastest Way to Start

### Step 1: Install Dependencies (1 min)
```bash
npm install
```

### Step 2: Configure (1 min)
Edit `.env` file:
```env
VITE_GEMINI_API_KEY=your_gemini_key_here
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_key_here
```

**Don't have keys?** Get them:
- Gemini: https://ai.google.dev/ (FREE)
- Supabase: https://supabase.com (FREE tier)

**Or skip Supabase** - works perfectly in local mode!

### Step 3: Setup Database (2 min)
1. Go to Supabase SQL Editor
2. Copy `supabase_schema.sql`
3. Paste and click "Run"
4. Done! ✅

**Or skip this** - local mode works without database!

### Step 4: Build (1 min)
```bash
npm run build
```

Wait for: `✅ Extension files copied to dist/`

### Step 5: Load Extension (30 sec)
1. Open: `chrome://extensions/`
2. Toggle "Developer mode" ON
3. Click "Load unpacked"
4. Select the `dist` folder
5. Done! 🎉

### Step 6: Test It! (30 sec)
1. Click the Spaces icon in toolbar
2. Create a new space
3. Go to any website
4. Select some text
5. Right-click → "Save to Spaces 📝"
6. Magic! ✨

---

## 🚀 That's It!

You're now running a production-ready, AI-powered knowledge management system!

---

## 💡 Quick Tips

### Use Context Menu (Best Way)
- Select text → Right-click → "Save to Spaces"
- Right-click image → "Save Image to Spaces"
- Right-click video → "Save Video to Spaces"
- Right-click link → "Save Link to Spaces"

### Use Popup (Quick Way)
- Click extension icon
- Click any space
- Current page saved instantly

### Use Web Dashboard (Power User)
```bash
npm run dev
```
Visit: http://localhost:5173

---

## 🐛 Troubleshooting

### "Extension won't load"
- Did you run `npm run build`?
- Loading `dist` folder (not project root)?
- Check chrome://extensions for errors

### "Can't save content"
- Check browser console (F12)
- Verify API keys in `.env`
- Try local mode (remove Supabase keys)

### "Database errors"
- Run the FULL SQL schema
- Check all 4 tables exist in Supabase

---

## 📚 More Help?

- 📖 **Full Guide**: Read `INSTALLATION.md`
- ✨ **Features**: Check `FEATURES.md`  
- 📄 **Overview**: See `README.md`
- ✅ **Complete Info**: Read `COMPLETE.md`

---

## 🎉 Enjoy Your New Second Brain!

**Start capturing knowledge like a pro! 🧠✨**

Made with ❤️ and lots of ☕
