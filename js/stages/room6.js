import { showChapterEndDialog } from "../chapter-end-dialog.js";
import { closePhotoPopup, showPhotoPopup } from "../photo-popup.js";
import { createRoomBgm } from "../room-bgm.js";

export default {
    enter({ root, go }) {
      root.innerHTML = `
        <section class="scene" id="scene-room6">
          <div class="scene-inner" id="room6Wrap">
            <img
              id="bg"
              src="./assets/bg/room6/fog-forest.webp"
              class="bg"
              alt="Room 6 scene"
              draggable="false"
            />
  
            <div id="overlays" class="overlays" aria-hidden="false"></div>
  
          </div>
        </section>
      `;
  
      const wrap = root.querySelector("#room6Wrap");
      const bg = root.querySelector("#bg");
      const overlays = root.querySelector("#overlays");
  
      const BASE_W = 2560;
      const BASE_H = 1440;
      const bgm = createRoomBgm(
        "./assets/audio/room6/6 deep dream bgm_1.wav",
      );
  
      let scene = "fogForest";
      let debug = false;
      let shovelEl = null;
      let sequenceTimeouts = [];
  
      const RECTS = {
        fogForest: {
          shovelStart: { x: 250, y: 920, w: 260, h: 260 },
          digZone: { x: 600, y: 800, w: 1250, h: 500 },
        },
        lake: {
          middleZone: { x: 600, y: 900, w: 1500, h: 250 },
        },
        burningBush: {
          middleZone: { x: 600, y: 900, w: 1500, h: 250 },
        },
        wetRoom: {
          window: { x: 0, y: 210, w: 510, h: 520 },
        },
      };
  
      const SPIRIT_SEQUENCE = [
        "./assets/bg/room6/furniture-flying.webp",
        "./assets/bg/room6/spirits.webp",
        "./assets/bg/room6/spirits-rush.webp",
        "./assets/bg/room6/spirits-rush-2.webp",
      ];
  
      function clearTimers() {
        sequenceTimeouts.forEach((timer) => clearTimeout(timer));
        sequenceTimeouts = [];
      }
  
      function delay(fn, ms) {
        const timer = setTimeout(fn, ms);
        sequenceTimeouts.push(timer);
      }
  
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
        el.dataset.rect = JSON.stringify(rect);
  
        const imgRect = getDrawnImageRect();
        const sx = imgRect.width / BASE_W;
        const sy = imgRect.height / BASE_H;
  
        el.style.left = `${imgRect.left + rect.x * sx}px`;
        el.style.top = `${imgRect.top + rect.y * sy}px`;
        el.style.width = `${rect.w * sx}px`;
        el.style.height = `${rect.h * sy}px`;
      }
  
      function layout() {
        overlays.querySelectorAll("[data-rect]").forEach((el) => {
          const rect = JSON.parse(el.dataset.rect);
          placeRectOnImage(el, rect);
        });
      }
  
      function setBg(src) {
        bg.src = src;
      }
  
      function clearOverlays() {
        overlays.innerHTML = "";
        shovelEl = null;
      }
  
      function rectCenter(el) {
        const r = el.getBoundingClientRect();
        return {
          x: r.left + r.width / 2,
          y: r.top + r.height / 2,
        };
      }
  
      function isDroppedOnZone(el, zoneRect) {
        const c = rectCenter(el);
        const imgRect = getDrawnImageRect();
        const wrapRect = wrap.getBoundingClientRect();
  
        const sx = imgRect.width / BASE_W;
        const sy = imgRect.height / BASE_H;
  
        const zone = {
          left: wrapRect.left + imgRect.left + zoneRect.x * sx,
          top: wrapRect.top + imgRect.top + zoneRect.y * sy,
          width: zoneRect.w * sx,
          height: zoneRect.h * sy,
        };
  
        return (
          c.x >= zone.left &&
          c.x <= zone.left + zone.width &&
          c.y >= zone.top &&
          c.y <= zone.top + zone.height
        );
      }
  
      function makeHotspot(rect, onClick, label = "hotspot") {
        const btn = document.createElement("button");
        btn.className = "hotspot room6-hotspot";
        btn.setAttribute("aria-label", label);
        btn.addEventListener("click", onClick);
  
        overlays.appendChild(btn);
        placeRectOnImage(btn, rect);
  
        if (debug) btn.classList.add("debug-visible");
  
        return btn;
      }
  
      function makeDebugRect(rect) {
        if (!debug) return;
  
        const div = document.createElement("div");
        div.className = "room6-debug-rect";
        overlays.appendChild(div);
        placeRectOnImage(div, rect);
      }
  
      function makeShovel() {
        shovelEl = document.createElement("img");
        shovelEl.src = "./assets/props/room6/shovel.webp";
        shovelEl.className = "room6-shovel";
        shovelEl.draggable = false;
  
        overlays.appendChild(shovelEl);
        placeRectOnImage(shovelEl, RECTS.fogForest.shovelStart);
  
        let dragging = false;
        let offsetX = 0;
        let offsetY = 0;
  
        shovelEl.addEventListener("pointerdown", (e) => {
          dragging = true;
          shovelEl.setPointerCapture(e.pointerId);
  
          const r = shovelEl.getBoundingClientRect();
  
          offsetX = e.clientX - r.left;
          offsetY = e.clientY - r.top;
  
          shovelEl.classList.add("dragging");
        });
  
        shovelEl.addEventListener("pointermove", (e) => {
          if (!dragging) return;
  
          const wrapRect = wrap.getBoundingClientRect();
  
          shovelEl.style.left = `${e.clientX - wrapRect.left - offsetX}px`;
          shovelEl.style.top = `${e.clientY - wrapRect.top - offsetY}px`;
        });
  
        shovelEl.addEventListener("pointerup", () => {
          dragging = false;
          shovelEl.classList.remove("dragging");
  
          if (isDroppedOnZone(shovelEl, RECTS.fogForest.digZone)) {
            scene = "lake";
            render();
          }
        });
      }
  
      function makeBlackout() {
        setBg(""); 
      
        const black = document.createElement("button");
        black.className = "room6-blackout";
        black.setAttribute("aria-label", "Continue");
      
        requestAnimationFrame(() => {
          black.classList.add("visible");
        });
      
        black.addEventListener("click", () => {
          scene = "wetRoom";
          render();
        });
      
        overlays.appendChild(black);
      }

      function closeEggAlbum() {
        closePhotoPopup(overlays, "room6EggAlbum");
      }

      function showEggAlbum() {
        closeEggAlbum();

        showPhotoPopup({
          container: overlays,
          id: "room6EggAlbum",
          title: "Window memory",
          images: ["./assets/props/room6/egg6.1.webp?v=20260624-2"],
        });
      }
  
      function playSpiritSequence() {
        clearTimers();
  
        let i = 0;
  
        function nextFrame() {
          if (scene !== "spiritSequence") return;
  
          if (i < SPIRIT_SEQUENCE.length) {
            setBg(SPIRIT_SEQUENCE[i]);
            i += 1;
            delay(nextFrame, 2000);
          } else {
            scene = "blackout";
            render();
          }
        }
  
        nextFrame();
      }
  
      function render() {
        clearTimers();
        clearOverlays();
  
        if (scene === "fogForest") {
          setBg("./assets/bg/room6/fog-forest.webp");
          makeShovel();
          makeDebugRect(RECTS.fogForest.digZone);
        }
  
        if (scene === "lake") {
          setBg("./assets/bg/room6/lake.webp");
  
          makeHotspot(
            RECTS.lake.middleZone,
            () => {
              scene = "burningBush";
              render();
            },
            "Inspect the middle area"
          );
  
          makeDebugRect(RECTS.lake.middleZone);
        }
  
        if (scene === "burningBush") {
          setBg("./assets/bg/room6/burning-bush.webp");
  
          makeHotspot(
            RECTS.burningBush.middleZone,
            () => {
              scene = "roomOverlay";
              render();
            },
            "Inspect the middle area"
          );
  
          makeDebugRect(RECTS.burningBush.middleZone);
        }
  
        if (scene === "roomOverlay") {
          setBg("./assets/bg/room6/room-overlay.webp");
  
          delay(() => {
            scene = "spiritSequence";
            playSpiritSequence();
          }, 2000);
        }
  
        if (scene === "spiritSequence") {
          playSpiritSequence();
        }
  
        if (scene === "blackout") {
          makeBlackout();
        }
  
        if (scene === "wetRoom") {
          setBg("./assets/bg/room6/wet-room.webp");

          makeHotspot(
            RECTS.wetRoom.window,
            showEggAlbum,
            "Open window memory"
          );
        
          localStorage.setItem("room6_done", "1");
        
          showChapterEndDialog({
            container: overlays,
            text: "Can this get any worse?",
            onContinue: () => {
              window.dispatchEvent(
                new CustomEvent("stage:end", {
                  detail: {
                    nextStage: "room7",
                    menuStage: "intro",
                    nextLabel: "Next",
                    menuLabel: "Back to Menu",
                  },
                })
              );
            },
          });
        }

          function completeRoom6() {
            localStorage.setItem("room6_done", "1");

            showChapterEndDialog({
              container: overlays,
              text: "Can this get any worse?",
              onContinue: () => {
                window.dispatchEvent(
                  new CustomEvent("stage:end", {
                    detail: {
                      nextStage: "room7",
                      menuStage: "intro",
                      nextLabel: "Next",
                      menuLabel: "Back to Menu",
                    },
                  })
                );
              },
            });
          }
          
          function makeNextButton() {
            const nextBtn = document.createElement("button");
            nextBtn.className = "room6-next-btn";
            nextBtn.textContent = "Next";
          
            nextBtn.addEventListener("click", () => {
              completeRoom6();
            });
          
            overlays.appendChild(nextBtn);
          }
      }
  
      window.addEventListener("resize", layout);
  
      bgm.start();
      render();
  
      this.cleanup = () => {
        clearTimers();
        closeEggAlbum();
        bgm.stop();
        window.removeEventListener("resize", layout);
      };
    },
  
    exit({ root }) {
      if (this.cleanup) this.cleanup();
      root.innerHTML = "";
    },
  };
