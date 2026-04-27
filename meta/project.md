# 项目概况

## 目标

构建一个个人结构化知识库，目标规模约 1000 个节点。

## 基本原则

- 所有内容使用 Markdown 文件保存。
- 知识节点应尽量保持单一主题。
- 目录结构服务于长期检索、复用和扩展，而不是一次性分类。
- 元信息与知识内容分离，避免维护规则混入知识节点。
- 可视化层必须独立存在，只读取知识内容，不改变知识节点组织方式。

## 当前阶段

当前已经完成基础框架初始化，并开始录入真实知识节点。

同时已补充一个本地可视化原型：

- 位于 `visualizer/` 目录。
- 通过读取 `knowledge/` 当前目录结构和 `index.md` 内容生成页面。
- 用于浏览“当下的知识库”，而不是维护一份独立副本。

已建立的早期知识路径包括：

```text
knowledge/AI/
  llm/
    fine-tuning/
      lora/
  machine-learning/
    optimization/
      sgd/
      adam/
    search-and-retrieval/
```

其中：

- `Sparse Retrieval -> Inverted Index` 已作为较完整的检索知识节点完成。
- `Machine Learning -> Optimization -> SGD / Adam` 已形成一个可继续扩展的训练优化路径。

后续重点是：

- 继续扩展 AI 下的核心知识路径，包括 LLM、Fine-tuning、Search & Retrieval、Optimization 等方向。
- 保持每个节点主题清晰、结构稳定。
- 新增节点时同步更新父节点目录和 `catalog.md`。
- 在写入前先审阅内容草稿。
- 逐步沉淀适合长期维护的节点模板、比较框架和目录规则。
- 保持展示层和知识内容层解耦，避免前端结构反向绑死知识库。
