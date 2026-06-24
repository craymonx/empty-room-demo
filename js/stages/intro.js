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
            <span class="room-name">${room.name}</span>

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
        label: "Level list",
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
          <h1>Level List</h1>
          <p>Select a room to explore your journey.</p>

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

          <div class="code-card">
            <p><span class="code-key">project.name</span> = <span class="code-value">"Empty Room"</span></p>
            <p><span class="code-key">theme</span> = <span class="code-value">"memory, silence, late-night distance"</span></p>
            <p><span class="code-key">condition</span> = <span class="code-value">"a room that remembers more than the person inside it"</span></p>
            <p><span class="code-key">sound</span> = <span class="code-value">"soft noise, broken loops, unfinished thoughts"</span></p>
            <p><span class="code-key">movement</span> = <span class="code-value">"click, wait, discover, repeat"</span></p>
            <p><span class="code-key">note</span> = <span class="code-value">"nothing is hidden; it only waits for attention"</span></p>
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

          <div class="code-card">
            <p><span class="code-key">created_by</span> = <span class="code-value">"To be updated"</span></p>
            <p><span class="code-key">music</span> = <span class="code-value">"To be updated"</span></p>
            <p><span class="code-key">visual_direction</span> = <span class="code-value">"To be updated"</span></p>
            <p><span class="code-key">web_development</span> = <span class="code-value">"To be updated"</span></p>
            <p><span class="code-key">special_thanks</span> = <span class="code-value">"To be updated"</span></p>
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