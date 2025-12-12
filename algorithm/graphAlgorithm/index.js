

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

let testArr  = [5,11,2,33,23,41,21,23,45,23]
const a = selectionSort(testArr)
console.log("🚀 ~ a:", a)
