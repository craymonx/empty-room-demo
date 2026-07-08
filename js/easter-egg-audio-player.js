function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "--:--";

  const totalSeconds = Math.floor(seconds);
  const mins = Math.floor(totalSeconds / 60);
  const secs = String(totalSeconds % 60).padStart(2, "0");

  return `${mins}:${secs}`;
}

function closeExistingPlayer(container, id) {
  const existing = container?.querySelector(`#${id}`);
  existing?.__closeEasterEggAudioPlayer?.();
  existing?.remove();
}

export function showEasterEggAudioPlayer({
  container,
  id,
  src,
  title,
  date,
  eyebrow = "Demo tape",
  autoPlay = true,
  onClose,
}) {
  if (!container || !id || !src || !title) return null;

  closeExistingPlayer(container, id);

  const popup = document.createElement("div");
  popup.id = id;
  popup.className = "egg-audio-player";
  popup.innerHTML = `
    <div class="egg-audio-player__backdrop"></div>
    <div class="egg-audio-player__deck" role="dialog" aria-modal="true" aria-label="${title} audio player">
      <button class="egg-audio-player__close" type="button" aria-label="Close player">×</button>

      <div class="egg-audio-player__info">
        <p class="egg-audio-player__eyebrow">${eyebrow}</p>
        <h2>${title}</h2>
        <dl>
          <div>
            <dt>Date</dt>
            <dd>${date || "--"}</dd>
          </div>
          <div>
            <dt>Duration</dt>
            <dd data-egg-audio-duration>--:--</dd>
          </div>
        </dl>

        <figure class="egg-audio-player__figure">
          <audio class="egg-audio-player__native" controls src="${src}"></audio>
        </figure>
      </div>
    </div>
  `;

  container.appendChild(popup);

  const audio = popup.querySelector(".egg-audio-player__native");
  const durationEl = popup.querySelector("[data-egg-audio-duration]");

  let closed = false;

  function updateDurationUi() {
    durationEl.textContent = formatDuration(audio.duration);
  }

  function close() {
    if (closed) return;
    closed = true;

    audio.pause();
    audio.currentTime = 0;
    popup.remove();
    onClose?.();
  }

  popup.__closeEasterEggAudioPlayer = close;

  audio.addEventListener("loadedmetadata", updateDurationUi);

  popup
    .querySelector(".egg-audio-player__close")
    .addEventListener("click", close);

  popup
    .querySelector(".egg-audio-player__backdrop")
    .addEventListener("click", close);

  if (autoPlay) {
    audio.play().catch(() => {});
  }

  return {
    audio,
    close,
  };
}
