# LLM

## 核心理解

LLM（Large Language Model，大语言模型）是一类以大规模文本和多模态数据训练出来的基础模型，核心能力是根据上下文预测、生成和转换序列内容。

现代 LLM 通常以 Transformer 为基础结构，通过预训练获得通用语言能力，再通过指令微调、偏好对齐、工具调用和检索增强等方式适配实际任务。它的能力来自模型结构、训练数据、训练目标、推理方式和对齐方法的共同作用。

## 工作机制 / 构建过程

LLM 的基本工作过程可以分为训练阶段和推理阶段。

训练阶段通常包括：

1. 数据收集与清洗：从网页、书籍、代码、论文、问答、对话等来源构建训练语料。
2. 分词与序列化：将文本切分为 token，并转换为模型可处理的数字序列。
3. 预训练：使用大规模自监督目标训练模型，常见目标是根据前文预测下一个 token。
4. 指令微调：用人工构造或筛选的指令数据，让模型学会按照用户意图回答。
5. 偏好对齐：通过人类反馈、奖励模型或偏好优化方法，使输出更符合有用性、安全性和风格要求。
6. 评估与部署：通过基准测试、人工评估和线上反馈验证模型能力，并部署到推理系统中。

推理阶段中，模型接收 prompt，将上下文编码为 token 序列，然后逐步预测下一个 token。每次生成的新 token 会被追加到上下文中，继续参与后续预测，直到达到停止条件。

## 实现方法与工程细节

LLM 的工程实现通常涉及以下层面：

- 模型结构：现代 LLM 多基于 Transformer decoder-only 架构，依赖自注意力机制建模上下文关系。
- Tokenizer：负责文本与 token ID 之间的转换，直接影响上下文长度、压缩效率和语言覆盖能力。
- Context Window：模型一次推理能处理的最大上下文长度，限制了输入文档、历史对话和工具结果的规模。
- Decoding Strategy：包括 greedy decoding、temperature sampling、top-k、top-p、beam search 等生成策略。
- KV Cache：推理时缓存历史 token 的 key/value，减少重复计算，提高生成效率。
- Fine-tuning：通过继续训练调整模型行为，包括全量微调、LoRA、QLoRA 等方法。
- Alignment：让模型输出更符合人类偏好和安全边界，常见方法包括 RLHF、DPO、RLAIF 等。
- Serving：部署时需要考虑显存、批处理、并发、延迟、吞吐量、量化和模型切分。

## 子节点

- [Fine-tuning](fine-tuning/index.md)
- [Distributed Training](distributed-training/index.md)

## 待整理

- Transformer：LLM 最常见的基础网络结构。
- Token：模型处理文本的基本离散单位。
- Pretraining：用大规模数据训练通用能力。
- Instruction Tuning：让模型学会遵循任务指令。
- Alignment：让输出更符合人类偏好。
- RLHF：基于人类反馈优化模型行为。
- DPO：直接使用偏好数据优化模型。
- KV Cache：推理时缓存注意力中间结果。
- Context Window：模型一次可处理的上下文范围。
- RAG：结合检索结果增强生成质量。
