export const ITEM_TYPES = ["vocab", "dialogue", "example", "question", "reading", "listening"];
export const METADATA_KEYS = ["image", "audio", "cefr", "dialect", "transliteration", "notes", "grammar", "topic", "function", "root", "frequency"];

export function normalizeAssetName(name = "") {
  return String(name).trim().replace(/^\.?[\\/]+/, "").toLowerCase();
}

export function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function getAllItems(lesson) {
  return lesson.sections.flatMap((section) => section.items);
}

export function getItemImageAsset(item, assets) {
  if (!item?.image) return null;
  return assets[normalizeAssetName(item.image)] || null;
}

function slugify(value, fallback) {
  const slug = String(value || "")
    .normalize("NFKD")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return slug || fallback;
}

function hash(value) {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) h = Math.imul(31, h) + value.charCodeAt(i) | 0;
  return Math.abs(h).toString(36);
}

function parseMetadata(raw, lineNumber, validation) {
  const metadata = {};
  for (const part of raw) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) {
      validation.warnings.push({
        line: lineNumber,
        message: `Metadata "${trimmed}" is ignored because it is missing =.`
      });
      continue;
    }
    const key = trimmed.slice(0, index).trim().toLowerCase();
    const value = trimmed.slice(index + 1).trim();
    if (!METADATA_KEYS.includes(key)) {
      validation.warnings.push({
        line: lineNumber,
        message: `Unknown metadata key "${key}" is preserved as notes.`
      });
      metadata.notes = metadata.notes ? `${metadata.notes}; ${key}=${value}` : `${key}=${value}`;
      continue;
    }
    metadata[key] = value;
  }
  return metadata;
}

function parseItemLine(line, lineNumber, section, validation) {
  const body = line.replace(/^\s*-\s*/, "");
  const match = body.match(/^\*\*([^*]+)\*\*\s*(?:—|–|-)\s*([\s\S]+?)\s*(?:—|–|-)\s*([\s\S]+)$/u);

  if (!match) {
    validation.errors.push({
      line: lineNumber,
      message: "Lesson item is malformed. Use: - **vocab** — Arabic — Translation | key=value"
    });
    return null;
  }

  const type = match[1].trim().toLowerCase();
  const arabic = match[2].trim();
  const translationAndMeta = match[3].split("|").map((part) => part.trim());
  const translation = translationAndMeta.shift() || "";
  const metadata = parseMetadata(translationAndMeta, lineNumber, validation);

  if (!ITEM_TYPES.includes(type)) {
    validation.errors.push({
      line: lineNumber,
      message: `Unknown item type "${type}". Allowed types: ${ITEM_TYPES.join(", ")}.`
    });
  }

  if (!arabic || !translation) {
    validation.errors.push({
      line: lineNumber,
      message: "Lesson item must include Arabic text and an English translation."
    });
  }

  const item = {
    id: `item-${section.index}-${section.items.length + 1}-${hash(`${type}:${arabic}:${translation}`)}`,
    sectionId: section.id,
    type,
    arabic,
    translation,
    audio: "",
    image: "",
    cefr: "",
    dialect: "",
    transliteration: "",
    notes: "",
    grammar: "",
    topic: "",
    function: "",
    root: "",
    frequency: "",
    ...metadata
  };

  return item;
}

export function parseLesson(markdown, assets = {}, assetWarnings = []) {
  const validation = {
    errors: [],
    warnings: [...assetWarnings],
    stats: { sections: 0, items: 0, imagesReferenced: 0, imagesResolved: 0 }
  };

  const lesson = {
    id: `lesson-${hash(markdown || "empty")}`,
    title: "Untitled Arabic Lesson",
    description: "",
    sections: [],
    createdAt: new Date().toISOString()
  };

  let currentSection = null;
  const lines = String(markdown || "").replace(/\r\n/g, "\n").split("\n");

  function ensureSection(name = "Core Lesson", lineNumber = 1) {
    if (currentSection) return currentSection;
    const id = `section-${lesson.sections.length + 1}-${slugify(name, "core")}`;
    currentSection = { id, index: lesson.sections.length + 1, title: name, intro: "", items: [] };
    lesson.sections.push(currentSection);
    if (lineNumber > 1) {
      validation.warnings.push({ line: lineNumber, message: "Content before the first section was moved into Core Lesson." });
    }
    return currentSection;
  }

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmed = line.trim();
    if (!trimmed) return;

    if (/^#\s+/.test(trimmed) && !/^##\s+/.test(trimmed)) {
      lesson.title = trimmed.replace(/^#\s+/, "").trim() || lesson.title;
      return;
    }

    if (/^##\s+/.test(trimmed)) {
      const title = trimmed.replace(/^##\s+/, "").trim() || `Section ${lesson.sections.length + 1}`;
      const id = `section-${lesson.sections.length + 1}-${slugify(title, `section-${lesson.sections.length + 1}`)}`;
      currentSection = { id, index: lesson.sections.length + 1, title, intro: "", items: [] };
      lesson.sections.push(currentSection);
      return;
    }

    if (/^\s*-\s+/.test(line)) {
      const section = ensureSection("Core Lesson", lineNumber);
      const item = parseItemLine(line, lineNumber, section, validation);
      if (item) section.items.push(item);
      return;
    }

    const section = ensureSection("Core Lesson", lineNumber);
    section.intro = section.intro ? `${section.intro}\n${trimmed}` : trimmed;
  });

  validation.stats.sections = lesson.sections.length;
  validation.stats.items = getAllItems(lesson).length;

  const referenced = new Set();
  for (const item of getAllItems(lesson)) {
    if (!item.image) continue;
    validation.stats.imagesReferenced += 1;
    referenced.add(normalizeAssetName(item.image));
    if (assets[normalizeAssetName(item.image)]) {
      validation.stats.imagesResolved += 1;
    } else {
      validation.warnings.push({
        line: 0,
        message: `Image "${item.image}" is referenced but has not been imported.`
      });
    }
  }

  for (const section of lesson.sections) {
    if (!section.items.length) {
      validation.warnings.push({ line: 0, message: `Section "${section.title}" has no learning items.` });
    }
  }

  if (!validation.stats.items) {
    validation.errors.push({ line: 0, message: "Lesson has no learning items." });
  }

  lesson.sections = lesson.sections.filter((section) => section.intro || section.items.length);
  return { lesson, validation, referencedImages: [...referenced] };
}
