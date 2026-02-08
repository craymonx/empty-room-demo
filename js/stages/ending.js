// /js/stages/ending.js
export default {
    enter({ root, go }) {
      root.innerHTML = `
        <section class="scene" id="scene-ending">
          <div class="scene-inner" style="display:flex; align-items:center; justify-content:center;">
            <section style="
              padding:24px;
              max-width:760px;
              width: calc(100% - 32px);
              background: rgba(0,0,0,.45);
              border: 1px solid rgba(255,255,255,.10);
              border-radius: 16px;
              backdrop-filter: blur(6px);
            ">
              <h2 style="margin:0 0 12px;">End</h2>
              <button id="restart-btn" class="hud-btn">Restart</button>
            </section>
          </div>
        </section>
      `;
  
      root.querySelector("#restart-btn").addEventListener("click", () => go("intro"));
    },
  
    exit({ root }) {
      root.innerHTML = "";
    },
  };