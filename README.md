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

项目包含一个独立的本地可视化原型，用于从当前目录结构实时生成知识树和节点阅读页。

- 可视化代码位于 `visualizer/`
- 页面内容直接读取 `knowledge/**/index.md`
- 不维护第二份网页内容
- 不写入知识文件

启动方式：

```bash
node visualizer/server.mjs
```

默认地址：

```text
http://localhost:4173
```

## 协作方式

默认先出草稿，再确认写入。

当需求使用“预新建”“预修改”“预更新”等表达时，默认只提供方案，不直接落库。

## 入口

- 全局目录：[`catalog.md`](catalog.md)
- 项目规则：[`meta/`](meta/)
- 知识内容：[`knowledge/`](knowledge/)
- 可视化：[`visualizer/`](visualizer/)
