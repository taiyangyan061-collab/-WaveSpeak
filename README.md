# WaveSpeak AI VOICE v16

This version preserves the complete v15 learning app and adds cross-browser server-generated AI speech.

## New
- OpenAI `gpt-4o-mini-tts` through a Vercel serverless function
- Voices: Marin, Cedar, Coral, Nova
- Styles: natural, slow teaching, expressive, professional
- Speaking Listen and Phrase-by-Phrase use the same audio in Safari, Chrome, and mobile
- Browser speech remains a fallback
- Clear disclosure that model speech is AI-generated
- In-memory audio caching during each session

## Required Vercel setup
1. Open the WaveSpeak project in Vercel.
2. Go to Settings → Environment Variables.
3. Add:
   - Name: `OPENAI_API_KEY`
   - Value: your OpenAI API key
4. Apply it to Production, Preview, and Development as needed.
5. Redeploy the latest deployment.

Never place the API key in `index.html`, GitHub, or browser code.

Upload every project file, including the new `api/tts.js`.
Confirm deployment by checking for `AI VOICE v16`.
