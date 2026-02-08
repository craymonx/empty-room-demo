// /js/stages/room1.js
export default {
    enter({ root, go }) {
      root.innerHTML = `
        <section class="scene" id="scene-room1">
          <div class="scene-inner">
            <img
              id="bg"
              src="./assets/bg/kitchen-with-pot.png"
              class="bg"
              alt="Kitchen scene"
            >
  
            <button
              id="potHotspot"
              class="hotspot r01-pot"
              aria-label="Pot"
            ></button>
  
            <div class="hud">
              <button id="backBtn" class="hud-btn">Back</button>
              <button id="debugBtn" class="hud-btn">Hotspots</button>
            </div>
          </div>
        </section>
      `;
  
      const sceneEl = root.querySelector("#scene-room1");
      const bg = root.querySelector("#bg");
      const potHotspot = root.querySelector("#potHotspot");
  
      let scene = "kitchen";
  
      potHotspot.addEventListener("click", () => {
        if (scene === "kitchen") {
          bg.src = "./assets/bg/stove-with-pot.png";
          potHotspot.style.display = "none";
          scene = "stove";
        }
      });
  
      root.querySelector("#backBtn").addEventListener("click", () => go("intro"));
      root.querySelector("#debugBtn").addEventListener("click", () => {
        sceneEl.classList.toggle("debug-hotspots");
      });
    },
  
    exit({ root }) {
      root.innerHTML = "";
    },
  };