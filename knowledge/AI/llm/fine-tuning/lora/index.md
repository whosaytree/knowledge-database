# LoRA

## 核心理解

LoRA（Low-Rank Adaptation）是一种参数高效微调方法，用少量可训练参数改变大模型的行为。

它的核心思路是冻结原始模型参数，在部分线性层旁边加入低秩矩阵。训练时只更新这些新增的低秩参数，基础模型本身保持不变。这样可以显著降低显存占用、训练成本和模型存储成本，同时保留基础模型的大部分能力。

## 工作机制 / 构建过程

在神经网络中，许多层可以表示为矩阵乘法。对于一个原始权重矩阵 `W`，Full Fine-tuning 会直接更新 `W`。LoRA 则冻结 `W`，额外学习一个低秩更新量。

常见形式可以写成：

```text
h = Wx + BAx
```

其中：

- `W` 是冻结的原始权重矩阵。
- `A` 和 `B` 是新增的可训练低秩矩阵。
- `BA` 表示对原始权重更新量的低秩近似。
- `x` 是输入向量。
- `h` 是该层输出。

因为 `A` 和 `B` 的维度远小于 `W`，训练参数量会大幅减少。训练完成后，LoRA 权重可以单独保存，也可以和原始权重合并成新的权重矩阵用于推理。

LoRA 的基本流程通常包括：

1. 选择基础模型，并冻结原始模型参数。
2. 选择注入 LoRA 的目标层，常见位置包括 attention 中的 query、key、value、output 投影层。
3. 设置 rank、alpha、dropout 等超参数。
4. 准备微调数据，并按任务格式构造输入输出样本。
5. 只训练 LoRA 新增参数。
6. 评估模型效果，并根据结果调整数据、rank 或目标层。
7. 保存 LoRA adapter，或将 adapter 合并到基础模型中。

## 实现方法与工程细节

LoRA 的关键工程参数包括：

- Rank：低秩矩阵的秩，通常记作 `r`。rank 越高，可学习容量越大，训练和存储成本也越高。
- Alpha：控制 LoRA 更新量缩放幅度，常和 rank 一起决定适配强度。
- Target Modules：指定哪些层注入 LoRA，直接影响训练效果和参数量。
- Dropout：用于降低过拟合风险，尤其在数据量较小时更常见。
- Adapter：训练后的 LoRA 参数文件，可独立于基础模型保存和加载。
- Merge：将 LoRA 更新量合并回原始权重，方便推理部署。
- Quantization：LoRA 可以和量化结合，形成 QLoRA 等低显存训练方案。

LoRA 的优势主要来自参数量和训练状态的减少。Full Fine-tuning 需要保存和更新全部模型参数，还要维护优化器状态。LoRA 只训练新增矩阵，因此训练显存、checkpoint 体积和多任务版本管理成本都更低。

## 与 Fine-tuning 的关系

LoRA 是 Fine-tuning 的一种实现方式，属于 Parameter-Efficient Fine-tuning。

Full Fine-tuning 通过更新全部参数改变模型行为。LoRA 通过低秩更新近似参数变化，把需要训练的内容限制在少量 adapter 参数中。对于许多领域适配、风格迁移、指令格式学习和小规模任务，LoRA 往往能以较低成本获得接近全量微调的效果。

在工程实践中，一个基础模型可以搭配多个 LoRA adapter。不同 adapter 可以对应不同任务、领域或客户场景，部署时按需加载或合并。

## 待整理

- Rank：LoRA 低秩矩阵的秩。
- Alpha：控制 LoRA 更新强度的缩放参数。
- Adapter：独立保存的 LoRA 参数。
- Target Modules：注入 LoRA 的目标层。
- Merge：将 LoRA 权重合并到基础模型。
- PEFT：只训练少量参数的微调范式。
- QLoRA：量化模型上训练 LoRA 参数。
- Attention Projection：注意力中的线性投影层。
