// /js/router.js
import { hideStageEndButtons } from "./game-ui.js?v=20260622-2";

const STAGE_LOADERS = new Map();
const STAGES = new Map();
const ROOM_CSS_VERSION = "20260623-1";

let currentStageId = null;

function setLoading(isLoading) {
  const el = document.getElementById("loading-screen");
  if (!el) return;
  el.classList.toggle("active", isLoading);
}

function setStageStyles(stageId) {
  const isRoom = /^room(\d+)$/i.test(stageId);
  const linkId = "stage-css";

  // If not a room, remove room css link completely
  if (!isRoom) {
    const existing = document.getElementById(linkId);
    if (existing) existing.remove();
    return;
  }

  // Extract room number safely
  const match = stageId.match(/^room(\d+)$/i);
  const num = match ? Number(match[1]) : NaN;

  if (!Number.isFinite(num) || num < 1 || num > 99) {
    console.warn(`Invalid room stageId "${stageId}" — skipping room CSS load.`);
    return;
  }

  // room1 -> room-01.css, room10 -> room-10.css
  const file = `./css/room-${String(num).padStart(2, "0")}.css?v=${ROOM_CSS_VERSION}`;

  let link = document.getElementById(linkId);

  if (!link) {
    link = document.createElement("link");
    link.id = linkId;
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }

  if (link.getAttribute("href") !== file) {
    link.href = file;
  }
}

export function registerStageLoaders(loaders) {
  Object.entries(loaders).forEach(([id, loader]) => {
    if (typeof loader !== "function") {
      throw new Error(`Stage loader "${id}" must be a function.`);
    }

    STAGE_LOADERS.set(id, loader);
  });
}

async function loadStage(stageId) {
  // If already loaded before, reuse it
  if (STAGES.has(stageId)) {
    return STAGES.get(stageId);
  }

  const loader = STAGE_LOADERS.get(stageId);

  if (!loader) {
    throw new Error(`Stage "${stageId}" not registered.`);
  }

  const module = await loader();
  const stage = module.default;

  if (!stage || typeof stage.enter !== "function") {
    throw new Error(`Stage "${stageId}" must provide an enter(ctx) function.`);
  }

  STAGES.set(stageId, stage);

  return stage;
}

export async function goToStage(nextStageId, payload = {}) {
  hideStageEndButtons();
  document.body.classList.remove("debug");

  const root = document.getElementById("game-root");

  if (!root) {
    throw new Error("#game-root not found.");
  }

  setLoading(true);

  try {
    const prevStage = currentStageId ? STAGES.get(currentStageId) : null;
    const nextStage = await loadStage(nextStageId);

    // 1) swap CSS for the next stage
    setStageStyles(nextStageId);

    // 2) exit previous
    if (prevStage && typeof prevStage.exit === "function") {
      try {
        prevStage.exit({ root });
      } catch (e) {
        console.warn(`Error during exit("${currentStageId}")`, e);
      }
    }

    // 3) enter next
    currentStageId = nextStageId;

    nextStage.enter({
      root,
      stageId: nextStageId,
      payload,
      go: (id, p = {}) => goToStage(id, p),
    });

    // Update hash for refresh/back button
    location.hash = `#${nextStageId}`;
  } finally {
    setLoading(false);
  }
}

export function getCurrentStageId() {
  return currentStageId;
}

/**
 * Optional helper: start from URL hash if it matches a registered stage loader.
 * Usage: call this once in main.js after registerStageLoaders().
 */
export async function startFromHash(fallbackStageId = "intro") {
  const hash = (location.hash || "").replace("#", "").trim();

  if (hash && STAGE_LOADERS.has(hash)) {
    await goToStage(hash);
  } else {
    await goToStage(fallbackStageId);
  }
}
