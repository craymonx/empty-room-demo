export default {
  enter({ root, go }) {
    root.innerHTML = `
      <section class="scene" id="scene-room2">
        <div class="scene-inner" id="room2Wrap">
          <img
            id="bg"
            src="./assets/bg/room2/chatting.png"
            class="bg"
            alt="Room 2 scene"
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

    const sceneEl = root.querySelector("#scene-room2");
    const wrap = root.querySelector("#room2Wrap");
    const bg = root.querySelector("#bg");
    const overlays = root.querySelector("#overlays");

    let scene = "chatting";
    let cleanupDrag = null;

    const RECTS = {
      smoke: {
        smoke: { x: 1040, y: 275, w: 50, h: 80 },
      },

      canSmoke: {
        can: { x: 1150, y: 700, w: 200, h: 450 },
      },

      emptyCup: {
        beer: { x: 1160, y: 790, w: 160, h: 360 },
        drop: { x: 1520, y: 975, w: 275, h: 225 },
      },

      fullCup: {
        leftArea: { x: 50, y: 100, w: 750, h: 1500 },
      },

      stare1: {
        counter: { x: 750, y: 60, w: 600, h: 450 },
      },

      kitchenCounter: {
        drawer: { x: 880, y: 1250, w: 950, h: 240 },
      },

      drawerMessy: {
        drawerOpen: { x: 750, y: 1200, w: 1150, h: 350 },
      },

      sortingZones: {
        forkZone: { x: 625, y: 600, w: 450, h: 700 },
        spoonZone: { x: 1125, y: 600, w: 450, h: 700 },
        knifeZone: { x: 1625, y: 600, w: 450, h: 700 },
      },

      sortingSlots: {
        forks: [
          { x: 635, y: 700, w: 90, h: 580, r: 0 },
          { x: 745, y: 700, w: 90, h: 580, r: 0 },
          { x: 855, y: 700, w: 90, h: 580, r: 0 },
          { x: 965, y: 700, w: 90, h: 580, r: 0 },
        ],
        spoons: [
          { x: 1135, y: 700, w: 90, h: 580, r: 0 },
          { x: 1245, y: 700, w: 90, h: 580, r: 0 },
          { x: 1355, y: 700, w: 90, h: 580, r: 0 },
          { x: 1465, y: 700, w: 90, h: 580, r: 0 },
        ],
        knives: [
          { x: 1635, y: 700, w: 90, h: 580, r: 0 },
          { x: 1745, y: 700, w: 90, h: 580, r: 0 },
          { x: 1855, y: 700, w: 90, h: 580, r: 0 },
          { x: 1965, y: 700, w: 90, h: 580, r: 0 },
        ],
      },

      stare2: {
        leftArea: { x: 50, y: 100, w: 750, h: 1500 },
      },

      mainViewStatic: {
        room: { x: 50, y: 100, w: 750, h: 1500 },
      },

      sortingItems: {
        fork1: { type: "fork", src: "./assets/props/room2/fork-1.png", x: 800, y: 700, w: 90, h: 580, r: -120 },
        fork2: { type: "fork", src: "./assets/props/room2/fork-2.png", x: 1290, y: 795, w: 90, h: 580, r: -50 },
        fork3: { type: "fork", src: "./assets/props/room2/fork-3.png", x: 1010, y: 775, w: 90, h: 580, r: -130 },
        fork4: { type: "fork", src: "./assets/props/room2/fork-4.png", x: 1320, y: 800, w: 90, h: 580, r: -290 },

        spoon1: { type: "spoon", src: "./assets/props/room2/spoon-1.png", x: 1220, y: 790, w: 90, h: 580, r: -120 },
        spoon2: { type: "spoon", src: "./assets/props/room2/spoon-2.png", x: 820, y: 675, w: 90, h: 580, r: -300 },
        spoon3: { type: "spoon", src: "./assets/props/room2/spoon-3.png", x: 1020, y: 700, w: 90, h: 580, r: -250 },
        spoon4: { type: "spoon", src: "./assets/props/room2/spoon-4.png", x: 1550, y: 580, w: 90, h: 580, r: -50 },

        knife1: { type: "knife", src: "./assets/props/room2/knife-1.png", x: 760, y: 720, w: 90, h: 580, r: -270 },
        knife2: { type: "knife", src: "./assets/props/room2/knife-2.png", x: 1210, y: 830, w: 90, h: 580, r: -20 },
        knife3: { type: "knife", src: "./assets/props/room2/knife-3.png", x: 1200, y: 515, w: 90, h: 580, r: -110 },
        knife4: { type: "knife", src: "./assets/props/room2/knife-4.png", x: 1570, y: 635, w: 90, h: 580, r: -230 },
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
          placeRectOnImage({
            imgEl: bg,
            parentEl: wrap,
            targetEl: smokeHotspot,
            rectPx: RECTS.smoke.smoke,
          });
        }
      }

      if (scene === "canSmoke") {
        const canHotspot = overlays.querySelector("#canHotspot");
        if (canHotspot) {
          placeRectOnImage({
            imgEl: bg,
            parentEl: wrap,
            targetEl: canHotspot,
            rectPx: RECTS.canSmoke.can,
          });
        }
      }

      if (scene === "emptyCup") {
        const beer = overlays.querySelector("#beer");
        const dropZone = overlays.querySelector("#beerDropzone");

        if (beer) {
          placeRectOnImage({
            imgEl: bg,
            parentEl: wrap,
            targetEl: beer,
            rectPx: RECTS.emptyCup.beer,
          });
        }

        if (dropZone) {
          placeRectOnImage({
            imgEl: bg,
            parentEl: wrap,
            targetEl: dropZone,
            rectPx: RECTS.emptyCup.drop,
          });
        }
      }

      if (scene === "fullCup") {
        const leftHotspot = overlays.querySelector("#leftAreaHotspot");
        if (leftHotspot) {
          placeRectOnImage({
            imgEl: bg,
            parentEl: wrap,
            targetEl: leftHotspot,
            rectPx: RECTS.fullCup.leftArea,
          });
        }
      }

      if (scene === "stare1") {
        const counterHotspot = overlays.querySelector("#counterHotspot");
        if (counterHotspot) {
          placeRectOnImage({
            imgEl: bg,
            parentEl: wrap,
            targetEl: counterHotspot,
            rectPx: RECTS.stare1.counter,
          });
        }
      }

      if (scene === "kitchenCounter") {
        const drawerHotspot = overlays.querySelector("#drawerHotspot");
        if (drawerHotspot) {
          placeRectOnImage({
            imgEl: bg,
            parentEl: wrap,
            targetEl: drawerHotspot,
            rectPx: RECTS.kitchenCounter.drawer,
          });
        }
      }

      if (scene === "drawerMessy") {
        const drawerOpenHotspot = overlays.querySelector("#drawerOpenHotspot");
        if (drawerOpenHotspot) {
          placeRectOnImage({
            imgEl: bg,
            parentEl: wrap,
            targetEl: drawerOpenHotspot,
            rectPx: RECTS.drawerMessy.drawerOpen,
          });
        }
      }

      if (scene === "utensilsScattered") {
        ["forkZone", "spoonZone", "knifeZone"].forEach((zoneId) => {
          const zoneEl = overlays.querySelector(`#${zoneId}`);
          if (!zoneEl) return;

          placeRectOnImage({
            imgEl: bg,
            parentEl: wrap,
            targetEl: zoneEl,
            rectPx: RECTS.sortingZones[zoneId],
          });
        });

        Object.keys(sortingState.items).forEach((id) => {
          const el = overlays.querySelector(`#${id}`);
          if (!el) return;

          placeRectOnImage({
            imgEl: bg,
            parentEl: wrap,
            targetEl: el,
            rectPx: sortingState.items[id].currentRect,
          });
        });
      }

      if (scene === "stare2" || scene === "drawerSorted") {
        const leftHotspot2 = overlays.querySelector("#leftAreaHotspot2");
        if (leftHotspot2) {
          placeRectOnImage({
            imgEl: bg,
            parentEl: wrap,
            targetEl: leftHotspot2,
            rectPx: RECTS.stare2.leftArea,
          });
        }
      }

      if (scene === "mainViewStatic") {
        const roomHotspot = overlays.querySelector("#roomHotspot");
        if (roomHotspot) {
          placeRectOnImage({
            imgEl: bg,
            parentEl: wrap,
            targetEl: roomHotspot,
            rectPx: RECTS.mainViewStatic.room,
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

    function showRpgDialog({ speaker, textLines, choices, onChoose }) {
      const old = overlays.querySelector("#rpgDialog");
      if (old) old.remove();
    
      const box = document.createElement("div");
      box.id = "rpgDialog";
      box.className = "rpg-ui";
      box.innerHTML = `
        <div class="rpg-box rpg-box--dialog">
          <div class="rpg-text">${textLines.map((line) => `<div>${line}</div>`).join("")}</div>
        </div>
        <div class="rpg-box rpg-box--choices">
          ${choices
            .map(
              (choice, i) => `
                <button class="rpg-choice ${i === 0 ? "is-active" : ""}" data-choice="${i}">
                  ${choice}
                </button>
              `
            )
            .join("")}
        </div>
      `;
    
      overlays.appendChild(box);
    
      const buttons = [...box.querySelectorAll(".rpg-choice")];
    
      buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
          buttons.forEach((b) => b.classList.remove("is-active"));
          btn.classList.add("is-active");
      
          const index = Number(btn.dataset.choice);
      
          // allow one visible frame before changing scene
          setTimeout(() => {
            onChoose(index);
          }, 120);
        });
      });
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

    function showCompletionPopup({ title = "Completed!", message = "Next stage unlocked.", onContinue }) {
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

      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.remove();
          onContinue?.();
        }
      });
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
                await transitionBg("./assets/bg/room2/zoom-drawer.png");

                showLeftAreaHotspot2(async () => {
                  if (scene !== "drawerSorted") return;

                  scene = "stare2";
                  clearOverlays();
                  await setBgInstant("./assets/bg/room2/stare-2.png");

                  enableClickAnywhere(async () => {
                    if (scene !== "stare2") return;

                    scene = "stand";
                    disableClickAnywhere();
                    await setBgInstant("./assets/bg/room2/stand.png");

                    enableClickAnywhere(async () => {
                      if (scene !== "stand") return;

                      scene = "standFront";
                      disableClickAnywhere();
                      await setBgInstant("./assets/bg/room2/stand-front.png");

                      enableClickAnywhere(async () => {
                        if (scene !== "standFront") return;

                        scene = "mainViewStatic";
                        disableClickAnywhere();
                        await transitionBg("./assets/bg/room2/main-view-static.png");

                        showRoomHotspot(async () => {
                          if (scene !== "mainViewStatic") return;

                          scene = "bedroom";
                          clearOverlays();
                          await transitionBg("./assets/bg/room2/bedroom.png");

                          await wait(250);
                          localStorage.setItem("room2_done", "1");

                          showCompletionPopup({
                            title: "Room 2 cleared",
                            message: "You are ready to unlock the next stage.",
                            onContinue: () => go("intro"),
                          });
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
      beer.src = "./assets/props/room2/beer.png";
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
          await transitionBg("./assets/bg/room2/full-cup.png");

          showLeftAreaHotspot(async () => {
            if (scene !== "fullCup") return;

            scene = "stare1";
            clearOverlays();
            await transitionBg("./assets/bg/room2/stare-1.png");

            showCounterHotspot(async () => {
              if (scene !== "stare1") return;

              scene = "kitchenCounter";
              clearOverlays();
              await transitionBg("./assets/bg/room2/kitchen-counter.png");

              showDrawerHotspot(async () => {
                if (scene !== "kitchenCounter") return;

                scene = "drawerMessy";
                clearOverlays();
                await transitionBg("./assets/bg/room2/drawer-messy.png");

                showDrawerOpenHotspot(async () => {
                  if (scene !== "drawerMessy") return;

                  await transitionBg("./assets/bg/room2/empty-drawer.png");
                  startUtensilSortingGame();
                });
              });
            });
          });
        },
      });
    }

    function startChatScene() {
      scene = "chatting";
      clearOverlays();

      showRpgDialog({
        textLines: ["There are some people talking. What would you do?"],
        choices: [
          "Wave to them",
          "Yo what's up",
          "Join their conversation",
          "Go back to bedroom",
        ],
        onChoose: async () => {
          scene = "smoke";
          clearOverlays();
          await transitionBg("./assets/bg/room2/smoke.png");

          showSmokeHotspot(async () => {
            if (scene !== "smoke") return;

            scene = "canSmoke";
            clearOverlays();
            await transitionBg("./assets/bg/room2/can-explode.png");

            showCanHotspot(async () => {
              if (scene !== "canSmoke") return;

              await transitionBg("./assets/bg/room2/empty-cup.png");
              startBeerGame();
            });
          });
        },
      });
    }

    root.querySelector("#backBtn").addEventListener("click", () => go("intro"));
    root.querySelector("#debugBtn").addEventListener("click", () => {
      sceneEl.classList.toggle("debug-hotspots");
    });

    const onResize = () => layout();
    window.addEventListener("resize", onResize);
    bg.addEventListener("load", layout, { once: false });

    window.__room2Rects = RECTS;
    window.__room2Layout = layout;
    window.__room2SortingState = sortingState;

    startChatScene();
    layout();

    this._room2Cleanup = () => {
      window.removeEventListener("resize", onResize);
      if (cleanupDrag) cleanupDrag();
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