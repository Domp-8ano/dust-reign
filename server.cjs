const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const port = Number(process.env.PORT || 3000);
const host = "0.0.0.0";
const distDir = path.join(__dirname, "dist");
const indexPath = path.join(distDir, "index.html");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
};

function sendFile(response, filePath) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Dust Reign server error");
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      "Content-Type": mimeTypes[extension] || "application/octet-stream",
      "Cache-Control": extension === ".html" ? "no-store" : "public, max-age=31536000, immutable",
    });
    response.end(data);
  });
}

const server = http.createServer((request, response) => {
  const requestedPath = decodeURIComponent((request.url || "/").split("?")[0]);
  const safePath = path.normalize(requestedPath).replace(/^\.\.(\/|\\|$)/, "");
  const filePath = path.join(distDir, safePath === "/" ? "index.html" : safePath);

  if (filePath.startsWith(distDir) && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    sendFile(response, filePath);
    return;
  }

  sendFile(response, indexPath);
});

server.listen(port, host, () => {
  console.log(`Dust Reign server listening on http://${host}:${port}`);
});