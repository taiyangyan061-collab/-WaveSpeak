# WaveSpeak PRODUCT ARCHITECTURE v17

This is the first modular product version.

## Upload
Upload the complete project, including:
- `src/`
- `api/`
- `docs/`
- `index.html`
- all JSON files
- the existing `audio/` folder

## Required Vercel environment variable
`OPENAI_API_KEY`

The key belongs in Vercel Settings → Environment Variables. Do not put it in GitHub.

## Product structure
- UI and styles are separate
- AI Voice is a core service
- navigation is a core service
- storage is a core service
- learning content is separate from application logic
- the TTS endpoint remains server-side

See `docs/ARCHITECTURE.md`.
Confirm deployment by checking for `PRODUCT ARCHITECTURE v17`.
