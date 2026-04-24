import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getNodePayload, getTreePayload } from './lib/content.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');
const defaultPort = Number(process.env.PORT || 4173);

const mimeTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
]);

async function serveJson(response, payload, statusCode = 200) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  response.end(JSON.stringify(payload));
}

async function serveStaticFile(requestPath, response) {
  const targetPath = requestPath === '/' ? '/index.html' : requestPath;
  const resolvedPath = path.normalize(path.join(publicDir, targetPath));

  if (!resolvedPath.startsWith(publicDir)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  try {
    const content = await fs.readFile(resolvedPath);
    const extension = path.extname(resolvedPath);
    response.writeHead(200, {
      'Content-Type': mimeTypes.get(extension) || 'application/octet-stream',
    });
    response.end(content);
  } catch {
    const fallback = await fs.readFile(path.join(publicDir, 'index.html'));
    response.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
    });
    response.end(fallback);
  }
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url || '/', `http://${request.headers.host}`);

  try {
    if (requestUrl.pathname === '/api/tree') {
      const treePayload = await getTreePayload();
      await serveJson(response, treePayload);
      return;
    }

    if (requestUrl.pathname === '/api/node') {
      await getTreePayload();
      const slug = requestUrl.searchParams.get('slug');
      if (!slug) {
        await serveJson(response, { error: 'Missing slug' }, 400);
        return;
      }
      const nodePayload = await getNodePayload(slug);
      await serveJson(response, nodePayload);
      return;
    }

    await serveStaticFile(requestUrl.pathname, response);
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      await serveJson(response, { error: 'Node not found' }, 404);
      return;
    }

    response.writeHead(500, {
      'Content-Type': 'application/json; charset=utf-8',
    });
    response.end(JSON.stringify({ error: 'Internal server error' }));
  }
});

server.listen(defaultPort, () => {
  console.log(`Knowledge visualizer running at http://localhost:${defaultPort}`);
});
