export function createDayBoundaryService({
  getDateKey,
  onDayChanged,
  checkIntervalMs = 30000
}) {
  let currentDateKey = getDateKey();
  let intervalId = null;
  let midnightTimeoutId = null;

  function millisecondsUntilNextLocalMidnight() {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 2, 0);
    return Math.max(1000, next.getTime() - now.getTime());
  }

  function check(reason = "periodic") {
    const nextDateKey = getDateKey();
    if (nextDateKey === currentDateKey) return false;
    const previousDateKey = currentDateKey;
    currentDateKey = nextDateKey;
    onDayChanged?.({ previousDateKey, currentDateKey, reason });
    scheduleMidnightCheck();
    return true;
  }

  function scheduleMidnightCheck() {
    if (midnightTimeoutId) clearTimeout(midnightTimeoutId);
    midnightTimeoutId = setTimeout(() => {
      check("midnight");
      scheduleMidnightCheck();
    }, millisecondsUntilNextLocalMidnight());
  }

  function handleVisibility() {
    if (!document.hidden) check("visibility");
  }

  function handleFocus() {
    check("focus");
  }

  function handlePageShow() {
    check("pageshow");
  }

  function start() {
    stop();
    currentDateKey = getDateKey();
    intervalId = setInterval(() => check("interval"), checkIntervalMs);
    scheduleMidnightCheck();
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("pageshow", handlePageShow);
  }

  function stop() {
    if (intervalId) clearInterval(intervalId);
    if (midnightTimeoutId) clearTimeout(midnightTimeoutId);
    intervalId = null;
    midnightTimeoutId = null;
    document.removeEventListener("visibilitychange", handleVisibility);
    window.removeEventListener("focus", handleFocus);
    window.removeEventListener("pageshow", handlePageShow);
  }

  return { start, stop, check, getCurrentDateKey: () => currentDateKey };
}
