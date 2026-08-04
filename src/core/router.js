export function createRouter({ screenSelector = ".screen", onNavigate } = {}) {
  function open(id) {
    document.querySelectorAll(screenSelector).forEach(screen => screen.classList.remove("active"));
    const target = document.getElementById(id);
    if (!target) return;
    target.classList.add("active");
    window.scrollTo(0, 0);
    onNavigate?.(id);
  }

  function mount() {
    document.querySelectorAll("[data-open]").forEach(button => {
      button.addEventListener("click", () => open(button.dataset.open));
    });
    document.querySelectorAll("[data-home]").forEach(button => {
      button.addEventListener("click", () => open("home"));
    });
  }

  return { open, mount };
}
