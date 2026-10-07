import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = Number(process.env.PORT) || 80;
const DIST_DIR = path.resolve('dist');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // SPA Fallback: resolve path to dist file or fallback to index.html
  const urlPath = req.url.split('?')[0];
  let safePath = path.normalize(urlPath).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(DIST_DIR, safePath);

  // Check if file exists and is not a directory
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error loading asset');
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000'
    });
    res.end(content);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 [PulseOps Frontend] Container serving on port ${PORT}`);
});
