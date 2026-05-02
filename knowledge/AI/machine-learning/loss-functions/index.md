# Loss Functions

## 核心理解

Loss function 讨论的是：模型输出与目标之间的偏差，如何被量化成一个可优化的标量目标。

在机器学习里，模型结构决定“能表示什么”，优化器决定“参数怎么更新”，而 loss function 决定“到底希望模型逼近什么”。

不同损失函数不仅对应不同任务类型，也会影响梯度形状、优化难度、异常值敏感性以及模型最终学到的偏好。

## 关键问题

- 预测误差如何被量化？
- 偏差是线性惩罚、平方惩罚，还是对数惩罚？
- 损失函数对异常值是否敏感？
- 损失函数是否适合当前任务的输出形式？
- 训练时优化的损失，和最终评估指标是否一致？

## 主要方向

- [MSE](mse/index.md)：最常见的回归损失之一，对较大误差施加平方惩罚。
- MAE：对误差做绝对值惩罚。
- [Cross Entropy](cross-entropy/index.md)：分类任务中最常见的损失之一。
- [KL Divergence](kl-divergence/index.md)：衡量一个分布相对另一个分布的额外信息代价。
- Huber Loss：兼顾平方误差与绝对误差特性的折中形式。

## 与相关节点的关系

- `Optimization` 讨论如何最小化损失函数。
- `Generalization` 讨论训练时最小化的损失，是否能转化为对新样本的良好表现。
- `Loss Functions` 讨论训练目标本身的定义方式。

## 子节点

- [MSE](mse/index.md)
- [Cross Entropy](cross-entropy/index.md)
- [KL Divergence](kl-divergence/index.md)

## 待整理

- MAE：绝对误差损失。
- Huber Loss：兼顾鲁棒性与可优化性。
- RMSE：与 MSE 紧密相关的误差度量。
