# how to realize an image components

<https://pan.quark.cn/s/8db691a6965e#/list/share>

## 兼容Object-fit属性

- fill 填充(default): 替换内容拉伸填满整个content-box，不保证保持原有的比例。
- contain:包含(undefault): 保持原有尺寸，保证替换内容一定可以在容器里面放的下。
- cover: 覆盖:保持原有比例。保证替换内容尺寸一定大于容器尺寸，宽度和高度一定有一个和容器一致。
- none: 无: 保持原有尺寸比例，同时保持替换内容原始尺寸大小
- scale-down: 降低。就好像依次设置了none和contain，最终呈现的是尺寸比较小的那个

> The `object-fit` CSS property specifies how the contents of a replaced element should be fitted to the box established by its used height and width
> CSS属性 `object-fit`指定替换元素的内容该如何适应由其使用的高度和宽度所建立的盒子
> established established
>
> The `object-position`property determines the alignment of the repaced element inside its box
>`Object-position`determines(确定)替换元素在盒子内的对齐方式

### what is replaced element

其内容不受css视觉格式化模型控制的元素

典型可替换元素有

- iframe
- video
- embed
- img
  
特定情况可视为可替换元素
[object-fit polyfill]<https://github.com/anselmh/object-fit>

- option
- audio
- canvas
- object
- input 在展示图片的img

如何利用样式实现 cover的效果?

$$
设imageAspectRatio为T_i，设containerAspectRatio为T_c \newline
cover的需要的效果是保持原比例，但不保证完整显示 \newline
所以我们可以知道width相同时 height也要一定大于height_c \newline
已知T_i = \frac{width_i}{height_i} T_c= \frac{width_c}{height_c} \newline
当T_i > T_c时 \frac{width_i}{height_i} > \frac{width_c}{height_c} \newline
但 width_i = width_c所以height_i < height_c 不符合完整显示的条件 \newline
但 height_i = height_c所以 width_i > width_c 符合条件 \newline
当 T_i < T_c 时 \frac{width_i}{height_i} < \frac{width_c}{height_c} \newline
但  width_i = width_c所以height_i > height_c 符合条件 \newline
但 height_i = height_c所以 width_i < width_c 不符合条件 \newline
结论为 T_i > T_c 时 height： 100  width： auto； T_i < T_c 时 width 100 height auto
$$

$$
\documentclass{article}
\usepackage[utf8]{inputenc}
\usepackage{amsmath}
\usepackage{amssymb}
\usepackage{geometry}

\geometry{a4paper, margin=1in}

\title{图像适应性布局的数学分析}
\author{分析与推导}
\date{\today}

\begin{document}

\maketitle

\section{引言}

本分析旨在探究 CSS 属性 \texttt{object-fit: cover} 的工作原理，通过数学推导来确定在不同宽高比条件下，图像应如何进行缩放以完全覆盖其容器。

\subsection{符号定义}
我们首先定义本分析中使用的符号：
\begin{itemize}
    \item $W_i, H_i$：图像的原始宽度和高度。
    \item $W_c, H_c$：容器的宽度和高度。
    \item $T_i = \frac{W_i}{H_i}$：图像的原始宽高比（Image Aspect Ratio）。
    \item $T_c = \frac{W_c}{H_c}$：容器的宽高比（Container Aspect Ratio）。
\end{itemize}

\subsection{核心原则}
\texttt{object-fit: cover} 必须满足以下两个核心条件：
\begin{enumerate}
    \item \textbf{保持比例}：图像缩放后，其宽高比必须保持不变，即 $\frac{W_{new}}{H_{new}} = T_i$。
    \item \textbf{完全覆盖}：图像的尺寸必须能完全覆盖容器，即 $W_{new} \ge W_c$ 且 $H_{new} \ge H_c$。
\end{enumerate}

\section{推导过程}

我们的目标是找到满足上述条件的最小缩放尺寸，这取决于 $T_i$ 与 $T_c$ 的大小关系。

\subsection{情况一：$T_i > T_c$}
当图像比容器更宽（更“扁”）时，即 $\frac{W_i}{H_i} > \frac{W_c}{H_c}$。
\begin{itemize}
    \item 如果按容器的宽度缩放 ($W_{new} = W_c$)，则新的高度为 $H_{new} = \frac{W_c}{T_i}$。
    由于 $T_i > T_c$，可得 $\frac{1}{T_i} < \frac{1}{T_c}$，因此 $H_{new} = \frac{W_c}{T_i} < \frac{W_c}{T_c} = H_c$。
    此方案导致图像高度小于容器高度，不满足完全覆盖条件。

    \item 如果按容器的高度缩放 ($H_{new} = H_c$)，则新的宽度为 $W_{new} = T_i \cdot H_c$。
    由于 $T_i > T_c$，可得 $W_{new} = T_i \cdot H_c > T_c \cdot H_c = W_c$。
    此方案导致图像宽度大于容器宽度，满足完全覆盖条件。
\end{itemize}
\textbf{结论：} 当 $T_i > T_c$ 时，应以容器高度为基准进行缩放。在 CSS 中对应于 \texttt{height: 100\%; width: auto;}。

\subsection{情况二：$T_i \le T_c$}
当图像比容器更高（更“窄”）或比例相同时，即 $\frac{W_i}{H_i} \le \frac{W_c}{H_c}$。
\begin{itemize}
    \item 如果按容器的高度缩放 ($H_{new} = H_c$)，则新的宽度为 $W_{new} = T_i \cdot H_c$。
    由于 $T_i \le T_c$，可得 $W_{new} = T_i \cdot H_c \le T_c \cdot H_c = W_c$。
    此方案导致图像宽度小于或等于容器宽度，不满足完全覆盖条件。

    \item 如果按容器的宽度缩放 ($W_{new} = W_c$)，则新的高度为 $H_{new} = \frac{W_c}{T_i}$。
    由于 $T_i \le T_c$，可得 $\frac{1}{T_i} \ge \frac{1}{T_c}$，因此 $H_{new} = \frac{W_c}{T_i} \ge \frac{W_c}{T_c} = H_c$。
    此方案导致图像高度大于或等于容器高度，满足完全覆盖条件。
\end{itemize}
\textbf{结论：} 当 $T_i \le T_c$ 时，应以容器宽度为基准进行缩放。在 CSS 中对应于 \texttt{width: 100\%; height: auto;}。

\end{document}
$$

$$
\text{设图像宽高比为 } T_i, \text{设容器宽高比为 } T_c \\
\text{“cover” 的效果是保持原比例，并完全填充容器。} \\
\text{这意味着图像的宽和高至少有一个要大于或等于容器的相应尺寸。} \\
\text{已知 } T_i = \frac{W_i}{H_i} \text{ 且 } T_c = \frac{W_c}{H_c} \\
\begin{aligned}
& \text{当 } T_i > T_c \text{ 时，} \frac{W_i}{H_i} > \frac{W_c}{H_c} \\
& \text{若按宽度缩放，新高度 } H = \frac{W_c}{T_i} < \frac{W_c}{T_c} = H_c, \text{ 不符合完全填充。} \\
& \text{因此必须按高度缩放，新宽度 } W = T_i \cdot H_c > T_c \cdot H_c = W_c, \text{ 满足条件。} \\
& \text{结论：} T_i > T_c \text{ 时，CSS 为 } \text{height: 100\%; width: auto;} \\
& \\
& \text{当 } T_i \le T_c \text{ 时，} \frac{W_i}{H_i} \le \frac{W_c}{H_c} \\
& \text{若按高度缩放，新宽度 } W = T_i \cdot H_c \le T_c \cdot H_c = W_c, \text{ 不符合完全填充。} \\
& \text{因此必须按宽度缩放，新高度 } H = \frac{W_c}{T_i} \ge \frac{W_c}{T_c} = H_c, \text{ 满足条件。} \\
& \text{结论：} T_i \le T_c \text{ 时，CSS 为 } \text{width: 100\%; height: auto;}
\end{aligned}
$$

如何利用样式实现contain

$$
\text{设图片宽高比为} T_i, \text{设容器宽高比} T_c \\
\text{"contain"的效果是保持原比例，所有内容都需要显示。} \\
\text{这意味着图像的宽和高只能等于或小于容器的相应尺寸。} \\
\text{已知 } T_i = \frac{W_i}{H_i} \text{ 且 } T_c = \frac{W_c}{H_c} \\
\begin{aligned}
& \text{当} T_i > T_c \text{时，} \frac{W_i}{H_i} > \frac{W_c}{H_c} \\
& \text{若按宽度缩放， 新高度} H = \frac{W_c}{T_i} < H_c(\frac{W_c}{T_c}), \text{符合条件。} \\
& \text{若按高度缩放， 新宽度} W = H_c \cdot T_i >  H_c \cdot T_c = W_c \text{不符合条件。} \\
& \text{结论：} T_i > T_c \text{ 时，CSS 为 } \text{height: auto; width: 100\%;} \\
& \\
& \text{当 } T_i \le T_c \text{ 时，} \frac{W_i}{H_i} \le \frac{W_c}{H_c} \\
& \text{若按高度缩放，新宽度 } W = T_i \cdot H_c \le T_c \cdot H_c = W_c, \text{ 符合条件。} \\
& \text{因此必须按宽度缩放，新高度 } H = \frac{W_c}{T_i} \ge \frac{W_c}{T_c} = H_c, \text{ 不符合条件。} \\
& \text{结论：} T_i \le T_c \text{ 时，CSS 为 } \text{width: auto; height: 100\%;}
\end{aligned}
$$

### 实现公共方法

[英语](https://www.languagegrowth.com/zh-CN)

#### throttled

creates a throttled function that only invokes func at most once pre every wait milliseconds
创建一个受限的函数，这个函数在等待毫秒中最多只能调用一次


#### debounce

