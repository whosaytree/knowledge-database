# Parameter Estimation

## 核心理解

Parameter estimation 讨论的是：当模型结构已经给定时，如何根据观察到的数据去确定模型参数。

在很多机器学习与统计学习问题里，真正需要学习的就是一组参数，而不同估计方法的差别，在于它们如何利用数据、先验信息和优化目标来确定“什么样的参数算是最好”。

## 关键问题

- 参数是通过什么原则被选出来的？
- 数据在估计中扮演什么角色？
- 是否引入先验信息？
- 优化目标与概率解释之间是什么关系？
- 不同估计方法之间如何取舍？

## 主要方向

- [Maximum Likelihood Estimation](maximum-likelihood-estimation/index.md)：选择让观测数据出现概率最大的参数。
- [Least Squares Method](least-squares-method/index.md)：选择让误差平方和最小的参数。
- MAP：在似然基础上再结合先验信息。
- Bayesian Estimation：把参数本身看作随机变量。
- EM Algorithm：在含隐变量时迭代求参数估计。

## 与相关节点的关系

- `Loss Functions` 讨论训练目标如何被写成可优化形式。
- `Optimization` 讨论这些目标如何被实际求解。
- `Parameter Estimation` 讨论这些目标背后的参数选择原则。

## 子节点

- [Maximum Likelihood Estimation](maximum-likelihood-estimation/index.md)
- [Least Squares Method](least-squares-method/index.md)

## 待整理

- MAP：最大后验估计。
- Bayesian Estimation：参数分布视角。
- EM Algorithm：隐变量模型中的估计方法。
- Likelihood vs Probability：似然与概率的区别。
