const audioCache = new Map();
let activeAudio = null;
let activeUtterance = null;

function nativeFallback(text, rate, onStatus) {
  if (!("speechSynthesis" in window)) {
    onStatus("AI Voice failed, and browser speech is unavailable.");
    return;
  }
  try {
    activeUtterance = new SpeechSynthesisUtterance(String(text));
    activeUtterance.lang = "en-US";
    activeUtterance.rate = Number.isFinite(rate) ? rate : 0.88;
    activeUtterance.volume = 1;
    activeUtterance.pitch = 1;
    activeUtterance.onstart = () => onStatus("Using browser voice fallback…");
    activeUtterance.onend = () => {
      onStatus("Now shadow the sentence and record yourself.");
      activeUtterance = null;
    };
    activeUtterance.onerror = () => {
      onStatus("Both AI Voice and browser voice failed.");
      activeUtterance = null;
    };
    window.speechSynthesis.speak(activeUtterance);
  } catch {
    onStatus("Voice playback is unavailable.");
  }
}

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

export function createVoiceService({ getVoice, getStyle, onStatus, onAIStatus }) {
  async function play(text, rate = 0.88) {
    try {
      onStatus("Generating AI Voice…");
      onAIStatus("Generating natural model speech…");
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
      activeAudio.onplay = () => {
        onStatus("Playing AI model voice…");
        onAIStatus("AI-generated model voice is playing.");
      };
      activeAudio.onended = () => {
        onStatus("Now shadow the sentence and record yourself.");
        onAIStatus("Ready.");
      };
      activeAudio.onerror = () => {
        throw new Error("The generated audio could not be played.");
      };
      await activeAudio.play();
    } catch (error) {
      onAIStatus(`AI Voice unavailable: ${error.message}. Using browser fallback.`);
      nativeFallback(text, rate, onStatus);
    }
  }

  async function playSequence(parts, rate = 0.78) {
    onStatus("Preparing phrase-by-phrase AI Voice…");
    for (const part of parts) {
      try {
        const url = await requestSpeech({
          text: part,
          voice: getVoice() || "marin",
          style: getStyle() || "natural",
          rate
        });
        await new Promise(resolve => {
          if (activeAudio) {
            activeAudio.pause();
            activeAudio.currentTime = 0;
          }
          activeAudio = new Audio(url);
          activeAudio.onended = () => setTimeout(resolve, 300);
          activeAudio.onerror = resolve;
          activeAudio.play().catch(resolve);
        });
      } catch {
        nativeFallback(part, rate, onStatus);
        await new Promise(resolve => setTimeout(resolve, 1600));
      }
    }
    onStatus("Phrase playback complete. Record the full sentence.");
  }

  return { play, playSequence };
}
