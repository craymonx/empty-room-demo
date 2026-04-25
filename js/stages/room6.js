export default {
    enter({ root, go }) {
      root.innerHTML = `
        <section class="scene" id="scene-room6">
          <div class="scene-inner" id="room6Wrap">
            <img
              id="bg"
              src="./assets/bg/room6/fog-forest.png"
              class="bg"
              alt="Room 6 scene"
              draggable="false"
            />
  
            <div id="overlays" class="overlays" aria-hidden="false"></div>
  
            <div class="hud">
              <button id="backBtn" class="hud-btn">Back</button>
              <button id="debugBtn" class="hud-btn">Hotspots</button>
            </div>
          </div>
        </section>
      `;
  
      const wrap = root.querySelector("#room6Wrap");
      const bg = root.querySelector("#bg");
      const overlays = root.querySelector("#overlays");
      const backBtn = root.querySelector("#backBtn");
      const debugBtn = root.querySelector("#debugBtn");
  
      const BASE_W = 2560;
      const BASE_H = 1440;
  
      let scene = "fogForest";
      let debug = false;
      let shovelEl = null;
      let sequenceTimeouts = [];
  
      const RECTS = {
        fogForest: {
          shovelStart: { x: 250, y: 920, w: 260, h: 260 },
          digZone: { x: 1060, y: 560, w: 440, h: 360 },
        },
        lake: {
          middleZone: { x: 600, y: 900, w: 1500, h: 250 },
        },
        burningBush: {
          middleZone: { x: 600, y: 900, w: 1500, h: 250 },
        },
      };
  
      const SPIRIT_SEQUENCE = [
        "./assets/bg/room6/furniture-flying.png",
        "./assets/bg/room6/spirits.png",
        "./assets/bg/room6/spirits-rush.png",
        "./assets/bg/room6/spirits-rush-2.png",
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
        shovelEl.src = "./assets/props/room6/shovel.png";
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
          setBg("./assets/bg/room6/fog-forest.png");
          makeShovel();
          makeDebugRect(RECTS.fogForest.digZone);
        }
  
        if (scene === "lake") {
          setBg("./assets/bg/room6/lake.png");
  
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
          setBg("./assets/bg/room6/burning-bush.png");
  
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
          setBg("./assets/bg/room6/room-overlay.png");
  
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
            setBg("./assets/bg/room6/wet-room.png");
            makeNextButton();
          }

          function completeRoom6() {
            localStorage.setItem("room6_done", "1");
            go("intro");
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
  
      backBtn.addEventListener("click", () => go("intro"));
  
      debugBtn.addEventListener("click", () => {
        debug = !debug;
        render();
      });
  
      window.addEventListener("resize", layout);
  
      render();
  
      this.cleanup = () => {
        clearTimers();
        window.removeEventListener("resize", layout);
      };
    },
  
    exit({ root }) {
      if (this.cleanup) this.cleanup();
      root.innerHTML = "";
    },
  };