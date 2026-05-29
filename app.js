import { createStandaloneHtml } from "./exporter.js";
import { icon } from "./icons.js";
import { escapeHtml, getAllItems, getItemImageAsset, normalizeAssetName, parseLesson } from "./parser.js";
import { createInitialState, persistState, resetPersistedState } from "./store.js";

const app = document.getElementById("app");
let state = createInitialState();
let editorDebounce = 0;
let toastTimer = 0;

function setState(patch, options = {}) {
  state = { ...state, ...patch };
  reconcileActivePointers();
  persistState(state);
  render(options);
}

function reconcileActivePointers() {
  const items = getAllItems(state.lesson);
  if (!items.length) return;
  if (!items.some((item) => item.id === state.activeItemId)) {
    state.activeItemId = items[0].id;
    state.activeSectionId = items[0].sectionId;
  }
  if (!state.activeSectionId || !state.lesson.sections.some((section) => section.id === state.activeSectionId)) {
    state.activeSectionId = items[0].sectionId;
  }
}

function derive(markdown = state.markdown, assets = state.assets, assetWarnings = state.assetWarnings) {
  return parseLesson(markdown, assets, assetWarnings);
}

function activeItem() {
  return getAllItems(state.lesson).find((item) => item.id === state.activeItemId) || getAllItems(state.lesson)[0] || null;
}

function progressPercent() {
  const total = getAllItems(state.lesson).length;
  if (!total) return 0;
  return Math.round((Object.values(state.studiedItems).filter(Boolean).length / total) * 100);
}

function sectionProgress(section) {
  if (!section.items.length) return 0;
  const studied = section.items.filter((item) => state.studiedItems[item.id]).length;
  return Math.round((studied / section.items.length) * 100);
}

function typeLabel(type) {
  return {
    vocab: "Vocabulary",
    dialogue: "Dialogue",
    example: "Example",
    question: "Question",
    reading: "Reading",
    listening: "Listening"
  }[type] || type;
}

function showToast(message) {
  clearTimeout(toastTimer);
  state.toast = message;
  render();
  toastTimer = setTimeout(() => setState({ toast: "" }), 2600);
}

function parseCurrentMarkdown(markdown = state.markdown) {
  const { lesson, validation } = derive(markdown, state.assets, state.assetWarnings);
  setState({ markdown, lesson, validation }, { preserveEditor: true });
}

async function handleFiles(fileList) {
  const files = [...fileList];
  if (!files.length) return;

  setState({ importing: true });
  const assets = { ...state.assets };
  const warnings = [];
  let markdown = state.markdown;

  for (const file of files) {
    if (file.type.startsWith("image/")) {
      const key = normalizeAssetName(file.name);
      if (assets[key]) warnings.push({ line: 0, message: `Image "${file.name}" replaced an existing asset with the same filename.` });
      assets[key] = {
        filename: file.name,
        mime: file.type || "image/*",
        size: file.size,
        dataUrl: await readFileAsDataUrl(file)
      };
      continue;
    }

    if (/(\.md|\.markdown|\.txt)$/i.test(file.name) || file.type.startsWith("text/")) {
      markdown = await readFileAsText(file);
    }
  }

  const { lesson, validation } = parseLesson(markdown, assets, warnings);
  setState({ markdown, assets, assetWarnings: warnings, lesson, validation, importing: false }, { preserveEditor: true });
  showToast("Lesson assets imported");
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function exportLesson() {
  if (state.validation.errors.length) {
    showToast("Resolve parser errors before export");
    return;
  }
  const html = createStandaloneHtml(state.lesson, state.assets);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${state.lesson.title.toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]+/gi, "-").replace(/^-+|-+$/g, "") || "arabic-lesson"}.html`;
  anchor.click();
  URL.revokeObjectURL(url);
  showToast("Standalone lesson exported");
}

function moveCard(delta) {
  const items = getAllItems(state.lesson);
  const index = Math.max(0, items.findIndex((item) => item.id === state.activeItemId));
  const next = items[Math.max(0, Math.min(items.length - 1, index + delta))];
  if (!next) return;
  setState({
    activeItemId: next.id,
    activeSectionId: next.sectionId,
    studiedItems: { ...state.studiedItems, [next.id]: true }
  });
  requestAnimationFrame(() => document.querySelector(`[data-card-id="${CSS.escape(next.id)}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" }));
}

function reveal(kind, itemId) {
  if (kind === "translation") {
    setState({ revealedTranslations: { ...state.revealedTranslations, [itemId]: !state.revealedTranslations[itemId] } });
  } else {
    setState({ revealedImages: { ...state.revealedImages, [itemId]: !state.revealedImages[itemId] } });
  }
}

function selectItem(itemId) {
  const item = getAllItems(state.lesson).find((candidate) => candidate.id === itemId);
  if (!item) return;
  setState({ activeItemId: item.id, activeSectionId: item.sectionId, studiedItems: { ...state.studiedItems, [item.id]: true } });
  requestAnimationFrame(() => document.querySelector(`[data-card-id="${CSS.escape(item.id)}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" }));
}

function selectSection(sectionId) {
  const section = state.lesson.sections.find((candidate) => candidate.id === sectionId);
  const first = section?.items[0];
  setState({ activeSectionId: sectionId, activeItemId: first?.id || state.activeItemId });
  requestAnimationFrame(() => document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" }));
}

function resetApp() {
  resetPersistedState();
  state = createInitialState();
  render();
  showToast("Sample lesson restored");
}

function renderTopNav() {
  return `<header class="top-nav">
    <button class="brand-button" data-action="set-mode" data-mode="viewer" aria-label="Open viewer">
      <span class="brand-mark" aria-hidden="true">ع</span>
      <span class="brand-copy"><strong>Arabic Lesson Atelier</strong><small>Jordanian acquisition studio</small></span>
    </button>
    <nav class="mode-switch" aria-label="Application mode">
      <button class="${state.mode === "builder" ? "is-active" : ""}" data-action="set-mode" data-mode="builder">${icon("layers")} Builder</button>
      <button class="${state.mode === "viewer" ? "is-active" : ""}" data-action="set-mode" data-mode="viewer">${icon("book")} Viewer</button>
    </nav>
    <div class="top-actions">
      <button class="icon-button" data-action="toggle-sidebar" aria-label="Toggle sidebar">${icon("panel")}</button>
      <button class="premium-button" data-action="export" ${state.validation.errors.length ? "disabled" : ""}>${icon("download")} Export</button>
      <button class="icon-button focus-trigger" data-action="toggle-focus" aria-label="Toggle focus mode">${icon("focus")}</button>
    </div>
  </header>`;
}

function renderBuilder() {
  return `<main class="builder-view" aria-label="Lesson builder">
    <section class="authoring-surface">
      <div class="section-kicker">${icon("sparkles")} Builder Mode</div>
      <div class="builder-title-row">
        <div>
          <h1>Lesson authoring, refined.</h1>
          <p>Structure Arabic input, map local images by filename, validate the lesson, then export a portable viewer.</p>
        </div>
        <div class="builder-metrics" aria-label="Lesson metrics">
          <span><strong>${state.validation.stats.sections}</strong> sections</span>
          <span><strong>${state.validation.stats.items}</strong> items</span>
          <span><strong>${state.validation.stats.imagesResolved}/${state.validation.stats.imagesReferenced}</strong> images</span>
        </div>
      </div>
      <div class="import-dropzone ${state.importing ? "is-loading" : ""}" data-action="dropzone" tabindex="0">
        <input id="markdown-file" class="sr-only" type="file" accept=".md,.markdown,.txt,text/*" />
        <input id="image-files" class="sr-only" type="file" accept="image/*" multiple />
        <div class="drop-visual">${icon("upload")}</div>
        <div><strong>${state.importing ? "Importing..." : "Drop markdown or images"}</strong><span>Filename image references stay portable in export.</span></div>
        <div class="drop-actions">
          <button class="soft-button" data-action="pick-markdown">${icon("file")} Markdown</button>
          <button class="soft-button" data-action="pick-images">${icon("image")} Images</button>
        </div>
      </div>
      <label class="editor-label" for="markdown-source">Markdown lesson source</label>
      <textarea id="markdown-source" class="markdown-editor" spellcheck="false">${escapeHtml(state.markdown)}</textarea>
    </section>
    <aside class="builder-side">
      ${renderValidationPanel()}
      ${renderAssetPanel()}
      <div class="utility-panel">
        <button class="premium-button full" data-action="export" ${state.validation.errors.length ? "disabled" : ""}>${icon("download")} Export Standalone Lesson</button>
        <button class="soft-button full" data-action="reset">${icon("sparkles")} Restore Sample</button>
      </div>
    </aside>
    <section class="builder-preview" aria-label="Lesson preview">
      ${renderLessonHeader("preview")}
      ${state.lesson.sections.map((section) => renderViewerSection(section, true)).join("")}
    </section>
  </main>`;
}

function renderValidationPanel() {
  const errors = state.validation.errors;
  const warnings = state.validation.warnings;
  const statusClass = errors.length ? "danger" : warnings.length ? "warn" : "ok";
  return `<section class="glass-panel validation-panel ${statusClass}">
    <div class="panel-heading"><span>${icon(errors.length ? "alert" : "check")}</span><div><h2>Parser Validation</h2><p>${errors.length ? `${errors.length} issue${errors.length === 1 ? "" : "s"} blocking export` : warnings.length ? `${warnings.length} warning${warnings.length === 1 ? "" : "s"} to review` : "Clean lesson package"}</p></div></div>
    <div class="validation-list">
      ${[...errors.map((item) => ({ ...item, kind: "Error" })), ...warnings.map((item) => ({ ...item, kind: "Warning" }))]
        .map((item) => `<div class="validation-item ${item.kind.toLowerCase()}"><strong>${item.kind}${item.line ? ` · line ${item.line}` : ""}</strong><span>${escapeHtml(item.message)}</span></div>`)
        .join("") || `<div class="validation-empty">Ready for export.</div>`}
    </div>
  </section>`;
}

function renderAssetPanel() {
  const assets = Object.values(state.assets);
  return `<section class="glass-panel asset-panel">
    <div class="panel-heading"><span>${icon("image")}</span><div><h2>Image Registry</h2><p>${assets.length} imported asset${assets.length === 1 ? "" : "s"}</p></div></div>
    <div class="asset-grid">
      ${assets.map((asset) => `<figure class="asset-tile"><img src="${asset.dataUrl}" alt="${escapeHtml(asset.filename)}" loading="lazy"><figcaption>${escapeHtml(asset.filename)}</figcaption></figure>`).join("") || `<div class="empty-state">No local images imported yet.</div>`}
    </div>
  </section>`;
}

function renderLessonHeader(context = "viewer") {
  const percent = progressPercent();
  return `<section class="lesson-hero ${context}">
    <div class="hero-copy">
      <span class="section-kicker">${icon("command")} ${context === "preview" ? "Live Preview" : "Viewer Mode"}</span>
      <h1>${escapeHtml(state.lesson.title)}</h1>
      <p>${state.lesson.sections.length} sections · ${getAllItems(state.lesson).length} learning items · Jordanian Arabic A1-C2 ready</p>
    </div>
    <div class="progress-orbit" aria-label="${percent}% complete">
      <svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="48"></circle><circle cx="60" cy="60" r="48" style="stroke-dashoffset:${302 - (302 * percent) / 100}"></circle></svg>
      <strong>${percent}%</strong>
    </div>
  </section>`;
}

function renderViewer() {
  return `<main class="viewer-view ${state.sidebarOpen ? "sidebar-open" : ""}">
    <aside class="lesson-sidebar" aria-label="Lesson navigation">
      <div class="sidebar-inner">
        <div class="sidebar-top">
          <span class="section-kicker">${icon("layers")} Sections</span>
          <button class="icon-button" data-action="toggle-sidebar" aria-label="Collapse sidebar">${icon("x")}</button>
        </div>
        <div class="sidebar-progress"><strong>${progressPercent()}%</strong><span>complete</span><div class="mini-progress"><span style="width:${progressPercent()}%"></span></div></div>
        <nav class="section-nav">
          ${state.lesson.sections.map((section) => `<button class="${section.id === state.activeSectionId ? "is-active" : ""}" data-action="select-section" data-id="${section.id}">
            <span>${escapeHtml(section.title)}</span><small>${sectionProgress(section)}%</small>
          </button>`).join("")}
        </nav>
      </div>
    </aside>
    <section class="lesson-content" aria-label="Lesson content">
      ${renderLessonHeader()}
      ${state.lesson.sections.map((section) => renderViewerSection(section)).join("")}
    </section>
  </main>
  ${renderMobileDock()}`;
}

function renderViewerSection(section, compact = false) {
  return `<section class="lesson-section" id="${section.id}">
    <div class="section-heading">
      <span>${String(section.index).padStart(2, "0")}</span>
      <div><h2>${escapeHtml(section.title)}</h2>${section.intro ? `<p>${escapeHtml(section.intro)}</p>` : ""}</div>
    </div>
    <div class="lesson-card-grid ${compact ? "compact" : ""}">
      ${section.items.map((item) => renderLearningCard(item, compact)).join("")}
    </div>
  </section>`;
}

function metadataChips(item) {
  const keys = ["cefr", "dialect", "topic", "function", "root", "frequency"];
  const visible = keys.filter((key) => item[key]);
  return visible.map((key) => `<span class="meta-chip ${key}">${escapeHtml(item[key])}</span>`).join("");
}

function renderLearningCard(item, compact = false) {
  const translationOpen = !!state.revealedTranslations[item.id];
  const imageOpen = !!state.revealedImages[item.id];
  const asset = getItemImageAsset(item, state.assets);
  const active = item.id === state.activeItemId;
  return `<article class="learning-card type-${item.type} ${active ? "is-active" : ""} ${state.studiedItems[item.id] ? "is-studied" : ""}" data-card-id="${item.id}">
    <button class="card-focus-target" data-action="select-item" data-id="${item.id}" aria-label="Select ${escapeHtml(typeLabel(item.type))} card"></button>
    <div class="card-topline">
      <span class="type-pill">${typeLabel(item.type)}</span>
      <div class="chip-row">${metadataChips(item)}</div>
    </div>
    <p class="arabic-line" lang="ar" dir="rtl">${escapeHtml(item.arabic)}</p>
    ${item.transliteration ? `<p class="transliteration">${escapeHtml(item.transliteration)}</p>` : ""}
    <div class="learning-actions">
      <button class="reveal-button" data-action="toggle-translation" data-id="${item.id}" aria-expanded="${translationOpen}">${icon(translationOpen ? "eyeOff" : "eye")} ${translationOpen ? "Hide Translation" : "Show Translation"}</button>
      ${asset ? `<button class="reveal-button" data-action="toggle-image" data-id="${item.id}" aria-expanded="${imageOpen}">${icon(imageOpen ? "eyeOff" : "image")} ${imageOpen ? "Hide Image" : "Show Image"}</button>` : ""}
      <button class="mark-button" data-action="toggle-studied" data-id="${item.id}" aria-pressed="${!!state.studiedItems[item.id]}">${icon("check")} ${state.studiedItems[item.id] ? "Studied" : "Mark Studied"}</button>
    </div>
    <div class="reveal-region ${translationOpen ? "is-open" : ""}" id="translation-${item.id}">
      <div><p class="translation-line">${escapeHtml(item.translation)}</p></div>
    </div>
    ${asset ? `<div class="reveal-region media-region ${imageOpen ? "is-open" : ""}" id="image-${item.id}">
      <div>
        <figure class="image-reveal">
          <img src="${asset.dataUrl}" alt="${escapeHtml(item.image || item.arabic)}" loading="lazy">
          <figcaption>${escapeHtml(item.notes || item.image || item.arabic)}</figcaption>
        </figure>
      </div>
    </div>` : ""}
    ${!compact && (item.notes || item.grammar) ? `<div class="pedagogy-notes">${item.grammar ? `<span>Grammar: ${escapeHtml(item.grammar)}</span>` : ""}${item.notes ? `<span>Notes: ${escapeHtml(item.notes)}</span>` : ""}</div>` : ""}
  </article>`;
}

function renderFocusOverlay() {
  const item = activeItem();
  if (!state.focusMode || !item) return "";
  const items = getAllItems(state.lesson);
  const index = items.findIndex((candidate) => candidate.id === item.id);
  return `<section class="focus-overlay" role="dialog" aria-modal="true" aria-label="Focus mode">
    <div class="focus-light"></div>
    <header class="focus-header">
      <div><span class="section-kicker">${icon("focus")} Focus</span><strong>${escapeHtml(state.lesson.title)}</strong></div>
      <button class="icon-button" data-action="toggle-focus" aria-label="Exit focus mode">${icon("x")}</button>
    </header>
    <div class="focus-stage">
      ${renderLearningCard(item)}
    </div>
    <footer class="focus-footer">
      <button class="premium-button" data-action="prev-card">${icon("arrowLeft")} Previous</button>
      <div class="focus-progress"><span>${index + 1}</span><div><span style="width:${((index + 1) / items.length) * 100}%"></span></div><span>${items.length}</span></div>
      <button class="premium-button" data-action="next-card">Next ${icon("arrowRight")}</button>
    </footer>
  </section>`;
}

function renderMobileDock() {
  return `<nav class="mobile-dock" aria-label="Mobile lesson controls">
    <button data-action="toggle-sidebar">${icon("menu")} Sections</button>
    <button data-action="prev-card">${icon("arrowLeft")} Prev</button>
    <button data-action="toggle-focus">${icon("focus")} Focus</button>
    <button data-action="next-card">Next ${icon("arrowRight")}</button>
  </nav>`;
}

function renderToast() {
  return state.toast ? `<div class="toast" role="status">${escapeHtml(state.toast)}</div>` : "";
}

function render(options = {}) {
  const editor = document.getElementById("markdown-source");
  const selection = options.preserveEditor && editor && document.activeElement === editor
    ? { start: editor.selectionStart, end: editor.selectionEnd, scrollTop: editor.scrollTop }
    : null;

  app.innerHTML = `${renderTopNav()}${state.mode === "builder" ? renderBuilder() : renderViewer()}${renderFocusOverlay()}${renderToast()}`;
  bindInputs();

  if (selection) {
    const nextEditor = document.getElementById("markdown-source");
    if (nextEditor) {
      nextEditor.focus();
      nextEditor.setSelectionRange(selection.start, selection.end);
      nextEditor.scrollTop = selection.scrollTop;
    }
  }
}

function bindInputs() {
  document.getElementById("markdown-file")?.addEventListener("change", (event) => handleFiles(event.target.files));
  document.getElementById("image-files")?.addEventListener("change", (event) => handleFiles(event.target.files));
  const editor = document.getElementById("markdown-source");
  editor?.addEventListener("input", (event) => {
    const value = event.target.value;
    clearTimeout(editorDebounce);
    editorDebounce = setTimeout(() => parseCurrentMarkdown(value), 180);
  });
}

app.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;
  const id = target.dataset.id;

  if (action === "set-mode") setState({ mode: target.dataset.mode });
  if (action === "toggle-sidebar") setState({ sidebarOpen: !state.sidebarOpen });
  if (action === "toggle-focus") setState({ focusMode: !state.focusMode, mode: "viewer" });
  if (action === "pick-markdown") document.getElementById("markdown-file")?.click();
  if (action === "pick-images") document.getElementById("image-files")?.click();
  if (action === "export") exportLesson();
  if (action === "reset") resetApp();
  if (action === "toggle-translation") reveal("translation", id);
  if (action === "toggle-image") reveal("image", id);
  if (action === "toggle-studied") setState({ studiedItems: { ...state.studiedItems, [id]: !state.studiedItems[id] } });
  if (action === "select-item") selectItem(id);
  if (action === "select-section") selectSection(id);
  if (action === "next-card") moveCard(1);
  if (action === "prev-card") moveCard(-1);
});

app.addEventListener("dragover", (event) => {
  if (event.target.closest(".import-dropzone")) {
    event.preventDefault();
    event.target.closest(".import-dropzone").classList.add("is-dragging");
  }
});

app.addEventListener("dragleave", (event) => {
  event.target.closest(".import-dropzone")?.classList.remove("is-dragging");
});

app.addEventListener("drop", (event) => {
  const zone = event.target.closest(".import-dropzone");
  if (!zone) return;
  event.preventDefault();
  zone.classList.remove("is-dragging");
  handleFiles(event.dataTransfer.files);
});

document.addEventListener("keydown", (event) => {
  if (["TEXTAREA", "INPUT", "SELECT"].includes(document.activeElement?.tagName)) return;
  if (event.key === "Escape" && state.focusMode) setState({ focusMode: false });
  if (event.key === "ArrowRight" || event.key === "ArrowDown" || (state.focusMode && event.key === " ")) {
    event.preventDefault();
    moveCard(1);
  }
  if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
    event.preventDefault();
    moveCard(-1);
  }
  if (event.key.toLowerCase() === "t" && activeItem()) reveal("translation", activeItem().id);
  if (event.key.toLowerCase() === "i" && activeItem() && getItemImageAsset(activeItem(), state.assets)) reveal("image", activeItem().id);
});

let touchStartX = 0;
let touchStartY = 0;
document.addEventListener("touchstart", (event) => {
  touchStartX = event.changedTouches[0].clientX;
  touchStartY = event.changedTouches[0].clientY;
}, { passive: true });

document.addEventListener("touchend", (event) => {
  if (!state.focusMode) return;
  const dx = event.changedTouches[0].clientX - touchStartX;
  const dy = event.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) > 54 && Math.abs(dx) > Math.abs(dy)) moveCard(dx < 0 ? 1 : -1);
}, { passive: true });

render();
