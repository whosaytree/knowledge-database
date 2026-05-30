# Temporal-Difference Learning

## 核心理解

Temporal-Difference Learning，简称 TD Learning，时序差分学习，是强化学习中一种从经验中估计价值函数的方法。

它结合了 Monte Carlo Methods 和 Dynamic Programming 的思想：

- 像 Monte Carlo Methods 一样，TD 不需要已知环境模型，可以直接从实际经验中学习。
- 像 Dynamic Programming 一样，TD 使用已有价值估计来构造更新目标，也就是 bootstrap。

TD Learning 的核心思想是：不必等到一个 episode 完整结束，而是在每一步交互后，就用“即时奖励 + 下一状态价值估计”来更新当前状态价值。

## TD Target

在状态价值估计中，TD 使用的目标通常是：

$$
R_{t+1} + \gamma V(S_{t+1})
$$

这个量叫 TD target。

它由两部分组成：

- $R_{t+1}$：下一步实际收到的奖励。
- $\gamma V(S_{t+1})$：对下一状态未来价值的估计。

因此，TD target 不是完整真实 return，而是一个一步奖励加上 bootstrap 估计的目标。

## TD Error

当前状态价值估计为：

$$
V(S_t)
$$

TD target 为：

$$
R_{t+1} + \gamma V(S_{t+1})
$$

两者的差就是 TD error：

$$
\delta_t
=
R_{t+1}
+
\gamma V(S_{t+1})
-
V(S_t)
$$

TD error 衡量的是：当前价值估计和“一步之后看起来应该是多少”之间的差距。

如果 $\delta_t$ 为正，说明当前状态价值可能被低估了。

如果 $\delta_t$ 为负，说明当前状态价值可能被高估了。

## TD(0) 更新

最基础的 TD 方法是 TD(0)。

它的状态价值更新形式是：

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

也可以写成：

$$
V(S_t)
\leftarrow
V(S_t)
+
\alpha \delta_t
$$

其中：

- $\alpha$ 是学习率。
- $\delta_t$ 是 TD error。

这个更新的含义是：把当前状态价值朝 TD target 的方向移动一小步。

## 与 Monte Carlo Methods 的区别

Monte Carlo Methods 使用完整 return：

$$
G_t
$$

来更新价值估计。

TD Learning 使用一步 bootstrap target：

$$
R_{t+1} + \gamma V(S_{t+1})
$$

来更新价值估计。

因此：

- Monte Carlo 必须等 episode 结束后才能计算目标。
- TD 可以在每一步交互后立即更新。
- Monte Carlo target 更接近实际完整回报，但方差可能较大。
- TD target 使用估计值，方差较小，但会引入 bootstrap bias。

## 与 Dynamic Programming 的区别

Dynamic Programming 使用完整环境模型计算期望：

$$
\sum_{s', r}
p(s', r \mid s, a)
\left[
r + \gamma V(s')
\right]
$$

TD Learning 不知道完整转移模型，只使用实际采样到的一步转移：

$$
S_t, A_t, R_{t+1}, S_{t+1}
$$

因此：

- Dynamic Programming 依赖模型。
- TD Learning 不依赖模型。
- Dynamic Programming 对所有可能后继状态求期望。
- TD Learning 用一次实际转移样本近似这个期望。

## Bootstrap 的含义

Bootstrap 指的是：用已有估计的一部分来更新另一个估计。

在 TD Learning 中，$V(S_{t+1})$ 本身也是一个估计值，但它被用来构造 $V(S_t)$ 的更新目标。

这和 Monte Carlo 很不一样。

Monte Carlo 的 target 是完整 episode 中实际观察到的 return，不依赖当前价值函数的下一状态估计。

TD 的 target 则依赖当前价值函数，所以它是 bootstrap 方法。

## 为什么 TD 可以在线学习

TD Learning 不需要等待 episode 结束。

只要发生一次状态转移：

```text
S_t -> R_{t+1} -> S_{t+1}
```

就可以立即更新 $V(S_t)$。

这使得 TD 适合：

- 很长的 episode；
- continuing tasks；
- 在线交互环境；
- 需要边收集经验边更新的场景。

## TD Learning 与 Control

TD Learning 不只可以做状态价值预测，也可以用于 control。

如果学习动作价值函数 $Q(s,a)$，TD 思想可以得到很多经典控制算法，例如：

- SARSA：on-policy TD control。
- Q-Learning：off-policy TD control。
- Expected SARSA：使用期望形式的下一动作价值。

这些方法的共同点是：它们都用一步奖励和下一状态或下一动作的价值估计构造更新目标。

## 优点

- 不需要环境模型。
- 不需要等 episode 结束，可以在线更新。
- 相比 Monte Carlo，通常方差更低。
- 是 SARSA、Q-Learning、DQN 等方法的基础。

## 局限

- 因为使用 bootstrap，会引入估计偏差。
- 如果价值估计本身很差，TD target 也会被影响。
- 在函数逼近、off-policy 和 bootstrapping 同时存在时，训练可能不稳定。
- 对学习率、探索策略和状态表示比较敏感。

## 与相关节点的关系

- `Reinforcement Learning` 提供 TD Learning 所属的交互式学习框架。
- `Bellman Equation` 提供 TD target 背后的价值递推结构。
- `Monte Carlo Methods` 使用完整 return，而 TD 使用 bootstrap target。
- `Dynamic Programming` 使用已知模型求期望，而 TD 使用实际一步转移样本。
- `Q-Learning` 是基于 TD 思想的 off-policy control 方法。
- `SARSA` 是基于 TD 思想的 on-policy control 方法。

## 待整理

- TD(0)：最基础的一步 TD 更新。
- TD Error：TD target 与当前估计之间的差。
- SARSA：on-policy TD control。
- Q-Learning：off-policy TD control。
- Expected SARSA：对下一动作价值取期望的 TD control。
- n-step TD：介于一步 TD 和 Monte Carlo 之间的方法。
- TD($\lambda$)：用 eligibility trace 混合多步 return 的方法。
