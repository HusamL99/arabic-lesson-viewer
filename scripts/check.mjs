import assert from "node:assert/strict";
import { createStandaloneHtml } from "../src/exporter.js";
import { getAllItems, parseLesson } from "../src/parser.js";
import { sampleAssets, sampleMarkdown } from "../src/sample.js";

const parsed = parseLesson(sampleMarkdown, sampleAssets);
assert.equal(parsed.validation.errors.length, 0, "sample lesson should parse without errors");
assert.equal(parsed.validation.stats.sections, 2, "sample lesson section count");
assert.equal(parsed.validation.stats.items, 8, "sample lesson item count");
assert.equal(parsed.validation.stats.imagesReferenced, 2, "sample lesson image references");
assert.equal(parsed.validation.stats.imagesResolved, 2, "sample lesson image resolution");

const allTypes = new Set(getAllItems(parsed.lesson).map((item) => item.type));
for (const type of ["vocab", "dialogue", "example", "question", "reading", "listening"]) {
  assert.equal(allTypes.has(type), true, `sample includes ${type}`);
}

const bad = parseLesson("- **grammar** — خطأ — Wrong");
assert.equal(bad.validation.errors.some((item) => item.message.includes("Unknown item type")), true, "unknown type should error");

const missingImage = parseLesson("# Test\n\n## One\n- **vocab** — تفاحة — Apple | image=apple.jpg", {});
assert.equal(missingImage.validation.warnings.some((item) => item.message.includes("apple.jpg")), true, "missing image should warn");

const standalone = createStandaloneHtml(parsed.lesson, sampleAssets);
assert.equal(standalone.includes("<!doctype html>"), true, "export should be HTML");
assert.equal(standalone.includes("lesson-data"), true, "export should embed payload");
assert.equal(standalone.includes("data:image/svg+xml"), true, "export should embed images");

console.log("Checks passed: parser, metadata, image resolution, standalone export");
