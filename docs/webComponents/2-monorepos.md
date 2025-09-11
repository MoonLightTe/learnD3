# monorepos

- 单一数据库
统一便捷性：所有相关的 package 包都会放在一个 repo 仓库里面。减少了下载不同 repo 的代码的繁琐工作，相关代码清晰明了集合在一起。
依赖关系集中化：因为代码都会集合到一个仓库里面，相互之间的依赖关系更好的维护管理，寻找依赖也比较方便。
代码标准一致性：可以采用统一的一套代码风格 lint 标准、Git commit 标准来约束所有 package 的代码风格，做到一致统一。
统一的 CI/CD 流程：可以采用一套 CI/CD 流程来统一部署或者发版，减少了人为控制的不定因素，更加稳定可靠。

## BEM

BEM 是一种书写 CSS 的规范，是由 Yandex 团队提出的一种前端 CSS 命名方法论。其目的是为了明确 CSS 作用域，确定相关 CSS 优先级，分离状态选择器和结构选择器。

B - block：表示一个块元素，比如一个 Modal 弹窗组件、一个 Button 组件，都可以用一个块来表示。

E - element：表示一个子元素，存在于块元素之内，例如 弹窗组件的title、footer。

M - modifier： 表示修饰符或者状态，例如 Button 组件的选中态、销毁态。

Block - B 的块元素会直接表示：.block。

Element - E 的子元素类型会由双下划"__"线表示，并且嵌套进 block 元素后：.block__element。

Modifier - M 的修饰符则会由中划线表示"-", 并嵌套在 块元素，或者子元素之后：.block-modifier 或.block__element-modifier。
