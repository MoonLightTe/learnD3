# 测试框架对比：手写 vs Jest

## 为什么我在演示中用手写测试框架？

### 演示优势
- **聚焦TDD核心** - 不被框架配置和学习曲线分心
- **透明性** - 直接看到测试函数和断言的工作原理
- **零依赖** - 不需要安装任何包，开箱即用
- **可控性** - 每个步骤都可以独立验证

### 实际项目劣势
- **功能有限** - 缺少高级特性（mock、spy、coverage等）
- **维护困难** - 需要自己维护测试框架代码
- **缺少生态** - 没有丰富的断言库和工具链
- **团队协作** - 其他开发者不熟悉你的"自制"框架

## 现成测试框架对比

### Jest (推荐) ⭐⭐⭐⭐⭐

**优点：**
- 零配置，开箱即用
- 内置断言库，API简洁
- 强大的mock和spy功能
- 内置代码覆盖率报告
- 快照测试功能
- 并行执行，速度快
- 丰富的社区生态

**缺点：**
- 对于简单项目可能过于重量级

**适用场景：** 大部分项目，特别是React项目

### Vitest (新兴) ⭐⭐⭐⭐⭐

**优点：**
- Jest兼容，迁移成本低
- Vite原生支持，开发体验好
- 启动速度更快
- ESM支持更好
- 与Vite生态系统完美集成

**缺点：**
- 相对较新，生态还在发展

**适用场景：** 使用Vite的项目

### Mocha + Chai (传统) ⭐⭐⭐⭐

**优点：**
- 高度可配置
- 灵活的断言库选择
- 成熟稳定

**缺点：**
- 需要手动配置
- 断言库需要单独安装
- setup相对复杂

**适用场景：** 需要高度定制的项目

## 代码对比

### 手写版本（演示用）

```javascript
// test-simple.js
const testResults = [];

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

test('测试URL解析', () => {
  const url = new URL('https://example.com');
  if (url.href !== 'https://example.com') {
    throw new Error('href不正确');
  }
});
```

**问题：**
- 断言方式原始（手动抛出错误）
- 没有describe分组
- 没有beforeEach/afterEach
- 错误信息不友好

### Jest版本（实际项目）

```javascript
// cookie.spec.js
describe('URL 类', () => {
  describe('基本解析', () => {
    test('解析基本URL https://example.com', () => {
      const url = new URL('https://example.com');

      expect(url.href).toBe('https://example.com');
      expect(url.protocol).toBe('https');
    });
  });

  describe('边界情况', () => {
    test('处理空URL', () => {
      const url = new URL('');
      expect(url.href).toBe('');
    });
  });
});
```

**优势：**
- 丰富的断言API (toBe, toEqual, toHaveProperty等)
- describe分组让测试更清晰
- 内置mock和spy
- 友好的错误信息
- 代码覆盖率报告

## 功能对比表

| 功能 | 手写 | Jest | Vitest | Mocha |
|------|------|------|--------|-------|
| 基本断言 | ✅ 简单 | ✅ 丰富 | ✅ 丰富 | ⚠️ 需Chai |
| describe分组 | ❌ | ✅ | ✅ | ✅ |
| beforeEach/afterEach | ❌ | ✅ | ✅ | ✅ |
| Mock/Spy | ❌ | ✅ 强大 | ✅ | ⚠️ 需sinon |
| 代码覆盖率 | ❌ | ✅ 内置 | ✅ | ⚠️ 需配置 |
| 快照测试 | ❌ | ✅ | ✅ | ❌ |
| 异步测试 | ⚠️ 复杂 | ✅ 简单 | ✅ 简单 | ✅ 简单 |
| TypeScript | ❌ | ✅ | ✅ | ⚠️ 需配置 |
| ESM支持 | ❌ | ⚠️ 有限 | ✅ | ⚠️ 需配置 |
| 社区生态 | ❌ | ✅ | ✅ | ✅ |
| 零配置 | ✅ | ✅ | ✅ | ❌ |

## 如何选择

### 选择手写测试的情况
- 学习TDD概念
- 快速原型验证
- 非常简单的工具函数
- 不想引入依赖

### 选择Jest的情况
- 大部分商业项目
- React/Vue项目
- 需要完整测试生态
- 团队需要统一工具链

### 选择Vitest的情况
- 使用Vite的项目
- 追求更快的开发体验
- 需要更好的ESM支持

## 安装和使用Jest

### 1. 安装

```bash
npm install --save-dev jest
# 或
pnpm add -D jest
```

### 2. 配置（可选）

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.spec.js'],
  verbose: true
};
```

### 3. 运行测试

```bash
# 运行所有测试
npx jest

# 运行特定文件
npx jest cookie.spec.js

# 监听模式
npx jest --watch

# 生成覆盖率报告
npx jest --coverage
```

## 最佳实践建议

### 演示TDD流程时
使用手写测试框架，让学习者理解核心概念

### 实际项目开发时
**一定要使用成熟测试框架！**
- Jest 或 Vitest
- 充分利用断言API
- 使用describe分组
- 配置代码覆盖率

### 团队协作时
- 统一使用一个框架
- 配置团队共享的配置文件
- 建立测试规范和命名约定

## 总结

手写测试框架适合：
- ✅ 学习和理解TDD
- ✅ 快速验证想法
- ✅ 极端简单的场景

成熟测试框架适合：
- ✅ 任何实际项目
- ✅ 需要完整功能
- ✅ 团队协作
- ✅ 长期维护

**记住：** 学习TDD时，先用手写框架理解概念；实际开发时，一定用成熟框架提高效率。