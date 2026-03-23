export default {
    enter({ root, go }) {
      root.innerHTML = `
        <section class="scene" id="scene-room3">
          <div class="scene-inner" id="room3Wrap">
            <img
              id="bg"
              src="./assets/bg/room3/dirty-room.png"
              class="bg"
              alt="Room 3 scene"
              draggable="false"
            />
  
            <div id="overlays" class="overlays" aria-hidden="false"></div>
            <div id="dialogLayer" class="room3-dialog-layer"></div>
  
            <div class="hud">
              <button id="backBtn" class="hud-btn">Back</button>
              <button id="debugBtn" class="hud-btn">Hotspots</button>
            </div>
          </div>
        </section>
      `;
  
      const wrap = root.querySelector("#room3Wrap");
      const bg = root.querySelector("#bg");
      const overlays = root.querySelector("#overlays");
      const dialogLayer = root.querySelector("#dialogLayer");
      const backBtn = root.querySelector("#backBtn");
      const debugBtn = root.querySelector("#debugBtn");
  
      let scene = "dirtyRoomStart";
      let debug = false;
      let shownIntro = false;
      let doorChecked = false;
      let guidelineSeen = false;
      let cleanupFns = [];
      let phoneInput = "";
  
      let freshenerDragMs = 0;
      let freshenerDragStartTs = null;
      let freshenerDone = false;
      let endShown = false;
  
      const CORRECT_SECURITY_NUMBER = "20210115";
      const FRESHENER_REQUIRED_MS = 3000;
  
      const RECTS = {
        dirtyRoomStart: {
          door: { x: 2400, y: 200, w: 320, h: 900 },
        },
  
        zoomDoor: {
          door: { x: 700, y: 0, w: 1300, h: 1580 },
          paper: { x: 1100, y: 375, w: 520, h: 690 },
          returnLeft: { x: 0, y: 0, w: 260, h: 1800 },
        },
  
        dirtyRoomAfterGuideline: {
          phone: { x: 375, y: 800, w: 80, h: 20 },
          backToZoomDoor: { x: 2400, y: 200, w: 320, h: 900 },
        },
  
        security1: {
          security: { x: 2300, y: 350, w: 300, h: 800 }, // adjust later
          guard: { x: 1850, y: 280, w: 700, h: 1300 },   // adjust later
          paper: { x: 1230, y: 950, w: 320, h: 340 },    // adjust later
        },
  
        inspect1: {
            toInspect2: { x: 1650, y: 500, w: 330, h: 540 }, // adjust later
          },
  
        inspect2: {
            paper: { x: 850, y: 1075, w: 425, h: 150 }, // adjust later
          },
  
        security2: {
          security: { x: 850, y: 1075, w: 800, h: 450 }, // adjust later
        },
  
        paper2: {},
  
        roomCleaned: {},
      };
  
      const BG_MAP = {
        dirtyRoomStart: "./assets/bg/room3/dirty-room.png",
        dirtyRoomAfterGuideline: "./assets/bg/room3/dirty-room.png",
        zoomDoor: "./assets/bg/room3/zoom-door.png",
  
        security1: "./assets/bg/room3/security-1.png",
        inspect1: "./assets/bg/room3/inspect-1.png",
        inspect2: "./assets/bg/room3/inspect-2.png",
        security2: "./assets/bg/room3/security-2.png",
        paper2: "./assets/bg/room3/paper-2.png",
        roomCleaned: "./assets/bg/room3/room-cleaned.png",
      };
  
      function addCleanup(fn) {
        cleanupFns.push(fn);
      }
  
      function runCleanup() {
        cleanupFns.forEach((fn) => {
          try {
            fn();
          } catch (e) {
            console.warn("cleanup error", e);
          }
        });
        cleanupFns = [];
      }
  
      function getDrawnImageRect(imgEl) {
        const wrapRect = wrap.getBoundingClientRect();
        const naturalW = imgEl.naturalWidth || 1;
        const naturalH = imgEl.naturalHeight || 1;
        const imgRatio = naturalW / naturalH;
        const wrapRatio = wrapRect.width / wrapRect.height;
  
        let drawW, drawH, left, top;
  
        if (imgRatio > wrapRatio) {
          drawW = wrapRect.width;
          drawH = drawW / imgRatio;
          left = 0;
          top = (wrapRect.height - drawH) / 2;
        } else {
          drawH = wrapRect.height;
          drawW = drawH * imgRatio;
          top = 0;
          left = (wrapRect.width - drawW) / 2;
        }
  
        return { left, top, width: drawW, height: drawH };
      }
  
      function placeRectOnImage(rect, drawnRect, naturalW, naturalH) {
        return {
          left: drawnRect.left + (rect.x / naturalW) * drawnRect.width,
          top: drawnRect.top + (rect.y / naturalH) * drawnRect.height,
          width: (rect.w / naturalW) * drawnRect.width,
          height: (rect.h / naturalH) * drawnRect.height,
        };
      }
  
      function clearOverlays() {
        overlays.innerHTML = "";
      }
  
      function clearDialog() {
        dialogLayer.innerHTML = "";
      }
  
      function escapeHtml(str = "") {
        return String(str)
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;")
          .replaceAll('"', "&quot;")
          .replaceAll("'", "&#039;");
      }
  
      function showMonologue(text, onClose) {
        clearDialog();
  
        const box = document.createElement("div");
        box.className = "room3-monologue";
        box.innerHTML = `
          <div class="room3-monologue__inner">
            <p class="room3-monologue__text">${escapeHtml(text)}</p>
            <button class="room3-monologue__next" aria-label="Continue">›</button>
          </div>
        `;
  
        const nextBtn = box.querySelector(".room3-monologue__next");
        nextBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          clearDialog();
          if (typeof onClose === "function") onClose();
        });
  
        dialogLayer.appendChild(box);
      }

      function showEndGame() {
        clearDialog();
      
        const popup = document.createElement("div");
        popup.className = "popup room3-end-popup";
        popup.innerHTML = `
          <div class="popup-card">
            <h3 class="popup-title">Room Cleaned</h3>
            <p class="popup-msg">
              The smell is gone.<br>
              For now.
            </p>
            <div class="popup-actions">
              <button type="button" class="hud-btn" data-action="exit">Exit</button>
            </div>
          </div>
        `;
      
        popup.querySelector('[data-action="exit"]').addEventListener("click", () => {
          localStorage.setItem("room3_done", "1");
          go("intro");
        });
      
        dialogLayer.appendChild(popup);
      }
  
      function showBlockingMessageAndAdvance(text, nextScene) {
        clearDialog();
  
        const overlay = document.createElement("div");
        overlay.className = "room3-advance-overlay";
        overlay.innerHTML = `
          <div class="room3-advance-overlay__hit"></div>
          <div class="room3-monologue room3-monologue--blocking">
            <div class="room3-monologue__inner">
              <p class="room3-monologue__text">${escapeHtml(text).replaceAll("\n", "<br>")}</p>
            </div>
          </div>
        `;
  
        const hit = overlay.querySelector(".room3-advance-overlay__hit");
        hit.addEventListener("click", () => {
          scene = nextScene;
          render();
        });
  
        dialogLayer.appendChild(overlay);
      }
  
      function renderPhoneDisplay(value) {
        const display = dialogLayer.querySelector(".room3-phone__display-text");
        if (display) display.textContent = value || "";
      }
  
      function openPhonePopup() {
        phoneInput = "";
        clearDialog();
  
        const popup = document.createElement("div");
        popup.className = "room3-phone-popup";
        popup.innerHTML = `
          <div class="room3-phone-popup__backdrop"></div>
  
          <div class="room3-phone">
            <button class="room3-phone__close" type="button" aria-label="Close phone">×</button>
  
            <div class="room3-phone__speaker"></div>
  
            <div class="room3-phone__screen">
              <div class="room3-phone__label">Dial Number</div>
              <div class="room3-phone__display">
                <span class="room3-phone__display-text"></span>
              </div>
            </div>
  
            <div class="room3-phone__pad">
              <button type="button" class="room3-phone__key" data-key="1">1</button>
              <button type="button" class="room3-phone__key" data-key="2">2</button>
              <button type="button" class="room3-phone__key" data-key="3">3</button>
              <button type="button" class="room3-phone__key" data-key="4">4</button>
              <button type="button" class="room3-phone__key" data-key="5">5</button>
              <button type="button" class="room3-phone__key" data-key="6">6</button>
              <button type="button" class="room3-phone__key" data-key="7">7</button>
              <button type="button" class="room3-phone__key" data-key="8">8</button>
              <button type="button" class="room3-phone__key" data-key="9">9</button>
              <button type="button" class="room3-phone__key room3-phone__key--wide" data-action="clear">C</button>
              <button type="button" class="room3-phone__key" data-key="0">0</button>
              <button type="button" class="room3-phone__key room3-phone__key--wide" data-action="back">⌫</button>
            </div>
  
            <div class="room3-phone__actions">
              <button type="button" class="room3-phone__btn room3-phone__btn--cancel">Hang Up</button>
              <button type="button" class="room3-phone__btn room3-phone__btn--dial">Dial</button>
            </div>
          </div>
        `;
  
        const closeBtn = popup.querySelector(".room3-phone__close");
        const cancelBtn = popup.querySelector(".room3-phone__btn--cancel");
        const dialBtn = popup.querySelector(".room3-phone__btn--dial");
        const keyButtons = popup.querySelectorAll(".room3-phone__key");
  
        function closePhone() {
          popup.remove();
        }
  
        closeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          closePhone();
        });
  
        cancelBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          closePhone();
        });
  
        keyButtons.forEach((btn) => {
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
  
            const key = btn.dataset.key;
            const action = btn.dataset.action;
  
            if (key && phoneInput.length < 16) {
              phoneInput += key;
            }
  
            if (action === "clear") {
              phoneInput = "";
            }
  
            if (action === "back") {
              phoneInput = phoneInput.slice(0, -1);
            }
  
            renderPhoneDisplay(phoneInput);
          });
        });
  
        dialBtn.addEventListener("click", (e) => {
          e.stopPropagation();
  
          if (phoneInput === CORRECT_SECURITY_NUMBER) {
            clearDialog();
            showBlockingMessageAndAdvance(
              `Thank you for calling Student Housing Support.
  Your concern is important to us.
  Our office is currently closed.
  For emergencies, please contact School Security at 20210115.
  Please do not leave a message.`,
              "security1"
            );
            return;
          }
  
          renderPhoneDisplay(phoneInput || "");
        });
  
        dialogLayer.appendChild(popup);
        renderPhoneDisplay(phoneInput);
      }
  
      function openPaperPopup() {
        guidelineSeen = true;
        clearDialog();
  
        const popup = document.createElement("div");
        popup.className = "room3-paper-popup";
        popup.innerHTML = `
          <div class="room3-paper-popup__backdrop"></div>
  
          <div class="room3-paper-popup__sheet-wrap">
            <img
              class="room3-paper-popup__sheet"
              src="./assets/props/room3/resident-guidelines.png"
              alt="Resident guidelines"
              draggable="false"
            />
          </div>
        `;
  
        const sheet = popup.querySelector(".room3-paper-popup__sheet");
        sheet.addEventListener("click", (e) => {
          e.stopPropagation();
          popup.remove();
          buildSceneHotspots();
        });
  
        dialogLayer.appendChild(popup);
      }
  
      function openChecklistPopup() {
        clearDialog();
  
        const popup = document.createElement("div");
        popup.className = "room3-paper-popup";
        popup.innerHTML = `
          <div class="room3-paper-popup__backdrop"></div>
  
          <div class="room3-paper-popup__sheet-wrap">
            <img
              class="room3-paper-popup__sheet"
              src="./assets/props/room3/checklist.png"
              alt="Checklist"
              draggable="false"
            />
          </div>
        `;
  
        const sheet = popup.querySelector(".room3-paper-popup__sheet");
        sheet.addEventListener("click", (e) => {
          e.stopPropagation();
          scene = "security2";
          render();
        });
  
        dialogLayer.appendChild(popup);
      }
  
      function enableFreshenerDrag() {
        const freshener = document.createElement("img");
        freshener.src = "./assets/props/room3/air-freshener.png";
        freshener.alt = "Air freshener";
        freshener.className = "room3-freshener";
        freshener.draggable = false;
      
        let x = 100;
        let y = 500;
        let dragging = false;
        let pointerId = null;
        let offsetX = 0;
        let offsetY = 0;
      
        function applyPos() {
          freshener.style.left = `${x}px`;
          freshener.style.top = `${y}px`;
        }
      
        function finishIfReady() {
            if (freshenerDone) return;
          
            const liveDragMs =
              freshenerDragMs +
              (freshenerDragStartTs !== null ? performance.now() - freshenerDragStartTs : 0);
          
            if (liveDragMs >= FRESHENER_REQUIRED_MS) {
              freshenerDone = true;
              scene = "roomCleaned";
              render();
            }
          }
      
        function stopDragAccounting() {
          if (freshenerDragStartTs !== null) {
            freshenerDragMs += performance.now() - freshenerDragStartTs;
            freshenerDragStartTs = null;
            finishIfReady();
          }
        }
      
        function onPointerMove(e) {
            if (!dragging || e.pointerId !== pointerId) return;
          
            const wrapRect = wrap.getBoundingClientRect();
            x = e.clientX - wrapRect.left - offsetX;
            y = e.clientY - wrapRect.top - offsetY;
            applyPos();
          
            finishIfReady();
          }
      
        function onPointerUp(e) {
          if (e.pointerId !== pointerId) return;
      
          dragging = false;
          pointerId = null;
          stopDragAccounting();
          freshener.classList.remove("is-dragging");
        }
      
        freshener.addEventListener("pointerdown", (e) => {
          e.preventDefault();
          e.stopPropagation();
      
          const rect = freshener.getBoundingClientRect();
          offsetX = e.clientX - rect.left;
          offsetY = e.clientY - rect.top;
      
          dragging = true;
          pointerId = e.pointerId;
      
          if (freshenerDragStartTs === null) {
            freshenerDragStartTs = performance.now();
          }
      
          freshener.classList.add("is-dragging");
      
          if (freshener.setPointerCapture) {
            try {
              freshener.setPointerCapture(pointerId);
            } catch (err) {
              console.warn("pointer capture failed", err);
            }
          }
        });
      
        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
        window.addEventListener("pointercancel", onPointerUp);
      
        addCleanup(() => {
          window.removeEventListener("pointermove", onPointerMove);
          window.removeEventListener("pointerup", onPointerUp);
          window.removeEventListener("pointercancel", onPointerUp);
          stopDragAccounting();
        });
      
        overlays.appendChild(freshener);
        applyPos();
      }

      function makeHotspot(name, rect, onClick) {
        const btn = document.createElement("button");
        btn.className = `hotspot room3-hotspot room3-hotspot--${name}`;
        btn.setAttribute("aria-label", name);
  
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          onClick();
        });
  
        overlays.appendChild(btn);
        return { el: btn, rect };
      }
  
      function buildSceneHotspots() {
        runCleanup();
        clearOverlays();
  
        const naturalW = bg.naturalWidth || 1;
        const naturalH = bg.naturalHeight || 1;
        const items = [];
  
        if (scene === "dirtyRoomStart") {
          items.push(
            makeHotspot("door", RECTS.dirtyRoomStart.door, () => {
              scene = "zoomDoor";
              render();
            })
          );
        }
  
        if (scene === "zoomDoor") {
          items.push(
            makeHotspot("door", RECTS.zoomDoor.door, () => {
              showMonologue("it is locked", () => {
                if (!doorChecked) {
                  doorChecked = true;
                  buildSceneHotspots();
                }
              });
            })
          );
  
          if (doorChecked) {
            items.push(
              makeHotspot("paper", RECTS.zoomDoor.paper, () => {
                openPaperPopup();
              })
            );
          }
  
          if (guidelineSeen) {
            items.push(
              makeHotspot("return-left", RECTS.zoomDoor.returnLeft, () => {
                scene = "dirtyRoomAfterGuideline";
                render();
              })
            );
          }
        }
  
        if (scene === "dirtyRoomAfterGuideline") {
          items.push(
            makeHotspot("phone", RECTS.dirtyRoomAfterGuideline.phone, () => {
              openPhonePopup();
            })
          );
  
          items.push(
            makeHotspot("back-to-zoom-door", RECTS.dirtyRoomAfterGuideline.backToZoomDoor, () => {
              scene = "zoomDoor";
              render();
            })
          );
        }
  
        if (scene === "security1") {
            items.push(
              makeHotspot("security", RECTS.security1.security, () => {
                scene = "inspect1";
                render();
              })
            );
          }
  
          if (scene === "inspect1") {
            items.push(
              makeHotspot("to-inspect2", RECTS.inspect1.toInspect2, () => {
                scene = "inspect2";
                render();
              })
            );
          }
  
          if (scene === "inspect2") {
            items.push(
              makeHotspot("paper", RECTS.inspect2.paper, () => {
                openChecklistPopup();
              })
            );
          }
  
        if (scene === "security2") {
          items.push(
            makeHotspot("security", RECTS.security2.security, () => {
              scene = "paper2";
              render();
            })
          );
        }
  
        if (scene === "paper2") {
          // draggable freshener handled after render
        }
  
        if (scene === "roomCleaned") {
          // next step later
        }

        if (scene === "roomCleaned" && !endShown) {
            endShown = true;
            localStorage.setItem("room3_done", "1");
            setTimeout(() => {
              showEndGame();
            }, 5000);
          }
  
        function layout() {
          const drawnRect = getDrawnImageRect(bg);
  
          items.forEach(({ el, rect }) => {
            const placed = placeRectOnImage(rect, drawnRect, naturalW, naturalH);
            el.style.left = `${placed.left}px`;
            el.style.top = `${placed.top}px`;
            el.style.width = `${placed.width}px`;
            el.style.height = `${placed.height}px`;
  
            if (debug) {
              el.style.outline = "2px dashed rgba(255,255,255,.9)";
              el.style.background = "rgba(255,255,255,.12)";
            } else {
              el.style.outline = "none";
              el.style.background = "transparent";
            }
          });
        }
  
        layout();
        window.addEventListener("resize", layout);
        addCleanup(() => window.removeEventListener("resize", layout));
      }
  
      function showImageError(message) {
        clearDialog();
  
        const box = document.createElement("div");
        box.className = "room3-monologue";
        box.innerHTML = `
          <div class="room3-monologue__inner">
            <p class="room3-monologue__text">${escapeHtml(message)}</p>
          </div>
        `;
        dialogLayer.appendChild(box);
      }
  
      function render() {
        runCleanup();
        clearOverlays();
        clearDialog();
  
        const src = BG_MAP[scene];
        bg.src = src;
  
        bg.onload = () => {
          buildSceneHotspots();
  
          if (scene === "dirtyRoomStart" && !shownIntro) {
            shownIntro = true;
            showMonologue("What's that smell?");
          }
  
          if (scene === "paper2") {
            enableFreshenerDrag();
          }

          if (scene === "roomCleaned") {
            setTimeout(() => {
              showEndGame();
            }, 5000);
          }
        };
  
        bg.onerror = () => {
          console.error("Failed to load image:", src);
          showImageError(`Failed to load image: ${src}`);
        };
      }
  
      backBtn.addEventListener("click", () => go("intro"));
  
      debugBtn.addEventListener("click", () => {
        debug = !debug;
        buildSceneHotspots();
      });
  
      render();
    },
  
    exit({ root }) {
      root.innerHTML = "";
    },
  };