# F1 Score

## 核心理解

F1 score 是 precision 和 recall 的综合指标。

它的目标不是单独强调“报出来的正类有多准”或“真实正类找得有多全”，而是试图用一个数概括这两者之间的整体平衡。

因此，F1 score 常用于以下场景：

- precision 和 recall 都很重要；
- 不希望只看其中一个指标；
- 类别分布不平衡，使得 accuracy 不够有解释力。

## 定义

F1 score 是 precision 和 recall 的调和平均：

$$
F_1 = \frac{2PR}{P + R}
$$

其中：

- $P$ 表示 precision。
- $R$ 表示 recall。

也可以写成基于混淆矩阵的形式：

$$
F_1 = \frac{2TP}{2TP + FP + FN}
$$

这个形式直接说明：F1 score 只依赖 TP、FP 和 FN，不直接使用 TN。

## 为什么是调和平均

F1 score 不使用普通平均，而使用调和平均，是因为它会对较小的那个值更敏感。

这意味着：

- 如果 precision 很高但 recall 很低，F1 不会高。
- 如果 recall 很高但 precision 很低，F1 也不会高。
- 只有当两者都不差时，F1 才会比较高。

因此，F1 score 本质上奖励“平衡”，而不是某一项特别突出。

## F1 的直觉

可以粗略理解为：F1 不关心你是不是在某一边做得特别极端，它更关心你是否同时兼顾了 precision 和 recall。

例如：

- 如果模型几乎不报正类，precision 可能很高，但 recall 很低。
- 如果模型到处都报正类，recall 可能很高，但 precision 很低。

这两种情况都不算真正意义上的“整体表现好”，F1 会把它们压下来。

## 与 Precision、Recall 的关系

F1 score 不能替代 precision 和 recall，而是它们的补充概括。

因为：

- precision 告诉你预测为正的结果有多可信。
- recall 告诉你真实正类找得是否充分。
- F1 告诉你两者整体是否平衡。

所以在分析模型时，通常不能只看 F1 一个数，还应结合 precision 和 recall 一起看。

## 与 Accuracy 的区别

Accuracy 会把 TN 也纳入计算，因此在负类远多于正类时，可能显得过于乐观。

F1 score 不直接考虑 TN，所以在“正类识别”才是核心任务时，往往更有解释力。

例如：

- 欺诈检测
- 医疗筛查
- 异常检测
- 信息检索中的相关结果识别

在这些任务里，单看 accuracy 往往不够，而 F1 更能反映模型在正类上的实际能力。

## 什么时候适合看 F1

F1 常见于以下情况：

- precision 和 recall 同样重要。
- 正类比较少，类别不平衡明显。
- 希望用单一指标快速比较多个模型。

但如果业务中误报和漏报代价明显不对称，那么只看 F1 可能不够，因为它默认对 precision 和 recall 给出相同权重。

## F1 的局限

- 它会把 precision 和 recall 压缩成一个数，隐藏细节。
- 它默认 precision 和 recall 同等重要。
- 它不直接反映 TN 的情况。
- 在某些业务场景下，单一 F1 分数可能掩盖真实风险偏好。

因此，F1 适合做概括性比较，但不应替代对 precision 和 recall 的单独分析。

## F-beta Score

如果希望对 precision 和 recall 赋予不同权重，可以使用 F-beta score。

其中：

- $\beta > 1$ 时，更强调 recall。
- $\beta < 1$ 时，更强调 precision。
- $\beta = 1$ 时，就退化为 F1 score。

因此，F1 可以看作 F-beta 家族中的一个对称特例。

## 多分类与多标签场景

在多分类或多标签任务中，F1 往往不止一种计算方式，常见还有：

- micro F1
- macro F1
- weighted F1

它们的区别主要在于：先按类别分别计算再平均，还是先汇总全局计数再计算。

因此，在阅读实验结果时，不能只看 “F1” 这个名字，还需要看它具体是哪种汇总方式。

## 与相关节点的关系

- `Evaluation Metrics` 讨论 F1 score 所属的评估指标体系。
- `Precision and Recall` 提供了 F1 的两个基础组成部分。
- `Testing Set` 解释 F1 应在哪类数据上计算才有意义。
- `Generalization` 解释为什么测试集上的 F1 比训练集上的 F1 更值得关心。

## 待整理

- F-beta Score：precision 与 recall 的非对称加权版本。
- Macro F1：按类别平均的 F1。
- Micro F1：按全局计数计算的 F1。
- Weighted F1：按类别权重加权的 F1。
