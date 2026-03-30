const http = require('http');

const port = Number(process.env.PORT || 8080);

const routes = {
  '/api/service-a': 'http://service-a:5001',
  '/api/service-b': 'http://service-b:5002'
};

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
};

const proxyRequest = async (req, res, targetBase) => {
  const incomingUrl = new URL(req.url, `http://${req.headers.host}`);
  const prefix = Object.keys(routes).find((key) => incomingUrl.pathname.startsWith(key));
  const rewrittenPath = incomingUrl.pathname.slice(prefix.length) || '/';
  const targetUrl = new URL(rewrittenPath + incomingUrl.search, targetBase);

  try {
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers: {
        Accept: req.headers.accept || 'application/json'
      }
    });

    const body = await upstream.text();
    res.writeHead(upstream.status, {
      'Content-Type': upstream.headers.get('content-type') || 'application/json; charset=utf-8'
    });
    res.end(body);
  } catch (error) {
    sendJson(res, 502, {
      error: 'Bad gateway',
      details: error.message
    });
  }
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/health')) {
    return sendJson(res, 200, {
      status: 'ok',
      service: 'gateway',
      routes: Object.keys(routes)
    });
  }

  const matchingRoute = Object.entries(routes).find(([prefix]) => url.pathname.startsWith(prefix));
  if (matchingRoute) {
    return proxyRequest(req, res, matchingRoute[1]);
  }

  return sendJson(res, 404, { error: 'Route not found', service: 'gateway' });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`gateway listening on port ${port}`);
});
