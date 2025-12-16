

/**
 * binary search
 * input：一个有序数组 和需要查找的内容
 * output: 找到的元素 没找到返回null
 * ？ 有什么用呢 除了查找数字
 * @param {Array} orderedArr  有序number数组
 * @param {number} item 查找的元素
 * @retrun {number} number或者null
 */
function binarySearch(orderedArr, item) {
    // 1.检验input内容是否符合标准
    if (!Array.isArray(orderedArr)) return null
    // 2.生成两个指针
    let low = 0
    let high = orderedArr.length
    while (low <= high) {
        let middle = (low + high) >> 1
        let guess = orderedArr[middle]
        if (guess === item) {
            return middle
        } else if (guess > item) {
            // 猜测值大于需要找出的值
            // 表示high指针需要左移
            high = middle - 1
        } else if (guess < item) {
            // 表示猜测值小
            // 表示low指针需要右移
            low = middle + 1
        }
    }
    return null
}


let test = [1, 3, 5, 7, 9, 11, 13, 15, 16, 19, 20, 21]
let index = binarySearch(test, 11)
console.log("🚀 ~ index === 5:", index)


/**
 * findSmallest
 * input: arr
 * output: element
 * @param {Array} arr 
 */
function findSmallest(arr) {
    let smallestIndex = 0
    let smallestElement = 0
    for (let index = 0; index < arr.length; index++) {
        const element = arr[index];
        if (element >= smallestElement) {
            smallestElement = element
            smallestIndex = index
        }
    }
    return smallestIndex
}
/**
 * input:无序的数组
 * output：有序的数组
 * @param {Array} arr 
 * @returns {Array}
 */
function selectionSort(arr) {
    let selectionArr = []
    let len = arr.length
    for (let index = 0; index < len; index++) {
        let smallestIndex = findSmallest(arr)
        selectionArr.unshift(arr.splice(smallestIndex, 1)[0])
    }
    return selectionArr
}

let testArr = [5, 11, 2, 33, 23, 41, 21, 23, 45, 23]
const a = selectionSort(testArr)
console.log("🚀 ~ a:", a)



/***
 * divide and conquer
 * 找到基线条件，不断逼近基线条件。
 * 
 */
function quickSortRecursive(arr) {
    if (arr.length <= 1) return arr
    const pivotIndex = Math.floor(Math.random() * arr.length);
    let highArr = []
    let lowArr = []
    let baseItem = arr[pivotIndex]
    for (let index = 1; index < arr.length; index++) {
        const element = arr[index];
        if (element > baseItem) {
            highArr.push(element)
        } else if (element <= baseItem) {
            lowArr.push(element)
        }
    }
    highArr = quickSortRecursive(highArr)
    lowArr = quickSortRecursive(lowArr)
    return [...lowArr, baseItem, ...highArr]
}

/**
 * 基线条件
 */
function improvementQuickSortRecursive(arr) {
    let len = arr.length
    if (len <= 1) return arr
    let pivotIndex = Math.floor(Math.random() * len)
    let pivot = arr[pivotIndex]
    [arr[0], arr[pivotIndex]] = [arr[pivotIndex], arr[0]]
    let low = []
    let high = []
    let equal = []
    for (let index = 0; index < len; index++) {
        const element = arr[index];
        if (index === 0 && element === pivot) {
            continue
        }
        if (element < pivot) {
            low.push(element)
        } else if (element > pivot) {
            high.push(element)
        } else {
            equal.push(element)
        }
    }
    const sortedLow = improvementQuickSortRecursive(low)
    const sortedHigh = improvementQuickSortRecursive(high)
    return [...sortedLow, pivot, ...equal, ...sortedHigh]
}

const a1 = [2, 55, 11, 22, 34, 21, 2, 444, 56, 38, 23, 1, 23, 11, 55, 44, 32, 36, 64, 63, 78, 89, 2, 12, 23, 100]

console.time('r1')
const r1  =quickSortRecursive(a1)
console.log("🚀 ~ r1:", r1)
console.timeEnd('r1')
console.time('r2')
const r2 =improvementQuickSortRecursive(a1)
console.log("🚀 ~ r2:", r2)
console.timeEnd('r2')
