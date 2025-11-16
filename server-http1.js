const http = require('http');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const indexHtml = fs.readFileSync(path.join(publicDir, 'index.html'));
const imagePng = fs.readFileSync(path.join(publicDir, 'image.png'));

// simple counter to see how many TCP connections the browser opens
let connectionCounter = 0;

const server = http.createServer((req, res) => {
  if (!req.socket._id) {
    req.socket._id = ++connectionCounter;
    console.log(`HTTP/1.1: new TCP connection #${req.socket._id}`);
  }

  console.log(
    `HTTP/1.1: conn #${req.socket._id} -> ${req.method} ${req.url}`
  );

  if (req.url.startsWith('/image.png')) {
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Cache-Control': 'no-store'
    });
    res.end(imagePng);
    return;
  }

  // anything else goes to index.html
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(indexHtml);
});

const PORT = 8080;

server.listen(PORT, () => {
  console.log(`HTTP/1.1 server running on http://localhost:${PORT}`);
});
