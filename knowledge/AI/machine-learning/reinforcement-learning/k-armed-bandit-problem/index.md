# k-armed Bandit Problem

## 核心理解

k-armed Bandit Problem 是强化学习中最基础的决策问题之一。

它描述的是：一个智能体面对 $k$ 个可选动作，每次只能选择其中一个动作，并获得该动作对应的奖励。智能体的目标是在多次选择中，让累计奖励尽可能大。

这个问题名字来自“多臂老虎机”：每个 arm 都像一台老虎机的拉杆，不同拉杆背后有不同但未知的奖励分布。智能体不知道哪个 arm 最好，只能通过不断尝试来估计它们的价值。

## 问题设定

假设有 $k$ 个动作：

$$
a_1, a_2, \dots, a_k
$$

每次交互时，智能体选择一个动作 $A_t$，然后收到一个奖励 $R_t$。

每个动作都有一个真实但未知的期望奖励：

$$
q_*(a) = \mathbb{E}[R_t \mid A_t = a]
$$

其中：

- $q_*(a)$ 表示动作 $a$ 的真实价值。
- $R_t$ 表示第 $t$ 次选择后获得的奖励。
- $A_t$ 表示第 $t$ 次选择的动作。

智能体无法直接看到 $q_*(a)$，只能通过实际选择动作并观察奖励来估计它。

## 动作价值估计

智能体通常会维护一个估计值：

$$
Q_t(a)
$$

它表示在第 $t$ 步时，对动作 $a$ 价值的当前估计。

最简单的估计方式是样本平均：

$$
Q_t(a)
=
\frac{\text{动作 } a \text{ 到目前为止获得的奖励总和}}
{\text{动作 } a \text{ 到目前为止被选择的次数}}
$$

也就是：一个动作过去获得的平均奖励越高，智能体越倾向认为它是好动作。

但这个估计一开始是不可靠的，因为样本数量很少，某个动作可能只是运气好或运气差。

## Exploration vs Exploitation

k-armed Bandit Problem 的核心矛盾是 exploration 和 exploitation。

Exploitation 指的是利用当前已知信息，选择目前估计价值最高的动作。

Exploration 指的是尝试其他动作，收集更多信息，避免过早锁定一个其实并不最优的动作。

如果智能体总是 exploitation，它可能会因为早期随机奖励而误判，长期 stuck 在次优动作上。

如果智能体总是 exploration，它会浪费太多机会在低价值动作上，累计奖励也会下降。

因此，bandit 问题的关键不是单次选择最优，而是在“多试试”和“用当前最好选择”之间做权衡。

## Greedy 策略

最直接的策略是 greedy policy：每一步都选择当前估计价值最高的动作。

可以写成：

$$
A_t
=
\arg\max_a Q_t(a)
$$

它的优点是简单，能够充分利用当前估计。

但它的问题也很明显：如果早期估计错了，它可能永远不再尝试其他动作，从而错过真正更好的 arm。

## $\epsilon$-greedy 策略

$\epsilon$-greedy 是 bandit 问题中最常见的基础策略之一。

它的规则是：

- 以 $1 - \epsilon$ 的概率选择当前估计最好的动作。
- 以 $\epsilon$ 的概率随机选择一个动作。

可以写成：

$$
A_t =
\begin{cases}
\arg\max_a Q_t(a), & \text{with probability } 1-\epsilon \\
\text{random action}, & \text{with probability } \epsilon
\end{cases}
$$

这里 $\epsilon$ 控制探索强度。

- $\epsilon$ 越大，探索越多。
- $\epsilon$ 越小，越偏向利用当前估计。

## Regret

评价 bandit 算法时，经常使用 regret。

Regret 衡量的是：由于没有总是选择最优动作，智能体损失了多少潜在奖励。

如果最优动作的真实价值为：

$$
q_*(a^*) = \max_a q_*(a)
$$

那么第 $t$ 步选择动作 $A_t$ 的瞬时 regret 可以写成：

$$
q_*(a^*) - q_*(A_t)
$$

累计 regret 则是多步 regret 的总和：

$$
\sum_{t=1}^{T}
\left(
q_*(a^*) - q_*(A_t)
\right)
$$

好的 bandit 策略不仅要拿到高奖励，也要让 regret 增长得尽可能慢。

## 与完整强化学习的区别

k-armed Bandit Problem 可以看作最简化的强化学习问题。

它和完整 RL 的关键区别是：

- bandit 没有状态转移。
- 当前动作不会改变未来环境状态。
- 奖励通常立即返回，没有长期延迟奖励。
- 目标仍然是通过交互学习更好的决策策略。

完整强化学习通常需要处理 state、transition、long-term return，而 bandit 主要聚焦在 action selection 和 exploration-exploitation tradeoff。

因此，bandit 是理解强化学习之前很好的起点。

## 与相关节点的关系

- `Reinforcement Learning` 讨论通过交互学习决策策略的整体框架。
- `Exploration` 是 bandit 问题的核心难点之一。
- `Policy` 可以理解为在不同估计下如何选择动作的规则。
- `Value Function` 在 bandit 中退化为动作价值估计 $Q_t(a)$。
- `Q-Learning` 可以看作在有状态转移场景中学习动作价值的方法。
- `Online Learning` 与 bandit 一样关注持续决策和反馈更新。

## 子节点

- [ε-greedy Method](epsilon-greedy-method/index.md)

## 待整理

- UCB：基于不确定性上界选择动作的方法。
- Thompson Sampling：基于后验采样的 bandit 策略。
- Contextual Bandit：引入上下文信息的 bandit 问题。
- Regret：衡量错过最优动作导致的累计损失。
- Optimistic Initial Values：用乐观初始估计鼓励探索。
