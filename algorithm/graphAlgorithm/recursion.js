
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
    if(len === 0) return 0
    let item = arr.shift(arr)
    return item + sum(arr)
}

let sumNum = sum([1,2,3,4])
console.log("🚀 ~ sumNum:", sumNum)
