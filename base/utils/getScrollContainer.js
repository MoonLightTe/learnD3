const topPlayer = [window, document, document.documentElement]
const SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
const MOZ_HACK_REGEXP = /^moz([A-Z])/;


function camelCase(name) {
    return name
        .replace(SPECIAL_CHARS_REGEXP, function (_, _separator, letter, offset) {
            return offset ? letter.toUpperCase() : letter;
        })
        .replace(MOZ_HACK_REGEXP, 'Moz$1');
}

function kebabCase(name) {
    return name.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[\s_]+/g, '-').toLowerCase()
}

function getStyle(el, styleName) {
    if (!el || !styleName) return null
    styleName = camelCase(styleName)
    if (styleName === 'float') styleName = 'cssFloat'
    try {
        const computed = document.defaultView.getComputedStyle(el, '')
        return el.style[styleName] || computed ? computed[styleName] : null;
    } catch (error) {
        return el.style[styleName];
    }
}
function isScroll(el, vertical) {
    const determinedDirection = vertical !== null && vertical !== undefined
    const overflow = determinedDirection ? (vertical ? getStyle(el, 'overflow-y') : getStyle(el, 'overflow-x')) : getStyle(el, 'overflow')
    return overflow.match(/(scroll|auto|overlay)/)
}

export function getScrollContainer(el, vertical) {
    let parent = el
    while (parent) {
        if (topPlayer.includes(parent)) {
            return window
        }
        if (isScroll(parent, vertical)) {
            return parent
        }
        parent = parent.parentNode
    }
    return parent
}

