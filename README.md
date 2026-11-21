# 🌌 PaperVerse — Travel Through Your Research

> **An award-level AI research assistant & 3D cosmic explorer powered by the Google Gemini API.**  
> *Tagline: "Travel through your research"*

PaperVerse is a college project designed to transform dense scientific literature reviews into an engaging, visual, and highly efficient workflow. It combines **client-side PDF parsing**, **Google Gemini 2.5 generative intelligence**, and an **interactive 3D Catmull-Rom cosmic flight** rendered with Three.js and React Three Fiber.

---

## 🚀 Key Highlights & Features

1. **Cinematic 3D Opening Journey**:
   - Animated progress counter & logo reveal with magnetic "Enter the Verse" button.
   - Smooth 3D camera flight along a Catmull-Rom spline through **6 interactive stations**:
     - **Station 1 "Upload"**: Floating glass paper sheets drifting in a starfield.
     - **Station 2 "Compare"**: A glowing 3D table grid assembling itself.
     - **Station 3 "Summarize"**: A big sheet folding down into a small glowing crystal.
     - **Station 4 "Chat"**: Floating chat bubbles orbiting a pulsing orb.
     - **Station 5 "Generate"**: Rotating wireframe shape morphing into title & abstract.
     - **Station 6 "Study"**: Flip-card style cubes showing quiz questions.
   - Pinned **Skip Intro** button and real-time station progress indicator.

2. **Literature Review Comparison (Main Feature)**:
   - Ingest 2–3 research paper PDFs or pasted abstracts.
   - Generates a side-by-side comparison table (Problem, Methodology, Benchmark, Results, Limitations).
   - Formulates a 60–100 word synthesized **Research Gap**.
   - **Download CSV** with UTF-8 Byte Order Mark (`\uFEFF`) for clean opening in Microsoft Excel.

3. **Paper Summarizer**:
   - Plain-English breakdown of complex PDFs (Problem, Method, Dataset, Results, Limitations).
   - Extracts **5 Core Takeaways** for instant comprehension.

4. **Chat with Paper (Strict Grounding)**:
   - Zero-hallucination interactive chat.
   - If an answer is not verifiable in the document, it replies strictly:  
     `"This is not mentioned in the paper"`.

5. **Title, Abstract & Keyword Generator**:
   - Converts a 2–3 line thesis idea into 3 candidate titles, an IEEE-standard 150–200 word abstract, 5 indexed keywords, objectives, and future scope.

6. **Study Buddy & Interactive Quiz**:
   - Turns notes or papers into 5–6 bullet summaries, 3 key definitions, and **5 interactive multiple-choice questions** with immediate feedback and celebratory confetti.

7. **Key Manager & Multi-Key Failover**:
   - Add up to 3 of your own Gemini API keys.
   - **Memory-only security**: Keys live strictly in React state; never saved to `localStorage`, files, URLs, or console.
   - **Automatic Failover**: If an invalid or expired key fails, it switches to backup key #2 and alerts you via toast.
   - **429 Quota Backoff**: Automatically waits 5 seconds and retries once, then gracefully falls back to `gemini-2.5-flash-lite`.

8. **Performance & Lite Mode**:
   - Cap pixel ratio at 2 for 60fps smoothness.
   - Instant "Lite Mode" toggle that disables 3D canvas and postprocessing for low-power devices.
   - Auto-activates Lite Mode on mobile screens (< 768px) and respects `prefers-reduced-motion`.

---

## 📂 Project Structure (Explained for First-Year Students)

```
paperverse/
├── index.html                   # HTML entry point with Space Grotesk & Inter fonts and noise filter
├── package.json                 # Project dependencies & scripts
├── vite.config.js               # Vite build configuration & chunk optimizations
├── tailwind.config.js           # "Neon deep space" theme tokens (#05050F, violet, cyan, pink)
├── vercel.json                  # Single-page app routing rewrites for production deployment
├── src/
│   ├── main.jsx                 # React root mounting point with ErrorBoundary
│   ├── App.jsx                  # Main coordinator: manages Journey stage, in-memory keys, and layout
│   ├── components/
│   │   ├── Navbar.jsx           # Top navigation bar, status chip (Key & Model), Lite mode toggle
│   │   ├── Dashboard.jsx        # Tabbed workspace hosting the 5 AI tools
│   │   ├── IntroGate.jsx        # Cinematic loading counter and "Enter the Verse" button
│   │   ├── JourneyOverlay.jsx   # 6-station scroll sections, captions, and Skip Intro HUD
│   │   ├── ApiKeyModal.jsx      # Key Manager (up to 3 keys, verification ping, Forget keys)
│   │   ├── SettingsModal.jsx    # Model selector (gemini-2.5-flash, flash-lite, or custom)
│   │   ├── CustomCursor.jsx     # Glowing neon follower cursor with interactive hover expansion
│   │   ├── InfiniteMarquee.jsx  # Continuous cosmic ticker of PaperVerse capabilities
│   │   ├── MagneticButton.jsx   # Springy physics-based cursor attraction button
│   │   ├── ScrambleText.jsx     # Cyberpunk text decoding animation component
│   │   └── ErrorBoundary.jsx    # Prevents white-screen crashes with friendly recovery card
│   ├── lib/
│   │   ├── gemini.js            # Gemini API client, multi-key failover, 429 retry, safe JSON parser
│   │   ├── pdf.js               # Browser-side PDF text extraction using pdfjs-dist (?url worker)
│   │   └── csv.js               # Comparison matrix exporter with Excel BOM (\uFEFF)
│   ├── three/
│   │   ├── SceneCanvas.jsx      # Fullscreen R3F Canvas with Bloom postprocessing & fog
│   │   ├── CameraFlight.jsx     # CatmullRomCurve3 spline flight driven by scroll & mouse parallax
│   │   ├── Stations.jsx         # The 6 distinct 3D visual models for each research station
│   │   └── CosmicStarfield.jsx  # 2,400 particle starfield with subtle drift
│   └── styles/
│       └── globals.css          # Glassmorphism utilities, neon gradients, and custom scrollbar
```

---

## 💻 Step-by-Step Windows Setup Instructions

### Prerequisites
- **Node.js LTS (v18 or higher)** installed on Windows. Download from [nodejs.org](https://nodejs.org).

### Step 1: Open Terminal in Project Folder
Open PowerShell or Command Prompt and navigate to the project directory:
```powershell
cd C:\Users\MOHAN\.gemini\antigravity\scratch\paperverse
```

### Step 2: Install Dependencies
```powershell
npm install
```

### Step 3: Start the Development Server
```powershell
npm run dev
```
You will see output similar to:
```
  VITE v5.4.11  ready in 450 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 4: Open in Your Browser
Open your browser and navigate to:
```
http://localhost:5173
```

1. Click **"Enter the Verse"** to experience the 3D cosmic journey, or click **"Skip Intro"** to go straight to the dashboard.
2. In the **Key Manager**, paste your free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
3. Try any of the 5 AI tools, or click **"Load Benchmark Sample"** in each tool to test instantly without uploading files!

---

## 🛠️ Production Build & Vercel Deployment

PaperVerse is a **pure frontend application** with zero serverless functions or environment variables needed:
```powershell
npm run build
npm run preview
```
- The production build is compiled to the `dist/` directory.
- Deploy directly to **Vercel**, **Netlify**, or **GitHub Pages** by connecting the repository.

---

## ❓ Troubleshooting Guide

1. **"Invalid Gemini API Key" error**:
   - Ensure you copied the full key starting with `AIzaSy...` from [Google AI Studio](https://aistudio.google.com).
   - Verify that your network has access to `generativelanguage.googleapis.com`.

2. **"429 Quota Exceeded" error**:
   - Google's free tier has per-minute request limits. PaperVerse automatically pauses 5 seconds and retries once, then attempts fallback to `gemini-2.5-flash-lite`.
   - You can also add up to 2 backup keys in the **Key Manager** for seamless failover!

3. **PDF shows "Almost no readable text"**:
   - Some PDFs are scanned image copies without OCR text layers. PaperVerse protects you by detecting this and prompting you to upload a searchable digital PDF.

4. **3D Lag or Low Framerate on older laptops**:
   - Click the **"Lite Mode"** toggle in the top navbar. This immediately switches off Three.js WebGL canvas and postprocessing bloom, dropping CPU/GPU usage to near zero.
