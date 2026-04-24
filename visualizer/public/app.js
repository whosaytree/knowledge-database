const treeRoot = document.querySelector('#tree');
const pageTitle = document.querySelector('#page-title');
const pageSubtitle = document.querySelector('#page-subtitle');
const overview = document.querySelector('#overview');
const article = document.querySelector('#article');

let currentTree = [];
let dataMode = null;
let currentNodeSlug = '';

function slugFromHash() {
  return decodeURIComponent(window.location.hash.replace(/^#\/?/, ''));
}

function setHash(slug) {
  window.location.hash = slug ? `/${encodeURIComponent(slug)}` : '/';
}

function normalizeSegments(value) {
  return value.split('/').filter((segment) => segment && segment !== '.');
}

function isExternalHref(href) {
  return /^(https?:|mailto:|tel:)/i.test(href);
}

function resolveKnowledgeHref(href, currentSlug) {
  if (!href || href.startsWith('#') || isExternalHref(href)) {
    return null;
  }

  const [rawPath] = href.split('#');
  const resolvedSegments = normalizeSegments(currentSlug);
  for (const segment of normalizeSegments(rawPath)) {
    if (segment === '..') {
      resolvedSegments.pop();
      continue;
    }
    resolvedSegments.push(segment);
  }

  if (resolvedSegments.at(-1) === 'index.md') {
    resolvedSegments.pop();
  }

  return resolvedSegments.join('/');
}

function assetUrl(relativePath) {
  return new URL(relativePath, document.baseURI);
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url}`);
  }
  return response.json();
}

async function resolveDataMode() {
  if (dataMode) {
    return dataMode;
  }

  const localHosts = new Set(['127.0.0.1', 'localhost']);
  if (localHosts.has(window.location.hostname)) {
    dataMode = 'live';
    return dataMode;
  }

  try {
    await fetchJson(assetUrl('./data/tree.json'));
    dataMode = 'static';
  } catch {
    dataMode = 'live';
  }

  return dataMode;
}

function createTreeMarkup(nodes) {
  const activeSlug = slugFromHash();

  function renderBranch(branchNodes) {
    if (branchNodes.length === 0) {
      return '';
    }

    const items = branchNodes
      .map((node) => {
        const active = node.slug === activeSlug ? 'tree__link--active' : '';
        const children = renderBranch(node.children);
        return `
          <li class="tree__item">
            <a class="tree__link ${active}" href="#/${node.slug}">${node.title}</a>
            ${children}
          </li>
        `;
      })
      .join('');

    return `<ul class="tree__group">${items}</ul>`;
  }

  return renderBranch(nodes);
}

function renderHome() {
  currentNodeSlug = '';
  pageTitle.textContent = '当前知识库总览';
  pageSubtitle.textContent = '左侧目录来自 knowledge/ 的实时层级。';
  overview.innerHTML = `
    <div class="overview__panel">
      <p class="overview__label">入口说明</p>
      <p class="overview__text">点击左侧任意节点，直接查看对应目录下的 index.md。</p>
    </div>
    <div class="overview__panel">
      <p class="overview__label">解耦原则</p>
      <p class="overview__text">可视化代码只读项目内容，不改写知识文件，也不依赖 catalog.md 手工同步。</p>
    </div>
  `;
  article.innerHTML = `
    <section class="empty-state">
      <h3>从左侧选择一个知识节点</h3>
      <p>这个界面只展示当前项目里已经存在的目录和 Markdown 内容。</p>
    </section>
  `;
}

function renderOverview(node) {
  const breadcrumbLinks = node.breadcrumbs
    .map((item) => `<a href="#/${item.slug}">${item.title}</a>`)
    .join('<span>/</span>');

  const childItems = node.children.length
    ? node.children.map((child) => `<a class="chip" href="#/${child.slug}">${child.title}</a>`).join('')
    : '<span class="muted">没有直接子节点</span>';

  const parentItem = node.parent
    ? `<a class="chip" href="#/${node.parent.slug}">${node.parent.title}</a>`
    : '<span class="muted">根级节点</span>';

  overview.innerHTML = `
    <div class="overview__panel">
      <p class="overview__label">路径</p>
      <div class="breadcrumbs">${breadcrumbLinks}</div>
    </div>
    <div class="overview__panel">
      <p class="overview__label">父节点</p>
      <div class="chip-row">${parentItem}</div>
    </div>
    <div class="overview__panel">
      <p class="overview__label">子节点</p>
      <div class="chip-row">${childItems}</div>
    </div>
    <div class="overview__panel">
      <p class="overview__label">来源文件</p>
      <p class="overview__text"><code>${node.markdownPath}</code></p>
    </div>
  `;
}

async function fetchTree() {
  const mode = await resolveDataMode();
  const payload = mode === 'static'
    ? await fetchJson(assetUrl('./data/tree.json'))
    : await fetchJson('/api/tree');
  currentTree = payload.tree;
  treeRoot.innerHTML = createTreeMarkup(currentTree);
  return mode;
}

async function fetchNode(slug) {
  const mode = await resolveDataMode();
  if (mode === 'static') {
    const segments = slug.split('/').filter(Boolean).map(encodeURIComponent);
    const nodePath = segments.length
      ? assetUrl(`./data/node/${segments.join('/')}/index.json`)
      : assetUrl('./data/tree.json');
    return fetchJson(nodePath);
  }
  return fetchJson(`/api/node?slug=${encodeURIComponent(slug)}`);
}

async function renderRoute() {
  const mode = await fetchTree();
  const slug = slugFromHash();

  if (!slug) {
    renderHome();
    return;
  }

  try {
    const node = await fetchNode(slug);
    currentNodeSlug = node.slug;
    pageTitle.textContent = node.title;
    pageSubtitle.textContent = mode === 'static'
      ? '正文来自最近一次静态构建产物。'
      : '正文直接渲染自当前节点的 index.md。';
    renderOverview(node);
    article.innerHTML = node.html;
    if (window.MathJax?.typesetPromise) {
      await window.MathJax.typesetPromise([article]);
    }
  } catch {
    currentNodeSlug = '';
    pageTitle.textContent = '节点不存在';
    pageSubtitle.textContent = '当前 hash 没有匹配到知识节点。';
    overview.innerHTML = '';
    article.innerHTML = `
      <section class="empty-state">
        <h3>没有找到对应节点</h3>
        <p>请从左侧重新选择一个存在的目录。</p>
      </section>
    `;
  }
}

window.addEventListener('hashchange', () => {
  renderRoute();
});

article.addEventListener('click', (event) => {
  const link = event.target.closest('a[href]');
  if (!link) {
    return;
  }

  const href = link.getAttribute('href') || '';
  const resolvedSlug = resolveKnowledgeHref(href, currentNodeSlug);
  if (!resolvedSlug) {
    return;
  }

  event.preventDefault();
  setHash(resolvedSlug);
});

window.addEventListener('DOMContentLoaded', () => {
  if (!window.location.hash) {
    setHash('');
  }
  renderRoute();
});
