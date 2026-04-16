// /js/stages/room4.js
export default {
  enter({ root, go }) {
    root.innerHTML = `
      <section class="scene" id="scene-room4">
        <div class="scene-inner" id="room4Wrap">
          <img
            id="bg"
            src="./assets/bg/room4/campus.png"
            class="bg"
            alt="Room 4 scene"
            draggable="false"
          />

          <div id="overlays" class="overlays" aria-hidden="false"></div>
          <div id="fxLayer" class="room4-fx-layer" aria-hidden="true"></div>

          <div class="hud">
            <button id="backBtn" class="hud-btn">Back</button>
            <button id="debugBtn" class="hud-btn">Hotspots</button>
          </div>
        </div>
      </section>
    `;

    const wrap = root.querySelector("#room4Wrap");
    const bg = root.querySelector("#bg");
    const overlays = root.querySelector("#overlays");
    const fxLayer = root.querySelector("#fxLayer");
    const backBtn = root.querySelector("#backBtn");
    const debugBtn = root.querySelector("#debugBtn");

    let scene = "campus";
    let destroyed = false;
    let debug = false;
    let rewinding = false;
    let beachEnded = false;
    let endingShown = false;

    let jarEl = null;
    let cleanupJarEvents = null;
    let cleanupSceneEvents = [];
    let timers = [];

    const BASE_W = 1920;
    const BASE_H = 1080;

    const RECTS = {
      jarStart: { x: 200, y: 450, w: 50, h: 150 },
      jarDropZone: { x: 50, y: 200, w: 400, h: 300 },

      beachTrigger: { x: 0, y: 0, w: 1920, h: 1080 },

      sinkHotspot: { x: 1200, y: 300, w: 700, h: 450 },

      glassL: { x: 520, y: 620, w: 160, h: 220 },
      glassM: { x: 650, y: 640, w: 180, h: 180 },
      glassR: { x: 780, y: 640, w: 180, h: 180 },

      glassLEmpty: { x: 520, y: 620, w: 160, h: 220 },
      glassMEmpty: { x: 650, y: 640, w: 180, h: 180 },
      glassREmpty: { x: 780, y: 640, w: 180, h: 180 },

      sinkDropZone: { x: 1050, y: 700, w: 900, h: 260 },

      sinkWaterLeftZone: { x: 0, y: 0, w: 260, h: 1080 },
      deteriorate1ReturnZone: { x: 0, y: 0, w: 1920, h: 1080 },
    };

    const sinkGlasses = {
      glassL: {
        key: "glassL",
        fullSrc: "./assets/props/room4/glass-l.png",
        emptySrc: "./assets/props/room4/glass-l-empty.png",
        rect: RECTS.glassL,
        emptyRect: RECTS.glassLEmpty,
        emptied: false,
        el: null,
        cleanup: null,
      },
      glassM: {
        key: "glassM",
        fullSrc: "./assets/props/room4/glass-m.png",
        emptySrc: "./assets/props/room4/glass-m-empty.png",
        rect: RECTS.glassM,
        emptyRect: RECTS.glassMEmpty,
        emptied: false,
        el: null,
        cleanup: null,
      },
      glassR: {
        key: "glassR",
        fullSrc: "./assets/props/room4/glass-r.png",
        emptySrc: "./assets/props/room4/glass-r-empty.png",
        rect: RECTS.glassR,
        emptyRect: RECTS.glassREmpty,
        emptied: false,
        el: null,
        cleanup: null,
      },
    };

    function resetSinkGlasses() {
      Object.values(sinkGlasses).forEach((glass) => {
        glass.emptied = false;
        glass.el = null;
        glass.cleanup = null;
      });
    }

    function wait(ms) {
      return new Promise((resolve) => {
        const id = setTimeout(resolve, ms);
        timers.push(id);
      });
    }

    function clearTimers() {
      timers.forEach(clearTimeout);
      timers = [];
    }

    function cleanupAllSceneEvents() {
      cleanupSceneEvents.forEach((fn) => fn && fn());
      cleanupSceneEvents = [];
    }

    function cleanupSinkGlassEvents() {
      Object.values(sinkGlasses).forEach((glass) => {
        if (glass.cleanup) {
          glass.cleanup();
          glass.cleanup = null;
        }
      });
    }

    function getDrawnImageRect(img) {
      const wrapRect = wrap.getBoundingClientRect();
      const naturalW = img.naturalWidth || BASE_W;
      const naturalH = img.naturalHeight || BASE_H;

      const wrapRatio = wrapRect.width / wrapRect.height;
      const imgRatio = naturalW / naturalH;

      let width, height, left, top;

      if (imgRatio > wrapRatio) {
        width = wrapRect.width;
        height = width / imgRatio;
        left = 0;
        top = (wrapRect.height - height) / 2;
      } else {
        height = wrapRect.height;
        width = height * imgRatio;
        top = 0;
        left = (wrapRect.width - width) / 2;
      }

      return { left, top, width, height };
    }

    function placeRectOnImage(el, rect) {
      const drawn = getDrawnImageRect(bg);

      el.style.left = `${drawn.left + (rect.x / BASE_W) * drawn.width}px`;
      el.style.top = `${drawn.top + (rect.y / BASE_H) * drawn.height}px`;
      el.style.width = `${(rect.w / BASE_W) * drawn.width}px`;
      el.style.height = `${(rect.h / BASE_H) * drawn.height}px`;
    }

    function getRectOnScreen(rect) {
      const drawn = getDrawnImageRect(bg);
      const wrapRect = wrap.getBoundingClientRect();

      return {
        left: wrapRect.left + drawn.left + (rect.x / BASE_W) * drawn.width,
        top: wrapRect.top + drawn.top + (rect.y / BASE_H) * drawn.height,
        width: (rect.w / BASE_W) * drawn.width,
        height: (rect.h / BASE_H) * drawn.height,
      };
    }

    function isDroppedOnZone(draggableEl, zoneRect) {
      const dragRect = draggableEl.getBoundingClientRect();
      const centerX = dragRect.left + dragRect.width / 2;
      const centerY = dragRect.top + dragRect.height / 2;

      return (
        centerX >= zoneRect.left &&
        centerX <= zoneRect.left + zoneRect.width &&
        centerY >= zoneRect.top &&
        centerY <= zoneRect.top + zoneRect.height
      );
    }

    function clearOverlays() {
      overlays.innerHTML = "";
      jarEl = null;
    }

    function addDebugRect(rect, className = "debug-dropzone") {
      const el = document.createElement("div");
      el.className = className;
      el.style.position = "absolute";
      el.style.pointerEvents = "none";
      el.style.border = "2px dashed rgba(255,255,255,0.9)";
      el.style.background = "rgba(255,255,255,0.12)";
      el.style.zIndex = "5";
      overlays.appendChild(el);
      placeRectOnImage(el, rect);
      return el;
    }

    function renderDebugZone() {
      overlays
        .querySelectorAll(".debug-dropzone, .debug-hotspot")
        .forEach((el) => el.remove());

      if (!debug) return;

      if (scene === "campus") {
        addDebugRect(RECTS.jarDropZone, "debug-dropzone");
      }

      if (scene === "beach" && !beachEnded) {
        addDebugRect(RECTS.beachTrigger, "debug-hotspot");
      }

      if (scene === "deteriorate3" && !rewinding) {
        addDebugRect(RECTS.sinkHotspot, "debug-hotspot");
      }

      if (scene === "sink") {
        addDebugRect(RECTS.sinkDropZone, "debug-dropzone");
      }

      if (scene === "sinkWater") {
        addDebugRect(RECTS.sinkWaterLeftZone, "debug-hotspot");
      }

      if (scene === "deteriorate1" && rewinding) {
        addDebugRect(RECTS.deteriorate1ReturnZone, "debug-hotspot");
      }
    }

    function showEndingDialog() {
      if (endingShown) return;
      endingShown = true;

      const overlay = document.createElement("div");
      overlay.className = "room4-ending-overlay";
      overlay.innerHTML = `
        <div class="room4-ending-card" role="dialog" aria-modal="true" aria-label="Ending dialog">
          <h2 class="room4-ending-title">End</h2>
          <div class="room4-ending-text">
            <p>You returned to where it began,<br />but not as the same person.</p>
          </div>
          <div class="room4-ending-actions">
            <button type="button" class="room4-ending-btn" id="room4EndingBtn">Back to intro</button>
          </div>
        </div>
      `;

      overlays.appendChild(overlay);

      const btn = overlay.querySelector("#room4EndingBtn");

      function onClose() {
        localStorage.setItem("room4_done", "1");
        go("intro");
      }

      btn.addEventListener("click", onClose);

      cleanupSceneEvents.push(() => {
        btn.removeEventListener("click", onClose);
      });
    }

    async function startDeteriorateSequence() {
      if (destroyed || scene !== "beach" || beachEnded) return;

      rewinding = false;

      scene = "deteriorate1";
      renderScene();

      await wait(1000);
      if (destroyed) return;
      if (scene !== "deteriorate1") return;

      scene = "deteriorate2";
      renderScene();

      await wait(1000);
      if (destroyed) return;
      if (scene !== "deteriorate2") return;

      scene = "deteriorate3";
      renderScene();
    }

    async function startReverseDeteriorateSequence() {
      if (destroyed || scene !== "sinkWater") return;

      rewinding = true;

      scene = "deteriorate3";
      renderScene();

      await wait(1000);
      if (destroyed) return;
      if (scene !== "deteriorate3") return;

      scene = "deteriorate2";
      renderScene();

      await wait(1000);
      if (destroyed) return;
      if (scene !== "deteriorate2") return;

      scene = "deteriorate1";
      renderScene();
    }

    async function playBeachTransition() {
      if (scene !== "campus") return;

      scene = "transition";

      if (cleanupJarEvents) {
        cleanupJarEvents();
        cleanupJarEvents = null;
      }

      clearOverlays();

      fxLayer.innerHTML = `<div class="room4-fade room4-fade-out"></div>`;
      await wait(700);
      if (destroyed) return;

      bg.src = "./assets/bg/room4/beach.png";

      fxLayer.innerHTML = `<div class="room4-fade room4-fade-in"></div>`;
      await wait(900);
      if (destroyed) return;

      fxLayer.innerHTML = "";
      scene = "beach";
      rewinding = false;
      beachEnded = false;
      endingShown = false;
      renderScene();
    }

    function goBackToBeach() {
      clearTimers();
      rewinding = false;
      beachEnded = true;
      scene = "beach";
      renderScene();

      requestAnimationFrame(() => {
        if (!destroyed && scene === "beach" && beachEnded) {
          showEndingDialog();
        }
      });
    }

    function makeJar() {
      const el = document.createElement("img");
      el.src = "./assets/props/room4/glass-jar-table.png";
      el.alt = "Glass jar";
      el.draggable = false;
      el.className = "room4-jar";
      el.style.position = "absolute";
      el.style.zIndex = "10";
      el.style.cursor = "grab";
      el.style.userSelect = "none";
      el.style.touchAction = "none";

      placeRectOnImage(el, RECTS.jarStart);
      overlays.appendChild(el);
      jarEl = el;

      let dragging = false;
      let startX = 0;
      let startY = 0;
      let startLeft = 0;
      let startTop = 0;

      function onPointerDown(e) {
        if (scene !== "campus") return;

        dragging = true;
        el.classList.add("dragging");

        const rect = el.getBoundingClientRect();
        const wrapRect = wrap.getBoundingClientRect();

        startX = e.clientX;
        startY = e.clientY;
        startLeft = rect.left - wrapRect.left;
        startTop = rect.top - wrapRect.top;

        el.setPointerCapture?.(e.pointerId);
      }

      function onPointerMove(e) {
        if (!dragging) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        el.style.left = `${startLeft + dx}px`;
        el.style.top = `${startTop + dy}px`;
      }

      async function onPointerUp(e) {
        if (!dragging) return;

        dragging = false;
        el.classList.remove("dragging");
        el.releasePointerCapture?.(e.pointerId);

        const zoneRect = getRectOnScreen(RECTS.jarDropZone);

        if (isDroppedOnZone(el, zoneRect)) {
          await playBeachTransition();
        } else {
          placeRectOnImage(el, RECTS.jarStart);
        }
      }

      el.addEventListener("pointerdown", onPointerDown);
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);

      return () => {
        el.removeEventListener("pointerdown", onPointerDown);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
      };
    }

    function makeHotspot(rect, onClick, label = "Hotspot") {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "room4-hotspot";
      btn.setAttribute("aria-label", label);
      btn.style.position = "absolute";
      btn.style.zIndex = "8";
      btn.style.background = "transparent";
      btn.style.border = "0";
      btn.style.padding = "0";
      btn.style.cursor = "pointer";

      placeRectOnImage(btn, rect);
      btn.addEventListener("click", onClick);
      overlays.appendChild(btn);

      return () => {
        btn.removeEventListener("click", onClick);
      };
    }

    function makeOverlayImage(src, rect, className = "") {
      const el = document.createElement("img");
      el.src = src;
      el.alt = "";
      el.draggable = false;
      el.className = className;
      el.style.position = "absolute";
      el.style.zIndex = "7";
      el.style.pointerEvents = "none";
      placeRectOnImage(el, rect);
      overlays.appendChild(el);
      return el;
    }

    function checkAllGlassesEmptied() {
      const allDone = Object.values(sinkGlasses).every((glass) => glass.emptied);

      if (!allDone) return;

      scene = "sinkWater";
      renderScene();
    }

    function makeSinkGlass(glass) {
      const el = document.createElement("img");
      el.src = glass.emptied ? glass.emptySrc : glass.fullSrc;
      el.alt = "";
      el.draggable = false;
      el.className = "room4-glass-draggable";
      el.style.position = "absolute";
      el.style.zIndex = "9";
      el.style.cursor = glass.emptied ? "default" : "grab";
      el.style.userSelect = "none";
      el.style.touchAction = "none";

      placeRectOnImage(el, glass.emptied ? (glass.emptyRect || glass.rect) : glass.rect);
      overlays.appendChild(el);

      glass.el = el;

      if (glass.emptied) {
        return () => {};
      }

      let dragging = false;
      let startX = 0;
      let startY = 0;
      let startLeft = 0;
      let startTop = 0;

      function onPointerDown(e) {
        if (scene !== "sink") return;
        if (glass.emptied) return;

        dragging = true;
        el.classList.add("dragging");

        const rect = el.getBoundingClientRect();
        const wrapRect = wrap.getBoundingClientRect();

        startX = e.clientX;
        startY = e.clientY;
        startLeft = rect.left - wrapRect.left;
        startTop = rect.top - wrapRect.top;

        el.setPointerCapture?.(e.pointerId);
      }

      function onPointerMove(e) {
        if (!dragging) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        el.style.left = `${startLeft + dx}px`;
        el.style.top = `${startTop + dy}px`;
      }

      function onPointerUp(e) {
        if (!dragging) return;

        dragging = false;
        el.classList.remove("dragging");
        el.releasePointerCapture?.(e.pointerId);

        const zoneRect = getRectOnScreen(RECTS.sinkDropZone);

        if (isDroppedOnZone(el, zoneRect)) {
          glass.emptied = true;
          el.src = glass.emptySrc;
          el.style.cursor = "default";
          placeRectOnImage(el, glass.emptyRect || glass.rect);
          cleanup();
          glass.cleanup = null;
          checkAllGlassesEmptied();
        } else {
          placeRectOnImage(el, glass.rect);
        }
      }

      function cleanup() {
        el.removeEventListener("pointerdown", onPointerDown);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
      }

      el.addEventListener("pointerdown", onPointerDown);
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);

      glass.cleanup = cleanup;
      return cleanup;
    }

    function goToSinkScene() {
      resetSinkGlasses();
      rewinding = false;
      scene = "sink";
      renderScene();
    }

    function renderScene() {
      if (cleanupJarEvents) {
        cleanupJarEvents();
        cleanupJarEvents = null;
      }

      cleanupAllSceneEvents();
      cleanupSinkGlassEvents();
      clearOverlays();

      if (scene === "campus") {
        bg.src = "./assets/bg/room4/campus.png";
        cleanupJarEvents = makeJar();
      }

      if (scene === "beach") {
        bg.src = "./assets/bg/room4/beach.png";

        if (!beachEnded) {
          const cleanupHotspot = makeHotspot(
            RECTS.beachTrigger,
            () => {
              startDeteriorateSequence();
            },
            "Trigger deterioration"
          );
          cleanupSceneEvents.push(cleanupHotspot);
        }
      }

      if (scene === "deteriorate1") {
        bg.src = "./assets/bg/room4/deteriorate-1.png";

        if (rewinding) {
          const cleanupHotspot = makeHotspot(
            RECTS.deteriorate1ReturnZone,
            goBackToBeach,
            "Return to beach"
          );
          cleanupSceneEvents.push(cleanupHotspot);
        }
      }

      if (scene === "deteriorate2") {
        bg.src = "./assets/bg/room4/deteriorate-2.png";
      }

      if (scene === "deteriorate3") {
        bg.src = "./assets/bg/room4/deteriorate-3.png";

        if (!rewinding) {
          const cleanupHotspot = makeHotspot(
            RECTS.sinkHotspot,
            goToSinkScene,
            "Go to sink"
          );
          cleanupSceneEvents.push(cleanupHotspot);
        }
      }

      if (scene === "sink") {
        bg.src = "./assets/bg/room4/sink.png";

        Object.values(sinkGlasses).forEach((glass) => {
          const cleanup = makeSinkGlass(glass);
          if (cleanup) cleanupSceneEvents.push(cleanup);
        });
      }

      if (scene === "sinkWater") {
        bg.src = "./assets/bg/room4/sink-water.png";

        Object.values(sinkGlasses).forEach((glass) => {
          makeOverlayImage(
            glass.emptySrc,
            glass.emptyRect || glass.rect,
            "room4-glass"
          );
        });

        const cleanupHotspot = makeHotspot(
          RECTS.sinkWaterLeftZone,
          () => {
            startReverseDeteriorateSequence();
          },
          "Go back from sink water"
        );
        cleanupSceneEvents.push(cleanupHotspot);
      }

      renderDebugZone();
    }

    function layout() {
      if (destroyed) return;

      if (scene === "campus" && jarEl && !jarEl.classList.contains("dragging")) {
        placeRectOnImage(jarEl, RECTS.jarStart);
      }

      if (scene === "beach" && !beachEnded) {
        const hotspot = overlays.querySelector(".room4-hotspot");
        if (hotspot) placeRectOnImage(hotspot, RECTS.beachTrigger);
      }

      if (scene === "deteriorate3" && !rewinding) {
        const hotspot = overlays.querySelector(".room4-hotspot");
        if (hotspot) placeRectOnImage(hotspot, RECTS.sinkHotspot);
      }

      if (scene === "deteriorate1" && rewinding) {
        const hotspot = overlays.querySelector(".room4-hotspot");
        if (hotspot) placeRectOnImage(hotspot, RECTS.deteriorate1ReturnZone);
      }

      if (scene === "sink") {
        Object.values(sinkGlasses).forEach((glass) => {
          if (glass.el && !glass.el.classList.contains("dragging")) {
            placeRectOnImage(
              glass.el,
              glass.emptied ? (glass.emptyRect || glass.rect) : glass.rect
            );
          }
        });
      }

      if (scene === "sinkWater") {
        const glasses = overlays.querySelectorAll(".room4-glass");
        if (glasses[0]) placeRectOnImage(glasses[0], RECTS.glassLEmpty);
        if (glasses[1]) placeRectOnImage(glasses[1], RECTS.glassMEmpty);
        if (glasses[2]) placeRectOnImage(glasses[2], RECTS.glassREmpty);

        const hotspot = overlays.querySelector(".room4-hotspot");
        if (hotspot) placeRectOnImage(hotspot, RECTS.sinkWaterLeftZone);
      }

      renderDebugZone();
    }

    backBtn.addEventListener("click", () => go("intro"));

    debugBtn.addEventListener("click", () => {
      debug = !debug;
      renderDebugZone();
    });

    bg.addEventListener("load", layout);
    window.addEventListener("resize", layout);

    renderScene();

    this._cleanup = () => {
      destroyed = true;
      clearTimers();

      if (cleanupJarEvents) {
        cleanupJarEvents();
        cleanupJarEvents = null;
      }

      cleanupAllSceneEvents();
      cleanupSinkGlassEvents();

      bg.removeEventListener("load", layout);
      window.removeEventListener("resize", layout);
    };
  },

  exit() {
    this._cleanup?.();
  },
};