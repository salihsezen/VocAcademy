const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT ? Number(process.env.PORT) : 5500;
const ROOT = process.cwd();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

function send(res, code, data, headers = {}) {
  res.writeHead(code, Object.assign({ 'Cache-Control': 'no-cache' }, headers));
  res.end(data);
}

function safeJoin(base, target) {
  const targetPath = path.posix.normalize('/' + target.replace(/\\/g, '/'));
  return path.join(base, targetPath);
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  let filePath = safeJoin(ROOT, urlPath);

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        if (readErr.code === 'ENOENT') {
          send(res, 404, 'Not Found');
        } else {
          send(res, 500, 'Internal Server Error');
        }
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      const type = MIME[ext] || 'application/octet-stream';
      send(res, 200, data, { 'Content-Type': type });
    });
  });
});

server.listen(PORT, () => {
  console.log(`Static server running at http://localhost:${PORT}/`);
});

