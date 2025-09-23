const topPlayer = [window, document, document.documentElement, null, undefined]

export function isInContainer(el, container) {
    if (!el || !container) return false
    const elRect = el.getBoundingClientRect()
    let containerRect = {}
    if (topPlayer.includes(container)) {
        containerRect = {
            top: 0,
            right: window.innerWidth,
            bottom: window.innerHeight,
            left: 0,
        }
    } else {
        containerRect = container.getBoundingClientRect()
    }
    // top left 是dom的左上点 bottom 和 right 是盒子的右下点
    // 所以完全出现在滚动的容器中要满足几个条件
    // el bottom 要小于这个bottom
    // el right 要小于 right
    // top 和 left 都要大于等于
    // 这是容器是否完全在父元素内
    // return elRect.top >= containerRect.top && el.left >= containerRect.left && el.bottom <= containerRect.bottom && el.right <= containerRect.bottom
    return elRect.top < containerRect.bottom && el.bottom > containerRect.top && el.left < containerRect.right && el.right > containerRect.left
}