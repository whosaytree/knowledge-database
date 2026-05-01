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

当前已经完成基础框架初始化，知识内容已进入持续扩展阶段。

当前项目同时维护本地与 GitHub Pages 两种可视化访问方式：

- 位于 `visualizer/` 目录。
- 通过读取 `knowledge/` 当前目录结构和 `index.md` 内容生成页面。
- 用于浏览“当下的知识库”，而不是维护一份独立副本。
- push 到 `main` 后，会通过 GitHub Actions 自动重新构建并部署静态页面。

当前已经形成的主要知识路径包括：

```text
knowledge/scientific-thinking/
  occams-razor/

knowledge/computer-science/
  character-encoding/
    ascii/
    unicode/

knowledge/math/
  exponential-moving-average/

knowledge/AI/
  llm/
    distributed-training/
      fsdp/
      megatron/
    fine-tuning/
      lora/
  machine-learning/
    evaluation-metrics/
      accuracy/
      precision-and-recall/
      f1-score/
      roc/
    generalization/
      evaluation-methods/
      validation-set/
      testing-set/
    loss-functions/
      mse/
    parameter-estimation/
      maximum-likelihood-estimation/
      least-squares-method/
    supervised-learning/
      regression/
        linear-regression/
    nlp/
      transformer/
        bert/
    optimization/
      sgd/
      adam/
      no-free-lunch-theorem/
    search-and-retrieval/
      sparse-retrieval/
        inverted-index/
        bm25/
      dense-retrieval/
        embedding/
          e5/
        flat/
        faiss/
        late-interaction/
          colbert-v2/
```

其中：

- `Search & Retrieval` 已形成从稀疏检索到稠密检索的主路径。
- `Optimization`、`Generalization`、`Evaluation Metrics`、`Parameter Estimation` 已形成基础机器学习训练与评估框架。
- `LLM` 下已形成 `Fine-tuning` 与 `Distributed Training` 两条可继续扩展的工程路径。
- `Scientific Thinking`、`Computer Science`、`Math` 已建立独立根节点，用于承载跨 AI 的基础知识。

后续重点是：

- 继续扩展现有主路径下的关键空白节点，优先补齐父节点中已出现但尚未展开的术语。
- 保持每个节点主题清晰、结构稳定。
- 新增节点时同步更新父节点目录和 `catalog.md`。
- 在写入前先审阅内容草稿。
- 逐步沉淀适合长期维护的节点模板、比较框架和目录规则。
- 保持展示层和知识内容层解耦，避免前端结构反向绑死知识库。
