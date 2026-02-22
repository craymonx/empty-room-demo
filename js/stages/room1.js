// /js/stages/room1.js
export default {
  enter({ root, go }) {
    root.innerHTML = `
      <section class="scene" id="scene-room1">
        <div class="scene-inner" id="room1Wrap">
          <img
            id="bg"
            src="./assets/bg/kitchen-light-on.png"
            class="bg"
            alt="Kitchen scene"
            draggable="false"
          />

          <button
            id="kitchenStove"
            class="hotspot kitchen-stove"
            aria-label="Zoom into the stove"
          ></button>

          <div id="overlays" class="overlays" aria-hidden="false"></div>

          <div class="hud">
            <button id="backBtn" class="hud-btn">Back</button>
            <button id="debugBtn" class="hud-btn">Hotspots</button>
          </div>
        </div>
      </section>
    `;

    const sceneEl = root.querySelector("#scene-room1");
    const wrap = root.querySelector("#room1Wrap");
    const bg = root.querySelector("#bg");
    const overlays = root.querySelector("#overlays");
    const stoveBtn = root.querySelector("#kitchenStove");

    // Game state
    // kitchen -> stove (drag) -> cooked (click pot) -> emptyPot (click anywhere) -> mainView (click anywhere) -> glassEmpty
    let scene = "kitchen";
    let cleanupDrag = null;

    // --- EDIT THESE in ORIGINAL IMAGE PIXELS (naturalWidth/naturalHeight) ----
    const RECTS = {
      kitchen: {
        // kitchen-light-on.png
        stove: { x: 500, y: 420, w: 420, h: 150 },
      },
      stove: {
        // pot-with-noodle-on-stove.png
        noodles: { x: 1000, y: 530, w: 120, h: 50 }, // starting noodles position
        pot: { x: 640, y: 320, w: 200, h: 250 }, // dropzone over pot
      },
    };


    // ---- helpers ------------------------------------------------------------
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));

    function getDrawnImageRect(imgEl) {
      const box = imgEl.getBoundingClientRect();
      const nW = imgEl.naturalWidth || 1;
      const nH = imgEl.naturalHeight || 1;

      // CSS uses object-fit: contain
      const scale = Math.min(box.width / nW, box.height / nH);
      const drawnW = nW * scale;
      const drawnH = nH * scale;

      const left = box.left + (box.width - drawnW) / 2;
      const top = box.top + (box.height - drawnH) / 2;

      return { left, top, width: drawnW, height: drawnH, scale };
    }

    function placeRectOnImage({ imgEl, parentEl, targetEl, rectPx }) {
      if (!imgEl.complete || !imgEl.naturalWidth) return;

      const drawn = getDrawnImageRect(imgEl);
      const parentBox = parentEl.getBoundingClientRect();

      const left = drawn.left + rectPx.x * drawn.scale - parentBox.left;
      const top = drawn.top + rectPx.y * drawn.scale - parentBox.top;
      const width = rectPx.w * drawn.scale;
      const height = rectPx.h * drawn.scale;

      targetEl.style.left = `${left}px`;
      targetEl.style.top = `${top}px`;
      targetEl.style.width = `${width}px`;
      targetEl.style.height = `${height}px`;
    }

    function layout() {
      if (!bg.complete || !bg.naturalWidth) return;

      if (scene === "kitchen") {
        if (stoveBtn.style.display !== "none") {
          placeRectOnImage({
            imgEl: bg,
            parentEl: wrap,
            targetEl: stoveBtn,
            rectPx: RECTS.kitchen.stove,
          });
        }
      }

      if (scene === "stove") {
        const noodles = overlays.querySelector("#noodles");
        const potZone = overlays.querySelector("#potDropzone");

        if (noodles) {
          placeRectOnImage({
            imgEl: bg,
            parentEl: wrap,
            targetEl: noodles,
            rectPx: RECTS.stove.noodles,
          });
        }
        if (potZone) {
          placeRectOnImage({
            imgEl: bg,
            parentEl: wrap,
            targetEl: potZone,
            rectPx: RECTS.stove.pot,
          });
        }
      }

      // When cooked/emptyPot, we keep a clickable pot hotspot
      if (scene === "cooked" || scene === "emptyPot") {
        const potHotspot = overlays.querySelector("#potClickHotspot");
        if (potHotspot) {
          placeRectOnImage({
            imgEl: bg,
            parentEl: wrap,
            targetEl: potHotspot,
            rectPx: RECTS.stove.pot,
          });
        }
      }
    }

    async function transitionBg(nextSrc) {
      bg.classList.add("is-fading");
      await wait(180);
      bg.src = nextSrc;

      await new Promise((resolve) => {
        if (bg.complete) return resolve();
        bg.addEventListener("load", resolve, { once: true });
      });

      bg.classList.remove("is-fading");
      layout();
    }

    function clearOverlays() {
      if (cleanupDrag) {
        cleanupDrag();
        cleanupDrag = null;
      }
      overlays.innerHTML = "";
    }

    function rectCenter(r) {
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }

    function isDroppedOnZone(draggableEl, zoneEl) {
      const dRect = draggableEl.getBoundingClientRect();
      const zRect = zoneEl.getBoundingClientRect();
      const c = rectCenter(dRect);
      return c.x >= zRect.left && c.x <= zRect.right && c.y >= zRect.top && c.y <= zRect.bottom;
    }

    function makeDraggable({ el, dropzone, onDrop }) {
      let dragging = false;
      let startX = 0;
      let startY = 0;
      let currentX = 0;
      let currentY = 0;

      function onPointerDown(e) {
        if (scene !== "stove") return;
        dragging = true;
        el.setPointerCapture?.(e.pointerId);
        startX = e.clientX;
        startY = e.clientY;
        el.classList.add("is-dragging");
      }

      function onPointerMove(e) {
        if (!dragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        currentX += dx;
        currentY += dy;
        startX = e.clientX;
        startY = e.clientY;
        el.style.transform = `translate(${currentX}px, ${currentY}px)`;
      }

      async function onPointerUp() {
        if (!dragging) return;
        dragging = false;
        el.classList.remove("is-dragging");
        if (isDroppedOnZone(el, dropzone)) await onDrop();
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

    // A full-screen click layer for "click anywhere to continue"
    function enableClickAnywhere(handler) {
      // remove existing if any
      const old = overlays.querySelector("#clickAnywhere");
      if (old) old.remove();

      const layer = document.createElement("button");
      layer.id = "clickAnywhere";
      layer.className = "click-anywhere";
      layer.type = "button";
      layer.setAttribute("aria-label", "Continue");
      layer.addEventListener("click", handler);
      overlays.appendChild(layer);
    }

    function disableClickAnywhere() {
      const layer = overlays.querySelector("#clickAnywhere");
      if (layer) layer.remove();
    }

    function showPotClickHotspot(onClick) {
      const old = overlays.querySelector("#potClickHotspot");
      if (old) old.remove();

      const btn = document.createElement("button");
      btn.id = "potClickHotspot";
      btn.className = "hotspot pot-click";
      btn.type = "button";
      btn.setAttribute("aria-label", "Pot");
      btn.addEventListener("click", onClick);
      overlays.appendChild(btn);

      layout();
    }

    // --- Step 2/3 overlays (drag noodles) -----------------------------------
    function createStoveSceneOverlays() {
      const noodles = document.createElement("img");
      noodles.id = "noodles";
      noodles.src = "./assets/props/noodles.png";
      noodles.alt = "Noodles";
      noodles.className = "noodles-overlay draggable";
      noodles.draggable = false;

      const potZone = document.createElement("div");
      potZone.id = "potDropzone";
      potZone.className = "pot-dropzone";
      potZone.setAttribute("aria-label", "Pot drop zone");

      overlays.appendChild(potZone);
      overlays.appendChild(noodles);

      // reset drag offset each time
      noodles.style.transform = "translate(0px, 0px)";
      layout();

      cleanupDrag = makeDraggable({
        el: noodles,
        dropzone: potZone,
        onDrop: async () => {
          if (scene !== "stove") return;

          scene = "cooked";

          noodles.style.pointerEvents = "none";
          noodles.classList.remove("draggable");

          overlays.classList.add("is-fading");
          await wait(150);

          // Step 3 result
          await transitionBg("./assets/bg/cooked-noodles.png");

          clearOverlays();
          overlays.classList.remove("is-fading");

          // Step 4: click pot (same rect as pot dropzone)
          showPotClickHotspot(async () => {
            if (scene !== "cooked") return;
            scene = "emptyPot";
            await transitionBg("./assets/bg/empty-pot.png");

            // Step 5: click anywhere -> main-view
            enableClickAnywhere(async () => {
              if (scene !== "emptyPot") return;
              scene = "mainView";
              disableClickAnywhere();
              await transitionBg("./assets/bg/main-view.png");

              // Step 6: click anywhere -> glass-empty
              enableClickAnywhere(async () => {
                if (scene !== "mainView") return;
                scene = "glassEmpty";
                disableClickAnywhere();
                await transitionBg("./assets/bg/glass-empty.png");
                // wrap up here – no further handlers
              });
            });
          });
        },
      });
    }

    // --- Step 2 trigger: click stove ----------------------------------------
    stoveBtn.addEventListener("click", async () => {
      if (scene !== "kitchen") return;

      scene = "stove";
      await transitionBg("./assets/bg/pot-with-noodle-on-stove.png");

      stoveBtn.style.display = "none";
      clearOverlays();
      createStoveSceneOverlays();
      layout();
    });

    // --- HUD ----------------------------------------------------------------
    root.querySelector("#backBtn").addEventListener("click", () => go("intro"));
    root.querySelector("#debugBtn").addEventListener("click", () => {
      sceneEl.classList.toggle("debug-hotspots");
    });

    // Initial layout + resize handling
    const onResize = () => layout();
    window.addEventListener("resize", onResize);
    bg.addEventListener("load", layout, { once: false });
    layout();

    this._room1Cleanup = () => {
      window.removeEventListener("resize", onResize);
    };
  },

  exit({ root }) {
    if (this._room1Cleanup) this._room1Cleanup();
    root.innerHTML = "";
  },
};