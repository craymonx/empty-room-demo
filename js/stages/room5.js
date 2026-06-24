// /js/stages/room5.js
import { createRoomBgm } from "../room-bgm.js";

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
  
          </div>
        </section>
      `;
  
      const wrap = root.querySelector("#room5Wrap");
      const bg = root.querySelector("#bg");
      const overlays = root.querySelector("#overlays");
      const fxLayer = root.querySelector("#fxLayer");
      const dialogLayer = root.querySelector("#dialogLayer");

      let currentScene = "bedroom";
      let activeHotspots = [];
      const bgm = createRoomBgm(
        "./assets/audio/room5/5 norewgian mood bgm_1.wav",
      );
      let loopTimer = null;
      let loopEndTimer = null;
      let zoomTimer = null;
      let destroyed = false;
      let hasShownOpeningDialog = false;
      let hasShownPillBottleDialog = false;

      const COORD_W = 2800;
      const COORD_H = 1800;
  
      const RECTS = {
        bedroom: {
          zone1: { x: 1480, y: 130, w: 980, h: 1500 },
        },
        mainView: {
          zone1: { x: 2050, y: 750, w: 480, h: 440 },
          window: { x: 700, y: 450, w: 265, h: 355 },
          table: { x: 330, y: 1090, w: 300, h: 250 },
        },
        close1: {
          zone1: { x: 1700, y: 560, w: 650, h: 700 },
        },
        close2: {
          zone1: { x: 1550, y: 400, w: 850, h: 800 },
        },
        close3: {
          zone1: { x: 1000, y: 200, w: 1350, h: 1500 },
        },
        kitchenCounter: {
          zone1: { x: 640, y: 0, w: 1020, h: 400 },
        },
        pillBottle: {
          zone1: { x: 1130, y: 650, w: 270, h: 550 },
        },
        openBottle: {
          zone1: { x: 1130, y: 650, w: 270, h: 550 },
        },
        blackLiquid: {
          zone1: { x: 730, y: 100, w: 1350, h: 1450 },
        },
        emptyBottle: {
          zone1: { x: 730, y: 100, w: 1350, h: 1450 },
        },
        emptyBottleTop: {
          zone1: { x: 730, y: 100, w: 1350, h: 1450 },
        },
        vortexRoom: {
          zone1: { x: 730, y: 100, w: 1350, h: 1450 },
        },
      };

  
      const DISTORTED_FRAMES = [
        "./assets/bg/room5/distorted-1.webp",
        "./assets/bg/room5/distorted-2.webp",
        "./assets/bg/room5/distorted-3.webp",
        "./assets/bg/room5/distorted-4.webp",
        "./assets/bg/room5/distorted-5.webp",
        "./assets/bg/room5/distorted-6.webp",
        "./assets/bg/room5/distorted-7.webp",
      ];
  
      const SCENES = {
        bedroom: {
          bg: "./assets/bg/room5/bedroom.gif",
          hotspots: [{ rect: RECTS.bedroom.zone1, next: "mainView", label: "Go to main view" }],
        },
  
        mainView: {
          bg: "./assets/bg/room5/main-view.webp",
          hotspots: [
            { rect: RECTS.mainView.zone1, next: "close1", label: "Zoom in" },
            {
              rect: RECTS.mainView.window,
              action: () => showEggAlbum({
                title: "Window memory",
                image: "./assets/props/room5/egg5.1.webp?v=20260624-1",
              }),
              label: "Open window memory",
            },
            {
              rect: RECTS.mainView.table,
              action: () => showEggAlbum({
                title: "Table memory",
                image: "./assets/props/room5/egg5.2.webp?v=20260624-1",
              }),
              label: "Open table memory",
            },
          ],
        },
  
        close1: {
          bg: "./assets/bg/room5/close-1.webp",
          hotspots: [{ rect: RECTS.close1.zone1, next: "close2", label: "Zoom in closer" }],
        },
  
        close2: {
          bg: "./assets/bg/room5/close-2.webp",
          hotspots: [{ rect: RECTS.close2.zone1, next: "close3", label: "Zoom in closer again" }],
        },
  
        close3: {
          bg: "./assets/bg/room5/close-3.webp",
          hotspots: [{ rect: RECTS.close3.zone1, next: "kitchenCounter", label: "Go to kitchen counter" }],
        },
  
        kitchenCounter: {
          bg: "./assets/bg/room5/kitchen-counter.webp",
          hotspots: [{ rect: RECTS.kitchenCounter.zone1, next: "pillBottle", label: "Inspect bottle" }],
        },
  
        pillBottle: {
          bg: "./assets/bg/room5/pill-bottle.webp",
          hotspots: [{ rect: RECTS.pillBottle.zone1, next: "openBottle", label: "Open bottle" }],
        },
  
        openBottle: {
          bg: "./assets/bg/room5/open-bottle.webp",
          hotspots: [{ rect: RECTS.openBottle.zone1, next: "blackLiquid", label: "Inspect opened bottle" }],
        },
  
        blackLiquid: {
          bg: "./assets/bg/room5/black-liquid.webp",
          hotspots: [{ rect: RECTS.blackLiquid.zone1, next: "emptyBottle", label: "Continue" }],
        },
  
        emptyBottle: {
          bg: "./assets/bg/room5/empty-bottle.webp",
          hotspots: [{ rect: RECTS.emptyBottle.zone1, next: "emptyBottleTop", label: "Continue" }],
        },
  
        emptyBottleTop: {
          bg: "./assets/bg/room5/empty-bottle-top.webp",
          hotspots: [{ rect: RECTS.emptyBottleTop.zone1, next: "vortexRoom", label: "Continue" }],
        },
  
        vortexRoom: {
          bg: "./assets/bg/room5/vortex-room.webp",
          hotspots: [{ rect: RECTS.vortexRoom.zone1, next: "vortexZoom", label: "Enter distortion" }],
        },
  
        vortexZoom: {
          bg: "./assets/bg/room5/vortex-room.webp",
          hotspots: [],
          isZoomTransition: true,
        },
  
        distortedLoop: {
          bg: DISTORTED_FRAMES[0],
          hotspots: [],
          isDistortionLoop: true,
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
  
  
      function clearAllTimers() {
        clearLoopTimer();
        clearLoopEndTimer();
        clearZoomTimer();
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
  
      function getDrawnImageRect(imgEl) {
        const wrapRect = wrap.getBoundingClientRect();
      
        const naturalW = imgEl.naturalWidth || COORD_W;
        const naturalH = imgEl.naturalHeight || COORD_H;
        const naturalRatio = naturalW / naturalH;
      
        const wrapRatio = wrapRect.width / wrapRect.height;
      
        let drawnW;
        let drawnH;
        let left;
        let top;
      
        if (naturalRatio > wrapRatio) {
          drawnW = wrapRect.width;
          drawnH = drawnW / naturalRatio;
          left = 0;
          top = (wrapRect.height - drawnH) / 2;
        } else {
          drawnH = wrapRect.height;
          drawnW = drawnH * naturalRatio;
          top = 0;
          left = (wrapRect.width - drawnW) / 2;
        }
      
        return {
          left,
          top,
          width: drawnW,
          height: drawnH,
        };
      }
  
      function placeRectOnImage(el, rect, imgDrawRect) {
        el.style.left = `${imgDrawRect.left + (rect.x / COORD_W) * imgDrawRect.width}px`;
        el.style.top = `${imgDrawRect.top + (rect.y / COORD_H) * imgDrawRect.height}px`;
        el.style.width = `${(rect.w / COORD_W) * imgDrawRect.width}px`;
        el.style.height = `${(rect.h / COORD_H) * imgDrawRect.height}px`;
      }
  
      function createHotspot({ rect, next, action, label }) {
        const btn = document.createElement("button");
        btn.className = "hotspot";
        btn.type = "button";
        btn.setAttribute("aria-label", label || "Interactive area");
  
        btn.addEventListener("click", () => {
          if (typeof action === "function") {
            action();
            return;
          }

          setScene(next);
        });
  
        overlays.appendChild(btn);
        activeHotspots.push({ el: btn, rect });
      }

      function closeEggAlbum() {
        dialogLayer.querySelector("#room5EggAlbum")?.remove();
      }

      function showEggAlbum({ title, image }) {
        closeEggAlbum();

        const album = document.createElement("div");
        album.id = "room5EggAlbum";
        album.className = "room5-egg-album";
        album.innerHTML = `
          <div class="room5-egg-album__backdrop"></div>
          <div class="room5-egg-album__book" role="dialog" aria-modal="true" aria-label="${title}">
            <button
              id="room5EggAlbumClose"
              class="room5-egg-album__close"
              type="button"
              aria-label="Close album"
            >×</button>

            <div class="room5-egg-album__spine" aria-hidden="true"></div>

            <div class="room5-egg-album__page">
              <div class="room5-egg-album__photo-frame">
                <img class="room5-egg-album__image" src="${image}" alt="${title}">
              </div>

              <div class="room5-egg-album__caption">
                <span>${title}</span>
                <span>1 / 1</span>
              </div>
            </div>
          </div>
        `;

        dialogLayer.appendChild(album);

        album
          .querySelector("#room5EggAlbumClose")
          .addEventListener("click", closeEggAlbum);

        album
          .querySelector(".room5-egg-album__backdrop")
          .addEventListener("click", closeEggAlbum);
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
      
          localStorage.setItem("room5_done", "1");
      
          window.dispatchEvent(
            new CustomEvent("stage:end", {
              detail: {
                nextStage: "room6",
                menuStage: "intro",
                nextLabel: "Next",
                menuLabel: "Back to Menu",
              },
            })
          );
        }, 5000);
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
              src="./assets/bg/room5/vortex-room.webp"
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
  
      function showRoom5Dialog(message, onClose) {
        dialogLayer.innerHTML = `
          <div class="rpg-ui room5-opening-dialog">
            <div class="rpg-box rpg-box--dialog">
              <div class="rpg-text">${message}</div>
              <button
                type="button"
                class="rpg-continue"
                id="room5DialogContinue"
              >
                Continue
              </button>
            </div>
          </div>
        `;
      
        const continueBtn = dialogLayer.querySelector("#room5DialogContinue");
      
        continueBtn.addEventListener("click", () => {
          clearDialog();
      
          if (typeof onClose === "function") {
            onClose();
          }
        });
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
  
        bg.onload = () => {
          layout();
        };
        
        bg.onerror = () => {
          console.error("Failed to load Room 5 image:", scene.bg);
        };
        
        bg.src = scene.bg;
        
        for (const hotspot of scene.hotspots) {
          createHotspot(hotspot);
        }
        
        // Handles cached images
        if (bg.complete && bg.naturalWidth > 0) {
          layout();
        }

        if (currentScene === "bedroom" && !hasShownOpeningDialog) {
          hasShownOpeningDialog = true;
          showRoom5Dialog("I’m not feeling so well…");
        }
        
        if (currentScene === "kitchenCounter" && !hasShownPillBottleDialog) {
          hasShownPillBottleDialog = true;
          showRoom5Dialog("I think my pills are in the cabinet…");
        }
      }
  
      function setScene(sceneName) {
        currentScene = sceneName;
        renderScene();
      }
  
      window.addEventListener("resize", layout);
  
      this._cleanup = () => {
        destroyed = true;
        clearAllTimers();
        bgm.stop();
        closeEggAlbum();
        window.removeEventListener("resize", layout);
      };
  
      bgm.start();
      renderScene();
    },
  
    exit({ root }) {
      if (this._cleanup) this._cleanup();
      root.innerHTML = "";
    },
  };
