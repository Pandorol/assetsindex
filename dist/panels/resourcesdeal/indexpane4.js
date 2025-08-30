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
    static init(elements, dataCache) {
        _panel4Elements = {
            addMoveItemBtn: elements.addMoveItemBtn,
            moveItemsContainer: elements.moveItemsContainer,
            previewAllSelectedBtn: elements.previewAllSelectedBtn,
            moveAllSelectedBtn: elements.moveAllSelectedBtn
        };
        _dataCache = dataCache;
        this.bindEvents();
        console.log('Panel4 动态移动功能初始化完成');
    }
    /**
     * 更新数据缓存
     */
    static updateDataCache(dataCache) {
        _dataCache = dataCache;
    }
    /**
     * 绑定事件
     */
    static bindEvents() {
        var _a, _b, _c;
        (_a = _panel4Elements.addMoveItemBtn) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
            this.addMoveItem();
        });
        (_b = _panel4Elements.previewAllSelectedBtn) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => {
            this.previewAllSelected();
        });
        (_c = _panel4Elements.moveAllSelectedBtn) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => {
            this.moveAllSelected();
        });
    }
    /**
     * 添加新的移动项
     */
    static addMoveItem() {
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
        this.renderMoveItem(moveItem);
    }
    /**
     * 渲染移动项UI
     */
    static renderMoveItem(moveItem) {
        const container = _panel4Elements.moveItemsContainer;
        if (!container)
            return;
        const itemElement = document.createElement('div');
        itemElement.className = 'move-item';
        itemElement.id = moveItem.id;
        itemElement.innerHTML = `
            <div class="move-item-header">
                <span class="move-item-title">${moveItem.name}</span>
                <button class="move-item-remove" data-item-id="${moveItem.id}">✕ 删除</button>
            </div>
            
            <div class="move-item-config">
                <div class="config-group">
                    <label>正则表达式:</label>
                    <input type="text" id="${moveItem.id}_regex" value="${moveItem.regex}" 
                           placeholder="例如: .*\\.png$" />
                </div>
                <div class="config-group">
                    <label>目标目录:</label>
                    <input type="text" id="${moveItem.id}_targetDir" value="${moveItem.targetDir}" 
                           placeholder="例如: staticRes/ui/common/" />
                </div>
            </div>
            
            <div class="move-item-actions">
                <button class="btn-preview" data-action="preview" data-item-id="${moveItem.id}">
                    🔍 预览匹配 (<span id="${moveItem.id}_matchCount">0</span>)
                </button>
                <button class="btn-select" data-action="select" data-item-id="${moveItem.id}">
                    ☑️ 选择匹配项
                </button>
                <button class="btn-preview" data-action="previewSelected" data-item-id="${moveItem.id}">
                    📋 预览选中 (<span id="${moveItem.id}_selectedCount">0</span>)
                </button>
                <button class="btn-move" data-action="move" data-item-id="${moveItem.id}">
                    🚀 移动选中项
                </button>
            </div>
            
            <div class="move-item-status" id="${moveItem.id}_status"></div>
        `;
        container.appendChild(itemElement);
        // 绑定输入事件
        const regexInput = document.getElementById(`${moveItem.id}_regex`);
        const targetDirInput = document.getElementById(`${moveItem.id}_targetDir`);
        regexInput === null || regexInput === void 0 ? void 0 : regexInput.addEventListener('input', () => {
            moveItem.regex = regexInput.value;
            this.updateMatchCount(moveItem.id);
        });
        targetDirInput === null || targetDirInput === void 0 ? void 0 : targetDirInput.addEventListener('input', () => {
            moveItem.targetDir = targetDirInput.value;
        });
        // 绑定按钮事件
        itemElement.addEventListener('click', (e) => {
            const target = e.target;
            const action = target.getAttribute('data-action');
            const itemId = target.getAttribute('data-item-id');
            if (!itemId)
                return;
            switch (action) {
                case 'preview':
                    this.previewMatches(itemId);
                    break;
                case 'select':
                    this.selectMatches(itemId);
                    break;
                case 'previewSelected':
                    this.previewSelected(itemId);
                    break;
                case 'move':
                    this.moveSelected(itemId);
                    break;
            }
        });
        // 绑定删除按钮事件
        const removeBtn = itemElement.querySelector('.move-item-remove');
        removeBtn === null || removeBtn === void 0 ? void 0 : removeBtn.addEventListener('click', () => {
            this.removeMoveItem(moveItem.id);
        });
    }
    /**
     * 删除移动项
     */
    static removeMoveItem(itemId) {
        const index = _dynamicMoveItems.findIndex(item => item.id === itemId);
        if (index !== -1) {
            _dynamicMoveItems.splice(index, 1);
        }
        const element = document.getElementById(itemId);
        if (element) {
            element.remove();
        }
    }
    /**
     * 更新匹配数量显示
     */
    static updateMatchCount(itemId) {
        const moveItem = _dynamicMoveItems.find(item => item.id === itemId);
        if (!moveItem || !moveItem.regex)
            return;
        try {
            const regex = new RegExp(moveItem.regex);
            const allImages = this.getAllImagePaths();
            moveItem.matchedImages = allImages.filter(imagePath => regex.test(imagePath));
            const countElement = document.getElementById(`${itemId}_matchCount`);
            if (countElement) {
                countElement.textContent = moveItem.matchedImages.length.toString();
            }
        }
        catch (error) {
            console.warn(`正则表达式错误 (${itemId}):`, error.message);
            const countElement = document.getElementById(`${itemId}_matchCount`);
            if (countElement) {
                countElement.textContent = '错误';
            }
        }
    }
    /**
     * 获取所有图片路径
     */
    static getAllImagePaths() {
        if (!_dataCache || !_dataCache.path2info)
            return [];
        return Object.keys(_dataCache.path2info);
    }
    /**
     * 预览匹配的图片
     */
    static previewMatches(itemId) {
        var _a, _b;
        const moveItem = _dynamicMoveItems.find(item => item.id === itemId);
        if (!moveItem)
            return;
        this.updateMatchCount(itemId);
        if (moveItem.matchedImages.length === 0) {
            this.showStatus(itemId, '没有找到匹配的图片', 'info');
            return;
        }
        // 创建预览内容
        const previewContent = moveItem.matchedImages.slice(0, 100).map((imagePath, index) => `${index + 1}. ${imagePath}`).join('\n');
        const message = `匹配到 ${moveItem.matchedImages.length} 个图片${moveItem.matchedImages.length > 100 ? ' (仅显示前100个)' : ''}:\n\n${previewContent}`;
        // 使用 Editor.Dialog 显示结果
        (_b = (_a = window.Editor) === null || _a === void 0 ? void 0 : _a.Dialog) === null || _b === void 0 ? void 0 : _b.info(message, {
            title: `预览匹配结果 - ${moveItem.name}`
        });
    }
    /**
     * 选择匹配项
     */
    static selectMatches(itemId) {
        const moveItem = _dynamicMoveItems.find(item => item.id === itemId);
        if (!moveItem)
            return;
        this.updateMatchCount(itemId);
        if (moveItem.matchedImages.length === 0) {
            this.showStatus(itemId, '没有找到匹配的图片', 'info');
            return;
        }
        moveItem.selectedImages = [...moveItem.matchedImages];
        const selectedCountElement = document.getElementById(`${itemId}_selectedCount`);
        if (selectedCountElement) {
            selectedCountElement.textContent = moveItem.selectedImages.length.toString();
        }
        this.showStatus(itemId, `已选中 ${moveItem.selectedImages.length} 个图片`, 'success');
    }
    /**
     * 预览选中的图片
     */
    static previewSelected(itemId) {
        var _a, _b;
        const moveItem = _dynamicMoveItems.find(item => item.id === itemId);
        if (!moveItem || moveItem.selectedImages.length === 0) {
            this.showStatus(itemId, '没有选中的图片', 'info');
            return;
        }
        const previewContent = moveItem.selectedImages.slice(0, 100).map((imagePath, index) => `${index + 1}. ${imagePath} → ${moveItem.targetDir}${basename(imagePath)}`).join('\n');
        const message = `选中 ${moveItem.selectedImages.length} 个图片${moveItem.selectedImages.length > 100 ? ' (仅显示前100个)' : ''}:\n\n${previewContent}`;
        (_b = (_a = window.Editor) === null || _a === void 0 ? void 0 : _a.Dialog) === null || _b === void 0 ? void 0 : _b.info(message, {
            title: `预览选中项 - ${moveItem.name}`
        });
    }
    /**
     * 移动选中的图片
     */
    static async moveSelected(itemId) {
        var _a, _b;
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
            // 构建移动操作数据
            const moveOperations = moveItem.selectedImages.map(imagePath => ({
                src: `db://assets/${imagePath}`,
                dest: `db://assets/${moveItem.targetDir}${basename(imagePath)}`,
                targetDir: moveItem.targetDir,
                imgPath: imagePath
            }));
            // 调用主进程的移动功能
            const result = await ((_b = (_a = window.Editor) === null || _a === void 0 ? void 0 : _a.Message) === null || _b === void 0 ? void 0 : _b.request('assetsindex', 'handle-dynamic-message', {
                method: 'moveBgImages',
                spriteFrameMaps_name: _dataCache.spriteFrameMaps_name,
                path2info: _dataCache.path2info,
                operations: moveOperations,
                autoRename: true,
                preLook: false
            }));
            this.showStatus(itemId, `移动完成: 成功 ${result.movedCount} 个，失败 ${result.errorCount} 个`, 'success');
            // 清空选中列表
            moveItem.selectedImages = [];
            const selectedCountElement = document.getElementById(`${itemId}_selectedCount`);
            if (selectedCountElement) {
                selectedCountElement.textContent = '0';
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
        const statusElement = document.getElementById(`${itemId}_status`);
        if (!statusElement)
            return;
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
        var _a, _b, _c, _d;
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
        const previewContent = allSelected.map(item => `【${item.name}】 → ${item.targetDir}\n` +
            item.images.slice(0, 10).map(img => `  - ${img}`).join('\n') +
            (item.images.length > 10 ? `\n  ... 还有 ${item.images.length - 10} 个` : '')).join('\n\n');
        const totalCount = allSelected.reduce((sum, item) => sum + item.images.length, 0);
        (_d = (_c = window.Editor) === null || _c === void 0 ? void 0 : _c.Dialog) === null || _d === void 0 ? void 0 : _d.info(`总共选中 ${totalCount} 个图片，分布在 ${allSelected.length} 个移动项中:\n\n${previewContent}`, {
            title: '预览所有选中项'
        });
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
            const element = document.getElementById(item.id);
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
`;
