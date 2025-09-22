export function isObject(value) {
    let type = typeof value
    return value != null && ['object', 'function'].includes(type)
}

