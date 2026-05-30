# Prefill

## 核心理解

Prefill 是 LLM 推理中的第一个阶段，负责把用户输入的 prompt 一次性送进模型，计算出所有输入 token 对应的中间状态，并建立后续生成要用的 KV Cache。

在自回归语言模型中，推理通常分成两个阶段：

1. Prefill：处理已有输入 prompt。
2. Decode：逐 token 生成新的输出。

Prefill 阶段不负责连续生成很多新 token。它的主要目标是读完整个 prompt，建立上下文表示，并得到第一个待生成 token 的 logits。之后模型进入 decode 阶段，每次只生成一个新 token，并复用 prefill 阶段留下的 KV Cache。

所以可以把 prefill 理解为“读题阶段”，decode 理解为“逐字作答阶段”。

## 工作机制 / 构建过程

假设输入 prompt 被 tokenizer 转成 token 序列：

$$
x_1, x_2, \ldots, x_n
$$

Prefill 会把这整段 token 一次性送入 Transformer。模型在每一层 attention 中，为这些 token 计算 query、key、value：

$$
Q = XW_Q
$$

$$
K = XW_K
$$

$$
V = XW_V
$$

其中：

- $X$ 是输入 token 的 hidden states。
- $Q$ 用于查询上下文。
- $K$ 和 $V$ 会被缓存下来，供 decode 阶段复用。

由于 decoder-only LLM 使用 causal attention，第 $t$ 个 token 只能看见它之前和当前位置的 token：

$$
x_1, x_2, \ldots, x_t
$$

Prefill 完成后，模型会得到 prompt 最后一个位置的输出 hidden state，并通过 LM Head 得到下一个 token 的 logits：

$$
z_{n+1} = \text{LMHead}(h_n)
$$

这些 logits 会作为生成第一个新 token 的依据。

同时，prefill 阶段会为后续 decode 留下 KV Cache：

```text
prompt tokens -> transformer forward -> KV Cache + first next-token logits
```

## Prefill 和 Decode 的区别

Prefill 和 decode 的主要区别在于处理的 token 数量和计算形态不同。

Prefill 处理的是完整 prompt。假设 prompt 长度是 $n$，prefill 需要一次性处理 $n$ 个 token，并为这些 token 构建 KV Cache。

Decode 处理的是新生成 token。每一步通常只处理当前新 token，同时读取之前缓存好的 key/value，生成下一个 token。

可以简单比较：

| 阶段 | 输入 | 输出 | 主要作用 |
| --- | --- | --- | --- |
| Prefill | 完整 prompt | KV Cache 和第一个生成位置的 logits | 读入上下文 |
| Decode | 上一步生成的新 token | 下一个 token 的 logits | 逐 token 生成 |

Prefill 通常更像大批量矩阵计算，能较好利用 GPU 并行能力。Decode 因为每次只生成少量 token，更容易受到 KV Cache 读取、显存带宽和调度开销影响。

## 实现方法与工程细节

Prefill 是影响首 token 延迟的重要阶段。用户发出请求后，到模型生成第一个 token 之前的时间，通常叫 TTFT（Time To First Token）。Prompt 越长，prefill 计算越重，TTFT 往往越高。

工程上，prefill 需要关注：

- Prompt Length：输入越长，prefill 需要处理的 token 越多。
- Attention Cost：标准 attention 在序列长度上有较高计算和显存开销。
- KV Cache Allocation：prefill 需要为后续 decode 分配并写入 KV Cache。
- Batching：多个请求一起 prefill 可以提升吞吐，但可能增加单个请求等待时间。
- Chunked Prefill：长 prompt 可以切块处理，避免一次 prefill 占用过多显存或阻塞 decode。
- Prefix Cache：如果多个请求共享相同前缀，可以复用已经计算过的 KV Cache。

在服务系统中，prefill 和 decode 常常会被分开调度。原因是它们的计算形态不同：prefill 更偏大矩阵计算，decode 更偏小步迭代和缓存读取。把两者混在一起可能导致资源利用不稳定。

## 常见误解

Prefill 不是训练阶段。它发生在推理时，只做前向计算，不更新模型参数。

Prefill 也不是“生成完整回答”。它只处理输入 prompt，并准备好生成第一个新 token 所需的状态。真正的连续输出发生在 decode 阶段。

Prefill 不等于 tokenizer。Tokenizer 只是把文本转成 token ID；prefill 是模型对这些 token 做 Transformer 前向计算。

Prefill 也不等于 KV Cache 本身。KV Cache 是 prefill 产生并在 decode 中复用的中间结果，prefill 是建立这些缓存的计算过程。

## 与相关节点的关系

Prefill 属于 `LLM` 下的推理过程节点。

它和 `KV Cache` 的关系最直接：prefill 建立 prompt 部分的 KV Cache，decode 复用这些缓存继续生成。

它和 `LM Head` 也有关：prefill 结束时，模型会用最后一个 prompt 位置的 hidden state 通过 LM Head 得到第一个生成 token 的 logits。

它和 `Serving`、`Batching`、`Context Window`、`PagedAttention` 等工程节点也有关。后续如果新增 LLM 推理系统相关节点，Prefill 可以作为推理流程中的基础节点。

## 待整理

- Decode：逐 token 生成阶段。
- KV Cache：缓存 attention 的 key/value。
- TTFT：从请求开始到首 token 输出的延迟。
- Chunked Prefill：把长 prompt 分块执行 prefill。
- Prefix Cache：复用相同前缀的 KV Cache。
- Continuous Batching：动态合并不同请求的推理调度方式。
