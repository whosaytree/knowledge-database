# LM Head

## 核心理解

LM Head 是语言模型最后把隐藏状态映射到词表空间的输出层。

在 decoder-only LLM 中，Transformer 主体会为当前位置产生一个 hidden state。这个 hidden state 本身还不是 token 概率，它只是模型内部的连续向量表示。LM Head 的作用是把这个向量投影成 vocabulary 中每个 token 的分数，也就是 logits。随后再经过 softmax，得到下一个 token 的概率分布。

可以把 LM Head 理解为模型回答“当前上下文之后，下一个 token 更可能是谁”的最后一步结构。

## 工作机制 / 构建过程

假设模型最后一层输出的隐藏状态是：

$$
h_t \in \mathbb{R}^{d_{\text{model}}}
$$

词表大小是：

$$
|V|
$$

LM Head 通常是一个线性层：

$$
W_{\text{lm}} \in \mathbb{R}^{|V| \times d_{\text{model}}}
$$

它将隐藏状态映射为词表 logits：

$$
z_t = W_{\text{lm}} h_t + b
$$

其中：

- $h_t$ 是第 $t$ 个位置的隐藏状态。
- $z_t$ 是每个 vocabulary token 对应的未归一化分数。
- $W_{\text{lm}}$ 是 LM Head 的权重矩阵。
- $b$ 是可选 bias，很多现代 LLM 不使用 bias。

得到 logits 后，模型再通过 softmax 得到概率分布：

$$
p(x_{t+1} = i \mid x_{\le t}) =
\frac{\exp(z_{t,i})}{\sum_{j \in V} \exp(z_{t,j})}
$$

训练时，LM Head 输出的 logits 会和真实的下一个 token 计算交叉熵损失。推理时，解码策略会基于这些 logits 或概率分布选择下一个 token。

## 实现方法与工程细节

LM Head 通常实现为一个 `Linear(d_model, vocab_size)` 层。

在很多 LLM 中，LM Head 会和 token embedding 共享权重，这通常叫 weight tying。也就是说，输入 token embedding 使用的矩阵和输出 LM Head 使用的矩阵来自同一组参数，只是在输出阶段以转置形式参与计算。

如果 token embedding 矩阵是：

$$
E \in \mathbb{R}^{|V| \times d_{\text{model}}}
$$

那么 tied LM Head 可以写成：

$$
z_t = E h_t
$$

这种做法有几个直接影响：

- 减少参数量，尤其在 vocabulary 很大时效果明显。
- 让输入 token 表示和输出 token 打分共享同一语义空间。
- 在实现上需要保证 embedding 维度和 hidden size 一致。

工程上，LM Head 也是推理成本的重要组成部分。因为每一步生成都要计算所有 vocabulary token 的 logits，当词表很大时，最后的矩阵乘法和 logits 后处理会占据明显开销。

在分布式训练或推理中，LM Head 还可能涉及 vocabulary parallelism。也就是把词表维度切分到不同设备上，每个设备只计算一部分 token 的 logits，最后再进行聚合或选择。

## 常见误解

LM Head 不是注意力层，也不是语言模型的全部输出逻辑。它只负责把最后的 hidden state 转成词表 logits。

LM Head 也不直接“生成文本”。文本生成还依赖 tokenizer、softmax、temperature、top-p、top-k、greedy decoding 等解码过程。LM Head 只提供每个候选 token 的分数。

如果模型输出的是 hidden state，而不是 logits，通常说明还没有经过 LM Head。很多框架会把 Transformer backbone 和 LM Head 分开命名，例如 base model 只输出 hidden states，causal language modeling model 才包含 LM Head。

## 与相关节点的关系

LM Head 属于 `LLM` 下的模型结构节点。

它和 Tokenizer、Embedding Layer、Transformer Block、Softmax、Cross Entropy 都有关联：

- Tokenizer 决定 vocabulary，也就决定 LM Head 的输出维度。
- Embedding Layer 负责把 token ID 映射到 hidden space，LM Head 负责从 hidden space 映射回 vocabulary space。
- Transformer Block 产生 hidden state，LM Head 接收 hidden state 并输出 logits。
- Softmax 把 LM Head 的 logits 转成概率分布。
- Cross Entropy 在训练时使用 LM Head 输出的 logits 计算预测误差。

## 待整理

- Weight Tying：输入 embedding 和输出 head 共享权重。
- Vocabulary Parallelism：按词表维度切分输出层计算。
- Logits：softmax 前的未归一化 token 分数。
