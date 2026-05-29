import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(".");
const port = Number(process.env.PORT || 4173);

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp"
};

createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://localhost:${port}`);
  const safePath = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
  let filePath = resolve(join(root, safePath === "/" ? "index.html" : safePath));

  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const info = await stat(filePath);
    if (info.isDirectory()) filePath = join(filePath, "index.html");
    const type = types[extname(filePath).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store" });
    createReadStream(filePath).pipe(res);
  } catch {
    try {
      const html = await readFile(join(root, "index.html"));
      res.writeHead(200, { "Content-Type": types[".html"], "Cache-Control": "no-store" });
      res.end(html);
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  }
}).listen(port, () => {
  console.log(`Arabic Lesson Viewer running at http://localhost:${port}`);
});
