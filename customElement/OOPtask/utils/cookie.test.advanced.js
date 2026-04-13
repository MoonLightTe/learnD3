// Cookie高级功能的测试
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

// 测试1：设置和获取Cookie
test('设置和获取Cookie', () => {
  const cookie = new Cookie();

  cookie.set('name', 'value');
  if (cookie.get('name') !== 'value') throw new Error('获取Cookie值不正确');

  cookie.set('user', 'john', { path: '/home' });
  if (cookie.get('user') !== 'john') throw new Error('获取带路径的Cookie值不正确');
});

// 测试2：过期时间
test('Cookie过期时间', () => {
  const cookie = new Cookie();

  // 设置1分钟后过期的Cookie
  const future = new Date(Date.now() + 60000);
  cookie.set('temp', 'value', { expires: future });

  if (cookie.get('temp') !== 'value') throw new Error('设置过期时间失败');

  // 设置过去的时间
  const past = new Date(Date.now() - 1000);
  cookie.set('expired', 'value', { expires: past });

  if (cookie.get('expired') !== null) throw new Error('过期Cookie未正确删除');
});

// 浠除3：删除Cookie
test('删除Cookie', () => {
  const cookie = new Cookie();

  cookie.set('removable', 'value');
  if (cookie.remove('removable') !== true) throw new Error('删除Cookie失败');
  if (cookie.get('removable') !== null) throw new Error('Cookie未正确删除');
});

// 测试4：获取所有Cookie
test('获取所有Cookie', () => {
  const cookie = new Cookie();

  cookie.set('name1', 'value1');
  cookie.set('name2', 'value2');
  cookie.set('name3', 'value3');

  const all = cookie.getAll();
  if (Object.keys(all).length !== 3) throw new Error('Cookie数量不正确');
  if (all.name1 !== 'value1' || all.name2 !== 'value2' || all.name3 !== 'value3') {
    throw new Error('Cookie值不正确');
  }

  // 删除一个Cookie
  cookie.remove('name2');
  const allAfter = cookie.getAll();
  if (Object.keys(allAfter).length !== 2) throw new Error('删除后Cookie数量不正确');
  if (allAfter.name2) throw new Error('已删除的Cookie仍然存在');
});

// 测试5：复杂选项
test('Cookie复杂选项', () => {
  const cookie = new Cookie();

  const options = {
    path: '/api',
    domain: 'example.com',
    secure: true,
    httponly: true
  };

  cookie.set('secure', 'value', options);
  const cookieObj = cookie.cookies['secure'];

  if (cookieObj.path !== '/api') throw new Error('path选项未正确设置');
  if (cookieObj.domain !== 'example.com') throw new Error('domain选项未正确设置');
  if (cookieObj.secure !== true) throw new Error('secure选项未正确设置');
  if (cookieObj.httponly !== true) throw new Error('httponly选项未正确设置');
});

console.log('\n📊 Cookie高级测试结果:');
console.log(`通过: ${testResults.filter(t => t.status === 'PASS').length}`);
console.log(`失败: ${testResults.filter(t => t.status === 'FAIL').length}`);

if (testResults.some(t => t.status === 'FAIL')) {
  console.log('\n🔴 Cookie高级测试失败！');
} else {
  console.log('\n🟢 Cookie高级测试通过！');
}