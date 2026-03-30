const http = require('http');

const port = Number(process.env.PORT || 5002);

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/health')) {
    return sendJson(res, 200, { status: 'ok', service: 'service-b' });
  }

  if (req.method === 'GET' && url.pathname === '/resources') {
    return sendJson(res, 200, {
      resources: [
        { id: 'b-1', name: 'Sample resource from service B' }
      ]
    });
  }

  return sendJson(res, 404, { error: 'Not found', service: 'service-b' });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`service-b listening on port ${port}`);
});
