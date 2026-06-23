let room3Bgm = null;

export default {
  enter({ root, go }) {
    root.innerHTML = `
      <section class="scene" id="scene-room3">
        <div class="scene-inner" id="room3Wrap">
          <img
            id="bg"
            src="./assets/bg/room3/dirty-room.webp"
            class="bg"
            alt="Room 3 scene"
            draggable="false"
          />

          <div id="overlays" class="overlays"></div>
          <div id="dialogLayer" class="room3-dialog-layer"></div>
        </div>
      </section>
    `;

    const wrap = root.querySelector("#room3Wrap");
    const bg = root.querySelector("#bg");
    const overlays = root.querySelector("#overlays");
    const dialogLayer = root.querySelector("#dialogLayer");

    let scene = "dirtyRoomStart";
    let cleanupFns = [];
    let shownIntro = false;
    let phoneInput = "";

    let freshenerDragMs = 0;
    let freshenerDragStartTs = null;
    let freshenerDone = false;
    let endShown = false;

    let zoomDoorDialogShown = false;
    let guidelineAfterDialogShown = false;
    let security1DialogShown = false;
    let paper2DialogShown = false;

    const CORRECT_SECURITY_NUMBER = "20200813";
    const FRESHENER_REQUIRED_MS = 3000;

    const BGM_SRC = "./assets/audio/room3/3 no wheel no deal bgm 2.wav";
    const SPRAY_SRC = "./assets/audio/room3/spray.wav";

    // IMPORTANT:
    // All Room 3 coordinates below are based on the original 2800 × 1800 image size.
    // Keep this fixed even after resizing/compressing the actual WebP images.
    const COORD_W = 2800;
    const COORD_H = 1800;

    const RECTS = {
      dirtyRoomStart: {
        door: { x: 2600, y: 300, w: 320, h: 900 },
      },

      zoomDoor: {
        door: { x: 700, y: 0, w: 1300, h: 1800 },
        paper: { x: 1100, y: 375, w: 590, h: 900 },
        returnLeft: { x: 0, y: 0, w: 150, h: 1800 },
      },

      dirtyRoomAfterGuideline: {
        phone: { x: 375, y: 920, w: 80, h: 20 },
        backToZoomDoor: { x: 2500, y: 270, w: 320, h: 900 },
      },

      security1: {
        security: { x: 2300, y: 350, w: 300, h: 800 },
      },

      inspect1: {
        toInspect2: { x: 1700, y: 550, w: 350, h: 650 },
      },

      inspect2: {
        next: { x: 0, y: 0, w: 2800, h: 1800 },
      },

      paper1: {
        paper: { x: 1310, y: 1360, w: 325, h: 190 },
      },

      security2: {
        security: { x: 850, y: 1075, w: 800, h: 450 },
      },

      paper2: {
        freshenerStart: { x: 200, y: 800, w: 50, h: 150 },
        paper1: { x: 520, y: 1430, w: 300, h: 220 },
        paper2: { x: 1280, y: 1180, w: 330, h: 190 },
        paper3: { x: 1280, y: 1380, w: 300, h: 180 },
        paper4: { x: 1600, y: 1300, w: 230, h: 130 },
        paper5: { x: 1600, y: 1440, w: 250, h: 190 },
      },

      roomCleaned: {},
    };

    const BG_MAP = {
      dirtyRoomStart: "./assets/bg/room3/dirty-room.webp",
      dirtyRoomAfterGuideline: "./assets/bg/room3/dirty-room.webp",
      zoomDoor: "./assets/bg/room3/zoom-door.webp",
      security1: "./assets/bg/room3/security-1.webp",
      inspect1: "./assets/bg/room3/inspect-1.webp",
      inspect2: "./assets/bg/room3/inspect-2.webp",
      paper1: "./assets/bg/room3/paper-1.webp",
      security2: "./assets/bg/room3/security-2.webp",
      paper2: "./assets/bg/room3/paper-2.webp",
      roomCleaned: "./assets/bg/room3/room-cleaned.webp",
    };

    function startBgm() {
      if (!room3Bgm) {
        room3Bgm = new Audio(BGM_SRC);
        room3Bgm.loop = true;
        room3Bgm.volume = 0.45;
      }

      room3Bgm.play().catch(() => {
        const unlockAudio = () => {
          room3Bgm.play().catch(() => {});
          window.removeEventListener("click", unlockAudio);
          window.removeEventListener("pointerdown", unlockAudio);
        };

        window.addEventListener("click", unlockAudio, { once: true });
        window.addEventListener("pointerdown", unlockAudio, { once: true });
      });
    }

    function playSpraySound() {
      const spray = new Audio(SPRAY_SRC);
      spray.volume = 0.7;
      spray.play().catch(() => {});
    }

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

      let drawW;
      let drawH;
      let left;
      let top;

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

      return {
        left,
        top,
        width: drawW,
        height: drawH,
      };
    }

    function placeRectOnImage(rect, drawnRect) {
      return {
        left: drawnRect.left + (rect.x / COORD_W) * drawnRect.width,
        top: drawnRect.top + (rect.y / COORD_H) * drawnRect.height,
        width: (rect.w / COORD_W) * drawnRect.width,
        height: (rect.h / COORD_H) * drawnRect.height,
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
          <p class="room3-monologue__text">${escapeHtml(text).replaceAll("\n", "<br>")}</p>
          <button class="room3-monologue__next" type="button">›</button>
        </div>
      `;

      box.querySelector(".room3-monologue__next").addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        clearDialog();

        if (typeof onClose === "function") {
          onClose();
        }
      });

      dialogLayer.appendChild(box);
    }

    function showBlockingMessageAndAdvance(text, nextScene) {
      showMonologue(text, () => {
        scene = nextScene;
        render();
      });
    }

    function renderPhoneDisplay(value) {
      const display = dialogLayer.querySelector(".room3-phone__display-text");
      if (display) {
        display.textContent = value || "";
      }
    }

    function openChecklistPopup(fileName = "checklist-1.webp", onClose) {
      clearDialog();

      const popup = document.createElement("div");
      popup.className = "room3-paper-popup";

      popup.innerHTML = `
        <div class="room3-paper-popup__backdrop"></div>

        <div class="room3-paper-popup__sheet-wrap">
          <img
            class="room3-paper-popup__sheet"
            src="./assets/props/room3/${fileName}"
            alt="Checklist"
            draggable="false"
          />
        </div>
      `;

      popup.querySelector(".room3-paper-popup__sheet").addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        popup.remove();

        if (typeof onClose === "function") {
          onClose();
        }
      });

      dialogLayer.appendChild(popup);
    }

    function openPaperPopup() {
      openChecklistPopup("resident-guidelines.webp", () => {
        if (!guidelineAfterDialogShown) {
          guidelineAfterDialogShown = true;
          showMonologue("I guess I have to stay and call for help");
        }
      });
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

      function closePhone() {
        popup.remove();
      }

      function showPhoneError(message) {
        clearDialog();

        showMonologue(message, () => {
          openPhonePopup();
        });
      }

      popup.querySelector(".room3-phone__close").addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        closePhone();
      });

      popup.querySelector(".room3-phone__btn--cancel").addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        closePhone();
      });

      popup.querySelectorAll(".room3-phone__key").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
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

      popup.querySelector(".room3-phone__btn--dial").addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (phoneInput === CORRECT_SECURITY_NUMBER) {
          closePhone();

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

        showPhoneError("The number you have dialed does not exist.");
      });

      dialogLayer.appendChild(popup);
      renderPhoneDisplay(phoneInput);
    }

    function enableFreshenerDrag() {
      const freshener = document.createElement("img");
      freshener.src = "./assets/props/room3/freshener.webp";
      freshener.alt = "Air freshener";
      freshener.className = "room3-freshener";
      freshener.draggable = false;

      const drawnRect = getDrawnImageRect(bg);
      const startPlaced = placeRectOnImage(RECTS.paper2.freshenerStart, drawnRect);

      let x = startPlaced.left;
      let y = startPlaced.top;
      let dragging = false;
      let pointerId = null;
      let offsetX = 0;
      let offsetY = 0;

      freshener.style.left = `${x}px`;
      freshener.style.top = `${y}px`;
      freshener.style.width = `${startPlaced.width}px`;
      freshener.style.height = `${startPlaced.height}px`;

      function applyPos() {
        freshener.style.left = `${x}px`;
        freshener.style.top = `${y}px`;
      }

      function finishIfReady() {
        if (freshenerDone) return;

        const liveDragMs =
          freshenerDragMs +
          (freshenerDragStartTs !== null
            ? performance.now() - freshenerDragStartTs
            : 0);

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

        playSpraySound();

        const rect = freshener.getBoundingClientRect();

        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

        dragging = true;
        pointerId = e.pointerId;

        if (freshenerDragStartTs === null) {
          freshenerDragStartTs = performance.now();
        }

        freshener.classList.add("is-dragging");

        try {
          freshener.setPointerCapture(pointerId);
        } catch {}
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
    }

    function makeHotspot(name, rect, onClick) {
      const btn = document.createElement("button");
      btn.className = `hotspot room3-hotspot room3-hotspot--${name}`;
      btn.setAttribute("aria-label", name);

      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (name === "return-left") {
          btn.disabled = true;
          btn.classList.remove("is-visible");
          window.setTimeout(onClick, 350);
          return;
        }

        onClick();
      });

      overlays.appendChild(btn);

      if (name === "return-left") {
        requestAnimationFrame(() => {
          btn.classList.add("is-visible");
        });
      }

      return { el: btn, rect };
    }

    function buildSceneHotspots() {
      runCleanup();
      clearOverlays();

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
            showMonologue("it is locked");
          })
        );

        items.push(
          makeHotspot("paper", RECTS.zoomDoor.paper, () => {
            openPaperPopup();
          })
        );

        items.push(
          makeHotspot("return-left", RECTS.zoomDoor.returnLeft, () => {
            scene = "dirtyRoomAfterGuideline";
            render();
          })
        );
      }

      if (scene === "dirtyRoomAfterGuideline") {
        items.push(
          makeHotspot("phone", RECTS.dirtyRoomAfterGuideline.phone, () => {
            openPhonePopup();
          })
        );

        items.push(
          makeHotspot("back", RECTS.dirtyRoomAfterGuideline.backToZoomDoor, () => {
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
          makeHotspot("inspect2", RECTS.inspect1.toInspect2, () => {
            scene = "inspect2";
            render();
          })
        );
      }

      if (scene === "inspect2") {
        items.push(
          makeHotspot("next", RECTS.inspect2.next, () => {
            scene = "paper1";
            render();
          })
        );
      }

      if (scene === "paper1") {
        items.push(
          makeHotspot("paper", RECTS.paper1.paper, () => {
            openChecklistPopup("checklist-1.webp", () => {
              scene = "security2";
              render();
            });
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
        [1, 2, 3, 4, 5].forEach((num) => {
          items.push(
            makeHotspot(`paper-${num}`, RECTS.paper2[`paper${num}`], () => {
              openChecklistPopup(`checklist-${num}.webp`);
            })
          );
        });
      }

      if (scene === "roomCleaned" && !endShown) {
        endShown = true;

        localStorage.setItem("room3_done", "1");

        window.dispatchEvent(
          new CustomEvent("stage:end", {
            detail: {
              nextStage: "room4",
              menuStage: "intro",
              nextLabel: "Next",
              menuLabel: "Back to Menu",
            },
          })
        );
      }

      function layout() {
        const drawnRect = getDrawnImageRect(bg);

        items.forEach(({ el, rect }) => {
          const placed = placeRectOnImage(rect, drawnRect);

          el.style.left = `${placed.left}px`;
          el.style.top = `${placed.top}px`;
          el.style.width = `${placed.width}px`;
          el.style.height = `${placed.height}px`;
        });
      }

      layout();

      window.addEventListener("resize", layout);

      addCleanup(() => {
        window.removeEventListener("resize", layout);
      });
    }

    function render() {
      runCleanup();
      clearOverlays();
      clearDialog();

      const src = BG_MAP[scene];

      bg.onload = () => {
        buildSceneHotspots();

        if (scene === "dirtyRoomStart" && !shownIntro) {
          shownIntro = true;
          showMonologue("What's that smell?");
        }

        if (scene === "zoomDoor" && !zoomDoorDialogShown) {
          zoomDoorDialogShown = true;
          showMonologue("So stinky… I should leave the room");
        }

        if (scene === "security1" && !security1DialogShown) {
          security1DialogShown = true;
          showMonologue("Hey man, come on in.");
        }

        if (scene === "paper2") {
          enableFreshenerDrag();

          if (!paper2DialogShown) {
            paper2DialogShown = true;
            showMonologue("How many more inspections do I need… Wait, there’s an air freshener here");
          }
        }
      };

      bg.onerror = () => {
        console.error("Failed to load image:", src);
        showMonologue(`Failed to load image: ${src}`);
      };

      bg.src = src;

      // Handles cached images where onload may not fire normally
      if (bg.complete && bg.naturalWidth > 0) {
        bg.onload();
      }
    }

    startBgm();
    render();
  },

  exit({ root }) {
    if (room3Bgm) {
      room3Bgm.pause();
      room3Bgm.currentTime = 0;
    }

    root.innerHTML = "";
  },
};
