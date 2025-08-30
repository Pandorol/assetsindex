# Panel4 与 showAlert2 集成测试

## 更新摘要

1. **直接传递 panel 实例**: 在 `bindPanel4Events` 中，将 `this` 直接传递给 `Panel4Manager.init()`
2. **更新参数名称**: 将 `indexMethods` 参数改为更清晰的 `panelInstance`
3. **更新变量名称**: 将 `_indexMethods` 全局变量改为 `_panelInstance`
4. **增强预览功能**: 
   - `previewMatches` 方法现在使用 `showAlert2` 显示结构化数据
   - `previewAllSelected` 方法也使用 `showAlert2` 显示更好的预览

## 关键代码更改

### index.ts 中的 bindPanel4Events 方法
```typescript
Panel4Manager.init({
    addMoveItemBtn: this.$.addMoveItemBtn,
    moveItemsContainer: this.$.moveItemsContainer,
    previewAllSelectedBtn: this.$.previewAllSelectedBtn,
    moveAllSelectedBtn: this.$.moveAllSelectedBtn
}, _dataCache, this); // 直接传递 this 对象
```

### indexpane4.ts 中的核心更改
- `init` 方法接收 `panelInstance` 参数
- `_panelInstance` 存储 panel 实例引用
- `previewMatches` 和 `previewAllSelected` 都优先使用 `_panelInstance.showAlert2()`

## 测试步骤

1. 打开 Panel4 (动态移动配置)
2. 添加移动项
3. 输入正则表达式
4. 点击预览按钮
5. 验证是否使用新的 showAlert2 弹窗显示结构化数据

## 预期结果

- 预览窗口应显示可展开/收起的树状结构
- 数据应包含 summary 和 matches/items 字段
- 窗口可拖拽，有标题栏和操作按钮
- 如果 showAlert2 不可用，应回退到 Editor.Dialog
