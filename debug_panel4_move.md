# Panel4 移动功能调试指南

## 问题分析

用户遇到的错误：`Cannot read property 'movedCount' of undefined`

### 原因
1. 消息调用返回了 `undefined`
2. 参数格式与主进程期望的不一致

## 修复内容

### 1. 修正参数格式
更改前的错误格式：
```javascript
{
    method: 'moveBgImages',
    operations: [...], // 错误的参数名
    moveInfo: [...],   // 错误的结构
}
```

修正后的正确格式（参考 index.ts）：
```javascript
{
    method: 'moveBgImages',
    spriteFrameMaps_name: _dataCache.spriteFrameMaps_name,
    path2info: filteredDataCache, // 只传递要移动的图片信息
    bgTargetPattern: moveItem.targetDir,
    imageSizeMap: imageSizeMap,
    keepOld: false,
    preLook: false,
    autoRename: true
}
```

### 2. 数据处理优化
- 创建过滤后的数据缓存，只包含要移动的图片
- 预计算图片大小判断结果
- 使用与主流程相同的参数结构

### 3. 错误处理增强
- 检查返回结果是否为 undefined
- 验证返回对象的结构
- 提供更详细的错误信息
- 设置默认值避免崩溃

## 测试步骤

1. **重新编译扩展**
   ```bash
   npm run build
   ```

2. **重启 Cocos Creator**
   - 关闭 Cocos Creator
   - 重新打开项目

3. **测试移动功能**
   - 添加移动项
   - 设置正则表达式（如：`.*gg_zhenying.*\.png$`）
   - 设置目标目录（如：`test/moved/`）
   - 预览匹配项
   - 选择要移动的图片
   - 点击移动按钮

## 调试信息

查看控制台输出：
- `准备调用移动功能，要移动的图片:` - 查看选中的图片列表
- `过滤后的数据缓存:` - 查看传递给主进程的数据
- `调用参数:` - 查看完整的请求参数
- `消息调用成功，结果:` - 查看主进程返回的结果

## 常见问题

### 1. 仍然返回 undefined
- 检查主进程消息处理是否正确注册
- 确认 method 名称与主进程匹配
- 检查主进程日志

### 2. 移动失败
- 确认目标目录存在或可以创建
- 检查文件权限
- 验证文件路径格式

### 3. 参数错误
- 确保 _dataCache 已正确初始化
- 检查 spriteFrameMaps_name 数据结构
- 验证图片路径格式

## 下一步

如果问题仍然存在，请：
1. 提供完整的控制台日志
2. 检查主进程是否有相关错误
3. 确认扩展主进程消息处理逻辑
