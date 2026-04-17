// /js/stages/room5.js
export default {
    enter({ root, go }) {
      root.innerHTML = `
        <section class="scene" id="scene-room5">
          <div class="scene-inner" id="room5Wrap">
            <img
              id="bg"
              src="./assets/bg/room5/bedroom.gif"
              class="bg"
              alt="Room 5 scene"
              draggable="false"
            />
  
            <div id="overlays" class="overlays" aria-hidden="false"></div>
            <div id="fxLayer" class="room5-fx-layer" aria-hidden="true"></div>
            <div id="dialogLayer" class="room5-dialog-layer"></div>
  
            <div class="hud">
              <button id="backBtn" class="hud-btn">Back</button>
              <button id="debugBtn" class="hud-btn">Hotspots</button>
            </div>
          </div>
        </section>
      `;
  
      const wrap = root.querySelector("#room5Wrap");
      const bg = root.querySelector("#bg");
      const overlays = root.querySelector("#overlays");
      const fxLayer = root.querySelector("#fxLayer");
      const dialogLayer = root.querySelector("#dialogLayer");
      const backBtn = root.querySelector("#backBtn");
      const debugBtn = root.querySelector("#debugBtn");
  
      let currentScene = "bedroom";
      let activeHotspots = [];
      let loopTimer = null;
      let loopEndTimer = null;
      let zoomTimer = null;
      let blackoutTimer = null;
      let destroyed = false;
  
      const RECTS = {
        bedroom: {
          zone1: { x: 1020, y: 80, w: 680, h: 950 },
        },
        mainView: {
          zone1: { x: 1900, y: 730, w: 480, h: 280 },
        },
        close1: {
          zone1: { x: 1700, y: 580, w: 520, h: 450 },
        },
        close2: {
          zone1: { x: 1550, y: 400, w: 850, h: 800 },
        },
        close3: {
          zone1: { x: 1000, y: 200, w: 1350, h: 1300 },
        },
        kitchenCounter: {
          zone1: { x: 640, y: 0, w: 1020, h: 400 },
        },
        pillBottle: {
          zone1: { x: 1130, y: 650, w: 270, h: 400 },
        },
        openBottle: {
          zone1: { x: 1130, y: 650, w: 270, h: 400 },
        },
        blackLiquid: {
          zone1: { x: 730, y: 100, w: 1200, h: 1200 },
        },
        emptyBottle: {
          zone1: { x: 730, y: 100, w: 1200, h: 1200 },
        },
        emptyBottleTop: {
          zone1: { x: 730, y: 100, w: 1200, h: 1200 },
        },
        vortexRoom: {
          zone1: { x: 730, y: 100, w: 1200, h: 1200 },
        },
      };

  
      const DISTORTED_FRAMES = [
        "./assets/bg/room5/distorted-1.png",
        "./assets/bg/room5/distorted-2.png",
        "./assets/bg/room5/distorted-3.png",
        "./assets/bg/room5/distorted-4.png",
        "./assets/bg/room5/distorted-5.png",
        "./assets/bg/room5/distorted-6.png",
        "./assets/bg/room5/distorted-7.png",
      ];
  
      const SCENES = {
        bedroom: {
          bg: "./assets/bg/room5/bedroom.gif",
          hotspots: [{ rect: RECTS.bedroom.zone1, next: "mainView", label: "Go to main view" }],
        },
  
        mainView: {
          bg: "./assets/bg/room5/main-view.png",
          hotspots: [{ rect: RECTS.mainView.zone1, next: "close1", label: "Zoom in" }],
        },
  
        close1: {
          bg: "./assets/bg/room5/close-1.png",
          hotspots: [{ rect: RECTS.close1.zone1, next: "close2", label: "Zoom in closer" }],
        },
  
        close2: {
          bg: "./assets/bg/room5/close-2.png",
          hotspots: [{ rect: RECTS.close2.zone1, next: "close3", label: "Zoom in closer again" }],
        },
  
        close3: {
          bg: "./assets/bg/room5/close-3.png",
          hotspots: [{ rect: RECTS.close3.zone1, next: "kitchenCounter", label: "Go to kitchen counter" }],
        },
  
        kitchenCounter: {
          bg: "./assets/bg/room5/kitchen-counter.png",
          hotspots: [{ rect: RECTS.kitchenCounter.zone1, next: "pillBottle", label: "Inspect bottle" }],
        },
  
        pillBottle: {
          bg: "./assets/bg/room5/pill-bottle.png",
          hotspots: [{ rect: RECTS.pillBottle.zone1, next: "openBottle", label: "Open bottle" }],
        },
  
        openBottle: {
          bg: "./assets/bg/room5/open-bottle.png",
          hotspots: [{ rect: RECTS.openBottle.zone1, next: "blackLiquid", label: "Inspect opened bottle" }],
        },
  
        blackLiquid: {
          bg: "./assets/bg/room5/black-liquid.png",
          hotspots: [{ rect: RECTS.blackLiquid.zone1, next: "emptyBottle", label: "Continue" }],
        },
  
        emptyBottle: {
          bg: "./assets/bg/room5/empty-bottle.png",
          hotspots: [{ rect: RECTS.emptyBottle.zone1, next: "emptyBottleTop", label: "Continue" }],
        },
  
        emptyBottleTop: {
          bg: "./assets/bg/room5/empty-bottle-top.png",
          hotspots: [{ rect: RECTS.emptyBottleTop.zone1, next: "vortexRoom", label: "Continue" }],
        },
  
        vortexRoom: {
          bg: "./assets/bg/room5/vortex-room.png",
          hotspots: [{ rect: RECTS.vortexRoom.zone1, next: "vortexZoom", label: "Enter distortion" }],
        },
  
        vortexZoom: {
          bg: "./assets/bg/room5/vortex-room.png",
          hotspots: [],
          isZoomTransition: true,
        },
  
        distortedLoop: {
          bg: DISTORTED_FRAMES[0],
          hotspots: [],
          isDistortionLoop: true,
        },
  
        blackout: {
          bg: "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=",
          hotspots: [],
          isBlackoutScene: true,
        },
      };
  
      function clearLoopTimer() {
        if (loopTimer) {
          clearInterval(loopTimer);
          loopTimer = null;
        }
      }
  
      function clearLoopEndTimer() {
        if (loopEndTimer) {
          clearTimeout(loopEndTimer);
          loopEndTimer = null;
        }
      }
  
      function clearZoomTimer() {
        if (zoomTimer) {
          clearTimeout(zoomTimer);
          zoomTimer = null;
        }
      }
  
      function clearBlackoutTimer() {
        if (blackoutTimer) {
          clearTimeout(blackoutTimer);
          blackoutTimer = null;
        }
      }
  
      function clearAllTimers() {
        clearLoopTimer();
        clearLoopEndTimer();
        clearZoomTimer();
        clearBlackoutTimer();
      }
  
      function clearOverlays() {
        overlays.innerHTML = "";
        activeHotspots = [];
      }
  
      function resetFxLayer() {
        fxLayer.innerHTML = "";
        fxLayer.className = "room5-fx-layer";
        fxLayer.style.display = "none";
      }
  
      function clearDialog() {
        dialogLayer.innerHTML = "";
      }
  
      function showEndingDialog() {
        clearDialog();
  
        dialogLayer.innerHTML = `
          <div class="room5-dialog-backdrop">
            <div class="room5-dialog-box">
              <div class="room5-dialog-text">
                <p>Everything fades into darkness.</p>
                <p>You can no longer tell whether this is an ending, or just another room.</p>
              </div>
              <div class="room5-dialog-actions">
                <button id="room5EndingBtn" class="hud-btn">Continue</button>
              </div>
            </div>
          </div>
        `;
  
        const btn = dialogLayer.querySelector("#room5EndingBtn");
        btn?.addEventListener("click", () => {
          localStorage.setItem("room5_done", "1");
          go("intro");
        });
      }
  
      function getDrawnImageRect(imgEl) {
        const wrapRect = wrap.getBoundingClientRect();
        const imgRect = imgEl.getBoundingClientRect();
  
        const naturalW = imgEl.naturalWidth || 1;
        const naturalH = imgEl.naturalHeight || 1;
        const naturalRatio = naturalW / naturalH;
  
        const boxW = imgRect.width;
        const boxH = imgRect.height;
        const boxRatio = boxW / boxH;
  
        let drawnW, drawnH, offsetX, offsetY;
  
        if (boxRatio > naturalRatio) {
          drawnH = boxH;
          drawnW = drawnH * naturalRatio;
          offsetX = (boxW - drawnW) / 2;
          offsetY = 0;
        } else {
          drawnW = boxW;
          drawnH = drawnW / naturalRatio;
          offsetX = 0;
          offsetY = (boxH - drawnH) / 2;
        }
  
        return {
          left: imgRect.left - wrapRect.left + offsetX,
          top: imgRect.top - wrapRect.top + offsetY,
          width: drawnW,
          height: drawnH,
          naturalWidth: naturalW,
          naturalHeight: naturalH,
        };
      }
  
      function placeRectOnImage(el, rect, imgDrawRect) {
        const scaleX = imgDrawRect.width / imgDrawRect.naturalWidth;
        const scaleY = imgDrawRect.height / imgDrawRect.naturalHeight;
  
        el.style.left = `${imgDrawRect.left + rect.x * scaleX}px`;
        el.style.top = `${imgDrawRect.top + rect.y * scaleY}px`;
        el.style.width = `${rect.w * scaleX}px`;
        el.style.height = `${rect.h * scaleY}px`;
      }
  
      function createHotspot({ rect, next, label }) {
        const btn = document.createElement("button");
        btn.className = "hotspot";
        btn.type = "button";
        btn.setAttribute("aria-label", label || "Interactive area");
  
        btn.addEventListener("click", () => {
          setScene(next);
        });
  
        overlays.appendChild(btn);
        activeHotspots.push({ el: btn, rect });
      }
  
      function layout() {
        if (!bg.naturalWidth || !bg.naturalHeight) return;
        const imgDrawRect = getDrawnImageRect(bg);
  
        activeHotspots.forEach(({ el, rect }) => {
          placeRectOnImage(el, rect, imgDrawRect);
        });
      }
  
      function startDistortionLoop() {
        clearAllTimers();
        clearOverlays();
        clearDialog();
        resetFxLayer();
  
        let frameIndex = 0;
        bg.src = DISTORTED_FRAMES[frameIndex];
  
        const relayout = () => layout();
        if (bg.complete) {
          relayout();
        } else {
          bg.onload = relayout;
        }
  
        loopTimer = setInterval(() => {
          if (destroyed || currentScene !== "distortedLoop") return;
          frameIndex = (frameIndex + 1) % DISTORTED_FRAMES.length;
          bg.src = DISTORTED_FRAMES[frameIndex];
        }, 120);
  
        loopEndTimer = setTimeout(() => {
          if (destroyed || currentScene !== "distortedLoop") return;
          setScene("blackout");
        }, 10000);
      }
  
      function playZoomIntoDistortion() {
        clearAllTimers();
        clearOverlays();
        clearDialog();
        resetFxLayer();
  
        fxLayer.style.display = "block";
        fxLayer.innerHTML = `
          <div class="room5-zoom-shell">
            <img
              src="./assets/bg/room5/vortex-room.png"
              alt=""
              class="room5-zoom-img"
              draggable="false"
            />
          </div>
        `;
  
        requestAnimationFrame(() => {
          fxLayer.classList.add("is-active");
          fxLayer.classList.add("is-zooming");
        });
  
        zoomTimer = setTimeout(() => {
          if (destroyed || currentScene !== "vortexZoom") return;
          resetFxLayer();
          setScene("distortedLoop");
        }, 900);
      }
  
      function playBlackoutEnding() {
        clearAllTimers();
        clearOverlays();
        clearDialog();
        resetFxLayer();
  
        bg.src = SCENES.blackout.bg;
  
        blackoutTimer = setTimeout(() => {
          if (destroyed || currentScene !== "blackout") return;
          showEndingDialog();
        }, 600);
      }
  
      function renderScene() {
        clearAllTimers();
        resetFxLayer();
        clearOverlays();
        clearDialog();
  
        const scene = SCENES[currentScene];
        if (!scene) return;
  
        if (scene.isZoomTransition) {
          bg.src = scene.bg;
          playZoomIntoDistortion();
          return;
        }
  
        if (scene.isDistortionLoop) {
          startDistortionLoop();
          return;
        }
  
        if (scene.isBlackoutScene) {
          playBlackoutEnding();
          return;
        }
  
        bg.src = scene.bg;
  
        for (const hotspot of scene.hotspots) {
          createHotspot(hotspot);
        }
  
        const relayout = () => layout();
        if (bg.complete) {
          relayout();
        } else {
          bg.onload = relayout;
        }
      }
  
      function setScene(sceneName) {
        currentScene = sceneName;
        renderScene();
      }
  
      backBtn.onclick = () => go("intro");
  
      debugBtn.onclick = () => {
        root.classList.toggle("debug-hotspots");
      };
  
      window.addEventListener("resize", layout);
  
      this._cleanup = () => {
        destroyed = true;
        clearAllTimers();
        window.removeEventListener("resize", layout);
      };
  
      renderScene();
    },
  
    exit({ root }) {
      if (this._cleanup) this._cleanup();
      root.innerHTML = "";
    },
  };