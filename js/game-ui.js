let currentGo = null;
let nextStageName = null;
let menuStageName = "intro";
let stageEndHandler = null;
let soundEnabled = true;

const SOUND_STORAGE_KEY = "empty-room-sound-enabled";
const trackedMedia = new Set();

function readSoundPreference() {
  try {
    return localStorage.getItem(SOUND_STORAGE_KEY) !== "false";
  } catch {
    return true;
  }
}

function applySoundPreference() {
  trackedMedia.forEach((media) => {
    media.muted = !soundEnabled;
  });

  document.querySelectorAll("audio, video").forEach((media) => {
    trackedMedia.add(media);
    media.muted = !soundEnabled;
  });

  const soundBtn = document.querySelector("#globalSoundBtn");
  if (!soundBtn) return;

  soundBtn.textContent = soundEnabled ? "Sound: On" : "Sound: Off";
  soundBtn.setAttribute("aria-pressed", String(soundEnabled));
  soundBtn.setAttribute(
    "aria-label",
    soundEnabled ? "Turn sound off" : "Turn sound on",
  );
}

function setupGlobalSoundControl() {
  soundEnabled = readSoundPreference();

  if (!window.__emptyRoomSoundPatched) {
    const nativePlay = HTMLMediaElement.prototype.play;

    HTMLMediaElement.prototype.play = function (...args) {
      trackedMedia.add(this);
      this.muted = !soundEnabled;
      return nativePlay.apply(this, args);
    };

    window.__emptyRoomSoundPatched = true;
  }

  applySoundPreference();
}

function toggleSound() {
  soundEnabled = !soundEnabled;

  try {
    localStorage.setItem(SOUND_STORAGE_KEY, String(soundEnabled));
  } catch {}

  applySoundPreference();
}

export function setupStageUI({ go, defaultMenuStage = "intro" }) {
  currentGo = go;
  menuStageName = defaultMenuStage;

  document.querySelector("#globalStageUI")?.remove();

  const ui = document.createElement("div");
  ui.id = "globalStageUI";
  ui.className = "global-stage-ui";

  ui.innerHTML = `
    <button id="globalSoundBtn" class="global-ui-btn" aria-pressed="true">Sound: On</button>
    <button id="globalDebugBtn" class="global-ui-btn">Hotspots</button>
    <button id="globalMenuBtn" class="global-ui-btn hidden">Back to Menu</button>
    <button id="globalNextBtn" class="global-ui-btn hidden">Next</button>
  `;

  document.body.appendChild(ui);

  const soundBtn = ui.querySelector("#globalSoundBtn");
  const debugBtn = ui.querySelector("#globalDebugBtn");
  const nextBtn = ui.querySelector("#globalNextBtn");
  const menuBtn = ui.querySelector("#globalMenuBtn");

  setupGlobalSoundControl();

  soundBtn.addEventListener("click", toggleSound);

  debugBtn.addEventListener("click", () => {
    document.body.classList.toggle("debug");

    window.dispatchEvent(
      new CustomEvent("game:debug", {
        detail: {
          enabled: document.body.classList.contains("debug"),
        },
      }),
    );
  });

  nextBtn.addEventListener("click", () => {
    if (!currentGo || !nextStageName) return;
    hideStageEndButtons();
    currentGo(nextStageName);
  });

  menuBtn.addEventListener("click", () => {
    if (!currentGo || !menuStageName) return;
    hideStageEndButtons();
    currentGo(menuStageName);
  });

  // Prevent duplicate event listeners if setupStageUI ever runs again
  if (stageEndHandler) {
    window.removeEventListener("stage:end", stageEndHandler);
  }

  stageEndHandler = (event) => {
    const detail = event.detail || {};

    showStageEndButtons({
      nextStage: detail.nextStage,
      menuStage: detail.menuStage || defaultMenuStage,
      nextLabel: detail.nextLabel || "Next",
      menuLabel: detail.menuLabel || "Back to Menu",
    });
  };

  window.addEventListener("stage:end", stageEndHandler);
}

export function showStageEndButtons({
  nextStage,
  menuStage = "intro",
  nextLabel = "Next",
  menuLabel = "Back to Menu",
}) {
  nextStageName = nextStage;
  menuStageName = menuStage;

  const nextBtn = document.querySelector("#globalNextBtn");
  const menuBtn = document.querySelector("#globalMenuBtn");

  if (!nextBtn || !menuBtn) return;

  nextBtn.textContent = nextLabel;
  menuBtn.textContent = menuLabel;

  menuBtn.classList.remove("hidden");
  nextBtn.classList.remove("hidden");
}

export function setMenuButtonVisible(
  isVisible,
  { menuStage = "intro", menuLabel = "Back to Menu" } = {},
) {
  menuStageName = menuStage;

  const menuBtn = document.querySelector("#globalMenuBtn");
  if (!menuBtn) return;

  menuBtn.textContent = menuLabel;
  menuBtn.classList.toggle("hidden", !isVisible);
}

export function hideStageEndButtons({ hideMenu = false } = {}) {
  const nextBtn = document.querySelector("#globalNextBtn");
  const menuBtn = document.querySelector("#globalMenuBtn");

  if (nextBtn) nextBtn.classList.add("hidden");
  if (hideMenu && menuBtn) menuBtn.classList.add("hidden");
}
