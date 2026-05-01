# Validation Set

## 核心理解

Validation set 是在模型训练过程中，用来做模型选择、超参数调整和训练策略判断的数据集合。

它不直接用于参数学习，但会参与训练流程中的决策。因此，validation set 既不同于 training set，也不同于 testing set。

可以粗略理解为：

- training set 用于学习参数。
- validation set 用于指导选择。
- testing set 用于最终评估。

## 为什么需要 Validation Set

如果只有 training set 和 testing set 两部分数据，那么实践中很容易出现一个问题：

- 用 training set 训练模型。
- 看 testing set 效果。
- 根据 testing set 结果继续调学习率、改结构、换特征、改训练轮数。
- 再次看 testing set 效果。

一旦这样做，testing set 就不再是独立的最终评估集，因为测试信息已经反向影响了训练过程。

Validation set 的意义就在于：把“训练过程中需要反复参考的信息”与“最终评估信息”分开。

## Validation Set 的职责

Validation set 常见用于：

- 选择模型结构。
- 调整超参数，例如 learning rate、batch size、weight decay。
- 决定训练轮数。
- 配合 early stopping 判断何时停止训练。
- 在多个候选模型之间做选择。

因此，validation set 的核心作用不是给出最终结论，而是帮助训练过程做出更合理的中间决策。

## Validation Set 与 Training Set、Testing Set 的区别

### 与 Training Set 的区别

Training set 直接参与损失计算和参数更新。

Validation set 不参与参数更新，但会影响训练过程中的外部决策。

### 与 Testing Set 的区别

Testing set 的职责是对模型做最终评估。

Validation set 的职责是服务于模型开发过程。

因此：

- validation set 可以被反复查看。
- testing set 不应被反复用于调参。

如果一个数据集被反复拿来选模型、调超参数，那么它在功能上就是 validation set，而不是 testing set。

## 常见使用方式

### 留出验证集

最常见做法是把原始数据划分为三部分：

- training set
- validation set
- testing set

其中训练集用于学习参数，验证集用于调参和模型选择，测试集用于最终评估。

### 在交叉验证中承担验证职责

在某些流程里，交叉验证中的每一轮保留子集也可以承担类似验证集的作用，用来比较不同超参数配置。

这时要特别注意区分：

- 哪些数据用于模型开发过程中的选择；
- 哪些数据真正保留到最后做最终测试。

## Early Stopping 与 Validation Set

Validation set 最常见的一个用途是配合 early stopping。

训练过程中，training error 往往会持续下降，但 validation error 不一定一直下降。

常见现象是：

- 训练初期，training error 和 validation error 都下降；
- 到某个阶段后，training error 继续下降；
- 但 validation error 开始上升。

这通常意味着模型开始更强地贴合训练集细节，泛化能力反而变差。此时可以考虑停止训练。

因此，early stopping 本质上依赖的是 validation set，而不是 testing set。

## 一个合格 Validation Set 应满足什么

### 与训练样本互斥

Validation set 不应直接参与参数更新，因此应与 training set 保持互斥。

### 尽可能代表真实分布

如果验证集分布与未来任务差异太大，那么基于它做出的模型选择就可能失真。

### 规模要足够

如果验证集太小，模型选择过程会带来较大随机波动，容易把偶然结果误当成真实优势。

## 常见问题

### 把 Validation Set 当成最终测试结果

validation set 上效果好，只能说明当前调参方向较优，不能直接视为最终泛化能力结论。

### 验证集被过度使用

虽然 validation set 可以被反复查看，但如果围绕它进行了过多轮试错和选择，模型也可能逐渐对验证集本身过拟合。

这意味着：

- validation set 比 testing set 更适合反复使用；
- 但它也不是完全不会被“污染”的。

### 没有独立测试集

如果最后没有保留真正独立的 testing set，那么模型开发阶段得到的最好结果仍可能偏乐观。

## 与相关节点的关系

- `Generalization` 解释为什么需要区分训练表现与泛化表现。
- `Evaluation Methods` 解释数据可以如何划分。
- `Testing Set` 解释为什么最终评估集不应承担调参职责。
- `Validation Set` 解释训练流程中“开发用数据”应承担什么角色。

## 待整理

- Early Stopping：如何基于验证集决定停止时机。
- Hyperparameter Tuning：如何系统地利用验证集搜索超参数。
- Data Leakage：验证信息泄漏到训练设计中的风险。
