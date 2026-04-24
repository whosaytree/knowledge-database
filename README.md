# 个人结构化知识库

一个基于 Markdown 的个人知识库项目，用稳定路径和清晰层级组织可长期维护的知识节点。

## 目录结构

- `meta/`：项目说明、协作规则、组织规则
- `catalog.md`：全局目录入口
- `knowledge/`：真实知识内容
- `visualizer/`：独立的本地可视化层，只读取当前知识库内容

## 当前知识范围

目前已开始整理 AI 方向知识，包含：

- `LLM -> Fine-tuning -> LoRA`
- `Machine Learning -> Search & Retrieval`
  - `Sparse Retrieval -> Inverted Index`
  - `Sparse Retrieval -> BM25`
  - `Dense Retrieval -> Embedding -> E5`

## 组织原则

- 一个节点对应一个稳定入口
- 可扩展主题优先使用 `目录 + index.md`
- 父节点维护直接子节点入口
- `catalog.md` 同步维护全局目录
- 元信息与知识内容分离
- 可视化代码与知识内容解耦，展示层不反向约束知识结构

## 可视化

项目包含一个独立的双模式可视化原型，用于从当前目录结构生成知识树和节点阅读页。

在线浏览：<https://whosaytree.github.io/knowledge-database/>

- 可视化代码位于 `visualizer/`
- 页面内容直接读取 `knowledge/**/index.md`
- 不维护第二份网页内容
- 不写入知识文件

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

静态模式适合部署到 GitHub Pages；每次仓库内容更新后重新构建即可同步可视化结果。

线上访问地址：

- GitHub Pages：<https://whosaytree.github.io/knowledge-database/>

访问方式：

- 任何可访问 `github.io` 的设备都可以直接打开，无需拉取仓库，也无需本地运行服务。
- 线上页面展示的是最近一次 push 到 GitHub 后自动构建的结果。

GitHub Pages 使用方式：

1. 首次进入仓库 `Settings -> Pages`，将 Source 设为 `GitHub Actions`
2. push 到 `main` 后，GitHub Actions 会自动执行 `.github/workflows/visualizer-pages.yml`
3. 部署完成后，可通过 `https://whosaytree.github.io/knowledge-database/` 访问线上可视化

模式区别：

- 本地模式读取当前工作区内容，适合查看未提交改动
- GitHub Pages 读取最近一次 push 后自动构建的静态结果，适合分享链接

自动更新规则：

- 每次 push 到 `main`，GitHub Actions 会自动重新构建并部署可视化页面。
- 本地未提交或未 push 的改动不会出现在线上页面中。

## 协作方式

默认先出草稿，再确认写入。

当需求使用“预新建”“预修改”“预更新”等表达时，默认只提供方案，不直接落库。

## 入口

- 全局目录：[`catalog.md`](catalog.md)
- 项目规则：[`meta/`](meta/)
- 知识内容：[`knowledge/`](knowledge/)
- 可视化：[`visualizer/`](visualizer/)
- 线上可视化：[GitHub Pages](https://whosaytree.github.io/knowledge-database/)
