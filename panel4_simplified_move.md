# Panel4 移动功能简化方案

## 问题分析

原来的问题：
1. 使用复杂的 `dynamic-message` 调用主进程方法
2. 主进程期望特定的数据格式，容易出错
3. 依赖正则表达式匹配和复杂的数据处理逻辑

## 新的简化方案

### 直接使用 asset-db API

不再调用：
```javascript
// 旧方式 - 复杂且容易出错
Editor.Message.request('assetsindex', 'dynamic-message', requestParams)
```

改为直接使用：
```javascript
// 新方式 - 简单直接
Editor.Message.request('asset-db', 'move-asset', src, dest, moveOptions)
```

### 核心逻辑

1. **目录准备**：
   - 检查目标目录是否存在
   - 如果不存在则创建（使用 fs.mkdirSync）
   - 刷新资源数据库识别新目录

2. **逐个移动文件**：
   ```javascript
   for (const imagePath of selectedImages) {
       const src = `db://assets/${imagePath}`;
       const dest = `db://assets/${targetDir}${fileName}`;
       const moveOptions = { rename: true }; // 自动重命名避免冲突
       
       await Editor.Message.request('asset-db', 'move-asset', src, dest, moveOptions);
   }
   ```

3. **结果处理**：
   - 统计成功和失败的数量
   - 显示详细的错误信息
   - 刷新资源数据库

### 优势

1. **简单直接**：直接使用 Cocos Creator 的资源管理 API
2. **无需复杂匹配**：不需要正则表达式和数据格式转换
3. **错误处理清晰**：每个文件的移动结果都能独立处理
4. **自动重命名**：使用 `rename: true` 避免文件名冲突
5. **实时反馈**：可以实时显示移动进度

### 测试步骤

1. **重新编译扩展**
2. **添加移动项**
3. **设置正则表达式**：如 `.*gg_zhenying.*\.png$`
4. **设置目标目录**：如 `test/moved/`
5. **预览和选择要移动的图片**
6. **点击移动按钮**

### 预期结果

- 控制台显示详细的移动日志
- 每个文件的移动状态清晰可见
- 成功移动的文件出现在目标目录
- 失败的文件有明确的错误信息
- 资源数据库自动刷新

## 与原方案的区别

### 原方案（复杂）
- 依赖主进程的 `moveBgImages` 方法
- 需要构建复杂的参数结构
- 正则表达式匹配 prefab 路径
- 批量处理，错误难以定位

### 新方案（简化）
- 直接使用 asset-db API
- 参数简单：源路径、目标路径、移动选项
- 逐个处理，错误清晰可见
- 无需依赖主进程的复杂逻辑

这种方案更符合用户的需求：简单、直接、可控。
