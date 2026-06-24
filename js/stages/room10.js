// /js/stages/room10.js
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
        </div>
      </section>
    `;

    const bg = root.querySelector("#room10Bg");
    const advanceBtn = root.querySelector("#room10Advance");
    const bgm = createRoomBgm(
      "./assets/audio/room10/10 foreign night sea bgm_1.wav",
    );

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

    slides.slice(1).forEach((slide) => {
      const image = new Image();
      image.src = `./assets/bg/room10/${slide}`;
    });

    function finishRoom() {
      if (finished) return;
      finished = true;
      advanceBtn.disabled = true;
      advanceBtn.classList.add("hidden");

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
    }

    advanceBtn.addEventListener("click", advanceScene);
    bgm.start();

    this.cleanup = () => {
      bgm.stop();
      advanceBtn.removeEventListener("click", advanceScene);
    };
  },

  exit() {
    if (this.cleanup) {
      this.cleanup();
    }
  },
};
