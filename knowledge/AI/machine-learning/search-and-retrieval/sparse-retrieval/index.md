# Sparse Retrieval

## 核心理解

Sparse Retrieval 是一类“基于词项的检索方法”。

它的基本想法是：先把文档拆成词项，再记录每个词项出现在哪些文档里。用户查询时，系统根据查询词与文档词项之间的匹配关系召回候选文档，并用打分函数对结果排序。

之所以叫 sparse，是因为每篇文档只包含词表中的很少一部分词。假设整个语料库有 100 万个词项，一篇文档可能只出现其中几百个。把文档表示成词项向量时，大部分维度都是 0，只有少数出现过的词项有值。

## 一个简单例子

假设有三篇文档：

- Doc 1: `neural search uses embeddings`
- Doc 2: `keyword search uses inverted index`
- Doc 3: `hybrid search combines keyword and embeddings`

用户查询：

```text
keyword search
```

Sparse Retrieval 会先关注查询中的词项：

- `keyword`
- `search`

然后查这些词项出现在哪些文档中：

```text
keyword -> Doc 2, Doc 3
search  -> Doc 1, Doc 2, Doc 3
```

所以 Doc 2 和 Doc 3 会比 Doc 1 更可能相关，因为它们同时命中了 `keyword` 和 `search`。

这就是 sparse retrieval 的核心：先靠词项重合找到候选文档，再根据词项的重要性和出现情况排序。

## 倒排索引

倒排索引是 Sparse Retrieval 最常用的底层数据结构。

它把关系从“文档包含哪些词”反过来，组织成“词出现在哪些文档中”：

```text
bm25      -> Doc 7, Doc 18, Doc 42
retrieval -> Doc 3, Doc 7, Doc 91
sparse    -> Doc 7, Doc 35
```

查询时，系统可以直接取出查询词对应的文档列表，再合并、过滤和打分。

## 从匹配到排序

只知道“哪些文档包含查询词”还不够，因为结果需要排序。

排序函数通常要考虑：

- 查询词是否出现。
- 查询词在文档中出现多少次。
- 查询词在整个语料库中是否常见。
- 文档长度是否会影响匹配结果。

这一步决定了 sparse retrieval 不只是“包含关键词就返回”，而是要判断哪些匹配更重要。

## TF-IDF

TF-IDF 是经典的词项加权方法。

它的核心直觉是：一个词如果在当前文档中经常出现，同时在整个语料库中不太常见，那么它更能代表这篇文档。

## BM25

BM25 是关键词检索中非常常见的排序函数，通常是 sparse retrieval 的强基线。

它可以理解为对 TF-IDF 的实用改进：既考虑词项稀有程度，也考虑词频收益递减和文档长度影响。

详见：[BM25](bm25/index.md)。

## Learned Sparse Retrieval

Learned Sparse Retrieval 使用模型学习词项权重，而不是只依赖人工设计的统计公式。

它仍然保留稀疏词项表示和可索引性，但可以通过模型学习获得更强的语义扩展能力。SPLADE 是代表方法之一。

## 和 Dense Retrieval 的区别

Sparse Retrieval 的表示维度通常对应词表中的词项，大部分维度为 0。它擅长精确匹配、术语匹配、实体匹配和可解释搜索。

Dense Retrieval 把文本编码成低维稠密向量，大部分维度都有值。它擅长语义相似、同义表达和模糊意图匹配。

两者的差异可以这样理解：

```text
Sparse Retrieval 更像“查词典”：看哪些词命中了，命中的词有多重要。
Dense Retrieval 更像“看意思”：判断两段文本语义上是否接近。
```

在实际系统中，两者经常组合成 Hybrid Search。Sparse Retrieval 保证关键词、实体、术语不丢；Dense Retrieval 补充语义召回；最后再用 reranker 对候选结果重新排序。

## 什么时候优先考虑 Sparse Retrieval

适合：

- 查询里有明确关键词、专业术语、实体名、产品名、代码符号。
- 需要可解释结果，能说明为什么某篇文档被召回。
- 需要低成本、高吞吐、成熟稳定的检索系统。
- 需要作为 RAG 或搜索系统的第一阶段召回。

不适合单独使用：

- 用户表达很口语化，和文档用词差异很大。
- 任务更依赖语义相似，而不是词项重合。
- 查询需要理解上下文、隐含意图或复杂改写。

## 待整理

- TF-IDF
- Learned Sparse Retrieval
- SPLADE
- Hybrid Search
