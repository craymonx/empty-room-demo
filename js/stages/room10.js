// /js/stages/room10.js
export default {
    enter({ root, go }) {
      root.innerHTML = `
        <section class="scene" id="scene-room10">
          <div class="scene-inner" id="room10Wrap">
            <img
              id="bg"
              src="./assets/bg/room10/FNS1.png"
              class="bg room10-bg"
              alt="Foreign Night Sea"
              draggable="false"
            />
  
            <div class="hud">
              <button id="backBtn" class="hud-btn">Back</button>
            </div>
          </div>
        </section>
      `;
  
      const bg = root.querySelector("#bg");
      const backBtn = root.querySelector("#backBtn");
  
      const slides = [
        "fns1.png",
        "fns2.png",
        "fns3.png",
        "fns4.png",
        "fns5.png",
        "fns6.png",
        "fns7.png",
        "fns8.png",
        "fns9.png",
        "fns10.png",
        "fns11.png",
      ];
  
      let index = 0;
      let timer = null;
  
      function showSlide(i) {
        bg.src = `./assets/bg/room10/${slides[i]}`;
      }
  
      function finishRoom() {
        localStorage.setItem("room10_done", "1");
        go("intro");
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
  
      backBtn.addEventListener("click", () => {
        go("intro");
      });
  
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