
/**
 * 编写递归版sum
 * 首先
 * 递归首先找到基础条件
 * 递归条件
 * 基础条件就是数组长度为0的时候 返回0
 * 递归条件就是数组长度不为0的时候 取出index为0的项
 * @param {Array} arr 
 */
function sum(arr) {
    let len = arr.length
    if (len === 0) return 0
    let item = arr.shift()
    return item + sum(arr)
}

let sumNum = sum([1, 2, 3, 4])
console.log("🚀 ~ sumNum:", sumNum)

/**
 * 计算数组长度
 * @param {Array} arr 
 */
function calculateArrLen(arr) {
    if (arr.length === 0) return 0
    arr.shift()
    return 1 + calculateArrLen(arr)
}

let len = calculateArrLen([2, 3, 5, 3, 1, 2, 46, 2, 1])
console.log("🚀 ~ len:", len)


/**
 * 写递归之前需要想好 结束条件
 * 基础条件就是左指针大于右指针就是结束的时候
 * 递归条件就是没有找到目标元素
 * @param {Array} sortedArr 排序后的数组
 * @param {number} target 目标
 * @param {number} left 左边界
 * @param {number} right 右边界
 */
function binarySearchRecursive(sortedArr, target, left, right) {
    if (left > right) return -1
    let middle = (left + right) >> 1
    let middleItem = sortedArr[middle]
    if (target === middleItem) {
        return middle
    }
    if (target < middleItem) {
        return binarySearchRecursive(sortedArr, target, left, middle - 1)
    }
    return binarySearchRecursive(sortedArr, target,middle + 1, right)
} 
let test = [1, 3, 5, 7, 9, 11, 13, 15, 16, 19, 20, 21]
let targetIndex = binarySearchRecursive(test, 66, 0, test.length)
console.log("🚀 ~ targetIndex:", targetIndex)
