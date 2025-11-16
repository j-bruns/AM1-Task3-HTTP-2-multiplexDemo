# HTTP/2 Multiplexing Demo

## Requirements

- Node.js (version 16 or newer is fine)  
- OpenSSL (for the local HTTPS certificate)  
- A modern browser (Chrome, Firefox, Edge)

## Installation

1. Generate a self signed certificate for localhost
```
openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' \
  -keyout localhost-privkey.pem -out localhost-cert.pem
```
2. Start HTTP/1.1 Server:
```
node server-http1.js
```
3. Start HTTP/2 Server
```
node server-http2.js
```

## Observations
- With HTTP 1.1 the browser opens several TCP connections to localhost. Only a limited number of resource requests are in progress at once, the rest wait in a queue.

- With HTTP 2 the browser usually keeps one TCP connection. Image requests run as independent streams inside a single HTTP 2 session.

- On the server side, HTTP 1.1 logs show many connections, while HTTP 2 logs show one session with many streams.

- On the client side, the DevTools Network panel shows different protocols (http/1.1 vs h2) and different waterfall patterns.