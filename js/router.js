// /js/router.js

const STAGES = new Map();
let currentStageId = null;

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
  const file = `./css/room-${String(num).padStart(2, "0")}.css`;

  let link = document.getElementById(linkId);
  if (!link) {
    link = document.createElement("link");
    link.id = linkId;
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  link.href = file;
}

export function registerStages(stageObject) {
  Object.entries(stageObject).forEach(([id, stage]) => {
    if (!stage || typeof stage.enter !== "function") {
      throw new Error(`Stage "${id}" must provide an enter(ctx) function.`);
    }
    STAGES.set(id, stage);
  });
}

export function goToStage(nextStageId, payload = {}) {
  const root = document.getElementById("game-root");
  if (!root) throw new Error("#game-root not found.");

  const prevStage = currentStageId ? STAGES.get(currentStageId) : null;
  const nextStage = STAGES.get(nextStageId);
  if (!nextStage) throw new Error(`Stage "${nextStageId}" not registered.`);

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
}

export function getCurrentStageId() {
  return currentStageId;
}

/**
 * Optional helper: start from URL hash if it matches a registered stage.
 * Usage: call this once in main.js after registerStages().
 */
export function startFromHash(fallbackStageId = "intro") {
  const hash = (location.hash || "").replace("#", "").trim();
  if (hash && STAGES.has(hash)) {
    goToStage(hash);
  } else {
    goToStage(fallbackStageId);
  }
}