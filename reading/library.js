const catalog = JSON.parse(document.getElementById("catalog-data").textContent);
const $ = (s) => document.querySelector(s);
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const key = (i) => i.pages[0].file;
const stamp = (i) => Date.parse(i.runAt) || 0;
const date = (i) =>
  stamp(i)
    ? new Date(stamp(i)).toLocaleDateString("en", {
        month: "short",
        day: "numeric",
      })
    : "From the archive";
const url = (i) => encodeURI(i.pages[0].file);
const thumbnail = (i) =>
  i.imageUrl ||
  (i.videoId
    ? `https://i.ytimg.com/vi/${encodeURIComponent(i.videoId)}/hqdefault.jpg`
    : "");
const sourceType = (i) => {
  const sourceUrl = String(i.watchUrl || "").toLowerCase();
  const sourceName = String(i.source || "").toLowerCase();
  if (
    i.videoId ||
    /(youtube\.com|youtu\.be|facebook\.com\/.+videos|instagram\.com\/reel|x\.com\/.+video)/.test(
      sourceUrl,
    )
  )
    return "video";
  if (
    /(arxiv\.org|\.pdf(?:$|\?)|openreview\.net|aclanthology\.org)/.test(
      sourceUrl,
    ) || /\bpaper\b/.test(sourceName)
  )
    return "paper";
  return "article";
};
const sourceLabel = (i) =>
  ({ video: "Video", article: "Article", paper: "Paper" })[sourceType(i)];
let saved = new Set();
try {
  const value = JSON.parse(localStorage.getItem("reading-room-saved") || "[]");
  if (Array.isArray(value)) saved = new Set(value);
} catch {}
const viewKey = "reading-room-view";
const state = {
  mode: "all",
  topics: new Set(),
  source: "all",
  query: "",
  sort: "new",
  limit: 12,
  view: "grid",
};
try {
  const preferredView = localStorage.getItem(viewKey);
  if (["grid", "list"].includes(preferredView)) state.view = preferredView;
} catch {}
const filterToggle = $("#filter-toggle");
const filterBackdrop = $("#filter-backdrop");
const filterClose = $("#filter-close");

function setFilterOpen(open) {
  filterBackdrop.hidden = !open;
  document.body.classList.toggle("filter-open", open);
  filterToggle.setAttribute("aria-expanded", String(open));
  if (open) filterClose.focus();
  else filterToggle.focus();
}

filterToggle.addEventListener("click", () => setFilterOpen(true));
filterClose.addEventListener("click", () => setFilterOpen(false));
$("#filter-done").addEventListener("click", () => setFilterOpen(false));
filterBackdrop.addEventListener("click", (event) => {
  if (event.target === filterBackdrop) setFilterOpen(false);
});

$("#total").textContent = catalog.length;
const topics = [...new Set(catalog.map((i) => i.category))].sort();
$("#topics").innerHTML = topics
  .map((t) => `<label class="filter-option"><input type="checkbox" data-topic="${esc(t)}"><span>${esc(t)}</span><b>${catalog.filter((i) => i.category === t).length}</b></label>`)
  .join("");
function render() {
  let items = catalog.filter(
    (i) =>
      (state.mode !== "saved" || saved.has(key(i))) &&
      (!state.topics.size || state.topics.has(i.category)) &&
      (state.source === "all" || sourceType(i) === state.source) &&
      `${i.title} ${i.description} ${i.source} ${i.category}`
        .toLowerCase()
        .includes(state.query),
  );
  items.sort(
    state.sort === "title"
      ? (a, b) => a.title.localeCompare(b.title)
      : state.sort === "old"
        ? (a, b) => stamp(a) - stamp(b)
        : (a, b) => stamp(b) - stamp(a),
  );
  $("#saved-count").textContent = catalog.filter((i) =>
    saved.has(key(i)),
  ).length;
  $("#result-count").textContent =
    `${items.length} ${items.length === 1 ? "summary" : "summaries"}${state.mode === "saved" ? " saved for later" : ""}${state.query ? " matching your search" : ""}`;
  $("#active-topic").textContent = [...state.topics].join(" · ");
  const filterCount = (state.mode === "saved" ? 1 : 0) + state.topics.size;
  $("#filter-count").hidden = filterCount === 0;
  $("#filter-count").textContent = filterCount;
  $("#catalog-grid").dataset.view = state.view;
  $("#catalog-grid").innerHTML = items
    .slice(0, state.limit)
    .map(
      (i) =>
        `<article class="summary"><a class="thumbnail" href="${url(i)}" aria-label="Read ${esc(i.title)}">${thumbnail(i) ? `<img src="${thumbnail(i)}" alt="" loading="lazy">` : ""}</a><button class="save" data-save="${esc(key(i))}" aria-pressed="${saved.has(key(i))}" aria-label="${saved.has(key(i)) ? "Unsave" : "Save"} ${esc(i.title)}">${saved.has(key(i)) ? "♥" : "♡"}</button><div class="card-body"><h3><a href="${url(i)}">${esc(i.title)}</a></h3><div class="card-meta"><span>${sourceLabel(i)}</span><span>${date(i)}</span></div><p>${esc(i.description)}</p><div class="card-source">${esc(i.category)} · ${esc(i.source)}</div>${i.pages.length > 1 ? `<div class="byline">${i.pages.map((p) => `<a href="${encodeURI(p.file)}">${esc(p.label)} ↗</a>`).join("")}</div>` : ""}</div></article>`,
    )
    .join("");
  $("#empty").hidden = items.length > 0;
  $("#load-more").hidden = items.length <= state.limit;
  document.querySelectorAll("[data-mode]").forEach((b) => {
    b.checked = b.dataset.mode === state.mode;
  });
  document.querySelectorAll("[data-topic]").forEach((b) => {
    b.checked = state.topics.has(b.dataset.topic);
  });
  document.querySelectorAll("[data-source]").forEach((b) => {
    const active = b.dataset.source === state.source;
    b.classList.toggle("active", active);
    b.setAttribute("aria-selected", String(active));
  });
  document.querySelectorAll(".view-button[data-view]").forEach((b) => {
    const active = b.dataset.view === state.view;
    b.classList.toggle("active", active);
    b.setAttribute("aria-pressed", String(active));
  });
}
$("#catalog-search").addEventListener("input", (e) => {
  state.query = e.target.value.trim().toLowerCase();
  state.limit = 12;
  render();
});
$("#sort").addEventListener("change", (e) => {
  state.sort = e.target.value;
  render();
});
$("#load-more").addEventListener("click", () => {
  state.limit += 12;
  render();
});
$("#clear").addEventListener("click", () => {
  Object.assign(state, {
    topics: new Set(),
    source: "all",
    query: "",
    limit: 12,
  });
  $("#catalog-search").value = "";
  render();
});
$("#filter-reset").addEventListener("click", () => {
  state.mode = "all";
  state.topics.clear();
  state.limit = 12;
  render();
});
document.addEventListener("click", (e) => {
  const topic = e.target.closest("[data-topic]"),
    mode = e.target.closest("[data-mode]"),
    source = e.target.closest("[data-source]"),
    view = e.target.closest(".view-button[data-view]"),
    save = e.target.closest("[data-save]");
  if (topic) {
    topic.checked
      ? state.topics.add(topic.dataset.topic)
      : state.topics.delete(topic.dataset.topic);
    state.limit = 12;
    render();
  }
  if (mode) {
    state.mode = mode.dataset.mode;
    state.limit = 12;
    render();
  }
  if (source) {
    state.source = source.dataset.source;
    state.limit = 12;
    render();
  }
  if (view) {
    state.view = view.dataset.view;
    try {
      localStorage.setItem(viewKey, state.view);
    } catch {}
    render();
  }
  if (save) {
    const id = save.dataset.save;
    saved.has(id) ? saved.delete(id) : saved.add(id);
    try {
      localStorage.setItem("reading-room-saved", JSON.stringify([...saved]));
    } catch {}
    render();
    [...document.querySelectorAll("[data-save]")]
      .find((b) => b.dataset.save === id)
      ?.focus();
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !filterBackdrop.hidden) {
    setFilterOpen(false);
    return;
  }
  if (
    e.key === "/" &&
    !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)
  ) {
    e.preventDefault();
    $("#catalog-search").focus();
  }
});
document.addEventListener(
  "error",
  (e) => {
    if (e.target.tagName === "IMG") e.target.style.visibility = "hidden";
  },
  true,
);
render();
