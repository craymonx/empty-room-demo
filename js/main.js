import { registerStageLoaders, goToStage, startFromHash } from "./router.js";
import { setupStageUI } from "./game-ui.js?v=20260622-1";

function setLoading(isLoading) {
  const el = document.getElementById("loading-screen");
  if (!el) return;
  el.classList.toggle("active", isLoading);
}

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

// Wait for images inside a container to finish loading
async function waitForImages(container) {
  if (!container) return;

  const imgs = Array.from(container.querySelectorAll("img"));

  const pending = imgs
    .filter((img) => !img.complete)
    .map(
      (img) =>
        new Promise((resolve) => {
          img.addEventListener("load", resolve, { once: true });
          img.addEventListener("error", resolve, { once: true });
        }),
    );

  if (pending.length) {
    await Promise.all(pending);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const root = document.getElementById("game-root");
  if (!root) {
    throw new Error("#game-root not found. Check index.html");
  }

  setLoading(true);

  // Register stage loaders instead of importing all rooms immediately
  registerStageLoaders({
    intro: () => import("./stages/intro.js"),
    room1: () => import("./stages/room1.js"),
    room2: () => import("./stages/room2.js"),
    room3: () => import("./stages/room3.js"),
    room4: () => import("./stages/room4.js"),
    room5: () => import("./stages/room5.js"),
    room6: () => import("./stages/room6.js"),
    room7: () => import("./stages/room7.js"),
    room8: () => import("./stages/room8.js"),
    room9: () => import("./stages/room9.js"),
    room10: () => import("./stages/room10.js"),
    room11: () => import("./stages/room11.js"),
    ending: () => import("./stages/ending.js"),
  });

  setupStageUI({
    go: goToStage,
    defaultMenuStage: "intro",
  });

  // Wait for intro module to load and render
  await startFromHash("intro");

  // Let intro render at least one frame
  await nextFrame();

  // Wait for intro image(s), but not the whole game
  await waitForImages(root);

  setLoading(false);
});
