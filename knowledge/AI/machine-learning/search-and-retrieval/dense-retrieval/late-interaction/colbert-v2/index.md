# ColBERT v2

## 核心理解

ColBERT v2 是一种基于 Late Interaction 的 Dense Retrieval 模型。

它不是把 query 和 document 各自压缩成单个向量，而是保留 token 级向量表示，并在检索时执行细粒度匹配。

和早期单向量 dense retriever 相比，ColBERT v2 的重点不是“把整段文本编码得更好”，而是“让 query 的不同 token 可以分别找到 document 中最相关的局部内容”。

它的关键价值在于：

- 比 single-vector dense retrieval 保留更多匹配信息。
- 比 Cross-Encoder 更容易索引化和扩展到大规模检索。
- 在 late interaction 路线里，通过轻量化设计降低存储成本。

## 工作机制

ColBERT v2 会分别编码 query 和 document，得到 token 级向量矩阵。

可以粗略表示为：

```text
query
  -> [q1, q2, q3, ...]

document
  -> [d1, d2, d3, ...]
```

查询时，它不会直接比较两个整体向量，而是对每个 query token，在 document token 中寻找最相近的匹配，再把这些分数聚合起来。

常见的理解方式是：

```text
score(query, document)
  = sum over query tokens (
      max similarity(query token, any document token)
    )
```

这类聚合通常被称为 `MaxSim` 思路。

它表达的是：

- query 中每个局部语义都要在 document 中找到最相关的位置。
- document 不需要用单个向量一次性承载全部语义。
- 最终相关性来自多个局部匹配共同组成，而不是一个整体向量距离。

## 它和普通 Embedding 检索的区别

以 E5 这类 single-vector embedding 模型为例，系统通常会：

- 为 query 生成一个向量。
- 为每个 document chunk 生成一个向量。
- 用 cosine similarity 或 dot product 直接比较。

这类方法扩展性很好，但容易损失局部匹配信号。

ColBERT v2 不同：

- 一个 query 对应多个 token 向量。
- 一个 document 也对应多个 token 向量。
- 相关性来自 token 级别匹配后的聚合。

所以它更适合处理下面这类情况：

- query 有多个约束，需要 document 分别覆盖。
- 某些关键 token 非常重要，不应被整体平均掉。
- 文档中的答案只出现在局部片段，而不是整段主题都一致。

## v2 相比早期 ColBERT 的重点改进

ColBERT 这条路线的优势一直很明显，但早期版本的主要问题是空间开销大。

因为每个 document 要保存大量 token 向量，索引体积会明显高于单向量检索。

ColBERT v2 的重点改进就在于让 late interaction 变得更轻量，核心方向包括：

- 用更激进的压缩方式降低 token 向量存储成本。
- 通过更干净的监督信号提升检索质量。
- 在尽量保留 late interaction 效果的前提下，让大规模部署更现实。

因此，ColBERT v2 不是简单的小版本迭代，而是一次面向“效果和空间占用”同时优化的工程化推进。

## 实现方法与工程细节

### 1. 多向量索引

ColBERT v2 的 document index 不是“一条文档一个向量”，而是“一条文档一组 token 向量”。

这意味着索引记录需要维护：

- passage 或 chunk id
- token 级向量表示
- 原文位置或映射关系
- 模型版本和索引配置

### 2. 检索分数由 token 级相似度聚合而来

它的核心不是 ANN 找到一个最近向量就结束，而是要支持：

- query token 到 document token 的相似度搜索
- 每个 query token 的最佳匹配选择
- 聚合成最终 document score

因此它的底层引擎设计和普通 vector database 的单向量相似搜索并不完全一样。

### 3. 存储压缩非常关键

如果不压缩，多向量表示会带来很高空间成本。

ColBERT v2 的工程重点之一就是让 token 向量表示更轻，以便在大规模语料上仍然可用。

这也是它区别于“概念上可行但工程上过重”的 late interaction 方案的关键点。

### 4. 更适合作为强召回器，而不是最末端精排器

ColBERT v2 常用于高质量第一阶段检索，或者比普通 bi-encoder 更强的召回模块。

它的定位通常不是替代 Cross-Encoder reranker，而是：

- 先用 ColBERT v2 召回更高质量候选。
- 再视需要接 Cross-Encoder 或其他 reranker 精排。

## 什么时候适合使用 ColBERT v2

更适合：

- 检索质量比极限吞吐更重要。
- query 和答案之间存在细粒度语义对应关系。
- 普通 single-vector dense retrieval 召回不稳定。
- 愿意为更高质量召回承担更复杂的索引和部署成本。

不一定优先：

- 语料极大但资源预算有限。
- 更看重系统简单性和通用向量数据库兼容性。
- 需求主要是高吞吐、低成本的通用语义召回。
- 场景高度依赖精确术语匹配，此时 BM25 或 Hybrid Retrieval 往往仍然必要。

## 与相关节点的关系

ColBERT v2 是 [Late Interaction](../index.md) 路线下的代表模型。

它和 [Embedding](../../embedding/index.md) 下的 E5 这类模型不是父子关系，而是同属 Dense Retrieval 下的不同技术路线：

- E5 代表 single-vector embedding retrieval。
- ColBERT v2 代表 multi-vector late interaction retrieval。

它和 Sparse Retrieval 的关系是互补而不是替代：

- BM25 更稳地处理术语、实体名、编号和精确匹配。
- ColBERT v2 更擅长细粒度语义匹配。
- 实际系统里，二者可以组成 hybrid retrieval。

它和 reranker 的关系是前后衔接：

- ColBERT v2 负责更强的候选召回。
- reranker 负责更昂贵但更精细的最终排序。

## 待整理

- ColBERT：late interaction 检索模型原始版本。
- MaxSim：ColBERT 常用的 token 级聚合方式。
- PLAID：加速 ColBERT 类检索的引擎。
- Denoised Supervision：用于提升训练质量的监督策略。
- Residual Compression：降低多向量索引体积的方法。
