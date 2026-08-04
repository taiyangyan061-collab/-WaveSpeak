# WaveSpeak Product Architecture v17

## Layers

### 1. Presentation
- `index.html`
- `src/styles/app.css`

### 2. Application
- `src/app.js`
- Coordinates modules and renders learning screens.

### 3. Core services
- `src/core/audio.js` — AI Voice and browser fallback
- `src/core/router.js` — screen navigation
- `src/core/storage.js` — local persistence
- `src/core/browser.js` — browser capability messaging

### 4. Content
- `src/data/seed-content.json`
- `src/data/creative-lab.js`
- `content-catalog.json`
- `topic-index.json`

### 5. Server
- `api/tts.js`
- Reads `OPENAI_API_KEY` only from Vercel environment variables.

## Rules for future development
1. Do not put new features directly inside `index.html`.
2. New learning features receive their own file under `src/modules/`.
3. Shared browser/audio/storage behavior belongs under `src/core/`.
4. Learning content belongs under `src/data/` or a future database.
5. The API key must never be committed to GitHub.
6. Before release, run JavaScript syntax checks and preserve all existing navigation targets.
