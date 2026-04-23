# Knowledge Visualizer

这个目录是知识库的独立可视化层。

## 设计原则

- 只读取项目中的真实知识文件，不维护第二份内容。
- 所有可视化代码都放在 `visualizer/` 内，和主知识库解耦。
- 页面内容来自 `knowledge/**/index.md` 与目录层级。

## 启动方式

```bash
node visualizer/server.mjs
```

默认地址：

```text
http://localhost:4173
```

## 当前能力

- 自动读取 `knowledge/` 下的节点目录
- 左侧树导航实时反映当前层级
- 点击节点后展示对应 `index.md`
- 自动显示父节点、子节点、路径和来源文件

## 有意不做的事情

- 不写入知识文件
- 不要求修改现有目录规范
- 不依赖额外前端框架或第三方包
