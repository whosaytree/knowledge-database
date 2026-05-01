# Generalization

## 核心理解

Generalization 讨论的是：一个模型在训练集上学到的规律，能否迁移到未见过的新样本上。

在机器学习里，我们真正关心的不是模型把训练集记住得有多好，而是它离开训练集之后表现如何。这个问题的核心，就是区分训练误差和泛化误差。

## 误差与指标

对于一个包含 $m$ 个样本的数据集，如果其中有 $a$ 个样本被错误分类，则错误率可以写成：

$$
E = \frac{a}{m}
$$

对应地，精度可以写成：

$$
\text{accuracy} = 1 - E
$$

这里的错误率和精度只是度量结果的方式；更关键的是，这个误差究竟是在哪一类数据上计算出来的。

## Training Error 与 Generalization Error

### Training Error

training error 是模型在 training set 上的误差。

它也常被称为 empirical error，也就是经验误差。它反映的是：模型对已经见过的数据拟合得怎么样。

### Generalization Error

generalization error 是模型在新样本上的误差。

它反映的是：模型是否学到了可以迁移到真实数据分布中的规律，而不是只记住了训练集里的局部模式。

我们真正想最小化的是 generalization error。

## 为什么不能只看训练误差

实际训练过程中，优化器只能直接根据训练集上的损失和梯度更新参数，所以它能直接推动下降的，首先是 training error。

这意味着：

- 我们在优化过程中能直接控制的是 training error。
- 但我们最终关心的是 generalization error。
- 这两者并不总是同步下降。

一个模型完全可能在训练集上越来越好，但在新样本上变差。这就是过拟合问题的入口。

## 测试集为什么重要

因为 generalization error 无法直接在“未来所有新样本”上真实计算，所以实践中通常会使用 testing set 来近似评估它。

对应地，testing error 可以看作对 generalization error 的一个近似。

测试集之所以有意义，是因为它在设计上试图模拟模型未来会遇到的真实数据分布。因此：

- 测试集应尽可能与训练集互斥。
- 测试集应尽可能代表真实应用中的样本分布。

如果测试集和训练集高度重合，或者测试集本身不代表真实分布，那么 testing error 对 generalization error 的近似就会失真。

## 与过拟合的关系

过拟合可以粗略理解为：

- training error 很低；
- 但 generalization error 仍然较高。

也就是说，模型学到的不只是稳定规律，还包含了训练集中特有的噪声、偶然性或局部细节。

因此，Generalization 是理解 overfitting、underfitting、validation set、正则化和模型选择的上游基础概念。

### Overfitting

overfitting 可以理解为：模型把 training set 的特殊性，当成了所有潜在样本的一般性。

换句话说，模型不仅学到了数据中的稳定规律，也学到了训练集中特有的偶然模式、噪声或局部细节。

常见原因包括：

- 模型学习能力过强，足以记住训练集中的细碎模式。
- 训练数据量不足，不能充分约束模型该学什么、不该学什么。
- 训练过久，使模型不断贴合训练集中的局部特征。

缓解方式通常包括：

- 限制模型复杂度。
- 增加数据量或做更合理的数据增强。
- 使用正则化方法。
- 使用 validation set 配合 early stopping。

需要注意的是，过拟合通常只能缓解，很难被彻底消除。

一个常见的理论直觉是：如果学习问题普遍可以在有限数据上通过经验误差最小化彻底解决，并稳定得到真正最优的泛化结果，那么很多原本极难的问题就会变得可构造地高效可解。正因为现实中的学习问题没有这么简单，所以过拟合被认为是机器学习中难以彻底回避的现象。

### Underfitting

underfitting 可以理解为：模型连 training sample 中较稳定的一般性质都还没有学好。

这意味着模型不仅在新样本上表现差，往往在训练集上表现也不够好。

常见原因包括：

- 模型学习能力不足。
- 特征表达不足，导致模型看不到足够有效的信息。
- 训练不充分，例如训练轮数太少，或者优化过程没有真正收敛。

缓解方式通常包括：

- 提高模型能力。
- 改进特征或表示方式。
- 训练更充分，例如增加训练轮数或调整优化策略。

## 与相关节点的关系

- `Optimization` 讨论的是参数如何更新。
- `Generalization` 讨论的是这些更新最终是否能带来对新样本的有效表现。
- 训练过程里常见的很多现象，例如 early stopping、regularization、模型容量控制，本质上都与 generalization 有关。

## 子节点

- [Evaluation Methods](evaluation-methods/index.md)
- [Testing Set](testing-set/index.md)
- [Validation Set](validation-set/index.md)

## 待整理

- Bias-Variance Tradeoff：理解泛化误差来源的重要框架。
