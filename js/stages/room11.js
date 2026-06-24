// /js/stages/room11.js
import { createRoomBgm } from "../room-bgm.js";

export default {
  enter({ root, go }) {
    root.innerHTML = `
        <section class="scene" id="scene-room11">
          <div class="scene-inner" id="room11Wrap">
            <img
              id="bg"
              src="./assets/bg/room11/coca1.webp"
              class="bg"
              alt="Room 11 scene"
              draggable="false"
            />
  
            <div id="overlays" class="overlays" aria-hidden="false"></div>
            <div id="popupLayer" class="room11-popup-layer"></div>
  
          </div>
        </section>
      `;

    const BASE_W = 1920;
    const BASE_H = 1080;

    const RECTS = {
      coca1: {
        start: { x: 1020, y: 50, w: 750, h: 1000 },
        books: { x: 500, y: 530, w: 270, h: 180 },
        board: { x: 0, y: 265, w: 190, h: 320 },
      },
      coca2: {
        full: { x: 0, y: 0, w: 1920, h: 1080 },
      },
      alarm: {
        tv: { x: 120, y: 400, w: 200, h: 180 },
        phoneLeft: { x: 400, y: 520, w: 140, h: 140 },
        phoneMiddle: { x: 560, y: 500, w: 150, h: 140 },
        phoneRight: { x: 730, y: 500, w: 150, h: 150 },
      },
      tv1: {
        screen: { x: 1750, y: 1000, w: 100, h: 100 },
      },
      tv3: {
        backLeft: { x: 0, y: 0, w: 300, h: 1080 },
      },
      coca4Knock: {
        full: { x: 0, y: 0, w: 1920, h: 1080 },
      },
      afterKnockDialog: {
        door: { x: 1800, y: 180, w: 200, h: 560 },
      },
      door1: {
        lock: { x: 400, y: 200, w: 250, h: 320 },
      },
      coca5: {
        plantLeft: { x: 70, y: 350, w: 260, h: 300 },
        plantMiddle: { x: 880, y: 210, w: 270, h: 480 },
        plantRight: { x: 1480, y: 360, w: 260, h: 300 },
      },
      coca7: {
        full: { x: 0, y: 0, w: 1920, h: 1080 },
      },
      coca8: {
        kitchen: { x: 1200, y: 220, w: 520, h: 620 },
      },
      coca9: {
        next: { x: 750, y: 600, w: 250, h: 250 },
      },
      coca10: {
        next: { x: 1800, y: 180, w: 200, h: 560 },
      },
      coca11: {
        next: { x: 1800, y: 180, w: 200, h: 560 },
      },
    };

    const wrap = root.querySelector("#room11Wrap");
    const bg = root.querySelector("#bg");
    const overlays = root.querySelector("#overlays");
    const popupLayer = root.querySelector("#popupLayer");

    let scene = "coca1";
    let timers = [];
    let alarmAudio = null;
    let knockAudio = null;
    let audioUnlocked = false;
    const bgm = createRoomBgm(
      "./assets/audio/room11/11 car accident bgm_1.wav",
    );
    const EGG_ALBUMS = {
      books: {
        title: "Book memories",
        caption: "Book memory",
        images: [
          "./assets/props/room11/egg11.1.webp?v=20260624-1",
          "./assets/props/room11/egg11.2.webp?v=20260624-1",
        ],
      },
      board: {
        title: "Board memory",
        caption: "Board memory",
        images: ["./assets/props/room11/egg11.3.webp?v=20260624-1"],
      },
    };

    function getDrawnImageRect() {
      const wrapRect = wrap.getBoundingClientRect();
      const imgRatio = BASE_W / BASE_H;
      const wrapRatio = wrapRect.width / wrapRect.height;

      let width;
      let height;
      let left;
      let top;

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
      const drawn = getDrawnImageRect();

      el.style.left = `${drawn.left + (rect.x / BASE_W) * drawn.width}px`;
      el.style.top = `${drawn.top + (rect.y / BASE_H) * drawn.height}px`;
      el.style.width = `${(rect.w / BASE_W) * drawn.width}px`;
      el.style.height = `${(rect.h / BASE_H) * drawn.height}px`;
    }

    function layout() {
      const map = [
        ["start", RECTS.coca1.start],
        ["books", RECTS.coca1.books],
        ["board", RECTS.coca1.board],
        ["full", RECTS.coca2.full],
        ["tv", RECTS.alarm.tv],
        ["phone-left", RECTS.alarm.phoneLeft],
        ["phone-middle", RECTS.alarm.phoneMiddle],
        ["phone-right", RECTS.alarm.phoneRight],
        ["tv-screen", RECTS.tv1.screen],
        ["back-left", RECTS.tv3.backLeft],
        ["knock-full", RECTS.coca4Knock.full],
        ["door", RECTS.afterKnockDialog.door],
        ["lock", RECTS.door1.lock],
        ["plant-left", RECTS.coca5.plantLeft],
        ["plant-middle", RECTS.coca5.plantMiddle],
        ["plant-right", RECTS.coca5.plantRight],
        ["coca7-full", RECTS.coca7.full],
        ["kitchen", RECTS.coca8.kitchen],
        ["coca9-next", RECTS.coca9.next],
        ["coca10-next", RECTS.coca10.next],
        ["coca11-next", RECTS.coca11.next],
      ];

      map.forEach(([name, rect]) => {
        const el = overlays.querySelector(`[data-hotspot="${name}"]`);
        if (el) placeRectOnImage(el, rect);
      });
    }

    function setBG(src) {
      if (bg.getAttribute("src") === src) {
        layout();
        return;
      }

      bg.src = src;
    }

    function addTimer(fn, delay) {
      const timer = setTimeout(fn, delay);
      timers.push(timer);
    }

    function clearTimers() {
      timers.forEach(clearTimeout);
      timers = [];
    }

    function clearOverlays() {
      overlays.innerHTML = "";
    }

    function closeEggAlbum() {
      popupLayer.querySelector("#room11EggAlbum")?.remove();
    }

    function stopAudio(audio) {
      if (!audio) return;
      audio.pause();
      audio.currentTime = 0;
    }

    function unlockAudio() {
      if (audioUnlocked) return;

      const testAudio = new Audio("./assets/audio/room11/fire-alarm.wav");
      testAudio.volume = 0;

      testAudio
        .play()
        .then(() => {
          testAudio.pause();
          testAudio.currentTime = 0;
          audioUnlocked = true;
        })
        .catch(() => {});
    }

    function playAlarmSound() {
      if (!alarmAudio) {
        alarmAudio = new Audio("./assets/audio/room11/fire-alarm.wav");
      }

      alarmAudio.loop = false;
      alarmAudio.volume = 1;
      alarmAudio.currentTime = 0;
      alarmAudio.play().catch(() => {});
    }

    function startKnockSound() {
      if (scene !== "coca4Knock") return;

      if (!knockAudio) {
        knockAudio = new Audio("./assets/audio/room11/knock-door.wav");
      }

      knockAudio.loop = true;
      knockAudio.volume = 1;
      knockAudio.currentTime = 0;
      knockAudio.play().catch(() => {});

      showHotspot("knock-full", "React to knocking", stopKnockAndShowDialog);
    }

    function showHotspot(name, label, callback) {
      overlays.innerHTML = `
          <button
            class="hotspot room11-hotspot"
            data-hotspot="${name}"
            aria-label="${label}"
          ></button>
        `;

      overlays
        .querySelector(`[data-hotspot="${name}"]`)
        .addEventListener("click", callback);

      layout();
    }

    function showCoca1Hotspots() {
      overlays.innerHTML = `
          <button class="hotspot room11-hotspot" data-hotspot="start" aria-label="Continue"></button>
          <button class="hotspot room11-hotspot" data-hotspot="books" aria-label="Open book memories"></button>
          <button class="hotspot room11-hotspot" data-hotspot="board" aria-label="Open board memory"></button>
        `;

      overlays
        .querySelector('[data-hotspot="start"]')
        .addEventListener("click", goToCoca2);

      overlays
        .querySelector('[data-hotspot="books"]')
        .addEventListener("click", () => showEggAlbum(EGG_ALBUMS.books));

      overlays
        .querySelector('[data-hotspot="board"]')
        .addEventListener("click", () => showEggAlbum(EGG_ALBUMS.board));

      layout();
    }

    function showEggAlbum(albumData) {
      closeEggAlbum();

      let pageIndex = 0;
      const album = document.createElement("div");
      album.id = "room11EggAlbum";
      album.className = "room11-egg-album";
      album.innerHTML = `
          <div class="room11-egg-album__backdrop"></div>
          <div class="room11-egg-album__book" role="dialog" aria-modal="true" aria-label="${albumData.title}">
            <button
              id="room11EggAlbumClose"
              class="room11-egg-album__close"
              type="button"
              aria-label="Close album"
            >×</button>

            <div class="room11-egg-album__spine" aria-hidden="true"></div>

            <div class="room11-egg-album__page">
              <div class="room11-egg-album__photo-frame">
                <img id="room11EggAlbumImage" class="room11-egg-album__image" src="" alt="${albumData.caption}">
              </div>

              <div class="room11-egg-album__caption">
                <span>${albumData.caption}</span>
                <span id="room11EggAlbumCounter"></span>
              </div>

              <div class="room11-egg-album__controls">
                <button id="room11EggAlbumPrev" type="button">‹ Previous</button>
                <button id="room11EggAlbumNext" type="button">Next ›</button>
              </div>
            </div>
          </div>
        `;

      popupLayer.appendChild(album);

      const img = album.querySelector("#room11EggAlbumImage");
      const counter = album.querySelector("#room11EggAlbumCounter");
      const prevBtn = album.querySelector("#room11EggAlbumPrev");
      const nextBtn = album.querySelector("#room11EggAlbumNext");

      function updateAlbum() {
        img.src = albumData.images[pageIndex];
        counter.textContent = `${pageIndex + 1} / ${albumData.images.length}`;
        prevBtn.disabled = pageIndex === 0;
        nextBtn.disabled = pageIndex === albumData.images.length - 1;
      }

      album
        .querySelector("#room11EggAlbumClose")
        .addEventListener("click", closeEggAlbum);

      album
        .querySelector(".room11-egg-album__backdrop")
        .addEventListener("click", closeEggAlbum);

      prevBtn.addEventListener("click", () => {
        pageIndex = Math.max(0, pageIndex - 1);
        updateAlbum();
      });

      nextBtn.addEventListener("click", () => {
        pageIndex = Math.min(albumData.images.length - 1, pageIndex + 1);
        updateAlbum();
      });

      updateAlbum();
    }

    function showAlarmClosedHotspots() {
      overlays.innerHTML = `
          <button class="hotspot room11-hotspot" data-hotspot="tv" aria-label="Zoom in to TV"></button>
          <button class="hotspot room11-hotspot" data-hotspot="phone-left" aria-label="Check left phone"></button>
          <button class="hotspot room11-hotspot" data-hotspot="phone-middle" aria-label="Check middle phone"></button>
          <button class="hotspot room11-hotspot" data-hotspot="phone-right" aria-label="Check right phone"></button>
        `;

      overlays
        .querySelector('[data-hotspot="tv"]')
        .addEventListener("click", goToTv1);

      overlays
        .querySelectorAll(
          '[data-hotspot="phone-left"], [data-hotspot="phone-middle"], [data-hotspot="phone-right"]',
        )
        .forEach((phone) => {
          phone.addEventListener("click", showEmergencyAlert);
        });

      layout();
    }

    function showRpgDialog(text, speaker, onClose) {
      popupLayer.innerHTML = `
          <div class="room11-rpg-dialog">
            <div class="room11-rpg-name">${speaker}</div>
            <div class="room11-rpg-text">${text}</div>
            <button class="room11-rpg-next">Continue</button>
          </div>
        `;

      popupLayer
        .querySelector(".room11-rpg-next")
        .addEventListener("click", () => {
          popupLayer.innerHTML = "";
          if (onClose) onClose();
        });
    }

    function showLeftSlider(callback) {
      overlays.innerHTML = `
          <div class="room11-left-gradient" aria-hidden="true">
            <div class="room11-left-arrow"></div>
          </div>
      
          <button
            class="room11-left-click-zone"
            type="button"
            aria-label="Go back"
          ></button>
        `;

      const gradient = overlays.querySelector(".room11-left-gradient");
      const clickZone = overlays.querySelector(".room11-left-click-zone");

      clickZone.addEventListener("click", callback);

      // Let browser render hidden state first, then animate in
      requestAnimationFrame(() => {
        gradient.classList.add("is-visible");
      });
    }

    function showPlantHotspots() {
      overlays.innerHTML = `
          <button class="hotspot room11-hotspot" data-hotspot="plant-left" aria-label="Left plant"></button>
          <button class="hotspot room11-hotspot" data-hotspot="plant-middle" aria-label="Middle plant"></button>
          <button class="hotspot room11-hotspot" data-hotspot="plant-right" aria-label="Right plant"></button>
        `;

      overlays
        .querySelector('[data-hotspot="plant-left"]')
        .addEventListener("click", goToCoca6);

      overlays
        .querySelector('[data-hotspot="plant-middle"]')
        .addEventListener("click", goToCoca6);

      overlays
        .querySelector('[data-hotspot="plant-right"]')
        .addEventListener("click", goToCoca6);

      layout();
    }

    function renderCoca1() {
      scene = "coca1";
      setBG("./assets/bg/room11/coca1.webp");
      popupLayer.innerHTML = "";
      showCoca1Hotspots();
    }

    function goToCoca2() {
      if (scene !== "coca1") return;

      unlockAudio();

      scene = "coca2";
      setBG("./assets/bg/room11/coca2.webp");
      showHotspot("full", "Continue", goToCoca3);
    }

    function goToCoca3() {
      if (scene !== "coca2") return;

      unlockAudio();

      scene = "coca3";
      setBG("./assets/bg/room11/coca3.webp");
      clearOverlays();

      addTimer(goToAlarm, 3000);
    }

    function goToAlarm() {
      if (scene !== "coca3") return;

      scene = "alarm";
      setBG("./assets/bg/room11/coca4.gif");
      playAlarmSound();

      addTimer(showEmergencyAlert, 3000);
    }

    function showEmergencyAlert() {
      if (scene !== "alarm" && scene !== "alarmClosed") return;

      scene = "alert";

      popupLayer.innerHTML = `
          <div class="room11-alert-overlay">
            <div class="room11-alert-box">
              <button class="room11-alert-close" aria-label="Close alert">×</button>
  
              <div class="room11-alert-header">
                <span class="room11-alert-icon">!</span>
                <span>Emergency Alert</span>
              </div>
  
              <div class="room11-alert-body">
                <p>Please remain calm and evacuate immediately.</p>
                <p>Occupants must stay inside their assigned rooms until further notice.</p>
                <p>Failure to comply may result in disciplinary action.</p>
              </div>
            </div>
          </div>
        `;

      popupLayer
        .querySelector(".room11-alert-close")
        .addEventListener("click", closeEmergencyAlert);
    }

    function closeEmergencyAlert() {
      if (scene !== "alert") return;

      scene = "alarmClosed";
      popupLayer.innerHTML = "";
      showAlarmClosedHotspots();
    }

    function goToTv1() {
      if (scene !== "alarmClosed") return;

      scene = "tv1";
      setBG("./assets/bg/room11/tv1.webp");
      showHotspot("tv-screen", "Continue TV scene", goToTv2);
    }

    function goToTv2() {
      if (scene !== "tv1") return;

      scene = "tv2";
      setBG("./assets/bg/room11/tv2.webp");
      clearOverlays();

      addTimer(goToTv3, 2000);
    }

    function goToTv3() {
      if (scene !== "tv2") return;

      scene = "tv3";
      setBG("./assets/bg/room11/tv3.webp");

      showRpgDialog(
        "You must leave now, you are not supposed to be here!",
        "Security",
        () => showLeftSlider(goBackToCoca4Knock),
      );
    }

    function goBackToCoca4Knock() {
      if (scene !== "tv3") return;

      scene = "coca4Knock";
      setBG("./assets/bg/room11/coca4.gif");
      clearOverlays();

      addTimer(startKnockSound, 1000);
    }

    function stopKnockAndShowDialog() {
      if (scene !== "coca4Knock") return;

      stopAudio(knockAudio);

      scene = "afterKnockDialog";
      clearOverlays();

      showRpgDialog(
        "I think the security is knocking on the door…",
        "Me",
        () => {
          showHotspot("door", "Go to door", goToDoor1);
        },
      );
    }

    function goToDoor1() {
      if (scene !== "afterKnockDialog") return;

      scene = "door1";
      setBG("./assets/bg/room11/door1.webp");
      showHotspot("lock", "Lock the door", goToDoor2);
    }

    function goToDoor2() {
      if (scene !== "door1") return;

      scene = "door2";
      setBG("./assets/bg/room11/door2.webp");
      clearOverlays();

      showLeftSlider(goToCoca5);
    }

    function goToCoca5() {
      if (scene !== "door2") return;

      scene = "coca5";
      setBG("./assets/bg/room11/coca5.gif");
      showPlantHotspots();
    }

    function goToCoca6() {
      if (scene !== "coca5") return;

      scene = "coca6";
      setBG("./assets/bg/room11/coca6.gif");
      showHotspot("coca7-full", "Continue", goToCoca7);
    }

    function goToCoca7() {
      if (scene !== "coca6") return;

      scene = "coca7";
      setBG("./assets/bg/room11/coca7.gif");
      showHotspot("kitchen", "Go to kitchen", goToCoca8);
    }

    function goToCoca8() {
      if (scene !== "coca7") return;

      scene = "coca8";
      setBG("./assets/bg/room11/coca8.webp");
      showHotspot("coca9-next", "Continue", goToCoca9);
    }

    function goToCoca9() {
      if (scene !== "coca8") return;

      scene = "coca9";
      setBG("./assets/bg/room11/coca9.webp");
      clearOverlays();

      showLeftSlider(goToCoca10);
    }

    function goToCoca10() {
      if (scene !== "coca9") return;

      scene = "coca10";
      setBG("./assets/bg/room11/coca10.webp");
      showHotspot("coca10-next", "Continue", goToCoca11);
    }

    function goToCoca11() {
      if (scene !== "coca10") return;

      scene = "coca11";
      setBG("./assets/bg/room11/coca11.webp");
      showHotspot("coca11-next", "Continue", goToCoca12);
    }

    function goToCoca12() {
      if (scene !== "coca11") return;

      scene = "coca12";
      setBG("./assets/bg/room11/coca12.webp");
      clearOverlays();

      localStorage.setItem("room11_done", "1");

      window.dispatchEvent(
        new CustomEvent("stage:end", {
          detail: {
            nextStage: "ending",
            menuStage: "intro",
            nextLabel: "Next",
            menuLabel: "Back to Menu",
          },
        }),
      );
    }

    function handleResize() {
      layout();
    }

    window.addEventListener("resize", handleResize);
    bg.addEventListener("load", layout);

    renderCoca1();
    bgm.start();

    this.exit = () => {
      clearTimers();
      bgm.stop();
      closeEggAlbum();

      window.removeEventListener("resize", handleResize);
      bg.removeEventListener("load", layout);

      stopAudio(alarmAudio);
      stopAudio(knockAudio);

      alarmAudio = null;
      knockAudio = null;

      clearOverlays();
      popupLayer.innerHTML = "";
    };
  },

  exit() {},
};
