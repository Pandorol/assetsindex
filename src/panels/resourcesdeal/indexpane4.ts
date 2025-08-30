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
let _panelInstance: any = null; // 存储 panel 实例引用
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
    static init(elements: any, dataCache: any, panelInstance?: any) {
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
        try {
            const configs = _dynamicMoveItems.map(item => ({
                name: item.name,
                regex: item.regex,
                targetDir: item.targetDir
            }));
            
            if (_panelInstance && typeof _panelInstance === 'object') {
                // 使用 Editor.Profile 保存配置
                (window as any).Editor?.Profile?.setConfig('assetsindex', 'panel4_moveItems', configs);
                console.log('Panel4 配置已保存:', configs);
            }
        } catch (error) {
            console.error('保存 Panel4 配置失败:', error);
        }
    }

    /**
     * 从本地存储加载配置
     */
    static async loadSavedConfigs() {
        try {
            if (_panelInstance && typeof _panelInstance === 'object') {
                // 使用 Editor.Profile 加载配置
                const configs = await (window as any).Editor?.Profile?.getConfig('assetsindex', 'panel4_moveItems');
                
                if (configs && Array.isArray(configs) && configs.length > 0) {
                    console.log('加载保存的 Panel4 配置:', configs);
                    
                    // 清空现有配置
                    this.clearAllMoveItems();
                    
                    // 恢复保存的配置
                    configs.forEach((config: any, index: number) => {
                        const moveItem: MoveItem = {
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
                } else {
                    console.log('没有找到保存的 Panel4 配置');
                }
            }
        } catch (error) {
            console.error('加载 Panel4 配置失败:', error);
        }
    }

    /**
     * 更新数据缓存
     */
    static updateDataCache(dataCache: any) {
        _dataCache = dataCache;
    }

    /**
     * 获取元素 - 使用类似 index.ts 的方式
     */
    static getElement(id: string): HTMLElement | null {
        const container = _panel4Elements.moveItemsContainer;
        if (!container) {
            console.warn('容器不存在，无法查找元素:', id);
            return null;
        }
        
        // 优先使用容器的 querySelector，这是最可靠的方法
        const element = container.querySelector(`#${id}`);
        if (element) {
            return element as HTMLElement;
        }
        
        console.warn(`无法找到元素: ${id}`);
        return null;
    }

    /**
     * 获取计数元素 - 专门用于按钮中的计数显示
     */
    static getCountElement(itemId: string, type: 'matchCount' | 'selectedCount'): HTMLElement | null {
        const container = _panel4Elements.moveItemsContainer;
        if (!container) {
            return null;
        }
        
        // 直接通过选择器查找
        const element = container.querySelector(`#${itemId}_${type}`);
        if (element) {
            return element as HTMLElement;
        }
        
        // 如果直接查找失败，通过按钮查找
        const actionAttr = type === 'matchCount' ? 'preview' : 'previewSelected';
        const button = container.querySelector(`[data-action="${actionAttr}"][data-item-id="${itemId}"]`);
        if (button) {
            const span = button.querySelector('span');
            if (span) {
                return span as HTMLElement;
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
        
        // 保存配置
        this.saveConfigs();
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
                } else {
                    console.error(`元素添加失败！容器中也找不到 ID: ${cleanId}`);
                }
            } else {
                console.log(`元素成功添加到 DOM，ID: ${cleanId}`);
            }
            
            // 在 setTimeout 中绑定输入事件，确保 DOM 已更新
            this.bindInputEvents(moveItem, cleanId, container);
            
            // 如果移动项有保存的值，设置到输入框中
            if (moveItem.regex || moveItem.targetDir) {
                setTimeout(() => {
                    const regexInput = container.querySelector(`#${cleanId}_regex`) as HTMLInputElement;
                    const targetDirInput = container.querySelector(`#${cleanId}_targetDir`) as HTMLInputElement;
                    
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
            // 保存配置
            this.saveConfigs();
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
     * 绑定输入事件
     */
    static bindInputEvents(moveItem: MoveItem, cleanId: string, container: HTMLDivElement) {
        console.log(`bindInputEvents 被调用，moveItem: ${moveItem.id}, cleanId: ${cleanId}`);
        
        // 使用容器上下文查找元素
        const doc = container.ownerDocument || document;
        
        // 尝试多种方式查找输入框
        let regexInput = doc.getElementById(`${cleanId}_regex`) as HTMLInputElement;
        let targetDirInput = doc.getElementById(`${cleanId}_targetDir`) as HTMLInputElement;
        
        // 如果全局查找失败，使用容器查找
        if (!regexInput) {
            regexInput = container.querySelector(`#${cleanId}_regex`) as HTMLInputElement;
        }
        if (!targetDirInput) {
            targetDirInput = container.querySelector(`#${cleanId}_targetDir`) as HTMLInputElement;
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
        } else {
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
        } else {
            console.error(`无法找到目标目录输入框: ${cleanId}_targetDir`);
        }
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
            } else {
                console.error(`无法找到计数元素，无法更新显示。尝试查找的ID: ${itemId}_matchCount`);
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
            
            // 等待 DOM 更新完成，然后再检查匹配结果并显示预览
            setTimeout(() => {
                console.log(`延迟后检查匹配图片数量: ${moveItem.matchedImages.length}`);
                
                if (moveItem.matchedImages.length === 0) {
                    console.log(`没有匹配的图片，显示信息状态`);
                    this.showStatus(itemId, '没有找到匹配的图片', 'info');
                    return;
                }
                
                console.log(`开始创建预览内容`);
                // 创建预览内容 - 构建数据结构供 showAlert2 使用
                const previewData = {
                    summary: {
                        regex: moveItem.regex,
                        totalMatches: moveItem.matchedImages.length,
                        showingCount: Math.min(moveItem.matchedImages.length, 100)
                    },
                    matches: moveItem.matchedImages.slice(0, 100).map((imagePath, index) => ({
                        index: index + 1,
                        path: imagePath,
                        info: _dataCache.path2info[imagePath] || {}
                    }))
                };
                
                console.log(`准备使用 showAlert2 显示预览数据`);
                
                // 优先使用 panel 实例的 showAlert2 方法
                if (_panelInstance && typeof _panelInstance.showAlert2 === 'function') {
                    console.log(`使用 panel 实例的 showAlert2 方法显示预览`);
                    _panelInstance.showAlert2(previewData);
                } else {
                    console.log(`showAlert2 不可用，使用 Editor.Dialog 作为备用`);
                    // 备用方案：使用简单的文本显示
                    const previewContent = moveItem.matchedImages.slice(0, 100).map((imagePath, index) => 
                        `${index + 1}. ${imagePath}`
                    ).join('\n');
                    
                    const message = `匹配到 ${moveItem.matchedImages.length} 个图片${moveItem.matchedImages.length > 100 ? ' (仅显示前100个)' : ''}:\n\n${previewContent}`;
                    
                    // 检查 Editor.Dialog 是否存在
                    console.log(`检查 Editor.Dialog:`, (window as any).Editor?.Dialog);
                    
                    // 使用 Editor.Dialog 显示结果
                    const result = (window as any).Editor?.Dialog?.info(message, { 
                        title: `预览匹配结果 - ${moveItem.name}`
                    });
                    console.log(`Dialog.info 调用结果:`, result);
                }
            }, 200);
            
        } catch (error) {
            console.error(`预览匹配失败 (${itemId}):`, error);
            console.error(`错误堆栈:`, (error as Error).stack);
            this.showStatus(itemId, `预览失败: ${(error as Error).message}`, 'error');
        }
    }

    /**
     * 选择匹配项 - 显示选择对话框让用户勾选
     */
    static selectMatches(itemId: string) {
        const moveItem = _dynamicMoveItems.find(item => item.id === itemId);
        if (!moveItem) return;
        
        // 先更新匹配计数
        this.updateMatchCount(itemId);
        
        // 等待 DOM 更新后再显示对话框
        setTimeout(() => {
            if (moveItem.matchedImages.length === 0) {
                this.showStatus(itemId, '没有找到匹配的图片', 'info');
                return;
            }
            
            // 创建选择对话框内容
            const checkboxList = moveItem.matchedImages.map((imagePath, index) => {
                const isSelected = moveItem.selectedImages.includes(imagePath);
                return `<div class="image-checkbox-item">
                    <label class="image-checkbox-label">
                        <input type="checkbox" id="img_${index}" value="${imagePath}" ${isSelected ? 'checked' : ''} 
                               class="image-checkbox-input">
                        <span class="image-path-text">${imagePath}</span>
                    </label>
                </div>`;
            }).join('');
            
            const dialogContent = `
                <div style="max-height: 400px; overflow-y: auto; padding: 10px; border: 1px solid #ccc;">
                    ${checkboxList}
                </div>
            `;
            
            // 显示选择对话框
            this.showSelectionDialog(itemId, dialogContent, moveItem);
        }, 100);
    }

    /**
     * 显示图片选择对话框
     */
    static showSelectionDialog(itemId: string, content: string, moveItem: MoveItem) {
        // 创建模态对话框
        const overlay = document.createElement('div');
        overlay.className = 'selection-dialog-overlay';
        
        const dialog = document.createElement('div');
        dialog.className = 'selection-dialog';
        
        dialog.innerHTML = `
            <div class="selection-dialog-header">
                <h3 style="margin: 0; color: #333;">选择要移动的图片 - ${moveItem.name}</h3>
                <button id="closeDialog" style="background: none; border: none; font-size: 20px; cursor: pointer;">&times;</button>
            </div>
            <div class="selection-dialog-content">
                <div style="max-height: 400px; overflow-y: auto; padding: 10px; border: 1px solid #ccc;">
                    <div style="margin-bottom: 15px;">
                        <button id="selectAll" style="margin-right: 10px; padding: 5px 10px;">全选</button>
                        <button id="selectNone" style="padding: 5px 10px;">全不选</button>
                        <span style="margin-left: 20px; color: #666;">共 ${moveItem.matchedImages.length} 个匹配项</span>
                    </div>
                    ${content}
                </div>
            </div>
            <div class="selection-dialog-footer">
                <button id="cancelSelection" style="padding: 8px 16px; border: 1px solid #ccc; background: white; cursor: pointer;">取消</button>
                <button id="confirmSelection" style="padding: 8px 16px; background: #007acc; color: white; border: none; cursor: pointer;">确认选择</button>
            </div>
        `;
        
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        // 绑定事件
        const selectAllBtn = dialog.querySelector('#selectAll') as HTMLButtonElement;
        const selectNoneBtn = dialog.querySelector('#selectNone') as HTMLButtonElement;
        const closeBtn = dialog.querySelector('#closeDialog') as HTMLButtonElement;
        const cancelBtn = dialog.querySelector('#cancelSelection') as HTMLButtonElement;
        const confirmBtn = dialog.querySelector('#confirmSelection') as HTMLButtonElement;
        const checkboxes = dialog.querySelectorAll('input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
        
        // 全选功能
        selectAllBtn.addEventListener('click', () => {
            checkboxes.forEach(cb => cb.checked = true);
        });
        
        // 全不选功能
        selectNoneBtn.addEventListener('click', () => {
            checkboxes.forEach(cb => cb.checked = false);
        });
        
        // 关闭对话框
        const closeDialog = () => {
            document.body.removeChild(overlay);
        };
        
        closeBtn.addEventListener('click', closeDialog);
        cancelBtn.addEventListener('click', closeDialog);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeDialog();
        });
        
        // 确认选择
        confirmBtn.addEventListener('click', () => {
            const selectedImages: string[] = [];
            checkboxes.forEach(cb => {
                if (cb.checked) {
                    selectedImages.push(cb.value);
                }
            });
            
            moveItem.selectedImages = selectedImages;
            
            // 更新选中计数显示
            const selectedCountElement = this.getCountElement(itemId, 'selectedCount');
            if (selectedCountElement) {
                selectedCountElement.textContent = selectedImages.length.toString();
                console.log(`更新选中计数显示: ${selectedImages.length}`);
            } else {
                console.error(`无法找到选中计数元素: ${itemId}_selectedCount`);
            }
            
            this.showStatus(itemId, `已选中 ${selectedImages.length} 个图片`, 'success');
            closeDialog();
        });
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
            
            let movedCount = 0;
            let errorCount = 0;
            const errors: string[] = [];
            
            console.log('准备直接移动文件，不使用复杂的主进程方法');
            console.log('要移动的图片:', moveItem.selectedImages);
            
            // 确保目标目录存在
            const targetDirPath = moveItem.targetDir.endsWith('/') ? moveItem.targetDir.slice(0, -1) : moveItem.targetDir;
            const targetDbPath = `db://assets/${targetDirPath}`;
            
            try {
                // 检查目标目录是否存在
                const dirExists = await (window as any).Editor?.Message?.request('asset-db', 'query-asset-info', targetDbPath);
                if (!dirExists) {
                    console.log(`目标目录不存在，尝试创建: ${targetDirPath}`);
                    // 如果目录不存在，尝试创建（这里可能需要逐级创建）
                    const fs = require('fs');
                    const path = require('path');
                    const assetsPath = path.join((window as any).Editor?.Project?.path || '', 'assets');
                    const fullTargetPath = path.join(assetsPath, targetDirPath);
                    
                    if (!fs.existsSync(fullTargetPath)) {
                        fs.mkdirSync(fullTargetPath, { recursive: true });
                        console.log(`成功创建目录: ${targetDirPath}`);
                        
                        // 刷新资源数据库以识别新创建的目录
                        await (window as any).Editor?.Message?.send('asset-db', 'refresh-asset', targetDbPath);
                    }
                }
            } catch (dirError) {
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
                    const result = await (window as any).Editor?.Message?.request('asset-db', 'move-asset', src, dest, moveOptions);
                    console.log(`[${i + 1}/${moveItem.selectedImages.length}] 移动成功: ${fileName}`, result);
                    movedCount++;
                    
                } catch (error) {
                    console.error(`[${i + 1}/${moveItem.selectedImages.length}] 移动失败: ${fileName}`, error);
                    errorCount++;
                    errors.push(`移动失败: ${fileName} - ${(error as Error).message}`);
                }
            }
            
            // 显示移动结果
            if (errorCount === 0) {
                this.showStatus(itemId, `移动完成: 成功移动 ${movedCount} 个图片`, 'success');
            } else {
                this.showStatus(itemId, `移动完成: 成功 ${movedCount} 个，失败 ${errorCount} 个`, 'error');
                console.error('移动错误详情:', errors);
            }
            
            // 移动完成后刷新资源数据库
            try {
                await (window as any).Editor?.Message?.send('asset-db', 'refresh-asset', 'db://assets');
                console.log('资源数据库刷新完成');
            } catch (refreshError) {
                console.warn('刷新资源数据库失败:', refreshError);
            }
            
            // 清空选中列表
            moveItem.selectedImages = [];
            
            // 重置选中计数显示
            const selectedCountElement = this.getCountElement(itemId, 'selectedCount');
            if (selectedCountElement) {
                selectedCountElement.textContent = '0';
                console.log(`重置选中计数显示为 0`);
            } else {
                console.error(`无法找到选中计数元素进行重置: ${itemId}_selectedCount`);
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
        
        const totalCount = allSelected.reduce((sum, item) => sum + item.images.length, 0);
        
        // 构建数据结构供 showAlert2 使用
        const previewData = {
            summary: {
                totalItems: allSelected.length,
                totalImages: totalCount,
                description: `共 ${allSelected.length} 个移动项，包含 ${totalCount} 个图片`
            },
            items: allSelected.map(item => ({
                name: item.name,
                targetDir: item.targetDir,
                imageCount: item.images.length,
                images: item.images
            }))
        };
        
        // 优先使用 panel 实例的 showAlert2 方法
        if (_panelInstance && typeof _panelInstance.showAlert2 === 'function') {
            _panelInstance.showAlert2(previewData);
        } else {
            // 备用方案：使用简单的文本显示
            const previewContent = allSelected.map(item => 
                `【${item.name}】 → ${item.targetDir}\n` +
                item.images.slice(0, 10).map(img => `  - ${img}`).join('\n') +
                (item.images.length > 10 ? `\n  ... 还有 ${item.images.length - 10} 个` : '')
            ).join('\n\n');
            
            (window as any).Editor?.Dialog?.info(
                `总共选中 ${totalCount} 个图片，分布在 ${allSelected.length} 个移动项中:\n\n${previewContent}`,
                { 
                    title: '预览所有选中项'
                }
            );
        }
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
            const element = this.getElement(item.id);
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
