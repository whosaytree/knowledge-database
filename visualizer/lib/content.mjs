import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const visualizerRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(visualizerRoot, '..');
const knowledgeRoot = path.join(repoRoot, 'knowledge');

const nodeIndex = new Map();

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function splitByInlineMath(text) {
  const segments = [];
  const inlineMathPattern = /(\\\(.+?\\\)|\$[^$\n]+\$)/g;
  let lastIndex = 0;

  for (const match of text.matchAll(inlineMathPattern)) {
    const [value] = match;
    const index = match.index ?? 0;

    if (index > lastIndex) {
      segments.push({
        type: 'text',
        value: text.slice(lastIndex, index),
      });
    }

    segments.push({
      type: 'math',
      value,
    });
    lastIndex = index + value.length;
  }

  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      value: text.slice(lastIndex),
    });
  }

  return segments;
}

function isExternalHref(href) {
  return /^(https?:|mailto:|tel:)/i.test(href);
}

function normalizePathSegments(value) {
  return value.split('/').filter((segment) => segment && segment !== '.');
}

function resolveMarkdownHref(href, relativeDir) {
  if (!href || href.startsWith('#') || isExternalHref(href)) {
    return {
      href,
      external: isExternalHref(href),
    };
  }

  const [rawPath, hashFragment] = href.split('#');
  const pathSegments = normalizePathSegments(rawPath);
  const baseSegments = normalizePathSegments(relativeDir);
  const resolvedSegments = [...baseSegments];

  for (const segment of pathSegments) {
    if (segment === '..') {
      resolvedSegments.pop();
      continue;
    }
    resolvedSegments.push(segment);
  }

  if (resolvedSegments.at(-1) === 'index.md') {
    resolvedSegments.pop();
  }

  const slug = resolvedSegments.join('/');
  const route = slug ? `#/${slug}` : '#/';
  return {
    href: hashFragment ? `${route}#${hashFragment}` : route,
    external: false,
  };
}

function parseInlineMarkdown(text, relativeDir) {
  return splitByInlineMath(text)
    .map((segment) => {
      if (segment.type === 'math') {
        return `<span class="math-inline">${escapeHtml(segment.value)}</span>`;
      }

      return escapeHtml(segment.value)
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, href) => {
          const resolved = resolveMarkdownHref(href, relativeDir);
          const safeHref = escapeHtml(resolved.href);
          const safeLabel = escapeHtml(label);
          if (resolved.external) {
            return `<a href="${safeHref}" target="_blank" rel="noreferrer">${safeLabel}</a>`;
          }
          return `<a href="${safeHref}">${safeLabel}</a>`;
        });
    })
    .join('');
}

function markdownToHtml(markdown, relativeDir) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const html = [];
  let inList = false;
  let inCode = false;
  let inMathBlock = false;
  let paragraph = [];
  let mathBlock = [];

  function flushParagraph() {
    if (paragraph.length === 0) {
      return;
    }
    const content = paragraph.map((line) => parseInlineMarkdown(line, relativeDir)).join('<br />');
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

  function flushMathBlock() {
    if (mathBlock.length === 0) {
      return;
    }
    const content = mathBlock.map((line) => escapeHtml(line)).join('\n');
    html.push(`<div class="math-block">$$\n${content}\n$$</div>`);
    mathBlock = [];
  }

  for (const line of lines) {
    if (line.trim() === '$$') {
      flushParagraph();
      closeList();
      if (!inMathBlock) {
        inMathBlock = true;
      } else {
        inMathBlock = false;
        flushMathBlock();
      }
      continue;
    }

    if (inMathBlock) {
      mathBlock.push(line);
      continue;
    }

    const singleLineMathMatch = line.match(/^\$\$(.+)\$\$$/);
    if (singleLineMathMatch) {
      flushParagraph();
      closeList();
      html.push(`<div class="math-block">$$${escapeHtml(singleLineMathMatch[1].trim())}$$</div>`);
      continue;
    }

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
      html.push(`<h${level}>${parseInlineMarkdown(headingMatch[2].trim(), relativeDir)}</h${level}>`);
      continue;
    }

    const listMatch = line.match(/^- (.*)$/);
    if (listMatch) {
      flushParagraph();
      if (!inList) {
        html.push('<ul>');
        inList = true;
      }
      html.push(`<li>${parseInlineMarkdown(listMatch[1].trim(), relativeDir)}</li>`);
      continue;
    }

    paragraph.push(line.trim());
  }

  flushParagraph();
  closeList();
  flushMathBlock();

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
  let nodeInfo = nodeIndex.get(slug);
  if (!nodeInfo) {
    await buildTree();
    nodeInfo = nodeIndex.get(slug);
  }

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
    html: markdownToHtml(node.markdown, nodeInfo.relativeDir),
  };
}

async function collectNodeSlugs(nodes, slugs = []) {
  for (const node of nodes) {
    slugs.push(node.slug);
    await collectNodeSlugs(node.children, slugs);
  }
  return slugs;
}

export {
  getNodePayload,
  getTreePayload,
  collectNodeSlugs,
  repoRoot,
  visualizerRoot,
};
