const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const ROOT = path.resolve(process.cwd(), process.env.SERVE_DIR || '.');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

function sendText(res, status, message) {
  if (res.headersSent) {
    res.destroy();
    return;
  }
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(message);
}

// Turn a request URL into a file path inside ROOT, or return null if it is
// malformed or tries to escape ROOT.
function resolveRequestPath(rawUrl) {
  let pathname;
  try {
    // decodeURIComponent throws URIError on bad escapes like "%E0%A4%A"
    pathname = decodeURIComponent(rawUrl.split('?')[0].split('#')[0]);
  } catch (e) {
    return { error: 400 };
  }

  if (pathname.includes('\0')) {
    return { error: 400 };
  }

  if (pathname.endsWith('/')) {
    pathname += 'index.html';
  }

  const filePath = path.resolve(ROOT, '.' + path.sep + pathname);

  // Must be ROOT itself or strictly inside it. A bare startsWith(ROOT) would
  // also match sibling folders such as "<ROOT>-private".
  if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) {
    return { error: 403 };
  }
  return { filePath };
}

// Parse a single "bytes=start-end" range. Returns null if unsatisfiable.
function parseRange(header, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match) return null;

  let start;
  let end;
  if (match[1] === '' && match[2] === '') {
    return null;
  } else if (match[1] === '') {
    // Suffix range: last N bytes
    const suffix = parseInt(match[2], 10);
    if (suffix === 0) return null;
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = parseInt(match[1], 10);
    end = match[2] === '' ? size - 1 : parseInt(match[2], 10);
  }

  if (start >= size || start > end) return null;
  return { start, end: Math.min(end, size - 1) };
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    sendText(res, 405, '405 Method Not Allowed');
    return;
  }

  const resolved = resolveRequestPath(req.url || '/');
  if (resolved.error === 400) return sendText(res, 400, '400 Bad Request');
  if (resolved.error === 403) return sendText(res, 403, 'Access denied');

  let filePath = resolved.filePath;

  fs.stat(filePath, (err, stats) => {
    if (err) {
      sendText(res, 404, '404 Not Found');
      return;
    }

    if (stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      fs.stat(filePath, (dirErr, indexStats) => {
        if (dirErr || !indexStats.isFile()) {
          sendText(res, 404, '404 Not Found');
          return;
        }
        serveFile(req, res, filePath, indexStats);
      });
      return;
    }

    if (!stats.isFile()) {
      sendText(res, 404, '404 Not Found');
      return;
    }
    serveFile(req, res, filePath, stats);
  });
});

function serveFile(req, res, filePath, stats) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const isMedia = ext === '.mp4' || ext === '.webm';
  const isCode = ext === '.html' || ext === '.js' || ext === '.css';

  const baseHeaders = {
    'Content-Type': contentType,
    'Accept-Ranges': 'bytes',
    // Keep page and code fresh while developing; let browsers cache heavy static assets.
    'Cache-Control': isCode ? 'no-cache' : 'public, max-age=3600'
  };

  let status = 200;
  let streamOptions = {};
  const headers = Object.assign({}, baseHeaders, { 'Content-Length': stats.size });

  // Support HTTP Range requests for smooth video streaming & seeking
  if (req.headers.range && isMedia) {
    const range = parseRange(req.headers.range, stats.size);
    if (!range) {
      res.writeHead(416, { 'Content-Range': `bytes */${stats.size}` });
      res.end();
      return;
    }
    status = 206;
    streamOptions = { start: range.start, end: range.end };
    headers['Content-Range'] = `bytes ${range.start}-${range.end}/${stats.size}`;
    headers['Content-Length'] = range.end - range.start + 1;
  }

  res.writeHead(status, headers);

  if (req.method === 'HEAD') {
    res.end();
    return;
  }

  const stream = fs.createReadStream(filePath, streamOptions);
  stream.on('error', () => {
    // File vanished or became unreadable mid-stream: end the response cleanly
    // instead of letting the error crash the process.
    res.destroy();
  });
  res.on('close', () => stream.destroy());
  stream.pipe(res);
}

server.on('clientError', (err, socket) => {
  if (socket.writable) {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
  }
});

function lanAddresses() {
  const out = [];
  for (const list of Object.values(os.networkInterfaces())) {
    for (const iface of list || []) {
      if (iface.family === 'IPv4' && !iface.internal) out.push(iface.address);
    }
  }
  return out;
}

server.listen(PORT, HOST, () => {
  console.log(`Server running locally at:   http://localhost:${PORT}/`);
  if (HOST === '0.0.0.0') {
    lanAddresses().forEach((ip) => {
      console.log(`Server running on network at: http://${ip}:${PORT}/`);
    });
  }
});
