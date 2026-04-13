// 简单的测试运行器
const fs = require('fs');
const path = require('path');

// 模拟测试函数
const tests = [];
const testResults = [];

function test(name, fn) {
  tests.push({ name, fn });
}

// 读取测试文件
const testFile = fs.readFileSync('./cookie.test.js', 'utf8');
// 替换 import 为 require (Node.js 兼容)
const testCode = testFile.replace(
  /import\s*\{([^}]+)\}\s*from\s*['"]\.\/cookie-new['"];/g,
  "const {$1} = require('./cookie-new.js');"
);

// 执行测试代码
eval(`
${testCode}

// 运行所有测试
tests.forEach(({ name, fn }) => {
  try {
    fn();
    testResults.push({ name: name, status: 'PASS' });
    console.log('✅', name);
  } catch (error) {
    testResults.push({ name: name, status: 'FAIL', error: error.message });
    console.log('❌', name);
    console.log('   Error:', error.message);
  }
});

console.log('\\n📊 测试结果:');
console.log(`通过: ${testResults.filter(t => t.status === 'PASS').length}`);
console.log(`失败: ${testResults.filter(t => t.status === 'FAIL').length}`);

if (testResults.some(t => t.status === 'FAIL')) {
  console.log('\\n🔴 测试失败 - 这是预期的TDD RED阶段！');
} else {
  console.log('\\n🟢 所有测试通过！');
}
`);