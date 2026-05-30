# Focal Loss

## 核心理解

Focal Loss 是一种面向类别不均衡分类问题的损失函数。

它的核心思想是：不要让大量容易分类的样本主导训练，而是让模型把更多学习力度放在难分类样本上。

在标准 cross entropy 中，只要样本数量足够多，即使其中很多样本已经很容易被正确分类，它们仍然会持续贡献损失和梯度。对于前景样本很少、背景样本很多的任务，这会导致训练过程被大量简单负样本淹没。

Focal Loss 通过给 cross entropy 加上一个调制因子，降低易分类样本的损失权重，从而让难样本在训练中占据更重要的位置。

## 从 Cross Entropy 出发

对于二分类问题，设模型对真实类别的预测概率为 $p_t$。

如果真实标签为 1：

$$
p_t = p
$$

如果真实标签为 0：

$$
p_t = 1 - p
$$

标准 cross entropy 可以写成：

$$
CE(p_t) = -\log(p_t)
$$

这个形式只关心模型给真实类别分配了多少概率。

- 如果 $p_t$ 越接近 1，说明模型越确信真实类别，损失越小。
- 如果 $p_t$ 越接近 0，说明模型越不支持真实类别，损失越大。

## Focal Loss 的定义

Focal Loss 在 cross entropy 前面加入一个调制因子：

$$
FL(p_t)
=
-(1 - p_t)^\gamma \log(p_t)
$$

其中：

- $p_t$ 是模型分给真实类别的概率。
- $\gamma$ 是 focusing parameter，用来控制对易分类样本的降权程度。
- $(1 - p_t)^\gamma$ 是调制因子。

当样本已经很容易被正确分类时，$p_t$ 接近 1，于是：

$$
(1 - p_t)^\gamma \approx 0
$$

这会显著降低该样本的损失贡献。

当样本难以分类时，$p_t$ 较小，于是：

$$
(1 - p_t)^\gamma
$$

不会太小，损失仍然会被保留下来。

因此，Focal Loss 的效果是：降低简单样本权重，保留困难样本权重。

## 加入类别权重的形式

在类别不均衡问题中，Focal Loss 还常加入类别权重 $\alpha_t$：

$$
FL(p_t)
=
-\alpha_t (1 - p_t)^\gamma \log(p_t)
$$

其中：

- $\alpha_t$ 用来平衡不同类别的重要性。
- $\gamma$ 用来降低易分类样本的贡献。
- 两者解决的问题不同，但经常一起使用。

可以粗略理解为：

- $\alpha_t$ 处理“类别数量不均衡”。
- $(1 - p_t)^\gamma$ 处理“简单样本太多”。

## Focusing Parameter 的作用

$\gamma$ 控制 Focal Loss 对简单样本的抑制强度。

当：

$$
\gamma = 0
$$

时，有：

$$
(1 - p_t)^\gamma = 1
$$

此时 Focal Loss 退化为普通 cross entropy：

$$
FL(p_t) = -\log(p_t)
$$

当 $\gamma$ 变大时，容易样本的损失会被更强地压低。

例如，如果某个样本的真实类别预测概率为：

$$
p_t = 0.9
$$

且：

$$
\gamma = 2
$$

那么调制因子为：

$$
(1 - 0.9)^2 = 0.01
$$

这意味着这个已经比较容易的样本，其损失贡献会被压到原来的很小一部分。

## Focal Loss 的直觉

Focal Loss 可以理解为一种“训练注意力重分配”。

标准 cross entropy 会让所有样本都按照预测概率贡献损失，而 Focal Loss 进一步区分：

- 已经学会的简单样本；
- 仍然容易出错的困难样本。

对于简单样本，Focal Loss 认为它们已经没有必要继续占用大量训练信号。

对于困难样本，Focal Loss 会保留更高的损失，让模型继续从这些样本中学习。

## 适用场景

Focal Loss 最典型的使用场景是类别不均衡严重的分类任务，尤其是目标检测。

例如在 dense object detection 中，模型会在大量候选位置上判断是否存在目标。绝大多数位置都是背景，只有少数位置是真正的目标。

如果直接使用 cross entropy，大量容易判断为背景的负样本会主导总损失，使模型对少数前景目标学习不足。

Focal Loss 通过降低这些简单背景样本的权重，让训练更关注难分类的前景样本和困难负样本。

## 与 Cross Entropy 的关系

Focal Loss 不是完全独立于 cross entropy 的新目标，而是在 cross entropy 基础上的加权改造。

标准 cross entropy 是：

$$
CE(p_t) = -\log(p_t)
$$

Focal Loss 是：

$$
FL(p_t)
=
(1 - p_t)^\gamma CE(p_t)
$$

因此：

- Cross Entropy 是基础分类损失。
- Focal Loss 是对 Cross Entropy 的动态重加权。
- 当 $\gamma = 0$ 时，Focal Loss 退化为 Cross Entropy。

## 与相关节点的关系

- `Loss Functions` 讨论 Focal Loss 所属的训练目标体系。
- `Cross Entropy` 是 Focal Loss 的基础形式。
- `Evaluation Metrics` 讨论模型效果如何评价，而 Focal Loss 讨论训练时如何施加优化压力。
- `Supervised Learning` 中的分类任务经常使用 cross entropy 或 focal loss。
- `Object Detection` 后续可以连接到 Focal Loss 的典型应用场景。

## 待整理

- Class Imbalance：类别不均衡问题。
- Hard Example Mining：显式选择困难样本的训练方法。
- RetinaNet：Focal Loss 的经典应用模型。
- Binary Focal Loss：二分类形式。
- Multi-class Focal Loss：多分类形式。
