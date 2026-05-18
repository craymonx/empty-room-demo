// /js/game-ui.js

let currentGo = null;
let nextStageName = null;
let menuStageName = "intro";
let stageEndHandler = null;

export function setupStageUI({ go, defaultMenuStage = "intro" }) {
  currentGo = go;
  menuStageName = defaultMenuStage;

  document.querySelector("#globalStageUI")?.remove();

  const ui = document.createElement("div");
  ui.id = "globalStageUI";
  ui.className = "global-stage-ui";

  ui.innerHTML = `
    <button id="globalDebugBtn" class="global-ui-btn">Hotspots</button>
    <button id="globalMenuBtn" class="global-ui-btn hidden">Back to Menu</button>
    <button id="globalNextBtn" class="global-ui-btn hidden">Next</button>
  `;

  document.body.appendChild(ui);

  const debugBtn = ui.querySelector("#globalDebugBtn");
  const nextBtn = ui.querySelector("#globalNextBtn");
  const menuBtn = ui.querySelector("#globalMenuBtn");

  debugBtn.addEventListener("click", () => {
    document.body.classList.toggle("debug");
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

export function hideStageEndButtons() {
  const nextBtn = document.querySelector("#globalNextBtn");
  const menuBtn = document.querySelector("#globalMenuBtn");

  if (nextBtn) nextBtn.classList.add("hidden");
  if (menuBtn) menuBtn.classList.add("hidden");
}