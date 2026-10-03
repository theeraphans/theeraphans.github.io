(() => {
  const hero = document.querySelector(".hero");
  const article = document.querySelector("article.content, article.article, .content, .article");
  const toc = document.querySelector(".toc");

  if (hero && article) {
    const words = article.textContent.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 220));
    const heroCopy = hero.querySelector(".hero-copy") ?? hero;
    const category = heroCopy.querySelector(".kicker, .eyebrow");
    const metadata = heroCopy.querySelector(".meta, .byline");
    const actions = document.createElement("div");
    const context = document.createElement("div");
    const tools = document.createElement("div");
    const readTime = document.createElement("span");
    const share = document.createElement("button");

    actions.className = "article-actions";
    context.className = "article-context";
    tools.className = "article-tools";
    readTime.textContent = `${minutes} min read`;
    share.type = "button";
    share.textContent = "Share ↗";
    share.setAttribute("aria-label", "Share this article");
    if (category) context.append(category);
    if (metadata) context.append(metadata);
    tools.append(readTime, share);
    actions.append(context, tools);
    hero.append(actions);

    share.addEventListener("click", async () => {
      const data = { title: document.title, url: window.location.href };
      try {
        if (navigator.share) await navigator.share(data);
        else {
          await navigator.clipboard.writeText(data.url);
          share.textContent = "Link copied";
          window.setTimeout(() => {
            share.textContent = "Share ↗";
          }, 1800);
        }
      } catch (error) {
        if (error?.name !== "AbortError") share.textContent = "Share unavailable";
      }
    });
  }

  if (toc) {
    const mobileToc = document.createElement("details");
    const summary = document.createElement("summary");
    const nav = document.createElement("nav");
    const list = toc.querySelector("ul, ol");

    mobileToc.className = "mobile-toc";
    summary.textContent = "Table of contents";
    if (list) nav.append(list.cloneNode(true));
    mobileToc.append(summary, nav);
    document.querySelector(".layout, .article-layout, .article-grid, .content-grid")?.before(mobileToc);
  }

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
