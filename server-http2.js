const http2 = require('http2');
const fs = require('fs');
const path = require('path');

const {
  HTTP2_HEADER_PATH,
  HTTP2_HEADER_STATUS,
  HTTP2_HEADER_CONTENT_TYPE
} = http2.constants;

const publicDir = path.join(__dirname, 'public');
const indexHtml = fs.readFileSync(path.join(publicDir, 'index.html'));
const imagePng = fs.readFileSync(path.join(publicDir, 'image.png'));

// count how many HTTP/2 sessions (roughly TCP connections) we get
let sessionCounter = 0;

const server = http2.createSecureServer({
  key: fs.readFileSync('localhost-privkey.pem'),
  cert: fs.readFileSync('localhost-cert.pem'),
  allowHTTP1: false   // here we want pure HTTP/2 for the experiment
});

server.on('error', (err) => {
  console.error('HTTP/2 server error:', err);
});

// each session corresponds to one underlying TCP connection
server.on('session', (session) => {
  session._id = ++sessionCounter;
  console.log(`HTTP/2: new session #${session._id}`);

  session.on('close', () => {
    console.log(`HTTP/2: session #${session._id} closed`);
  });
});

// each stream is one HTTP request over that session
server.on('stream', (stream, headers) => {
  const pathHeader = headers[HTTP2_HEADER_PATH];
  const sid = stream.session._id;

  console.log(`HTTP/2: session #${sid}, stream #${stream.id}, path: ${pathHeader}`);

  if (pathHeader.startsWith('/image.png')) {
    stream.respond({
      [HTTP2_HEADER_STATUS]: 200,
      [HTTP2_HEADER_CONTENT_TYPE]: 'image/png',
      'cache-control': 'no-store'
    });
    stream.end(imagePng);
    return;
  }

  stream.respond({
    [HTTP2_HEADER_STATUS]: 200,
    [HTTP2_HEADER_CONTENT_TYPE]: 'text/html; charset=utf-8',
    'cache-control': 'no-store'
  });
  stream.end(indexHtml);
});

const PORT = 8443;

server.listen(PORT, () => {
  console.log(`HTTP/2 server running on https://localhost:${PORT}`);
});
