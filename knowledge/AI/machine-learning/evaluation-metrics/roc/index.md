# ROC (Receiver Operating Characteristic)

## 核心理解

ROC 是 Receiver Operating Characteristic 的缩写，用来描述一个二分类模型在不同分类阈值下的整体区分能力。

它不是只看模型在某一个固定阈值下的结果，而是考察：当阈值连续变化时，模型在“识别正类”和“误报负类”之间如何取舍。

因此，ROC 更接近一种全局视角下的分类性能描述，而不是单点指标。

## ROC 曲线是什么

ROC curve 的横轴是 false positive rate，纵轴是 true positive rate。

也就是说，ROC 曲线描述的是：

- 横轴：模型错误地把负类判成正类的比例。
- 纵轴：模型正确地把正类判成正类的比例。

随着分类阈值变化，这两个量会一起变化，于是形成一条曲线。

## 定义

true positive rate 也常写作 TPR，它可以写成：

$$
TPR = \frac{TP}{TP + FN}
$$

它其实就是 recall。

false positive rate 也常写作 FPR，它可以写成：

$$
FPR = \frac{FP}{FP + TN}
$$

因此，ROC 曲线可以理解为：

- 在不同阈值下，以 FPR 为横轴；
- 以 TPR 为纵轴；
- 画出模型的整体表现轨迹。

## ROC 的直觉

可以粗略理解为：ROC 关注的是，当你想要提高“找出正类”的能力时，需要付出多少“误报负类”的代价。

如果一条 ROC 曲线整体更靠近左上角，通常意味着：

- 在较低误报率下，就能达到较高召回；
- 模型的区分能力更强。

如果曲线接近对角线，则说明模型的排序或区分能力较弱，接近随机猜测。

## 为什么 ROC 不依赖单一阈值

像 precision、recall、F1 score 这类指标，通常都对应某个具体分类阈值下的结果。

但 ROC 不固定某一个阈值，而是把所有可能阈值下的 TPR 和 FPR 都考虑进来。

这使得 ROC 更适合回答这样的问题：

- 这个模型整体排序能力强不强？
- 当阈值改变时，模型表现是否稳定？
- 两个模型在不同阈值范围下谁更优？

## ROC 与 AUC 的关系

ROC 是一条曲线，而 AUC 是这条曲线下面积。

也就是说：

- ROC 描述的是不同阈值下的整体性能轨迹。
- AUC 用一个标量概括这条轨迹的总体优劣。

通常来说：

- AUC 越大，模型整体区分正负样本的能力越强。
- AUC 为 0.5 时，通常接近随机猜测。
- AUC 越接近 1，模型排序能力通常越好。

因此，很多时候大家说 “看 ROC”，实际也常常是在看 ROC-AUC。

## ROC 与 Precision-Recall 的区别

ROC 关注的是 TPR 与 FPR 的关系。

Precision-Recall 更关注的是 precision 与 recall 的关系。

两者都反映阈值变化下的模型表现，但强调点不同：

- ROC 更强调正负样本区分能力。
- PR 更强调正类预测质量与召回之间的取舍。

当类别比较平衡时，ROC 往往较直观。

当正类非常稀少时，PR curve 往往更有解释力，因为此时少量 false positive 就可能显著影响实际使用价值。

## 常见使用场景

ROC 常用于以下情况：

- 比较模型整体排序能力。
- 不想把评估结论绑定在某一个固定阈值上。
- 希望观察模型在不同误报率约束下的行为变化。

它在风险评分、医学筛查、异常检测、二分类排序模型中都很常见。

## ROC 的局限

- 它本身不是一个单点决策指标，不能直接替代业务阈值选择。
- 在极度类别不平衡时，ROC 可能显得过于乐观。
- 即使 ROC 或 AUC 较好，也不代表某个具体阈值下的 precision、recall、F1 一定满足业务要求。

因此，ROC 更适合做整体能力分析，而不是单独决定最终上线阈值。

## 与相关节点的关系

- `Evaluation Metrics` 讨论 ROC 所属的评估指标体系。
- `Precision and Recall` 讨论固定阈值下正类识别质量。
- `F1 Score` 讨论 precision 与 recall 的综合平衡。
- `Testing Set` 解释 ROC 应在哪类数据上计算才有意义。
- `Generalization` 解释为什么测试集上的 ROC 比训练集上的 ROC 更值得关心。

## 待整理

- AUC：ROC 曲线下面积。
- PR Curve：类别不平衡时更常对照使用的曲线。
- Threshold Selection：如何从 ROC 视角选择实际分类阈值。
- Confusion Matrix：ROC 中 TPR 和 FPR 的基础计数来源。
