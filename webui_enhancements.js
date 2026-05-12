(() => {
  const MAX_SEED = 2147483647;

  function byId(id) {
    return document.getElementById(id);
  }

  function setupDarkMode() {
    if (byId("launcher-dark-toggle")) return;

    const DARK_CLASS = "launcher-dark";

    const style = document.createElement("style");
    style.id = "launcher-dark-style";
    style.textContent = [
      `.${DARK_CLASS} body,`,
      `.${DARK_CLASS} html {`,
      "  background:#111 !important;",
      "  color:#e8e8e8 !important;",
      "}",
      `.${DARK_CLASS} input,`,
      `.${DARK_CLASS} textarea,`,
      `.${DARK_CLASS} select {`,
      "  background:#1e1e1e !important;",
      "  color:#e8e8e8 !important;",
      "  border-color:#444 !important;",
      "}",
      `.${DARK_CLASS} button,`,
      `.${DARK_CLASS} [type=submit] {`,
      "  background:#2a2a2a !important;",
      "  color:#e8e8e8 !important;",
      "  border-color:#555 !important;",
      "}",
      `.${DARK_CLASS} label { color:#ccc !important; }`,
      `.${DARK_CLASS} a { color:#7ab4ff !important; }`,
      `.${DARK_CLASS} #launcher-download {`,
      "  background:#1e1e1e !important;",
      "  color:#e8e8e8 !important;",
      "  border-color:#555 !important;",
      "  box-shadow:0 8px 20px rgba(0,0,0,0.4) !important;",
      "}",
    ].join("\n");
    document.head.appendChild(style);

    const btn = document.createElement("button");
    btn.id = "launcher-dark-toggle";
    btn.title = "Toggle dark mode";
    btn.style.cssText = [
      "position:fixed",
      "top:12px",
      "right:12px",
      "z-index:9999",
      "padding:6px 10px",
      "border-radius:8px",
      "border:1px solid rgba(0,0,0,0.15)",
      "background:#fff",
      "color:#1d1d1f",
      "font-size:18px",
      "line-height:1",
      "cursor:pointer",
      "box-shadow:0 2px 8px rgba(0,0,0,0.12)",
      "transition:background 0.2s,color 0.2s"
    ].join(";");

    const applyDark = (dark) => {
      document.documentElement.classList.toggle(DARK_CLASS, dark);
      btn.textContent = dark ? "\u2600\uFE0F" : "\uD83C\uDF19";
      btn.style.background = dark ? "#2a2a2a" : "#fff";
      btn.style.color = dark ? "#e8e8e8" : "#1d1d1f";
      btn.style.borderColor = dark ? "#555" : "rgba(0,0,0,0.15)";
      try { localStorage.setItem("launcher-dark", dark ? "1" : "0"); } catch (_) {}
    };

    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    let stored = null;
    try { stored = localStorage.getItem("launcher-dark"); } catch (_) {}
    const initialDark = stored !== null ? stored === "1" : prefersDark;

    applyDark(initialDark);
    btn.addEventListener("click", () => applyDark(!document.documentElement.classList.contains(DARK_CLASS)));
    document.body.appendChild(btn);
  }

  function randomSeed() {
    if (globalThis.crypto && crypto.getRandomValues) {
      const values = new Uint32Array(1);
      crypto.getRandomValues(values);
      return (values[0] % MAX_SEED) + 1;
    }
    return Math.floor(Math.random() * MAX_SEED) + 1;
  }

  function timestamp() {
    return new Date().toISOString().replace(/\.\d+Z$/, "Z").replace(/[:.]/g, "-");
  }

  function setupRandomSeed() {
    const seed = byId("seed");
    const generate = byId("go");
    if (!seed || !generate || byId("launcher-random-seed")) return;

    const label = document.createElement("label");
    label.id = "launcher-random-seed-row";
    label.style.cssText = [
      "display:flex",
      "align-items:center",
      "gap:8px",
      "margin-top:8px",
      "font-size:14px",
      "color:#4b4b52",
      "user-select:none"
    ].join(";");

    const checkbox = document.createElement("input");
    checkbox.id = "launcher-random-seed";
    checkbox.type = "checkbox";
    checkbox.checked = true;
    checkbox.style.margin = "0";

    label.append(checkbox, document.createTextNode("Random seed"));
    seed.insertAdjacentElement("afterend", label);

    const applyRandomSeed = () => {
      if (checkbox.checked) seed.value = String(randomSeed());
    };

    checkbox.addEventListener("change", applyRandomSeed);
    generate.addEventListener("click", applyRandomSeed, true);
    applyRandomSeed();
  }

  function setupDownload() {
    const output = byId("out");
    const image = byId("img");
    if (!output || !image || byId("launcher-download")) return;

    const link = document.createElement("a");
    link.id = "launcher-download";
    link.textContent = "Download PNG";
    link.style.cssText = [
      "display:none",
      "width:fit-content",
      "margin:14px auto 0",
      "padding:10px 16px",
      "border-radius:12px",
      "border:1px solid rgba(0,0,0,0.12)",
      "background:#fff",
      "color:#1d1d1f",
      "font-size:14px",
      "font-weight:600",
      "text-decoration:none",
      "box-shadow:0 8px 20px rgba(0,0,0,0.08)"
    ].join(";");

    link.addEventListener("click", (event) => {
      const src = image.getAttribute("src") || "";
      if (!src.startsWith("data:image/")) event.preventDefault();
    });

    output.insertAdjacentElement("afterend", link);

    const refresh = () => {
      const src = image.getAttribute("src") || "";
      if (!src.startsWith("data:image/")) {
        link.removeAttribute("href");
        link.style.display = "none";
        return;
      }

      const seed = byId("seed")?.value || "seed";
      link.href = src;
      link.download = `hidream-o1-seed-${seed}-${timestamp()}.png`;
      link.style.display = "flex";
    };

    new MutationObserver(refresh).observe(image, {
      attributes: true,
      attributeFilter: ["src"]
    });
    refresh();
  }

  function setup() {
    setupDarkMode();
    setupRandomSeed();
    setupDownload();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup, { once: true });
  } else {
    setup();
  }
})();
