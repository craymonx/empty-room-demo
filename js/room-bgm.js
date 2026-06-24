export function createRoomBgm(src, { volume = 0.45 } = {}) {
  let bgm = null;

  function removeUnlockListeners() {
    window.removeEventListener("click", unlockAudio);
    window.removeEventListener("pointerdown", unlockAudio);
  }

  function unlockAudio() {
    if (!bgm) return;

    bgm.play().catch(() => {});
    removeUnlockListeners();
  }

  function start() {
    if (bgm) return;

    bgm = new Audio(src);
    bgm.loop = true;
    bgm.volume = volume;

    bgm.play().catch(() => {
      window.addEventListener("click", unlockAudio, { once: true });
      window.addEventListener("pointerdown", unlockAudio, { once: true });
    });
  }

  function stop() {
    removeUnlockListeners();

    if (!bgm) return;

    bgm.pause();
    bgm.currentTime = 0;
    bgm = null;
  }

  return {
    start,
    stop,
  };
}
