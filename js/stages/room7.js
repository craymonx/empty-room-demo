import { createRoomBgm } from "../room-bgm.js";

export default {
  enter({ root, go }) {
    root.innerHTML = `
      <section class="scene" id="scene-room7">
        <div class="scene-inner" id="room7Wrap">
          <img
            id="bg"
            src="./assets/bg/room7/main.webp"
            class="bg"
            alt="Room 7 scene"
            draggable="false"
          />

          <div id="leftGradient" class="room7-left-gradient" hidden>
            <div class="room7-left-arrow"></div>
          </div>

          <div id="overlays" class="overlays" aria-hidden="false"></div>

        </div>
      </section>
    `;

    const wrap = root.querySelector("#room7Wrap");
    const bg = root.querySelector("#bg");
    const bgm = createRoomBgm(
      "./assets/audio/room7/7 empty room bgm_1.wav",
    );
    const overlays = root.querySelector("#overlays");
    const leftGradient = root.querySelector("#leftGradient");

    const BASE_W = 1920;
    const BASE_H = 1080;

    let scene = "main";
    let debug = false;
    let emptyRoomClickCount = 0;
    let endButtonTimer = null;

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

    function addImageOverlay(
      src,
      rect,
      className = "room7-prop",
      draggable = false,
    ) {
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

    function clearEndButtonTimer() {
      if (endButtonTimer) {
        clearTimeout(endButtonTimer);
        endButtonTimer = null;
      }
    }

    function resetEmptyRoomState() {
      emptyRoomClickCount = 0;
      clearEndButtonTimer();
    }

    function handleEmptyRoomClick() {
      if (emptyRoomClickCount >= 2) {
        setScene("burningBushFlash");

        endButtonTimer = setTimeout(() => {
          localStorage.setItem("room7_done", "1");

          window.dispatchEvent(
            new CustomEvent("stage:end", {
              detail: {
                nextStage: "room8",
                menuStage: "intro",
                nextLabel: "Next",
                menuLabel: "Back to Menu",
              },
            }),
          );
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

      const wrapBox = wrap.getBoundingClientRect();
      const imgRect = getDrawnImageRect(bg);

      const scaleX = imgRect.width / BASE_W;
      const scaleY = imgRect.height / BASE_H;

      const zone = {
        left: wrapBox.left + imgRect.left + zoneRect.x * scaleX,
        top: wrapBox.top + imgRect.top + zoneRect.y * scaleY,
        right: wrapBox.left + imgRect.left + (zoneRect.x + zoneRect.w) * scaleX,
        bottom: wrapBox.top + imgRect.top + (zoneRect.y + zoneRect.h) * scaleY,
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
        clearEndButtonTimer();
      }

      if (scene === "main") bg.src = "./assets/bg/room7/main.webp";
      if (scene === "mainSteam") bg.src = "./assets/bg/room7/main-steam.webp";
      if (scene === "kitchenCounter")
        bg.src = "./assets/bg/room7/kitchen-counter.webp";
      if (scene === "angryDog") bg.src = "./assets/bg/room7/angry-dog.webp";
      if (scene === "dogVomit") bg.src = "./assets/bg/room7/dog-vomit.webp";
      if (scene === "coffee") bg.src = "./assets/bg/room7/coffee.webp";
      if (scene === "coffeeFinished")
        bg.src = "./assets/bg/room7/coffee-finished.webp";
      if (scene === "soundwave") bg.src = "./assets/bg/room7/soundwave.webp";
      if (scene === "radio") bg.src = "./assets/bg/room7/radio.webp";
      if (scene === "radioLimbs") bg.src = "./assets/bg/room7/radio-limbs.webp";

      if (scene === "emptyRoom") {
        bg.src = "./assets/bg/room7/empty-room.webp";
        resetEmptyRoomState();
      }

      if (scene === "burningBushFlash") {
        bg.src = "./assets/bg/room7/burning-bush-flash-ending.gif";
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
          "Go to steam scene",
        );
      }

      if (scene === "mainSteam") {
        addHotspot(
          RECTS.mainSteam.counterZone,
          () => setScene("kitchenCounter"),
          "Go to kitchen counter",
        );
      }

      if (scene === "kitchenCounter") {
        addImageOverlay(
          "./assets/props/room7/cup-empty.webp",
          RECTS.kitchenCounter.cupEmpty,
          "room7-cup-empty",
          true,
        );

        addHotspot(RECTS.kitchenCounter.dogZone, () => {}, "Dog zone");
      }

      if (scene === "dogVomit") {
        addHotspot(
          RECTS.dogVomit.coffeeZone,
          () => setScene("coffee"),
          "Go to coffee",
        );
      }

      if (scene === "coffee") {
        addHotspot(
          RECTS.coffee.finishZone,
          () => setScene("coffeeFinished"),
          "Finish coffee",
        );
      }

      if (scene === "coffeeFinished") {
        addHotspot(
          RECTS.coffeeFinished.leftZone,
          () => setScene("soundwave"),
          "Go to soundwave",
        );
      }

      if (scene === "soundwave") {
        addHotspot(
          RECTS.soundwave.radioZone,
          () => setScene("radio"),
          "Go to radio",
        );
      }

      if (scene === "radio") {
        addHotspot(
          RECTS.radio.limbsZone,
          () => setScene("radioLimbs"),
          "Show radio limbs",
        );
      }

      if (scene === "radioLimbs") {
        addHotspot(
          RECTS.radioLimbs.leftZone,
          () => setScene("emptyRoom"),
          "Go to empty room",
        );
      }

      if (scene === "emptyRoom") {
        addHotspot(
          RECTS.emptyRoom.fullScreen,
          handleEmptyRoomClick,
          "Empty room interaction",
        );

        if (emptyRoomClickCount >= 1) {
          addImageOverlay(
            "./assets/props/room7/boxes.gif",
            RECTS.emptyRoom.boxesGif,
            "room7-boxes-gif",
          );
        }

        if (emptyRoomClickCount >= 2) {
          addImageOverlay(
            "./assets/props/room7/painting.gif",
            RECTS.emptyRoom.paintingGif,
            "room7-painting-gif",
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

    wrap.addEventListener("mousemove", handleLeftGradient);

    wrap.addEventListener("mouseleave", () => {
      leftGradient.classList.remove("is-visible");
      leftGradient.hidden = !hasLeftSideAction();
    });

    window.addEventListener("resize", layout);

    if (bg.complete) layout();
    else bg.addEventListener("load", layout);

    bgm.start();

    this.cleanup = () => {
      bgm.stop();
      window.removeEventListener("resize", layout);
      wrap.removeEventListener("mousemove", handleLeftGradient);

      if (endButtonTimer) {
        clearTimeout(endButtonTimer);
        endButtonTimer = null;
      }
    };
  },

  exit({ root }) {
    if (this.cleanup) this.cleanup();
    root.innerHTML = "";
  },
};
