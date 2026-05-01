# Supervised Learning

## 核心理解

Supervised learning 讨论的是：给定带有标签的数据，模型如何学习输入到输出之间的映射关系。

这里的“监督”来自训练数据中的目标值。模型不仅看到输入，还能看到期望输出，因此训练过程本质上是在利用已知样本对映射规则进行拟合。

## 主要方向

- [Regression](regression/index.md)：预测连续数值。
- Classification：预测离散类别。

## 与相关节点的关系

- `Loss Functions` 讨论监督学习中训练目标如何定义。
- `Optimization` 讨论这些目标如何被实际最小化。
- `Generalization` 讨论模型在训练集上学到的规律，能否迁移到新样本。

## 子节点

- [Regression](regression/index.md)

## 待整理

- Classification：离散标签预测。
- Logistic Regression：线性分类模型。
- Label Noise：监督信号本身存在噪声时的问题。
