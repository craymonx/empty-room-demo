// /js/stages/room8.js
import { showChapterEndDialog } from "../chapter-end-dialog.js";
import { closePhotoPopup, showPhotoPopup } from "../photo-popup.js";
import { createRoomBgm } from "../room-bgm.js";
import { markEasterEggFound } from "../easter-egg-progress.js";

export default {
  enter({ root, go }) {
    root.innerHTML = `
        <section class="scene" id="scene-room8">
          <div class="scene-inner" id="room8Wrap">
            <img
              id="room8Bg"
              src="./assets/bg/room8/main-cloudy.webp"
              class="bg"
              alt="Room 8 scene"
              draggable="false"
            />
  
            <div id="room8Overlays" class="overlays"></div>
  
          </div>
        </section>
      `;

    const wrap = root.querySelector("#room8Wrap");
    const bg = root.querySelector("#room8Bg");
    const overlays = root.querySelector("#room8Overlays");

    const BASE_W = 1920;
    const BASE_H = 1080;

    let scene = "mainCloudy";
    let debug = false;
    let completionTimer = null;
    const bgm = createRoomBgm(
      "./assets/audio/room8/8 calmly sob bgm_1.wav",
    );
    let transitionTimer = null;

    const INTERACTION_HOLD_MS = 500;
    const TRANSITION_DELAY_MS = 200;
    const MOP_SWIPE_DISTANCE = 120;

    const ASSETS = {
      bg: {
        mainCloudy: "./assets/bg/room8/main-cloudy.webp",
        sunnyWaterLeak: "./assets/bg/room8/sunny-water-leak.webp",
        dried: "./assets/bg/room8/dried.webp",
        cloudyDried: "./assets/bg/room8/cloudy-dried.webp",
        cloudyWaterLeak: "./assets/bg/room8/cloudy-water-leak.webp",
        driedNight: "./assets/bg/room8/dried-night.webp",
      },
      props: {
        mop: "./assets/props/room8/mop.webp",
        sprayFull: "./assets/props/room8/spray-bottle-full.webp",
        sprayHalf: "./assets/props/room8/spray-bottle-half.webp",
        sprayEmpty: "./assets/props/room8/spray-bottle-empty.webp",
      },
    };

    Object.values(ASSETS.bg).forEach((src) => {
      const image = new Image();
      image.src = src;
    });

    const RECTS = {
      clock: { x: 550, y: 200, w: 100, h: 100 },

      props: {
        mop: { x: 220, y: 420, w: 300, h: 600 },
        spray: { x: 1510, y: 680, w: 150, h: 270 },
      },

      floor: { x: 650, y: 520, w: 650, h: 450 },
      window: { x: 135, y: 155, w: 185, h: 355 },

      plants: {
        plant1: { x: 100, y: 720, w: 300, h: 500 },
        plant2: { x: 750, y: 180, w: 250, h: 500 },
        plant3: { x: 750, y: 650, w: 500, h: 350 },
        plant4: { x: 1250, y: 350, w: 150, h: 150 },
        plant5: { x: 1475, y: 350, w: 100, h: 150 },
      },
    };

    function getDrawnImageRect() {
      const wrapRect = wrap.getBoundingClientRect();
      const imgRatio = BASE_W / BASE_H;
      const wrapRatio = wrapRect.width / wrapRect.height;

      let width, height, left, top;

      if (wrapRatio > imgRatio) {
        height = wrapRect.height;
        width = height * imgRatio;
        left = (wrapRect.width - width) / 2;
        top = 0;
      } else {
        width = wrapRect.width;
        height = width / imgRatio;
        left = 0;
        top = (wrapRect.height - height) / 2;
      }

      return { left, top, width, height };
    }

    function placeRectOnImage(el, rect) {
      const drawn = getDrawnImageRect();

      el.style.left = `${drawn.left + (rect.x / BASE_W) * drawn.width}px`;
      el.style.top = `${drawn.top + (rect.y / BASE_H) * drawn.height}px`;
      el.style.width = `${(rect.w / BASE_W) * drawn.width}px`;
      el.style.height = `${(rect.h / BASE_H) * drawn.height}px`;
    }

    function isDroppedOnZone(el, rect) {
      const elRect = el.getBoundingClientRect();
      const wrapRect = wrap.getBoundingClientRect();
      const drawn = getDrawnImageRect();

      const centerX = elRect.left - wrapRect.left + elRect.width / 2;
      const centerY = elRect.top - wrapRect.top + elRect.height / 2;

      const zoneLeft = drawn.left + (rect.x / BASE_W) * drawn.width;
      const zoneTop = drawn.top + (rect.y / BASE_H) * drawn.height;
      const zoneW = (rect.w / BASE_W) * drawn.width;
      const zoneH = (rect.h / BASE_H) * drawn.height;

      return (
        centerX >= zoneLeft &&
        centerX <= zoneLeft + zoneW &&
        centerY >= zoneTop &&
        centerY <= zoneTop + zoneH
      );
    }

    function createHotspot(rect, onClick, label = "hotspot") {
      const btn = document.createElement("button");
      btn.className = "room8-hotspot";
      btn.type = "button";
      btn.setAttribute("aria-label", label);

      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      });

      overlays.appendChild(btn);
      placeRectOnImage(btn, rect);
      return btn;
    }

    function closeEggAlbum() {
      closePhotoPopup(overlays, "room8EggAlbum");
    }

    function showEggAlbum({ title, image, progressId }) {
      closeEggAlbum();
      markEasterEggFound(progressId);

      showPhotoPopup({
        container: overlays,
        id: "room8EggAlbum",
        title,
        images: [image],
      });
    }

    function createProp(id, src, rect, draggable = true) {
      const img = document.createElement("img");
      img.id = id;
      img.src = src;
      img.className = "room8-prop";
      img.draggable = false;
      img.classList.toggle("is-disabled", !draggable);
      overlays.appendChild(img);
      placeRectOnImage(img, rect);

      if (draggable) makeDraggable(img, rect);

      return img;
    }

    function makeDraggable(el, homeRect) {
      let dragging = false;
      let offsetX = 0;
      let offsetY = 0;
      let swipeDistance = 0;
      let lastPointerX = 0;
      let lastPointerY = 0;
      let accumulatedTargetMs = 0;
      let lastTargetTick = null;
      let isCompleting = false;
      let holdTimer = null;
      let activePointerId = null;

      function clearHoldTimer() {
        if (!holdTimer) return;
        window.clearTimeout(holdTimer);
        holdTimer = null;
      }

      function stopAccumulatingTargetTime() {
        clearHoldTimer();

        if (lastTargetTick === null) return;

        accumulatedTargetMs += performance.now() - lastTargetTick;
        lastTargetTick = null;
      }

      function resetAccumulatedTargetTime() {
        clearHoldTimer();
        accumulatedTargetMs = 0;
        lastTargetTick = null;
      }

      function scheduleAccumulatedHoldCheck() {
        clearHoldTimer();

        const remainingMs = INTERACTION_HOLD_MS - accumulatedTargetMs;
        holdTimer = window.setTimeout(
          tryCompleteInteraction,
          Math.max(0, remainingMs),
        );
      }

      function tryCompleteInteraction() {
        if (!dragging || isCompleting || !isOverInteractionTarget(el)) return;

        const movedEnough =
          el.id !== "mopItem" || swipeDistance >= MOP_SWIPE_DISTANCE;
        if (!movedEnough) return;

        isCompleting = true;
        dragging = false;
        stopAccumulatingTargetTime();
        el.classList.remove("is-dragging");
        el.classList.remove("is-activating");

        try {
          el.releasePointerCapture(activePointerId);
        } catch {}

        completeInteraction(el);
      }

      el.addEventListener("pointerdown", (e) => {
        if (scene === "mainCloudy") return;

        dragging = true;
        swipeDistance = 0;
        resetAccumulatedTargetTime();
        isCompleting = false;
        activePointerId = e.pointerId;
        lastPointerX = e.clientX;
        lastPointerY = e.clientY;

        const elRect = el.getBoundingClientRect();
        offsetX = e.clientX - elRect.left;
        offsetY = e.clientY - elRect.top;

        el.setPointerCapture(e.pointerId);
        el.classList.add("is-dragging");
      });

      el.addEventListener("pointermove", (e) => {
        if (!dragging) return;

        const wrapRect = wrap.getBoundingClientRect();

        el.style.left = `${e.clientX - wrapRect.left - offsetX}px`;
        el.style.top = `${e.clientY - wrapRect.top - offsetY}px`;

        const isOverTarget = isOverInteractionTarget(el);

        if (el.id === "mopItem" && isOverTarget) {
          const now = performance.now();

          if (lastTargetTick === null) {
            lastTargetTick = now;
            scheduleAccumulatedHoldCheck();
          } else {
            accumulatedTargetMs += now - lastTargetTick;
            lastTargetTick = now;
          }

          swipeDistance += Math.hypot(
            e.clientX - lastPointerX,
            e.clientY - lastPointerY,
          );
          el.classList.add("is-activating");

          if (accumulatedTargetMs >= INTERACTION_HOLD_MS) {
            tryCompleteInteraction();
            if (isCompleting) return;
          }
        } else {
          stopAccumulatingTargetTime();
          el.classList.remove("is-activating");
        }

        lastPointerX = e.clientX;
        lastPointerY = e.clientY;
      });

      el.addEventListener("pointerup", (e) => {
        if (!dragging) return;

        dragging = false;
        resetAccumulatedTargetTime();

        try {
          el.releasePointerCapture(e.pointerId);
        } catch {}

        el.classList.remove("is-dragging");
        el.classList.remove("is-activating");

        if (el.id === "sprayItem" && isOverInteractionTarget(el)) {
          completeInteraction(el);
          return;
        }

        placeRectOnImage(el, homeRect);
      });
    }

    function plantDropSuccess(el) {
      return Object.values(RECTS.plants).some((rect) =>
        isDroppedOnZone(el, rect),
      );
    }

    function isOverInteractionTarget(el) {
      if (el.id === "mopItem") {
        if (scene === "sunnyWaterLeak") {
          return isDroppedOnZone(el, RECTS.floor);
        }

        return (
          (scene === "sunnyWaterLeak2" || scene === "cloudyWaterLeak") &&
          plantDropSuccess(el)
        );
      }

      if (el.id === "sprayItem") {
        return (
          (scene === "dried" || scene === "cloudyDried") && plantDropSuccess(el)
        );
      }

      return false;
    }

    function completeInteraction(el) {
      let nextScene = null;
      let nextBg = null;

      if (el.id === "mopItem" && scene === "sunnyWaterLeak") {
        nextScene = "dried";
        nextBg = ASSETS.bg.dried;
      } else if (el.id === "mopItem" && scene === "sunnyWaterLeak2") {
        nextScene = "cloudyDried";
        nextBg = ASSETS.bg.cloudyDried;
      } else if (el.id === "mopItem" && scene === "cloudyWaterLeak") {
        nextScene = "driedNight";
        nextBg = ASSETS.bg.driedNight;
      } else if (el.id === "sprayItem" && scene === "dried") {
        el.src = ASSETS.props.sprayHalf;
        nextScene = "sunnyWaterLeak2";
        nextBg = ASSETS.bg.sunnyWaterLeak;
      } else if (el.id === "sprayItem" && scene === "cloudyDried") {
        el.src = ASSETS.props.sprayEmpty;
        nextScene = "cloudyWaterLeak";
        nextBg = ASSETS.bg.cloudyWaterLeak;
      }

      if (!nextScene || !nextBg) return;

      el.classList.add("is-processing");
      transitionTimer = window.setTimeout(() => {
        transitionTimer = null;
        scene = nextScene;
        bg.src = nextBg;
        render();

        if (nextScene === "driedNight") {
          completionTimer = window.setTimeout(finishRoom, 3000);
        }
      }, TRANSITION_DELAY_MS);
    }

    function finishRoom() {
      completionTimer = null;
      localStorage.setItem("room8_done", "1");

      showChapterEndDialog({
        container: overlays,
        text: "I’ve been doing this for way too long.",
        onContinue: () => {
          window.dispatchEvent(
            new CustomEvent("stage:end", {
              detail: {
                nextStage: "room9",
                menuStage: "intro",
                nextLabel: "Next",
                menuLabel: "Back to Menu",
              },
            }),
          );
        },
      });
    }

    function drawDebugRects() {
      if (!debug) return;

      const rects = [];

      if (scene === "mainCloudy") rects.push(RECTS.clock);
      if (scene === "sunnyWaterLeak") rects.push(RECTS.floor, RECTS.window);
      if (scene === "dried" || scene === "cloudyDried") {
        rects.push(...Object.values(RECTS.plants));
      }
      if (scene === "sunnyWaterLeak2" || scene === "cloudyWaterLeak") {
        rects.push(...Object.values(RECTS.plants));
      }

      rects.forEach((rect) => {
        const box = document.createElement("div");
        box.className = "room8-debug-rect";
        overlays.appendChild(box);
        placeRectOnImage(box, rect);
      });
    }

    function render() {
      overlays.innerHTML = "";

      const mopIsDraggable = scene !== "mainCloudy" && scene !== "driedNight";
      createProp("mopItem", ASSETS.props.mop, RECTS.props.mop, mopIsDraggable);

      if (scene === "mainCloudy") {
        createProp(
          "sprayItem",
          ASSETS.props.sprayFull,
          RECTS.props.spray,
          false,
        );

        createHotspot(
          RECTS.clock,
          () => {
            scene = "sunnyWaterLeak";
            bg.src = ASSETS.bg.sunnyWaterLeak;
            render();
          },
          "clock",
        );
      }

      if (scene === "sunnyWaterLeak") {
        createProp(
          "sprayItem",
          ASSETS.props.sprayFull,
          RECTS.props.spray,
          true,
        );

        createHotspot(
          RECTS.window,
          () => {
            showEggAlbum({
              title: "Window memory",
              image: "./assets/props/room8/egg8.1.webp?v=20260624-1",
              progressId: "room8-window-day",
            });
          },
          "Open window memory",
        );
      }

      if (scene === "dried") {
        createProp(
          "sprayItem",
          ASSETS.props.sprayFull,
          RECTS.props.spray,
          true,
        );
      }

      if (scene === "sunnyWaterLeak2") {
        createProp(
          "sprayItem",
          ASSETS.props.sprayHalf,
          RECTS.props.spray,
          false,
        );
      }

      if (scene === "cloudyDried") {
        createProp(
          "sprayItem",
          ASSETS.props.sprayHalf,
          RECTS.props.spray,
          true,
        );
      }

      if (scene === "cloudyWaterLeak") {
        createProp(
          "sprayItem",
          ASSETS.props.sprayEmpty,
          RECTS.props.spray,
          false,
        );
      }

      if (scene === "driedNight") {
        // final scene: mop remains, spray removed
        createHotspot(
          RECTS.window,
          () => {
            showEggAlbum({
              title: "Night window memory",
              image: "./assets/props/room8/egg8.2.webp?v=20260624-2",
              progressId: "room8-window-night",
            });
          },
          "Open night window memory",
        );
      }

      drawDebugRects();
    }

    function layout() {
      render();
    }

    function handleDebugChange(event) {
      debug = Boolean(event.detail?.enabled);
      render();
    }

    window.addEventListener("resize", layout);
    window.addEventListener("game:debug", handleDebugChange);
    bg.addEventListener("load", () => requestAnimationFrame(layout));

    debug = document.body.classList.contains("debug");
    bgm.start();
    render();

    this.cleanup = () => {
      bgm.stop();
      closeEggAlbum();
      window.removeEventListener("resize", layout);
      window.removeEventListener("game:debug", handleDebugChange);
      if (completionTimer) {
        window.clearTimeout(completionTimer);
        completionTimer = null;
      }
      if (transitionTimer) {
        window.clearTimeout(transitionTimer);
        transitionTimer = null;
      }
    };
  },

  exit() {
    if (this.cleanup) this.cleanup();
  },
};
