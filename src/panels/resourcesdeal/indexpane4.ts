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
        
        // 不在这里绑定事件，由外部 index.ts 处理
        console.log('Panel4 动态移动功能初始化完成');
    }

    /**
     * 更新数据缓存
     */
    static updateDataCache(dataCache: any) {
        _dataCache = dataCache;
    }

    /**
     * 添加新的移动项
     */
    static addMoveItem() {
        console.log('addMoveItem 被调用');
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
        console.log(`添加了新的移动项: ${itemId}`, moveItem);
        console.log(`当前移动项总数: ${_dynamicMoveItems.length}`);
        this.renderMoveItem(moveItem);
    }

    /**
     * 渲染移动项UI
     */
    static renderMoveItem(moveItem: MoveItem) {
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
        
        // 使用 setTimeout 确保 DOM 更新完成后验证
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
                } else {
                    console.error(`元素添加失败！容器中也找不到 ID: ${cleanId}`);
                }
            } else {
                console.log(`元素成功添加到 DOM，ID: ${cleanId}`);
            }
        }, 0);
        
        // 绑定输入事件 - 使用容器上下文查找元素
        const doc = container.ownerDocument || document;
        const regexInput = doc.getElementById(`${cleanId}_regex`) as HTMLInputElement;
        const targetDirInput = doc.getElementById(`${cleanId}_targetDir`) as HTMLInputElement;
        
        regexInput?.addEventListener('input', () => {
            moveItem.regex = regexInput.value;
            this.updateMatchCount(moveItem.id);
        });
        
        targetDirInput?.addEventListener('input', () => {
            moveItem.targetDir = targetDirInput.value;
        });

        // 绑定按钮事件
        const previewBtn = itemElement.querySelector('[data-action="preview"]') as HTMLButtonElement;
        const selectBtn = itemElement.querySelector('[data-action="select"]') as HTMLButtonElement;
        const previewSelectedBtn = itemElement.querySelector('[data-action="previewSelected"]') as HTMLButtonElement;
        const moveBtn = itemElement.querySelector('[data-action="move"]') as HTMLButtonElement;

        previewBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`点击预览匹配按钮: ${moveItem.id}`);
            this.previewMatches(moveItem.id);
        });

        selectBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`点击选择匹配项按钮: ${moveItem.id}`);
            this.selectMatches(moveItem.id);
        });

        previewSelectedBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`点击预览选中按钮: ${moveItem.id}`);
            this.previewSelected(moveItem.id);
        });

        moveBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`点击移动选中项按钮: ${moveItem.id}`);
            this.moveSelected(moveItem.id);
        });

        // 绑定删除按钮事件
        const removeBtn = itemElement.querySelector('.move-item-remove') as HTMLButtonElement;
        console.log(`绑定删除按钮事件，按钮:`, removeBtn, `移动项: ${moveItem.id}`);
        
        removeBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`点击删除按钮: ${moveItem.id}`);
            console.log(`事件目标:`, e.target);
            console.log(`当前元素:`, e.currentTarget);
            
            // 确认删除操作
            if (confirm(`确定要删除"${moveItem.name}"吗？`)) {
                this.removeMoveItem(moveItem.id);
            } else {
                console.log(`用户取消删除操作: ${moveItem.id}`);
            }
        });
    }

    /**
     * 删除移动项
     */
    static removeMoveItem(itemId: string) {
        console.log(`removeMoveItem 被调用，删除项: ${itemId}`);
        console.log(`删除前移动项数量: ${_dynamicMoveItems.length}`);
        console.log(`当前移动项列表:`, _dynamicMoveItems.map(item => item.id));
        
        const index = _dynamicMoveItems.findIndex(item => item.id === itemId);
        console.log(`找到的索引位置: ${index}`);
        
        if (index !== -1) {
            _dynamicMoveItems.splice(index, 1);
            console.log(`已从数组中删除，删除后数量: ${_dynamicMoveItems.length}`);
        } else {
            console.warn(`在数组中找不到要删除的移动项: ${itemId}`);
        }
        
        // 在扩展环境中，优先使用容器上下文查找元素
        const container = _panel4Elements.moveItemsContainer;
        let element: HTMLElement | null = null;
        
        if (container) {
            const doc = container.ownerDocument || document;
            
            // 首先尝试在容器的文档上下文中查找
            element = doc.getElementById(itemId);
            console.log(`容器文档上下文查找结果 (getElementById):`, element);
            
            // 如果找不到，使用容器的 querySelector
            if (!element) {
                element = container.querySelector(`#${itemId}`) as HTMLElement;
                console.log(`容器 querySelector 查找结果:`, element);
            }
            
            // 如果还是找不到，遍历所有 .move-item 元素查找
            if (!element) {
                const allItems = container.querySelectorAll('.move-item');
                console.log(`容器中所有 .move-item 元素:`, allItems);
                
                allItems.forEach((item, index) => {
                    console.log(`第 ${index} 个元素 ID: "${item.id}"`);
                });
                
                element = Array.from(allItems).find(item => item.id === itemId) as HTMLElement;
                if (element) {
                    console.log(`通过遍历找到了目标元素:`, element);
                }
            }
        } else {
            // 如果容器不存在，退回到全局 document 查找
            console.warn('容器不存在，使用全局 document 查找...');
            element = document.getElementById(itemId);
        }
        
        if (element) {
            element.remove();
            console.log(`已删除元素: ${itemId}`);
        } else {
            console.warn(`在 DOM 中找不到要删除的元素: ${itemId}`);
            console.warn('尝试的查找方法都失败了');
        }
        
        console.log(`删除操作完成，当前移动项:`, _dynamicMoveItems.map(item => item.id));
    }

    /**
     * 更新匹配数量显示
     */
    static updateMatchCount(itemId: string) {
        console.log(`updateMatchCount 被调用，itemId: ${itemId}`);
        const moveItem = _dynamicMoveItems.find(item => item.id === itemId);
        if (!moveItem) {
            console.warn(`找不到移动项: ${itemId}`);
            return;
        }
        console.log(`找到移动项，当前正则: "${moveItem.regex}"`);
        
        // 使用容器上下文查找元素
        const container = _panel4Elements.moveItemsContainer;
        const doc = container?.ownerDocument || document;
        const countElement = doc.getElementById(`${itemId}_matchCount`);
        console.log(`查找计数元素结果:`, countElement);
        
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
            console.log(`updateMatchCount 完成，匹配图片数量: ${moveItem.matchedImages.length}`);
            
            if (moveItem.matchedImages.length === 0) {
                console.log(`没有匹配的图片，显示信息状态`);
                this.showStatus(itemId, '没有找到匹配的图片', 'info');
                return;
            }
            
            console.log(`开始创建预览内容`);
            // 创建预览内容
            const previewContent = moveItem.matchedImages.slice(0, 100).map((imagePath, index) => 
                `${index + 1}. ${imagePath}`
            ).join('\n');
            
            const message = `匹配到 ${moveItem.matchedImages.length} 个图片${moveItem.matchedImages.length > 100 ? ' (仅显示前100个)' : ''}:\n\n${previewContent}`;
            console.log(`准备显示对话框，消息长度: ${message.length}`);
            
            // 检查 Editor.Dialog 是否存在
            console.log(`检查 Editor.Dialog:`, (window as any).Editor?.Dialog);
            
            // 使用 Editor.Dialog 显示结果
            const result = (window as any).Editor?.Dialog?.info(message, { 
                title: `预览匹配结果 - ${moveItem.name}`
            });
            console.log(`Dialog.info 调用结果:`, result);
            
        } catch (error) {
            console.error(`预览匹配失败 (${itemId}):`, error);
            console.error(`错误堆栈:`, (error as Error).stack);
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
        
        // 使用容器上下文查找元素
        const container = _panel4Elements.moveItemsContainer;
        const doc = container?.ownerDocument || document;
        const selectedCountElement = doc.getElementById(`${itemId}_selectedCount`);
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
            
            // 使用容器上下文查找元素
            const container = _panel4Elements.moveItemsContainer;
            const doc = container?.ownerDocument || document;
            const selectedCountElement = doc.getElementById(`${itemId}_selectedCount`);
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
        // 使用容器上下文查找元素
        const container = _panel4Elements.moveItemsContainer;
        const doc = container?.ownerDocument || document;
        const statusElement = doc.getElementById(`${itemId}_status`);
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
            // 使用容器上下文查找元素
            const container = _panel4Elements.moveItemsContainer;
            if (container) {
                const doc = container.ownerDocument || document;
                const element = doc.getElementById(item.id) || container.querySelector(`#${item.id}`);
                if (element) {
                    element.remove();
                }
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
