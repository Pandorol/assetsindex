# Cocos Creator 扩展分发说明

## 📦 如何分发这个扩展给别人使用

### 方法1：完整扩展包分发 (推荐)

1. **打包整个扩展目录**
   ```
   将整个 assetsindex 文件夹打包成 zip 文件
   包含以下重要文件/目录：
   ├── package.json          (扩展配置)
   ├── dist/                 (编译后的代码)
   ├── static/               (静态资源)
   ├── i18n/                 (国际化文件)
   ├── @types/               (类型定义)
   └── README.md             (使用说明)
   ```

2. **用户安装步骤**
   - 解压 zip 文件到 Cocos Creator 项目的 `extensions` 目录下
   - 重启 Cocos Creator 或在扩展管理器中刷新
   - 在菜单栏 `扩展` -> `assetsindex` 中找到相关功能

### 方法2：精简分发包

如果想要最小的分发包，只需要这些文件：
```
assetsindex/
├── package.json          (必需 - 扩展配置)
├── dist/                 (必需 - 编译后的 JS 代码)
│   ├── main.js
│   └── panels/
├── static/               (必需 - 面板资源)
│   ├── style/
│   └── template/
├── i18n/                 (可选 - 国际化)
│   ├── en.js
│   └── zh.js
└── README.md             (推荐 - 使用说明)
```

### 方法3：作为 npm 包分发

1. **发布到 npm**
   ```bash
   npm publish
   ```

2. **用户安装**
   ```bash
   npm install assetsindex
   ```

## 🔧 用户使用前置条件

- Cocos Creator 版本：>= 3.7.4
- Node.js 依赖会自动安装：
  - fast-glob: ^3.3.3
  - fs-extra: ^10.0.0
  - glob: ^11.0.3
  - image-size: ^2.0.2

## 📋 功能清单

这个扩展提供以下功能：

1. **构建索引表** - 生成 assetsindex.json
2. **远程包资源** - 处理远程资源
3. **资源处理** - 包含以下子功能：
   - 建立映射数据
   - 移动背景图片
   - 预处理重复图片
   - 复制其他小图
   - 删除空文件夹

## 🚀 快速开始

1. 安装扩展后，在 Cocos Creator 菜单栏找到 `扩展` -> `assetsindex`
2. 选择对应的功能面板：
   - `构建索引表` - 生成资源索引
   - `资源处理` - 进行资源优化和整理

## 📝 注意事项

- 使用前请备份您的项目
- 某些操作会修改预制体文件，建议在版本控制下操作
- 大批量操作时建议先使用预览模式查看效果

## 🐛 问题反馈

如有问题，请提供：
- Cocos Creator 版本
- 操作步骤
- 错误日志
- 项目结构示例
