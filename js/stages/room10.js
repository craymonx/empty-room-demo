// /js/stages/room10.js
export default {
    enter({ root, go }) {
      root.innerHTML = `
        <section class="scene" id="scene-room10">
          <div class="scene-inner" id="room10Wrap">
            <img
              id="bg"
              src="./assets/bg/room10/fns01.webp"
              class="bg room10-bg"
              alt="Foreign Night Sea"
              draggable="false"
            />
  
          </div>
        </section>
      `;
  
      const bg = root.querySelector("#bg");
  
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
      let timer = null;
  
      function showSlide(i) {
        bg.src = `./assets/bg/room10/${slides[i]}`;
      }
  
      function finishRoom() {
        localStorage.setItem("room10_done", "1");
      
        window.dispatchEvent(
          new CustomEvent("stage:end", {
            detail: {
              nextStage: "room11",
              menuStage: "intro",
              nextLabel: "Next",
              menuLabel: "Back to Menu",
            },
          })
        );
      }
  
      function startSlideshow() {
        timer = window.setInterval(() => {
          index += 1;
  
          if (index >= slides.length) {
            window.clearInterval(timer);
            timer = null;
  
            setTimeout(() => {
              finishRoom();
            }, 1000);
  
            return;
          }
  
          showSlide(index);
        }, 2000);
      }
  
  
      // Start after first image is loaded
      if (bg.complete) {
        startSlideshow();
      } else {
        bg.addEventListener("load", startSlideshow, { once: true });
      }
  
      this.cleanup = () => {
        if (timer) {
          window.clearInterval(timer);
        }
      };
    },
  
    exit() {
      if (this.cleanup) {
        this.cleanup();
      }
    },
  };