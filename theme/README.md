# theme

一个样式包
为了实践 ITCSS

> <https://developer.helpscout.com/>
> <https://developer.helpscout.com/>
> <https://github.com/coding-blocks/motley/tree/master>
> <https://github.com/ahmadajmi/awesome-itcss>

ITCSS

- Setting 层
  > variable configurations for likes colors，fonts,sizes,etc...
- Tools 层
  > Globally used mixins and functions(less sass)
- Generic 层
  > Css resets and normalizing rules to create a foundation for your styles
- Elements
  > Style rules for bare HTML elements(likes h1 or button)
- Objects
  > Style rules for elements responsible for layout or structuring(n. 结构化 v.组织 建造)
- Components
  > Style rule for UI components
- Trumps
  > Helper or utility rules that tweak objects or components by adjusting and override existing rules

Settings：项目使用的全局变量，比如颜色，字体大小等等。
Tools：项目使用的 mixins 和 functions。到 Tools 为止，不会生成具体的 CSS 代码。
Generic：最基本的设定，比如 reset.css、normalize.css 等。
Base：最基础的元素（elements），比如 img、p、link、list 等。
Objects：某种设计模式，比如水平居中，
Components：UI 组件，比如 button、switch、slider 等。
Trumps：用于辅助和微调的样式，只有这一层才可以使用 !important。

类名符合bem的规范
