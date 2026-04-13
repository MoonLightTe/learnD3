# TDD (测试驱动开发) 流程演示

本文档展示了如何使用TDD方法为 `cookie.js` 添加单元测试的完整流程。

## TDD 核心原则

```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

## TDD 循环：RED → GREEN → REFACTOR

```
    ┌─────────┐
    │  RED    │ 1. 编写失败的测试
    └────┬────┘
         │
         ▼
    ┌─────────┐
    │ VERIFY  │ 2. 确认测试正确失败
    └────┬────┘
         │
         ▼
    ┌─────────┐
    │ GREEN   │ 3. 实现最少代码让测试通过
    └────┬────┘
         │
         ▼
    ┌─────────┐
    │ VERIFY  │ 4. 确认测试通过
    └────┬────┘
         │
         ▼
    ┌─────────┐
    │REFACTOR │ 5. 重构优化，保持测试通过
    └────┬────┘
         │
         ▼
    ┌─────────┐
    │ REPEAT  │ 6. 重复循环
    └─────────┘
```

## 实际案例演示

### 步骤1：RED - 编写第一个失败的测试

**测试目标**：解析基本URL `https://example.com`

```javascript
// test-simple.js
test('解析基本URL https://example.com', () => {
  const url = new URL('https://example.com');

  if (url.href !== 'https://example.com') throw new Error('href不正确');
  if (url.protocol !== 'https') throw new Error('protocol不正确');
  if (url.hostname !== 'example.com') throw new Error('hostname不正确');
  // ...
});
```

**运行结果**：
```
❌ 解析基本URL https://example.com
   Error: href不正确
```

✅ **确认测试正确失败** - 这是预期的！

---

### 步骤2：GREEN - 实现最少代码

**实现**：
```javascript
export class URL {
  constructor(url) {
    this.href = String(url || "");
    // 最简单的实现
    if (this.href.startsWith('https://')) {
      this.protocol = 'https';
      this.hostname = this.href.slice(8).split('/')[0];
      // ...
    }
  }
}
```

**运行结果**：
```
✅ 解析基本URL https://example.com
🟢 所有测试通过！
```

---

### 步骤3：REFACTOR - 优化代码

**重构**：将逻辑提取到单独的方法，保持测试通过

```javascript
export class URL {
  constructor(url) {
    this.href = String(url || "");
    this.initUrl(this.href);  // 提取到独立方法
  }

  initUrl(url) {
    // 清晰的解析逻辑
  }
}
```

**验证**：所有测试仍然通过 ✅

---

### 步骤4：重复 - 添加新功能

**新测试**：带用户名密码的URL

```javascript
test('解析带用户名密码的URL https://user:pass@example.com', () => {
  const url = new URL('https://user:pass@example.com');

  if (url.username !== 'user') throw new Error('username不正确');
  if (url.password !== 'pass') throw new Error('password不正确');
  // ...
});
```

**运行结果**：
```
❌ 解析带用户名密码的URL https://user:pass@example.com
   Error: username不正确
```

回到 GREEN 阶段实现认证功能...

---

## 最终实现功能

### URL 类
- ✅ 解析协议 (http/https)
- ✅ 解析主机名和端口
- ✅ 解析路径
- ✅ 解析用户名密码
- ✅ 特殊字符解码

### Cookie 类
- ✅ 设置 Cookie
- ✅ 获取 Cookie
- ✅ 删除 Cookie
- ✅ 过期时间处理
- ✅ 获取所有 Cookie

## 测试覆盖

```
总测试数: 9
✅ 通过: 9
❌ 失败: 0

🎉 所有测试通过！
```

## 关键要点

### 1. 测试先行的价值
- 确保测试真的测试了什么（不是测试实现细节）
- 迫使思考API设计
- 文档即测试

### 2. RED 阶段的重要性
- 必须亲眼看到测试失败
- 确保失败原因是正确的（功能缺失，不是拼写错误）
- 防止写永远不会失败的假测试

### 3. GREEN 阶段的原则
- 写最少代码让测试通过
- 不添加额外功能
- 不提前优化

### 4. REFACTOR 阶段
- 只在测试通过后重构
- 保持测试绿色
- 消除重复，改进命名

## 文件结构

```
utils/
├── cookie.js              # 原有代码（未修改）
├── cookie-new.js          # TDD实现的新代码
├── cookie.test.js        # 原始ES6测试
├── test-simple.js        # 简单测试（Node.js兼容）
├── test-advanced.js     # 高级测试
├── test-auth.js         # 认证功能测试
├── cookie.test.cookie.js      # Cookie基本测试
├── cookie.test.advanced.js    # Cookie高级测试
├── test-final.js        # 完整测试集
└── debug-url.js        # 调试工具
```

## 运行测试

```bash
# 运行简单测试
node test-simple.js

# 运行完整测试集
node test-final.js
```

## 常见误区（避免）

| 误区 | 正确做法 |
|------|----------|
| 先写代码再写测试 | 先写测试，看它失败 |
| 写完测试就跳过验证 | 必须亲眼看到测试失败和通过 |
| 实现时就添加额外功能 | 只实现让测试通过的最少代码 |
| 测试失败就改测试 | 改代码，不改测试（除非测试错误） |

## 总结

TDD的核心是 **"写测试 -> 看失败 -> 写代码 -> 看通过** 的循环。这个看似简单的流程能够：

1. **提高代码质量** - 每个功能都有测试保护
2. **加速开发** - 减少调试时间
3. **改善设计** - 测试即API设计
4. **文档价值** - 测试是最好的使用文档

记住：**如果你没有看到测试失败，你就不知道它是否真正测试了正确的功能。**