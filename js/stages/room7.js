export default {
    enter({ root, go }) {
      root.innerHTML = `
        <section class="scene" id="scene-room7">
          <div class="scene-inner" id="room7Wrap">
            <img
              id="bg"
              src="./assets/bg/room7/main.png"
              class="bg"
              alt="Room 7 scene"
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
  
      const wrap = root.querySelector("#room7Wrap");
      const bg = root.querySelector("#bg");
      const overlays = root.querySelector("#overlays");
      const backBtn = root.querySelector("#backBtn");
      const debugBtn = root.querySelector("#debugBtn");
  
      const BASE_W = 1920;
      const BASE_H = 1080;
  
      let scene = "main";
      let debug = false;
  
      const RECTS = {

        main: {
          steamZone: { x: 1220, y: 350, w: 200, h: 200 },
        },
      
        mainSteam: {
          counterZone: { x: 1220, y: 350, w: 200, h: 200 },
        },
      
        kitchenCounter: {
          dogZone: { x: 300, y: 500, w: 300, h: 300 },
          cupEmpty: { x: 900, y: 550, w: 200, h: 240 },
        },
        dogVomit: {
            coffeeZone: { x: 700, y: 300, w: 600, h: 500 },
          },
          coffee: {
            finishZone: { x: 700, y: 300, w: 600, h: 500 },
          },        
          coffeeFinished: {
            leftZone: { x: 0, y: 0, w: 520, h: 1080 },
          },
      };
  
      function getDrawnImageRect(img) {
        const wrapRect = wrap.getBoundingClientRect();
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const wrapRatio = wrapRect.width / wrapRect.height;
  
        let width, height, left, top;
  
        if (wrapRatio > imgRatio) {
          height = wrapRect.height;
          width = height * imgRatio;
          left = (wrapRect.width - width) / 2;
          top = 0;
        } else {
          width = wrapRect.width;
          height = width / imgRatio;
          left = 0;
          top = (wrapRect.height - height) / 2;
        }
  
        return { left, top, width, height };
      }
  
      function placeRectOnImage(el, rect) {
        const imgRect = getDrawnImageRect(bg);
  
        const scaleX = imgRect.width / BASE_W;
        const scaleY = imgRect.height / BASE_H;
  
        el.style.left = `${imgRect.left + rect.x * scaleX}px`;
        el.style.top = `${imgRect.top + rect.y * scaleY}px`;
        el.style.width = `${rect.w * scaleX}px`;
        el.style.height = `${rect.h * scaleY}px`;
      }
  
      function clearOverlays() {
        overlays.innerHTML = "";
      }
  
      function addHotspot(rect, onClick, label = "hotspot") {
        const btn = document.createElement("button");
        btn.className = "hotspot";
        btn.setAttribute("aria-label", label);
  
        if (debug) {
          btn.style.background = "rgba(255, 0, 0, 0.25)";
          btn.style.border = "2px dashed red";
        }
  
        btn.addEventListener("click", onClick);
        overlays.appendChild(btn);
        placeRectOnImage(btn, rect);
      }

      function addImageOverlay(src, rect, className = "room7-prop", draggable = false) {
        const img = document.createElement("img");
        img.src = src;
        img.className = className;
        img.draggable = false;
        img.style.position = "absolute";
        img.style.userSelect = "none";
        img.style.touchAction = "none";
        img.style.cursor = draggable ? "grab" : "default";
        img.style.pointerEvents = draggable ? "auto" : "none";
      
        overlays.appendChild(img);
        placeRectOnImage(img, rect);
      
        if (draggable) makeDraggable(img);
      
        return img;
      }

      function isDroppedOnZone(el, zoneRect) {
        const elBox = el.getBoundingClientRect();
        const centerX = elBox.left + elBox.width / 2;
        const centerY = elBox.top + elBox.height / 2;
      
        const imgRect = getDrawnImageRect(bg);
        const scaleX = imgRect.width / BASE_W;
        const scaleY = imgRect.height / BASE_H;
      
        const zone = {
          left: imgRect.left + zoneRect.x * scaleX,
          top: imgRect.top + zoneRect.y * scaleY,
          right: imgRect.left + (zoneRect.x + zoneRect.w) * scaleX,
          bottom: imgRect.top + (zoneRect.y + zoneRect.h) * scaleY,
        };
      
        return (
          centerX >= zone.left &&
          centerX <= zone.right &&
          centerY >= zone.top &&
          centerY <= zone.bottom
        );
      }
      
      function makeDraggable(el) {
        let dragging = false;
        let offsetX = 0;
        let offsetY = 0;
      
        el.addEventListener("pointerdown", (e) => {
          dragging = true;
          el.setPointerCapture(e.pointerId);
      
          const box = el.getBoundingClientRect();
          const wrapBox = wrap.getBoundingClientRect();
      
          offsetX = e.clientX - box.left;
          offsetY = e.clientY - box.top;
      
          el.style.cursor = "grabbing";
          el.style.zIndex = "20";
      
          e.preventDefault();
        });
      
        el.addEventListener("pointermove", (e) => {
          if (!dragging) return;
      
          const wrapBox = wrap.getBoundingClientRect();
      
          el.style.left = `${e.clientX - wrapBox.left - offsetX}px`;
          el.style.top = `${e.clientY - wrapBox.top - offsetY}px`;
        });
      
        el.addEventListener("pointerup", () => {
          if (!dragging) return;
          dragging = false;
          el.style.cursor = "grab";
      
          if (scene === "kitchenCounter" && isDroppedOnZone(el, RECTS.kitchenCounter.dogZone)) {
            setScene("dogVomit");
          }
        });
      }

      function setScene(nextScene) {
        scene = nextScene;
      
        if (scene === "main") {
          bg.src = "./assets/bg/room7/main.png";
        }
      
        if (scene === "mainSteam") {
          bg.src = "./assets/bg/room7/main-steam.png";
        }
      
        if (scene === "kitchenCounter") {
          bg.src = "./assets/bg/room7/kitchen-counter.png";
        }
      
        if (scene === "angryDog") {
          bg.src = "./assets/bg/room7/angry-dog.png";
        }

        if (scene === "dogVomit") {
            bg.src = "./assets/bg/room7/dog-vomit.png";
          }
          
        if (scene === "coffee") {
            bg.src = "./assets/bg/room7/coffee.png";
          }
          
        if (scene === "coffeeFinished") {
            bg.src = "./assets/bg/room7/coffee-finished.png";
          }
          
        if (scene === "soundwave") {
            bg.src = "./assets/bg/room7/soundwave.png";
          }
      
        bg.onload = layout;
        layout();
      }
  
      function layout() {
        clearOverlays();
      
        if (scene === "main") {
          addHotspot(
            RECTS.main.steamZone,
            () => setScene("mainSteam"),
            "Go to steam scene"
          );
        }
      
        if (scene === "mainSteam") {
          addHotspot(
            RECTS.mainSteam.counterZone,
            () => setScene("kitchenCounter"),
            "Go to kitchen counter"
          );
        }
      
        if (scene === "kitchenCounter") {
          addImageOverlay(
            "./assets/props/room7/cup-empty.png",
            RECTS.kitchenCounter.cupEmpty,
            "room7-cup-empty",
            true
          );
      
          addHotspot(
            RECTS.kitchenCounter.dogZone,
            () => {},
            "Dog zone"
          );
        }
      
        if (scene === "dogVomit") {
          addHotspot(
            RECTS.dogVomit.coffeeZone,
            () => setScene("coffee"),
            "Go to coffee"
          );
        }
      
        if (scene === "coffee") {
          addHotspot(
            RECTS.coffee.finishZone,
            () => setScene("coffeeFinished"),
            "Finish coffee"
          );
        }
      
        if (scene === "coffeeFinished") {
          addHotspot(
            RECTS.coffeeFinished.leftZone,
            () => setScene("soundwave"),
            "Go to soundwave"
          );
        }
      }
  
      backBtn.addEventListener("click", () => {
        go("intro");
      });
  
      debugBtn.addEventListener("click", () => {
        debug = !debug;
        layout();
      });
  
      window.addEventListener("resize", layout);
  
      if (bg.complete) layout();
      else bg.addEventListener("load", layout);
  
      this.cleanup = () => {
        window.removeEventListener("resize", layout);
      };
    },
  
    exit({ root }) {
      if (this.cleanup) this.cleanup();
      root.innerHTML = "";
    },
  };