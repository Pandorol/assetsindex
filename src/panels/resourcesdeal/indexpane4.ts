/**
 * Panel4 动态移动功能模块
 * 负责处理动态添加移动项、正则匹配、预览和移动操作
 */

// #region 类型定义
interface MoveItem {
    id: string;
    name: string;
    regex: string;
    targetDir: string;
    matchedImages: string[];
    selectedImages: string[];
}

interface Panel4Elements {
    addMoveItemBtn: HTMLButtonElement;
    moveItemsContainer: HTMLDivElement;
    previewAllSelectedBtn: HTMLButtonElement;
    moveAllSelectedBtn: HTMLButtonElement;
}
// #endregion

// #region 全局变量
let _dynamicMoveItems: MoveItem[] = [];
let _moveItemCounter = 0;
let _panel4Elements: Partial<Panel4Elements> = {};
let _dataCache: any = null; // 存储主数据缓存的引用
// #endregion

// #region 工具函数
function formatSize(bytes: number): string {
    if (bytes >= 1024 * 1024) {
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    } else {
        return (bytes / 1024).toFixed(2) + ' KB';
    }
}

function basename(path: string): string {
    return path.split('/').pop() || path.split('\\').pop() || path;
}
// #endregion

// #region 核心功能类
export class Panel4Manager {
    /**
     * 初始化 Panel4 功能
     */
    static init(elements: any, dataCache: any) {
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
    static updateDataCache(dataCache: any) {
        _dataCache = dataCache;
    }

    /**
     * 绑定事件
     */
    static bindEvents() {
        _panel4Elements.addMoveItemBtn?.addEventListener('click', () => {
            this.addMoveItem();
        });

        _panel4Elements.previewAllSelectedBtn?.addEventListener('click', () => {
            this.previewAllSelected();
        });

        _panel4Elements.moveAllSelectedBtn?.addEventListener('click', () => {
            this.moveAllSelected();
        });
    }

    /**
     * 添加新的移动项
     */
    static addMoveItem() {
        _moveItemCounter++;
        const itemId = `moveItem_${_moveItemCounter}`;
        
        const moveItem: MoveItem = {
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
    static renderMoveItem(moveItem: MoveItem) {
        const container = _panel4Elements.moveItemsContainer;
        if (!container) return;

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
        const regexInput = document.getElementById(`${moveItem.id}_regex`) as HTMLInputElement;
        const targetDirInput = document.getElementById(`${moveItem.id}_targetDir`) as HTMLInputElement;
        
        regexInput?.addEventListener('input', () => {
            moveItem.regex = regexInput.value;
            this.updateMatchCount(moveItem.id);
        });
        
        targetDirInput?.addEventListener('input', () => {
            moveItem.targetDir = targetDirInput.value;
        });

        // 绑定按钮事件
        itemElement.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const action = target.getAttribute('data-action');
            const itemId = target.getAttribute('data-item-id');
            
            if (!itemId) return;
            
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
        const removeBtn = itemElement.querySelector('.move-item-remove') as HTMLButtonElement;
        removeBtn?.addEventListener('click', () => {
            this.removeMoveItem(moveItem.id);
        });
    }

    /**
     * 删除移动项
     */
    static removeMoveItem(itemId: string) {
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
    static updateMatchCount(itemId: string) {
        const moveItem = _dynamicMoveItems.find(item => item.id === itemId);
        if (!moveItem) {
            console.warn(`找不到移动项: ${itemId}`);
            return;
        }
        
        const countElement = document.getElementById(`${itemId}_matchCount`);
        
        if (!moveItem.regex.trim()) {
            if (countElement) {
                countElement.textContent = '0';
            }
            moveItem.matchedImages = [];
            return;
        }
        
        if (!_dataCache) {
            console.warn('数据缓存未初始化');
            if (countElement) {
                countElement.textContent = '未初始化';
            }
            return;
        }
        
        try {
            const regex = new RegExp(moveItem.regex);
            const allImages = this.getAllImagePaths();
            
            if (allImages.length === 0) {
                console.warn('没有可用的图片数据');
                if (countElement) {
                    countElement.textContent = '无数据';
                }
                return;
            }
            
            moveItem.matchedImages = allImages.filter(imagePath => regex.test(imagePath));
            
            if (countElement) {
                countElement.textContent = moveItem.matchedImages.length.toString();
            }
            
            console.log(`正则 "${moveItem.regex}" 匹配到 ${moveItem.matchedImages.length} 个图片`);
            
        } catch (error) {
            console.warn(`正则表达式错误 (${itemId}):`, (error as Error).message);
            if (countElement) {
                countElement.textContent = '正则错误';
                countElement.style.color = '#dc3545';
            }
            moveItem.matchedImages = [];
        }
    }

    /**
     * 获取所有图片路径
     */
    static getAllImagePaths(): string[] {
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
    static previewMatches(itemId: string) {
        const moveItem = _dynamicMoveItems.find(item => item.id === itemId);
        if (!moveItem) {
            console.warn(`找不到移动项: ${itemId}`);
            return;
        }
        
        if (!moveItem.regex.trim()) {
            this.showStatus(itemId, '请先输入正则表达式', 'error');
            return;
        }
        
        // 检查数据缓存
        if (!_dataCache) {
            this.showStatus(itemId, '数据缓存未初始化，请先构建基础数据', 'error');
            return;
        }
        
        try {
            this.updateMatchCount(itemId);
            
            if (moveItem.matchedImages.length === 0) {
                this.showStatus(itemId, '没有找到匹配的图片', 'info');
                return;
            }
            
            // 创建预览内容
            const previewContent = moveItem.matchedImages.slice(0, 100).map((imagePath, index) => 
                `${index + 1}. ${imagePath}`
            ).join('\n');
            
            const message = `匹配到 ${moveItem.matchedImages.length} 个图片${moveItem.matchedImages.length > 100 ? ' (仅显示前100个)' : ''}:\n\n${previewContent}`;
            
            // 使用 Editor.Dialog 显示结果
            (window as any).Editor?.Dialog?.info(message, { 
                title: `预览匹配结果 - ${moveItem.name}`
            });
            
        } catch (error) {
            console.error(`预览匹配失败 (${itemId}):`, error);
            this.showStatus(itemId, `预览失败: ${(error as Error).message}`, 'error');
        }
    }

    /**
     * 选择匹配项
     */
    static selectMatches(itemId: string) {
        const moveItem = _dynamicMoveItems.find(item => item.id === itemId);
        if (!moveItem) return;
        
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
    static previewSelected(itemId: string) {
        const moveItem = _dynamicMoveItems.find(item => item.id === itemId);
        if (!moveItem || moveItem.selectedImages.length === 0) {
            this.showStatus(itemId, '没有选中的图片', 'info');
            return;
        }
        
        const previewContent = moveItem.selectedImages.slice(0, 100).map((imagePath, index) => 
            `${index + 1}. ${imagePath} → ${moveItem.targetDir}${basename(imagePath)}`
        ).join('\n');
        
        const message = `选中 ${moveItem.selectedImages.length} 个图片${moveItem.selectedImages.length > 100 ? ' (仅显示前100个)' : ''}:\n\n${previewContent}`;
        
        (window as any).Editor?.Dialog?.info(message, { 
            title: `预览选中项 - ${moveItem.name}`
        });
    }

    /**
     * 移动选中的图片
     */
    static async moveSelected(itemId: string) {
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
            const result = await (window as any).Editor?.Message?.request('assetsindex', 'handle-dynamic-message', {
                method: 'moveBgImages',
                spriteFrameMaps_name: _dataCache.spriteFrameMaps_name,
                path2info: _dataCache.path2info,
                operations: moveOperations,
                autoRename: true,
                preLook: false
            });
            
            this.showStatus(itemId, `移动完成: 成功 ${result.movedCount} 个，失败 ${result.errorCount} 个`, 'success');
            
            // 清空选中列表
            moveItem.selectedImages = [];
            const selectedCountElement = document.getElementById(`${itemId}_selectedCount`);
            if (selectedCountElement) {
                selectedCountElement.textContent = '0';
            }
            
        } catch (error) {
            console.error(`移动图片失败 (${itemId}):`, error);
            this.showStatus(itemId, `移动失败: ${(error as Error).message}`, 'error');
        }
    }

    /**
     * 显示状态消息
     */
    static showStatus(itemId: string, message: string, type: 'info' | 'success' | 'error') {
        const statusElement = document.getElementById(`${itemId}_status`);
        if (!statusElement) return;
        
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
        const allSelected = _dynamicMoveItems.reduce((acc, item) => {
            if (item.selectedImages.length > 0) {
                acc.push({
                    name: item.name,
                    targetDir: item.targetDir,
                    images: item.selectedImages
                });
            }
            return acc;
        }, [] as Array<{name: string, targetDir: string, images: string[]}>);
        
        if (allSelected.length === 0) {
            (window as any).Editor?.Dialog?.info('没有选中的图片', { title: '预览所有选中项' });
            return;
        }
        
        const previewContent = allSelected.map(item => 
            `【${item.name}】 → ${item.targetDir}\n` +
            item.images.slice(0, 10).map(img => `  - ${img}`).join('\n') +
            (item.images.length > 10 ? `\n  ... 还有 ${item.images.length - 10} 个` : '')
        ).join('\n\n');
        
        const totalCount = allSelected.reduce((sum, item) => sum + item.images.length, 0);
        
        (window as any).Editor?.Dialog?.info(
            `总共选中 ${totalCount} 个图片，分布在 ${allSelected.length} 个移动项中:\n\n${previewContent}`,
            { 
                title: '预览所有选中项'
            }
        );
    }

    /**
     * 移动所有选中项
     */
    static async moveAllSelected() {
        const allSelected = _dynamicMoveItems.filter(item => item.selectedImages.length > 0);
        
        if (allSelected.length === 0) {
            (window as any).Editor?.Dialog?.error('没有选中的图片可移动', { title: '移动所有选中项' });
            return;
        }
        
        // 检查目标目录是否都已设置
        const missingTargetDir = allSelected.filter(item => !item.targetDir.trim());
        if (missingTargetDir.length > 0) {
            (window as any).Editor?.Dialog?.error(
                `以下移动项未设置目标目录: ${missingTargetDir.map(item => item.name).join(', ')}`,
                { title: '移动失败' }
            );
            return;
        }
        
        try {
            console.log('开始移动所有选中项...');
            
            for (const moveItem of allSelected) {
                console.log(`正在移动 ${moveItem.name}...`);
                await this.moveSelected(moveItem.id);
            }
            
            (window as any).Editor?.Dialog?.info(
                `所有移动项处理完成`,
                { title: '移动完成' }
            );
            
        } catch (error) {
            console.error('移动所有选中项失败:', error);
            (window as any).Editor?.Dialog?.error(`移动失败: ${(error as Error).message}`, { title: '错误' });
        }
    }

    /**
     * 获取所有移动项数据
     */
    static getMoveItems(): MoveItem[] {
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
// #endregion

// #region CSS 样式定义
export const panel4Styles = `
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
