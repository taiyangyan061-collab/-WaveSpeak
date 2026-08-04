export function detectBrowser() {
  const ua = navigator.userAgent;
  const isChrome = /Chrome|CriOS/.test(ua) && !/Edg|OPR/.test(ua);
  const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|Edg|OPR/.test(ua);
  const isMac = /Macintosh|Mac OS X/.test(ua);
  const isMobile = /iPhone|iPad|Android/i.test(ua);
  return { isChrome, isSafari, isMac, isMobile };
}

export function mountBrowserCompatibility({ banner, title, text, dismiss, storageKey }) {
  const browser = detectBrowser();
  if (!banner || localStorage.getItem(storageKey) === "1") return;

  if (browser.isMac && browser.isChrome) {
    banner.className = "compatBanner show chrome";
    title.textContent = "Chrome detected on Mac";
    text.textContent = "AI Voice uses server-generated audio and should work across browsers. Browser speech is only a fallback.";
  } else if (browser.isMac && browser.isSafari) {
    banner.className = "compatBanner show safari";
    title.textContent = "Safari detected";
    text.textContent = "AI Voice and recording are available here.";
  } else {
    banner.className = "compatBanner show";
    title.textContent = "Browser compatibility";
    text.textContent = "WaveSpeak uses server-generated AI Voice for consistent playback across supported browsers.";
  }

  dismiss?.addEventListener("click", () => {
    banner.classList.remove("show");
    localStorage.setItem(storageKey, "1");
  });
}
