import { isObject } from './baseUntil'
/**
 * creates a debounced function that delays invoking func until after `wait` milliseconds have elapsed since the last time the 
 * debounced function was invoked.
 * until after 直到...之后
 * 创建一个去抖动的函数 这个函数会延迟调用直到最后一次调用debounced函数之后已经过了等待时间
 * @param {Function} callback The function to debounce
 * @param {Number} wait The number of milliseconds to delay
 * @param {Object} [options={}] The options Object
 * @param {Boolean} [options.leading = false] 
 * specify invoking on the leading edge of the timeout
 * @param {Number} [options.maxWait]
 * The maximum time is allowed to be delayed before it's invoked
 * @param {boolean} [options.trailing=true]
 * Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 */
export function debounce(callback, wait = 500, options) {
    let lastArgs,
        lastThis,
        maxWait,
        result,
        timerId,
        lastCallTime,
        lastInvokeTime = 0,
        leading = false,
        maxing = false,
        trailing = true
    if (typeof callback != 'function') {
        throw new TypeError("callback is not a function")
    }
    if (isObject(options)) {
        leading = !!options.leading
        maxing = 'maxWait' in options
        maxWait = maxing ? Math.max(options.maxWait, wait) : maxWait
        trailing = 'trailing' in options ? !!options.trailing : trailing
    }

    function invokeCallback(time) {
        let args = lastArgs,
            thisArg = lastThis
        lastArgs = lastThis = undefined
        lastInvokeTime = time
        console.log(lastCallTime)
        result = callback.apply(thisArg, args)
        return result
    }

    function leadingEdge(time) {
        lastInvokeTime = time
        timerId = setTimeout(timerExpired, wait);
        return leading ? invokeCallback(time) : result
    }

    function remainingWait(time) {
        let timeSinceLastCall = time - lastCallTime
        let timeSinceLastInvoke = time - lastInvokeTime
        let timeWaiting = wait - timeSinceLastCall
        return maxing ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting
    }

    function shouldInvoke(time) {
        let timeSinceLastCall = time - lastCallTime
        let timeSinceLastInvoke = time - lastInvokeTime
        return lastCallTime === undefined || timeSinceLastCall >= wait || timeSinceLastCall < 0 || (maxing && timeSinceLastInvoke >= maxWait)
    }

    function timerExpired() {
        let time = Date.now();
        if (shouldInvoke(time)) {
            return trailingEdge(time);
        }
        console.log(time, lastCallTime)
        // Restart the timer.
        timerId = setTimeout(timerExpired, remainingWait(time));
    }

    function trailingEdge(time) {
        timerId = undefined
        if (trailing && lastArgs) {
            return invokeCallback(time)
        }
        lastArgs = lastThis = undefined;
        return result
    }

    function cancel() {
        if (timerId !== undefined) {
            clearTimeout(timerId);
        }
        lastInvokeTime = 0;
        lastArgs = lastCallTime = lastThis = timerId = undefined;
    }

    function flush() {
        return timerId === undefined ? result : trailingEdge(Date.now());
    }

    function debounced() {
        let time = Date.now()
        let isInvoking = shouldInvoke(time)
        lastArgs = arguments
        lastThis = this
        lastCallTime = time
        if (isInvoking) {
            // isInvoking 4种情况为true
            /**
             * 1. lastCallTime 为 undefined 表示用户第一次调用
             * 2. timeSinceLastCall 大于 wait 上一次调用的时间已经超过了wait
             * 3. timeSinceLastCall 小于0 waring 表示用户的系统时间回调了
             * 4. maxWait 存在 maxWait timeSincelastInvoke 已超过最大等待时间
             */
            if (timerId === undefined) {
                return leadingEdge(time)
            }

            if (maxing) {
                clearTimeout(timerId)
                timerId = setTimeout(timerExpired, wait)
                return invokeCallback(lastCallTime)
            }
        }

        if (timerId === undefined) {
            timerId = setTimeout(timerExpired, wait);
        }
        return result
    }
    debounced.cancel = cancel
    debounced.flush = flush
    return debounced
}