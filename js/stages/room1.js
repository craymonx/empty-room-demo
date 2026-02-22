// /js/stages/room1.js
export default {
  enter({ root, go }) {
    root.innerHTML = `
      <section class="scene" id="scene-room1">
        <div class="scene-inner">
          <!-- Background -->
          <img
            id="bg"
            src="./assets/bg/kitchen-light-on.png"
            class="bg"
            alt="Kitchen scene"
            draggable="false"
          />

          <!-- STEP 1 hotspot: Stove -->
          <button
            id="kitchenStove"
            class="hotspot kitchen-stove"
            aria-label="Zoom into the stove"
          ></button>

          <!-- STEP 2/3 overlays container -->
          <div id="overlays" class="overlays" aria-hidden="false"></div>

          <div class="hud">
            <button id="backBtn" class="hud-btn">Back</button>
            <button id="debugBtn" class="hud-btn">Hotspots</button>
          </div>
        </div>
      </section>
    `;

    const sceneEl = root.querySelector("#scene-room1");
    const bg = root.querySelector("#bg");
    const overlays = root.querySelector("#overlays");
    const stoveBtn = root.querySelector("#kitchenStove");

    let scene = "kitchen"; // "kitchen" -> "stove" -> "cooked"
    let cleanupDrag = null;

    // ---- Helpers ------------------------------------------------------------

    function wait(ms) {
      return new Promise((r) => setTimeout(r, ms));
    }

    async function transitionBg(nextSrc) {
      // You can style .is-fading in CSS (opacity transition)
      bg.classList.add("is-fading");
      await wait(180); // keep small; match your CSS transition duration
      bg.src = nextSrc;
      await wait(50);
      bg.classList.remove("is-fading");
    }

    function createStoveSceneOverlays() {
      // Draggable noodles overlay (STEP 2/3)
      const noodles = document.createElement("img");
      noodles.id = "noodles";
      noodles.src = "./assets/props/noodles.png";
      noodles.alt = "Noodles";
      noodles.className = "noodles-overlay draggable";
      noodles.draggable = false;

      // Invisible drop zone where the pot is (YOU position via CSS)
      const potZone = document.createElement("div");
      potZone.id = "potDropzone";
      potZone.className = "pot-dropzone";
      potZone.setAttribute("aria-label", "Pot drop zone");

      overlays.appendChild(potZone);
      overlays.appendChild(noodles);

      // Hook drag behavior
      cleanupDrag = makeDraggable({
        el: noodles,
        dropzone: potZone,
        onDrop: async () => {
          if (scene !== "stove") return;

          scene = "cooked";

          // lock UI / prevent extra dragging
          noodles.style.pointerEvents = "none";
          noodles.classList.remove("draggable");

          // Optional: hide overlays before switching
          overlays.classList.add("is-fading");
          await wait(150);

          // Transition to cooked state
          await transitionBg("./assets/bg/cooked-noodles.png");

          // Clear overlays (or keep them if you want)
          overlays.innerHTML = "";
          overlays.classList.remove("is-fading");
        },
      });
    }

    function clearOverlays() {
      if (cleanupDrag) {
        cleanupDrag();
        cleanupDrag = null;
      }
      overlays.innerHTML = "";
    }

    function rectCenter(r) {
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }

    function isDroppedOnZone(draggableEl, zoneEl) {
      // Simple & reliable: check if noodle center is inside dropzone rect
      const dRect = draggableEl.getBoundingClientRect();
      const zRect = zoneEl.getBoundingClientRect();
      const c = rectCenter(dRect);

      return (
        c.x >= zRect.left &&
        c.x <= zRect.right &&
        c.y >= zRect.top &&
        c.y <= zRect.bottom
      );
    }

    function makeDraggable({ el, dropzone, onDrop }) {
      let dragging = false;
      let startX = 0;
      let startY = 0;
      let currentX = 0;
      let currentY = 0;

      // NOTE: You can also switch to "left/top absolute" positioning if you prefer.
      // This uses transform so your CSS can place the initial position.
      function onPointerDown(e) {
        if (scene !== "stove") return;
        dragging = true;
        el.setPointerCapture?.(e.pointerId);
        startX = e.clientX;
        startY = e.clientY;
        el.classList.add("is-dragging");
      }

      function onPointerMove(e) {
        if (!dragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        currentX += dx;
        currentY += dy;

        startX = e.clientX;
        startY = e.clientY;

        el.style.transform = `translate(${currentX}px, ${currentY}px)`;
      }

      async function onPointerUp(e) {
        if (!dragging) return;
        dragging = false;
        el.classList.remove("is-dragging");

        if (isDroppedOnZone(el, dropzone)) {
          await onDrop();
        }
      }

      el.addEventListener("pointerdown", onPointerDown);
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);

      // return cleanup
      return () => {
        el.removeEventListener("pointerdown", onPointerDown);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
      };
    }

    // ---- Step 2 trigger: click stove ---------------------------------------

    stoveBtn.addEventListener("click", async () => {
      if (scene !== "kitchen") return;

      scene = "stove";

      // Move to stove view
      await transitionBg("./assets/bg/pot-with-noodle-on-stove.png");

      // Hide stove hotspot (since we're “zoomed in” now)
      stoveBtn.style.display = "none";

      // Add noodles overlay + pot dropzone
      clearOverlays();
      createStoveSceneOverlays();
    });

    // ---- HUD ---------------------------------------------------------------

    root.querySelector("#backBtn").addEventListener("click", () => go("intro"));
    root.querySelector("#debugBtn").addEventListener("click", () => {
      sceneEl.classList.toggle("debug-hotspots");
    });
  },

  exit({ root }) {
    root.innerHTML = "";
  },
};