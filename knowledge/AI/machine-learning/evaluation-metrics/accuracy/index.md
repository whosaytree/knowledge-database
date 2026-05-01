# Accuracy

## 核心理解

Accuracy 是分类任务中最直观的一类评估指标。

它回答的问题是：在全部样本里，模型有多少比例预测正确。

因此，accuracy 关心的是整体正确率，而不是某一类错误的具体代价，也不是正类识别质量的细分结构。

## 从混淆矩阵理解

对于二分类任务，通常会用以下计数来定义 accuracy：

- TP：真实为正，预测也为正。
- FP：真实为负，但预测为正。
- FN：真实为正，但预测为负。
- TN：真实为负，预测也为负。

其中：

- TP 和 TN 都属于预测正确。
- FP 和 FN 都属于预测错误。

## 定义

Accuracy 可以写成：

$$
\text{accuracy} = \frac{TP + TN}{TP + TN + FP + FN}
$$

也就是说：

- 分子表示预测正确的样本数。
- 分母表示全部样本数。

如果把错误率记作 $E$，那么也可以写成：

$$
\text{accuracy} = 1 - E
$$

## Accuracy 的直觉

Accuracy 高，说明模型从整体上看预测正确的比例较高。

它的优点是：

- 直观；
- 易于理解；
- 在很多任务里可以快速给出整体表现印象。

因此，在类别比较平衡，且不同类型错误代价接近时，accuracy 往往是一个合理的第一眼指标。

## Accuracy 什么时候比较有用

Accuracy 比较适合以下情况：

- 类别分布比较平衡。
- 误报和漏报的代价差异不大。
- 任务重点是整体分类正确率，而不是某个少数类是否被充分识别。

例如，在一些普通的多分类识别任务中，如果各类别数量差异不大，accuracy 往往可以作为一个基础指标使用。

## Accuracy 为什么可能误导

Accuracy 的局限在于：它把所有样本一视同仁地合并统计。

这意味着，如果某一类样本占比特别大，模型即使主要只是在“大类样本”上做对，也可能得到很高 accuracy，但在真正重要的小类上表现很差。

例如：

- 正类只占极少数。
- 模型几乎总是预测负类。
- 那么 TN 会很多，accuracy 可能仍然很高。
- 但此时模型对正类几乎没有识别能力，recall 会很差。

因此，在类别极不平衡时，accuracy 往往不能充分反映模型是否真的有用。

## 与 Precision 和 Recall 的区别

Accuracy 关注的是整体预测正确率。

Precision 和 recall 关注的是正类识别的不同侧面：

- precision 关注预测为正的结果里，有多少是真的。
- recall 关注真实正类里，有多少被成功找出。

这意味着：

- accuracy 把 TN 也纳入了核心计算。
- precision 不使用 TN。
- recall 也不使用 TN。

因此，当负类远多于正类时，accuracy 往往更容易显得乐观，而 precision 和 recall 往往更能反映正类识别质量。

## 与 F1 Score 的区别

F1 score 是 precision 和 recall 的调和平均，它更关注正类识别的整体平衡。

Accuracy 和 F1 的主要区别在于：

- accuracy 关注全部样本上的总体正确率。
- F1 关注 precision 和 recall 是否同时做得较好。
- accuracy 会明显受到 TN 数量影响。
- F1 不直接使用 TN。

因此，在异常检测、欺诈检测、疾病筛查、信息检索等“正类识别更关键”的任务里，F1 往往比 accuracy 更有解释力。

## 常见使用方式

在实际分析模型时，accuracy 通常适合：

- 作为整体表现的第一眼指标；
- 和 precision、recall、F1 一起看；
- 在类别平衡任务中做基础比较。

但如果业务对误报或漏报特别敏感，就不应只看 accuracy 一个数。

## 与相关节点的关系

- `Evaluation Metrics` 讨论 accuracy 所属的评估指标体系。
- `Precision and Recall` 讨论正类识别质量的两个核心方向。
- `F1 Score` 讨论 precision 与 recall 的综合平衡。
- `Generalization` 解释为什么测试集上的 accuracy 比训练集上的 accuracy 更值得关心。
- `Confusion Matrix` 提供 accuracy 的基础计数框架。

## 待整理

- Confusion Matrix：accuracy、precision、recall 等指标的基础计数来源。
- Balanced Accuracy：类别不平衡时常用的修正版 accuracy。
- Top-k Accuracy：多分类任务中常见的扩展指标。
