# Arabic Lesson Atelier

A client-side Arabic lesson builder and immersive viewer for Jordanian Arabic learning.

## Run Locally

Open the app at:

```text
http://localhost:4173
```

If the local server is not running, start it with Node:

```powershell
node server.mjs
```

In this Codex workspace, the bundled runtime also works:

```powershell
C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe server.mjs
```

## Lesson Syntax

```markdown
# Lesson Title

## Section Name
Optional intro paragraph.

- **vocab** — تفاحة — Apple | image=apple.jpg | cefr=A1
- **dialogue** — كيف حالك؟ — How are you?
- **example** — أنا من الأردن — I am from Jordan
```

Supported item types are exactly:

```text
vocab, dialogue, example, question, reading, listening
```

Supported metadata:

```text
image, audio, cefr, dialect, transliteration, notes, grammar, topic, function, root, frequency
```

## Export

The export button creates a standalone HTML lesson package with the normalized lesson data and imported images embedded directly in the file.
