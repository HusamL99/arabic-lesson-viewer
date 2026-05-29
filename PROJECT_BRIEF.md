# Premium Arabic Lesson Viewer Rebuild

This file preserves the complete product and implementation intent for the rebuild. Use it as the north star when evaluating whether future changes improve or dilute the project.

## Summary

Build a complete, production-quality Arabic Lesson Viewer as a single-page web application.

The app is not a toy markdown viewer. It is intended to be:

- a professional Arabic learning environment
- a pedagogically structured language acquisition system
- optimized for Jordanian Arabic learning from A1 to C2
- reusable across many lessons, teachers, and students

The project has two primary modes:

- **Builder Mode:** teacher creates, imports, validates, previews, and exports a lesson.
- **Viewer Mode:** student studies an exported lesson through a premium, distraction-free learning interface.

## Design Intent

The interface should feel influenced by:

- Apple Education
- Linear
- Raycast
- Notion
- modern AI-native learning products
- premium SaaS
- premium claymorphism and glassmorphism
- cinematic lighting
- soft depth
- elegant Arabic typography

The result should feel:

- world-class
- modern
- elegant
- immersive
- calming for language learning
- visually addictive without becoming noisy

## Architecture Requirements

The app must remain:

- client-side only
- backend-free
- exportable
- reusable
- mobile-first
- desktop-optimized
- accessible
- high-performance

The original preferred stack was React, TypeScript, TailwindCSS, Framer Motion, shadcn/ui, and Lucide icons. The current implementation uses browser-native ES modules instead, which preserves the client-only architecture while making GitHub Pages deployment simpler and avoiding a build step.

## Application Modes

### Builder Mode

Purpose: teacher creates or imports a lesson.

Required features:

- markdown import
- image import
- parser validation
- lesson preview
- export lesson
- drag-and-drop
- file picker
- multi-image upload

Builder mode is the authoring environment.

### Viewer Mode

Purpose: student studies an exported lesson.

Required features:

- beautiful lesson viewer
- focus mode
- image reveal
- translation reveal
- section navigation
- progress tracking
- keyboard navigation
- mobile gestures or mobile-first controls
- immersive learning UI

Viewer mode should feel distraction-free and premium.

## Pedagogical Architecture

The app is specifically for Arabic pedagogy and should support:

- Jordanian dialect
- Modern Standard Arabic
- CEFR A1 to C2 progression
- communicative language teaching
- retrieval practice
- multimodal learning
- contextual vocabulary acquisition
- dialogue-centered learning
- chunk acquisition
- input -> noticing -> recall -> reuse

## Allowed Content Types

Keep these exact six pedagogical types:

```text
vocab
dialogue
example
question
reading
listening
```

Do not add more visual types unless the product model is intentionally redesigned. Prefer metadata for additional meaning.

## Item Metadata

Each item may optionally include:

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

## Markdown Format

```markdown
# Lesson Title

## Section Name
Optional intro paragraph.

- **vocab** — تفاحة — Apple | image=apple.jpg | cefr=A1
- **dialogue** — كيف حالك؟ — How are you?
- **example** — أنا من الأردن — I am from Jordan
```

## Image System

The image system is a critical feature.

Teacher imports:

- a markdown lesson file
- optional images

Supported import methods:

- drag-and-drop
- markdown file picker
- multi-image file picker

Images are referenced in markdown like:

```text
image=apple.jpg
```

Internally, images are mapped through:

- filename lookup
- local asset registry
- persistent in-memory object map

The UI must show **Show Image** only when `item.image` exists and resolves to an imported image asset.

Image reveal behavior must mirror translation reveal behavior:

- click button
- expand inline premium image viewer
- animate reveal
- preserve smooth transitions
- use cinematic lighting
- use rounded media framing
- support caption and alt text

## Export System

Export must generate a standalone lesson package where images do not break.

Current implementation choice:

- one standalone HTML file
- normalized lesson data embedded as JSON
- used image assets embedded as base64/data URLs

This makes exported lessons portable and reusable.

## UI And UX Requirements

The visual system should use:

- advanced claymorphism
- glassmorphism
- layered depth
- atmospheric gradients
- cinematic lighting
- floating panels
- subtle glow systems
- premium typography
- elegant motion

The color system should use:

- dark luxurious background
- warm gold accents
- refined neutral surfaces
- subtle Arabic-inspired elegance
- modern educational luxury

Avoid:

- neon overload
- gamer aesthetics
- childish language-app aesthetics
- generic dashboards
- default component styling

## Arabic Typography

Arabic typography is critical.

The app should use premium Arabic font choices such as:

- Noto Sans Arabic
- IBM Plex Sans Arabic
- similar high-quality Arabic typography

Arabic text should feel:

- elegant
- cinematic
- readable
- immersive
- well-spaced in RTL contexts

## Focus Mode

Focus mode should show one learning card at a time.

Expected behavior:

- distraction-free study
- smooth transitions
- keyboard navigation on desktop
- touch-friendly navigation on mobile
- progress indicators
- immersive lighting changes

The experience should feel meditative, premium, and cognitively clean.

## Mobile Experience

Mobile UX is extremely important.

The app should feel:

- native-app quality
- touch-first
- fluid
- ergonomic

Required qualities:

- thumb-friendly controls
- responsive layouts
- smooth interaction states
- elegant mobile navigation
- performant animations

## Accessibility

Support:

- keyboard navigation
- reduced motion
- aria labels
- screen readers
- visible focus states
- contrast-aware design

## State Management

State should include:

- current lesson
- current section
- current card
- revealed translations
- revealed images
- focus mode
- sidebar state
- imported assets
- parser validation state
- progress tracking

The current implementation stores these in a single app state object with persistence helpers in `src/store.js`.

## Information Architecture

Application layout:

- premium top navigation
- collapsible sidebar
- immersive lesson content area
- command-style controls
- mobile adaptive navigation

## Lesson Experience

The UX should optimize:

- retention
- recall
- cognitive clarity
- immersion
- emotional engagement
- language acquisition efficiency

## Current Delivery Notes

The delivered implementation includes:

- dependency-light single-page app
- GitHub Pages compatibility
- sample lesson and sample embedded images
- markdown parser and validation
- image registry
- translation reveal
- image reveal
- standalone HTML export
- focus mode
- responsive mobile controls
- keyboard navigation
- local persistence
- validation script
- local static server

Future enhancements should preserve the six-type pedagogical model and the portable export contract unless the project is intentionally versioned.
