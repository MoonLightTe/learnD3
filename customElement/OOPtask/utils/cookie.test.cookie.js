// Cookie类的测试
const testResults = [];

// 模拟测试函数
function test(name, fn) {
  try {
    fn();
    testResults.push({ name, status: 'PASS' });
    console.log('✅', name);
  } catch (error) {
    testResults.push({ name, status: 'FAIL', error: error.message });
    console.log('❌', name);
    console.log('   Error:', error.message);
  }
}

// 导入实现
const { Cookie } = require('./cookie-new.js');

// 测试1：创建Cookie实例
test('创建Cookie实例', () => {
  const cookie = new Cookie();
  if (!(cookie instanceof Cookie)) throw new Error('Cookie实例创建失败');
});

// 测试2：Cookie基本属性
test('Cookie基本属性初始化', () => {
  const cookie = new Cookie();
  if (typeof cookie.get !== 'function') throw new Error('get方法不存在');
  if (typeof cookie.set !== 'function') throw new Error('set方法不存在');
  if (typeof cookie.remove !== 'function') throw new Error('remove方法不存在');
});

console.log('\n📊 Cookie测试结果:');
console.log(`通过: ${testResults.filter(t => t.status === 'PASS').length}`);
console.log(`失败: ${testResults.filter(t => t.status === 'FAIL').length}`);

if (testResults.some(t => t.status === 'FAIL')) {
  console.log('\n🔴 Cookie测试失败！');
} else {
  console.log('\n🟢 Cookie测试通过！');
}