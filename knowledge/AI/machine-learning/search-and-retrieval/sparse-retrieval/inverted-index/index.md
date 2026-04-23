# Inverted Index

## 核心理解

Inverted Index，倒排索引，是关键词检索和 Sparse Retrieval 中最核心的索引结构。

普通文档集合通常可以理解为：

```text
文档 -> 文档中包含哪些词
```

倒排索引采用相反的组织方式：

```text
词项 -> 包含该词项的文档列表
```

例如有三个文档：

```text
doc_1: machine learning retrieval
doc_2: sparse retrieval bm25
doc_3: vector search retrieval
```

可以形成如下倒排索引：

```text
retrieval -> doc_1, doc_2, doc_3
machine   -> doc_1
sparse    -> doc_2
bm25      -> doc_2
vector    -> doc_3
```

当用户查询 `sparse retrieval` 时，系统可以直接访问：

```text
sparse    -> doc_2
retrieval -> doc_1, doc_2, doc_3
```

之后再进行候选集合并、相关性计算和排序。

## 为什么重要

倒排索引解决的是大规模文本检索中的候选定位问题。

在没有索引的情况下，系统需要逐篇扫描文档，判断每篇文档是否包含查询词。文档规模增长后，这种方式很难满足搜索系统对响应时间和吞吐量的要求。

倒排索引把检索过程转换为对词项字典和倒排列表的访问，使系统能够快速找到包含查询词的候选文档。BM25、TF-IDF、布尔检索、短语查询、字段检索等方法通常都建立在倒排索引之上。

## 索引构建过程

### 1. 文档解析

系统首先从原始文档中抽取可检索文本。

原始文档可能来自网页、PDF、Markdown、数据库记录、日志、代码文件、产品文档等。不同来源的文档需要先转换成统一的文本表示，并保留必要的文档 ID、标题、字段、时间、来源等元信息。

### 2. 词项生成

文档文本会被转换成词项序列。

常见处理包括：

- tokenization：把文本切分成 token。
- normalization：统一大小写、全角半角、标点、变体形式。
- stopword filtering：过滤部分高频但区分度较低的词。
- stemming / lemmatization：将词形变化归并到相同形式。
- 中文分词：将连续汉字切分成词或子词。
- n-gram / phrase extraction：按需要保留连续词组或字符片段。

处理后可以得到：

```text
doc_1 -> machine, learning, retrieval
doc_2 -> sparse, retrieval, bm25
doc_3 -> vector, search, retrieval
```

### 3. 词项集合形成

系统会把整个语料库中出现过的词项汇总、去重，形成词项集合，也就是 vocabulary。

```text
vocabulary = {
  machine,
  learning,
  retrieval,
  sparse,
  bm25,
  vector,
  search
}
```

词项集合的大小没有固定值，取决于语料规模、领域、语言、分词策略和过滤规则。

覆盖度是这里的核心取舍：

- 保留更多词项，可以提高长尾词、专有名词、编号、错误码、函数名等内容的召回能力。
- 过滤更多词项，可以降低索引体积和噪声，但可能损失部分精确查询能力。

在知识库、代码搜索、日志搜索和 RAG 场景中，词项集合通常需要特别保留实体名、缩写、版本号、错误码、文件名、函数名和领域术语。

### 4. 倒排列表生成

对每个词项，系统记录它出现在哪些文档中，形成 posting list。

基础形式是：

```text
term -> [doc_id_1, doc_id_2, doc_id_3]
```

更完整的形式会记录词频、位置、字段等信息：

```text
retrieval -> [
  { doc_id: doc_1, term_frequency: 1, positions: [3], field: "body" },
  { doc_id: doc_2, term_frequency: 1, positions: [2], field: "body" },
  { doc_id: doc_3, term_frequency: 1, positions: [3], field: "body" }
]
```

这些信息会被用于：

- 词频统计
- BM25 / TF-IDF 打分
- 短语查询
- 邻近查询
- 字段加权
- 命中片段高亮

### 5. 索引存储

最终产物通常不是单个列表，而是一组可查询、可压缩、可更新的索引结构。

典型组成包括：

```text
term dictionary        词项字典
posting lists          倒排列表
document metadata      文档元信息
collection statistics  语料统计信息
```

在真实检索系统中，这些结构通常以二进制格式存储，并使用压缩与分段策略优化查询性能和存储成本。

常见做法包括：

- 词项字典使用 hash table、B-tree、FST 等结构。
- 倒排列表按 doc_id 排序，便于合并、跳跃和压缩。
- doc_id 常用差值编码、variable-byte、bit packing 等方式压缩。
- 位置信息和字段信息按需存储，避免无谓膨胀。
- 大规模系统通常使用 segment 组织索引，支持增量写入、后台合并和删除标记。

因此，倒排索引的核心产物可以理解为“词项到文档列表的映射”，但工程实现上通常是一套围绕词项字典、倒排列表、文档统计和压缩存储构建的索引系统。

## 查询执行

当用户输入查询：

```text
sparse retrieval
```

系统会对查询执行与文档侧类似的处理：

```text
sparse, retrieval
```

然后分别访问对应的倒排列表：

```text
sparse    -> doc_2
retrieval -> doc_1, doc_2, doc_3
```

接下来根据查询类型生成候选集合：

- OR 查询：包含任一查询词的文档都可以进入候选集。
- AND 查询：必须同时包含所有查询词。
- Phrase 查询：不仅要求词项出现，还要求位置连续。
- Field 查询：只在标题、正文、标签等指定字段中匹配。

如果使用 BM25，系统会进一步结合词频、文档长度、平均文档长度和逆文档频率计算相关性分数。

在上面的例子中，`doc_2` 同时包含 `sparse` 和 `retrieval`，通常会比只包含 `retrieval` 的文档获得更高分数。

## 常见用途

倒排索引常用于：

- 搜索引擎
- 文档知识库
- 企业内部搜索
- 日志搜索
- 代码搜索
- 商品搜索
- RAG 系统中的关键词召回
- Hybrid Retrieval 中的 sparse 分支

它特别适合处理精确词项匹配，例如专有名词、产品型号、错误码、函数名、文件名、人名、地名、机构名、术语和缩写。

## 局限性

倒排索引主要依赖词项匹配，对同义词、改写表达和隐含语义不敏感。

例如用户搜索：

```text
car
```

只依赖倒排索引时，系统不一定能找到只包含：

```text
automobile
vehicle
```

的文档。

因此，在现代知识库和 RAG 系统中，倒排索引通常会与 BM25、查询扩展、Dense Retrieval 和 Reranking 等方法配合使用。
