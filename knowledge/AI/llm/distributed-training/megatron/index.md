# Megatron

## 核心理解

Megatron 通常指围绕大模型训练构建的一套并行训练框架与工程体系，最常见的语境是 Megatron-LM。

它的核心价值不是提出单一新算法，而是把大模型训练中常见的并行方式系统化地组合起来，让参数规模、序列长度和训练吞吐都能继续扩展。可以把它理解为：当单纯依赖数据并行已经不够时，Megatron 提供了一套把模型内部计算、层间执行和训练状态管理拆到多卡多机上的工程方法。

因此，Megatron 更像一个“并行训练组织框架”，而不是像 FSDP 那样单独描述某一种状态分片机制。

## 工作机制 / 构建过程

Megatron 的核心思路是：不要只把不同样本分给不同 GPU，而是把一个大模型本身也拆开，让多张卡共同完成一次前向和反向传播。

在典型大模型训练中，Megatron 往往会组合以下并行方式：

1. Data Parallelism：不同 rank 处理不同训练样本，并同步梯度或训练状态。
2. Tensor Parallelism：把同一层中的矩阵运算切分到多张卡上共同完成。
3. Pipeline Parallelism：把模型不同层段分到不同设备上，按流水线方式执行。
4. Sequence Parallelism：把部分与序列维度相关的计算或状态进一步切分，以降低显存压力。
5. Optimizer / State Sharding：对优化器状态或参数状态做分布式管理，减轻单卡负担。

粗略地说，Megatron 不是只回答“怎么同步梯度”，而是在回答：

- 一个超大模型的某一层怎么算？
- 整个模型怎么切成多个 stage？
- 各种并行维度如何组合？
- 通信如何安排才能不把吞吐完全吃掉？

## 实现方法与工程细节

### Tensor Parallelism

Megatron 最有代表性的能力之一是 tensor parallelism。

它会把同一层中的大矩阵按列或按行切分，让多个 GPU 分别计算局部结果，再通过通信得到完整输出。这样做的核心意义是：单层参数和单次矩阵乘法不再要求完全落在一张卡上。

在 Transformer 中，这种切分常用于：

- Attention projection
- MLP 中的线性层
- 输出投影层

这样可以把单层参数规模和单卡显存压力压下来，但代价是层内部通信会增加。

### Pipeline Parallelism

当模型层数很多时，只切单层还不够，Megatron 通常还会把不同层段放到不同设备组上。

这样一来：

- 前面的 stage 负责较早层。
- 后面的 stage 负责较深层。
- 不同 micro-batch 可以像流水线一样交错通过不同 stage。

Pipeline parallelism 的主要收益是进一步扩展可训练模型深度和总参数规模，但也会引入：

- pipeline bubble
- 调度复杂度
- micro-batch 切分问题
- stage 间负载不均衡问题

### 多维并行组合

Megatron 的工程难点之一在于：它通常不是只开一种并行方式，而是把多种并行维度一起组合。

例如一个训练系统可能同时使用：

- tensor parallel
- pipeline parallel
- data parallel

这意味着训练 world size 不再只是“多少张卡做数据并行”这么简单，而是多个并行维度的乘积。配置时需要明确：

- tensor model parallel size
- pipeline model parallel size
- data parallel size

这些维度之间如果配置不合理，会直接影响显存利用率、通信模式和吞吐量。

### 通信与计算重叠

Megatron 能否真正高效，关键不只在“是否切开了模型”，而在于切开之后的通信能否被合理隐藏。

工程上通常需要关注：

- all-reduce / reduce-scatter / all-gather 的时机
- stage 间激活传递成本
- micro-batch 数量是否足够支撑流水线
- 节点内和节点间带宽差异
- 通信能否与 GEMM 计算重叠

如果通信布局不合适，并行规模越大，吞吐反而越差。

### 与训练配方的耦合

Megatron 往往不是一个“包一下模型就能自动扩展”的轻量工具，而是和训练脚本、batch 切分、并行配置、checkpoint 格式、混合精度策略强耦合。

这意味着它更适合：

- 规模较大的预训练或持续训练任务
- 对训练吞吐和模型规模有强诉求的系统
- 可以接受更复杂工程配置的团队

而不一定适合只想快速做一个小规模实验的场景。

## 与 FSDP、DDP 的关系

Megatron 和 DDP、FSDP 都属于分布式训练体系，但关注点不同。

DDP 主要解决的是：

- 多张卡各自保留完整模型副本
- 通过梯度同步实现样本级并行

FSDP 主要解决的是：

- 参数、梯度和优化器状态如何分片保存
- 怎样降低单卡显存压力

Megatron 更强调的是：

- 单层计算如何切分
- 模型不同层段如何分布
- 多种并行维度如何联合组成大规模训练拓扑

因此它和 FSDP 不是简单替代关系。粗略理解：

- FSDP 更偏“状态分片与内存管理”
- Megatron 更偏“模型计算图切分与多维并行组织”

在实际系统里，两类思路也可能被组合使用，但工程复杂度会明显上升。

## 适用场景与局限

Megatron 更适合以下场景：

- 单卡和普通数据并行已经无法承载模型规模。
- 希望把训练扩展到更多 GPU，并尽量提高吞吐。
- 训练任务以大规模预训练或持续训练为主。
- 团队能接受复杂的并行配置和调试成本。

它的局限通常包括：

- 配置复杂，理解门槛高。
- 对集群通信条件要求高。
- 并行维度一多，排障成本明显上升。
- checkpoint、恢复训练和迁移部署流程更复杂。
- 对小规模训练任务而言，工程收益可能不划算。

## 与相关节点的关系

Megatron 属于 `LLM -> Distributed Training` 路径下的并行训练体系节点。

它和 `FSDP` 相关，但不是同类抽象。FSDP 更聚焦参数、梯度和优化器状态如何分片；Megatron 更聚焦模型内部计算和层级结构如何切分。后续如果知识库继续扩展，更适合把 `Tensor Parallelism`、`Pipeline Parallelism`、`Sequence Parallelism` 等节点作为 `Megatron` 的相关节点，或直接作为同级子主题逐步展开。

## 待整理

- Megatron-LM：面向大模型训练的 Megatron 实现体系。
- Tensor Parallelism：把单层矩阵运算切到多卡上。
- Pipeline Parallelism：把模型不同层段分到不同设备组。
- Sequence Parallelism：沿序列维度进一步分摊开销。
- Micro-batch：流水线训练中的小批次切分单位。
- Pipeline Bubble：流水线并行中的空转开销。
- Model Parallelism：把模型本身拆开到多设备上。
- Distributed Optimizer：分布式管理优化器状态的机制。
