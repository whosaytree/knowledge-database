# Late Interaction

## 核心理解

Late Interaction 是 Dense Retrieval 中的一条重要路线。

它的核心思想不是把 query 和 document 各自压缩成单个向量再比较，而是保留更细粒度的 token 级表示，在检索时再执行相似度聚合。

这样做的目标是兼顾两件事：

- 保留比 single-vector embedding 更丰富的匹配信号。
- 避免像 Cross-Encoder 那样在大规模召回阶段把 query 和每个 document 完整联合编码。

因此，Late Interaction 可以理解为介于 Bi-Encoder 和 Cross-Encoder 之间的一种折中方案：它比单向量召回更细致，比全交互排序更可扩展。

## 工作机制

Late Interaction 通常会把 query 和 document 分别编码成多个 token 向量，而不是单个整体向量。

可以粗略表示为：

```text
query
  -> token embeddings: q1, q2, q3, ...

document
  -> token embeddings: d1, d2, d3, ...
```

检索时，系统不会只比较一个 query vector 和一个 document vector，而是会计算 query token 和 document token 之间的相似度，再按照某种聚合方式得到最终相关性分数。

一个典型思路是：

```text
for each query token:
  找到 document 中最匹配的 token
把这些最好匹配的分数聚合起来
```

这种方式保留了“query 的不同部分分别匹配 document 不同局部”的能力。

## 为什么它比单向量检索更强

Single-vector Dense Retrieval 会把整段 query 和整段 document 各自压缩成一个向量。

这样做扩展性很好，但也会丢失局部匹配信息。例如：

- query 里有多个约束条件。
- document 只在局部段落回答某个条件。
- 不同 token 的重要性不完全相同。

单向量表示容易把这些细节平均掉。

Late Interaction 保留 token 级表示后，系统可以更明确地判断：

- query 中哪些词或子语义被 document 命中。
- 命中发生在 document 的哪些局部位置。
- 一个 document 是否同时覆盖 query 的多个关键部分。

因此，它通常比普通 bi-encoder 检索更擅长细粒度语义匹配。

## 为什么它又比 Cross-Encoder 更适合召回

Cross-Encoder 会把 query 和 document 一起输入模型，让模型直接学习二者的交互。

这种方式效果常常很好，但代价也高：每个 query-document 对都要完整跑一次模型，难以直接用于大规模第一阶段召回。

Late Interaction 把 document 表示提前离线编码并建立索引，查询时只需要：

- 编码 query。
- 读取候选 document 的 token 表示。
- 做向量相似度和聚合。

因此它仍然具备索引化和可扩展检索的能力。

## 实现方法与工程细节

Late Interaction 的工程代价主要来自两个方面。

### 1. 存储成本更高

因为每个 document 不是只存一个向量，而是存一组 token 向量。

如果一个 chunk 有很多 token，索引体积会明显大于 single-vector dense retrieval。

### 2. 查询计算更复杂

检索时需要做 token 级相似度计算和聚合，而不是只算一次整体向量相似度。

这意味着：

- 计算量更大。
- 索引结构更复杂。
- 压缩、剪枝和近似搜索更重要。

### 3. 文档长度控制更关键

文档越长，token 向量越多，索引空间和查询成本越高。

所以这一路线通常更依赖：

- 合理的 chunking。
- token 截断策略。
- 向量压缩或残差压缩。
- 专门为 late interaction 设计的索引引擎。

## 与相关节点的关系

Late Interaction 属于 Dense Retrieval 的一种实现路线。

它和 [Embedding](../embedding/index.md) 的关系是：

- Embedding 节点更关注“文本如何变成向量表示”。
- Late Interaction 更关注“为什么要保留多个 token 向量，以及这些向量在检索阶段如何交互”。

它和常规 Bi-Encoder Dense Retrieval 的关系是：

- 普通 dense retrieval 往往把每段文本压缩成单个向量。
- Late Interaction 则保留多向量表示，换取更细粒度匹配能力。

它和 reranker 的关系是：

- reranker 通常是二阶段精排。
- Late Interaction 可以直接做第一阶段检索，也可以作为更强的召回模块。

## 子节点

- [ColBERT v2](colbert-v2/index.md)：轻量化 late interaction 检索模型。

## 待整理

- MaxSim：为每个 query token 取最佳匹配分数。
- Multi-Vector Retrieval：一个文本对应多个向量的检索方式。
- PLAID：面向 late interaction 的高效检索引擎。
- Residual Compression：压缩 token 向量存储的方法。
