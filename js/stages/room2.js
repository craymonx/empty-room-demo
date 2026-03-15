// /js/stages/room2.js
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
          smoke: { x: 1040, y: 275, w: 50, h: 80 }, // update
        },
        canSmoke: {
          can: { x: 1150, y: 700, w: 200, h: 450 }, // update
        },
        emptyCup: {
          beer: { x: 1200, y: 900, w: 125, h: 275 }, // initial beer overlay
          drop: { x: 1520, y: 975, w: 275, h: 225  }, // cup target zone
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
  
      function makeDraggable({ el, dropzone, canDrag, onDrop }) {
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
  
      function showRpgDialog({ speaker, textLines, choices, onChoose }) {
        const old = overlays.querySelector("#rpgDialog");
        if (old) old.remove();
  
        const box = document.createElement("div");
        box.id = "rpgDialog";
        box.className = "rpg-ui";
        box.innerHTML = `
          <div class="rpg-box rpg-box--dialog">
            <div class="rpg-speaker">${speaker}</div>
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
  
        box.querySelectorAll(".rpg-choice").forEach((btn) => {
          btn.addEventListener("click", () => {
            const index = Number(btn.dataset.choice);
            onChoose(index);
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
          dropzone: dropZone,
          canDrag: () => scene === "emptyCup",
          onDrop: async () => {
            if (scene !== "emptyCup") return;
  
            scene = "fullCup";
            clearOverlays();
            await transitionBg("./assets/bg/room2/full-cup.png");
  
            await wait(250);
            localStorage.setItem("room2_done", "1");
  
            showCompletionPopup({
              title: "Room 2 cleared",
              message: "You are ready to unlock the next stage.",
              onContinue: () => go("intro"),
            });
          },
        });
      }
  
      function startChatScene() {
        scene = "chatting";
        clearOverlays();
  
        showRpgDialog({
          speaker: "JOHN:",
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
              await transitionBg("./assets/bg/room2/can-smoke.png");
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
  
      startChatScene();
      layout();
  
      this._room2Cleanup = () => {
        window.removeEventListener("resize", onResize);
        if (cleanupDrag) cleanupDrag();
      };
    },
  
    exit({ root }) {
      if (this._room2Cleanup) this._room2Cleanup();
      root.innerHTML = "";
    },
  };