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
