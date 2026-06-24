// /js/stages/intro.js

export default {
  enter({ root, go }) {
    const ROOMS = [
      { id: "room1", name: "Cooking at 1AM" },
      { id: "room2", name: "Static" },
      { id: "room3", name: "No Wheel, No Deal" },
      { id: "room4", name: "Pebbles and the Rock" },
      { id: "room5", name: "Norwegian Mood" },
      { id: "room6", name: "Deep Dream" },
      { id: "room7", name: "Empty Room" },
      { id: "room8", name: "Calmly Sob" },
      { id: "room9", name: "Langley Fog" },
      { id: "room10", name: "Foreign Night Sea" },
      { id: "room11", name: "Car Accident (Chill Out)" },
    ];

    const BASE_W = 1248;
    const BASE_H = 1248;

    function isRoomUnlocked(index) {
      if (index === 0) return true;

      const prevRoomId = ROOMS[index - 1].id;
      return localStorage.getItem(`${prevRoomId}_done`) === "1";
    }

    function isRoomDone(roomId) {
      return localStorage.getItem(`${roomId}_done`) === "1";
    }

    function getRoomsHtml() {
      let roomsHtml = "";

      ROOMS.forEach((room, index) => {
        const unlocked = isRoomUnlocked(index);
        const done = isRoomDone(room.id);

        roomsHtml += `
          <button
            class="room-item ${unlocked ? "" : "locked"}"
            data-room="${room.id}"
            ${unlocked ? "" : "disabled"}
            type="button"
          >
            <span class="room-name">${index + 1} - ${room.name}</span>

            <span class="room-meta">
              ${done ? "✓" : unlocked ? "" : `<span class="lock">🔒</span>`}
            </span>
          </button>
        `;
      });

      return roomsHtml;
    }

    root.innerHTML = `
      <section class="scene" id="scene-intro">
        <div class="scene-inner" id="introWrap">
          <img
            id="introBg"
            class="bg"
            src="./assets/bg/mainpage.webp"
            alt="Intro"
            draggable="false"
          >

          <div id="introHotspots" class="intro-hotspots" aria-hidden="false"></div>

          <div id="introPanel" class="intro-panel" aria-hidden="true">
            <div class="intro-panel-inner">
              <button class="intro-panel-close" type="button" aria-label="Close">×</button>
              <div id="introPanelContent"></div>
            </div>
          </div>
        </div>
      </section>
    `;

    const wrap = root.querySelector("#introWrap");
    const bg = root.querySelector("#introBg");
    const hotspots = root.querySelector("#introHotspots");
    const panel = root.querySelector("#introPanel");
    const panelContent = root.querySelector("#introPanelContent");
    const closeBtn = root.querySelector(".intro-panel-close");

    const HOTSPOTS = [
      {
        id: "level-list",
        label: "Stages",
        rect: { x: 575, y: 738, w: 180, h: 120 }, // drawing on floor
      },
      {
        id: "artist-statement",
        label: "Artist statement",
        rect: { x: 0, y: 600, w: 300, h: 250 }, // table
      },
      {
        id: "album-link",
        label: "Album link",
        rect: { x: 0, y: 360, w: 250, h: 260 }, // window
      },
      {
        id: "credit",
        label: "Credit",
        rect: { x: 790, y: 555, w: 160, h: 170 }, // oven
      },
    ];

    function getImageFitRect() {
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

      return { width, height, left, top };
    }

    function placeHotspot(button, rect) {
      const fit = getImageFitRect();

      button.style.left = `${fit.left + (rect.x / BASE_W) * fit.width}px`;
      button.style.top = `${fit.top + (rect.y / BASE_H) * fit.height}px`;
      button.style.width = `${(rect.w / BASE_W) * fit.width}px`;
      button.style.height = `${(rect.h / BASE_H) * fit.height}px`;
    }

    function renderHotspots() {
      hotspots.innerHTML = "";

      HOTSPOTS.forEach((spot) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "intro-hotspot";
        btn.dataset.action = spot.id;
        btn.setAttribute("aria-label", spot.label);

        placeHotspot(btn, spot.rect);

        btn.addEventListener("click", () => {
          openPanel(spot.id);
        });

        hotspots.appendChild(btn);
      });
    }

    function openPanel(type) {
      if (type === "level-list") {
        panelContent.innerHTML = `
          <h1>Stages</h1>

          <div class="room-list">
            ${getRoomsHtml()}
          </div>
        `;

        panelContent.querySelectorAll(".room-item").forEach((btn) => {
          btn.addEventListener("click", () => {
            if (btn.disabled) return;

            const roomId = btn.dataset.room;
            go(roomId);
          });
        });
      }

      if (type === "artist-statement") {
        panelContent.innerHTML = `
          <h1>Artist Statement</h1>

          <div class="intro-copy">
            <p>Empty Room is a world created by James Tseung, with the album at its centre.</p>
            <p>Drawing from his experience living in a foreign country as an international student during his late adolescence, the project explores themes of loneliness, isolation, dreams, memory, spatial relationships, faith, and human connection.</p>
            <p>Living alone on campus during the COVID-19 pandemic, his room became the main stage for everyday life. As physical movement became increasingly restricted, dreams and imagination became another territory to explore. Over time, the room began to feel less like a living space and more like an extension of the mind itself, a place shaped by memory, emotion, fear, and desire. Though physically confined, Tseung found himself equally trapped within a mental landscape formed in the aftermath of real-life upheaval.</p>
            <p>Yet the room was never merely a prison. It was a place of refuge, a temporary home in a foreign land, and a spiritual sanctuary. It witnessed moments of ecstasy, frustration, depression, peace, friendship, and wonder. As the project unfolds, the room gradually transforms alongside its inhabitant, becoming a symbolic space where reality, memory, dreams, and imagination overlap.</p>
            <p>To embody the absurdity of life as he experienced it, Tseung gave the room its own logic—one that does not always make sense to the audience. Through recurring symbols and surreal events, ordinary objects and spaces take on new meanings, reflecting the shifting emotional landscape of its inhabitant.</p>
            <p>Empty Room traces a journey through grief, trauma, joy, companionship, and renewal. When its inhabitant finally leaves the room, he carries with him not only the memories created within it, but also the relationships, lessons, and sense of self discovered along the way.</p>
          </div>
        `;
      }

      if (type === "album-link") {
        panelContent.innerHTML = `
          <h1>Album Links</h1>
          <p>Choose a platform to listen.</p>

          <div class="linktree-list">
            <a href="#" target="_blank" rel="noopener noreferrer">Official Website</a>
            <a href="#" target="_blank" rel="noopener noreferrer">Spotify</a>
            <a href="#" target="_blank" rel="noopener noreferrer">Apple Music</a>
            <a href="#" target="_blank" rel="noopener noreferrer">YouTube</a>
            <a href="#" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="#" target="_blank" rel="noopener noreferrer">Bandcamp</a>
          </div>
        `;
      }

      if (type === "credit") {
        panelContent.innerHTML = `
          <h1>Credit</h1>

          <div class="intro-copy intro-credit">
            <section>
              <h2>Album</h2>
              <p>Written, arranged, performed, recorded, produced, mixed and mastered by James Tseung, except where noted.</p>
            </section>

            <section>
              <h2>Musicians</h2>
              <p>Cello — Brian Chan (4)</p>
              <p>Violin — Caleb Chan (4)</p>
              <p>Electric Guitar — Tony Choi (1, 11)</p>
              <p>Electric Bass — YY (1, 11)</p>
              <p>Electric Upright Bass — YY (8)</p>
              <p>Featured Artist — handwash (2)</p>
            </section>

            <section>
              <h2>Artwork</h2>
              <p>Album and Single Artwork — Emily Lau</p>
            </section>

            <section>
              <h2>Website</h2>
              <p>Concept — James Tseung</p>
              <p>Programming — Ray Choi</p>
              <p>Sound Effects — Ray Choi</p>
              <p>Background Music — James Tseung</p>
              <p>Website imagery created using Google Gemini</p>
            </section>
          </div>
        `;
      }

      panel.classList.add("is-open");
      panel.setAttribute("aria-hidden", "false");
    }

    function closePanel() {
      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
    }

    closeBtn.addEventListener("click", closePanel);

    panel.addEventListener("click", (event) => {
      if (event.target === panel) {
        closePanel();
      }
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closePanel();
      }
    });

    bg.addEventListener("load", renderHotspots);
    window.addEventListener("resize", renderHotspots);

    if (bg.complete) {
      renderHotspots();
    }
  },

  exit({ root }) {
    root.innerHTML = "";
  },
};
