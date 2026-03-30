const http = require('http');

const port = Number(process.env.PORT || 5001);

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/health')) {
    return sendJson(res, 200, { status: 'ok', service: 'service-a' });
  }

  if (req.method === 'GET' && url.pathname === '/items') {
    return sendJson(res, 200, {
      items: [
        { id: 'a-1', name: 'Sample item from service A' }
      ]
    });
  }

  return sendJson(res, 404, { error: 'Not found', service: 'service-a' });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`service-a listening on port ${port}`);
});
