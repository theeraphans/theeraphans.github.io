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
  topic: "All",
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
const sidebarKey = "reading-room-sidebar-collapsed";
const sidebarToggle = $("#sidebar-toggle");
const sidebarReveal = $("#sidebar-reveal");
const sidebar = $("#library-sidebar");
const filterToggle = $("#filter-toggle");
let sidebarCollapsed = false;

try {
  sidebarCollapsed = window.matchMedia("(max-width: 700px)").matches
    ? true
    : localStorage.getItem(sidebarKey) === "true";
} catch {}

function setSidebarCollapsed(collapsed, persist = true) {
  sidebarCollapsed = collapsed;
  document.body.classList.toggle("sidebar-collapsed", collapsed);
  sidebar.inert = collapsed;
  sidebar.setAttribute("aria-hidden", String(collapsed));
  sidebarToggle.setAttribute("aria-expanded", String(!collapsed));
  sidebarToggle.setAttribute(
    "aria-label",
    collapsed ? "Expand sidebar" : "Collapse sidebar",
  );
  sidebarToggle.setAttribute(
    "title",
    collapsed ? "Expand sidebar" : "Collapse sidebar",
  );
  sidebarReveal.setAttribute("aria-expanded", String(!collapsed));
  filterToggle.setAttribute("aria-expanded", String(!collapsed));
  if (persist) {
    try {
      localStorage.setItem(sidebarKey, String(collapsed));
    } catch {}
  }
}

sidebarToggle.addEventListener("click", () => {
  setSidebarCollapsed(!sidebarCollapsed);
});
sidebarReveal.addEventListener("click", () => {
  setSidebarCollapsed(false);
  sidebarToggle.focus();
});
setSidebarCollapsed(sidebarCollapsed, false);

filterToggle.addEventListener("click", () => {
  setSidebarCollapsed(false);
  $("#topics").focus();
});

$("#total").textContent = catalog.length;
const topics = [...new Set(catalog.map((i) => i.category))].sort();
$("#topics").tabIndex = -1;
$("#topics").innerHTML = topics
  .map((t) => `<button class="topic" data-topic="${esc(t)}">${esc(t)}</button>`)
  .join("");
function render() {
  let items = catalog.filter(
    (i) =>
      (state.mode !== "saved" || saved.has(key(i))) &&
      (state.topic === "All" || i.category === state.topic) &&
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
  $("#active-topic").textContent = state.topic === "All" ? "" : state.topic;
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
    b.classList.toggle("active", b.dataset.mode === state.mode);
    b.setAttribute("aria-pressed", b.dataset.mode === state.mode);
  });
  document.querySelectorAll("[data-topic]").forEach((b) => {
    b.classList.toggle("active", b.dataset.topic === state.topic);
    b.setAttribute("aria-pressed", b.dataset.topic === state.topic);
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
    topic: "All",
    source: "all",
    query: "",
    limit: 12,
  });
  $("#catalog-search").value = "";
  render();
});
document.addEventListener("click", (e) => {
  const topic = e.target.closest("[data-topic]"),
    mode = e.target.closest("[data-mode]"),
    source = e.target.closest("[data-source]"),
    view = e.target.closest(".view-button[data-view]"),
    save = e.target.closest("[data-save]");
  if (topic) {
    state.topic =
      state.topic === topic.dataset.topic ? "All" : topic.dataset.topic;
    state.limit = 12;
    render();
    if (window.matchMedia("(max-width: 700px)").matches) {
      setSidebarCollapsed(true);
    }
  }
  if (mode) {
    state.mode = mode.dataset.mode;
    state.topic = "All";
    state.limit = 12;
    render();
    if (window.matchMedia("(max-width: 700px)").matches) {
      setSidebarCollapsed(true);
    }
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
  if (e.key === "Escape" && !sidebarCollapsed) {
    setSidebarCollapsed(true);
    sidebarReveal.focus();
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
