// /js/stages/room9.js
export default {
    enter({ root, go }) {
      root.innerHTML = `
        <section class="scene" id="scene-room9">
          <div class="scene-inner" id="room9Wrap">
            <img
              id="bg"
              src="./assets/bg/room9/main-room.png"
              class="bg room9-bg"
              alt="Room 9 scene"
              draggable="false"
            />
  
            <div id="overlays" class="overlays" aria-hidden="false"></div>
            <div id="arrowLayer" class="room9-arrow-layer"></div>
            <div id="fxLayer" class="room9-fx-layer"></div>
  
            <div class="hud">
              <button id="backBtn" class="hud-btn">Back</button>
              <button id="debugBtn" class="hud-btn">Hotspots</button>
            </div>
  
            <button id="nextBtn" class="room9-next-btn hidden">Next →</button>
          </div>
        </section>
      `;
  
      const wrap = root.querySelector("#room9Wrap");
      const bg = root.querySelector("#bg");
      const overlays = root.querySelector("#overlays");
      const arrowLayer = root.querySelector("#arrowLayer");
      const backBtn = root.querySelector("#backBtn");
      const debugBtn = root.querySelector("#debugBtn");
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
          { to: "r4", dir: "right" },
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
          { to: "r61", dir: "right" },
        ],
        r6: [
          { to: "r5", dir: "back" },
        ],
        r61: [
          { to: "r62", dir: "right" },
          { to: "r5", dir: "left" },
        ],
        r62: [
          { to: "r61", dir: "left" },
        ],
      };
  
      const FILES = {
        "main-room": "main-room.png",
        "fog-4": "fog-4.png",
        "fog-3": "fog-3.png",
        "fog-2": "fog-2.png",
        "fog-1": "fog-1.png",
        "fog-boat": "fog-boat.png",
        further: "further.png",
        l1: "l1.png",
        l2: "l2.png",
        l3: "l3.png",
        l4: "l4.png",
        l5: "l5.png",
        m: "m.png",
        r1: "r1.png",
        r2: "r2.png",
        r3: "r3.png",
        r4: "r4.png",
        r5: "r5.png",
        r6: "r6.png",
        r61: "r61.png",
        r62: "r62.png",
        shore: "Shore.png",
        "bush-boat": "bush-boat.png",
        bush: "bush.png",
        "bush-fog": "bush-fog.png",
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
        localStorage.setItem("room9_done", "1");
        nextBtn.classList.remove("hidden");
      }
  
      function layout() {
        if (scene === "shore") {
          const hotspot = overlays.querySelector(".room9-hotspot");
          if (hotspot) placeRectOnImage(hotspot, RECTS.shore.bush);
        }
      }
  
      backBtn.addEventListener("click", () => {
        go("intro");
      });
  
      debugBtn.addEventListener("click", () => {
        debug = !debug;
        renderScene();
      });
  
      nextBtn.addEventListener("click", () => {
        go("intro");
      });
  
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