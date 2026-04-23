# E5

## 核心理解

E5 是一个文本 embedding 模型系列，不是单个固定模型，也不只是某一种训练方式。

更准确地说，E5 是一组面向语义检索训练出来的 embedding 模型家族。它包含不同规模和语言覆盖的具体模型，例如 small、base、large 和 multilingual 版本。

这些模型的共同目标是：把 query 和 passage 编码到同一个向量空间里，让语义相关的文本向量更近，让语义无关的文本向量更远。

## E5 是模型还是训练方式

E5 可以从三个层次理解：

```text
Embedding：文本向量表示这个大类
E5：一种具体 embedding 模型家族
e5-small / e5-base / e5-large / multilingual-e5-large：具体可用模型
```

对比学习、query / passage 前缀、大规模文本对训练，是 E5 这类检索 embedding 模型的重要训练和使用特征，但它们本身不等同于 E5。

所以不能简单说“E5 是一种训练方式”。它更像是：使用特定训练数据和训练目标得到的一组 embedding 模型。

## 语义相似度如何学出来

Embedding 模型不能靠手写规则保证语义相似度。它主要通过训练目标、样本构造、向量空间约束和检索评测共同得到可用的相似度空间。

训练数据通常会包含 query、正样本文档和负样本文档：

```text
query: 如何提升 RAG 检索效果
positive passage: RAG 检索质量受 chunking、embedding 模型、向量索引和 reranker 影响。
negative passage: LoRA 是一种参数高效微调方法。
```

训练目标是让 query 更接近 positive passage，远离 negative passage：

```text
similarity(query, positive) > similarity(query, negative)
```

模型不是直接理解“相似度”这个词，而是在大量样本中学习：什么样的 query 和 passage 应该互相靠近，什么样的文本虽然字面相似但任务上不相关。

## 对比学习

E5 这类模型常使用对比学习或排序损失来训练向量空间。

对比学习的基本思想是：

- 正样本对：语义相关，向量距离应更近。
- 负样本对：语义不相关或相关性较弱，向量距离应更远。
- 难负样本：表面上相似但不是正确答案，用来提高模型区分能力。

例如：

```text
query: dense retrieval 怎么工作
positive: Dense Retrieval 会把查询和文档编码成向量，并通过近邻搜索召回结果。
hard negative: Sparse Retrieval 依赖倒排索引和词项匹配召回候选文档。
```

这个 hard negative 和 query 都在讲 retrieval，但答案方向不同。模型如果能区分这类样本，检索质量通常会更稳定。

## Query 和 Passage 前缀

E5 的一个重要使用习惯是给输入加角色前缀：

```text
query: how to improve retrieval recall
passage: Dense Retrieval uses embeddings to retrieve semantically similar documents.
```

其中：

- `query:` 用于用户查询。
- `passage:` 用于文档、段落或 chunk。

这些前缀不是装饰性文本，而是和模型训练方式相关。模型训练时学习过 query 和 passage 的不同角色，推理时保持相同格式，通常更容易得到稳定的检索结果。

如果省略前缀，模型仍然能输出向量，但向量空间可能不再完全符合训练时的任务格式，召回效果可能下降。

## 在 Dense Retrieval 中的位置

E5 位于 Dense Retrieval 的 embedding model 层。

离线索引时：

```text
document chunk -> E5 with passage prefix -> passage vector -> vector index
```

在线查询时：

```text
query -> E5 with query prefix -> query vector -> similarity search
```

这两条链路必须使用兼容的模型、前缀规则、归一化方式和相似度函数。否则 query vector 和 passage vectors 之间的相似度会失去可靠意义。

## 向量归一化与相似度

E5 常见用法会对输出向量做归一化，然后使用 cosine similarity 或 dot product 做检索。

如果向量已经归一化，cosine similarity 和 dot product 在排序上通常接近。

工程实现中要保持一致：

```text
index vectors: normalized E5 passage embeddings
query vector: normalized E5 query embedding
similarity: cosine or dot product
```

不要在索引阶段和查询阶段使用不同的归一化策略。否则相似度分布可能不稳定，召回结果也会漂移。

## 工程实现要点

使用 E5 构建检索系统时，通常需要固定以下配置：

- 模型名称和版本。
- 输入前缀规则。
- 最大 token 长度。
- chunking 策略。
- 向量维度。
- 是否做向量归一化。
- 相似度函数。
- 向量索引参数。
- embedding 生成时间和模型版本记录。

文档向量一旦写入索引，就和当时的模型版本绑定。升级 E5 模型、切换模型规模或改变前缀格式后，通常需要重新生成 document embeddings 并重建索引。

## 适用场景

E5 适合：

- 语义搜索。
- RAG 文档召回。
- FAQ 和知识库检索。
- 跨表达方式的问题匹配。
- 多语言或跨语言检索。
- 文本相似度计算。
- 候选召回后接 reranker 的两阶段检索。

它尤其适合 query 和 passage 用词不完全一致，但语义相关的场景。

## 常见问题

### 1. 没有加 query / passage 前缀

如果文档和查询都直接输入原文，模型可能无法充分利用训练时学到的任务格式，导致召回质量下降。

### 2. 查询向量和文档向量来自不同模型

E5 的 query vector 必须和 passage vector 处在兼容的向量空间中。

如果查询用一个模型编码，文档用另一个模型编码，相似度计算通常没有可靠意义。

### 3. 模型升级后没有重建索引

切换 E5 版本后，旧文档向量仍然来自旧模型。

这会造成 query vector 和 passage vectors 不匹配。工程上应把 embedding model version 写入索引元数据，并在模型升级时安排重建。

### 4. 对精确术语召回不稳定

E5 是 dense embedding 模型，强项是语义匹配，不一定稳定处理错误码、函数名、文件路径、产品型号等精确匹配需求。

这类场景通常需要结合 BM25 或其他 Sparse Retrieval 方法，形成 Hybrid Retrieval。

## 与相关节点的关系

E5 是 Embedding 的一个具体模型系列。

它服务于 Dense Retrieval 的表示学习阶段，生成 query embedding 和 document embedding。后续向量会进入 Vector Index 或 Vector Database，通过相似度搜索召回候选结果。

和 BM25 相比，E5 更关注语义接近；BM25 更关注词项匹配。实际 RAG 系统里，两者经常组合使用。

## 待整理

- Query Prefix：E5 查询输入的任务前缀。
- Passage Prefix：E5 文档输入的任务前缀。
- Contrastive Learning：让正样本更近、负样本更远的训练方法。
- Hard Negative：表面相似但不相关的负样本。
- Multilingual E5：面向多语言检索的 E5 版本。
- Vector Normalization：检索前统一向量尺度的方法。
- Model Versioning：记录 embedding 模型版本。
- Hybrid Retrieval：结合 E5 与 BM25 的召回方式。
