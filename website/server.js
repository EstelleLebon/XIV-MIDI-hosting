const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const serveStatic = require('serve-static');
const path = require('path');
const env = require('dotenv').config({ path: path.join(__dirname, 'env', '.env') });

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const publicDirectory = path.join(__dirname, 'public');
const serve = serveStatic(publicDirectory);
const port = process.env.PORT || 3000;

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    const { pathname } = parsedUrl;

    if (pathname.startsWith('/files')) {
      serve(req, res, () => {});
    } else {
      handle(req, res, parsedUrl);
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});