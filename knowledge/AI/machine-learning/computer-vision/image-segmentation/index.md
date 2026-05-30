# Image Segmentation

## 核心理解

Image segmentation 讨论的是：如何对图像中的每个像素或区域进行类别判断。

它和图像分类不同，不只关心图像里有什么，还关心目标具体在哪里，以及目标边界如何被划分。

因此，图像分割通常需要模型同时具备两种能力：

- 理解图像中的语义内容。
- 保留足够精细的空间位置信息。

## 主要方向

- Semantic Segmentation：为每个像素预测语义类别，不区分同类中的不同实例。
- Instance Segmentation：不仅预测像素类别，还区分同一类别下的不同目标实例。
- Medical Image Segmentation：面向医学图像中的器官、病灶或组织结构分割。

## 子节点

- [U-Net](u-net/index.md)

## 待整理

- Semantic Segmentation：每个像素预测语义类别。
- Instance Segmentation：区分同类别的不同实例。
- Mask：分割任务中的像素级目标区域。
