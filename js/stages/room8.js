// /js/stages/room8.js
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
    let mopLocked = false;
    let completionTimer = null;

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
      },
    };

    const RECTS = {
      clock: { x: 550, y: 200, w: 100, h: 100 },

      props: {
        mop: { x: 220, y: 690, w: 170, h: 300 },
        spray: { x: 1510, y: 680, w: 150, h: 270 },
      },

      mopTarget: { x: 870, y: 620, w: 180, h: 310 },
      floor: { x: 650, y: 520, w: 650, h: 450 },

      plants: {
        plant1: { x: 100, y: 720, w: 180, h: 300 },
        plant2: { x: 750, y: 180, w: 250, h: 500 },
        plant3: { x: 810, y: 650, w: 400, h: 275 },
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

    function createProp(id, src, rect, draggable = true) {
      const img = document.createElement("img");
      img.id = id;
      img.src = src;
      img.className = "room8-prop";
      img.draggable = false;
      overlays.appendChild(img);
      placeRectOnImage(img, rect);

      if (draggable) makeDraggable(img, rect);

      return img;
    }

    function makeDraggable(el, homeRect) {
      let dragging = false;
      let offsetX = 0;
      let offsetY = 0;

      el.addEventListener("pointerdown", (e) => {
        if (scene === "mainCloudy" || mopLocked) return;

        dragging = true;

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
      });

      el.addEventListener("pointerup", (e) => {
        if (!dragging) return;

        dragging = false;
        el.releasePointerCapture(e.pointerId);
        el.classList.remove("is-dragging");

        handleDrop(el, homeRect);
      });
    }

    function plantDropSuccess(el) {
      return Object.values(RECTS.plants).some((rect) =>
        isDroppedOnZone(el, rect),
      );
    }

    function handleDrop(el, homeRect) {
      if (el.id === "mopItem") {
        if (scene === "sunnyWaterLeak" && isDroppedOnZone(el, RECTS.floor)) {
          scene = "dried";
          bg.src = ASSETS.bg.dried;
          render();
          return;
        }
      }

      if (el.id === "sprayItem") {
        if (scene === "dried" && plantDropSuccess(el)) {
          el.src = ASSETS.props.sprayHalf;

          setTimeout(() => {
            scene = "sunnyWaterLeak2";
            bg.src = ASSETS.bg.sunnyWaterLeak;
            render();
          }, 1000);

          return;
        }

        if (scene === "cloudyDried" && plantDropSuccess(el)) {
          scene = "cloudyWaterLeak";
          bg.src = ASSETS.bg.cloudyWaterLeak;
          render();
          return;
        }
      }

      placeRectOnImage(el, homeRect);
    }

    function animateMopToMiddle(nextScene, nextBg) {
      const mop = root.querySelector("#mopItem");
      if (!mop || mopLocked) return;

      mopLocked = true;
      mop.classList.add("room8-mop-auto");
      placeRectOnImage(mop, RECTS.mopTarget);

      setTimeout(() => {
        scene = nextScene;
        bg.src = nextBg;
        mopLocked = false;
        render();

        if (nextScene === "driedNight") {
          completionTimer = window.setTimeout(finishRoom, 3000);
        }
      }, 900);
    }

    function finishRoom() {
      completionTimer = null;
      localStorage.setItem("room8_done", "1");

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
    }

    function drawDebugRects() {
      if (!debug) return;

      const rects = [];

      if (scene === "mainCloudy") rects.push(RECTS.clock);
      if (scene === "sunnyWaterLeak") rects.push(RECTS.floor);
      if (scene === "dried" || scene === "cloudyDried") {
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

      createProp("mopItem", ASSETS.props.mop, RECTS.props.mop, true);

      if (scene === "mainCloudy") {
        createProp(
          "sprayItem",
          ASSETS.props.sprayFull,
          RECTS.props.spray,
          true,
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
          true,
        );

        const mop = root.querySelector("#mopItem");
        mop.addEventListener("click", () => {
          animateMopToMiddle("cloudyDried", ASSETS.bg.cloudyDried);
        });
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
        const mop = root.querySelector("#mopItem");
        mop.addEventListener("click", () => {
          animateMopToMiddle("driedNight", ASSETS.bg.driedNight);
        });
      }

      if (scene === "driedNight") {
        // final scene: mop remains, spray removed
      }

      drawDebugRects();
    }

    function layout() {
      render();
    }

    window.addEventListener("resize", layout);
    bg.addEventListener("load", () => requestAnimationFrame(layout));

    render();

    this.cleanup = () => {
      window.removeEventListener("resize", layout);
      if (completionTimer) {
        window.clearTimeout(completionTimer);
        completionTimer = null;
      }
    };
  },

  exit() {
    if (this.cleanup) this.cleanup();
  },
};
