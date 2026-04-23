# Search & Retrieval

## 核心理解

Search & Retrieval 研究如何从大量信息中找到与用户需求最相关的内容。

在机器学习与 AI 系统中，它通常不只是“搜索关键词”，还包括如何表示查询和文档、如何召回候选结果、如何排序结果，以及如何把检索结果接入下游任务。

## 关键问题

- 用户真正想找什么？
- 信息应该如何被表示和索引？
- 如何从大规模数据中快速召回候选内容？
- 如何判断结果是否相关？
- 如何在准确性、速度、成本和可解释性之间取舍？

## 主要方向

- [Sparse Retrieval](sparse-retrieval/index.md)：基于稀疏词项表示的检索方式，例如倒排索引、TF-IDF、BM25。
- [Dense Retrieval](dense-retrieval/index.md)：基于向量表示和相似度计算的检索方式。
- Hybrid Retrieval：结合关键词检索与语义检索，提高召回覆盖和结果稳定性。
- 排序与重排：对召回结果进一步排序，提升最终结果质量。
- RAG：将检索结果作为上下文提供给生成模型，支持问答、总结和推理。

## 与机器学习的关系

Search & Retrieval 是机器学习系统中的基础能力之一。

它既可以作为独立的信息检索系统存在，也可以作为更复杂 AI 应用的组成部分，例如推荐系统、问答系统、Agent、知识库助手和代码搜索工具。

## 待整理

- [Sparse Retrieval](sparse-retrieval/index.md)
- [Dense Retrieval](dense-retrieval/index.md)
- Embedding
- Vector Database
- Hybrid Search
- Reranking
- RAG
