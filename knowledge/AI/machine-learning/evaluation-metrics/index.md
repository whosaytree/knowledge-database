# Evaluation Metrics

## 核心理解

Evaluation metrics 讨论的是：模型的预测结果，应该如何被量化和比较。

在机器学习里，损失函数回答的是“训练时优化什么”，评估指标回答的是“最终效果怎么看”。两者有时一致，有时并不一致。

不同指标适合回答不同问题。例如：

- 整体正确率高不高？
- 正类预测有多可信？
- 正类是否被尽可能找出来了？
- 模型是否在不同阈值下仍然稳定？

## 关键问题

- 指标是否适合当前任务类型？
- 指标是否受类别不平衡影响？
- 指标是否依赖分类阈值？
- 训练目标与评估指标是否一致？
- 单一指标是否掩盖了重要取舍？

## 主要方向

- [Accuracy](accuracy/index.md)：整体预测正确的比例。
- [Precision and Recall](precision-and-recall/index.md)：分类任务中最常见的一组指标，尤其适合分析正类识别质量。
- [F1 Score](f1-score/index.md)：precision 和 recall 的综合平衡指标。
- [ROC](roc/index.md)：从阈值变化角度观察模型整体区分能力。
- PR Curve：在类别不平衡场景下常用的曲线评估方式。

## 与相关节点的关系

- `Generalization` 解释为什么要在测试集上评估模型。
- `Testing Set` 解释评估应在哪类数据上进行。
- `Evaluation Metrics` 解释评估结果应如何量化。
- `Loss Functions` 解释训练过程中最小化的目标是什么。

## 子节点

- [Accuracy](accuracy/index.md)
- [Precision and Recall](precision-and-recall/index.md)
- [F1 Score](f1-score/index.md)
- [ROC](roc/index.md)

## 待整理

- Confusion Matrix：分类指标的基础计数框架。
- PR Curve：precision-recall 的曲线化分析。
