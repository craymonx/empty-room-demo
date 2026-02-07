// /js/main.js
import { registerStages, goToStage } from "./router.js";

// Import stages
import intro from "./stages/intro.js";
import room1 from "./stages/room1.js";
import ending from "./stages/ending.js";

function setLoading(isLoading) {
  const el = document.getElementById("loading-screen");
  if (!el) return;
  el.classList.toggle("active", isLoading);
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function nextFrame() {
  return new Promise((r) => requestAnimationFrame(() => r()));
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
          img.addEventListener("error", resolve, { once: true }); // don't block forever
        })
    );

  if (pending.length) await Promise.all(pending);
}

document.addEventListener("DOMContentLoaded", async () => {
  const root = document.getElementById("game-root");
  if (!root) throw new Error("#game-root not found. Check index.html");

  // Show loading ASAP
  setLoading(true);

  // Prevent "flash" on fast loads
  const MIN_LOADING_MS = 700;
  const start = performance.now();

  // Register all stages ONCE
  registerStages({ intro, room1, ending });

  // Go to intro
  goToStage("intro");

  // Let intro render at least one frame
  await nextFrame();

  // If intro injects images, wait for them
  await waitForImages(root);

  // Ensure minimum display time
  const elapsed = performance.now() - start;
  if (elapsed < MIN_LOADING_MS) await wait(MIN_LOADING_MS - elapsed);

  // Hide loading
  setLoading(false);
});