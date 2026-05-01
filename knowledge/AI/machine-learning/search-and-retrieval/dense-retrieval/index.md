# Dense Retrieval

## 核心理解

Dense Retrieval 是一类“基于向量语义表示的检索方法”。

它的基本想法是：先用模型把查询和文档编码成稠密向量，再通过向量相似度找到语义上接近的内容。相比依赖词项重合的 Sparse Retrieval，Dense Retrieval 更关注“意思是否相近”。

之所以叫 dense，是因为文本被表示成低维稠密向量。向量中的大多数维度都有数值，而不是像词项向量那样大部分维度为 0。

## 整体流程

Dense Retrieval 可以分成两条链路：离线索引链路和在线查询链路。

离线索引链路负责把内容变成可检索的向量索引：

```text
documents -> chunking -> document embeddings -> vector index
```

在线查询链路负责把用户查询变成查询向量，并从索引中找出相近内容：

```text
query -> query embedding -> similarity search -> top k results
```

这两条链路通过同一个向量空间连接起来。文档向量先被写入索引，查询向量后来进入同一个空间做近邻搜索。

## 1. 内容准备：从文档到文本块

Dense Retrieval 通常不会直接把整篇长文档编码成一个向量。

如果文档太长，一个向量会混合多个主题，导致语义表示变得模糊。因此系统通常会先把文档切成 chunk，再对每个 chunk 单独生成 embedding。

切分时需要权衡：

- chunk 太长：容易稀释重点。
- chunk 太短：容易丢失上下文。
- overlap 太大：召回更稳，但索引和存储成本更高。

这一步的产出不是最终搜索结果，而是一组可以被向量化的文本单元。

## 2. 表示学习：从文本到向量

Embedding 模型负责把文本映射到向量空间。

在这个空间里，语义接近的文本应该距离更近。例如“如何提高检索召回率”和“怎么让搜索结果更全”可能没有大量关键词重合，但向量表示应该比较接近。

Dense Retrieval 的效果很大程度取决于 embedding 模型是否适合当前语料和任务。

### Bi-Encoder

Dense Retrieval 通常使用 Bi-Encoder 结构。

Bi-Encoder 会分别编码查询和文档：

```text
query    -> query encoder    -> query vector
document -> document encoder -> document vector
```

这样文档向量可以提前离线计算并写入索引，查询时只需要编码用户查询，再和已有文档向量做相似度搜索。

如果使用 Cross-Encoder，查询和文档需要一起输入模型计算相关性，效果可能更强，但很难直接用于大规模第一阶段召回。

## 3. 内容索引：把文档向量存起来

文档 chunk 被编码成向量后，需要写入向量索引。

每条索引记录通常不只包含向量本身，还会包含：

- chunk id
- 原始文档 id
- 文本内容或文本位置
- 元数据，例如标题、时间、权限、来源
- embedding 模型版本

内容索引的目标是让查询阶段可以快速从大量文档向量中找到候选内容。

## 4. 查询编码：把用户问题变成查询向量

查询阶段开始时，系统会用 embedding 模型把用户查询编码成 query vector。

这个 query vector 必须和文档向量处在兼容的向量空间中。通常它们来自同一个 embedding 模型，或者来自同一套训练目标下的 query encoder 和 document encoder。

如果查询编码和文档编码不兼容，相似度计算就失去意义：系统计算出来的是两个不同向量空间里的距离，而不是语义接近程度。

## 5. 相似度计算：判断查询和内容是否接近

有了 query vector 和 document vectors 后，系统需要一个相似度函数判断它们是否接近。

常见指标包括：

- Cosine Similarity：比较两个向量方向是否接近。
- Dot Product：计算两个向量的内积，常用于已归一化或模型训练目标匹配的场景。
- L2 Distance：比较两个向量之间的欧氏距离。

实际使用哪一种，通常取决于 embedding 模型的训练方式和向量数据库的索引配置。

相似度函数不是独立存在的，它服务于近邻检索：给定一个查询向量，找到相似度最高或距离最近的文档向量。

## 6. 近邻检索：从向量索引中召回 Top K

如果文档数量很小，或者系统需要一个精确基线，也可以直接使用 Flat 方式扫描全部向量。

但真实系统通常有大量向量，暴力计算成本太高，所以会使用近似最近邻索引，也就是 ANN index。

常见 ANN 方法包括：

- HNSW
- IVF
- PQ
- ScaNN

ANN 的作用是在速度、成本和召回率之间做折中。它不一定保证找到绝对最近的向量，但能在大规模数据上快速找到足够接近的候选结果。

### Vector Index 和 Vector Database

Vector Index 是向量近邻搜索使用的数据结构，例如 HNSW 图索引或 IVF 聚类索引。

Vector Database 则通常是在向量索引之上提供完整系统能力，包括：

- 向量写入、更新和删除。
- 元数据过滤。
- 权限或租户隔离。
- 持久化存储。
- 分片、扩容和副本。
- 查询接口和运维能力。

因此，向量索引解决“怎么更快找到近邻”，向量数据库解决“怎么把向量检索作为系统能力稳定运行”。

## 7. 结果使用：重排、融合与 RAG

Dense Retrieval 返回的 Top K 通常只是第一阶段候选结果。

后续系统可能会：

- 用 reranker 对候选结果重新排序。
- 和 BM25 等 Sparse Retrieval 结果做 Hybrid Retrieval。
- 根据权限、时间、来源等元数据过滤。
- 把召回内容作为上下文提供给生成模型，用于 RAG。

因此 Dense Retrieval 更准确地说是“召回模块”，不是完整搜索系统的全部。

## 和 Sparse Retrieval 的区别

Sparse Retrieval 的表示维度通常对应词表中的词项，大部分维度为 0。它擅长精确匹配、术语匹配、实体匹配和可解释搜索。

Dense Retrieval 把文本编码成低维稠密向量，大部分维度都有值。它擅长语义相似、同义表达、口语化查询和跨词面表达的匹配。

两者的差异可以这样理解：

```text
Sparse Retrieval 更像“查词典”：看哪些词命中了，命中的词有多重要。
Dense Retrieval 更像“看意思”：判断两段文本语义上是否接近。
```

在实际系统中，两者经常组合成 Hybrid Search。Sparse Retrieval 保证关键词、实体、术语不丢；Dense Retrieval 补充语义召回；最后再用 reranker 对候选结果重新排序。

## 什么时候优先考虑 Dense Retrieval

适合：

- 查询和文档用词不同，但语义相近。
- 用户查询比较口语化、模糊或意图型。
- 需要语义搜索、相似文本搜索、问答召回或 RAG 上下文召回。
- 需要跨语言或多模态检索，并且已有合适的 embedding 模型。

不适合单独使用：

- 查询高度依赖精确术语、错误码、编号、文件名或代码符号。
- 需要强可解释性，必须说明命中了哪些词项。
- 语料频繁更新，而向量重建、增量索引和一致性成本较高。
- embedding 模型和业务领域差异较大，导致语义表示不可靠。

## 工程实现要点

Dense Retrieval 的效果高度依赖 embedding 模型、切分策略、索引参数和评测集。

常见工程问题包括：

- 文档切分粒度：chunk 太长会稀释语义，太短会丢失上下文。
- 向量维度与存储成本：维度越高，存储和计算成本通常越高。
- 索引召回率与延迟：ANN 参数会影响速度和召回质量。
- 模型版本管理：embedding 模型变更后，旧向量通常需要重新生成。
- 数据更新：新增、删除和修改文档时，需要处理向量索引与原始内容的一致性。
- 结果重排：Dense Retrieval 召回后，常配合 reranker 提升最终排序质量。

## 子节点

- [Embedding](embedding/index.md)：把文本映射成向量表示。
- [Flat](flat/index.md)：对全部向量做精确相似度扫描的基础检索方式。
- [FAISS](faiss/index.md)：常用的向量相似度搜索库与索引实现。
- [Late Interaction](late-interaction/index.md)：保留 token 级表示，在查询时做细粒度匹配。

## 待整理

- Vector Index：支持高效向量近邻搜索的索引结构。
- Vector Database：管理向量检索、元数据和运维能力的系统。
- ANN：用近似方法加速最近邻搜索。
- HNSW：常用图索引方法，兼顾速度和召回。
- IVF：基于聚类划分搜索空间的向量索引方法。
- PQ：用量化压缩向量，降低存储和计算成本。
- Chunking：把长文档切成适合检索的文本片段。
- Bi-Encoder：分别编码查询和文档的双塔检索模型。
- Reranking：对召回候选进行更精细的二阶段排序。
