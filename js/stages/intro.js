// /js/stages/intro.js
export default {
    enter({ root, go }) {
      const hash = (location.hash || "").replace("#", "").trim();
      const canContinue = /^room\d+$/i.test(hash);
  
      root.innerHTML = `
  <section class="scene" id="scene-intro">
    <div class="scene-inner">
      <img class="bg" src="./assets/bg/kitchen-intro.png" alt="Intro">

      <div class="intro-card">
        <h1>Empty Room</h1>
        <p>Find clues. Unlock rooms. Follow the sound.</p>

        <div class="intro-actions">
          <button id="startBtn" class="hud-btn">Start</button>
          ${canContinue ? `<button id="continueBtn" class="hud-btn">Continue</button>` : ``}
        </div>
      </div>
    </div>
  </section>
`;
  
      root.querySelector("#startBtn").addEventListener("click", () => {
        go("room1");
      });
  
      if (canContinue) {
        root.querySelector("#continueBtn").addEventListener("click", () => {
          go(hash);
        });
      }
    },
  
    exit({ root }) {
      root.innerHTML = "";
    },
  };