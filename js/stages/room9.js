// /js/stages/room9.js
export default {
    enter({ root, go }) {
      root.innerHTML = `
        <section class="scene" id="scene-room9">
          <div class="scene-inner" id="room9Wrap">
            <img
              id="bg"
              src="./assets/bg/room9/main-room.webp"
              class="bg room9-bg"
              alt="Room 9 scene"
              draggable="false"
            />
  
            <div id="overlays" class="overlays" aria-hidden="false"></div>
            <div id="arrowLayer" class="room9-arrow-layer"></div>
            <div id="fxLayer" class="room9-fx-layer"></div>

  
            <button id="nextBtn" class="room9-next-btn hidden">Next →</button>
          </div>
        </section>
      `;
  
      const wrap = root.querySelector("#room9Wrap");
      const bg = root.querySelector("#bg");
      const overlays = root.querySelector("#overlays");
      const arrowLayer = root.querySelector("#arrowLayer");
      const nextBtn = root.querySelector("#nextBtn");
  
      const BASE_W = 1920;
      const BASE_H = 1080;
      const BG_PATH = "./assets/bg/room9/";
  
      let scene = "main-room";
      let debug = false;
      let isLocked = false;
      let timers = [];
  
      const RECTS = {
        shore: {
          bush: { x: 620, y: 120, w: 760, h: 650 },
        },
        r61: {
          house: { x: 690, y: 420, w: 500, h: 250 },
        },
      };
  
      const ROUTES = {
        further: [
          { to: "l1", dir: "left" },
          { to: "r1", dir: "right" },
        ],
  
        l1: [
          { to: "l2", dir: "forward" },
          { to: "further", dir: "back" },
        ],
        l2: [
          { to: "l3", dir: "forward" },
          { to: "l1", dir: "back" },
        ],
        l3: [
          { to: "l4", dir: "forward" },
          { to: "l2", dir: "back" },
        ],
        l4: [
          { to: "l5", dir: "forward" },
          { to: "l3", dir: "back" },
          { to: "m", dir: "right" },
        ],
        l5: [
          { to: "l4", dir: "back" },
        ],
  
        m: [
          { to: "shore", dir: "forward" },
          { to: "further", dir: "back" },
          { to: "l4", dir: "left" },
          { to: "r5", dir: "right" },
        ],
  
        shore: [
          { to: "m", dir: "back" },
        ],
  
        r1: [
          { to: "r2", dir: "forward" },
          { to: "further", dir: "back" },
        ],
        r2: [
          { to: "r3", dir: "forward" },
          { to: "r1", dir: "back" },
        ],
        r3: [
          { to: "r4", dir: "forward" },
          { to: "r2", dir: "back" },
        ],
        r4: [
          { to: "r5", dir: "forward" },
          { to: "r3", dir: "back" },
          { to: "m", dir: "left" },
        ],
        r5: [
          { to: "r6", dir: "forward" },
          { to: "r4", dir: "back" },
          { to: "m", dir: "left" },
          { to: "r61", dir: "right" },
        ],
        r6: [
          { to: "r5", dir: "back" },
        ],
        r61: [
          { to: "r5", dir: "left" },
        ],
        r62: [
          { to: "r61", dir: "back" },
        ],
      };
  
      const FILES = {
        "main-room": "main-room.webp",
        "fog-4": "fog-4.webp",
        "fog-3": "fog-3.webp",
        "fog-2": "fog-2.webp",
        "fog-1": "fog-1.webp",
        "fog-boat": "fog-boat.webp",
        further: "further.webp",
        l1: "l1.webp",
        l2: "l2.webp",
        l3: "l3.webp",
        l4: "l4.webp",
        l5: "l5.webp",
        m: "m.webp",
        r1: "r1.webp",
        r2: "r2.webp",
        r3: "r3.webp",
        r4: "r4.webp",
        r5: "r5.webp",
        r6: "r6.webp",
        r61: "r61.webp",
        r62: "r62.webp",
        shore: "shore-forest.webp",
        "bush-boat": "bush-boat.webp",
        bush: "bush.webp",
        "bush-fog": "bush-fog.webp",
      };
  
      function clearTimers() {
        timers.forEach(clearTimeout);
        timers = [];
      }
  
      function wait(ms) {
        return new Promise((resolve) => {
          const t = setTimeout(resolve, ms);
          timers.push(t);
        });
      }
  
      function getSrc(sceneName) {
        return `${BG_PATH}${FILES[sceneName]}`;
      }
  
      function getDrawnImageRect(img) {
        const wrapRect = wrap.getBoundingClientRect();
        const imgRatio = BASE_W / BASE_H;
        const wrapRatio = wrapRect.width / wrapRect.height;
  
        let w;
        let h;
        let x;
        let y;
  
        if (wrapRatio > imgRatio) {
          h = wrapRect.height;
          w = h * imgRatio;
          x = (wrapRect.width - w) / 2;
          y = 0;
        } else {
          w = wrapRect.width;
          h = w / imgRatio;
          x = 0;
          y = (wrapRect.height - h) / 2;
        }
  
        return { x, y, w, h };
      }
  
      function placeRectOnImage(el, rect) {
        const drawn = getDrawnImageRect(bg);
        const sx = drawn.w / BASE_W;
        const sy = drawn.h / BASE_H;
  
        el.style.left = `${drawn.x + rect.x * sx}px`;
        el.style.top = `${drawn.y + rect.y * sy}px`;
        el.style.width = `${rect.w * sx}px`;
        el.style.height = `${rect.h * sy}px`;
      }
  
      async function setScene(nextScene, options = {}) {
        const { fade = true, render = true } = options;
      
        if (isLocked) return;
        isLocked = true;
      
        scene = nextScene;
      
        overlays.innerHTML = "";
        arrowLayer.innerHTML = "";
      
        if (fade) {
          bg.classList.add("is-changing");
          await wait(180);
        }
      
        bg.src = getSrc(nextScene);
      
        await new Promise((resolve) => {
          if (bg.complete) {
            resolve();
          } else {
            bg.onload = resolve;
            bg.onerror = resolve;
          }
        });
      
        if (fade) {
          await wait(120);
          bg.classList.remove("is-changing");
        }
      
        isLocked = false;
      
        if (render) renderScene();
      }
  
      function renderScene() {
        overlays.innerHTML = "";
        arrowLayer.innerHTML = "";
        nextBtn.classList.add("hidden");
  
        if (ROUTES[scene]) {
          renderArrows();
        }
  
        if (scene === "shore") {
          renderShoreHotspot();
        }

        if (scene === "r61") {
          renderR61HouseHotspot();
        } 
      }

      function renderFogBoatArrow() {
        overlays.innerHTML = "";
        arrowLayer.innerHTML = "";
      
        const btn = document.createElement("button");
        btn.className = "room9-nav-arrow forward";
        btn.type = "button";
        btn.setAttribute("aria-label", "Go further");
      
        btn.addEventListener("click", () => {
          setScene("further", { fade: true, render: true });
        });
      
        arrowLayer.appendChild(btn);
      }
  
      function renderArrows() {
        const routes = ROUTES[scene] || [];
  
        routes.forEach((route) => {
          const btn = document.createElement("button");
          btn.className = `room9-nav-arrow ${route.dir}`;
          btn.type = "button";
          btn.setAttribute("aria-label", `Go to ${route.to}`);
  
          btn.addEventListener("click", () => {
            setScene(route.to, { fade: true });
          });
  
          arrowLayer.appendChild(btn);
        });
      }
  
      function renderShoreHotspot() {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `room9-hotspot ${debug ? "debug" : ""}`;
        btn.setAttribute("aria-label", "Inspect burning bush");
  
        btn.addEventListener("click", () => {
          startBushSequence();
        });
  
        overlays.appendChild(btn);
        placeRectOnImage(btn, RECTS.shore.bush);
      }

      function renderR61HouseHotspot() {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `room9-hotspot ${debug ? "debug" : ""}`;
        btn.setAttribute("aria-label", "Inspect house");
      
        btn.addEventListener("click", () => {
          setScene("r62", { fade: true, render: true });
        });
      
        overlays.appendChild(btn);
        placeRectOnImage(btn, RECTS.r61.house);
      }
  
      async function startIntroSequence() {
        const intro = [
          "main-room",
          "fog-4",
          "fog-3",
          "fog-2",
          "fog-1",
          "fog-boat",
        ];
      
        for (const s of intro) {
          await setScene(s, { fade: false, render: false });
          await wait(1500);
        }
      
        renderFogBoatArrow();
      }
  
      async function startBushSequence() {
        overlays.innerHTML = "";
        arrowLayer.innerHTML = "";
  
        await setScene("bush-boat", { fade: false, render: false });
  
        const catcher = document.createElement("button");
        catcher.className = "room9-click-catcher";
        catcher.type = "button";
        catcher.setAttribute("aria-label", "Continue");
        overlays.appendChild(catcher);
  
        catcher.addEventListener(
          "click",
          async () => {
            overlays.innerHTML = "";
  
            await setScene("bush", { fade: false, render: false });
            await wait(1000);
  
            await setScene("bush-fog", { fade: false, render: false });
            await wait(1200);
  
            const returnSeq = ["fog-1", "fog-2", "fog-3", "fog-4", "main-room"];

for (const s of returnSeq) {
  await setScene(s, { fade: false, render: false });
  await wait(1000);
}
  
            finishRoom();
          },
          { once: true }
        );
      }
  
      function finishRoom() {
        scene = "main-room";
        overlays.innerHTML = "";
        arrowLayer.innerHTML = "";
        localStorage.setItem("room8_done", "1");

        window.dispatchEvent(
          new CustomEvent("stage:end", {
            detail: {
              nextStage: "room10",
              menuStage: "intro",
              nextLabel: "Next",
              menuLabel: "Back to Menu",
            },
          })
        );
      }
  
      function layout() {
        const hotspot = overlays.querySelector(".room9-hotspot");
        if (!hotspot) return;
      
        if (scene === "shore") {
          placeRectOnImage(hotspot, RECTS.shore.bush);
        }
      
        if (scene === "r61") {
          placeRectOnImage(hotspot, RECTS.r61.house);
        }
      }

      window.addEventListener("resize", layout);
      bg.addEventListener("load", layout);
  
      startIntroSequence();
  
      this._cleanup = () => {
        clearTimers();
        window.removeEventListener("resize", layout);
        bg.removeEventListener("load", layout);
      };
    },
  
    exit() {
      if (this._cleanup) this._cleanup();
    },
  };