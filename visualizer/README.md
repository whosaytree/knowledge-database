# Knowledge Visualizer

这个目录是知识库的独立可视化层。

## 设计原则

- 只读取项目中的真实知识文件，不维护第二份内容。
- 所有可视化代码都放在 `visualizer/` 内，和主知识库解耦。
- 页面内容来自 `knowledge/**/index.md` 与目录层级。

## 启动方式

本地实时模式：

```bash
node visualizer/server.mjs
```

默认地址：

```text
http://localhost:4173
```

静态构建模式：

```bash
node visualizer/build-static.mjs
```

构建后会在 `visualizer/public/data/` 下生成可直接部署到静态站点的数据文件。

GitHub Pages 部署：

1. 确保仓库 `Settings -> Pages` 的 Source 为 `GitHub Actions`
2. push 到 `main` 时，workflow `Deploy Visualizer` 会自动构建并部署
3. 默认线上地址为 `https://whosaytree.github.io/knowledge-database/`

线上可用性：

- GitHub Pages 链接可在任意可访问 `github.io` 的设备上打开。
- 不依赖本地 Node 服务，不要求用户下载仓库。

内容更新方式：

- push 到 `main` 后，workflow `Deploy Visualizer` 会自动重新部署。
- 线上页面始终对应最近一次成功部署的仓库版本。

## 当前能力

- 自动读取 `knowledge/` 下的节点目录
- 左侧树导航实时反映当前层级
- 点击节点后展示对应 `index.md`
- 自动显示父节点、子节点、路径和来源文件
- 前端优先读取静态构建产物，缺失时自动回退到本地 `/api/*`
- 本地模式下正文内相对 Markdown 链接会被转换为站内节点跳转

## 有意不做的事情

- 不写入知识文件
- 不要求修改现有目录规范
- 不依赖额外前端框架或第三方包
