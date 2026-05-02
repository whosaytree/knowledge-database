# KL Divergence

## 核心理解

KL Divergence（Kullback-Leibler Divergence）讨论的是：当我们用一个分布去近似另一个分布时，会额外损失多少信息。

它衡量的不是两个分布“差了多少距离”，而是：如果真实数据其实来自分布 $P$，但你却用分布 $Q$ 去描述它，那么平均会多付出多少代价。

因此，KL divergence 的本质不是普通几何距离，而是一种带方向的分布偏差度量。

## KL Divergence 解决的是什么问题

在很多机器学习问题里，我们不只是想知道某个值预测错了多少，而是想知道：

- 一个预测分布和目标分布差多远；
- 一个近似分布相对于真实分布损失了多少信息；
- 模型输出的概率分布有没有偏离目标分布太多。

例如：

- 分类任务里，预测分布和标签分布的差异；
- 知识蒸馏里，学生模型分布和教师模型分布的差异；
- 变分推断里，近似后验和真实后验的差异。

KL divergence 就是这类问题里最常见的量之一。

## 定义

设真实分布为：

$$
P = [p_1, p_2, \dots, p_K]
$$

近似分布为：

$$
Q = [q_1, q_2, \dots, q_K]
$$

那么离散情形下，KL divergence 定义为：

$$
D_{KL}(P \parallel Q)
=
\sum_{i=1}^{K} p_i \log \frac{p_i}{q_i}
$$

它表示的是：

- 站在真实分布 $P$ 的视角；
- 用 $Q$ 代替 $P$；
- 平均会多出多少描述代价。

这里的方向非常重要。

## 为什么它有方向

KL divergence 不是对称的。

一般来说：

$$
D_{KL}(P \parallel Q) \neq D_{KL}(Q \parallel P)
$$

原因是：

- 它不是在对比分布坐标差值；
- 而是在问“如果真实是 $P$，却用 $Q$ 去描述，会损失多少”；
- 把顺序反过来，问题本身就变了。

因此，KL divergence 更像“有参考系的偏差代价”，而不是普通意义上的距离。

## KL 的直觉

可以粗略理解为：

- $P$ 表示真实世界真正怎么分配概率；
- $Q$ 表示你主观上怎么分配概率；
- KL divergence 衡量的是：你的概率分配相对真实分布有多不合适。

如果 $Q$ 和 $P$ 完全一致，那么：

$$
D_{KL}(P \parallel Q) = 0
$$

如果 $Q$ 在真实高概率区域上给得太少，那么 KL 会明显变大。

所以 KL divergence 特别在意的是：

- 你有没有低估真实分布真正重视的部分。

## 为什么它总是不小于 0

KL divergence 满足：

$$
D_{KL}(P \parallel Q) \ge 0
$$

并且只有当：

$$
P = Q
$$

时取等号。

这说明：

- 用错误分布去描述真实分布，不可能比直接用真实分布自己描述自己更省代价；
- 额外代价最小只能是 0，不可能是负的。

这也是 KL divergence 被广泛使用的基础原因之一。

## 如何理解单项的正负

KL divergence 的单项通常写成：

$$
p_i \log \frac{p_i}{q_i}
$$

这里单项可能为正，也可能为负。

- 如果 $q_i < p_i$，也就是近似分布低估了这个类别，那么这一项为正。
- 如果 $q_i > p_i$，也就是近似分布高估了这个类别，那么这一项可能为负。

但要注意：KL 的单项不是“这一类单独的误差分数”，而是整体分布误差分解后的一部分。

如果某类被高估了，说明你把过多概率分给了它。由于总概率和必须是 1，这些多出来的概率一定是从别的类别挪过来的。

这通常意味着：

- 有些别的类别会被低估；
- 而低估真实分布中更重要类别的惩罚，会以正项形式体现出来；
- 这些正项通常才是决定整体 KL divergence 的关键部分。

因此，某一项为负并不表示“这部分预测没有问题”，而只是表示：在这个局部位置上，模型给出的概率比真实分布更大。真正的总代价必须放在整组分布里一起理解。

## 一个简单例子

设真实分布为：

$$
P = [0.7, 0.2, 0.1]
$$

预测分布为：

$$
Q = [0.5, 0.4, 0.1]
$$

那么三项分别是：

$$
0.7 \log \frac{0.7}{0.5}
$$

$$
0.2 \log \frac{0.2}{0.4}
$$

$$
0.1 \log \frac{0.1}{0.1}
$$

其中：

- 第一项为正，因为真实重要类别被低估了；
- 第二项为负，因为这个类别被高估了；
- 第三项为 0，因为这类刚好匹配。

这说明 KL 的局部项可以有正有负，但整体仍然会是正的。

## KL Divergence 与 Cross Entropy 的关系

KL divergence 和 cross entropy 关系非常紧密。

它们满足：

$$
H(P,Q) = H(P) + D_{KL}(P \parallel Q)
$$

其中：

- $H(P,Q)$ 是 cross entropy；
- $H(P)$ 是真实分布自己的熵；
- $D_{KL}(P \parallel Q)$ 是 KL divergence。

这个式子的含义是：

- 真实分布自己本身就有不确定性；
- 如果你用错误分布去描述它，还会额外付出偏差代价；
- 这部分额外代价就是 KL divergence。

因此：

- cross entropy 是“总代价”；
- KL divergence 是“比真实熵多出来的那部分代价”。

## KL Divergence 与 Entropy 的区别

这三个量容易混淆：

- Entropy：一个分布自己本身有多不确定。
- Cross Entropy：用一个分布去描述另一个分布的总代价。
- KL Divergence：这个总代价比真实熵多出来多少。

所以：

- entropy 只看一个分布；
- cross entropy 看两个分布；
- KL divergence 看“额外偏差”本身。

## 为什么机器学习里经常用 KL

KL divergence 在机器学习里很常见，因为很多训练问题本质上都能写成“让一个分布逼近另一个分布”。

典型场景包括：

- soft label 训练；
- label smoothing；
- knowledge distillation；
- variational inference；
- 概率模型拟合；
- calibration 分析。

它的价值在于：不仅能比较谁更大谁更小，还能比较整套概率分配的结构性偏差。

## 常见问题

### 1. KL divergence 是距离吗

严格来说不是。

因为它不满足对称性，一般也不满足普通距离所要求的全部性质。

所以更准确的说法是：

- 它是 divergence；
- 是一种带方向的分布偏差度量；
- 不是标准几何距离。

### 2. 为什么某些项可以是负的

因为单项只反映局部位置上的相对高估或低估。

但整体 KL 不会为负，因为它统计的是整组分布下的平均额外代价。

### 3. 为什么低估真实高概率区域会更严重

因为 KL 是以真实分布 $P$ 加权的：

$$
\sum_i p_i \log \frac{p_i}{q_i}
$$

真实分布认为越重要的区域，权重 $p_i$ 越大，因此在这些地方犯错会被更重地计入总代价。

## 与相关节点的关系

- `Cross Entropy` 可以拆成真实熵与 KL divergence 两部分。
- `Softmax` 常生成需要用 KL 或 cross entropy 比较的概率分布。
- `Maximum Likelihood Estimation` 与 cross entropy、KL 都有概率解释上的联系。
- `Supervised Learning` 中的 soft label 训练常会涉及 KL divergence。
- `Optimization` 讨论如何最小化由 KL divergence 定义的目标。

## 待整理

- Jensen-Shannon Divergence：对称化后的分布差异度量。
- Label Smoothing：soft label 训练中的常见技巧。
- Knowledge Distillation：教师分布和学生分布之间的拟合。
- Variational Inference：KL divergence 在近似后验中的核心作用。
- Reverse KL：把方向反过来后的不同行为。
