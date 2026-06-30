import { showChapterEndDialog } from "../chapter-end-dialog.js";
import { closePhotoPopup, showPhotoPopup } from "../photo-popup.js";

export default {
  enter({ root, go }) {
    root.innerHTML = `
      <section class="scene" id="scene-room1">
        <div class="scene-inner" id="room1Wrap">
          <img
            id="bg"
            src="./assets/bg/room1/kitchen-main-view.webp"
            class="bg"
            alt="Room 1 scene"
            draggable="false"
          />

          <button
            id="kitchenStove"
            class="hotspot kitchen-stove"
            aria-label="Kitchen area"
          ></button>

          <div id="overlays" class="overlays" aria-hidden="false"></div>
        </div>
      </section>
    `;

    const wrap = root.querySelector("#room1Wrap");
    const bg = root.querySelector("#bg");
    const overlays = root.querySelector("#overlays");
    const stoveBtn = root.querySelector("#kitchenStove");

    let scene = "kitchen";
    let cleanupDrag = null;
    let kitchenEggUnlocked = false;
    let kitchenEggIndex = 0;
    let eggAlbumOpen = false;
    let openingDialogShown = false;

    let chopstickEl = null;
    let chopstickTracking = false;

    const bgm = new Audio("./assets/audio/room1/cooking at 1 am bgm.wav");
    bgm.loop = true;
    bgm.volume = 0.45;

    let bgmStarted = false;

    function startBgm() {
      if (bgmStarted) return;

      bgmStarted = true;

      bgm.play().catch(() => {
        bgmStarted = false;
      });
    }

    const RECTS = {
      kitchen: {
        stove: { x: 930, y: 200, w: 520, h: 330 },
        eggTable: { x: 0, y: 420, w: 455, h: 310 },
      },
      stove: {
        noodles: { x: 1100, y: 690, w: 120, h: 50 },
        pot: { x: 780, y: 450, w: 200, h: 250 },
      },
      glass: {
        ketchup: { x: 1144, y: 470, w: 76, h: 220 },
        dishsoap: { x: 1335, y: 470, w: 89, h: 228 },
        whiskey: { x: 1225, y: 470, w: 92, h: 224 },
        drop: { x: 600, y: 500, w: 120, h: 150 },
        cup: { x: 600, y: 500, w: 120, h: 150 },
      },
    };

    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const EGG_IMAGES = [
      "./assets/props/room1/egg1.1.webp",
      "./assets/props/room1/egg1.2.webp",
      "./assets/props/room1/egg1.3.webp",
      "./assets/props/room1/egg1.4.webp",
    ];

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

      return (
        cx >= zRect.left &&
        cx <= zRect.right &&
        cy >= zRect.top &&
        cy <= zRect.bottom
      );
    }

    function ensureChopstick() {
      if (chopstickEl) return chopstickEl;

      chopstickEl = document.createElement("img");
      chopstickEl.id = "fakeCursorChopstick";
      chopstickEl.src = "./assets/props/room1/chopsticks.webp";
      chopstickEl.alt = "";
      chopstickEl.setAttribute("aria-hidden", "true");
      chopstickEl.style.position = "fixed";
      chopstickEl.style.left = "0";
      chopstickEl.style.top = "0";
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
      chopstickEl.style.transform = `translate(${clientX + offsetX}px, ${
        clientY + offsetY
      }px) rotate(-20deg)`;
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

      window.removeEventListener("pointermove", handleChopstickPointerMove);
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
        stoveBtn.style.display = "block";
        stoveBtn.setAttribute("aria-label", "Zoom into the stove");

        placeRectOnImage({
          imgEl: bg,
          parentEl: wrap,
          targetEl: stoveBtn,
          rectPx: RECTS.kitchen.stove,
        });

        const eggHotspot = overlays.querySelector("#room1EggHotspot");

        if (eggHotspot) {
          placeRectOnImage({
            imgEl: bg,
            parentEl: wrap,
            targetEl: eggHotspot,
            rectPx: RECTS.kitchen.eggTable,
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
            rectPx: RECTS.glass.cup,
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
      bg.src = nextSrc;

      await new Promise((resolve) => {
        if (bg.complete) return resolve();
        bg.addEventListener("load", resolve, { once: true });
      });

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

    function showBackPlate(onClick) {
      hideBackPlate();
    
      const gradient = document.createElement("div");
      gradient.id = "room1LeftGradient";
      gradient.className = "room1-left-gradient";
    
      gradient.innerHTML = `
        <div class="room1-left-arrow"></div>
      `;
    
      const clickZone = document.createElement("button");
      clickZone.id = "room1LeftClickZone";
      clickZone.className = "room1-left-click-zone";
      clickZone.type = "button";
      clickZone.setAttribute("aria-label", "Go back");
    
      clickZone.addEventListener("click", onClick);
    
      overlays.appendChild(gradient);
      overlays.appendChild(clickZone);
    
      requestAnimationFrame(() => {
        gradient.classList.add("is-visible");
      });
    }
    
    function hideBackPlate() {
      const gradient = overlays.querySelector("#room1LeftGradient");
      const clickZone = overlays.querySelector("#room1LeftClickZone");
    
      if (gradient) gradient.remove();
      if (clickZone) clickZone.remove();
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

    function showRoom1Dialogue(text, onClose) {
      const old = overlays.querySelector("#room1Dialogue");
      if (old) old.remove();

      const box = document.createElement("div");
      box.id = "room1Dialogue";
      box.className = "room1-dialogue";

      box.innerHTML = `
        <button class="room1-dialogue-blocker" type="button" tabindex="-1" aria-hidden="true"></button>

        <div class="room1-dialogue-text">
          ${text}

          <button
            type="button"
            class="room1-dialogue-continue"
            id="room1DialogueContinue"
          >
            Continue
          </button>
        </div>
      `;

      overlays.appendChild(box);

      box.querySelector("#room1DialogueContinue").addEventListener("click", () => {
        box.remove();
        onClose?.();
      });
    }

    function closeEggAlbum() {
      closePhotoPopup(overlays, "room1EggAlbum");
      eggAlbumOpen = false;
      stoveBtn.disabled = false;
      stoveBtn.style.pointerEvents = "";
    }

    function showEggAlbum() {
      closeEggAlbum();
      eggAlbumOpen = true;
      stoveBtn.disabled = true;
      stoveBtn.style.pointerEvents = "none";

      showPhotoPopup({
        container: overlays,
        id: "room1EggAlbum",
        title: "Memory fragment",
        images: EGG_IMAGES,
        initialIndex: kitchenEggIndex,
        onClose: () => {
          eggAlbumOpen = false;
          stoveBtn.disabled = false;
          stoveBtn.style.pointerEvents = "";
        },
      });
    }

    function showKitchenEggHotspot() {
      if (scene !== "kitchen" || !kitchenEggUnlocked) return;
      if (overlays.querySelector("#room1EggHotspot")) return;

      const btn = document.createElement("button");
      btn.id = "room1EggHotspot";
      btn.className = "hotspot room1-egg-hotspot";
      btn.type = "button";
      btn.setAttribute("aria-label", "Open old photo album");

      btn.addEventListener("click", () => {
        kitchenEggIndex = 0;
        showEggAlbum();
      });

      overlays.appendChild(btn);
      layout();
    }

    function showOpeningKitchenDialog() {
      if (openingDialogShown || scene !== "kitchen") return;

      openingDialogShown = true;
      showRoom1Dialogue("Kinda hungry, gonna cook something", () => {
        kitchenEggUnlocked = true;
        showKitchenEggHotspot();
        layout();
      });
    }

    async function finishRoom1AfterGlass() {
      if (scene !== "glassEmptyAfterMix") return;

      scene = "distortionAfterMix";
      hideBackPlate();

      ["ketchup", "dishsoap", "whiskey"].forEach((id) => {
        const el = overlays.querySelector(`#${id}`);
        if (el) el.remove();
      });

      await transitionBg("./assets/bg/room1/vision-distorted-gif.gif");

      await wait(2500);

      localStorage.setItem("room1_done", "1");

      showChapterEndDialog({
        container: overlays,
        text: "Let’s call it a night.",
        onContinue: () => {
          window.dispatchEvent(
            new CustomEvent("stage:end", {
              detail: {
                nextStage: "room2",
                menuStage: "intro",
                nextLabel: "Next",
                menuLabel: "Back to Menu",
              },
            })
          );
        },
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
        {
          id: "ketchup",
          src: "./assets/props/room1/game-ketchup.webp",
          alt: "Ketchup",
        },
        {
          id: "dishsoap",
          src: "./assets/props/room1/game-dishsoap.webp",
          alt: "Dish soap",
        },
        {
          id: "whiskey",
          src: "./assets/props/room1/game-whisky.webp",
          alt: "Whiskey",
        },
      ];

      const used = new Set();
      const cleaners = [];

      let filledCount = 0;

      function bgForCount(n) {
        if (n === 1) return "./assets/bg/room1/glass-1_3-full.webp";
        if (n === 2) return "./assets/bg/room1/glass-half-full.webp";
        if (n === 3) return "./assets/bg/room1/glass-full.webp";

        return "./assets/bg/room1/glass-empty.webp";
      }

      async function handleSuccessfulDrop(itemEl) {
        const id = itemEl.id;
        if (used.has(id)) return;

        used.add(id);
        filledCount += 1;

        itemEl.style.pointerEvents = "none";
        itemEl.classList.add("used");
        itemEl.style.transform = "translate(0px, 0px)";

        await transitionBg(bgForCount(filledCount));
        layout();

        if (filledCount < 3) return;

        await wait(200);

        scene = "glassPostMix";

        items.forEach(({ id }) => {
          const it = overlays.querySelector(`#${id}`);
          if (it) it.style.pointerEvents = "none";
        });

        showCupClickHotspot(async () => {
          if (scene !== "glassPostMix") return;

          scene = "glassEmptyAfterMix";

          const cup = overlays.querySelector("#cupClickHotspot");
          if (cup) cup.remove();

          await transitionBg("./assets/bg/room1/glass-empty.webp");

          showBackPlate(finishRoom1AfterGlass);
        });

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
      noodles.src = "./assets/props/room1/game-noodles.webp";
      noodles.alt = "Noodles";
      noodles.className = "item-overlay draggable";
      noodles.draggable = false;
      noodles.style.transform = "translate(0px, 0px)";

      const potZone = document.createElement("div");
      potZone.id = "potDropzone";
      potZone.className = "pot-dropzone";
      potZone.setAttribute("aria-label", "Pot drop zone");

      overlays.appendChild(potZone);
      overlays.appendChild(noodles);

      layout();

      cleanupDrag = makeDraggable({
        el: noodles,
        dropzone: potZone,

        onDrop: async () => {
          if (scene !== "stove") return;

          scene = "cooked";

          await transitionBg("./assets/bg/room1/cooked-noodles.webp");

          clearOverlays();

          showPotClickHotspot(async () => {
            if (scene !== "cooked") return;

            scene = "emptyPot";

            clearOverlays();

            await transitionBg("./assets/bg/room1/empty-pot.webp");

            showRoom1Dialogue("I wanna drink something too…", async () => {
              scene = "glassEmpty";

              await transitionBg("./assets/bg/room1/glass-empty.webp");

              startGlassMixingGame();
            });
          });
        },
      });
    }

    async function handleStoveButtonClick() {
      if (eggAlbumOpen) return;

      startBgm();

      if (scene !== "kitchen") return;

      scene = "stove";
      kitchenEggUnlocked = false;

      await transitionBg("./assets/bg/room1/empty-pot-boiling.webp");

      stoveBtn.style.display = "none";

      clearOverlays();
      createStoveSceneOverlays();
      layout();
    }

    const onResize = () => layout();

    stoveBtn.addEventListener("click", handleStoveButtonClick);
    window.addEventListener("resize", onResize);
    window.addEventListener("pointerdown", startBgm, { once: true });
    window.addEventListener("keydown", startBgm, { once: true });

    const handleBgLoad = () => {
      layout();
      showOpeningKitchenDialog();
    };

    bg.addEventListener("load", handleBgLoad, { once: false });

    handleBgLoad();
    startBgm();

    this._room1Cleanup = () => {
      stoveBtn.removeEventListener("click", handleStoveButtonClick);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointerdown", startBgm);
      window.removeEventListener("keydown", startBgm);
      bg.removeEventListener("load", handleBgLoad);

      if (cleanupDrag) {
        cleanupDrag();
        cleanupDrag = null;
      }

      bgm.pause();
      bgm.currentTime = 0;
      bgmStarted = false;

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
