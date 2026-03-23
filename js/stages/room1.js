// /js/stages/room1.js
export default {
  enter({ root, go }) {
    root.innerHTML = `
      <section class="scene" id="scene-room1">
        <div class="scene-inner" id="room1Wrap">
          <img
            id="bg"
            src="./assets/bg/room1/kitchen-close-up.png"
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

    let chopstickEl = null;
    let chopstickTracking = false;  

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
        cup:{ x: 500, y: 360, w: 120, h: 200}
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

    function ensureChopstick() {
      if (chopstickEl) return chopstickEl;
    
      chopstickEl = document.createElement("img");
      chopstickEl.id = "fakeCursorChopstick";
      chopstickEl.src = "./assets/props/room1/chopsticks.png";
      chopstickEl.alt = "";
      chopstickEl.setAttribute("aria-hidden", "true");
      chopstickEl.style.position = "fixed";
      chopstickEl.style.left = "-100px";
      chopstickEl.style.top = "-45px";
      chopstickEl.style.width = "250px";
      chopstickEl.style.pointerEvents = "none";
      chopstickEl.style.zIndex = "99999";
      chopstickEl.style.display = "none";
      chopstickEl.style.transform = "translate(-9999px, -9999px)";
      document.body.appendChild(chopstickEl);
    
      return chopstickEl;
    }
    
    function moveChopstick(clientX, clientY) {
      if (!chopstickEl) return;
    
      const offsetX = 8;
      const offsetY = -10;
      chopstickEl.style.transform = `translate(${clientX + offsetX}px, ${clientY + offsetY}px) rotate(-20deg)`;
    }
    
    function handleChopstickPointerMove(e) {
      if (!chopstickTracking) return;
      moveChopstick(e.clientX, e.clientY);
    }
    
    function showFakeChopstickCursor() {
      ensureChopstick();
      chopstickTracking = true;
      chopstickEl.style.display = "block";
      document.body.style.cursor = "none";
      wrap.style.cursor = "none";
      window.addEventListener("pointermove", handleChopstickPointerMove);
    }
    
    function hideFakeChopstickCursor() {
      chopstickTracking = false;
      window.removeEventListener("pointermove", handleChopstickPointerMove);
      document.body.style.cursor = "";
      wrap.style.cursor = "";
    
      if (!chopstickEl) return;
      chopstickEl.style.display = "none";
      chopstickEl.style.transform = "translate(-9999px, -9999px)";
    }

  function updateCursorByScene() {
  if (scene === "cooked") {
    showFakeChopstickCursor();
  } else {
    hideFakeChopstickCursor();
  }
}

    function layout() {
      if (!bg.complete || !bg.naturalWidth) return;

      updateCursorByScene(); 

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

      if (scene === "glassMix" || scene === "glassPostMix") {
        const dropZone = overlays.querySelector("#glassDropzone");
        if (dropZone) {
          placeRectOnImage({
            imgEl: bg,
            parentEl: wrap,
            targetEl: dropZone,
            rectPx: RECTS.glass.drop,
          });
        }

        const cupHotspot = overlays.querySelector("#cupClickHotspot");
        if (cupHotspot) {
          placeRectOnImage({
          imgEl: bg,
          parentEl: wrap,
          targetEl: cupHotspot,
          rectPx: RECTS.glass.cup, // change later to your cup rect
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

  
    function makeDraggable({ el, dropzone, onDrop, onStart, onMove, onEnd }) {
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
        onStart?.(e);
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
        onMove?.(e);
      }
    
      async function onPointerUp(e) {
        if (!dragging) return;
        dragging = false;
        el.classList.remove("is-dragging");
        onEnd?.(e);
    
        if (isDroppedOnZone(el, dropzone)) {
          await onDrop();
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

    function showCupClickHotspot(onClick) {
      const old = overlays.querySelector("#cupClickHotspot");
      if (old) old.remove();
    
      const btn = document.createElement("button");
      btn.id = "cupClickHotspot";
      btn.className = "hotspot cup-click";
      btn.type = "button";
      btn.setAttribute("aria-label", "Cup");
      btn.addEventListener("click", onClick);
      overlays.appendChild(btn);
    
      layout();
    }

    // ✅ IMPORTANT: define popup helper ONCE here (not inside click callbacks)
    function showCompletionPopup({ title = "Completed!", message = "Next stage unlocked.", onContinue }) {
      // Remove any existing popup
      const old = wrap.querySelector("#completePopup");
      if (old) old.remove();
    
      const modal = document.createElement("div");
      modal.id = "completePopup";
      modal.className = "popup";
      modal.innerHTML = `
        <div class="popup-card" role="dialog" aria-modal="true">
          <h3 class="popup-title">${title}</h3>
          <p class="popup-msg">${message}</p>
          <div class="popup-actions">
            <button id="popupContinue" class="hud-btn" type="button">Back to Menu</button>
          </div>
        </div>
      `;
    
      // ✅ IMPORTANT: put popup above everything and clickable
      modal.style.position = "absolute";
      modal.style.inset = "0";
      modal.style.zIndex = "9999";
      modal.style.pointerEvents = "auto";
    
      wrap.appendChild(modal);
    
      const btn = modal.querySelector("#popupContinue");
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        modal.remove();
        onContinue?.();
      });
    
      // click dark area to continue
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.remove();
          onContinue?.();
        }
      });
    }

    function startGlassMixingGame() {
      scene = "glassMix";
      clearOverlays();

      const dropZone = document.createElement("div");
      dropZone.id = "glassDropzone";
      dropZone.className = "glass-dropzone";
      overlays.appendChild(dropZone);

      const items = [
        { id: "ketchup", src: "./assets/props/room1/game-ketchup.png", alt: "Ketchup" },
        { id: "dishsoap", src: "./assets/props/room1/game-dishsoap.png", alt: "Dish soap" },
        { id: "whiskey", src: "./assets/props/room1/game-whisky.png", alt: "Whiskey" },
      ];

      const used = new Set();
      let filledCount = 0;
      const cleaners = [];

      function bgForCount(n) {
        if (n === 1) return "./assets/bg/room1/glass-1_3-full.png";
        if (n === 2) return "./assets/bg/room1/glass-half-full.png";
        if (n === 3) return "./assets/bg/room1/glass-full.png";
        return "./assets/bg/room1/glass-empty.png";
      }

      async function handleSuccessfulDrop(itemEl) {
        const id = itemEl.id;
        if (used.has(id)) return;

        used.add(id);
        filledCount += 1;

        itemEl.style.pointerEvents = "none";
        itemEl.classList.add("used"); // optional
        
        // snap back to original position (since you drag using transform)
        itemEl.style.transform = "translate(0px, 0px)";

        await transitionBg(bgForCount(filledCount));
        layout();

        // ✅ After all 3 items are dropped, continue with extra steps
if (filledCount >= 3) {
  await wait(200);

  // lock the mini-game state
  scene = "glassPostMix";
  disableClickAnywhere();

  // (optional) hide/disable items so player focuses on cup
  items.forEach(({ id }) => {
    const it = overlays.querySelector(`#${id}`);
    if (it) it.style.pointerEvents = "none";
  });

  // 1) User clicks cup area -> go to glass-empty.png
  showCupClickHotspot(async () => {
    if (scene !== "glassPostMix") return;

    scene = "glassEmptyAfterMix";
    // remove the cup hotspot once clicked
    const cup = overlays.querySelector("#cupClickHotspot");
    if (cup) cup.remove();

    await transitionBg("./assets/bg/room1/glass-empty.png");

    // 2) click anywhere -> main-view.png
    enableClickAnywhere(async () => {
      if (scene !== "glassEmptyAfterMix") return;
      scene = "mainViewAfterMix";
      disableClickAnywhere();
    
       // Remove all bottles
    ["ketchup", "dishsoap", "whiskey"].forEach((id) => {
      const el = overlays.querySelector(`#${id}`);
      if (el) el.remove();
    });

      await transitionBg("./assets/bg/room1/main-view.png");

      // 3) click anywhere -> distortion gif
      enableClickAnywhere(async () => {
        if (scene !== "mainViewAfterMix") return;
        scene = "distortionAfterMix";
        disableClickAnywhere();

        await transitionBg("./assets/bg/room1/vision-distorted-gif.gif");

        // Now mark room complete + popup
        await wait(250);
        localStorage.setItem("room1_done", "1");
        scene = "roomComplete";

        showCompletionPopup({
          title: "Room 1 cleared",
          message: "You are ready to unlock the next stage.",
          onContinue: () => go("intro"),
        });
      });
    });
  });

  layout();
}
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
      noodles.src = "./assets/props/room1/game-noodles.png";
      noodles.alt = "Noodles";
      noodles.className = "item-overlay draggable";
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
    
          await transitionBg("./assets/bg/room1/cooked-noodles.png");
    
          clearOverlays();
          overlays.classList.remove("is-fading");
    
          showPotClickHotspot(async () => {
            if (scene !== "cooked") return;
    
            scene = "emptyPot";
            await transitionBg("./assets/bg/room1/empty-pot.png");
    
            enableClickAnywhere(async () => {
              if (scene !== "emptyPot") return;
    
              scene = "mainView";
              disableClickAnywhere();
              await transitionBg("./assets/bg/room1/projection.png");
    
              enableClickAnywhere(async () => {
                if (scene !== "mainView") return;
    
                scene = "glassEmpty";
                disableClickAnywhere();
                await transitionBg("./assets/bg/room1/glass-empty.png");
    
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
      await transitionBg("./assets/bg/room1/empty-pot-boiling.png");
    
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
    
      if (cleanupDrag) {
        cleanupDrag();
        cleanupDrag = null;
      }
    
      hideFakeChopstickCursor();
    
      if (chopstickEl) {
        chopstickEl.remove();
        chopstickEl = null;
      }
    };
  },

  exit({ root }) {
    if (this._room1Cleanup) this._room1Cleanup();
    root.innerHTML = "";
  },
};