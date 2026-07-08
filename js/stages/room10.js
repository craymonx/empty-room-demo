// /js/stages/room10.js
import { closePhotoPopup, showPhotoPopup } from "../photo-popup.js";
import { createRoomBgm } from "../room-bgm.js";
import { showChapterEndDialog } from "../chapter-end-dialog.js";
import { showEasterEggAudioPlayer } from "../easter-egg-audio-player.js?v=20260703-2";

export default {
  enter({ root }) {
    root.innerHTML = `
      <section class="scene" id="scene-room10">
        <div class="scene-inner" id="room10Wrap">
          <img
            id="room10Bg"
            src="./assets/bg/room10/fns01.webp"
            class="bg room10-bg"
            alt="Foreign Night Sea"
            draggable="false"
          />

          <button
            id="room10Advance"
            class="room10-advance"
            type="button"
            aria-label="Advance to the next scene"
          ></button>

          <div id="room10Overlays" class="room10-overlays"></div>
        </div>
      </section>
    `;

    const BASE_W = 1600;
    const BASE_H = 922;

    const bg = root.querySelector("#room10Bg");
    const advanceBtn = root.querySelector("#room10Advance");
    const overlays = root.querySelector("#room10Overlays");
    const bgm = createRoomBgm(
      "./assets/audio/room10/10 foreign night sea bgm_1.wav",
    );

    const RECTS = {
      radio: { x: 160, y: 385, w: 130, h: 100 },
      finalTable: { x: 230, y: 505, w: 500, h: 190 },
    };

    const slides = [
      "fns01.webp",
      "fns02.webp",
      "fns03.webp",
      "fns04.webp",
      "fns05.webp",
      "fns06.webp",
      "fns07.webp",
      "fns08.webp",
      "fns09.webp",
      "fns010.webp",
      "fns011.webp",
    ];

    let index = 0;
    let finished = false;
    let eggPlayer = null;

    slides.slice(1).forEach((slide) => {
      const image = new Image();
      image.src = `./assets/bg/room10/${slide}`;
    });

    function getDrawnImageRect() {
      const wrapRect = bg.parentElement.getBoundingClientRect();
      const imgRatio = BASE_W / BASE_H;
      const wrapRatio = wrapRect.width / wrapRect.height;

      let w;
      let h;
      let x;
      let y;

      if (wrapRatio > imgRatio) {
        h = wrapRect.height;
        w = h * imgRatio;
        x = (wrapRect.width - w) / 2;
        y = 0;
      } else {
        w = wrapRect.width;
        h = w / imgRatio;
        x = 0;
        y = (wrapRect.height - h) / 2;
      }

      return { x, y, w, h };
    }

    function placeRectOnImage(el, rect) {
      const drawn = getDrawnImageRect();
      const sx = drawn.w / BASE_W;
      const sy = drawn.h / BASE_H;

      el.style.left = `${drawn.x + rect.x * sx}px`;
      el.style.top = `${drawn.y + rect.y * sy}px`;
      el.style.width = `${rect.w * sx}px`;
      el.style.height = `${rect.h * sy}px`;
    }

    function stopEggAudio() {
      eggPlayer?.close();
    }

    function closeEggPlayer() {
      stopEggAudio();
    }

    function showEggPlayer() {
      closeEggPlayer();
      advanceBtn.disabled = true;
      bgm.stop();

      eggPlayer = showEasterEggAudioPlayer({
        container: overlays,
        id: "room10EggPlayer",
        src: "./assets/audio/room10/egg10.m4a",
        title: "Impression",
        date: "25 Feb 2021",
        onClose: () => {
          eggPlayer = null;

          if (!finished) {
            advanceBtn.disabled = false;
            bgm.start();
          }
        },
      });
    }

    function closePhotoEgg() {
      closePhotoPopup(overlays, "room10PhotoEgg");
    }

    function showPhotoEgg() {
      showPhotoPopup({
        container: overlays,
        id: "room10PhotoEgg",
        title: "Table memory",
        images: ["./assets/props/room10/egg10.2.webp?v=20260625-1"],
      });
    }

    function renderFinalTableHotspot() {
      overlays.querySelector("#room10FinalTableHotspot")?.remove();

      if (index !== slides.length - 1 || finished) return;

      const hotspot = document.createElement("button");
      hotspot.id = "room10FinalTableHotspot";
      hotspot.type = "button";
      hotspot.className = "room10-hotspot room10-final-table-hotspot";
      hotspot.setAttribute("aria-label", "Open table memory");
      hotspot.addEventListener("click", showPhotoEgg);

      overlays.appendChild(hotspot);
      placeRectOnImage(hotspot, RECTS.finalTable);
    }

    function renderSceneHotspots() {
      renderRadioHotspot();
      renderFinalTableHotspot();
    }

    function renderRadioHotspot() {
      overlays.querySelector("#room10RadioHotspot")?.remove();

      if (index > 2 || finished) return;

      const hotspot = document.createElement("button");
      hotspot.id = "room10RadioHotspot";
      hotspot.type = "button";
      hotspot.className = "room10-hotspot";
      hotspot.setAttribute("aria-label", "Play radio demo");
      hotspot.addEventListener("click", showEggPlayer);

      overlays.appendChild(hotspot);
      placeRectOnImage(hotspot, RECTS.radio);
    }

    function finishRoom() {
      if (finished) return;
      finished = true;
      advanceBtn.disabled = true;
      advanceBtn.classList.add("hidden");
      closeEggPlayer();
      closePhotoEgg();
      overlays.innerHTML = "";

      localStorage.setItem("room10_done", "1");

      showChapterEndDialog({
        container: overlays,
        text: "Goodnight, what a journey.",
        onContinue: () => {
          window.dispatchEvent(
            new CustomEvent("stage:end", {
              detail: {
                nextStage: "room11",
                menuStage: "intro",
                nextLabel: "Next",
                menuLabel: "Back to Menu",
              },
            }),
          );
        },
      });
    }

    function advanceScene() {
      if (finished) return;

      if (index >= slides.length - 1) {
        finishRoom();
        return;
      }

      index += 1;
      bg.src = `./assets/bg/room10/${slides[index]}`;
      renderSceneHotspots();
    }

    advanceBtn.addEventListener("click", advanceScene);
    window.addEventListener("resize", renderSceneHotspots);
    bg.addEventListener("load", renderSceneHotspots);
    renderSceneHotspots();
    bgm.start();

    this.cleanup = () => {
      closeEggPlayer();
      closePhotoEgg();
      bgm.stop();
      advanceBtn.removeEventListener("click", advanceScene);
      window.removeEventListener("resize", renderSceneHotspots);
      bg.removeEventListener("load", renderSceneHotspots);
    };
  },

  exit() {
    if (this.cleanup) {
      this.cleanup();
    }
  },
};
