export default {
  enter({ root, go }) {
    root.innerHTML = `
      <section class="scene" id="scene-room7">
        <style>
          .room7-left-gradient {
            position: absolute;
            left: 0;
            top: 0;
            width: 34%;
            height: 100%;
            background: linear-gradient(
              90deg,
              rgba(0, 0, 0, 0.72),
              rgba(0, 0, 0, 0.42),
              rgba(0, 0, 0, 0)
            );
            opacity: 0;
            transform: translateX(-55%);
            transition: opacity 0.35s ease, transform 0.35s ease;
            pointer-events: none;
            z-index: 6;
          }

          .room7-left-gradient.is-visible {
            opacity: 1;
            transform: translateX(0);
          }

          .room7-left-arrow {
            position: absolute;
            left: 72px;
            top: 50%;
            width: 54px;
            height: 54px;
            transform: translateY(-50%);
            border: 1px solid rgba(255, 255, 255, 0.5);
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(5px);
          }

          .room7-left-arrow::before {
            content: "";
            position: absolute;
            left: 21px;
            top: 17px;
            width: 15px;
            height: 15px;
            border-left: 3px solid rgba(255, 255, 255, 0.9);
            border-bottom: 3px solid rgba(255, 255, 255, 0.9);
            transform: rotate(45deg);
          }

          .room7-left-gradient.is-visible .room7-left-arrow {
            animation: room7LeftArrowPulse 1.35s ease-in-out infinite;
          }

          @keyframes room7LeftArrowPulse {
            0%, 100% {
              transform: translateY(-50%) translateX(0);
              opacity: 0.65;
            }

            50% {
              transform: translateY(-50%) translateX(-8px);
              opacity: 1;
            }
          }

          .room7-next-btn {
            position: absolute;
            top: 24px;
            right: 24px;
            z-index: 30;
          }
        </style>

        <div class="scene-inner" id="room7Wrap">
          <img
            id="bg"
            src="./assets/bg/room7/main.png"
            class="bg"
            alt="Room 7 scene"
            draggable="false"
          />

          <div id="leftGradient" class="room7-left-gradient" hidden>
            <div class="room7-left-arrow"></div>
          </div>

          <div id="overlays" class="overlays" aria-hidden="false"></div>

          <div class="hud">
            <button id="backBtn" class="hud-btn">Back</button>
            <button id="debugBtn" class="hud-btn">Hotspots</button>
          </div>
        </div>
      </section>
    `;

    const wrap = root.querySelector("#room7Wrap");
    const bg = root.querySelector("#bg");
    const overlays = root.querySelector("#overlays");
    const leftGradient = root.querySelector("#leftGradient");
    const backBtn = root.querySelector("#backBtn");
    const debugBtn = root.querySelector("#debugBtn");

    const BASE_W = 1920;
    const BASE_H = 1080;

    let scene = "main";
    let debug = false;
    let emptyRoomClickCount = 0;
    let nextBtnTimer = null;

    const RECTS = {
      main: {
        steamZone: { x: 1220, y: 350, w: 200, h: 200 },
      },

      mainSteam: {
        counterZone: { x: 1220, y: 350, w: 200, h: 200 },
      },

      kitchenCounter: {
        dogZone: { x: 300, y: 500, w: 300, h: 300 },
        cupEmpty: { x: 900, y: 550, w: 200, h: 240 },
      },

      dogVomit: {
        coffeeZone: { x: 700, y: 300, w: 600, h: 500 },
      },

      coffee: {
        finishZone: { x: 700, y: 300, w: 600, h: 500 },
      },

      coffeeFinished: {
        leftZone: { x: 0, y: 0, w: 520, h: 1080 },
      },

      soundwave: {
        radioZone: { x: 100, y: 450, w: 300, h: 150 },
      },

      radio: {
        limbsZone: { x: 780, y: 230, w: 500, h: 300 },
      },

      radioLimbs: {
        leftZone: { x: 0, y: 0, w: 520, h: 1080 },
      },

      emptyRoom: {
        fullScreen: { x: 0, y: 0, w: 1920, h: 1080 },
        boxesGif: { x: 0, y: 0, w: 1920, h: 1080 },
        paintingGif: { x: 0, y: 0, w: 1920, h: 1080 },
      },
    };

    function hasLeftSideAction() {
      return scene === "coffeeFinished" || scene === "radioLimbs";
    }

    function getDrawnImageRect(img) {
      const wrapRect = wrap.getBoundingClientRect();
      const imgRatio = img.naturalWidth / img.naturalHeight;
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
      const imgRect = getDrawnImageRect(bg);

      const scaleX = imgRect.width / BASE_W;
      const scaleY = imgRect.height / BASE_H;

      el.style.left = `${imgRect.left + rect.x * scaleX}px`;
      el.style.top = `${imgRect.top + rect.y * scaleY}px`;
      el.style.width = `${rect.w * scaleX}px`;
      el.style.height = `${rect.h * scaleY}px`;
    }

    function clearOverlays() {
      overlays.innerHTML = "";
    }

    function addHotspot(rect, onClick, label = "hotspot") {
      const btn = document.createElement("button");
      btn.className = "hotspot";
      btn.setAttribute("aria-label", label);

      if (debug) {
        btn.style.background = "rgba(255, 0, 0, 0.25)";
        btn.style.border = "2px dashed red";
      }

      btn.addEventListener("click", onClick);
      overlays.appendChild(btn);
      placeRectOnImage(btn, rect);

      return btn;
    }

    function addImageOverlay(src, rect, className = "room7-prop", draggable = false) {
      const img = document.createElement("img");
      img.src = src;
      img.className = className;
      img.draggable = false;
      img.style.position = "absolute";
      img.style.userSelect = "none";
      img.style.touchAction = "none";
      img.style.cursor = draggable ? "grab" : "default";
      img.style.pointerEvents = draggable ? "auto" : "none";
      img.style.zIndex = "10";

      overlays.appendChild(img);
      placeRectOnImage(img, rect);

      if (draggable) makeDraggable(img);

      return img;
    }

    function addNextButton() {
      if (root.querySelector("#room7NextBtn")) return;

      const btn = document.createElement("button");
      btn.id = "room7NextBtn";
      btn.textContent = "Next";
      btn.className = "hud-btn room7-next-btn";

      btn.addEventListener("click", () => {
        localStorage.setItem("room7_done", "1");
        go("intro");
      });

      wrap.appendChild(btn);
    }

    function clearNextButtonAndTimer() {
      const oldBtn = root.querySelector("#room7NextBtn");
      if (oldBtn) oldBtn.remove();

      if (nextBtnTimer) {
        clearTimeout(nextBtnTimer);
        nextBtnTimer = null;
      }
    }

    function resetEmptyRoomState() {
      emptyRoomClickCount = 0;
      clearNextButtonAndTimer();
    }

    function handleEmptyRoomClick() {
      if (emptyRoomClickCount >= 2) {
        setScene("burningBushFlash");

        nextBtnTimer = setTimeout(() => {
          addNextButton();
        }, 5000);

        return;
      }

      emptyRoomClickCount += 1;
      layout();
    }

    function isDroppedOnZone(el, zoneRect) {
      const elBox = el.getBoundingClientRect();
      const centerX = elBox.left + elBox.width / 2;
      const centerY = elBox.top + elBox.height / 2;

      const imgRect = getDrawnImageRect(bg);
      const scaleX = imgRect.width / BASE_W;
      const scaleY = imgRect.height / BASE_H;

      const zone = {
        left: imgRect.left + zoneRect.x * scaleX,
        top: imgRect.top + zoneRect.y * scaleY,
        right: imgRect.left + (zoneRect.x + zoneRect.w) * scaleX,
        bottom: imgRect.top + (zoneRect.y + zoneRect.h) * scaleY,
      };

      return (
        centerX >= zone.left &&
        centerX <= zone.right &&
        centerY >= zone.top &&
        centerY <= zone.bottom
      );
    }

    function makeDraggable(el) {
      let dragging = false;
      let offsetX = 0;
      let offsetY = 0;

      el.addEventListener("pointerdown", (e) => {
        dragging = true;
        el.setPointerCapture(e.pointerId);

        const box = el.getBoundingClientRect();

        offsetX = e.clientX - box.left;
        offsetY = e.clientY - box.top;

        el.style.cursor = "grabbing";
        el.style.zIndex = "20";

        e.preventDefault();
      });

      el.addEventListener("pointermove", (e) => {
        if (!dragging) return;

        const wrapBox = wrap.getBoundingClientRect();

        el.style.left = `${e.clientX - wrapBox.left - offsetX}px`;
        el.style.top = `${e.clientY - wrapBox.top - offsetY}px`;
      });

      el.addEventListener("pointerup", () => {
        if (!dragging) return;

        dragging = false;
        el.style.cursor = "grab";

        if (
          scene === "kitchenCounter" &&
          isDroppedOnZone(el, RECTS.kitchenCounter.dogZone)
        ) {
          setScene("dogVomit");
        }
      });
    }

    function setScene(nextScene) {
      const previousScene = scene;
      scene = nextScene;

      leftGradient.classList.remove("is-visible");
      leftGradient.hidden = !hasLeftSideAction();

      if (
        previousScene === "emptyRoom" &&
        scene !== "emptyRoom" &&
        scene !== "burningBushFlash"
      ) {
        resetEmptyRoomState();
      }

      if (scene !== "burningBushFlash") {
        clearNextButtonAndTimer();
      }

      if (scene === "main") bg.src = "./assets/bg/room7/main.png";
      if (scene === "mainSteam") bg.src = "./assets/bg/room7/main-steam.png";
      if (scene === "kitchenCounter") bg.src = "./assets/bg/room7/kitchen-counter.png";
      if (scene === "angryDog") bg.src = "./assets/bg/room7/angry-dog.png";
      if (scene === "dogVomit") bg.src = "./assets/bg/room7/dog-vomit.png";
      if (scene === "coffee") bg.src = "./assets/bg/room7/coffee.png";
      if (scene === "coffeeFinished") bg.src = "./assets/bg/room7/coffee-finished.png";
      if (scene === "soundwave") bg.src = "./assets/bg/room7/soundwave.png";
      if (scene === "radio") bg.src = "./assets/bg/room7/radio.png";
      if (scene === "radioLimbs") bg.src = "./assets/bg/room7/radio-limbs.png";

      if (scene === "emptyRoom") {
        bg.src = "./assets/bg/room7/empty-room.png";
        resetEmptyRoomState();
      }

      if (scene === "burningBushFlash") {
        bg.src = "./assets/bg/room7/burning-bush-flash.gif";
      }

      bg.onload = layout;
      layout();
    }

    function layout() {
      clearOverlays();

      leftGradient.classList.remove("is-visible");
      leftGradient.hidden = !hasLeftSideAction();

      if (scene === "main") {
        addHotspot(
          RECTS.main.steamZone,
          () => setScene("mainSteam"),
          "Go to steam scene"
        );
      }

      if (scene === "mainSteam") {
        addHotspot(
          RECTS.mainSteam.counterZone,
          () => setScene("kitchenCounter"),
          "Go to kitchen counter"
        );
      }

      if (scene === "kitchenCounter") {
        addImageOverlay(
          "./assets/props/room7/cup-empty.png",
          RECTS.kitchenCounter.cupEmpty,
          "room7-cup-empty",
          true
        );

        addHotspot(
          RECTS.kitchenCounter.dogZone,
          () => {},
          "Dog zone"
        );
      }

      if (scene === "dogVomit") {
        addHotspot(
          RECTS.dogVomit.coffeeZone,
          () => setScene("coffee"),
          "Go to coffee"
        );
      }

      if (scene === "coffee") {
        addHotspot(
          RECTS.coffee.finishZone,
          () => setScene("coffeeFinished"),
          "Finish coffee"
        );
      }

      if (scene === "coffeeFinished") {
        addHotspot(
          RECTS.coffeeFinished.leftZone,
          () => setScene("soundwave"),
          "Go to soundwave"
        );
      }

      if (scene === "soundwave") {
        addHotspot(
          RECTS.soundwave.radioZone,
          () => setScene("radio"),
          "Go to radio"
        );
      }

      if (scene === "radio") {
        addHotspot(
          RECTS.radio.limbsZone,
          () => setScene("radioLimbs"),
          "Show radio limbs"
        );
      }

      if (scene === "radioLimbs") {
        addHotspot(
          RECTS.radioLimbs.leftZone,
          () => setScene("emptyRoom"),
          "Go to empty room"
        );
      }

      if (scene === "emptyRoom") {
        addHotspot(
          RECTS.emptyRoom.fullScreen,
          handleEmptyRoomClick,
          "Empty room interaction"
        );

        if (emptyRoomClickCount >= 1) {
          addImageOverlay(
            "./assets/props/room7/boxes.gif",
            RECTS.emptyRoom.boxesGif,
            "room7-boxes-gif"
          );
        }

        if (emptyRoomClickCount >= 2) {
          addImageOverlay(
            "./assets/props/room7/painting.gif",
            RECTS.emptyRoom.paintingGif,
            "room7-painting-gif"
          );
        }
      }

      if (scene === "burningBushFlash") {
        // Next button appears 5 seconds after entering this scene.
      }
    }

    function handleLeftGradient(e) {
      if (!hasLeftSideAction()) {
        leftGradient.classList.remove("is-visible");
        leftGradient.hidden = true;
        return;
      }

      leftGradient.hidden = false;

      const wrapBox = wrap.getBoundingClientRect();
      const x = e.clientX - wrapBox.left;

      if (x <= wrapBox.width * 0.18) {
        leftGradient.classList.add("is-visible");
      } else {
        leftGradient.classList.remove("is-visible");
      }
    }

    backBtn.addEventListener("click", () => {
      go("intro");
    });

    debugBtn.addEventListener("click", () => {
      debug = !debug;
      layout();
    });

    wrap.addEventListener("mousemove", handleLeftGradient);

    wrap.addEventListener("mouseleave", () => {
      leftGradient.classList.remove("is-visible");
      leftGradient.hidden = !hasLeftSideAction();
    });

    window.addEventListener("resize", layout);

    if (bg.complete) layout();
    else bg.addEventListener("load", layout);

    this.cleanup = () => {
      window.removeEventListener("resize", layout);
      wrap.removeEventListener("mousemove", handleLeftGradient);

      if (nextBtnTimer) {
        clearTimeout(nextBtnTimer);
        nextBtnTimer = null;
      }
    };
  },

  exit({ root }) {
    if (this.cleanup) this.cleanup();
    root.innerHTML = "";
  },
};