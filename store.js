import { parseLesson } from "./parser.js";
import { sampleAssets, sampleMarkdown } from "./sample.js";

const STORAGE_KEY = "premium-arabic-lesson-viewer:v1";

export function createInitialState() {
  const persisted = loadPersisted();
  const markdown = persisted?.markdown || sampleMarkdown;
  const assets = persisted?.assets || sampleAssets;
  const { lesson, validation } = parseLesson(markdown, assets, persisted?.assetWarnings || []);
  const firstSection = lesson.sections[0];
  const firstItem = firstSection?.items[0];

  return {
    mode: persisted?.mode || "builder",
    markdown,
    assets,
    assetWarnings: persisted?.assetWarnings || [],
    lesson,
    validation,
    activeSectionId: persisted?.activeSectionId || firstSection?.id || "",
    activeItemId: persisted?.activeItemId || firstItem?.id || "",
    focusMode: false,
    sidebarOpen: true,
    revealedTranslations: persisted?.revealedTranslations || {},
    revealedImages: persisted?.revealedImages || {},
    studiedItems: persisted?.studiedItems || {},
    importing: false,
    toast: ""
  };
}

export function persistState(state) {
  const payload = {
    mode: state.mode,
    markdown: state.markdown,
    assets: state.assets,
    assetWarnings: state.assetWarnings,
    activeSectionId: state.activeSectionId,
    activeItemId: state.activeItemId,
    revealedTranslations: state.revealedTranslations,
    revealedImages: state.revealedImages,
    studiedItems: state.studiedItems
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...payload, assets: {} }));
    } catch {
      // Storage can be unavailable or too small for large imported images.
    }
  }
}

export function resetPersistedState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore blocked storage.
  }
}

function loadPersisted() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}
