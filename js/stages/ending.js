export default {
    enter({ root, go }) {
      root.innerHTML = `
        <section style="padding:24px; max-width:760px;">
          <h2>End</h2>
          <button id="restart-btn">Restart</button>
        </section>
      `;
      root.querySelector("#restart-btn").addEventListener("click", () => go("intro"));
    },
    exit({ root }) {
      root.innerHTML = "";
    },
  };