# Development Guide

This guide is for humans and AI agents improving the Premium Arabic Lesson Viewer. Read it before editing the project. The goal is to make enhancements without breaking lesson parsing, image mapping, export portability, GitHub Pages deployment, or the premium learning experience.

## First Principles

Preserve these product invariants:

- The app is static, client-side only, and GitHub Pages compatible.
- `index.html` must work when served from the repository root.
- The app has two modes: Builder and Viewer.
- The pedagogical item types remain exactly `vocab`, `dialogue`, `example`, `question`, `reading`, and `listening`.
- Additional educational meaning should use metadata, not new visual item types.
- `image=filename.ext` resolves through filename lookup in the imported asset registry.
- The **Show Image** button appears only when a real image asset is available for that item.
- Exported lessons must be standalone HTML files with embedded data and embedded image assets.
- Arabic text must remain readable, elegant, RTL-aware, and mobile-safe.
- Keyboard navigation, reduced-motion support, focus states, and accessible labels should not be removed.

## Change Priority

When improving the project, use this order:

1. Protect data compatibility: parser, lesson model, image registry, and export payload.
2. Protect the learning workflow: Builder import -> validation -> preview -> export -> Viewer study.
3. Protect accessibility and mobile usability.
4. Improve UI polish, animation, and visual hierarchy.
5. Refactor only when the new structure makes future changes safer.

Avoid changing parser syntax, lesson object shape, localStorage keys, or export HTML shape casually. Those are compatibility surfaces.

## High-Level Architecture

The app uses browser-native ES modules:

```text
index.html
  loads src/styles.css
  loads src/app.js as a module

src/app.js
  imports parser, exporter, icons, and store
  owns UI rendering and browser interactions

src/parser.js
  converts lesson markdown into normalized lesson data
  produces validation errors and warnings

src/store.js
  initializes state from localStorage or sample data
  persists user state and imported assets

src/exporter.js
  creates standalone exported lesson HTML
  embeds only image assets used by the lesson

src/styles.css
  implements the complete design system and responsive UI

.nojekyll
  tells GitHub Pages to serve this static app directly without Jekyll processing
```

There is no bundler. Keep imports browser-compatible and relative.

## Data Model

The parser returns:

```js
{
  lesson,
  validation,
  referencedImages
}
```

The lesson object contains:

```js
{
  id,
  title,
  description,
  sections,
  createdAt
}
```

Each section contains:

```js
{
  id,
  index,
  title,
  intro,
  items
}
```

Each item contains:

```js
{
  id,
  sectionId,
  type,
  arabic,
  translation,
  image,
  audio,
  cefr,
  dialect,
  transliteration,
  notes,
  grammar,
  topic,
  function,
  root,
  frequency
}
```

Keep this model stable unless you also update parser tests, export behavior, rendering, local persistence, and this guide.

## File-By-File Guide

### `index.html`

Purpose:

- Browser entry point.
- Loads hosted fonts, CSS, and the JavaScript module app.
- Provides the root `<div id="app">`.

Important parts:

- `<html lang="en" dir="ltr">`: the app shell is LTR, while Arabic learning text is rendered with explicit `lang="ar"` and `dir="rtl"`.
- Font links: load Inter, IBM Plex Sans Arabic, and Noto Sans Arabic.
- `./src/styles.css`: all app styling lives here.
- `./src/app.js`: main app module.

Safe changes:

- Update title or metadata.
- Add social preview metadata.
- Add a favicon.

Risky changes:

- Moving `index.html` away from the repository root can break GitHub Pages.
- Changing script paths without moving files consistently will break the app.
- Removing Arabic font links will degrade typography.

### `package.json`

Purpose:

- Documents project metadata and local scripts.

Important parts:

- `"type": "module"` enables ES module syntax in Node scripts.
- `"dev": "node server.mjs"` starts the local static server.
- `"check": "node scripts/check.mjs"` runs parser/export validation checks.

Safe changes:

- Add metadata such as author, repository, or license.
- Add more non-mutating validation scripts.

Risky changes:

- Removing `"type": "module"` will break current Node scripts.
- Adding build tooling changes the deployment model; document it if introduced.

### `.nojekyll`

Purpose:

- Disables Jekyll processing on GitHub Pages.
- Helps GitHub Pages serve the app as a direct static file tree.

Safe changes:

- Leave it empty.

Risky changes:

- Removing it can still work for this repo today, but keeping it reduces deployment surprises if future files or folders use names that Jekyll treats specially.

### `server.mjs`

Purpose:

- Lightweight local static server for development.
- Serves `index.html`, `src/`, scripts, and static files.
- Falls back to `index.html` for unknown paths.

Important parts:

- `root = resolve(".")`: serves the current repository folder.
- `port = Number(process.env.PORT || 4173)`: default local URL is `http://localhost:4173`.
- `types`: MIME type map for static assets.
- Path normalization and root check: prevents serving files outside the project folder.
- Fallback block: returns `index.html` when a path is not found.

Safe changes:

- Add MIME types for new static assets.
- Change default port if documented.

Risky changes:

- Weakening the root path check.
- Removing the fallback without testing direct navigation.

### `scripts/check.mjs`

Purpose:

- Fast validation script for parser and exporter behavior.

Important parts:

- Parses `sampleMarkdown` with `sampleAssets`.
- Asserts there are no sample parser errors.
- Confirms the sample includes all six item types.
- Confirms missing image references produce warnings.
- Confirms standalone export includes embedded payload and image data.

Safe changes:

- Add test cases for new parser warnings, metadata handling, or export behavior.
- Add regression checks before modifying parser or exporter code.

Risky changes:

- Weakening assertions to hide real compatibility failures.
- Removing image export checks.

### `src/parser.js`

Purpose:

- Converts teacher-authored markdown into normalized lesson data.
- Validates lesson structure.
- Resolves image references against the imported asset registry.

Public exports:

- `ITEM_TYPES`: the six allowed pedagogical item types.
- `METADATA_KEYS`: supported metadata keys.
- `normalizeAssetName(name)`: canonicalizes filenames for lookup.
- `escapeHtml(value)`: escapes text before rendering HTML strings.
- `getAllItems(lesson)`: flattens all section items.
- `getItemImageAsset(item, assets)`: resolves an item image to an asset object.
- `parseLesson(markdown, assets, assetWarnings)`: main parser entry point.

Internal parts:

- `slugify(value, fallback)`: creates section-safe IDs.
- `hash(value)`: creates stable-ish IDs from content.
- `parseMetadata(raw, lineNumber, validation)`: reads `key=value` metadata after `|`.
- `parseItemLine(line, lineNumber, section, validation)`: parses item rows such as `- **vocab** — تفاحة — Apple | cefr=A1`.

Compatibility rules:

- Keep the six item types exact unless intentionally versioning the lesson format.
- Keep metadata values as strings.
- Preserve unknown metadata as notes with a warning.
- Keep filename normalization consistent with imported image storage.
- Keep validation messages actionable.

Safe changes:

- Add better warnings.
- Improve malformed-line recovery.
- Add tests before changing parsing rules.

Risky changes:

- Changing item ID generation may reset saved progress.
- Changing `normalizeAssetName` may break existing image references.
- Changing row syntax may break existing lessons.

### `src/store.js`

Purpose:

- Creates the initial app state.
- Loads saved state from localStorage.
- Persists current lesson state, imported assets, reveal state, and progress.

Important parts:

- `STORAGE_KEY = "premium-arabic-lesson-viewer:v1"`: compatibility key for browser persistence.
- `createInitialState()`: uses saved state when available, otherwise the sample lesson.
- `persistState(state)`: saves important state fields, with fallback if image-heavy storage is too large.
- `resetPersistedState()`: clears saved state.
- `loadPersisted()`: internal safe JSON loader.

Safe changes:

- Add new persisted UI preferences if they have safe defaults.
- Add storage migration logic if changing state shape.

Risky changes:

- Changing `STORAGE_KEY` resets all user progress and imported assets.
- Persisting very large assets can exceed localStorage; keep the fallback behavior.

### `src/app.js`

Purpose:

- Main SPA controller.
- Owns state updates, rendering, import interactions, reveal interactions, focus mode, keyboard navigation, touch behavior, and export triggers.

State and helpers:

- `state`: current application state.
- `setState(patch, options)`: central state update path; reconciles active pointers, persists, then renders.
- `reconcileActivePointers()`: keeps active section/card valid after lesson changes.
- `derive()`: reparses markdown with current assets.
- `activeItem()`: returns selected card.
- `progressPercent()` and `sectionProgress(section)`: compute study progress.
- `typeLabel(type)`: converts item types to display labels.
- `showToast(message)`: transient status feedback.

Import and export:

- `parseCurrentMarkdown(markdown)`: updates lesson from editor text.
- `handleFiles(fileList)`: accepts markdown files and image files from picker or drag-and-drop.
- `readFileAsText(file)`: reads markdown source.
- `readFileAsDataUrl(file)`: reads image assets for registry/export.
- `exportLesson()`: creates and downloads standalone HTML via `createStandaloneHtml`.

Navigation and learning interactions:

- `moveCard(delta)`: previous/next navigation and progress marking.
- `reveal(kind, itemId)`: toggles translation or image reveal.
- `selectItem(itemId)`: selects a card and scrolls it into view.
- `selectSection(sectionId)`: selects a section and its first card.
- `resetApp()`: restores the sample lesson.

Rendering:

- `renderTopNav()`: premium app header and mode switch.
- `renderBuilder()`: authoring workspace, editor, validation, asset registry, and preview.
- `renderValidationPanel()`: parser errors and warnings.
- `renderAssetPanel()`: imported image registry.
- `renderLessonHeader(context)`: lesson title and progress orbit.
- `renderViewer()`: sidebar navigation and lesson content.
- `renderViewerSection(section, compact)`: section wrapper and card list.
- `metadataChips(item)`: visible metadata chips.
- `renderLearningCard(item, compact)`: card UI, translation reveal, image reveal, study marker, notes.
- `renderFocusOverlay()`: one-card immersive study view.
- `renderMobileDock()`: thumb-friendly mobile controls.
- `renderToast()`: status message.
- `render(options)`: full DOM render and editor selection preservation.
- `bindInputs()`: file input and markdown editor listeners after render.

Event listeners:

- App click delegation handles all `data-action` buttons.
- Drag-and-drop listeners handle markdown and image imports.
- Keyboard listener handles focus exit, card navigation, translation reveal, and image reveal.
- Touch listeners support swipe navigation in focus mode.

Safe changes:

- Add new `data-action` handlers in the central click listener.
- Improve rendering functions while preserving expected class names used by CSS.
- Add non-breaking keyboard shortcuts.
- Add UI around existing data without changing parser shape.

Risky changes:

- Replacing `setState` with direct mutation can desync persistence and rendering.
- Changing `data-action` names without updating handlers breaks controls.
- Changing CSS class names without updating `styles.css` breaks layout.
- Allowing Show Image without a resolved asset breaks the critical image behavior.

### `src/exporter.js`

Purpose:

- Generates a standalone lesson HTML file for student use.
- Embeds normalized lesson data and used image assets directly into the exported document.

Important parts:

- `safeJson(value)`: escapes JSON so it can be embedded safely in HTML.
- `exportAssetsForLesson(lesson, assets)`: includes only images referenced by lesson items.
- `createStandaloneHtml(lesson, assets)`: returns the full exported HTML string.

Exported HTML structure:

- Inline CSS for portable styling.
- `<script id="lesson-data" type="application/json">`: embedded lesson and assets payload.
- Inline viewer script: renders sections, cards, reveal controls, focus mode, progress, keyboard navigation, and touch navigation.

Compatibility rules:

- Export must not depend on the main repo after download.
- Used images must be embedded as data URLs.
- Exported viewer should not require a backend or build tool.

Safe changes:

- Improve exported visual styling.
- Add small accessibility improvements.
- Add metadata display if it uses existing item fields.

Risky changes:

- Referencing external local files from exported HTML.
- Embedding raw JSON without escaping.
- Including all imported images instead of used images can make exports unnecessarily large.

### `src/icons.js`

Purpose:

- Provides lightweight inline SVG icons without external dependencies.

Important parts:

- `attrs`: shared SVG attributes.
- `paths`: icon path registry.
- `icon(name, className)`: returns an SVG string.

Safe changes:

- Add icons to `paths`.
- Adjust icon stroke style globally if the design system changes.

Risky changes:

- Removing icons used by `app.js` will silently fall back to sparkles or change visual meaning.
- Adding unescaped dynamic SVG content would create injection risk; keep paths static.

### `src/sample.js`

Purpose:

- Provides the default sample lesson and sample image assets.
- Lets the app work immediately even before a teacher imports content.

Important parts:

- `svgDataUrl(svg)`: converts inline SVG samples to data URLs.
- `sampleAssets`: demo image registry keyed by normalized filenames.
- `sampleMarkdown`: complete lesson demonstrating all six item types and metadata.

Safe changes:

- Improve sample lesson content.
- Add better sample imagery.

Risky changes:

- Removing any item type from the sample will break the current validation script.
- Changing sample image names without updating markdown references causes image warnings.

### `src/styles.css`

Purpose:

- Complete visual system, responsive layout, motion, focus mode, and mobile controls.

Major sections:

- Root tokens: colors, shadows, radii, typography, and global theme.
- Base document styles: background, body, buttons, focus states, icons, screen-reader helpers.
- Top navigation: brand, mode switch, export button, focus/sidebar controls.
- Builder layout: authoring surface, import dropzone, markdown editor, validation, asset registry, preview.
- Viewer layout: sidebar, section navigation, lesson hero, progress orbit, sections.
- Learning cards: card surfaces, Arabic line, metadata chips, reveal controls, translation panel, image panel, notes.
- Focus overlay: immersive one-card mode and progress controls.
- Mobile dock: bottom navigation for small screens.
- Responsive breakpoints: tablet and mobile layouts.
- Reduced motion: respects `prefers-reduced-motion`.

Safe changes:

- Tune color tokens and spacing.
- Improve responsive layout after visual testing.
- Add styles for new classes introduced in `app.js`.

Risky changes:

- Removing `.reveal-region` grid animation can break translation/image reveal.
- Removing mobile dock styles harms mobile usability.
- Changing card class names without app changes breaks presentation.
- Using only one color family can make the interface feel flat and less premium.

### `README.md`

Purpose:

- Public-facing project overview.
- Explains what the project does, how it was built, how to use it, and where to find deeper docs.

Safe changes:

- Add live demo URL.
- Add screenshots.
- Add license, author, and deployment status.

Risky changes:

- Removing Codex/vibe-coding attribution if that remains an explicit project requirement.
- Removing links to development docs.

### `PROJECT_BRIEF.md`

Purpose:

- Preserves the complete Premium Arabic Lesson Viewer Rebuild plan and design intent.
- Helps future agents understand what the app is supposed to become, not just what the code currently does.

Safe changes:

- Add versioned product decisions.
- Record future roadmap items.

Risky changes:

- Editing the brief to justify a smaller or less premium product without a real product decision.

### `DEVELOPMENT_GUIDE.md`

Purpose:

- Gives future maintainers and AI agents a safe map of the codebase.
- Explains file responsibilities, internal parts, safe changes, and risky changes.

Safe changes:

- Update when code structure changes.
- Add troubleshooting notes after real bugs are fixed.

Risky changes:

- Letting the guide drift from implementation reality.
- Removing compatibility warnings around parser, export, and image mapping.

## Critical Flows

### Builder Import Flow

1. User imports markdown or images.
2. `handleFiles()` reads files.
3. Markdown text updates `state.markdown`.
4. Images become data URL assets keyed by normalized filename.
5. `parseLesson()` validates lesson text against current assets.
6. UI re-renders validation, preview, and asset registry.

Do not bypass this flow when adding import features.

### Image Reveal Flow

1. Markdown item includes `image=filename`.
2. Imported assets contain a matching normalized filename.
3. `getItemImageAsset(item, state.assets)` returns the asset.
4. `renderLearningCard()` renders **Show Image** only when an asset exists.
5. Clicking the button toggles `state.revealedImages[item.id]`.
6. `.media-region.is-open` expands the inline image viewer.

This flow is a core product requirement.

### Translation Reveal Flow

1. Every parsed item has a translation.
2. `renderLearningCard()` renders **Show Translation**.
3. Clicking toggles `state.revealedTranslations[item.id]`.
4. `.reveal-region.is-open` expands the translation panel.

Image reveal should continue to mirror this pattern.

### Export Flow

1. User clicks Export.
2. `exportLesson()` blocks export if parser errors exist.
3. `createStandaloneHtml()` receives current lesson and assets.
4. `exportAssetsForLesson()` embeds only assets referenced by lesson items.
5. Browser downloads one standalone `.html` file.

Any export change must be tested with `node scripts/check.mjs` and by opening the exported file when possible.

### Progress Flow

1. Active card changes through navigation or selection.
2. `studiedItems[item.id]` is marked.
3. Progress percentage derives from studied item count.
4. Section progress derives from studied items inside that section.

Changing item IDs can reset progress.

## AI-Agent Safe Editing Checklist

Before editing:

- Read `README.md`, `PROJECT_BRIEF.md`, and this file.
- Identify whether the change affects parser, state, rendering, export, or style only.
- Check if a compatibility surface is involved.

During editing:

- Keep changes scoped.
- Use existing data fields before adding new ones.
- Keep item types unchanged.
- Preserve the `image=filename` workflow.
- Preserve GitHub Pages root deployment.

After editing:

- Run `node scripts/check.mjs`.
- Run syntax checks for edited JavaScript files.
- Manually test Builder and Viewer if UI changed.
- Test image reveal if parser, app, export, or styles changed.
- Test mobile layout if CSS changed.
- Update this guide if file responsibilities changed.

## Suggested Future Enhancements

High priority:

- Add a visible live demo URL and screenshots to the README.
- Add exported-file manual QA instructions with screenshots.

Medium priority:

- Add audio import and embedded audio export if audio becomes a real v2 requirement.
- Add a lesson JSON import/export option for advanced workflows.
- Add more parser tests around edge cases.

Lower priority:

- Introduce a build system only if the project needs package-managed dependencies.
- Migrate to React only if component complexity grows enough to justify the build step.

## Known Tradeoffs

- The app avoids a package manager and build step for GitHub Pages simplicity.
- Local double-clicking `index.html` may fail in some browsers because ES module imports are blocked from `file://`.
- Hosted fonts improve typography online; offline typography falls back to system fonts.
- localStorage can be too small for many large images, so `persistState()` has a fallback that may omit assets if storage fails.
