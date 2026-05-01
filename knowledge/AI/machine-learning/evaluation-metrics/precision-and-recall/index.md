# Precision and Recall

## 核心理解

Precision 和 recall 是分类任务中最常见的一组评估指标，尤其适合在“正类是否重要”或“类别分布不平衡”的场景下使用。

它们分别回答两个不同问题：

- precision 关注：被模型判成正类的样本里，真正为正的比例有多高。
- recall 关注：所有真实正类里，有多少被模型成功找出来。

因此，这两个指标不是彼此替代关系，而是分别描述“预测出来的正类有多准”和“真实正类找得有多全”。

## 从混淆矩阵理解

对于二分类任务，通常会用以下计数来定义指标：

- TP：真实为正，预测也为正。
- FP：真实为负，但预测为正。
- FN：真实为正，但预测为负。
- TN：真实为负，预测也为负。

在这个框架下：

- precision 关注的是 TP 和 FP。
- recall 关注的是 TP 和 FN。

## 定义

Precision 可以写成：

$$
P = \frac{TP}{TP + FP}
$$

Recall 可以写成：

$$
R = \frac{TP}{TP + FN}
$$

其中：

- $TP + FP$ 表示所有被模型预测为正类的样本数。
- $TP + FN$ 表示所有真实正类的样本数。

## Precision 的直觉

Precision 高，说明模型一旦说“这是正类”，往往比较可信。

也就是说，它更关心“报出来的正类里，有多少是真的”。

这在误报代价高的场景中尤其重要。例如：

- 垃圾邮件过滤中，把正常邮件误判为垃圾邮件。
- 医疗筛查中，把健康人误判为高风险。
- 检索系统中，返回结果里混入太多无关项。

## Recall 的直觉

Recall 高，说明模型能覆盖更多真实正类，不容易漏掉真正重要的目标。

也就是说，它更关心“该找出来的正类，到底找出来了多少”。

这在漏报代价高的场景中尤其重要。例如：

- 疾病筛查中漏掉真正患者。
- 安全检测中漏掉真实异常。
- 检索系统中没能召回相关结果。

## 为什么 Precision 和 Recall 往往不能同时最大化

很多模型都会面临一个阈值取舍问题。

如果把判定正类的阈值调低：

- 模型会更容易报正类；
- recall 往往上升；
- 但 precision 可能下降。

如果把阈值调高：

- 模型会更谨慎地报正类；
- precision 往往上升；
- 但 recall 可能下降。

因此，precision 和 recall 经常体现的是同一个模型在不同决策阈值下的取舍关系。

## 与 Accuracy 的区别

Accuracy 关注的是整体预测正确率：

$$
\text{accuracy} = \frac{TP + TN}{TP + TN + FP + FN}
$$

它在类别平衡且误报、漏报代价接近时比较直观。

但在类别极不平衡时，accuracy 可能产生误导。例如，若正类极少，模型即使几乎总是预测负类，也可能得到很高 accuracy，但 recall 会很差。

因此，在正类稀少或不同错误代价差异很大时，precision 和 recall 往往比 accuracy 更有解释力。

## 常见使用场景

可以粗略这样理解：

- 更怕误报时，更关注 precision。
- 更怕漏报时，更关注 recall。
- 两者都重要时，通常还会继续看 [F1 Score](../f1-score/index.md)。

## 与检索任务的关系

在检索任务中，这两个概念也非常常见：

- precision 关注返回结果中相关结果的比例。
- recall 关注所有相关结果中被成功返回的比例。

因此，它们不仅属于分类评估，也经常出现在搜索与推荐系统里。

## 与相关节点的关系

- `Evaluation Metrics` 讨论 precision 和 recall 所属的评估指标体系。
- `Testing Set` 解释这些指标应在什么数据上计算才有意义。
- `Generalization` 解释为什么测试集上的 precision 和 recall 比训练集上的结果更值得关心。
- `F1 Score` 将进一步讨论如何综合 precision 与 recall。

## 待整理

- F1 Score：precision 与 recall 的调和平均。
- Confusion Matrix：precision 与 recall 的基础计数框架。
- Threshold：分类阈值如何影响 precision 与 recall。
- PR Curve：不同阈值下 precision-recall 的整体表现。
