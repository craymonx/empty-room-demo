const bg = document.getElementById("bg");
const potHotspot = document.getElementById("potHotspot");

let scene = "kitchen";

potHotspot.addEventListener("click", () => {
  if (scene === "kitchen") {
    bg.src = "assets/bg/stove-with-pot.png";
    potHotspot.style.display = "none";
    scene = "stove";
  }
});