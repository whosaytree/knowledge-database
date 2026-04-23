import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const publicDir = path.join(__dirname, 'public');
const knowledgeRoot = path.join(repoRoot, 'knowledge');
const defaultPort = Number(process.env.PORT || 4173);

const mimeTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
]);

const nodeIndex = new Map();

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function parseInlineMarkdown(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, href) => {
      const safeHref = escapeHtml(href);
      const safeLabel = escapeHtml(label);
      return `<a href="${safeHref}" target="_blank" rel="noreferrer">${safeLabel}</a>`;
    });
}

function markdownToHtml(markdown) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const html = [];
  let inList = false;
  let inCode = false;
  let paragraph = [];

  function flushParagraph() {
    if (paragraph.length === 0) {
      return;
    }
    const content = paragraph.map((line) => parseInlineMarkdown(line)).join('<br />');
    html.push(`<p>${content}</p>`);
    paragraph = [];
  }

  function closeList() {
    if (!inList) {
      return;
    }
    html.push('</ul>');
    inList = false;
  }

  for (const line of lines) {
    if (line.startsWith('```')) {
      flushParagraph();
      closeList();
      if (!inCode) {
        inCode = true;
        html.push('<pre><code>');
      } else {
        inCode = false;
        html.push('</code></pre>');
      }
      continue;
    }

    if (inCode) {
      html.push(`${escapeHtml(line)}\n`);
      continue;
    }

    if (line.trim() === '') {
      flushParagraph();
      closeList();
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      closeList();
      const level = headingMatch[1].length;
      html.push(`<h${level}>${parseInlineMarkdown(headingMatch[2].trim())}</h${level}>`);
      continue;
    }

    const listMatch = line.match(/^- (.*)$/);
    if (listMatch) {
      flushParagraph();
      if (!inList) {
        html.push('<ul>');
        inList = true;
      }
      html.push(`<li>${parseInlineMarkdown(listMatch[1].trim())}</li>`);
      continue;
    }

    paragraph.push(line.trim());
  }

  flushParagraph();
  closeList();

  if (inCode) {
    html.push('</code></pre>');
  }

  return html.join('\n');
}

function pathToSlug(relativeDir) {
  return relativeDir.split(path.sep).join('/');
}

function titleFromMarkdown(markdown, fallback) {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : fallback;
}

async function readNode(relativeDir) {
  const absoluteDir = path.join(knowledgeRoot, relativeDir);
  const markdownPath = path.join(absoluteDir, 'index.md');
  const markdown = await fs.readFile(markdownPath, 'utf-8');
  const title = titleFromMarkdown(markdown, path.basename(relativeDir));
  const slug = pathToSlug(relativeDir);
  return {
    absoluteDir,
    markdownPath,
    markdown,
    slug,
    title,
  };
}

async function collectChildren(relativeDir) {
  const absoluteDir = path.join(knowledgeRoot, relativeDir);
  const entries = await fs.readdir(absoluteDir, { withFileTypes: true });
  const children = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    const childRelativeDir = path.join(relativeDir, entry.name);
    const childIndexPath = path.join(knowledgeRoot, childRelativeDir, 'index.md');
    try {
      await fs.access(childIndexPath);
      const child = await readNode(childRelativeDir);
      children.push({
        slug: child.slug,
        title: child.title,
      });
    } catch {
      // Ignore directories without index.md so visualization follows the same node rule as the knowledge base.
    }
  }

  return children.sort((left, right) => left.title.localeCompare(right.title));
}

async function buildTree(relativeDir = '') {
  const absoluteDir = relativeDir ? path.join(knowledgeRoot, relativeDir) : knowledgeRoot;
  const entries = await fs.readdir(absoluteDir, { withFileTypes: true });
  const nodes = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    const childRelativeDir = relativeDir ? path.join(relativeDir, entry.name) : entry.name;
    const childIndexPath = path.join(knowledgeRoot, childRelativeDir, 'index.md');
    try {
      await fs.access(childIndexPath);
    } catch {
      continue;
    }

    const child = await readNode(childRelativeDir);
    const item = {
      slug: child.slug,
      title: child.title,
      children: await buildTree(childRelativeDir),
    };
    nodes.push(item);
    nodeIndex.set(child.slug, {
      slug: child.slug,
      title: child.title,
      markdownPath: child.markdownPath,
      relativeDir: childRelativeDir,
    });
  }

  return nodes.sort((left, right) => left.title.localeCompare(right.title));
}

function buildBreadcrumbs(slug) {
  const segments = slug.split('/').filter(Boolean);
  return segments.map((segment, index) => {
    const partialSlug = segments.slice(0, index + 1).join('/');
    const node = nodeIndex.get(partialSlug);
    return {
      slug: partialSlug,
      title: node?.title || segment,
    };
  });
}

async function getTreePayload() {
  nodeIndex.clear();
  const tree = await buildTree();
  return {
    generatedAt: new Date().toISOString(),
    tree,
  };
}

async function getNodePayload(slug) {
  const nodeInfo = nodeIndex.get(slug);
  if (!nodeInfo) {
    throw new Error('NOT_FOUND');
  }

  const node = await readNode(nodeInfo.relativeDir);
  const parentSlug = slug.includes('/') ? slug.split('/').slice(0, -1).join('/') : null;
  const parent = parentSlug ? nodeIndex.get(parentSlug) : null;

  return {
    slug: node.slug,
    title: node.title,
    markdownPath: path.relative(repoRoot, node.markdownPath),
    breadcrumbs: buildBreadcrumbs(slug),
    parent: parent
      ? {
          slug: parent.slug,
          title: parent.title,
        }
      : null,
    children: await collectChildren(nodeInfo.relativeDir),
    html: markdownToHtml(node.markdown),
  };
}

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
