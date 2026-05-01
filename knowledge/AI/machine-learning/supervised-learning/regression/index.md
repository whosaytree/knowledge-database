# Regression

## 核心理解

Regression 讨论的是：模型如何根据输入去预测一个连续数值。

与分类任务不同，回归问题的目标不是判断样本属于哪个类别，而是估计一个数值大小，例如价格、温度、时长或概率近似值。

## 关键问题

- 输出变量是否连续？
- 模型假设的函数形式是什么？
- 误差如何被度量？
- 模型是否容易解释？
- 模型是否能表达非线性关系？

## 主要方向

- [Linear Regression](linear-regression/index.md)：最基础的回归模型之一，假设输出是输入特征的线性组合。
- Polynomial Regression：通过特征变换表达非线性关系。
- Ridge Regression：在线性回归基础上加入 L2 正则化。
- Lasso：在线性回归基础上加入 L1 正则化。

## 与相关节点的关系

- `MSE` 是回归任务中最常见的损失之一。
- `Regression` 讨论模型形式本身。
- `Loss Functions` 讨论回归误差如何被量化。
- `Optimization` 讨论如何求解回归模型参数。

## 子节点

- [Linear Regression](linear-regression/index.md)

## 待整理

- Polynomial Regression：通过非线性特征扩展线性模型。
- Ridge Regression：带 L2 正则化的线性回归。
- Lasso：带 L1 正则化的线性回归。
- Residual：回归误差的样本级表达。
