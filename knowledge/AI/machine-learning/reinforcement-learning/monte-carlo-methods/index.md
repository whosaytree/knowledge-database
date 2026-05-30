# Monte Carlo Methods

## 核心理解

Monte Carlo Methods 在强化学习中指的是：通过完整 episode 的实际回报样本来估计价值函数和改进策略的方法。

它不要求已知完整环境模型，也不需要知道状态转移概率：

$$
p(s', r \mid s, a)
$$

而是通过 agent 与 environment 的真实交互，收集 episode，然后用 episode 中实际观察到的 return 作为学习信号。

因此，Monte Carlo Methods 的核心是：

- 从经验样本中学习；
- 等 episode 结束后再计算 return；
- 用多次采样的平均结果估计状态或动作价值。

## Episode 与 Return

Monte Carlo Methods 通常适用于 episodic tasks，也就是交互过程会自然结束的任务。

一个 episode 可以写成：

```text
S_0, A_0, R_1, S_1, A_1, R_2, ..., S_T
```

从时间步 $t$ 开始的 return 是：

$$
G_t
=
R_{t+1}
+
\gamma R_{t+2}
+
\gamma^2 R_{t+3}
+
\cdots
+
\gamma^{T-t-1}R_T
$$

Monte Carlo 的关键做法是：等 episode 结束后，直接根据实际奖励序列计算 $G_t$，然后用它更新价值估计。

## 估计状态价值

对于给定策略 $\pi$，状态价值函数是：

$$
v_\pi(s)
=
\mathbb{E}_\pi[G_t \mid S_t = s]
$$

Monte Carlo 不直接求这个期望，而是通过多次访问状态 $s$ 得到多个 return 样本：

$$
G_t^{(1)}, G_t^{(2)}, \dots, G_t^{(n)}
$$

然后用平均值估计：

$$
V(s)
=
\frac{1}{n}
\sum_{i=1}^{n}G_t^{(i)}
$$

也就是说：某个状态之后实际得到过的平均 return，就是该状态价值的估计。

## First-Visit 与 Every-Visit

Monte Carlo 估计状态价值时常见两种方式。

First-Visit Monte Carlo 只使用每个 episode 中某个状态第一次出现后的 return。

Every-Visit Monte Carlo 则使用 episode 中该状态每一次出现后的 return。

例如一个 episode 中状态 $s$ 出现了三次：

```text
S_2 = s, S_5 = s, S_9 = s
```

First-Visit 只使用 $S_2$ 对应的 return。

Every-Visit 会使用 $S_2$、$S_5$、$S_9$ 对应的 return。

两者在样本足够多时都可以收敛到真实价值，但使用样本的方式不同。

## 增量式平均更新

为了避免保存所有历史 return，可以使用增量式平均。

如果第 $n$ 次观察到状态 $s$ 的 return 为 $G_n$，当前估计为 $V_n(s)$，那么更新为：

$$
V_{n+1}(s)
=
V_n(s)
+
\frac{1}{n}
\left[
G_n - V_n(s)
\right]
$$

更一般地，也可以使用固定步长 $\alpha$：

$$
V(s)
\leftarrow
V(s)
+
\alpha
\left[
G_t - V(s)
\right]
$$

这里的 $G_t - V(s)$ 表示当前 return 样本和已有价值估计之间的差。

## Monte Carlo Control

Monte Carlo Methods 不只可以做 policy evaluation，也可以用于 control，也就是寻找更好的策略。

对于 control，更常估计动作价值函数：

$$
q_\pi(s,a)
=
\mathbb{E}_\pi[G_t \mid S_t=s, A_t=a]
$$

因为如果知道每个状态下不同动作的价值，就可以直接改进策略。

策略改进通常使用 greedy 或 $\epsilon$-greedy：

$$
\pi(s)
=
\arg\max_a Q(s,a)
$$

或者在大多数时候选择当前最优动作，同时保留一部分随机探索。

## 为什么需要探索

如果策略只选择当前认为最好的动作，某些动作可能永远不会被尝试。

这样就无法可靠估计这些动作的价值。

因此 Monte Carlo control 通常需要保证充分探索。常见做法包括：

- Exploring Starts：让 episode 从不同状态和动作开始。
- $\epsilon$-greedy policy：在每个状态下保留随机探索概率。
- On-policy control：评估和改进同一个带探索的策略。
- Off-policy control：用一个行为策略探索，用另一个目标策略学习。

## 与 Dynamic Programming 的区别

Dynamic Programming 需要完整的环境模型，可以直接对所有可能转移求期望：

$$
\sum_{s', r}
p(s', r \mid s, a)
\left[
r + \gamma V(s')
\right]
$$

Monte Carlo Methods 不需要知道这个模型。

它们直接等待 episode 结束，使用实际观察到的 return：

$$
G_t
$$

因此：

- Dynamic Programming 是 model-based。
- Monte Carlo Methods 是 sample-based。
- Dynamic Programming 用期望更新。
- Monte Carlo Methods 用完整回报样本更新。

## 与 Temporal-Difference Learning 的区别

Monte Carlo Methods 必须等到 episode 结束后才能知道完整 return $G_t$。

Temporal-Difference Learning 不需要等 episode 结束，它使用一步奖励和下一状态估计构造 target：

$$
R_{t+1} + \gamma V(S_{t+1})
$$

因此：

- Monte Carlo 用实际完整 return，偏差小但方差可能大。
- TD 用 bootstrap target，方差较小但会引入估计偏差。
- Monte Carlo 更依赖完整 episode。
- TD 可以在线、逐步更新。

## 优点

- 不需要知道环境转移概率。
- 直接从实际经验中估计价值。
- 概念简单，return 的含义直观。
- 不依赖 bootstrap，不用下一状态价值估计来构造目标。

## 局限

- 通常需要等 episode 结束才能更新。
- 不适合没有自然终止的 continuing tasks，除非额外截断或改造。
- Return 可能方差较大，学习不稳定。
- 为了评估所有动作，需要足够探索。

## 与相关节点的关系

- `Reinforcement Learning` 提供 Monte Carlo Methods 所属的交互式学习框架。
- `Markov Decision Process` 提供状态、动作、奖励和转移的形式化描述。
- `Bellman Equation` 描述价值函数的递推关系，Monte Carlo 则直接用完整 return 样本估计价值。
- `Dynamic Programming` 使用已知模型求期望，Monte Carlo 使用实际 episode 样本。
- `ε-greedy Method` 可用于 Monte Carlo control 中保证探索。
- `Temporal-Difference Learning` 结合了 Monte Carlo 的采样思想和 Dynamic Programming 的 bootstrap 思想。

## 待整理

- First-Visit Monte Carlo：每个 episode 中只使用状态第一次出现后的 return。
- Every-Visit Monte Carlo：使用每次访问状态后的 return。
- Monte Carlo Prediction：用 episode return 估计给定策略的价值。
- Monte Carlo Control：用 Monte Carlo 估计动作价值并改进策略。
- Exploring Starts：通过不同初始状态动作保证探索。
- On-policy Monte Carlo：评估和改进同一个策略。
- Off-policy Monte Carlo：行为策略与目标策略分离。
