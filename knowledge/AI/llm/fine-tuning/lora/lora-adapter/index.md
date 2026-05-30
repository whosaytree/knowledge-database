# LoRA Adapter

## 核心理解

LoRA Adapter 是 LoRA 微调后得到的一组低秩增量参数。

它不是完整模型，也通常不是稀疏权重。LoRA 训练时冻结基础模型的原始权重，只更新额外加入的低秩矩阵。训练完成后，这些低秩矩阵和相关配置被保存下来，就形成了 LoRA Adapter。

因此，LoRA Adapter 的本质不是“把完整微调权重压缩后的文件”，而是“训练过程本来就只学习的低秩参数增量”。它有明显的存储节省效果，但这种节省来自低秩参数化的训练方式，而不是事后压缩。

基础模型提供原始能力，LoRA Adapter 记录某个任务、领域或风格上学到的增量变化。推理时，只要加载兼容的基础模型，再叠加对应的 LoRA Adapter，就可以得到微调后的行为。

## 工作机制 / 构建过程

在 LoRA 中，原始权重矩阵 $W$ 通常被冻结。训练时新增两个低秩矩阵 $A$ 和 $B$，让模型学习一个增量更新：

$$
h = Wx + \Delta W x
$$

其中：

$$
\Delta W = BA
$$

LoRA Adapter 保存的主要就是这些新增的低秩参数，而不是基础模型的全部参数。

对于一个线性层，基础模型原本只使用：

$$
Wx
$$

加载 LoRA Adapter 后，实际计算变为：

$$
Wx + \frac{\alpha}{r} BAx
$$

其中：

- $W$ 是基础模型中冻结的原始权重。
- $A$ 和 $B$ 是 LoRA Adapter 中保存的低秩矩阵。
- $r$ 是 rank。
- $\alpha$ 是缩放系数。
- $\frac{\alpha}{r}$ 控制 adapter 更新量的强度。

如果直接保存完整的增量矩阵 $\Delta W$，它的大小会接近原始矩阵。LoRA 不这样做，而是保存两个更小的矩阵 $A$ 和 $B$。这就是 LoRA Adapter 文件通常很小的主要原因。

## 实现方法与工程细节

LoRA Adapter 通常包含以下信息：

- Adapter 权重：低秩矩阵 $A$ 和 $B$ 的参数。
- Target Modules：adapter 应该注入到哪些模型层。
- Rank：低秩矩阵的秩。
- Alpha：LoRA 更新量的缩放系数。
- Dropout：训练时使用的 LoRA dropout 配置。
- Base Model 信息：adapter 依赖的基础模型名称、版本或路径。

LoRA Adapter 必须和兼容的基础模型一起使用。如果基础模型结构、层名、hidden size 或 target modules 不匹配，adapter 通常无法正确加载。

在工程实践中，一个基础模型可以对应多个 LoRA Adapter。例如：

- 一个 adapter 用于法律问答。
- 一个 adapter 用于代码生成。
- 一个 adapter 用于固定输出格式。
- 一个 adapter 用于特定用户或业务场景。

这种模式让模型版本管理变得更轻量。基础模型只保存一份，不同任务只保存各自的 adapter。

## 加载、合并与切换

部署时有两种常见方式：动态加载 adapter，或者将 adapter 合并进基础模型。

动态加载 adapter 的优点是灵活。服务端可以在同一个基础模型上按需切换不同 adapter，适合多任务、多租户或快速实验。

合并 adapter 的优点是推理路径更简单。合并后模型不再需要单独处理 LoRA 分支，部署系统只看到一个普通模型权重。但合并后会失去快速切换 adapter 的便利，并且每个合并版本都需要单独保存。

选择动态加载还是合并，通常取决于部署目标：

- 如果需要频繁切换任务，适合动态加载。
- 如果只部署一个固定任务，适合合并。
- 如果追求最简单的推理服务形态，适合合并。
- 如果要维护大量领域版本，适合保留独立 adapter。

## 常见误解

LoRA Adapter 不是 prompt。Prompt 通过输入文本影响模型行为，LoRA Adapter 通过参数增量改变模型计算过程。

LoRA Adapter 也不是完整 checkpoint。它通常不能脱离基础模型单独运行，因为它只保存了相对于基础模型的增量参数。

LoRA Adapter 通常也不是稀疏权重。稀疏表示强调大部分元素为零，只存非零项；LoRA 强调低秩分解，用两个小矩阵表示一个受限容量的增量更新。

LoRA Adapter 不是完整权重的事后压缩包。它不是先训练出完整的 $\Delta W$，再压缩成 adapter；而是一开始就只训练低秩矩阵 $A$ 和 $B$。

LoRA Adapter 并不一定越大越好。更高 rank 会提高可学习容量，但也会增加训练成本、存储成本和过拟合风险。实际效果还取决于数据质量、target modules、训练配置和任务难度。

## 与相关节点的关系

LoRA Adapter 是 `LoRA` 节点下的工程产物节点。

它和 `Fine-tuning` 的关系是：Fine-tuning 描述继续训练模型的总体过程，LoRA 是参数高效微调方法，LoRA Adapter 是 LoRA 训练完成后保存和部署的低秩增量参数。

它也和模型部署、模型版本管理、多任务服务有关。后续如果新增 `QLoRA`、`PEFT`、`Model Merge` 或 `Serving` 节点，LoRA Adapter 可以作为它们之间的连接点。

## 待整理

- Adapter Composition：组合多个 adapter 的方法。
- Adapter Routing：按任务选择 adapter 的机制。
- Merge and Unload：合并 LoRA 权重并移除 adapter 分支。
- Base Model Compatibility：adapter 与基础模型结构兼容性。
