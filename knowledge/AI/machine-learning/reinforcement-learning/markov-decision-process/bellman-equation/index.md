# Bellman Equation

## 核心理解

Bellman Equation，贝尔曼方程，是强化学习中描述“当前价值”和“下一步价值”之间递推关系的方程。

它的核心思想是：一个状态的长期价值，可以拆成两部分：

- 当前一步能得到的即时奖励；
- 下一状态之后还能获得的未来价值。

因此，贝尔曼方程把“长期累计回报”写成了一个可以递归计算的结构。

这正是强化学习能够用动态规划、时序差分学习、Q-Learning 等方法求解价值函数的基础。

## 从 Return 出发

在 MDP 中，从时间步 $t$ 开始的 return 通常写成：

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
$$

也可以写成递推形式：

$$
G_t
=
R_{t+1}
+
\gamma G_{t+1}
$$

这个式子是理解 Bellman Equation 的关键。

它说明：从现在开始的总回报，等于下一步奖励，加上折扣后的未来总回报。

## 状态价值函数

在给定策略 $\pi$ 的情况下，状态价值函数定义为：

$$
v_\pi(s)
=
\mathbb{E}_\pi[G_t \mid S_t = s]
$$

它表示：如果当前处于状态 $s$，并且之后一直按照策略 $\pi$ 行动，那么未来期望回报是多少。

将 return 的递推形式代入，就得到状态价值的 Bellman equation：

$$
v_\pi(s)
=
\mathbb{E}_\pi
\left[
R_{t+1}
+
\gamma v_\pi(S_{t+1})
\mid
S_t = s
\right]
$$

这个式子的含义是：

- 当前状态 $s$ 的价值；
- 等于在策略 $\pi$ 下采取动作后；
- 得到的即时奖励；
- 加上下一状态价值的折扣期望。

## 展开成转移概率形式

如果显式写出动作选择概率和状态转移概率，可以写成：

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

其中：

- $\pi(a \mid s)$ 表示策略在状态 $s$ 下选择动作 $a$ 的概率。
- $p(s', r \mid s, a)$ 表示在状态 $s$ 执行动作 $a$ 后，转移到 $s'$ 并获得奖励 $r$ 的概率。
- $r + \gamma v_\pi(s')$ 是“一步奖励 + 下一状态价值”。

这个形式清楚地展示了：状态价值是对所有可能动作、下一个状态和奖励的加权平均。

## 动作价值函数

动作价值函数定义为：

$$
q_\pi(s,a)
=
\mathbb{E}_\pi[G_t \mid S_t = s, A_t = a]
$$

它表示：如果当前处于状态 $s$，先执行动作 $a$，之后再按策略 $\pi$ 行动，未来期望回报是多少。

对应的 Bellman equation 是：

$$
q_\pi(s,a)
=
\mathbb{E}_\pi
\left[
R_{t+1}
+
\gamma q_\pi(S_{t+1}, A_{t+1})
\mid
S_t = s, A_t = a
\right]
$$

也可以展开为：

$$
q_\pi(s,a)
=
\sum_{s', r}
p(s', r \mid s, a)
\left[
r
+
\gamma
\sum_{a'} \pi(a' \mid s') q_\pi(s', a')
\right]
$$

这个式子说明：动作价值不仅取决于当前动作带来的结果，还取决于下一状态中策略会如何继续选择动作。

## Bellman Optimality Equation

前面的 Bellman equation 是在给定策略 $\pi$ 时评估该策略的价值。

如果目标是寻找最优策略，就需要写成最优形式。

最优状态价值函数满足：

$$
v_*(s)
=
\max_a
\sum_{s', r}
p(s', r \mid s, a)
\left[
r + \gamma v_*(s')
\right]
$$

最优动作价值函数满足：

$$
q_*(s,a)
=
\sum_{s', r}
p(s', r \mid s, a)
\left[
r
+
\gamma \max_{a'} q_*(s', a')
\right]
$$

这里的 $\max$ 表示：在每个状态中，总是选择能带来最大长期价值的动作。

这也是很多强化学习算法的核心目标：估计或逼近这些最优价值函数。

## 直觉理解

Bellman Equation 可以理解为一个“局部一致性条件”。

如果一个价值函数是正确的，那么它对当前状态的估计，应该和“一步真实反馈 + 下一状态价值估计”保持一致。

也就是说，价值估计不能只看当前，也不能凭空给出一个分数，而必须满足：

$$
\text{当前价值}
=
\text{即时奖励}
+
\text{折扣后的未来价值}
$$

强化学习中的很多更新方法，本质上都是在让价值函数逐渐满足这种一致性。

## 与动态规划的关系

如果 MDP 的转移概率和奖励函数已知，那么 Bellman Equation 可以直接用于动态规划。

常见方法包括：

- Policy Evaluation：用 Bellman equation 计算某个策略的价值。
- Policy Improvement：根据价值函数改进策略。
- Value Iteration：反复应用 Bellman optimality update，逼近最优价值。
- Policy Iteration：交替进行策略评估和策略改进。

因此，在已知环境模型时，Bellman Equation 是直接求解 MDP 的基础。

## 与时序差分学习的关系

在很多真实强化学习问题中，转移概率 $p(s', r \mid s, a)$ 是未知的。

这时无法直接对所有可能转移求和，但 agent 可以通过实际经验样本进行更新。

例如，状态价值的 TD 更新形式可以写成：

$$
V(S_t)
\leftarrow
V(S_t)
+
\alpha
\left[
R_{t+1}
+
\gamma V(S_{t+1})
-
V(S_t)
\right]
$$

其中：

$$
R_{t+1}
+
\gamma V(S_{t+1})
$$

是 Bellman target，而：

$$
R_{t+1}
+
\gamma V(S_{t+1})
-
V(S_t)
$$

是 TD error。

这说明时序差分学习是在用采样方式逼近 Bellman Equation。

## 与相关节点的关系

- `Markov Decision Process` 提供 Bellman Equation 所依赖的状态、动作、转移、奖励和折扣因子。
- `Value Function` 是 Bellman Equation 描述和约束的对象。
- `Policy` 决定 Bellman expectation equation 中动作的加权方式。
- `Dynamic Programming` 在已知环境模型时直接使用 Bellman Equation。
- `Q-Learning` 可以看作基于 Bellman optimality equation 的采样式更新方法。

## 待整理

- Value Function：状态价值和动作价值。
- Bellman Expectation Equation：给定策略下的贝尔曼方程。
- Bellman Optimality Equation：最优价值函数满足的贝尔曼方程。
- TD Error：当前估计与 Bellman target 的差。
- Value Iteration：反复应用 Bellman optimality update。
- Policy Iteration：策略评估与策略改进交替进行。
