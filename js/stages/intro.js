// /js/stages/intro.js
export default {
  enter({ root, go }) {
    const ROOMS = [
      { id: "room1", name: "Cooking at 1AM" },
      { id: "room2", name: "Static" },
      { id: "room3", name:  "No Wheel, No Deal" },
      { id: "room4", name: "Pebbles and the Rock" },
      { id: "room5", name: "Norwegian Mood" },
      { id: "room6", name: "Deep Dream" },
      { id: "room7", name: "Empty Room" },
      { id: "room8", name: "Calmly Sob" },
      { id: "room9", name: "Langley Fog" },
      { id: "room10", name: "Foreign Night Sea" },
      { id: "room11", name: "Chill Out (Car Accident)" },
  ];

    function isRoomUnlocked(index) {
      if (index === 0) return true; // first room always unlocked
      const prevRoomId = ROOMS[index - 1].id;
      return localStorage.getItem(`${prevRoomId}_done`) === "1";
    }
    
    function isRoomDone(roomId) {
      return localStorage.getItem(`${roomId}_done`) === "1";
    }

    let roomsHtml = "";

    ROOMS.forEach((room, index) => {
      const unlocked = isRoomUnlocked(index);
      const done = isRoomDone(room.id);    

      roomsHtml += `
        <button class="room-item ${unlocked ? "" : "locked"}"
                data-room="${room.id}"
                ${unlocked ? "" : "disabled"}>
          <span class="room-name">
           ${room.name} ${done ? "" : ""}
          </span>
          <span class="room-meta">
            ${unlocked ? "" : `<span class="lock">🔒</span>`}
        </button>
      `;
    })

    root.innerHTML = `
      <section class="scene" id="scene-intro">
        <div class="scene-inner">
          <img class="bg" src="./assets/bg/game-main-view.png" alt="Intro">

          <div class="intro-card">
            <h1>Empty Room</h1>
            <p>Select a room to explore your journey.</p>

            <div class="room-list">
              ${roomsHtml}
            </div>
          </div>
        </div>
      </section>
    `;

    root.querySelectorAll(".room-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const roomId = btn.dataset.room;
        go(roomId);
      });
    });
  },

  exit({ root }) {
    root.innerHTML = "";
  },
};