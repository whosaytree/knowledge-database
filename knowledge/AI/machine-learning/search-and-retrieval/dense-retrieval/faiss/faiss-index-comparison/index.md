# Faiss 索引结构对比

## 核心理解

Faiss 里的不同索引结构，本质上是在几组约束之间做权衡：

- 检索速度
- 召回效果
- 内存占用
- 构建成本

最核心的经验可以先记成一句话：

```text
Flat 最准但最慢；HNSW 召回高且快但占内存；IVF 可控速度和召回；PQ / IVFPQ 最省内存但损失精度。
```

因此，Faiss 的索引选择通常不是“哪个最好”，而是“在当前数据规模、延迟目标和内存预算下，哪个最合适”。

## 4 个核心比较维度

比较 Faiss 索引结构时，最常看的通常是下面 4 个维度：

1. 检索速度：query latency、QPS、batch search 效率。
2. 召回效果：Recall@k，例如 Recall@1、Recall@10、Recall@100。
3. 内存占用：index size，包括原始向量、图结构、聚类中心、量化码本等。
4. 构建成本：build time、training time、add time，以及重建代价。

这几个指标经常互相牵制：

- 更快的查询，往往意味着更强的近似，或者更大的额外结构。
- 更高的召回，通常意味着更慢的查询或更高的内存。
- 更低的内存，通常意味着更强的压缩和更大的精度损失。

## 常见 Faiss 索引结构

假设向量维度为 `d`，数据库大小为 `N`。

| 索引类型 | 是否精确 | 检索速度 | 召回效果 | 内存占用 | 构建成本 | 适合场景 |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `IndexFlatL2 / IndexFlatIP` | 精确 | 慢 | 最高 | 高 | 低 | 小规模、评估基准、需要精确结果 |
| `IndexHNSWFlat` | 近似 | 快 | 高 | 很高 | 中高 | 中大规模、高召回、低延迟 |
| `IndexIVFFlat` | 近似 | 快 | 中高 | 高 | 中 | 大规模、速度和召回可调 |
| `IndexIVFPQ` | 近似 | 很快 | 中等 | 低 | 中高 | 超大规模、内存敏感 |
| `IndexPQ` | 近似 | 快 | 较低 | 很低 | 中 | 极度压缩，不追求极高召回 |
| `IndexLSH` | 近似 | 快 | 通常一般 | 中低 | 低 | 二进制哈希类检索，实际用得少 |
| `IndexScalarQuantizer` | 近似 | 中快 | 中高 | 中低 | 中 | 比 PQ 损失小，压缩较温和 |

## 几个最重要的索引

### Flat

典型写法：

```python
index = faiss.IndexFlatL2(d)
```

或者：

```python
index = faiss.IndexFlatIP(d)
```

Flat 会对 query 和库中所有向量逐个计算距离或相似度。

优点：

- 结果精确。
- 不需要训练。
- 实现简单。
- 适合作为其他 ANN 索引的 ground truth。

缺点：

- 数据量大时很慢。
- 内存需要保存完整 `float32` 向量。

内存大致为：

```text
N × d × 4 bytes
```

例如 `N = 1,000,000`，`d = 768`：

```text
1,000,000 × 768 × 4 ≈ 3.07 GB
```

适合：

- 几千到几十万向量。
- 需要精确评估。
- GPU 上做中等规模 brute-force。
- 给 ANN 计算 Recall@k 基准答案。

更详细的单点解释可参考 [Flat](../../flat/index.md)。

### HNSW

典型写法：

```python
index = faiss.IndexHNSWFlat(d, M)
index.hnsw.efSearch = 64
index.hnsw.efConstruction = 200
```

HNSW 会建立近邻图，查询时沿图搜索。

关键参数：

| 参数 | 作用 | 越大意味着 |
| --- | --- | --- |
| `M` | 每个节点的连接数 | 召回更高，内存更大，构建更慢 |
| `efSearch` | 查询时搜索候选范围 | 召回更高，查询更慢 |
| `efConstruction` | 构建图时搜索范围 | 图质量更好，构建更慢 |

优点：

- 召回通常很高。
- 查询很快。
- 不需要像 IVF 那样训练 coarse quantizer。
- 对中高维向量表现通常不错。

缺点：

- 内存占用大。
- 构建时间较高。
- 批量构建和更新不如 IVF 系列灵活。
- GPU 支持不如 Flat、IVF、PQ 系列主流。

HNSW 的内存大致包括：

```text
原始向量内存 + 图边内存
```

其中原始向量仍然是：

```text
N × d × 4 bytes
```

图边额外开销通常还会和 `N × M` 同量级增长。

### IVFFlat

典型写法：

```python
quantizer = faiss.IndexFlatL2(d)
index = faiss.IndexIVFFlat(quantizer, d, nlist)
index.train(xb)
index.add(xb)
index.nprobe = 16
```

IVF 的思想是先把向量聚成 `nlist` 个簇，查询时只搜索其中的 `nprobe` 个簇。

关键参数：

| 参数 | 作用 | 越大意味着 |
| --- | --- | --- |
| `nlist` | 聚类中心数量 / 倒排桶数量 | 每个桶更小，但训练更复杂 |
| `nprobe` | 查询时访问多少个桶 | 召回更高，查询更慢 |

优点：

- 比 Flat 快很多。
- 速度和召回可以通过 `nprobe` 调节。
- 内存接近 Flat。
- 适合大规模检索。
- 是 Faiss 里非常常用的一类结构。

缺点：

- 需要训练。
- 召回依赖聚类质量。
- 数据分布不均时，部分桶可能过大。
- `nprobe` 太小会漏掉真实近邻。

经验设置常见为：

```text
nlist ≈ sqrt(N)
```

也常直接尝试：

```text
4096, 8192, 16384, 32768
```

`nprobe` 可以从下面这些值逐步调：

```text
1, 4, 8, 16, 32, 64, 128
```

### IVFPQ

典型写法：

```python
quantizer = faiss.IndexFlatL2(d)
index = faiss.IndexIVFPQ(
    quantizer,
    d,
    nlist,
    m,
    nbits
)
index.train(xb)
index.add(xb)
index.nprobe = 16
```

IVFPQ 在 IVF 的基础上，把每个向量压缩成 PQ code。

关键参数：

| 参数 | 作用 | 常见值 |
| --- | --- | --- |
| `nlist` | 倒排桶数量 | `4096 / 8192 / 16384` |
| `nprobe` | 查询访问桶数量 | `8 / 16 / 32 / 64` |
| `m` | 子向量段数 | `8 / 16 / 32 / 64` |
| `nbits` | 每段编码 bit 数 | 通常 `8` |

PQ 压缩后的内存大致为：

```text
N × m × nbits / 8 bytes
```

如果 `d = 768, m = 64, nbits = 8`，那么每个向量约为：

```text
64 bytes
```

而原始 `float32` 向量是：

```text
768 × 4 = 3072 bytes
```

压缩比例约为：

```text
3072 / 64 = 48 倍
```

优点：

- 内存极低。
- 适合千万级、亿级向量。
- 查询速度快。
- 可以配合 OPQ 改善量化效果。

缺点：

- 有明显量化误差。
- 召回通常低于 HNSW 和 IVFFlat。
- 参数更复杂。
- 需要训练。
- 对 embedding 分布比较敏感。

## 按规模的粗略选择建议

### 小规模数据：`N < 100k`

优先考虑：

```python
IndexFlatL2 / IndexFlatIP
```

理由：

- 精确。
- 简单。
- 不需要调参。
- 速度通常还能接受。

### 中等规模：`100k ~ 5M`

如果更重视召回和延迟：

```python
IndexHNSWFlat
```

如果希望更可控、更标准：

```python
IndexIVFFlat
```

适合作为 baseline 的常见组合是：

```text
Flat vs HNSW vs IVFFlat
```

### 大规模：`5M ~ 100M`

如果内存充足：

```python
IndexIVFFlat
```

如果内存紧张：

```python
IndexIVFPQ
```

如果召回要求高且内存也足够：

```python
IndexHNSWFlat
```

### 超大规模：`100M+`

通常会优先考虑：

```text
IndexIVFPQ
IndexIVFScalarQuantizer
IndexIVFPQ + OPQ
```

也常配合两阶段检索：

```text
ANN top-100 / top-1000 -> rerank
```

## 几类常见排序

### 召回率

粗略经验通常是：

```text
Flat > HNSW ≈ IVFFlat 高 nprobe > IVFPQ > PQ / LSH
```

更具体一点：

| 索引 | Recall 潜力 |
| --- | --- |
| Flat | `100%` |
| HNSW | 很高，常可到 `0.95+` |
| IVFFlat | 取决于 `nprobe`，可高可低 |
| IVFPQ | 中等到较高，受量化误差影响 |
| PQ | 通常较低 |
| LSH | 不太稳定 |

### 查询速度

粗略经验通常是：

```text
IVFPQ / IVF 小 nprobe / HNSW > IVFFlat 中 nprobe > Flat
```

但这个排序要结合场景理解：

- HNSW 的单 query latency 往往很好。
- IVF 对 batch query 和 GPU 更友好。
- Flat 在 GPU 上也可能很快。
- IVFPQ 因为内存访问少，在超大规模时优势更明显。

### 内存占用

粗略经验通常是：

```text
HNSW > Flat ≈ IVFFlat > ScalarQuantizer > IVFPQ > PQ
```

也可以这样理解：

| 索引 | 是否保存原始 float 向量 | 额外结构 |
| --- | ---: | --- |
| Flat | 是 | 很少 |
| HNSWFlat | 是 | HNSW 图，较大 |
| IVFFlat | 是 | 倒排列表，较小 |
| IVFPQ | 否，保存压缩码 | 码本 + 倒排结构 |
| PQ | 否，保存压缩码 | 码本 |

## 一个实用的 benchmark 框架

不要只停留在理论判断。不同 embedding、维度、数据规模和硬件条件，最终结论可能不同，最好自己测。

### Step 1：先用 Flat 建 ground truth

```python
index_gt = faiss.IndexFlatIP(d)
index_gt.add(xb)
D_gt, I_gt = index_gt.search(xq, k)
```

这里 `I_gt` 可以当作真实 top-k。

### Step 2：构建不同 ANN 索引

例如：

```text
IndexHNSWFlat
IndexIVFFlat
IndexIVFPQ
```

分别执行：

```python
D, I = index.search(xq, k)
```

### Step 3：计算 Recall@k

例如 Recall@10：

```python
def recall_at_k(I_pred, I_gt, k):
    total = 0
    for pred, gt in zip(I_pred, I_gt):
        total += len(set(pred[:k]) & set(gt[:k])) / k
    return total / len(I_pred)
```

### Step 4：统计 latency

```python
import time

start = time.time()
D, I = index.search(xq, k)
elapsed = time.time() - start

qps = len(xq) / elapsed
latency_ms = elapsed / len(xq) * 1000
```

### Step 5：统计内存

可以粗略看序列化后的 index 文件大小：

```python
faiss.write_index(index, "index.faiss")
```

然后统计文件大小：

```python
import os

size_mb = os.path.getsize("index.faiss") / 1024 / 1024
```

这个方法很实用，因为它直接反映索引的实际存储体积。

## 一套常用实验表

| Index | Params | Recall@1 | Recall@10 | Latency / query | QPS | Index size | Build time |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| FlatIP | `-` | `1.000` | `1.000` | 高 | 低 | 高 | 低 |
| HNSWFlat | `M=32, ef=64` | - | - | - | - | - | - |
| HNSWFlat | `M=32, ef=128` | - | - | - | - | - | - |
| IVFFlat | `nlist=4096, nprobe=16` | - | - | - | - | - | - |
| IVFFlat | `nlist=4096, nprobe=64` | - | - | - | - | - | - |
| IVFPQ | `nlist=4096, m=64, nbits=8, nprobe=16` | - | - | - | - | - | - |

## 对 RAG / QA 检索的启发

如果在做 RAG、QA 或知识库检索，不要只看 ANN 的 Recall@k，还要看下游指标：

| 层次 | 指标 |
| --- | --- |
| 向量检索层 | Recall@k、MRR、nDCG |
| 文档召回层 | answer-containing recall |
| QA 下游层 | EM、F1、accuracy、LLM judge score |
| 系统层 | latency、cost、memory、吞吐 |

很多时候，ANN 召回差一点，但如果 top-100 里已经包含相关文档，再经过 reranker 后，最终 QA 效果差距未必大。

因此常见流程会是：

```text
Faiss ANN top-100
-> reranker top-5 / top-10
-> LLM generation
```

这种情况下，`IVFPQ` 或 `IVFFlat` 往往比单纯追求 HNSW 极致召回更划算。

## 实用选择表

| 你的目标 | 推荐索引 |
| --- | --- |
| 我要最准确 | `IndexFlatIP / IndexFlatL2` |
| 我要高召回、低延迟，内存够 | `IndexHNSWFlat` |
| 我要大规模、速度召回均衡 | `IndexIVFFlat` |
| 我要省内存、大规模部署 | `IndexIVFPQ` |
| 我要压缩但别损太多 | `IndexIVFScalarQuantizer` |
| 我要先做 baseline | `Flat + HNSW + IVFFlat` |
| 我要生产级 RAG | `IVFFlat / IVFPQ + reranker` |

## 最简总结

可以这样记：

```text
Flat：
最准确，最慢，内存高。适合 ground truth。

HNSW：
很快，召回高，内存很高。适合内存充足的高质量检索。

IVFFlat：
快，召回可调，内存高。适合大规模常规 ANN。

IVFPQ：
很省内存，很快，召回有损。适合超大规模和生产部署。

PQ：
极省内存，但精度损失较明显。适合压缩优先场景。
```

如果是在做论文实验，比较稳妥的一组 baseline 通常至少包括：

```text
Flat
HNSWFlat
IVFFlat
IVFPQ
BM25
Dense Retriever + Faiss
BM25 + Dense Hybrid
```

同时报告：

```text
Recall@5 / Recall@10 / Recall@100
MRR@10
Latency
Index size
```
