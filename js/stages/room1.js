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

    let scene = "kitchen";
    let cleanupDrag = null;

    const RECTS = {
      kitchen: {
        stove: { x: 500, y: 420, w: 420, h: 150 },
      },
      stove: {
        noodles: { x: 1000, y: 530, w: 120, h: 50 },
        pot: { x: 640, y: 320, w: 200, h: 250 },
      },
      glass: {
        ketchup: { x: 944, y: 370, w: 76, h: 220 },
        dishsoap: { x: 1135, y: 370, w: 89, h: 228 },
        whiskey: { x: 1025, y: 370, w: 92, h: 224 },
        drop: { x: 500, y: 360, w: 120, h: 130 },
      },
    };

    const wait = (ms) => new Promise((r) => setTimeout(r, ms));

    function getDrawnImageRect(imgEl) {
      const box = imgEl.getBoundingClientRect();
      const nW = imgEl.naturalWidth || 1;
      const nH = imgEl.naturalHeight || 1;

      const scale = Math.min(box.width / nW, box.height / nH);
      const drawnW = nW * scale;
      const drawnH = nH * scale;

      const left = box.left + (box.width - drawnW) / 2;
      const top = box.top + (box.height - drawnH) / 2;

      return { left, top, scale };
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

    function isDroppedOnZone(draggableEl, zoneEl) {
      const dRect = draggableEl.getBoundingClientRect();
      const zRect = zoneEl.getBoundingClientRect();
      const cx = dRect.left + dRect.width / 2;
      const cy = dRect.top + dRect.height / 2;
      return cx >= zRect.left && cx <= zRect.right && cy >= zRect.top && cy <= zRect.bottom;
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

      if (scene === "glassMix") {
        const dropZone = overlays.querySelector("#glassDropzone");
        if (dropZone) {
          placeRectOnImage({
            imgEl: bg,
            parentEl: wrap,
            targetEl: dropZone,
            rectPx: RECTS.glass.drop,
          });
        }

        ["ketchup", "dishsoap", "whiskey"].forEach((id) => {
          const el = overlays.querySelector(`#${id}`);
          if (!el) return;
          placeRectOnImage({
            imgEl: bg,
            parentEl: wrap,
            targetEl: el,
            rectPx: RECTS.glass[id],
          });
        });
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

    function makeDraggableMulti({ el, canDrag, onDropAttempt }) {
      let dragging = false;
      let startX = 0;
      let startY = 0;
      let currentX = 0;
      let currentY = 0;

      function onPointerDown(e) {
        if (!canDrag()) return;
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
        await onDropAttempt({ el });
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

    function enableClickAnywhere(handler) {
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

    function startGlassMixingGame() {
      scene = "glassMix";
      clearOverlays();

      const dropZone = document.createElement("div");
      dropZone.id = "glassDropzone";
      dropZone.className = "glass-dropzone";
      overlays.appendChild(dropZone);

      const items = [
        { id: "ketchup", src: "./assets/props/ketchup.png", alt: "Ketchup" },
        { id: "dishsoap", src: "./assets/props/dishsoap.png", alt: "Dish soap" },
        { id: "whiskey", src: "./assets/props/whiskey.png", alt: "Whiskey" },
      ];

      const used = new Set();
      let filledCount = 0;
      const cleaners = [];

      function bgForCount(n) {
        if (n === 1) return "./assets/bg/glass-1_3-filled.png";
        if (n === 2) return "./assets/bg/glass-half-filled.png";
        if (n === 3) return "./assets/bg/Glass-full.png";
        return "./assets/bg/glass-empty.png";
      }

      async function handleSuccessfulDrop(itemEl) {
        const id = itemEl.id;
        if (used.has(id)) return;

        used.add(id);
        filledCount += 1;

        itemEl.style.display = "none";
        itemEl.style.pointerEvents = "none";

        await transitionBg(bgForCount(filledCount));
        layout();
      }

      items.forEach(({ id, src, alt }) => {
        const el = document.createElement("img");
        el.id = id;
        el.src = src;
        el.alt = alt;
        el.className = "item-overlay draggable";
        el.draggable = false;
        el.style.transform = "translate(0px, 0px)";
        overlays.appendChild(el);

        const cleanup = makeDraggableMulti({
          el,
          canDrag: () => scene === "glassMix" && !used.has(id),
          onDropAttempt: async () => {
            if (scene !== "glassMix") return;
            if (used.has(id)) return;

            if (isDroppedOnZone(el, dropZone)) {
              await handleSuccessfulDrop(el);
            }
          },
        });

        cleaners.push(cleanup);
      });

      layout();

      cleanupDrag = () => {
        cleaners.forEach((fn) => fn());
      };
    }

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

      noodles.style.transform = "translate(0px, 0px)";
      layout();

      cleanupDrag = makeDraggable({
        el: noodles,
        dropzone: potZone,
        onDrop: async () => {
          if (scene !== "stove") return;

          scene = "cooked";
          overlays.classList.add("is-fading");
          await wait(150);

          await transitionBg("./assets/bg/cooked-noodles.png");

          clearOverlays();
          overlays.classList.remove("is-fading");

          showPotClickHotspot(async () => {
            if (scene !== "cooked") return;
            scene = "emptyPot";
            await transitionBg("./assets/bg/empty-pot.png");

            enableClickAnywhere(async () => {
              if (scene !== "emptyPot") return;
              scene = "mainView";
              disableClickAnywhere();
              await transitionBg("./assets/bg/main-view.png");

              enableClickAnywhere(async () => {
                if (scene !== "mainView") return;
                scene = "glassEmpty";
                disableClickAnywhere();
                await transitionBg("./assets/bg/glass-empty.png");

                startGlassMixingGame();
              });
            });
          });
        },
      });
    }

    stoveBtn.addEventListener("click", async () => {
      if (scene !== "kitchen") return;

      scene = "stove";
      await transitionBg("./assets/bg/empty-pot-boiling-water.png");

      stoveBtn.style.display = "none";
      clearOverlays();
      createStoveSceneOverlays();
      layout();
    });

    root.querySelector("#backBtn").addEventListener("click", () => go("intro"));
    root.querySelector("#debugBtn").addEventListener("click", () => {
      sceneEl.classList.toggle("debug-hotspots");
    });

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