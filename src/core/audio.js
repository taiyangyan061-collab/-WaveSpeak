const audioCache = new Map();
let activeAudio = null;
let activeUtterance = null;

function instructionsFor(style, rate) {
  const speed = rate <= 0.75
    ? "Speak slowly, with clear pauses between natural thought groups."
    : rate >= 1
      ? "Speak at a brisk but natural conversational pace."
      : "Speak at a natural conversational pace.";

  const styles = {
    natural: "Use natural American English pronunciation, realistic stress, linking, rhythm, and intonation.",
    slow: "Use a patient teaching voice. Keep pronunciation natural rather than robotic, and make chunks easy to hear.",
    expressive: "Sound conversational and expressive, with believable emotional movement and varied intonation.",
    professional: "Use clear, confident American English suitable for a critique, presentation, or professional conversation."
  };
  return `${styles[style] || styles.natural} ${speed}`;
}

async function requestSpeech({ text, voice, style, rate }) {
  const cacheKey = JSON.stringify([text, voice, style, rate]);
  if (audioCache.has(cacheKey)) return audioCache.get(cacheKey);

  const response = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: String(text),
      voice,
      instructions: instructionsFor(style, rate)
    })
  });

  if (!response.ok) {
    let message = "AI Voice request failed.";
    try {
      const body = await response.json();
      if (body.error) message = body.error;
    } catch {}
    throw new Error(message);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  audioCache.set(cacheKey, url);
  return url;
}

function browserSpeak(text, rate, onStatus) {
  return new Promise((resolve, reject) => {
    if (!("speechSynthesis" in window)) {
      reject(new Error("Browser speech is unavailable."));
      return;
    }

    try {
      activeUtterance = new SpeechSynthesisUtterance(String(text));
      activeUtterance.lang = "en-US";
      activeUtterance.rate = Number.isFinite(rate) ? rate : 0.88;
      activeUtterance.volume = 1;
      activeUtterance.pitch = 1;
      activeUtterance.onstart = () => onStatus("Playing Browser Voice…");
      activeUtterance.onend = () => {
        activeUtterance = null;
        resolve();
      };
      activeUtterance.onerror = event => {
        const code = event?.error || "unknown";
        activeUtterance = null;
        reject(new Error(`Browser Voice failed: ${code}`));
      };
      window.speechSynthesis.speak(activeUtterance);
    } catch (error) {
      reject(error);
    }
  });
}

export function createVoiceService({
  getEngine,
  getVoice,
  getStyle,
  onStatus,
  onAIStatus
}) {
  async function playAI(text, rate) {
    const url = await requestSpeech({
      text,
      voice: getVoice() || "marin",
      style: getStyle() || "natural",
      rate
    });

    if (activeAudio) {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    }

    activeAudio = new Audio(url);
    await new Promise((resolve, reject) => {
      activeAudio.onplay = () => {
        onStatus("Playing AI Voice…");
        onAIStatus("AI-generated model voice is playing.");
      };
      activeAudio.onended = resolve;
      activeAudio.onerror = () => reject(new Error("Generated audio could not be played."));
      activeAudio.play().catch(reject);
    });
  }

  async function play(text, rate = 0.88) {
    const engine = getEngine() || "browser";
    try {
      if (engine === "ai") {
        onStatus("Generating AI Voice…");
        await playAI(text, rate);
      } else {
        await browserSpeak(text, rate, onStatus);
      }
      onStatus("Now shadow the sentence and record yourself.");
      onAIStatus("Ready.");
    } catch (error) {
      onStatus(error.message);
      if (engine === "ai") {
        onAIStatus("AI Voice unavailable. Falling back to Browser Voice.");
        try {
          await browserSpeak(text, rate, onStatus);
          onStatus("Now shadow the sentence and record yourself.");
        } catch (fallbackError) {
          onStatus(fallbackError.message);
        }
      }
    }
  }

  async function playSequence(parts, rate = 0.78) {
    onStatus("Playing phrase by phrase…");
    for (const part of parts) {
      await play(part, rate);
      await new Promise(resolve => setTimeout(resolve, 250));
    }
    onStatus("Phrase playback complete. Record the full sentence.");
  }

  async function checkAIAvailability() {
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "WaveSpeak voice test.",
          voice: getVoice() || "marin",
          instructions: "Speak clearly and naturally."
        })
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  return { play, playSequence, checkAIAvailability };
}
