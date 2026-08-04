export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: "OPENAI_API_KEY is not configured in Vercel."
    });
  }

  const { text, voice = "marin", instructions = "" } = req.body || {};
  const allowedVoices = new Set(["marin", "cedar", "coral", "nova"]);

  if (typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "Text is required." });
  }
  if (text.length > 1500) {
    return res.status(400).json({ error: "Text is too long." });
  }
  if (!allowedVoices.has(voice)) {
    return res.status(400).json({ error: "Unsupported voice." });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice,
        input: text.trim(),
        instructions,
        response_format: "mp3"
      })
    });

    if (!response.ok) {
      let detail = `OpenAI TTS returned ${response.status}.`;
      try {
        const body = await response.json();
        detail = body?.error?.message || detail;
      } catch {}
      return res.status(response.status).json({ error: detail });
    }

    const audio = Buffer.from(await response.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "private, max-age=86400");
    return res.status(200).send(audio);
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "TTS generation failed."
    });
  }
}
