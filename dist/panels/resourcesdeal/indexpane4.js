"use strict";
/**
 * Panel4 动态移动功能模块
 * 负责处理动态添加移动项、正则匹配、预览和移动操作
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.panel4Styles = exports.Panel4Manager = void 0;
// #endregion
// #region 全局变量
let _dynamicMoveItems = [];
let _moveItemCounter = 0;
let _panel4Elements = {};
let _dataCache = null; // 存储主数据缓存的引用
let _panelInstance = null; // 存储 panel 实例引用
// #endregion
// #region 工具函数
function formatSize(bytes) {
    if (bytes >= 1024 * 1024) {
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
    else {
        return (bytes / 1024).toFixed(2) + ' KB';
    }
}
function basename(path) {
    return path.split('/').pop() || path.split('\\').pop() || path;
}
// #endregion
// #region 核心功能类
class Panel4Manager {
    /**
     * 初始化 Panel4 功能
     */
    static init(elements, dataCache, panelInstance) {
        _panel4Elements = {
            addMoveItemBtn: elements.addMoveItemBtn,
            moveItemsContainer: elements.moveItemsContainer,
            previewAllSelectedBtn: elements.previewAllSelectedBtn,
            moveAllSelectedBtn: elements.moveAllSelectedBtn
        };
        _dataCache = dataCache;
        _panelInstance = panelInstance; // 保存 panel 实例引用，可以直接调用其方法
        // 加载保存的配置
        this.loadSavedConfigs();
        // 不在这里绑定事件，由外部 index.ts 处理
        console.log('Panel4 动态移动功能初始化完成');
    }
    /**
     * 保存配置到本地存储
     */
    static saveConfigs() {
        var _a, _b;
        try {
            const configs = _dynamicMoveItems.map(item => ({
                name: item.name,
                regex: item.regex,
                targetDir: item.targetDir
            }));
            if (_panelInstance && typeof _panelInstance === 'object') {
                // 使用 Editor.Profile 保存配置
                (_b = (_a = window.Editor) === null || _a === void 0 ? void 0 : _a.Profile) === null || _b === void 0 ? void 0 : _b.setConfig('assetsindex', 'panel4_moveItems', configs);
                console.log('Panel4 配置已保存:', configs);
            }
        }
        catch (error) {
            console.error('保存 Panel4 配置失败:', error);
        }
    }
    /**
     * 从本地存储加载配置
     */
    static async loadSavedConfigs() {
        var _a, _b;
        try {
            if (_panelInstance && typeof _panelInstance === 'object') {
                // 使用 Editor.Profile 加载配置
                const configs = await ((_b = (_a = window.Editor) === null || _a === void 0 ? void 0 : _a.Profile) === null || _b === void 0 ? void 0 : _b.getConfig('assetsindex', 'panel4_moveItems'));
                if (configs && Array.isArray(configs) && configs.length > 0) {
                    console.log('加载保存的 Panel4 配置:', configs);
                    // 清空现有配置
                    this.clearAllMoveItems();
                    // 恢复保存的配置
                    configs.forEach((config, index) => {
                        const moveItem = {
                            id: `moveItem_${index + 1}`,
                            name: config.name || `移动项 ${index + 1}`,
                            regex: config.regex || '',
                            targetDir: config.targetDir || '',
                            matchedImages: [],
                            selectedImages: []
                        };
                        _dynamicMoveItems.push(moveItem);
                        _moveItemCounter = Math.max(_moveItemCounter, index + 1);
                        this.renderMoveItem(moveItem);
                    });
                    console.log(`成功恢复 ${configs.length} 个移动项配置`);
                }
                else {
                    console.log('没有找到保存的 Panel4 配置');
                }
            }
        }
        catch (error) {
            console.error('加载 Panel4 配置失败:', error);
        }
    }
    /**
     * 更新数据缓存
     */
    static updateDataCache(dataCache) {
        _dataCache = dataCache;
    }
    /**
     * 获取元素 - 使用类似 index.ts 的方式
     */
    static getElement(id) {
        const container = _panel4Elements.moveItemsContainer;
        if (!container) {
            console.warn('容器不存在，无法查找元素:', id);
            return null;
        }
        // 优先使用容器的 querySelector，这是最可靠的方法
        const element = container.querySelector(`#${id}`);
        if (element) {
            return element;
        }
        console.warn(`无法找到元素: ${id}`);
        return null;
    }
    /**
     * 获取计数元素 - 专门用于按钮中的计数显示
     */
    static getCountElement(itemId, type) {
        const container = _panel4Elements.moveItemsContainer;
        if (!container) {
            return null;
        }
        // 直接通过选择器查找
        const element = container.querySelector(`#${itemId}_${type}`);
        if (element) {
            return element;
        }
        // 如果直接查找失败，通过按钮查找
        const actionAttr = type === 'matchCount' ? 'preview' : 'previewSelected';
        const button = container.querySelector(`[data-action="${actionAttr}"][data-item-id="${itemId}"]`);
        if (button) {
            const span = button.querySelector('span');
            if (span) {
                return span;
            }
        }
        console.warn(`无法找到计数元素: ${itemId}_${type}`);
        return null;
    }
    /**
     * 添加新的移动项
     */
    static addMoveItem() {
        console.log('addMoveItem 被调用');
        _moveItemCounter++;
        const itemId = `moveItem_${_moveItemCounter}`;
        const moveItem = {
            id: itemId,
            name: `移动项 ${_moveItemCounter}`,
            regex: '',
            targetDir: '',
            matchedImages: [],
            selectedImages: []
        };
        _dynamicMoveItems.push(moveItem);
        console.log(`添加了新的移动项: ${itemId}`, moveItem);
        console.log(`当前移动项总数: ${_dynamicMoveItems.length}`);
        this.renderMoveItem(moveItem);
        // 保存配置
        this.saveConfigs();
    }
    /**
     * 渲染移动项UI
     */
    static renderMoveItem(moveItem) {
        console.log(`renderMoveItem 被调用，渲染移动项: ${moveItem.id}`);
        const container = _panel4Elements.moveItemsContainer;
        if (!container) {
            console.error('moveItemsContainer 容器不存在');
            return;
        }
        const itemElement = document.createElement('div');
        itemElement.className = 'move-item';
        // 清理 ID，确保没有特殊字符
        const cleanId = moveItem.id.replace(/[^a-zA-Z0-9_-]/g, '');
        itemElement.id = cleanId;
        console.log(`创建元素，原始 ID: "${moveItem.id}", 清理后 ID: "${cleanId}"`);
        console.log(`创建的元素:`, itemElement);
        // 立即验证 ID 设置
        console.log(`元素 ID 属性:`, itemElement.id);
        console.log(`元素 getAttribute('id'):`, itemElement.getAttribute('id'));
        // 更新 moveItem 的 ID 为清理后的版本
        moveItem.id = cleanId;
        itemElement.innerHTML = `
            <div class="move-item-header">
                <span class="move-item-title">${moveItem.name}</span>
                <button class="move-item-remove" type="button">✕ 删除</button>
            </div>
            
            <div class="move-item-config">
                <div class="config-group">
                    <label>正则表达式:</label>
                    <input type="text" id="${cleanId}_regex" value="${moveItem.regex}" 
                           placeholder="例如: .*\\.png$" />
                </div>
                <div class="config-group">
                    <label>目标目录:</label>
                    <input type="text" id="${cleanId}_targetDir" value="${moveItem.targetDir}" 
                           placeholder="例如: staticRes/ui/common/" />
                </div>
            </div>
            
            <div class="move-item-actions">
                <button class="btn-preview" data-action="preview" data-item-id="${cleanId}" type="button">
                    🔍 预览匹配 (<span id="${cleanId}_matchCount">0</span>)
                </button>
                <button class="btn-select" data-action="select" data-item-id="${cleanId}" type="button">
                    ☑️ 选择匹配项
                </button>
                <button class="btn-preview" data-action="previewSelected" data-item-id="${cleanId}" type="button">
                    📋 预览选中 (<span id="${cleanId}_selectedCount">0</span>)
                </button>
                <button class="btn-move" data-action="move" data-item-id="${cleanId}" type="button">
                    🚀 移动选中项
                </button>
            </div>
            
            <div class="move-item-status" id="${cleanId}_status"></div>
        `;
        container.appendChild(itemElement);
        // 使用 setTimeout 确保 DOM 更新完成后再绑定事件
        setTimeout(() => {
            // 在扩展环境中，使用容器的 ownerDocument 来查找元素
            const doc = container.ownerDocument || document;
            const verifyElement = doc.getElementById(cleanId);
            console.log(`元素添加后验证查找结果 (setTimeout):`, verifyElement);
            if (!verifyElement) {
                console.warn(`全局 document 无法找到元素，尝试容器查找...`);
                // 尝试直接通过容器查找
                const directFind = container.querySelector(`#${cleanId}`);
                console.log(`容器直接查找结果:`, directFind);
                if (directFind) {
                    console.log(`元素成功添加到容器，但不在全局 document 中，ID: ${cleanId}`);
                }
                else {
                    console.error(`元素添加失败！容器中也找不到 ID: ${cleanId}`);
                }
            }
            else {
                console.log(`元素成功添加到 DOM，ID: ${cleanId}`);
            }
            // 在 setTimeout 中绑定输入事件，确保 DOM 已更新
            this.bindInputEvents(moveItem, cleanId, container);
            // 如果移动项有保存的值，设置到输入框中
            if (moveItem.regex || moveItem.targetDir) {
                setTimeout(() => {
                    const regexInput = container.querySelector(`#${cleanId}_regex`);
                    const targetDirInput = container.querySelector(`#${cleanId}_targetDir`);
                    if (regexInput && moveItem.regex) {
                        regexInput.value = moveItem.regex;
                        console.log(`恢复正则表达式值: ${moveItem.regex}`);
                    }
                    if (targetDirInput && moveItem.targetDir) {
                        targetDirInput.value = moveItem.targetDir;
                        console.log(`恢复目标目录值: ${moveItem.targetDir}`);
                    }
                    // 触发一次匹配更新
                    if (moveItem.regex) {
                        this.updateMatchCount(moveItem.id);
                    }
                }, 50);
            }
        }, 0);
        // 绑定按钮事件（使用 itemElement 查找，不依赖 ID）
        const previewBtn = itemElement.querySelector('[data-action="preview"]');
        const selectBtn = itemElement.querySelector('[data-action="select"]');
        const previewSelectedBtn = itemElement.querySelector('[data-action="previewSelected"]');
        const moveBtn = itemElement.querySelector('[data-action="move"]');
        previewBtn === null || previewBtn === void 0 ? void 0 : previewBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`点击预览匹配按钮: ${moveItem.id}`);
            this.previewMatches(moveItem.id);
        });
        selectBtn === null || selectBtn === void 0 ? void 0 : selectBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`点击选择匹配项按钮: ${moveItem.id}`);
            this.selectMatches(moveItem.id);
        });
        previewSelectedBtn === null || previewSelectedBtn === void 0 ? void 0 : previewSelectedBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`点击预览选中按钮: ${moveItem.id}`);
            this.previewSelected(moveItem.id);
        });
        moveBtn === null || moveBtn === void 0 ? void 0 : moveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`点击移动选中项按钮: ${moveItem.id}`);
            this.moveSelected(moveItem.id);
        });
        // 绑定删除按钮事件
        const removeBtn = itemElement.querySelector('.move-item-remove');
        console.log(`绑定删除按钮事件，按钮:`, removeBtn, `移动项: ${moveItem.id}`);
        removeBtn === null || removeBtn === void 0 ? void 0 : removeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`点击删除按钮: ${moveItem.id}`);
            console.log(`事件目标:`, e.target);
            console.log(`当前元素:`, e.currentTarget);
            // 确认删除操作
            if (confirm(`确定要删除"${moveItem.name}"吗？`)) {
                this.removeMoveItem(moveItem.id);
            }
            else {
                console.log(`用户取消删除操作: ${moveItem.id}`);
            }
        });
    }
    /**
     * 删除移动项
     */
    static removeMoveItem(itemId) {
        console.log(`removeMoveItem 被调用，删除项: ${itemId}`);
        console.log(`删除前移动项数量: ${_dynamicMoveItems.length}`);
        console.log(`当前移动项列表:`, _dynamicMoveItems.map(item => item.id));
        const index = _dynamicMoveItems.findIndex(item => item.id === itemId);
        console.log(`找到的索引位置: ${index}`);
        if (index !== -1) {
            _dynamicMoveItems.splice(index, 1);
            console.log(`已从数组中删除，删除后数量: ${_dynamicMoveItems.length}`);
            // 保存配置
            this.saveConfigs();
        }
        else {
            console.warn(`在数组中找不到要删除的移动项: ${itemId}`);
        }
        // 在扩展环境中，优先使用容器上下文查找元素
        const container = _panel4Elements.moveItemsContainer;
        let element = null;
        if (container) {
            const doc = container.ownerDocument || document;
            // 首先尝试在容器的文档上下文中查找
            element = doc.getElementById(itemId);
            console.log(`容器文档上下文查找结果 (getElementById):`, element);
            // 如果找不到，使用容器的 querySelector
            if (!element) {
                element = container.querySelector(`#${itemId}`);
                console.log(`容器 querySelector 查找结果:`, element);
            }
            // 如果还是找不到，遍历所有 .move-item 元素查找
            if (!element) {
                const allItems = container.querySelectorAll('.move-item');
                console.log(`容器中所有 .move-item 元素:`, allItems);
                allItems.forEach((item, index) => {
                    console.log(`第 ${index} 个元素 ID: "${item.id}"`);
                });
                element = Array.from(allItems).find(item => item.id === itemId);
                if (element) {
                    console.log(`通过遍历找到了目标元素:`, element);
                }
            }
        }
        else {
            // 如果容器不存在，退回到全局 document 查找
            console.warn('容器不存在，使用全局 document 查找...');
            element = document.getElementById(itemId);
        }
        if (element) {
            element.remove();
            console.log(`已删除元素: ${itemId}`);
        }
        else {
            console.warn(`在 DOM 中找不到要删除的元素: ${itemId}`);
            console.warn('尝试的查找方法都失败了');
        }
        console.log(`删除操作完成，当前移动项:`, _dynamicMoveItems.map(item => item.id));
    }
    /**
     * 绑定输入事件
     */
    static bindInputEvents(moveItem, cleanId, container) {
        console.log(`bindInputEvents 被调用，moveItem: ${moveItem.id}, cleanId: ${cleanId}`);
        // 使用容器上下文查找元素
        const doc = container.ownerDocument || document;
        // 尝试多种方式查找输入框
        let regexInput = doc.getElementById(`${cleanId}_regex`);
        let targetDirInput = doc.getElementById(`${cleanId}_targetDir`);
        // 如果全局查找失败，使用容器查找
        if (!regexInput) {
            regexInput = container.querySelector(`#${cleanId}_regex`);
        }
        if (!targetDirInput) {
            targetDirInput = container.querySelector(`#${cleanId}_targetDir`);
        }
        console.log(`绑定输入事件 - 正则输入框:`, regexInput);
        console.log(`绑定输入事件 - 目标目录输入框:`, targetDirInput);
        if (regexInput) {
            regexInput.addEventListener('input', () => {
                console.log(`正则输入框 input 事件触发，新值: "${regexInput.value}"`);
                moveItem.regex = regexInput.value;
                console.log(`更新 moveItem.regex: "${moveItem.regex}"`);
                this.updateMatchCount(moveItem.id);
                // 自动保存配置
                this.saveConfigs();
            });
            console.log(`正则输入框事件绑定成功`);
        }
        else {
            console.error(`无法找到正则输入框: ${cleanId}_regex`);
        }
        if (targetDirInput) {
            targetDirInput.addEventListener('input', () => {
                console.log(`目标目录输入框 input 事件触发，新值: "${targetDirInput.value}"`);
                moveItem.targetDir = targetDirInput.value;
                console.log(`更新 moveItem.targetDir: "${moveItem.targetDir}"`);
                // 自动保存配置
                this.saveConfigs();
            });
            console.log(`目标目录输入框事件绑定成功`);
        }
        else {
            console.error(`无法找到目标目录输入框: ${cleanId}_targetDir`);
        }
    }
    /**
     * 更新匹配数量显示
     */
    static updateMatchCount(itemId) {
        console.log(`updateMatchCount 被调用，itemId: ${itemId}`);
        const moveItem = _dynamicMoveItems.find(item => item.id === itemId);
        if (!moveItem) {
            console.warn(`找不到移动项: ${itemId}`);
            return;
        }
        console.log(`找到移动项，当前正则: "${moveItem.regex}"`);
        // 使用新的元素获取方法
        const countElement = this.getCountElement(itemId, 'matchCount');
        console.log(`查找计数元素结果:`, countElement);
        console.log(`尝试查找的元素ID: ${itemId}_matchCount`);
        if (!moveItem.regex.trim()) {
            console.log(`正则表达式为空，设置计数为 0`);
            if (countElement) {
                countElement.textContent = '0';
            }
            moveItem.matchedImages = [];
            return;
        }
        console.log(`检查数据缓存:`, _dataCache ? '存在' : '不存在');
        if (!_dataCache) {
            console.warn('数据缓存未初始化');
            if (countElement) {
                countElement.textContent = '未初始化';
            }
            return;
        }
        try {
            console.log(`创建正则表达式: "${moveItem.regex}"`);
            const regex = new RegExp(moveItem.regex);
            console.log(`正则表达式创建成功`);
            console.log(`获取所有图片路径`);
            const allImages = this.getAllImagePaths();
            console.log(`获取到图片路径数量: ${allImages.length}`);
            if (allImages.length === 0) {
                console.warn('没有可用的图片数据');
                if (countElement) {
                    countElement.textContent = '无数据';
                }
                return;
            }
            console.log(`开始过滤匹配的图片`);
            moveItem.matchedImages = allImages.filter(imagePath => regex.test(imagePath));
            console.log(`过滤完成，匹配数量: ${moveItem.matchedImages.length}`);
            if (countElement) {
                countElement.textContent = moveItem.matchedImages.length.toString();
                console.log(`更新计数显示: ${moveItem.matchedImages.length}`);
                // 确保计数元素样式正常
                countElement.style.color = '';
                // 强制刷新DOM显示
                countElement.offsetHeight;
            }
            else {
                console.error(`无法找到计数元素，无法更新显示。尝试查找的ID: ${itemId}_matchCount`);
            }
            console.log(`正则 "${moveItem.regex}" 匹配到 ${moveItem.matchedImages.length} 个图片`);
        }
        catch (error) {
            console.warn(`正则表达式错误 (${itemId}):`, error.message);
            if (countElement) {
                countElement.textContent = '正则错误';
                countElement.style.color = '#dc3545';
            }
            moveItem.matchedImages = [];
        }
    }
    /**
     * 在编辑器中选中资源
     */
    static async openAssetInEditor(imagePath) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
        try {
            console.log(`尝试在编辑器中选中资源: ${imagePath}`);
            // 构建 db:// 路径
            const dbPath = `db://assets/${imagePath}`;
            // 首先获取资源的UUID，因为Selection.select需要UUID
            const assetInfo = await ((_b = (_a = window.Editor) === null || _a === void 0 ? void 0 : _a.Message) === null || _b === void 0 ? void 0 : _b.request('asset-db', 'query-asset-info', dbPath));
            if (assetInfo && assetInfo.uuid) {
                console.log(`获取到资源UUID: ${assetInfo.uuid}`);
                // 使用 Editor.Selection.select 在资源管理器中选中资源
                (_d = (_c = window.Editor) === null || _c === void 0 ? void 0 : _c.Selection) === null || _d === void 0 ? void 0 : _d.select('asset', assetInfo.uuid);
                console.log(`成功在资源管理器中选中资源: ${imagePath}`);
                // 同时聚焦到资源面板
                (_f = (_e = window.Editor) === null || _e === void 0 ? void 0 : _e.Panel) === null || _f === void 0 ? void 0 : _f.focus('assets');
            }
            else {
                console.warn(`无法获取资源信息: ${imagePath}`);
                // 备用方案：直接打开资源
                await ((_h = (_g = window.Editor) === null || _g === void 0 ? void 0 : _g.Message) === null || _h === void 0 ? void 0 : _h.request('asset-db', 'open-asset', dbPath));
            }
        }
        catch (error) {
            console.error(`在编辑器中选中资源失败: ${imagePath}`, error);
            // 如果Selection失败，尝试备用方案
            try {
                console.log(`使用备用方案打开资源: ${imagePath}`);
                const dbPath = `db://assets/${imagePath}`;
                await ((_k = (_j = window.Editor) === null || _j === void 0 ? void 0 : _j.Message) === null || _k === void 0 ? void 0 : _k.request('asset-db', 'open-asset', dbPath));
                console.log(`备用方案成功打开资源: ${imagePath}`);
            }
            catch (fallbackError) {
                console.error(`备用方案也失败了:`, fallbackError);
                // 最后的备用方案：显示资源信息
                try {
                    const assetInfo = await ((_m = (_l = window.Editor) === null || _l === void 0 ? void 0 : _l.Message) === null || _m === void 0 ? void 0 : _m.request('asset-db', 'query-asset-info', `db://assets/${imagePath}`));
                    if (assetInfo) {
                        (_p = (_o = window.Editor) === null || _o === void 0 ? void 0 : _o.Dialog) === null || _p === void 0 ? void 0 : _p.info(`资源信息:\n路径: ${imagePath}\n类型: ${assetInfo.type}\n大小: ${formatSize(assetInfo.size || 0)}`, {
                            title: '资源详情'
                        });
                    }
                    else {
                        (_r = (_q = window.Editor) === null || _q === void 0 ? void 0 : _q.Dialog) === null || _r === void 0 ? void 0 : _r.warn(`资源不存在: ${imagePath}`, {
                            title: '资源未找到'
                        });
                    }
                }
                catch (infoError) {
                    console.error(`查询资源信息也失败了:`, infoError);
                    (_t = (_s = window.Editor) === null || _s === void 0 ? void 0 : _s.Dialog) === null || _t === void 0 ? void 0 : _t.error(`无法处理资源: ${imagePath}`, {
                        title: '操作失败'
                    });
                }
            }
        }
    }
    /**
     * 获取所有图片路径
     */
    static getAllImagePaths() {
        if (!_dataCache) {
            console.warn('数据缓存未初始化');
            return [];
        }
        if (!_dataCache.path2info) {
            console.warn('path2info 数据不存在');
            return [];
        }
        const paths = Object.keys(_dataCache.path2info);
        console.log(`获取到 ${paths.length} 个图片路径`);
        return paths;
    }
    /**
     * 预览匹配的图片
     */
    static previewMatches(itemId) {
        console.log(`previewMatches 被调用，itemId: ${itemId}`);
        console.log(`当前移动项列表:`, _dynamicMoveItems.map(item => item.id));
        const moveItem = _dynamicMoveItems.find(item => item.id === itemId);
        if (!moveItem) {
            console.warn(`找不到移动项: ${itemId}`);
            console.warn(`可用的移动项ID:`, _dynamicMoveItems.map(item => item.id));
            return;
        }
        console.log(`找到移动项:`, moveItem);
        console.log(`检查正则表达式: "${moveItem.regex}"`);
        if (!moveItem.regex.trim()) {
            console.log(`正则表达式为空，显示错误状态`);
            this.showStatus(itemId, '请先输入正则表达式', 'error');
            return;
        }
        // 检查数据缓存
        console.log(`检查数据缓存:`, _dataCache ? '存在' : '不存在');
        if (!_dataCache) {
            console.log(`数据缓存未初始化，显示错误状态`);
            this.showStatus(itemId, '数据缓存未初始化，请先构建基础数据', 'error');
            return;
        }
        try {
            console.log(`开始调用 updateMatchCount`);
            this.updateMatchCount(itemId);
            // 等待 DOM 更新完成，然后再检查匹配结果并显示预览
            setTimeout(() => {
                console.log(`延迟后检查匹配图片数量: ${moveItem.matchedImages.length}`);
                if (moveItem.matchedImages.length === 0) {
                    console.log(`没有匹配的图片，显示信息状态`);
                    this.showStatus(itemId, '没有找到匹配的图片', 'info');
                    return;
                }
                console.log(`开始创建预览内容`);
                // 使用简单的自定义预览窗口，支持点击功能
                this.showSimplePreview(itemId, moveItem.name, moveItem.matchedImages, moveItem.regex);
            }, 200);
        }
        catch (error) {
            console.error(`预览匹配失败 (${itemId}):`, error);
            console.error(`错误堆栈:`, error.stack);
            this.showStatus(itemId, `预览失败: ${error.message}`, 'error');
        }
    }
    /**
     * 显示选择预览窗口，复用预览样式但添加checkbox选择功能
     */
    static showSelectionPreview(itemId, itemName, matchedImages, regex, moveItem) {
        if (matchedImages.length === 0) {
            this.showStatus(itemId, '没有找到匹配的图片', 'info');
            return;
        }
        // 创建预览窗口，使用与showSimplePreview相同的样式
        const overlay = document.createElement('div');
        overlay.className = 'simple-preview-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.7);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
        `;
        const dialog = document.createElement('div');
        dialog.className = 'simple-preview-dialog';
        dialog.style.cssText = `
            background: #2d2d30;
            color: #cccccc;
            border-radius: 8px;
            max-width: 80%;
            max-height: 80%;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        `;
        // 创建头部
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 15px 20px;
            border-bottom: 1px solid #555;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        header.innerHTML = `
            <div>
                <h3 style="margin:0; color:#fff;">选择要移动的图片 - ${itemName}</h3>
                <p style="margin:5px 0 0 0; color:#999; font-size:12px;">正则: ${regex} | 共 ${matchedImages.length} 个文件</p>
            </div>
            <button id="closeSelection" style="background:none; border:none; color:#fff; font-size:24px; cursor:pointer;">&times;</button>
        `;
        // 创建操作按钮区域
        const toolbar = document.createElement('div');
        toolbar.style.cssText = `
            padding: 10px 20px;
            border-bottom: 1px solid #555;
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        toolbar.innerHTML = `
            <button id="selectAll" style="padding: 5px 10px; background: #007acc; color: white; border: none; border-radius: 3px; cursor: pointer;">全选</button>
            <button id="selectNone" style="padding: 5px 10px; background: #666; color: white; border: none; border-radius: 3px; cursor: pointer;">全不选</button>
            <span style="color: #999; margin-left: 10px;" id="selectedCount">已选中 ${moveItem.selectedImages.length} 个</span>
        `;
        // 创建内容区域
        const content = document.createElement('div');
        content.style.cssText = `
            flex: 1;
            overflow-y: auto;
            padding: 15px 20px;
            max-height: 400px;
        `;
        // 添加图片列表（限制显示前100个），每个项前加checkbox
        const displayImages = matchedImages.slice(0, 100);
        displayImages.forEach((imagePath, index) => {
            const isSelected = moveItem.selectedImages.includes(imagePath);
            const item = document.createElement('div');
            item.style.cssText = `
                padding: 8px 12px;
                margin: 2px 0;
                background: rgba(255,255,255,0.05);
                border-radius: 4px;
                cursor: pointer;
                border-left: 3px solid ${isSelected ? '#28a745' : '#007acc'};
                transition: all 0.2s;
                font-family: monospace;
                font-size: 13px;
                display: flex;
                align-items: center;
                gap: 8px;
            `;
            item.innerHTML = `
                <input type="checkbox" ${isSelected ? 'checked' : ''} 
                       style="cursor: pointer;" data-path="${imagePath}">
                <span style="color:#569cd6;">${index + 1}.</span> 
                <span style="flex: 1;">${imagePath}</span>
            `;
            const checkbox = item.querySelector('input[type="checkbox"]');
            // 添加悬停效果
            item.addEventListener('mouseenter', () => {
                item.style.background = 'rgba(0,122,204,0.2)';
                item.style.borderLeftColor = '#00ff88';
            });
            item.addEventListener('mouseleave', () => {
                item.style.background = 'rgba(255,255,255,0.05)';
                item.style.borderLeftColor = checkbox.checked ? '#28a745' : '#007acc';
            });
            // 添加checkbox变化事件
            checkbox.addEventListener('change', (e) => {
                e.stopPropagation();
                if (checkbox.checked) {
                    console.log(`勾选文件: ${imagePath}`);
                    this.openAssetInEditor(imagePath);
                    item.style.borderLeftColor = '#28a745';
                    // 添加到选中列表
                    if (!moveItem.selectedImages.includes(imagePath)) {
                        moveItem.selectedImages.push(imagePath);
                    }
                }
                else {
                    item.style.borderLeftColor = '#007acc';
                    // 从选中列表移除
                    const index = moveItem.selectedImages.indexOf(imagePath);
                    if (index > -1) {
                        moveItem.selectedImages.splice(index, 1);
                    }
                }
                // 更新选中计数显示
                const selectedCountSpan = dialog.querySelector('#selectedCount');
                if (selectedCountSpan) {
                    selectedCountSpan.textContent = `已选中 ${moveItem.selectedImages.length} 个`;
                }
            });
            // 点击整行也能切换checkbox
            item.addEventListener('click', (e) => {
                if (e.target !== checkbox) {
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change'));
                }
            });
            content.appendChild(item);
        });
        // 如果有更多文件，显示提示
        if (matchedImages.length > 100) {
            const moreInfo = document.createElement('div');
            moreInfo.style.cssText = `
                padding: 10px;
                text-align: center;
                color: #999;
                font-style: italic;
                border-top: 1px solid #555;
            `;
            moreInfo.textContent = `... 还有 ${matchedImages.length - 100} 个文件未显示`;
            content.appendChild(moreInfo);
        }
        // 创建底部
        const footer = document.createElement('div');
        footer.style.cssText = `
            padding: 15px 20px;
            border-top: 1px solid #555;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        footer.innerHTML = `
            <span style="color: #999; font-size: 12px;">勾选文件将自动在编辑器中选中</span>
            <div style="display: flex; gap: 10px;">
                <button id="cancelSelection" style="padding: 8px 16px; background: #666; color: #fff; border: none; border-radius: 4px; cursor: pointer;">取消</button>
                <button id="confirmSelection" style="padding: 8px 16px; background: #007acc; color: #fff; border: none; border-radius: 4px; cursor: pointer;">确认选择</button>
            </div>
        `;
        // 组装对话框
        dialog.appendChild(header);
        dialog.appendChild(toolbar);
        dialog.appendChild(content);
        dialog.appendChild(footer);
        overlay.appendChild(dialog);
        // 绑定事件
        const selectAllBtn = dialog.querySelector('#selectAll');
        const selectNoneBtn = dialog.querySelector('#selectNone');
        const closeBtn = dialog.querySelector('#closeSelection');
        const cancelBtn = dialog.querySelector('#cancelSelection');
        const confirmBtn = dialog.querySelector('#confirmSelection');
        const checkboxes = dialog.querySelectorAll('input[type="checkbox"]');
        // 全选功能
        selectAllBtn.addEventListener('click', () => {
            checkboxes.forEach(cb => {
                if (!cb.checked) {
                    cb.checked = true;
                    cb.dispatchEvent(new Event('change'));
                }
            });
        });
        // 全不选功能
        selectNoneBtn.addEventListener('click', () => {
            checkboxes.forEach(cb => {
                if (cb.checked) {
                    cb.checked = false;
                    cb.dispatchEvent(new Event('change'));
                }
            });
        });
        // 关闭对话框
        const closeDialog = () => {
            document.body.removeChild(overlay);
        };
        closeBtn.addEventListener('click', closeDialog);
        cancelBtn.addEventListener('click', closeDialog);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay)
                closeDialog();
        });
        // 确认选择
        confirmBtn.addEventListener('click', () => {
            // 更新选中计数显示
            const selectedCountElement = this.getCountElement(itemId, 'selectedCount');
            if (selectedCountElement) {
                selectedCountElement.textContent = moveItem.selectedImages.length.toString();
                console.log(`更新选中计数显示: ${moveItem.selectedImages.length}`);
            }
            else {
                console.error(`无法找到选中计数元素: ${itemId}_selectedCount`);
            }
            this.showStatus(itemId, `已选中 ${moveItem.selectedImages.length} 个图片`, 'success');
            closeDialog();
        });
        // 添加到页面
        document.body.appendChild(overlay);
        console.log(`显示选择预览窗口: ${matchedImages.length} 个匹配项, 当前已选中 ${moveItem.selectedImages.length} 个`);
    }
    /**
     * 显示简单的预览窗口，支持点击打开资源
     */
    static showSimplePreview(itemId, itemName, matchedImages, regex) {
        var _a, _b;
        if (matchedImages.length === 0) {
            this.showStatus(itemId, '没有找到匹配的图片', 'info');
            return;
        }
        // 创建预览窗口
        const overlay = document.createElement('div');
        overlay.className = 'simple-preview-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.7);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
        `;
        const dialog = document.createElement('div');
        dialog.className = 'simple-preview-dialog';
        dialog.style.cssText = `
            background: #2d2d30;
            color: #cccccc;
            border-radius: 8px;
            max-width: 80%;
            max-height: 80%;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        `;
        // 创建头部
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 15px 20px;
            border-bottom: 1px solid #555;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        header.innerHTML = `
            <div>
                <h3 style="margin:0; color:#fff;">预览匹配结果 - ${itemName}</h3>
                <p style="margin:5px 0 0 0; color:#999; font-size:12px;">正则: ${regex} | 共 ${matchedImages.length} 个文件</p>
            </div>
            <button id="closePreview" style="background:none; border:none; color:#fff; font-size:24px; cursor:pointer;">&times;</button>
        `;
        // 创建内容区域
        const content = document.createElement('div');
        content.style.cssText = `
            flex: 1;
            overflow-y: auto;
            padding: 15px 20px;
            max-height: 400px;
        `;
        // 添加图片列表（限制显示前100个）
        const displayImages = matchedImages.slice(0, 100);
        displayImages.forEach((imagePath, index) => {
            const item = document.createElement('div');
            item.style.cssText = `
                padding: 8px 12px;
                margin: 2px 0;
                background: rgba(255,255,255,0.05);
                border-radius: 4px;
                cursor: pointer;
                border-left: 3px solid #007acc;
                transition: all 0.2s;
                font-family: monospace;
                font-size: 13px;
            `;
            item.innerHTML = `<span style="color:#569cd6;">${index + 1}.</span> ${imagePath}`;
            // 添加悬停效果
            item.addEventListener('mouseenter', () => {
                item.style.background = 'rgba(0,122,204,0.2)';
                item.style.borderLeftColor = '#00ff88';
            });
            item.addEventListener('mouseleave', () => {
                item.style.background = 'rgba(255,255,255,0.05)';
                item.style.borderLeftColor = '#007acc';
            });
            // 添加点击事件
            item.addEventListener('click', () => {
                var _a, _b;
                console.log(`点击打开资源: ${imagePath}`);
                this.openAssetInEditor(imagePath);
                // 添加点击反馈 - 改变边框颜色表示已点击
                item.style.borderLeftColor = '#28a745';
                item.style.background = 'rgba(40,167,69,0.1)';
                // 在项目前添加勾选标记
                const firstSpan = item.querySelector('span');
                if (firstSpan && !((_a = firstSpan.textContent) === null || _a === void 0 ? void 0 : _a.includes('✓'))) {
                    firstSpan.textContent = (_b = firstSpan.textContent) === null || _b === void 0 ? void 0 : _b.replace(/^\d+\./, (match) => `✓ ${match}`);
                }
                // 不再自动关闭预览窗口，用户可以连续点击多个文件
                // document.body.removeChild(overlay);
            });
            content.appendChild(item);
        });
        // 如果有更多文件，显示提示
        if (matchedImages.length > 100) {
            const moreInfo = document.createElement('div');
            moreInfo.style.cssText = `
                padding: 10px;
                text-align: center;
                color: #999;
                font-style: italic;
                border-top: 1px solid #555;
            `;
            moreInfo.textContent = `... 还有 ${matchedImages.length - 100} 个文件未显示`;
            content.appendChild(moreInfo);
        }
        // 创建底部
        const footer = document.createElement('div');
        footer.style.cssText = `
            padding: 15px 20px;
            border-top: 1px solid #555;
            text-align: right;
        `;
        footer.innerHTML = `
            <button id="closePreviewBtn" style="
                padding: 8px 16px;
                background: #555;
                color: #fff;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            ">关闭</button>
        `;
        // 组装对话框
        dialog.appendChild(header);
        dialog.appendChild(content);
        dialog.appendChild(footer);
        overlay.appendChild(dialog);
        // 绑定关闭事件
        const closePreview = () => document.body.removeChild(overlay);
        (_a = header.querySelector('#closePreview')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', closePreview);
        (_b = footer.querySelector('#closePreviewBtn')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', closePreview);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay)
                closePreview();
        });
        // 添加到页面
        document.body.appendChild(overlay);
        console.log(`显示简单预览窗口: ${matchedImages.length} 个匹配项`);
    }
    /**
     * 选择匹配项 - 显示选择对话框让用户勾选
     */
    static selectMatches(itemId) {
        const moveItem = _dynamicMoveItems.find(item => item.id === itemId);
        if (!moveItem)
            return;
        // 先更新匹配计数
        this.updateMatchCount(itemId);
        // 等待 DOM 更新后再显示对话框
        setTimeout(() => {
            if (moveItem.matchedImages.length === 0) {
                this.showStatus(itemId, '没有找到匹配的图片', 'info');
                return;
            }
            // 使用预览窗口样式显示选择对话框
            this.showSelectionPreview(itemId, moveItem.name, moveItem.matchedImages, moveItem.regex, moveItem);
        }, 100);
    }
    /**
     * 预览选中的图片
     */
    static previewSelected(itemId) {
        const moveItem = _dynamicMoveItems.find(item => item.id === itemId);
        if (!moveItem || moveItem.selectedImages.length === 0) {
            this.showStatus(itemId, '没有选中的图片', 'info');
            return;
        }
        // 使用简单预览窗口显示选中的图片
        this.showSimplePreview(itemId, `${moveItem.name} - 选中项`, moveItem.selectedImages, `选中了 ${moveItem.selectedImages.length} 个文件`);
    }
    /**
     * 移动选中的图片
     */
    static async moveSelected(itemId) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        const moveItem = _dynamicMoveItems.find(item => item.id === itemId);
        if (!moveItem || moveItem.selectedImages.length === 0) {
            this.showStatus(itemId, '没有选中的图片可移动', 'error');
            return;
        }
        if (!moveItem.targetDir.trim()) {
            this.showStatus(itemId, '请设置目标目录', 'error');
            return;
        }
        try {
            this.showStatus(itemId, `正在移动 ${moveItem.selectedImages.length} 个图片...`, 'info');
            let movedCount = 0;
            let errorCount = 0;
            const errors = [];
            console.log('准备直接移动文件，不使用复杂的主进程方法');
            console.log('要移动的图片:', moveItem.selectedImages);
            // 确保目标目录存在
            const targetDirPath = moveItem.targetDir.endsWith('/') ? moveItem.targetDir.slice(0, -1) : moveItem.targetDir;
            const targetDbPath = `db://assets/${targetDirPath}`;
            try {
                // 检查目标目录是否存在
                const dirExists = await ((_b = (_a = window.Editor) === null || _a === void 0 ? void 0 : _a.Message) === null || _b === void 0 ? void 0 : _b.request('asset-db', 'query-asset-info', targetDbPath));
                if (!dirExists) {
                    console.log(`目标目录不存在，尝试创建: ${targetDirPath}`);
                    // 如果目录不存在，尝试创建（这里可能需要逐级创建）
                    const fs = require('fs');
                    const path = require('path');
                    const assetsPath = path.join(((_d = (_c = window.Editor) === null || _c === void 0 ? void 0 : _c.Project) === null || _d === void 0 ? void 0 : _d.path) || '', 'assets');
                    const fullTargetPath = path.join(assetsPath, targetDirPath);
                    if (!fs.existsSync(fullTargetPath)) {
                        fs.mkdirSync(fullTargetPath, { recursive: true });
                        console.log(`成功创建目录: ${targetDirPath}`);
                        // 刷新资源数据库以识别新创建的目录
                        await ((_f = (_e = window.Editor) === null || _e === void 0 ? void 0 : _e.Message) === null || _f === void 0 ? void 0 : _f.send('asset-db', 'refresh-asset', targetDbPath));
                    }
                }
            }
            catch (dirError) {
                console.warn('检查/创建目录时出错:', dirError);
                // 继续执行，让移动操作自己处理目录创建
            }
            // 直接使用 asset-db API 移动每个文件
            for (let i = 0; i < moveItem.selectedImages.length; i++) {
                const imagePath = moveItem.selectedImages[i];
                const fileName = basename(imagePath);
                const src = `db://assets/${imagePath}`;
                const dest = `db://assets/${moveItem.targetDir}${fileName}`;
                console.log(`[${i + 1}/${moveItem.selectedImages.length}] 移动: ${fileName}`);
                console.log(`从: ${src}`);
                console.log(`到: ${dest}`);
                try {
                    // 构建移动选项 - 启用自动重命名避免冲突
                    const moveOptions = { rename: true };
                    // 直接调用 asset-db 的 move-asset API
                    const result = await ((_h = (_g = window.Editor) === null || _g === void 0 ? void 0 : _g.Message) === null || _h === void 0 ? void 0 : _h.request('asset-db', 'move-asset', src, dest, moveOptions));
                    console.log(`[${i + 1}/${moveItem.selectedImages.length}] 移动成功: ${fileName}`, result);
                    movedCount++;
                }
                catch (error) {
                    console.error(`[${i + 1}/${moveItem.selectedImages.length}] 移动失败: ${fileName}`, error);
                    errorCount++;
                    errors.push(`移动失败: ${fileName} - ${error.message}`);
                }
            }
            // 显示移动结果
            if (errorCount === 0) {
                this.showStatus(itemId, `移动完成: 成功移动 ${movedCount} 个图片`, 'success');
            }
            else {
                this.showStatus(itemId, `移动完成: 成功 ${movedCount} 个，失败 ${errorCount} 个`, 'error');
                console.error('移动错误详情:', errors);
            }
            // 移动完成后刷新资源数据库
            try {
                await ((_k = (_j = window.Editor) === null || _j === void 0 ? void 0 : _j.Message) === null || _k === void 0 ? void 0 : _k.send('asset-db', 'refresh-asset', 'db://assets'));
                console.log('资源数据库刷新完成');
            }
            catch (refreshError) {
                console.warn('刷新资源数据库失败:', refreshError);
            }
            // 清空选中列表
            moveItem.selectedImages = [];
            // 重置选中计数显示
            const selectedCountElement = this.getCountElement(itemId, 'selectedCount');
            if (selectedCountElement) {
                selectedCountElement.textContent = '0';
                console.log(`重置选中计数显示为 0`);
            }
            else {
                console.error(`无法找到选中计数元素进行重置: ${itemId}_selectedCount`);
            }
        }
        catch (error) {
            console.error(`移动图片失败 (${itemId}):`, error);
            this.showStatus(itemId, `移动失败: ${error.message}`, 'error');
        }
    }
    /**
     * 显示状态消息
     */
    static showStatus(itemId, message, type) {
        const statusElement = this.getElement(`${itemId}_status`);
        if (!statusElement) {
            console.warn(`无法找到状态元素: ${itemId}_status`);
            return;
        }
        statusElement.textContent = message;
        statusElement.className = `move-item-status ${type}`;
        statusElement.style.display = 'block';
        // 3秒后自动隐藏状态消息
        setTimeout(() => {
            statusElement.style.display = 'none';
        }, 3000);
    }
    /**
     * 预览所有选中项
     */
    static previewAllSelected() {
        var _a, _b;
        const allSelected = _dynamicMoveItems.reduce((acc, item) => {
            if (item.selectedImages.length > 0) {
                acc.push({
                    name: item.name,
                    targetDir: item.targetDir,
                    images: item.selectedImages
                });
            }
            return acc;
        }, []);
        if (allSelected.length === 0) {
            (_b = (_a = window.Editor) === null || _a === void 0 ? void 0 : _a.Dialog) === null || _b === void 0 ? void 0 : _b.info('没有选中的图片', { title: '预览所有选中项' });
            return;
        }
        const totalCount = allSelected.reduce((sum, item) => sum + item.images.length, 0);
        // 使用简单的预览窗口
        this.showAllSelectedPreview(allSelected, totalCount);
    }
    /**
     * 显示所有选中项的简单预览窗口
     */
    static showAllSelectedPreview(allSelected, totalCount) {
        var _a, _b;
        // 创建预览窗口
        const overlay = document.createElement('div');
        overlay.className = 'simple-preview-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.7);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
        `;
        const dialog = document.createElement('div');
        dialog.className = 'simple-preview-dialog';
        dialog.style.cssText = `
            background: #2d2d30;
            color: #cccccc;
            border-radius: 8px;
            max-width: 85%;
            max-height: 85%;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        `;
        // 创建头部
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 15px 20px;
            border-bottom: 1px solid #555;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        header.innerHTML = `
            <div>
                <h3 style="margin:0; color:#fff;">预览所有选中项</h3>
                <p style="margin:5px 0 0 0; color:#999; font-size:12px;">共 ${allSelected.length} 个移动项 | 总计 ${totalCount} 个文件</p>
            </div>
            <button id="closeAllPreview" style="background:none; border:none; color:#fff; font-size:24px; cursor:pointer;">&times;</button>
        `;
        // 创建内容区域
        const content = document.createElement('div');
        content.style.cssText = `
            flex: 1;
            overflow-y: auto;
            padding: 15px 20px;
            max-height: 500px;
        `;
        // 为每个移动项创建分组显示
        allSelected.forEach((item, groupIndex) => {
            // 创建组标题
            const groupHeader = document.createElement('div');
            groupHeader.style.cssText = `
                background: rgba(0,122,204,0.15);
                padding: 10px 15px;
                margin: ${groupIndex > 0 ? '20px' : '0'} 0 10px 0;
                border-radius: 6px;
                border-left: 4px solid #007acc;
            `;
            groupHeader.innerHTML = `
                <strong style="color:#fff;">${item.name}</strong>
                <span style="color:#999; font-size:12px; margin-left:10px;">(${item.images.length} 个文件)</span>
                <div style="color:#ccc; font-size:11px; margin-top:5px;">目标: ${item.targetDir}</div>
            `;
            content.appendChild(groupHeader);
            // 创建文件列表
            const fileList = document.createElement('div');
            fileList.style.cssText = `
                margin-left: 20px;
                margin-bottom: 10px;
            `;
            // 显示前20个文件
            const displayImages = item.images.slice(0, 20);
            displayImages.forEach((imagePath, index) => {
                const fileItem = document.createElement('div');
                fileItem.style.cssText = `
                    padding: 6px 10px;
                    margin: 1px 0;
                    background: rgba(255,255,255,0.03);
                    border-radius: 3px;
                    cursor: pointer;
                    border-left: 2px solid #28a745;
                    transition: all 0.2s;
                    font-family: monospace;
                    font-size: 12px;
                `;
                const fileName = imagePath.split('/').pop() || imagePath;
                const targetPath = item.targetDir + fileName;
                fileItem.innerHTML = `
                    <span style="color:#569cd6;">${index + 1}.</span> 
                    <span style="color:#fff;">${fileName}</span>
                    <span style="color:#999; font-size:10px; margin-left:10px;">→ ${targetPath}</span>
                `;
                // 添加悬停效果
                fileItem.addEventListener('mouseenter', () => {
                    fileItem.style.background = 'rgba(40,167,69,0.2)';
                    fileItem.style.borderLeftColor = '#00ff88';
                });
                fileItem.addEventListener('mouseleave', () => {
                    fileItem.style.background = 'rgba(255,255,255,0.03)';
                    fileItem.style.borderLeftColor = '#28a745';
                });
                // 添加点击事件
                fileItem.addEventListener('click', () => {
                    var _a, _b;
                    console.log(`点击打开资源: ${imagePath}`);
                    this.openAssetInEditor(imagePath);
                    // 添加点击反馈 - 改变边框颜色和背景色表示已点击
                    fileItem.style.borderLeftColor = '#ffc107';
                    fileItem.style.background = 'rgba(255,193,7,0.1)';
                    // 在序号前添加勾选标记
                    const firstSpan = fileItem.querySelector('span');
                    if (firstSpan && !((_a = firstSpan.textContent) === null || _a === void 0 ? void 0 : _a.includes('✓'))) {
                        firstSpan.textContent = (_b = firstSpan.textContent) === null || _b === void 0 ? void 0 : _b.replace(/^\d+\./, (match) => `✓ ${match}`);
                    }
                    // 不再自动关闭预览窗口，用户可以连续点击多个文件
                    // document.body.removeChild(overlay);
                });
                fileList.appendChild(fileItem);
            });
            // 如果有更多文件，显示提示
            if (item.images.length > 20) {
                const moreInfo = document.createElement('div');
                moreInfo.style.cssText = `
                    padding: 8px 10px;
                    text-align: center;
                    color: #999;
                    font-style: italic;
                    font-size: 11px;
                    border-top: 1px dashed #555;
                    margin-top: 5px;
                `;
                moreInfo.textContent = `... 还有 ${item.images.length - 20} 个文件`;
                fileList.appendChild(moreInfo);
            }
            content.appendChild(fileList);
        });
        // 创建底部
        const footer = document.createElement('div');
        footer.style.cssText = `
            padding: 15px 20px;
            border-top: 1px solid #555;
            text-align: right;
        `;
        footer.innerHTML = `
            <button id="closeAllPreviewBtn" style="
                padding: 8px 16px;
                background: #555;
                color: #fff;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            ">关闭</button>
        `;
        // 组装对话框
        dialog.appendChild(header);
        dialog.appendChild(content);
        dialog.appendChild(footer);
        overlay.appendChild(dialog);
        // 绑定关闭事件
        const closePreview = () => document.body.removeChild(overlay);
        (_a = header.querySelector('#closeAllPreview')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', closePreview);
        (_b = footer.querySelector('#closeAllPreviewBtn')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', closePreview);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay)
                closePreview();
        });
        // 添加到页面
        document.body.appendChild(overlay);
        console.log(`显示所有选中项预览窗口: ${allSelected.length} 个移动项，共 ${totalCount} 个文件`);
    }
    /**
     * 移动所有选中项
     */
    static async moveAllSelected() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const allSelected = _dynamicMoveItems.filter(item => item.selectedImages.length > 0);
        if (allSelected.length === 0) {
            (_b = (_a = window.Editor) === null || _a === void 0 ? void 0 : _a.Dialog) === null || _b === void 0 ? void 0 : _b.error('没有选中的图片可移动', { title: '移动所有选中项' });
            return;
        }
        // 检查目标目录是否都已设置
        const missingTargetDir = allSelected.filter(item => !item.targetDir.trim());
        if (missingTargetDir.length > 0) {
            (_d = (_c = window.Editor) === null || _c === void 0 ? void 0 : _c.Dialog) === null || _d === void 0 ? void 0 : _d.error(`以下移动项未设置目标目录: ${missingTargetDir.map(item => item.name).join(', ')}`, { title: '移动失败' });
            return;
        }
        try {
            console.log('开始移动所有选中项...');
            for (const moveItem of allSelected) {
                console.log(`正在移动 ${moveItem.name}...`);
                await this.moveSelected(moveItem.id);
            }
            (_f = (_e = window.Editor) === null || _e === void 0 ? void 0 : _e.Dialog) === null || _f === void 0 ? void 0 : _f.info(`所有移动项处理完成`, { title: '移动完成' });
        }
        catch (error) {
            console.error('移动所有选中项失败:', error);
            (_h = (_g = window.Editor) === null || _g === void 0 ? void 0 : _g.Dialog) === null || _h === void 0 ? void 0 : _h.error(`移动失败: ${error.message}`, { title: '错误' });
        }
    }
    /**
     * 获取所有移动项数据
     */
    static getMoveItems() {
        return _dynamicMoveItems;
    }
    /**
     * 清空所有移动项
     */
    static clearAllMoveItems() {
        _dynamicMoveItems.forEach(item => {
            const element = this.getElement(item.id);
            if (element) {
                element.remove();
            }
        });
        _dynamicMoveItems = [];
        _moveItemCounter = 0;
    }
}
exports.Panel4Manager = Panel4Manager;
// #endregion
// #region CSS 样式定义
exports.panel4Styles = `
/* 动态移动项样式 */
.move-item {
    border: 1px solid #444;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 15px;
    background-color: rgba(255, 255, 255, 0.05);
    position: relative;
}

.move-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #666;
}

.move-item-title {
    font-weight: bold;
    color: #007acc;
    font-size: 16px;
}

.move-item-remove {
    background-color: #dc3545;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
}

.move-item-remove:hover {
    background-color: #c82333;
}

.move-item-config {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    margin-bottom: 15px;
}

.config-group {
    display: flex;
    flex-direction: column;
}

.config-group label {
    margin-bottom: 5px;
    color: #ccc;
    font-size: 14px;
}

.config-group input[type="text"] {
    padding: 8px;
    border: 1px solid #666;
    border-radius: 4px;
    background-color: #333;
    color: white;
    font-family: monospace;
}

.config-group input[type="text"]:focus {
    outline: none;
    border-color: #007acc;
    box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2);
}

.move-item-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.move-item-actions button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
}

.btn-preview {
    background-color: #17a2b8;
    color: white;
}

.btn-preview:hover {
    background-color: #138496;
}

.btn-select {
    background-color: #ffc107;
    color: #212529;
}

.btn-select:hover {
    background-color: #e0a800;
}

.btn-move {
    background-color: #28a745;
    color: white;
}

.btn-move:hover {
    background-color: #218838;
}

.move-item-status {
    margin-top: 10px;
    padding: 8px;
    border-radius: 4px;
    font-size: 12px;
    display: none;
}

.move-item-status.info {
    background-color: rgba(23, 162, 184, 0.1);
    border: 1px solid #17a2b8;
    color: #17a2b8;
}

.move-item-status.success {
    background-color: rgba(40, 167, 69, 0.1);
    border: 1px solid #28a745;
    color: #28a745;
}

.move-item-status.error {
    background-color: rgba(220, 53, 69, 0.1);
    border: 1px solid #dc3545;
    color: #dc3545;
}

/* 图片选择对话框样式 */
.selection-dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 10000;
    display: flex;
    justify-content: center;
    align-items: center;
}

.selection-dialog {
    background: white;
    padding: 20px;
    border-radius: 8px;
    max-width: 80%;
    max-height: 80%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.selection-dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
}

.selection-dialog-content {
    flex: 1;
    overflow: hidden;
}

.selection-dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid #eee;
}

.image-checkbox-item {
    margin: 5px 0;
    padding: 5px;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.image-checkbox-item:hover {
    background-color: #f5f5f5;
}

.image-checkbox-label {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: 12px;
}

.image-checkbox-input {
    margin-right: 10px;
    transform: scale(1.2);
}

.image-path-text {
    font-family: monospace;
    word-break: break-all;
}
`;
