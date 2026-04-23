# Embedding

## 核心理解

Embedding 是把文本、图片、音频或其他对象映射成向量表示的方法。

在 Dense Retrieval 中，Embedding 通常指文本 embedding：把 query 和 document chunk 编码成向量，使它们可以在同一个向量空间里比较语义相似度。

它解决的问题不是“文本里有哪些词”，而是“这段文本表达的意思是什么”。

## 在 Dense Retrieval 流程中的位置

Embedding 位于 Dense Retrieval 的表示学习阶段。

离线索引时：

```text
document chunks -> embedding model -> document vectors
```

在线查询时：

```text
query -> embedding model -> query vector
```

这两条链路必须进入兼容的向量空间。否则 query vector 和 document vector 之间的相似度没有可靠意义。

## 文本到向量

Embedding 模型会把一段文本转换成固定长度的数值向量，例如：

```text
"how to improve retrieval recall"
  -> [0.12, -0.03, 0.88, ...]
```

向量本身通常不容易被人直接解释，但它会承载文本的语义信息。

理想情况下：

- 语义相近的文本，向量距离更近。
- 语义无关的文本，向量距离更远。
- 不同表达方式但相同含义的文本，也能被映射到相近位置。

## Query Embedding 和 Document Embedding

在检索系统中，通常要区分两类 embedding。

### Query Embedding

Query Embedding 是用户查询的向量表示。

它通常更短、更意图化，例如：

```text
"怎么提升 RAG 检索效果"
```

模型需要理解用户真正想找的是检索质量、召回、重排、chunking 或 embedding 相关内容。

### Document Embedding

Document Embedding 是文档或文本块的向量表示。

它通常来自文档切分后的 chunk，例如：

```text
"Dense Retrieval 的效果高度依赖 embedding 模型、切分策略、索引参数和评测集。"
```

文档 embedding 会被离线生成并写入向量索引。

## 为什么不直接用整篇文档做 Embedding

长文档往往包含多个主题。

如果把整篇文档压缩成一个向量，向量会混合太多信息，导致检索时难以准确匹配某个局部主题。

因此 Dense Retrieval 通常先做 chunking，再对每个 chunk 生成 embedding。

```text
long document
  -> chunk 1 -> embedding 1
  -> chunk 2 -> embedding 2
  -> chunk 3 -> embedding 3
```

这样查询可以命中具体文本块，而不是只命中整篇文档。

## 相似度如何使用 Embedding

Embedding 生成向量后，系统会用相似度函数比较 query vector 和 document vectors。

常见相似度指标包括：

- Cosine Similarity：比较向量方向是否接近。
- Dot Product：计算向量内积。
- L2 Distance：计算向量之间的欧氏距离。

相似度计算依赖 embedding 的质量。Embedding 如果不能把语义关系编码好，后面的向量索引和近邻搜索也无法补救。

## 常见 Embedding 模型

常见文本 embedding 模型包括：

### Sentence-BERT

Sentence-BERT 是基于 BERT 改造的句向量模型系列。

它让句子可以被直接编码成向量，并用向量相似度比较语义接近程度。相比原始 BERT 更适合语义搜索、相似句匹配和检索任务。

### E5

[E5](e5/index.md) 是常用的文本 embedding 模型系列，覆盖 small、base、large 和 multilingual 等不同版本。

它不是单一模型，也不只是训练方式，而是一组面向语义检索训练出来的 embedding 模型家族。E5 通常会区分 query 和 passage 的输入格式，例如给查询加 `query:` 前缀，给文档加 `passage:` 前缀。

### BGE

BGE 是常见的通用 embedding 模型系列，包含英文、中文和多语言版本。

它在中文语义检索、知识库问答和 RAG 场景中比较常见，也经常和 reranker 搭配使用。

### GTE

GTE 是通用文本 embedding 模型系列，常用于语义搜索、聚类、分类和检索任务。

它的定位偏通用向量表示，可以作为 Dense Retrieval 的 embedding 模型候选。

### OpenAI Embeddings

OpenAI 提供通用 embedding 模型，例如 `text-embedding-3-small` 和 `text-embedding-3-large`。

这类模型常用于语义搜索、RAG、推荐、聚类和分类等场景，优点是接口稳定、通用性强，缺点是需要考虑调用成本、数据合规和外部服务依赖。

## 好的 Embedding 需要满足什么

一个适合检索任务的 embedding 模型通常需要：

- 能表达语义相似性。
- 能处理领域术语和专业概念。
- 能区分相似但不同的问题。
- 对 query 和 document 的表达差异有鲁棒性。
- 和所使用的相似度函数、索引方式匹配。

例如，在技术知识库里，模型需要理解 `BM25`、`HNSW`、`RAG`、`chunking` 这些术语；否则检索结果会不稳定。

## 子节点

- [E5](e5/index.md)：面向语义检索的文本 embedding 模型系列。

## 常见问题

### 1. 语义相近但结果不准

可能原因包括：

- embedding 模型不适合当前领域。
- chunk 切分不合理。
- query 太短或意图不清。
- 文档向量和查询向量来自不兼容模型。

### 2. 精确术语召回失败

Dense Retrieval 不一定擅长精确匹配。

对于错误码、产品型号、函数名、论文名、文件路径等内容，Sparse Retrieval 或 Hybrid Retrieval 往往更稳。

### 3. 模型升级后需要重建索引

Embedding 模型变更后，原有 document vectors 通常需要重新生成。

否则 query vector 来自新模型，document vectors 来自旧模型，两者可能不再处于同一个向量空间。

## 待整理

- Bi-Encoder：分别编码查询和文档的双塔结构。
- Query Encoder：把用户查询编码成向量的模型。
- Document Encoder：把文档内容编码成向量的模型。
- Embedding Model：用于生成向量表示的模型。
- Sentence Embedding：句子级语义向量表示。
- Contrastive Learning：常用于训练语义相似向量空间的方法。
- Domain Adaptation：让 embedding 模型适配特定领域。
- Embedding Evaluation：评估 embedding 检索效果的方法。
