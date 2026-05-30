# ε-greedy Method

## 核心理解

ε-greedy method 是 k-armed bandit problem 中最基础的探索策略之一。

它的核心思想是：大多数时候选择当前看起来最好的动作，但保留一小部分概率随机尝试其他动作。

这样做是为了避免 greedy method 的问题：如果智能体过早相信某个动作最好，它可能会一直选择这个动作，从而错过真正更好的动作。

ε-greedy 用一个很简单的机制平衡 exploitation 和 exploration：

- exploitation：利用当前估计，选择最优动作。
- exploration：随机尝试动作，继续收集信息。

## 策略定义

设当前对动作 $a$ 的价值估计为：

$$
Q_t(a)
$$

greedy action 是当前估计价值最高的动作：

$$
A_t^*
=
\arg\max_a Q_t(a)
$$

ε-greedy method 的选择规则是：

$$
A_t =
\begin{cases}
\arg\max_a Q_t(a), & \text{with probability } 1-\epsilon \\
\text{random action}, & \text{with probability } \epsilon
\end{cases}
$$

其中：

- $\epsilon$ 是探索概率。
- $1-\epsilon$ 是利用当前最优估计的概率。
- random action 通常从所有 $k$ 个动作中均匀随机选择。

## ε 的含义

$\epsilon$ 控制探索强度。

如果：

$$
\epsilon = 0
$$

那么策略退化成 pure greedy method，永远选择当前估计最好的动作。

如果 $\epsilon$ 较大，智能体会更频繁地随机尝试动作，获得更多探索数据，但也会更多地选择当前看起来不好的动作。

如果 $\epsilon$ 较小，智能体会更稳定地利用当前最好动作，但也更容易因为早期误判而停留在次优动作上。

因此，$\epsilon$ 不是越大越好，也不是越小越好。它控制的是探索成本和信息收益之间的权衡。

## 为什么需要随机探索

在 bandit 问题中，动作的真实价值：

$$
q_*(a)
$$

是未知的。

智能体只能通过选择动作并观察奖励来估计：

$$
Q_t(a)
$$

早期估计通常很不稳定。某个动作可能只是因为运气好，在很少几次尝试中获得了高奖励；另一个动作也可能只是因为运气差，被低估了。

如果此时使用 pure greedy method，智能体可能会一直选择当前估计最高的动作，而不再给其他动作机会。

ε-greedy 的随机探索可以缓解这个问题：即使某个动作当前估计不高，它仍然有一定概率被选择，从而有机会修正估计。

## 一个简单例子

假设有 10 个动作，也就是：

$$
k = 10
$$

如果设置：

$$
\epsilon = 0.1
$$

那么每一步：

- 约 90% 的概率选择当前估计最好的动作。
- 约 10% 的概率随机选择一个动作。

如果随机选择是在全部 10 个动作中均匀采样，那么每个动作在探索阶段被选中的概率是：

$$
\frac{0.1}{10} = 0.01
$$

注意：当前 greedy action 也可能在随机探索时再次被选中。

因此，greedy action 的总选择概率通常不是简单的 $0.9$，而是：

$$
1-\epsilon + \frac{\epsilon}{k}
$$

其他每个动作的选择概率是：

$$
\frac{\epsilon}{k}
$$

## 与 Greedy Method 的区别

Greedy method 每一步都选择：

$$
\arg\max_a Q_t(a)
$$

它完全依赖当前估计，不主动探索。

ε-greedy method 则在 greedy method 上加入随机探索：

- 大部分时间仍然选择当前最优动作。
- 少部分时间随机选择动作。
- 因此更有机会发现早期被低估的好动作。

代价是：ε-greedy 会故意选择一些当前看起来不好的动作，所以短期奖励可能低于 pure greedy。

## 固定 ε 与衰减 ε

最简单的 ε-greedy 使用固定 $\epsilon$。

固定 $\epsilon$ 的好处是实现简单，并且始终保留探索能力。

但在长期训练中，如果环境是 stationary 的，持续探索可能造成不必要的 regret，因为智能体已经比较确定哪个动作最好，却仍然会随机选择其他动作。

因此，有时会使用衰减 $\epsilon$：

$$
\epsilon_t \downarrow 0
$$

也就是训练早期多探索，训练后期逐渐减少探索。

这样可以让智能体先收集信息，再逐渐转向 exploitation。

## 优点

- 实现非常简单。
- 能缓解 pure greedy 过早陷入次优动作的问题。
- 不需要复杂的不确定性估计。
- 是理解 exploration-exploitation tradeoff 的基础方法。

## 局限

- 随机探索不区分动作好坏，可能浪费探索机会。
- 固定 $\epsilon$ 会在后期持续选择明显较差的动作。
- 它没有利用“不确定性”信息，不知道哪些动作更值得探索。
- 在复杂问题中，通常不如 UCB 或 Thompson Sampling 高效。

## 与相关节点的关系

- `k-armed Bandit Problem` 提供 ε-greedy method 的问题背景。
- `Greedy Method` 是 ε-greedy 的基础形式。
- `Exploration vs Exploitation` 是 ε-greedy 要解决的核心权衡。
- `UCB` 也是 bandit 策略，但它根据不确定性选择动作。
- `Thompson Sampling` 也是 bandit 策略，但它通过后验采样平衡探索与利用。

## 待整理

- Greedy Method：完全选择当前估计最优动作的策略。
- UCB：基于置信上界的动作选择方法。
- Thompson Sampling：基于后验采样的 bandit 策略。
- Decaying ε-greedy：逐渐降低探索概率的方法。
- Non-stationary Bandit：动作价值会随时间变化的 bandit 问题。
