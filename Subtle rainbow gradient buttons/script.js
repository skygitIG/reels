


function getCursorPosition(element, event) {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const x = event.clientX - centerX;
  const y = centerY - event.clientY;
  return { x, y };
}

const buttons = document.querySelectorAll("button");
[...buttons].map((button) => {
  button.addEventListener("pointermove", (event) => {
    const { x, y } = getCursorPosition(event.target, event);
    button.style.setProperty("--coord-x", x);
    button.style.setProperty("--coord-y", y);
  });
  button.addEventListener("pointerleave", (event) => {
    button.style.setProperty("--coord-x", 0);
    button.style.setProperty("--coord-y", 0);
  });
});