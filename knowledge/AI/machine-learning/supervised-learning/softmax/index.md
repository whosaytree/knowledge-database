# Softmax

## 核心理解

Softmax 讨论的是：如何把一组任意实数分数，转换成一个可解释为概率分布的输出向量。

它最常见的作用是把模型输出的 logits 变成多分类任务中的类别概率。

也就是说，softmax 不负责“产生原始打分”，而负责把这些打分归一化成：

- 每一项都非负；
- 所有项加起来等于 1；
- 每一项都可以理解为对应类别的相对概率。

因此，softmax 本质上是一种面向离散多类别输出的归一化函数。

## Softmax 解决的是什么问题

在分类模型中，模型最后一层往往先输出一组原始分数：

$$
z_1, z_2, \dots, z_K
$$

这些分数通常叫 logits。

logits 可以反映模型对不同类别的偏好强弱，但它们本身并不是概率，因为：

- 可以为负；
- 没有固定范围；
- 总和不一定为 1。

softmax 的作用就是把这组 logits 映射成概率分布，使模型输出可以直接解释为：

- 每个类别有多可能；
- 各类别之间的相对竞争关系如何。

## 定义

给定一组 logits：

$$
z_1, z_2, \dots, z_K
$$

softmax 输出第 $i$ 个类别的概率为：

$$
\text{softmax}(z_i) = \frac{e^{z_i}}{\sum_{j=1}^{K} e^{z_j}}
$$

因此整个输出向量满足：

$$
\sum_{i=1}^{K} \text{softmax}(z_i) = 1
$$

并且每一项都大于 0。

这就是它能被解释为概率分布的原因。

## 为什么要先取指数

softmax 里最容易让人疑惑的是指数项：

$$
e^{z_i}
$$

这样做有几个作用：

- 保证输出为正；
- 放大较大分数和较小分数之间的差异；
- 让最终结果能够形成“相对权重再归一化”的结构。

可以粗略理解为：

- logits 先通过指数变成一组正权重；
- 再除以总权重；
- 得到每个类别在整体中的占比。

因此，softmax 不是简单线性缩放，而是一种强调相对大小关系的非线性归一化。

## Softmax 的直觉

softmax 更看重“相对大小”，而不是绝对值本身。

例如，如果某个类别的 logit 明显高于其他类别，那么它经过 softmax 后通常会获得更大的概率。

而如果多个类别的 logits 很接近，那么 softmax 后的概率也会比较接近。

因此，softmax 的输出更像是在表达：

- 哪个类别最占优势；
- 优势有多明显；
- 其他类别是不是仍然有一定竞争力。

## 一个简单例子

假设某模型输出 3 个类别的 logits：

$$
[2.0, 1.0, 0.1]
$$

经过 softmax 后，会得到一个概率分布，大致表现为：

- 第一个类别概率最高；
- 第二个类别次之；
- 第三个类别最低；

而且三者相加等于 1。

这里要注意：

- softmax 输出的不是“绝对正确性”；
- 而是模型在这些候选类别之间的相对偏好分布。

## Softmax 与 Argmax 的区别

这两个概念经常一起出现，但作用不同。

- softmax：把 logits 变成概率分布。
- argmax：直接选出分数最高的类别索引。

也就是说：

- 如果你只想知道“预测成哪一类”，常看 argmax。
- 如果你还想知道“模型对各类别有多确定”，就需要看 softmax 输出。

因此，argmax 更像决策结果，softmax 更像决策前的概率表达。

## Softmax 与 Sigmoid 的区别

softmax 和 sigmoid 都能把数值映射到某种概率形式，但适用场景不同。

### Sigmoid

sigmoid 通常用于：

- 二分类；
- 多标签任务中每个标签独立判断。

它对单个 logit 单独作用，输出范围在 0 到 1 之间。

### Softmax

softmax 通常用于：

- 多分类任务；
- 各类别互斥，只能选一个主类别的场景。

它对整组 logits 一起作用，强调类别之间的相对竞争，并输出总和为 1 的分布。

因此，softmax 更适合 mutually exclusive classes，而 sigmoid 更适合 independent labels。

## Softmax 与 Cross Entropy 的关系

在多分类任务中，softmax 经常和 cross entropy 一起出现。

原因是：

- softmax 把 logits 变成类别概率；
- cross entropy 用这些概率和真实标签计算损失。

因此，常见训练链路可以写成：

```text
logits -> softmax -> probabilities -> cross entropy loss
```

不过在实际框架实现中，很多 `cross_entropy` 接口会把 softmax 和对数运算合并到一个数值更稳定的实现里，因此用户常常直接把 logits 送进损失函数，而不是先手动算 softmax。

## Softmax + Cross Entropy 的反向传播

softmax 和 cross entropy 之所以经常绑定讨论，一个重要原因是：它们组合后的梯度形式非常简洁。

在多分类任务中，设模型输出 logits 为：

$$
z_1, z_2, \dots, z_K
$$

经过 softmax 后，得到预测概率：

$$
\hat{y}_i = \frac{e^{z_i}}{\sum_{j=1}^{K} e^{z_j}}
$$

如果真实标签使用 one-hot 向量表示，记为：

$$
y_1, y_2, \dots, y_K
$$

那么 cross entropy loss 可以写成：

$$
L = - \sum_{i=1}^{K} y_i \log \hat{y}_i
$$

对于 one-hot 标签，只有真实类别对应的那一项 $y_i = 1$，其余都为 $0$，所以它也常写成：

$$
L = - \log \hat{y}_t
$$

其中 $t$ 表示真实类别索引。

### 目标：求损失对 logits 的梯度

训练时真正需要的是：

$$
\frac{\partial L}{\partial z_i}
$$

也就是损失对每个 logit 的梯度。

因为参数更新不是直接对 softmax 概率做的，而是要继续通过反向传播，把梯度从 logits 传回前面的线性层参数。

## 第一步：先看 softmax 对 logits 的导数

softmax 的每一项都依赖整组 logits，所以它的导数不是彼此独立的。

设：

$$
\hat{y}_i = \frac{e^{z_i}}{\sum_{j=1}^{K} e^{z_j}}
$$

那么它对 $z_k$ 的导数可以分成两种情况。

### 情况一：$i = k$

当我们对本类别自己的 logit 求导时：

$$
\frac{\partial \hat{y}_i}{\partial z_i}
=
\hat{y}_i (1 - \hat{y}_i)
$$

### 情况二：$i \neq k$

当我们对其他类别的 logit 求导时：

$$
\frac{\partial \hat{y}_i}{\partial z_k}
=
- \hat{y}_i \hat{y}_k
$$

把这两种情况合并写，可以表示为：

$$
\frac{\partial \hat{y}_i}{\partial z_k}
=
\hat{y}_i (\delta_{ik} - \hat{y}_k)
$$

其中 $\delta_{ik}$ 是 Kronecker delta：

- 当 $i = k$ 时取 1；
- 当 $i \neq k$ 时取 0。

这说明 softmax 的 Jacobian 不是对角矩阵，而是各类别之间彼此耦合。

## 第二步：对 cross entropy 求导

损失函数是：

$$
L = - \sum_{i=1}^{K} y_i \log \hat{y}_i
$$

先对 $\hat{y}_i$ 求导：

$$
\frac{\partial L}{\partial \hat{y}_i}
=
- \frac{y_i}{\hat{y}_i}
$$

然后利用链式法则，对每个 logit $z_k$ 求导：

$$
\frac{\partial L}{\partial z_k}
=
\sum_{i=1}^{K}
\frac{\partial L}{\partial \hat{y}_i}
\frac{\partial \hat{y}_i}{\partial z_k}
$$

把前面的两个结果代入：

$$
\frac{\partial L}{\partial z_k}
=
\sum_{i=1}^{K}
\left(
- \frac{y_i}{\hat{y}_i}
\right)
\hat{y}_i (\delta_{ik} - \hat{y}_k)
$$

约掉 $\hat{y}_i$ 后得到：

$$
\frac{\partial L}{\partial z_k}
=
- \sum_{i=1}^{K}
y_i (\delta_{ik} - \hat{y}_k)
$$

继续展开：

$$
\frac{\partial L}{\partial z_k}
=
- \sum_{i=1}^{K} y_i \delta_{ik}
+ \sum_{i=1}^{K} y_i \hat{y}_k
$$

其中：

$$
\sum_{i=1}^{K} y_i \delta_{ik} = y_k
$$

而 one-hot 标签满足：

$$
\sum_{i=1}^{K} y_i = 1
$$

所以：

$$
\sum_{i=1}^{K} y_i \hat{y}_k = \hat{y}_k
$$

最终得到：

$$
\frac{\partial L}{\partial z_k}
=
\hat{y}_k - y_k
$$

把所有类别写成向量形式，就是：

$$
\frac{\partial L}{\partial z}
=
\hat{y} - y
$$

## 为什么最后会这么简单

这个结果看起来很简洁，但不是因为中间过程本身简单，而是因为 softmax 和 cross entropy 这两个定义刚好非常匹配。

- softmax 负责把 logits 变成一个类别之间彼此竞争的概率分布。
- cross entropy 负责衡量这个预测分布和真实分布之间的差距。
- 两者通过链式法则组合后，原本复杂的指数、分母和类别间耦合项会大量抵消。

所以最后剩下来的，就是最本质的误差信号：

$$
\hat{y} - y
$$

也就是说：

- 你预测多了的部分，梯度是正的，要往下压；
- 你预测少了的部分，梯度是负的，要往上推。

可以把它理解成：

- softmax 先回答“你把概率分给了谁”；
- cross entropy 再检查“你分出去的概率和正确答案差多少”；
- 两者合起来后，输出层最自然的纠偏信号就是“当前预测分布减去目标分布”。

## 数值稳定性问题

softmax 有一个重要工程细节：直接计算指数可能数值不稳定。

如果某些 logits 非常大，那么：

$$
e^{z_i}
$$

可能会溢出。

因此实践中通常会先减去最大值：

$$
\text{softmax}(z_i) = \frac{e^{z_i - z_{max}}}{\sum_{j=1}^{K} e^{z_j - z_{max}}}
$$

其中：

$$
z_{max} = \max_j z_j
$$

这样不会改变最终概率分布，但可以显著提升数值稳定性。

这是 softmax 最常见、最重要的工程实现细节之一。

## Softmax 为什么会让分布变尖锐

由于指数函数会放大差异，softmax 常常会让较大的 logit 获得更高占比。

这意味着：

- logit 差异越大，输出分布越尖锐；
- 某一类优势越明显，概率越接近 1；
- 其他类别概率会被进一步压低。

因此 softmax 不只是归一化，还会强化相对优势。

## 在 Attention 中的作用

softmax 不只用于分类输出，在 Transformer attention 里也非常重要。

在 attention 中，模型会先算出 query 和 key 之间的相似度分数，然后对这些分数做 softmax，把它们转成一组权重。

这样做之后：

- 每个权重都非负；
- 所有权重之和为 1；
- 权重可以表示当前 token 对其他 token 的关注分配。

所以在 attention 里，softmax 不是在输出类别概率，而是在输出“归一化注意力权重”。

这说明 softmax 的更一般作用是：把一组竞争性分数转换成归一化权重分布。

## 与相关节点的关系

- `Supervised Learning` 中，多分类任务经常使用 softmax 作为输出归一化方式。
- `Loss Functions` 中的 `Cross Entropy` 常与 softmax 配合使用。
- `Maximum Likelihood Estimation` 可以为 softmax 多分类训练目标提供概率解释。
- `Transformer` 中，softmax 也被用于 attention 权重归一化。
- `Optimization` 讨论基于 softmax 与损失函数得到的梯度如何用于参数更新。

## 待整理

- Cross Entropy：softmax 最常见的配套损失。
- Logits：softmax 输入的原始分数。
- Sigmoid：二分类与多标签任务中的常用激活函数。
- Temperature：控制 softmax 输出分布尖锐程度的缩放参数。
- Attention：softmax 在注意力权重归一化中的典型应用。
