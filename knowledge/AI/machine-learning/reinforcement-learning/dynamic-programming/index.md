# Dynamic Programming

## 核心理解

Dynamic Programming，动态规划，在强化学习中指的是：当 MDP 的环境模型已知时，用 Bellman 方程系统地计算价值函数和改进策略的方法。

这里的环境模型通常包括：

- 状态集合 $\mathcal{S}$；
- 动作集合 $\mathcal{A}$；
- 状态转移概率 $p(s', r \mid s, a)$；
- 奖励结构；
- 折扣因子 $\gamma$。

动态规划的核心思想是：利用 Bellman 方程，把一个长期决策问题拆成当前一步和后续子问题，并通过反复更新价值估计，让价值函数逐渐满足 Bellman 一致性。

因此，在强化学习中，Dynamic Programming 不是一个单独算法，而是一组基于完整环境模型求解 MDP 的方法。

## 为什么需要已知环境模型

动态规划方法通常假设 agent 可以访问完整的 MDP dynamics：

$$
p(s', r \mid s, a)
$$

这意味着，对于任意状态 $s$ 和动作 $a$，我们知道它可能转移到哪些下一个状态 $s'$，获得哪些奖励 $r$，以及这些结果发生的概率。

有了这个模型，就可以不用实际采样，而是直接对所有可能结果求期望。

例如 Bellman expectation equation 中的更新包含：

$$
\sum_{s', r}
p(s', r \mid s, a)
\left[
r + \gamma v(s')
\right]
$$

如果不知道 $p(s', r \mid s, a)$，这个求和就无法直接计算，只能通过经验样本近似。

这也是动态规划和 Monte Carlo、Temporal-Difference 方法的重要区别。

## Policy Evaluation

Policy Evaluation 解决的问题是：给定一个策略 $\pi$，计算它的状态价值函数 $v_\pi(s)$。

它使用 Bellman expectation equation：

$$
v_\pi(s)
=
\sum_a \pi(a \mid s)
\sum_{s', r}
p(s', r \mid s, a)
\left[
r + \gamma v_\pi(s')
\right]
$$

由于 $v_\pi(s)$ 同时依赖其他状态的价值，通常无法一次直接得到所有状态价值。

迭代式 policy evaluation 会从任意初始价值函数开始，反复执行：

$$
V_{k+1}(s)
=
\sum_a \pi(a \mid s)
\sum_{s', r}
p(s', r \mid s, a)
\left[
r + \gamma V_k(s')
\right]
$$

当 $V_k$ 收敛时，就得到该策略的价值函数。

## Policy Improvement

Policy Improvement 解决的问题是：有了当前策略的价值函数后，如何构造一个更好的策略。

如果已经知道 $v_\pi(s)$，那么可以对每个状态比较不同动作的期望回报：

$$
q_\pi(s,a)
=
\sum_{s', r}
p(s', r \mid s, a)
\left[
r + \gamma v_\pi(s')
\right]
$$

然后选择使 $q_\pi(s,a)$ 最大的动作：

$$
\pi'(s)
=
\arg\max_a q_\pi(s,a)
$$

如果新策略 $\pi'$ 在每个状态下都选择更高价值的动作，那么它通常不会比原策略更差。

这就是 policy improvement 的基本思想。

## Policy Iteration

Policy Iteration 把 policy evaluation 和 policy improvement 交替进行。

流程可以写成：

```text
初始化策略 π
重复：
  1. Policy Evaluation：计算当前策略 π 的价值函数
  2. Policy Improvement：根据价值函数更新策略
直到策略不再变化
```

更紧凑地写：

```text
π_0 -> v_{π_0} -> π_1 -> v_{π_1} -> π_2 -> ...
```

它的含义是：

- 先评估当前策略到底有多好；
- 再根据评估结果改进策略；
- 重复这个过程，直到得到稳定策略。

当策略不再变化时，通常就达到了最优策略。

## Value Iteration

Value Iteration 不再完整评估某个策略，而是直接使用 Bellman optimality update 逼近最优价值函数。

更新形式是：

$$
V_{k+1}(s)
=
\max_a
\sum_{s', r}
p(s', r \mid s, a)
\left[
r + \gamma V_k(s')
\right]
$$

它把策略改进嵌入到价值更新中。

也就是说，每次更新状态价值时，都直接假设当前会选择最优动作。

当 $V_k$ 收敛后，可以通过 greedy policy 得到策略：

$$
\pi(s)
=
\arg\max_a
\sum_{s', r}
p(s', r \mid s, a)
\left[
r + \gamma V(s')
\right]
$$

## Policy Iteration 与 Value Iteration 的区别

Policy Iteration 更明确地区分两个阶段：

- 先把当前策略评估清楚；
- 再用评估结果改进策略。

Value Iteration 则把这两件事合在一起：

- 每次价值更新都直接使用最优动作；
- 不必完整评估某个中间策略。

可以粗略理解为：

- Policy Iteration：评估完整一些，改进次数可能少。
- Value Iteration：每步更便宜，但可能需要更多轮更新。

二者都依赖 Bellman 方程，也都要求环境模型可用。

## 与采样式强化学习方法的区别

Dynamic Programming 假设环境模型已知，可以直接计算期望。

Monte Carlo、Temporal-Difference、Q-Learning 等方法通常面对的是模型未知场景，只能通过实际经验样本更新估计。

因此：

- Dynamic Programming 是 model-based planning。
- Monte Carlo 和 TD 更偏向从 experience 中学习。
- Q-Learning 可以看作在不知道完整模型时，用采样更新逼近 Bellman optimality equation。

## 局限

动态规划方法虽然概念清晰，但现实中有明显限制：

- 需要已知完整环境模型。
- 状态空间和动作空间太大时，逐状态更新成本很高。
- 连续状态或连续动作问题通常不能直接枚举。
- 在复杂真实环境中，准确的转移概率和奖励模型往往很难获得。

因此，动态规划更常作为强化学习理论基础和小规模 MDP 求解方法，而不是直接用于大规模现实任务。

## 与相关节点的关系

- `Reinforcement Learning` 是 Dynamic Programming 所属的方法框架。
- `Markov Decision Process` 提供动态规划要求解的问题形式。
- `Bellman Equation` 是动态规划更新价值函数的核心方程。
- `Monte Carlo Methods` 与 Dynamic Programming 并列，但它通过 episode 样本学习，不要求完整环境模型。
- `Policy` 是 policy evaluation 和 policy improvement 的对象。
- `Value Function` 是动态规划反复更新的核心量。
- `Q-Learning` 可以看作在未知模型下对 Bellman optimality equation 的采样式逼近。

## 待整理

- Policy Evaluation：给定策略时计算价值函数。
- Policy Improvement：根据价值函数改进策略。
- Policy Iteration：交替评估和改进策略。
- Value Iteration：直接逼近最优价值函数。
- Model-Based Planning：基于环境模型进行规划。
- Generalized Policy Iteration：策略评估和策略改进交互推进的框架。
