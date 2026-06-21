# N-gram

## 核心理解

N-gram 是文本中连续出现的 $n$ 个基本单位组成的片段。

这些基本单位可以是字符、词、token 或音节。最常见的是 word n-gram 和 character n-gram。

例如句子：

```text
I love machine learning
```

如果按词切分：

- unigram：`I`、`love`、`machine`、`learning`
- bigram：`I love`、`love machine`、`machine learning`
- trigram：`I love machine`、`love machine learning`

其中：

- unigram 表示 1-gram。
- bigram 表示 2-gram。
- trigram 表示 3-gram。

N-gram 的核心思想是：局部连续片段可以携带语言结构信息。相比只看单个词，n-gram 能捕捉一定范围内的顺序关系。

## 工作机制 / 构建过程

构建 n-gram 通常包括以下步骤：

1. 选择基本单位：按字符、词、subword token 或其他单位切分文本。
2. 设置 $n$ 的大小：例如 $n=1$、$n=2$、$n=3$。
3. 使用滑动窗口从序列中抽取连续片段。
4. 对抽取出的 n-gram 计数、建索引或作为模型特征。

假设 token 序列是：

$$
x_1, x_2, \ldots, x_T
$$

那么一个 n-gram 可以表示为：

$$
(x_i, x_{i+1}, \ldots, x_{i+n-1})
$$

其中：

$$
1 \le i \le T - n + 1
$$

也就是说，长度为 $T$ 的序列中，一共可以抽取：

$$
T - n + 1
$$

个连续 n-gram。

## N-gram 语言模型

在统计语言模型中，n-gram 常用于估计下一个词出现的概率。

完整语言模型希望估计：

$$
P(w_1, w_2, \ldots, w_T)
$$

根据链式法则，可以写成：

$$
P(w_1, w_2, \ldots, w_T) =
\prod_{t=1}^{T} P(w_t \mid w_1, \ldots, w_{t-1})
$$

但直接依赖全部历史上下文会非常稀疏。N-gram 语言模型做了一个近似：只看最近的 $n-1$ 个词。

例如 trigram 语言模型近似为：

$$
P(w_t \mid w_1, \ldots, w_{t-1})
\approx
P(w_t \mid w_{t-2}, w_{t-1})
$$

这个假设让概率估计变得可计算。模型可以从 corpus 中统计 n-gram 出现次数，并估计条件概率：

$$
P(w_t \mid w_{t-n+1}, \ldots, w_{t-1})
=
\frac{
C(w_{t-n+1}, \ldots, w_t)
}{
C(w_{t-n+1}, \ldots, w_{t-1})
}
$$

其中 $C(\cdot)$ 表示出现次数。

## 实现方法与工程细节

N-gram 常见用途包括：

- 文本特征：把 n-gram 作为分类、聚类或相似度计算的特征。
- 语言模型：用局部上下文估计下一个词概率。
- 信息检索：用 n-gram 支持短语匹配、模糊匹配和候选召回。
- 拼写纠错：通过字符 n-gram 识别相似词形。
- 分词与短语抽取：统计连续片段是否稳定共现。
- 文本去重：用字符或 token n-gram 衡量文本重叠程度。

工程上需要关注：

- $n$ 的大小：$n$ 越大，上下文信息越多，但稀疏性越强。
- 词表规模：word n-gram 容易产生很大的特征空间。
- 低频过滤：通常会删除过低频的 n-gram，降低噪声和存储成本。
- 平滑方法：语言模型中需要处理未见过的 n-gram。
- 分词方式：不同 tokenizer 会显著影响 n-gram 结果。
- 字符级与词级：character n-gram 更适合处理拼写、形态变化和未登录词；word n-gram 更适合表达短语语义。

## 数据稀疏问题

N-gram 的主要问题是数据稀疏。

当 $n$ 变大时，可能组合数量会迅速增加。很多合理的词序列在训练 corpus 中从未出现过，导致概率估计为 0。

例如一个 bigram 在语料中可能出现过：

```text
machine learning
```

但一个更长的 5-gram 即使语义合理，也可能因为语料规模有限而没有出现。

为了解决这个问题，传统 n-gram 语言模型通常会使用平滑方法，例如：

- Add-one smoothing
- Good-Turing smoothing
- Kneser-Ney smoothing
- Backoff
- Interpolation

这些方法的核心目标是：不要让未见过的 n-gram 概率直接变成 0，同时把概率质量合理分配给低频或未出现的片段。

## 与神经语言模型的关系

N-gram 语言模型是神经语言模型之前的重要统计方法。

它的优势是简单、可解释、训练和查询成本较低。但它只能建模固定长度的局部上下文，很难捕捉长距离依赖和复杂语义关系。

神经语言模型，尤其是 Transformer，可以基于上下文中的大量 token 计算连续表示，表达能力远强于传统 n-gram 模型。

但 n-gram 并没有失去价值。它仍然常用于：

- 快速文本特征。
- 检索系统中的短语或字符片段匹配。
- 拼写纠错和模糊搜索。
- 数据清洗和重复检测。
- 作为理解语言模型历史演进的基础概念。

## 常见误解

N-gram 不一定是词级片段。它也可以是字符级、token 级或其他单位的连续片段。

N-gram 不是 Transformer 的注意力机制。N-gram 只记录固定窗口内的连续片段，attention 可以动态关注上下文中的不同位置。

N-gram 也不等于 tokenizer。Tokenizer 负责把文本切分成基本单位，n-gram 是在这些单位上进一步抽取连续片段。

N-gram 的 $n$ 不是越大越好。更大的 $n$ 能包含更长上下文，但会带来更严重的数据稀疏、内存占用和泛化问题。

## 与相关节点的关系

N-gram 属于 `NLP` 下的基础文本表示和统计语言建模节点。

它和 `Corpus` 的关系很直接：n-gram 的频率、概率和覆盖范围都来自 corpus 统计。

它也和 `Inverted Index` 有关系：检索系统可以使用 n-gram 或 phrase extraction 改善短语匹配和模糊匹配。

它和 `Transformer`、`BERT` 的关系更多是历史和对比关系：n-gram 是传统统计 NLP 的局部上下文建模方法，Transformer 则使用神经网络表示和注意力机制建模更长、更灵活的上下文。

## 待整理

- Smoothing：处理未见 n-gram 的概率估计方法。
- Backoff：高阶 n-gram 不可靠时退回低阶模型。
- Kneser-Ney Smoothing：经典 n-gram 平滑方法。
- Character N-gram：按字符抽取连续片段。
- Word N-gram：按词抽取连续片段。
- Skip-gram：允许中间跳过部分 token 的片段表示。
