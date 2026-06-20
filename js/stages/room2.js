export default {
  enter({ root, go }) {
    root.innerHTML = `
      <section class="scene" id="scene-room2">
        <div class="scene-inner" id="room2Wrap">
          <img
            id="bg"
            src="./assets/bg/room2/chatting.webp"
            class="bg"
            alt="Room 2 scene"
            draggable="false"
          />

          <div id="overlays" class="overlays" aria-hidden="false"></div>
        </div>
      </section>
    `;

    const wrap = root.querySelector("#room2Wrap");
    const bg = root.querySelector("#bg");
    const overlays = root.querySelector("#overlays");

    let scene = "chatting";
    let cleanupDrag = null;
    let room2Bgm = null;

    function setupRoom2Bgm() {
      room2Bgm = new Audio("./assets/audio/room2/2 static bgm.wav");
      room2Bgm.loop = true;
      room2Bgm.volume = 0.45;

      const unlockAudio = () => {
        if (!room2Bgm) return;
        room2Bgm.play().catch(() => {});
        window.removeEventListener("pointerdown", unlockAudio);
      };

      room2Bgm.play().catch(() => {
        window.addEventListener("pointerdown", unlockAudio, { once: true });
      });
    }

    function stopRoom2Bgm() {
      if (!room2Bgm) return;
      room2Bgm.pause();
      room2Bgm.currentTime = 0;
      room2Bgm = null;
    }

    const RECTS = {
      smoke: {
        smoke: { x: 1250, y: 350, w: 50, h: 80 },
      },

      canSmoke: {
        can: { x: 650, y: 450, w: 200, h: 350 },
      },

      emptyCup: {
        beer: { x: 690, y: 465, w: 85, h: 200 },
        drop: { x: 1050, y: 500, w: 475, h: 225 },
      },

      fullCup: {
        leftArea: { x: 0, y: 0, w: 750, h: 1500 },
      },

      stare1: {
        counter: { x: 950, y: 90, w: 600, h: 480 },
      },

      kitchenCounter: {
        drawer: { x: 480, y: 750, w: 950, h: 220 },
      },

      drawerMessy: {
        drawerOpen: { x: 480, y: 750, w: 950, h: 220 },
      },

      sortingZones: {
        forkZone:  { x: 315, y: 430, w: 250, h: 320 },
        spoonZone: { x: 605, y: 430, w: 250, h: 320 },
        knifeZone: { x: 890, y: 430, w: 270, h: 320 },
      },

      sortingSlots: {
        forks: [
          { x: 330, y: 455, w: 55, h: 330, r: 0 },
          { x: 375, y: 455, w: 55, h: 330, r: 0 },
          { x: 420, y: 455, w: 55, h: 330, r: 0 },
          { x: 465, y: 455, w: 55, h: 330, r: 0 },
        ],
      
        spoons: [
          { x: 625, y: 455, w: 55, h: 330, r: 0 },
          { x: 670, y: 455, w: 55, h: 330, r: 0 },
          { x: 715, y: 455, w: 55, h: 330, r: 0 },
          { x: 760, y: 455, w: 55, h: 330, r: 0 },
        ],
      
        knives: [
          { x: 910, y: 455, w: 55, h: 330, r: 0 },
          { x: 955, y: 455, w: 55, h: 330, r: 0 },
          { x: 1000, y: 455, w: 55, h: 330, r: 0 },
          { x: 1045, y: 455, w: 55, h: 330, r: 0 },
        ],
      },

      stare2: {
        leftArea: { x: 50, y: 100, w: 750, h: 1500 },
      },

      mainViewStatic: {
        room: { x: 50, y: 100, w: 750, h: 1500 },
      },

      sortingItems: {
        fork1: {
          type: "fork",
          src: "./assets/props/room2/fork-1.webp",
          x: 800,
          y: 700,
          w: 90,
          h: 580,
          r: -120,
        },
        fork2: {
          type: "fork",
          src: "./assets/props/room2/fork-2.webp",
          x: 1290,
          y: 795,
          w: 90,
          h: 580,
          r: -50,
        },
        fork3: {
          type: "fork",
          src: "./assets/props/room2/fork-3.webp",
          x: 1010,
          y: 775,
          w: 90,
          h: 580,
          r: -130,
        },
        fork4: {
          type: "fork",
          src: "./assets/props/room2/fork-4.webp",
          x: 1320,
          y: 800,
          w: 90,
          h: 580,
          r: -290,
        },
      
        spoon1: {
          type: "spoon",
          src: "./assets/props/room2/spoon-1.webp",
          x: 1220,
          y: 790,
          w: 90,
          h: 580,
          r: -120,
        },
        spoon2: {
          type: "spoon",
          src: "./assets/props/room2/spoon-2.webp",
          x: 820,
          y: 675,
          w: 90,
          h: 580,
          r: -300,
        },
        spoon3: {
          type: "spoon",
          src: "./assets/props/room2/spoon-3.webp",
          x: 1020,
          y: 700,
          w: 90,
          h: 580,
          r: -250,
        },
        spoon4: {
          type: "spoon",
          src: "./assets/props/room2/spoon-4.webp",
          x: 1550,
          y: 580,
          w: 90,
          h: 580,
          r: -50,
        },
      
        knife1: {
          type: "knife",
          src: "./assets/props/room2/knife-1.webp",
          x: 760,
          y: 720,
          w: 90,
          h: 580,
          r: -270,
        },
        knife2: {
          type: "knife",
          src: "./assets/props/room2/knife-2.webp",
          x: 1210,
          y: 830,
          w: 90,
          h: 580,
          r: -20,
        },
        knife3: {
          type: "knife",
          src: "./assets/props/room2/knife-3.webp",
          x: 1200,
          y: 515,
          w: 90,
          h: 580,
          r: -110,
        },
        knife4: {
          type: "knife",
          src: "./assets/props/room2/knife-4.webp",
          x: 1570,
          y: 635,
          w: 90,
          h: 580,
          r: -230,
        },
      },
    };

    const sortingState = {
      placedCounts: {
        fork: 0,
        spoon: 0,
        knife: 0,
      },
      items: {},
    };

    Object.entries(RECTS.sortingItems).forEach(([id, cfg]) => {
      sortingState.items[id] = {
        id,
        type: cfg.type,
        src: cfg.src,
        baseRect: { x: cfg.x, y: cfg.y, w: cfg.w, h: cfg.h, r: cfg.r || 0 },
        currentRect: { x: cfg.x, y: cfg.y, w: cfg.w, h: cfg.h, r: cfg.r || 0 },
        placed: false,
      };
    });

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

      const r = rectPx.r || 0;
      targetEl.style.transform = `rotate(${r}deg)`;
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

      if (scene === "smoke") {
        const smokeHotspot = overlays.querySelector("#smokeHotspot");
        if (smokeHotspot) {
          placeRectOnImage({ imgEl: bg, parentEl: wrap, targetEl: smokeHotspot, rectPx: RECTS.smoke.smoke });
        }
      }

      if (scene === "canSmoke") {
        const canHotspot = overlays.querySelector("#canHotspot");
        if (canHotspot) {
          placeRectOnImage({ imgEl: bg, parentEl: wrap, targetEl: canHotspot, rectPx: RECTS.canSmoke.can });
        }
      }

      if (scene === "emptyCup") {
        const beer = overlays.querySelector("#beer");
        const dropZone = overlays.querySelector("#beerDropzone");

        if (beer) {
          placeRectOnImage({ imgEl: bg, parentEl: wrap, targetEl: beer, rectPx: RECTS.emptyCup.beer });
        }

        if (dropZone) {
          placeRectOnImage({ imgEl: bg, parentEl: wrap, targetEl: dropZone, rectPx: RECTS.emptyCup.drop });
        }
      }

      if (scene === "fullCup") {
        const leftHotspot = overlays.querySelector("#leftAreaHotspot");
        if (leftHotspot) {
          placeRectOnImage({ imgEl: bg, parentEl: wrap, targetEl: leftHotspot, rectPx: RECTS.fullCup.leftArea });
        }
      }

      if (scene === "stare1") {
        const counterHotspot = overlays.querySelector("#counterHotspot");
        if (counterHotspot) {
          placeRectOnImage({ imgEl: bg, parentEl: wrap, targetEl: counterHotspot, rectPx: RECTS.stare1.counter });
        }
      }

      if (scene === "kitchenCounter") {
        const drawerHotspot = overlays.querySelector("#drawerHotspot");
        if (drawerHotspot) {
          placeRectOnImage({ imgEl: bg, parentEl: wrap, targetEl: drawerHotspot, rectPx: RECTS.kitchenCounter.drawer });
        }
      }

      if (scene === "drawerMessy") {
        const drawerOpenHotspot = overlays.querySelector("#drawerOpenHotspot");
        if (drawerOpenHotspot) {
          placeRectOnImage({ imgEl: bg, parentEl: wrap, targetEl: drawerOpenHotspot, rectPx: RECTS.drawerMessy.drawerOpen });
        }
      }

      if (scene === "utensilsScattered") {
        ["forkZone", "spoonZone", "knifeZone"].forEach((zoneId) => {
          const zoneEl = overlays.querySelector(`#${zoneId}`);
          if (!zoneEl) return;
          placeRectOnImage({ imgEl: bg, parentEl: wrap, targetEl: zoneEl, rectPx: RECTS.sortingZones[zoneId] });
        });

        Object.keys(sortingState.items).forEach((id) => {
          const el = overlays.querySelector(`#${id}`);
          if (!el) return;
          placeRectOnImage({ imgEl: bg, parentEl: wrap, targetEl: el, rectPx: sortingState.items[id].currentRect });
        });
      }

      if (scene === "stare2" || scene === "drawerSorted") {
        const leftHotspot2 = overlays.querySelector("#leftAreaHotspot2");
        if (leftHotspot2) {
          placeRectOnImage({ imgEl: bg, parentEl: wrap, targetEl: leftHotspot2, rectPx: RECTS.stare2.leftArea });
        }
      }

      if (scene === "mainViewStatic") {
        const roomHotspot = overlays.querySelector("#roomHotspot");
        if (roomHotspot) {
          placeRectOnImage({ imgEl: bg, parentEl: wrap, targetEl: roomHotspot, rectPx: RECTS.mainViewStatic.room });
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

    async function crossfadeBg(nextSrc, duration = 900) {
      const nextBg = document.createElement("img");
      nextBg.src = nextSrc;
      nextBg.className = "bg room2-crossfade-next";
      nextBg.alt = "";
      nextBg.draggable = false;

      wrap.insertBefore(nextBg, overlays);

      await new Promise((resolve) => {
        if (nextBg.complete) return resolve();
        nextBg.addEventListener("load", resolve, { once: true });
      });

      requestAnimationFrame(() => {
        nextBg.style.opacity = "1";
      });

      await wait(duration);

      bg.src = nextSrc;

      await new Promise((resolve) => {
        if (bg.complete) return resolve();
        bg.addEventListener("load", resolve, { once: true });
      });

      nextBg.remove();
      layout();
    }

    async function setBgInstant(nextSrc) {
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

    function makeDraggable({ el, canDrag, onDropAttempt }) {
      let dragging = false;
      let startX = 0;
      let startY = 0;
      let currentX = 0;
      let currentY = 0;

      function applyTransform() {
        const r = sortingState.items[el.id]?.currentRect?.r || 0;
        el.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${r}deg)`;
      }

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
        applyTransform();
      }

      async function onPointerUp() {
        if (!dragging) return;
        dragging = false;
        el.classList.remove("is-dragging");
        await onDropAttempt({ el, resetTransform });

        function resetTransform() {
          currentX = 0;
          currentY = 0;
          const r = sortingState.items[el.id]?.currentRect?.r || 0;
          el.style.transform = `translate(0px, 0px) rotate(${r}deg)`;
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

    function showRpgDialog({ textLines, choices, onChoose }) {
      const old = overlays.querySelector("#rpgDialog");
      if (old) old.remove();

      const box = document.createElement("div");
      box.id = "rpgDialog";
      box.className = "rpg-ui";
      box.innerHTML = `
        <div class="rpg-box rpg-box--dialog">
          <div class="rpg-text">${textLines.map((line) => `<div>${line}</div>`).join("")}</div>
        </div>
        ${
          choices
            ? `
            <div class="rpg-box rpg-box--choices">
              ${choices.map((choice, i) => `
                <button class="rpg-choice ${i === 0 ? "is-active" : ""}" data-choice="${i}">
                  ${choice}
                </button>
              `).join("")}
            </div>
          `
            : ""
        }
      `;

      overlays.appendChild(box);

      if (!choices) return;

      const buttons = [...box.querySelectorAll(".rpg-choice")];

      buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
          buttons.forEach((b) => b.classList.remove("is-active"));
          btn.classList.add("is-active");

          const index = Number(btn.dataset.choice);

          setTimeout(() => {
            onChoose(index);
          }, 120);
        });
      });
    }

    function showClosableDialog({ textLines, onClose }) {
      showRpgDialog({ textLines });
    
      const dialog = overlays.querySelector("#rpgDialog");
      if (!dialog) return;
    
      const dialogBox = dialog.querySelector(".rpg-box--dialog");
      if (!dialogBox) return;
    
      const closeBtn = document.createElement("button");
      closeBtn.className = "rpg-close";
      closeBtn.type = "button";
      closeBtn.innerHTML = "×";
      closeBtn.setAttribute("aria-label", "Close dialogue");
    
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        dialog.remove();
        onClose?.();
      });
    
      dialogBox.appendChild(closeBtn);
    }

    function showSmokeHotspot(onClick) {
      const old = overlays.querySelector("#smokeHotspot");
      if (old) old.remove();

      const btn = document.createElement("button");
      btn.id = "smokeHotspot";
      btn.className = "hotspot smoke-hotspot";
      btn.type = "button";
      btn.setAttribute("aria-label", "Smoke");
      btn.addEventListener("click", onClick);
      overlays.appendChild(btn);

      layout();
    }

    function showCanHotspot(onClick) {
      const old = overlays.querySelector("#canHotspot");
      if (old) old.remove();

      const btn = document.createElement("button");
      btn.id = "canHotspot";
      btn.className = "hotspot can-hotspot";
      btn.type = "button";
      btn.setAttribute("aria-label", "Can");
      btn.addEventListener("click", onClick);
      overlays.appendChild(btn);

      layout();
    }

    function showLeftAreaHotspot(onClick) {
      const old = overlays.querySelector("#leftAreaHotspot");
      if (old) old.remove();

      const btn = document.createElement("button");
      btn.id = "leftAreaHotspot";
      btn.className = "hotspot left-area-hotspot";
      btn.type = "button";
      btn.setAttribute("aria-label", "Look left");
      btn.addEventListener("click", onClick);
      overlays.appendChild(btn);

      layout();
    }

    function showCounterHotspot(onClick) {
      const old = overlays.querySelector("#counterHotspot");
      if (old) old.remove();

      const btn = document.createElement("button");
      btn.id = "counterHotspot";
      btn.className = "hotspot counter-hotspot";
      btn.type = "button";
      btn.setAttribute("aria-label", "Counter");
      btn.addEventListener("click", onClick);
      overlays.appendChild(btn);

      layout();
    }

    function showDrawerHotspot(onClick) {
      const old = overlays.querySelector("#drawerHotspot");
      if (old) old.remove();

      const btn = document.createElement("button");
      btn.id = "drawerHotspot";
      btn.className = "hotspot drawer-hotspot";
      btn.type = "button";
      btn.setAttribute("aria-label", "Drawer");
      btn.addEventListener("click", onClick);
      overlays.appendChild(btn);

      layout();
    }

    function showDrawerOpenHotspot(onClick) {
      const old = overlays.querySelector("#drawerOpenHotspot");
      if (old) old.remove();

      const btn = document.createElement("button");
      btn.id = "drawerOpenHotspot";
      btn.className = "hotspot drawer-open-hotspot";
      btn.type = "button";
      btn.setAttribute("aria-label", "Open drawer");
      btn.addEventListener("click", onClick);
      overlays.appendChild(btn);

      layout();
    }

    function showLeftAreaHotspot2(onClick) {
      const old = overlays.querySelector("#leftAreaHotspot2");
      if (old) old.remove();

      const btn = document.createElement("button");
      btn.id = "leftAreaHotspot2";
      btn.className = "hotspot left-area-hotspot-2";
      btn.type = "button";
      btn.setAttribute("aria-label", "Look left");
      btn.addEventListener("click", onClick);
      overlays.appendChild(btn);

      layout();
    }

    function showRoomHotspot(onClick) {
      const old = overlays.querySelector("#roomHotspot");
      if (old) old.remove();

      const btn = document.createElement("button");
      btn.id = "roomHotspot";
      btn.className = "hotspot room-hotspot";
      btn.type = "button";
      btn.setAttribute("aria-label", "Bedroom");
      btn.addEventListener("click", onClick);
      overlays.appendChild(btn);

      layout();
    }

    function getZoneForType(type) {
      if (type === "fork") return overlays.querySelector("#forkZone");
      if (type === "spoon") return overlays.querySelector("#spoonZone");
      if (type === "knife") return overlays.querySelector("#knifeZone");
      return null;
    }

    function getNextSlotRect(type) {
      if (type === "fork") {
        const i = sortingState.placedCounts.fork;
        if (i >= RECTS.sortingSlots.forks.length) return null;
        sortingState.placedCounts.fork += 1;
        return RECTS.sortingSlots.forks[i];
      }

      if (type === "spoon") {
        const i = sortingState.placedCounts.spoon;
        if (i >= RECTS.sortingSlots.spoons.length) return null;
        sortingState.placedCounts.spoon += 1;
        return RECTS.sortingSlots.spoons[i];
      }

      if (type === "knife") {
        const i = sortingState.placedCounts.knife;
        if (i >= RECTS.sortingSlots.knives.length) return null;
        sortingState.placedCounts.knife += 1;
        return RECTS.sortingSlots.knives[i];
      }

      return null;
    }

    function allSortingPlaced() {
      return Object.values(sortingState.items).every((item) => item.placed);
    }

    function showBackSlider(onClick) {
      const old = overlays.querySelector("#room2BackSlider");
      if (old) old.remove();

      const slider = document.createElement("button");
      slider.id = "room2BackSlider";
      slider.className = "room2-back-slider";
      slider.type = "button";
      slider.innerHTML = `<span class="room2-back-arrow">‹</span>`;
      slider.setAttribute("aria-label", "Go back");
      slider.addEventListener("click", onClick);

      overlays.appendChild(slider);
    }

    function resetSortingGame() {
      sortingState.placedCounts.fork = 0;
      sortingState.placedCounts.spoon = 0;
      sortingState.placedCounts.knife = 0;

      Object.values(sortingState.items).forEach((item) => {
        item.placed = false;
        item.currentRect = { ...item.baseRect };
      });
    }

    function startUtensilSortingGame() {
      scene = "utensilsScattered";
      clearOverlays();

      const zones = [
        { id: "forkZone", className: "sorting-zone sorting-zone--fork" },
        { id: "spoonZone", className: "sorting-zone sorting-zone--spoon" },
        { id: "knifeZone", className: "sorting-zone sorting-zone--knife" },
      ];

      zones.forEach(({ id, className }) => {
        const zone = document.createElement("div");
        zone.id = id;
        zone.className = className;
        overlays.appendChild(zone);
      });

      const cleaners = [];

      Object.entries(sortingState.items).forEach(([id, item]) => {
        const el = document.createElement("img");
        el.id = id;
        el.src = item.src;
        el.alt = id;
        el.className = "item-overlay draggable utensil-item";
        el.draggable = false;
        el.style.transform = "translate(0px, 0px)";
        overlays.appendChild(el);

        const cleanup = makeDraggable({
          el,
          canDrag: () => scene === "utensilsScattered" && !sortingState.items[id].placed,
          onDropAttempt: async ({ el, resetTransform }) => {
            if (scene !== "utensilsScattered") return;
            if (sortingState.items[id].placed) return;

            const itemType = sortingState.items[id].type;
            const correctZone = getZoneForType(itemType);

            if (!correctZone) {
              resetTransform();
              return;
            }

            if (isDroppedOnZone(el, correctZone)) {
              const slotRect = getNextSlotRect(itemType);
              if (!slotRect) {
                resetTransform();
                return;
              }

              sortingState.items[id].placed = true;
              sortingState.items[id].currentRect = { ...slotRect };
              resetTransform();
              el.style.pointerEvents = "none";
              layout();

              if (allSortingPlaced()) {
                scene = "drawerSorted";
                clearOverlays();
                await transitionBg("./assets/bg/room2/zoom-drawer.webp");

                showBackSlider(async () => {
                  if (scene !== "drawerSorted") return;

                  resetSortingGame();
                  scene = "drawerMessy";
                  clearOverlays();
                  await setBgInstant("./assets/bg/room2/drawer-messy.webp");

                  showDrawerOpenHotspot(async () => {
                    if (scene !== "drawerMessy") return;

                    await transitionBg("./assets/bg/room2/empty-drawer.webp");
                    resetSortingGame();
                    startUtensilSortingGame();
                  });
                });

                showLeftAreaHotspot2(async () => {
                  if (scene !== "drawerSorted") return;

                  scene = "stare2";
                  clearOverlays();
                  await setBgInstant("./assets/bg/room2/stare-2.webp");

                  enableClickAnywhere(async () => {
                    if (scene !== "stare2") return;

                    scene = "stand";
                    disableClickAnywhere();
                    await setBgInstant("./assets/bg/room2/stare-stand.webp");

                    enableClickAnywhere(async () => {
                      if (scene !== "stand") return;

                      scene = "standFront";
                      disableClickAnywhere();
                      await setBgInstant("./assets/bg/room2/stare-stand-front.webp");

                      enableClickAnywhere(async () => {
                        if (scene !== "standFront") return;

                        scene = "mainViewStatic";
                        disableClickAnywhere();
                        await crossfadeBg("./assets/bg/room2/main-view-static.webp", 900);

                        showClosableDialog({
                          textLines: ["I’m gonna go back to my bedroom…"],
                          onClose: () => {
                            showRoomHotspot(async () => {
                              if (scene !== "mainViewStatic") return;

                              scene = "bedroom";
                              clearOverlays();
                              await transitionBg("./assets/bg/room2/bedroom-game2.webp");

                              await wait(250);
                              localStorage.setItem("room2_done", "1");

                              window.dispatchEvent(
                                new CustomEvent("stage:end", {
                                  detail: {
                                    nextStage: "room3",
                                    menuStage: "intro",
                                    nextLabel: "Next",
                                    menuLabel: "Back to Menu",
                                  },
                                })
                              );
                            });
                          },
                        });
                      });
                    });
                  });
                });
              }
            } else {
              sortingState.items[id].currentRect = { ...sortingState.items[id].baseRect };
              resetTransform();
              layout();
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

    function startBeerGame() {
      scene = "emptyCup";
      clearOverlays();

      const dropZone = document.createElement("div");
      dropZone.id = "beerDropzone";
      dropZone.className = "beer-dropzone";
      overlays.appendChild(dropZone);

      const beer = document.createElement("img");
      beer.id = "beer";
      beer.src = "./assets/props/room2/game-beer.webp";
      beer.alt = "Beer";
      beer.className = "item-overlay draggable";
      beer.draggable = false;
      beer.style.transform = "translate(0px, 0px)";
      overlays.appendChild(beer);

      layout();

      cleanupDrag = makeDraggable({
        el: beer,
        canDrag: () => scene === "emptyCup",
        onDropAttempt: async ({ el, resetTransform }) => {
          if (scene !== "emptyCup") return;

          const dropZoneEl = overlays.querySelector("#beerDropzone");
          if (!dropZoneEl) return;

          if (!isDroppedOnZone(el, dropZoneEl)) {
            resetTransform();
            return;
          }

          scene = "fullCup";
          clearOverlays();
          await transitionBg("./assets/bg/room2/full-cup.webp");

          showClosableDialog({
            textLines: ["Let's go back."],
            onClose: () => {
              showBackSlider(async () => {
                if (scene !== "fullCup") return;

                scene = "emptyCup";
                clearOverlays();
                await setBgInstant("./assets/bg/room2/empty-cup.webp");
                startBeerGame();
              });

              showLeftAreaHotspot(async () => {
                if (scene !== "fullCup") return;

                scene = "stare1";
                clearOverlays();
                await transitionBg("./assets/bg/room2/stare-1.webp");

                showClosableDialog({
                  textLines: [
                    "Damn… why are they staring at me?",
                    "I’m gonna pretend I’m going to the kitchen again...",
                  ],
                  onClose: () => {
                    showCounterHotspot(async () => {
                      if (scene !== "stare1") return;

                      scene = "kitchenCounter";
                      clearOverlays();
                      await transitionBg("./assets/bg/room2/kitchen-countertop.webp");

                      showDrawerHotspot(async () => {
                        if (scene !== "kitchenCounter") return;

                        scene = "drawerMessy";
                        clearOverlays();
                        await transitionBg("./assets/bg/room2/drawer-messy.webp");

                        showDrawerOpenHotspot(async () => {
                          if (scene !== "drawerMessy") return;

                          await transitionBg("./assets/bg/room2/empty-drawer.webp");
                          resetSortingGame();
                          startUtensilSortingGame();
                        });
                      });
                    });
                  },
                });
              });
            },
          });
        },
      });
    }

    function startChatScene() {
      scene = "chatting";
      clearOverlays();

      const monologues = [
        "Maybe they can’t see me",
        "I don’t feel like making loud sound",
        "It’s weird to just go, maybe I’ll make some tea first",
        "Too late…I’ll look weird if I come out and go back right away",
      ];

      async function goToSmokeScene() {
        scene = "smoke";
        clearOverlays();
        await transitionBg("./assets/bg/room2/smoke.webp");

        showSmokeHotspot(async () => {
          if (scene !== "smoke") return;

          scene = "canSmoke";
          clearOverlays();
          await transitionBg("./assets/bg/room2/can-explode.webp");

          showCanHotspot(async () => {
            if (scene !== "canSmoke") return;

            await transitionBg("./assets/bg/room2/empty-cup.webp");
            startBeerGame();
          });
        });
      }

      showRpgDialog({
        textLines: ["There are some people talking. What would you do?"],
        choices: [
          "Wave to them",
          "Yo what's up",
          "Join their conversation",
          "Go back to bedroom",
        ],
        onChoose: async (index) => {
          clearOverlays();

          showRpgDialog({
            textLines: [monologues[index]],
          });

          enableClickAnywhere(async () => {
            if (scene !== "chatting") return;

            disableClickAnywhere();
            await goToSmokeScene();
          });
        },
      });
    }

    const onResize = () => layout();
    window.addEventListener("resize", onResize);
    bg.addEventListener("load", layout, { once: false });

    window.__room2Rects = RECTS;
    window.__room2Layout = layout;
    window.__room2SortingState = sortingState;

    setupRoom2Bgm();
    startChatScene();
    layout();

    this._room2Cleanup = () => {
      window.removeEventListener("resize", onResize);
      if (cleanupDrag) cleanupDrag();
      stopRoom2Bgm();
      delete window.__room2Rects;
      delete window.__room2Layout;
      delete window.__room2SortingState;
    };
  },

  exit({ root }) {
    if (this._room2Cleanup) this._room2Cleanup();
    root.innerHTML = "";
  },
};
