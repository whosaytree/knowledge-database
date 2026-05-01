# Maximum Likelihood Estimation

## 核心理解

Maximum likelihood estimation, 简称 MLE，是一种根据观测数据来估计模型参数的方法。

它的核心思想是：在一组候选参数里，选择那组能让“当前观测到的数据”最可能出现的参数。

也就是说，MLE 不是直接问“参数本身有多可能”，而是问“如果参数取这个值，当前数据出现的可能性有多大”。

## 从概率模型出发理解

假设数据由某个带参数的概率分布生成，例如：

$$
p(x \mid \theta)
$$

这里：

- $x$ 表示观测数据。
- $\theta$ 表示模型参数。

MLE 要做的事情是：给定已经观察到的数据，寻找最优参数 $\theta$，使得这些数据在该参数下的似然最大。

## 似然函数

当观测数据固定后，可以把：

$$
p(D \mid \theta)
$$

看作参数 $\theta$ 的函数，这个函数就叫 likelihood，也就是似然函数。

需要注意：

- 概率通常把参数视为固定，讨论数据出现的可能性。
- 似然则把数据视为已知，讨论不同参数对这些数据的解释能力。

因此，likelihood 和 probability 形式上可能很像，但看的对象不同。

## MLE 的定义

给定数据集 $D$，MLE 寻找的参数通常写成：

$$
\hat{\theta}_{MLE} = \arg\max_{\theta} p(D \mid \theta)
$$

如果样本独立同分布，且数据集为：

$$
D = \{x_1, x_2, \dots, x_m\}
$$

那么似然可以写成：

$$
p(D \mid \theta) = \prod_{i=1}^{m} p(x_i \mid \theta)
$$

于是 MLE 就变成：

$$
\hat{\theta}_{MLE} = \arg\max_{\theta} \prod_{i=1}^{m} p(x_i \mid \theta)
$$

## 为什么常用对数似然

由于多个样本的似然通常是连乘形式，直接优化不方便，因此实践中常把它变成对数似然：

$$
\log p(D \mid \theta) = \sum_{i=1}^{m} \log p(x_i \mid \theta)
$$

这样做的好处包括：

- 连乘变连加，更易计算。
- 数值更稳定。
- 通常更容易求导和优化。

因为对数函数是单调递增的，所以最大化似然和最大化对数似然得到的最优参数是一样的。

## MLE 的直觉

可以粗略理解为：MLE 让模型去反推一组参数，使得“这批真实看到的数据”在模型看来尽量不像偶然噪声，而像是该参数下自然生成出来的结果。

因此，MLE 本质上是在做“参数解释数据能力”的比较。

## 一个简单例子

假设抛一枚硬币 $m$ 次，其中出现正面 $k$ 次，记正面概率为 $\theta$。

那么这组观测数据的似然与 $\theta$ 的关系可以写成：

$$
p(D \mid \theta) \propto \theta^k (1-\theta)^{m-k}
$$

MLE 的结果是：

$$
\hat{\theta}_{MLE} = \frac{k}{m}
$$

也就是说，最能解释数据的参数，就是样本中正面出现的频率。

这个例子很直观地说明了：MLE 往往会把“观察到的经验频率”转化为参数估计。

## MLE 与损失函数的关系

在很多机器学习模型里，最大化对数似然，等价于最小化某种损失函数。

例如：

- 高斯噪声假设下，最小化平方误差通常对应最大化似然。
- 分类任务中，最小化 cross entropy 常常对应最大化条件对数似然。

因此，MLE 提供了很多常见训练目标背后的概率解释。

## MLE 与 Optimization 的关系

MLE 决定的是“要优化什么”：

- 最大化似然
- 或最大化对数似然

Optimization 决定的是“怎么优化”：

- 解析求解
- 梯度下降
- 牛顿法
- EM 等迭代方法

所以，MLE 是目标原则，optimization 是求解手段。

## MLE 的优点

- 有清晰的概率解释。
- 与很多常见损失函数有直接联系。
- 在样本足够多时通常有良好的统计性质。
- 是很多统计学习和概率模型的基础方法。

## MLE 的局限

- 它不利用先验信息。
- 当样本较少时，估计可能不稳定。
- 如果模型假设本身不合理，MLE 得到的结果也会偏离真实情况。
- 在复杂模型里，似然函数可能难以直接优化。

## 与 MAP 的区别

MLE 只考虑观测数据对参数的支持程度，也就是 likelihood。

MAP 则进一步考虑参数的先验分布，在后验概率最大处取参数。

可以粗略理解为：

- MLE：只看数据。
- MAP：数据和先验一起看。

因此，MLE 常被看作是不带先验约束的参数估计方法。

## 与 Least Squares Method 的关系

Maximum Likelihood Estimation 和 Least Squares Method 关系很近，但不是同一个概念。

- Maximum Likelihood Estimation 从概率模型出发，选择让观测数据似然最大的参数。
- Least Squares Method 从误差最小化出发，选择让残差平方和最小的参数。

在某些条件下，Least Squares Method 可以看作 Maximum Likelihood Estimation 的一个特例。

最经典的情况是：如果误差项被假设为独立同分布的高斯噪声，那么最大化似然通常等价于最小化平方误差。

因此，Least Squares Method 可以看作是在特定噪声假设下，由 MLE 导出的一个具体形式。

### 更直观的理解

可以把两者的区别理解成“出发点不同”。

Least Squares Method 的出发点是：

- 我先不管概率模型；
- 我只关心预测误差；
- 我选择让误差平方和最小的参数。

Maximum Likelihood Estimation 的出发点是：

- 我先假设数据由某个概率模型生成；
- 然后比较不同参数对当前数据的解释能力；
- 选择让当前数据最可能出现的参数。

因此：

- Least Squares Method 更像是直接写下一个误差目标。
- Maximum Likelihood Estimation 更像是先写下一个数据生成假设，再由这个假设推出目标。

如果误差被假设为高斯噪声，那么这个概率模型最后会导出平方误差目标，于是 MLE 和 Least Squares Method 得到同样的参数估计。

但如果噪声分布换掉，例如不再假设高斯分布，那么 MLE 导出的目标就可能不再是平方误差。

所以：

- Least Squares Method 不是总等于 MLE。
- 它只是 MLE 在高斯噪声假设下的一个特例。

## 与相关节点的关系

- `Parameter Estimation` 讨论 MLE 所属的参数估计框架。
- `Loss Functions` 讨论很多似然目标如何转写为可优化损失。
- `Optimization` 讨论如何实际求解 MLE 对应的最优化问题。
- `Linear Regression` 中常见的平方误差目标可以从特定噪声假设下的 MLE 角度理解。

## 待整理

- MAP：在似然之外引入先验。
- Likelihood vs Probability：两者概念区别。
- Cross Entropy：条件对数似然的常见形式。
- Gaussian Noise：平方误差与 MLE 的联系。
