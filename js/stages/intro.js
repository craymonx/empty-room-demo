// /js/stages/intro.js
export default {
    enter({ root, go }) {
      // Detect current hash (if you use startFromHash, this is still useful for a "Continue" UI)
      const hash = (location.hash || "").replace("#", "").trim();
      const canContinue = /^room\d+$/i.test(hash);
  
      root.innerHTML = `
        <div class="scene" id="scene-intro">
          <img class="bg" src="./assets/bg/kitchen-intro.png" alt="Intro">
  
          <div class="intro-card" style="
            position:relative;
            left: 16px; right: 16px;
            top: 70%;
            max-width: 540px;
            margin: 0 auto;
            padding: 16px;
            border-radius: 16px;
            background: rgba(0,0,0,.45);
            border: 1px solid rgba(255,255,255,.10);
            backdrop-filter: blur(6px);
          ">
            <h1 style="margin:0 0 8px;">Empty Room</h1>
            <p style="margin:0 0 14px; opacity:.9;">
              Find clues. Unlock rooms. Follow the sound.
            </p>
  
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
              <button id="startBtn" class="hud-btn">Start</button>
              ${canContinue ? `<button id="continueBtn" class="hud-btn">Continue</button>` : ``}
            </div>
          </div>
        </div>
      `;
  
      root.querySelector("#startBtn").addEventListener("click", () => {
        // Starting fresh always goes to room1
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