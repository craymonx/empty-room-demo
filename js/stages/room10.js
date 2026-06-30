// /js/stages/room10.js
import { closePhotoPopup, showPhotoPopup } from "../photo-popup.js";
import { createRoomBgm } from "../room-bgm.js";

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
    let eggAudio = null;

    slides.slice(1).forEach((slide) => {
      const image = new Image();
      image.src = `./assets/bg/room10/${slide}`;
    });

    function formatDuration(seconds) {
      if (!Number.isFinite(seconds) || seconds < 0) return "--:--";

      const total = Math.floor(seconds);
      const minutes = Math.floor(total / 60);
      const secs = String(total % 60).padStart(2, "0");
      return `${minutes}:${secs}`;
    }

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
      if (!eggAudio) return;

      eggAudio.pause();
      eggAudio.currentTime = 0;
      eggAudio = null;
    }

    function closeEggPlayer() {
      overlays.querySelector("#room10EggPlayer")?.remove();
      stopEggAudio();

      if (!finished) {
        advanceBtn.disabled = false;
        bgm.start();
      }
    }

    function showEggPlayer() {
      closeEggPlayer();
      advanceBtn.disabled = true;
      bgm.stop();

      eggAudio = new Audio("./assets/audio/room10/egg10.m4a");

      const popup = document.createElement("div");
      popup.id = "room10EggPlayer";
      popup.className = "room10-egg-player";
      popup.innerHTML = `
        <div class="room10-egg-player__backdrop"></div>
        <div class="room10-egg-player__deck" role="dialog" aria-modal="true" aria-label="Vintage song player">
          <button class="room10-egg-player__close" type="button" aria-label="Close player">×</button>

          <div class="room10-egg-player__record" aria-hidden="true">
            <div class="room10-egg-player__label">Impression</div>
          </div>

          <div class="room10-egg-player__info">
            <p class="room10-egg-player__eyebrow">Demo tape</p>
            <h2>Impression</h2>
            <dl>
              <div>
                <dt>Date</dt>
                <dd>25 Feb 2021</dd>
              </div>
              <div>
                <dt>Duration</dt>
                <dd id="room10EggDuration">--:--</dd>
              </div>
            </dl>

            <div class="room10-egg-player__progress">
              <div id="room10EggProgress" class="room10-egg-player__progress-bar"></div>
            </div>

            <div class="room10-egg-player__times">
              <span id="room10EggCurrentTime">0:00</span>
              <span id="room10EggTotalTime">--:--</span>
            </div>

            <button id="room10EggPlay" class="room10-egg-player__play" type="button">Play</button>
          </div>
        </div>
      `;

      overlays.appendChild(popup);

      const playBtn = popup.querySelector("#room10EggPlay");
      const durationEl = popup.querySelector("#room10EggDuration");
      const totalTimeEl = popup.querySelector("#room10EggTotalTime");
      const currentTimeEl = popup.querySelector("#room10EggCurrentTime");
      const progressEl = popup.querySelector("#room10EggProgress");

      function updatePlaybackUi() {
        if (!eggAudio) return;

        const duration = eggAudio.duration;
        const current = eggAudio.currentTime;

        currentTimeEl.textContent = formatDuration(current);
        playBtn.textContent = eggAudio.paused ? "Play" : "Pause";

        if (Number.isFinite(duration) && duration > 0) {
          progressEl.style.width = `${Math.min(100, (current / duration) * 100)}%`;
        } else {
          progressEl.style.width = "0%";
        }
      }

      eggAudio.addEventListener("loadedmetadata", () => {
        const durationText = formatDuration(eggAudio.duration);
        durationEl.textContent = durationText;
        totalTimeEl.textContent = durationText;
      });

      eggAudio.addEventListener("timeupdate", updatePlaybackUi);
      eggAudio.addEventListener("play", updatePlaybackUi);
      eggAudio.addEventListener("pause", updatePlaybackUi);
      eggAudio.addEventListener("ended", updatePlaybackUi);

      popup
        .querySelector(".room10-egg-player__close")
        .addEventListener("click", closeEggPlayer);

      popup
        .querySelector(".room10-egg-player__backdrop")
        .addEventListener("click", closeEggPlayer);

      playBtn.addEventListener("click", () => {
        if (!eggAudio) return;

        if (eggAudio.paused) {
          eggAudio.play().catch(() => {});
        } else {
          eggAudio.pause();
        }
      });

      eggAudio.play().catch(() => {});
      updatePlaybackUi();
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
