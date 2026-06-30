export function showChapterEndDialog({ container, text, onContinue }) {
  if (!container || !text) {
    onContinue?.();
    return;
  }

  container.querySelector("#chapterEndDialog")?.remove();

  const dialog = document.createElement("div");
  dialog.id = "chapterEndDialog";
  dialog.className = "chapter-end-dialog";
  dialog.innerHTML = `
    <div class="chapter-end-dialog__box">
      <div class="chapter-end-dialog__text">${text}</div>
      <button class="chapter-end-dialog__continue" type="button">Continue</button>
    </div>
  `;

  container.appendChild(dialog);

  dialog
    .querySelector(".chapter-end-dialog__continue")
    .addEventListener("click", () => {
      dialog.remove();
      onContinue?.();
    });
}
