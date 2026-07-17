export const EASTER_EGG_GROUPS = [
  { label: "Cooking at 1AM", eggs: ["room1-table"] },
  { label: "Static", eggs: ["room2-desk"] },
  { label: "No Wheel No Deal", eggs: ["room3-phone"] },
  { label: "Pebbles and the Rock", eggs: ["room4-chair"] },
  { label: "Norwegian Mood", eggs: ["room5-window", "room5-table"] },
  { label: "Deep Dream", eggs: ["room6-window"] },
  { label: "Empty Room", eggs: ["room7-wall"] },
  { label: "Calmly Sob", eggs: ["room8-window-day", "room8-window-night"] },
  { label: "Langley Fog", eggs: ["room9-table"] },
  { label: "Foreign Night Sea", eggs: ["room10-radio", "room10-table"] },
  {
    label: "Car Accident (Chill Out)",
    eggs: ["room11-books", "room11-board"],
  },
  { label: "???", eggs: ["intro-egg0"] },
];

const STORAGE_PREFIX = "easter_egg_found_";

export function markEasterEggFound(id) {
  localStorage.setItem(`${STORAGE_PREFIX}${id}`, "1");
}

export function isEasterEggFound(id) {
  return localStorage.getItem(`${STORAGE_PREFIX}${id}`) === "1";
}
