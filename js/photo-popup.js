export function closePhotoPopup(container, id) {
  container.querySelector(`#${id}`)?.remove();
}

export function showPhotoPopup({
  container,
  id,
  title = "Photo memory",
  images = [],
  initialIndex = 0,
  onClose,
}) {
  closePhotoPopup(container, id);

  if (!images.length) return;

  let pageIndex = Math.min(Math.max(0, initialIndex), images.length - 1);

  const popup = document.createElement("div");
  popup.id = id;
  popup.className = "egg-photo-popup";
  popup.innerHTML = `
    <div class="egg-photo-popup__backdrop"></div>
    <div class="egg-photo-popup__frame" role="dialog" aria-modal="true" aria-label="${title}">
      <button class="egg-photo-popup__close" type="button" aria-label="Close photo">×</button>
      <img class="egg-photo-popup__image" src="" alt="${title}">
      <div class="egg-photo-popup__controls">
        <button class="egg-photo-popup__nav egg-photo-popup__prev" type="button" aria-label="Previous photo">‹</button>
        <span class="egg-photo-popup__counter"></span>
        <button class="egg-photo-popup__nav egg-photo-popup__next" type="button" aria-label="Next photo">›</button>
      </div>
    </div>
  `;

  container.appendChild(popup);

  const image = popup.querySelector(".egg-photo-popup__image");
  const counter = popup.querySelector(".egg-photo-popup__counter");
  const prevBtn = popup.querySelector(".egg-photo-popup__prev");
  const nextBtn = popup.querySelector(".egg-photo-popup__next");
  const controls = popup.querySelector(".egg-photo-popup__controls");

  function update() {
    image.src = images[pageIndex];
    image.alt = `${title} ${pageIndex + 1}`;
    counter.textContent = `${pageIndex + 1} / ${images.length}`;
    prevBtn.disabled = pageIndex === 0;
    nextBtn.disabled = pageIndex === images.length - 1;
    controls.hidden = images.length <= 1;
  }

  function close() {
    popup.remove();
    onClose?.();
  }

  popup
    .querySelector(".egg-photo-popup__close")
    .addEventListener("click", close);

  popup
    .querySelector(".egg-photo-popup__backdrop")
    .addEventListener("click", close);

  prevBtn.addEventListener("click", () => {
    pageIndex = Math.max(0, pageIndex - 1);
    update();
  });

  nextBtn.addEventListener("click", () => {
    pageIndex = Math.min(images.length - 1, pageIndex + 1);
    update();
  });

  update();
}
