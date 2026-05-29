# Premium Arabic Lesson Viewer

A premium, Arabic lesson builder and immersive lesson viewer for Jordanian Arabic learning.

This project is designed for me as an Arabic tutor. It supports structured lesson authoring, image-backed vocabulary and reading items, translation reveal, focus mode, progress tracking, and standalone lesson export for reuse across students and lessons.

## Built With Codex

This project was created with **OpenAI Codex** through a **vibe-coding workflow**: the product direction, pedagogy, and design goals were human-led, while Codex generated and refined the implementation, architecture, UI system, parser, export flow, and documentation.

## Live Use

The app is designed to run directly from GitHub Pages.

Expected GitHub Pages URL format:

```text
https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/
```

The app is static and client-side only. There is no backend, no database, and no server requirement once it is uploaded to GitHub Pages.

## What It Does

- Builds Arabic lessons from a simple markdown format.
- Supports exactly six pedagogical item types: `vocab`, `dialogue`, `example`, `question`, `reading`, and `listening`.
- Preserves metadata such as CEFR level, dialect, transliteration, grammar, topic, communicative function, root, frequency, image, notes, and audio references.
- Lets teachers import markdown files and multiple local images.
- Maps images by filename, for example `image=apple.jpg`.
- Shows the **Show Image** button only when a lesson item has an image reference that resolves to an imported asset.
- Lets students reveal translations and images independently.
- Provides a premium viewer mode with section navigation, progress tracking, keyboard navigation, mobile controls, and immersive focus mode.
- Exports a standalone HTML lesson package with lesson data and images embedded directly into the file.

## Current Implementation

The original rebuild plan allowed React, TypeScript, TailwindCSS, Framer Motion, Zustand, and shadcn/ui. The final implementation intentionally uses dependency-light browser ES modules instead, because this makes the project easy to upload to GitHub Pages and open online without a build step.

The app is still organized into reusable modules:

```text
index.html
src/
  app.js
  styles.css
  parser.js
  exporter.js
  store.js
  sample.js
  icons.js
scripts/
  check.mjs
server.mjs
package.json
```

## Lesson Markdown Format

```markdown
# Lesson Title

## Section Name
Optional intro paragraph.

- **vocab** — تفاحة — Apple | image=apple.jpg | cefr=A1
- **dialogue** — كيف حالك؟ — How are you? | dialect=Jordanian
- **example** — أنا من الأردن — I am from Jordan | transliteration=ana min il-urdun
```

## Supported Item Types

Use exactly these six types:

```text
vocab
dialogue
example
question
reading
listening
```

Do not add new visual item types unless the product model is intentionally changed. Use metadata for additional pedagogical meaning.

## Supported Metadata

```text
image
audio
cefr
dialect
transliteration
notes
grammar
topic
function
root
frequency
```

Notes:

- `image=filename.jpg` maps to an imported image with the same filename.
- `audio=...` is parsed and preserved for future compatibility, but the current app does not render an audio player.
- Unknown metadata is preserved as notes and reported as a parser warning.

## Teacher Workflow

1. Open the app.
2. Stay in **Builder** mode.
3. Import or paste a markdown lesson.
4. Import any images referenced by filename in the markdown.
5. Review parser validation messages.
6. Preview the lesson.
7. Export the standalone lesson HTML file.

## Student Workflow

1. Open **Viewer** mode.
2. Navigate by section or card.
3. Reveal translations only when ready.
4. Reveal images only when the item includes an image.
5. Use focus mode for one-card-at-a-time study.
6. Track progress as cards are studied.

## Local Development

The project can be served locally with Node:

```powershell
node server.mjs
```

Then open:

```text
http://localhost:4173
```

If the app does not open locally by double-clicking `index.html`, that is expected in some browsers. The app uses JavaScript modules, and browsers may block module imports from `file://`. GitHub Pages works because it serves the files over `https://`.

Run the validation script:

```powershell
node scripts/check.mjs
```

## Documentation For Future Development

- [PROJECT_BRIEF.md](./PROJECT_BRIEF.md) preserves the complete Premium Arabic Lesson Viewer Rebuild plan and product intent.
- [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) explains the architecture, each repository file, internal responsibilities, safe edit boundaries, and AI-agent guidance.

Read the development guide before changing parser behavior, export behavior, state persistence, card interactions, image mapping, or the design system.

## Deployment Notes

For GitHub Pages:

1. Put `index.html` at the repository root.
2. Keep the `src/` folder beside it.
3. Keep `.nojekyll` in the repository root so GitHub Pages serves the files directly.
4. In GitHub repository settings, enable Pages from the `main` branch and root folder.
5. Visit the generated Pages URL.

Required files for the live app:

```text
index.html
src/app.js
src/styles.css
src/parser.js
src/exporter.js
src/store.js
src/sample.js
src/icons.js
```

Project implementation and documentation were produced with OpenAI Codex as a vibe-coding collaborator under human direction.
