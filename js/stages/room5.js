// /js/stages/room5.js
export default {
    enter({ root, go }) {
      root.innerHTML = `
        <section class="scene" id="scene-room5">
          <div class="scene-inner" id="room5Wrap">
            <img
              id="bg"
              src="./assets/bg/room5/bedroom.gif"
              class="bg"
              alt="Room 5 scene"
              draggable="false"
            />
  
            <div id="overlays" class="overlays" aria-hidden="false"></div>
  
            <div class="hud">
              <button id="backBtn" class="hud-btn">Back</button>
              <button id="debugBtn" class="hud-btn">Hotspots</button>
            </div>
          </div>
        </section>
      `;
  
      const backBtn = root.querySelector("#backBtn");
      const debugBtn = root.querySelector("#debugBtn");
  
      // Back to intro (or previous room if you want later)
      backBtn.onclick = () => go("intro");
  
      // Toggle hotspot debug
      debugBtn.onclick = () => {
        root.classList.toggle("debug-hotspots");
      };
    },
  
    exit({ root }) {
      root.innerHTML = "";
    }
  };