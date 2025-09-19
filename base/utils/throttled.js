export function throttled(callback, wait = 500) {
    let previous = 0
    let timer = null
    const throttled = function () {
        const now = Date.now()
        const context = this
        const args = arguments
        const remaining = wait - (now - previous)
        if (remaining <= 0) {
            if (timer) {
                clearTimeout(timer)
                timer = null
            }
            callback.apply(context, args)
            previous = now
        } else if (!timer) {
            timer = setTimeout(() => {
                previous = Date.now()
                callback.apply(context, args)
                timer = null
            }, remaining);
        }
    }
    // 取消定时器
    throttled.prototype.cancel = function () {
        clearTimeout(timer)
        timer = null
        previous = 0
    }
    return throttled
}


export function debounce(callback, wait = 500) {

}
