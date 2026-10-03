(() => {
  const button = document.createElement("button");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  button.type = "button";
  button.className = "scroll-top";
  button.setAttribute("aria-label", "Back to top");
  button.setAttribute("title", "Back to top");
  button.setAttribute("data-visible", "false");
  button.textContent = "↑";

  const updateVisibility = () => {
    button.setAttribute(
      "data-visible",
      String(window.scrollY > Math.max(480, window.innerHeight * 0.75)),
    );
  };

  button.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: reduceMotion.matches ? "auto" : "smooth",
    });
  });

  window.addEventListener("scroll", updateVisibility, { passive: true });
  window.addEventListener("resize", updateVisibility);
  document.body.append(button);
  updateVisibility();
})();
