import { readFileSync } from 'fs-extra';
import { join } from 'path';
const fs = require('fs-extra');

// #region 全局数据缓存
let _dataCache: any = null; 
let _spriteFrameMaps_nameCache: any = null; 
let _ignoreCache: any = null; 
let _preImageCache: any = null; 
let _bgdataCache: any = null; 
let _commondataCache: any = null; 
let _singledataCache: any = null; 
let _samedataCache: any = null; 
let _sizecountdataCache: any = null; 
let _otherbigdataCache: any = null;
let _othersmalldataCache: any = null;
let _ignoreRemainingdataCache: any = null; 
let _preImageRemainingdataCache: any = null; 
let _bgRemainingdataCache: any = null; 
let _commonRemainingdataCache: any = null; 
let _singleRemainingdataCache: any = null; 
let _sameRemainingdataCache: any = null; 
let _sizecountRemainingdataCache: any = null;
let _otherbigRemainingdataCache: any = null;
let _othersmallRemainingdataCache: any = null;
let _defineLargeImageCache: any = null; // 大图定义缓存
let _defineSmallImageCache: any = null; // 小小图定义缓存
let _defineBigImage: any = {
    width: 500,
    height: 500,
    threshold: 500 * 500,
    byWidth: false,
    byHeight: false,
    byArea: true,
};
let _defineSSmallImage: any = {
    width: 50,
    height: 50,
    threshold: 50 * 50,
    byWidth: false,
    byHeight: false,
    byArea: true,
}; // 小图定义缓存

// #endregion

// #region 工具函数
function isBigImage(width: number, height: number): boolean {
    // 如果没有启用任何判断方式，默认使用面积判断
    if (!_defineBigImage.byWidth && !_defineBigImage.byHeight && !_defineBigImage.byArea) {
        return width * height >= _defineBigImage.threshold;
    }

    if (_defineBigImage.byWidth && width >= _defineBigImage.width) {
        return true;
    }
    if (_defineBigImage.byHeight && height >= _defineBigImage.height) {
        return true;
    }
    if (_defineBigImage.byArea && width * height >= _defineBigImage.threshold) {
        return true;
    }
    return false;
}
function isSSmallImage(width: number, height: number): boolean {
    // 如果没有启用任何判断方式，默认使用面积判断
    if (!_defineSSmallImage.byWidth && !_defineSSmallImage.byHeight && !_defineSSmallImage.byArea) {
        return width * height <= _defineSSmallImage.threshold;
    }

    // 所有勾选的条件都必须满足才算小小图（AND 逻辑）
    if (_defineSSmallImage.byWidth && width > _defineSSmallImage.width) {
        return false;
    }
    if (_defineSSmallImage.byHeight && height > _defineSSmallImage.height) {
        return false;
    }
    if (_defineSSmallImage.byArea && width * height > _defineSSmallImage.threshold) {
        return false;
    }
    return true;
}
function formatSize(bytes: number): string {
    if (bytes >= 1024 * 1024) {
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    } else {
        return (bytes / 1024).toFixed(2) + ' KB';
    }
}

function deepClone(obj: any): any {
    return JSON.parse(JSON.stringify(obj));
}
// #endregion

module.exports = Editor.Panel.define({
    listeners: {
        show() { console.log('show'); },
        hide() { console.log('hide'); },
    },
    template: readFileSync(join(__dirname, '../../../static/template/resourcesdeal/index.html'), 'utf-8'),
    style: readFileSync(join(__dirname, '../../../static/style/resourcesdeal/index.css'), 'utf-8'),
    $: {
        tabs: '#tabs',
        content: '#content',
        buildmapsdatabtn: '#buildmapsdatabtn',
        directoryInput: '#directoryInput',
        directoryOutput: '#directoryOutput',
        genImageTableBtn: '#genImageTableBtn',
        genPrefabTableBtn: '#genPrefabTableBtn',
        imageTable: '#imageTable',
        prefabTable: '#prefabTable',
        buildMapsDataResultContainer: '#buildMapsDataResultContainer',
        buildMapsDataResultPath: '#buildMapsDataResultPath',
        imageStatsPicUsed: '#imageStatsPicUsed',
        imageStatsContent: '#imageStatsContent',
        scrollArea: '#scrollArea',
        contentArea: '#contentArea',
        deleteEmptyFoldersBtn: '#deleteEmptyFoldersBtn',
        //图集设置处理
        //大图定义
        defineLargeImageWidth: '#defineLargeImageWidth',
        defineLargeImageHeight: '#defineLargeImageHeight',
        defineLargeImageThreshold: '#defineLargeImageThreshold',
        defineLargeImageByWidth: '#defineLargeImageByWidth',
        defineLargeImageByHeight: '#defineLargeImageByHeight',
        defineLargeImageByArea: '#defineLargeImageByArea',
        defineLargeImageBtn: '#defineLargeImageBtn',

        //小图定义
        defineSSmallImageWidth: '#defineSSmallImageWidth',
        defineSSmallImageHeight: '#defineSSmallImageHeight',
        defineSSmallImageThreshold: '#defineSSmallImageThreshold',
        defineSSmallImageByWidth: '#defineSSmallImageByWidth',
        defineSSmallImageByHeight: '#defineSSmallImageByHeight',
        defineSSmallImageByArea: '#defineSSmallImageByArea',
        defineSSmallImageBtn: '#defineSSmallImageBtn',

        //ignore
        ignorePattern: '#ignorePattern',
        setIgnorePatternBtn: '#setIgnorePatternBtn',
        ignoreTotalSize: '#ignoreTotalSize',
        ignoreTotal: '#ignoreTotal',
        ignoreRemaining: '#ignoreRemaining',
        lookIgnorePatternResult: '#lookIgnorePatternResult',
        
        //preImage
        preimgWidthinput: '#preimgWidthinput',
        preimgHeightinput: '#preimgHeightinput',
        preImageThreshold: '#preImageThreshold',
        calculatePreSameImageBtn: '#calculatePreSameImageBtn',
        preImageTotal: '#preImageTotal',
        preImagesaving: '#preImagesaving',
        preImageRemaining: '#preImageRemaining',
        lookPreImageResultBtn: '#lookPreImageResultBtn',
        
        //common
        commonThreshold: '#commonThreshold',
        calculateCommon: '#calculateCommon',
        commonTotalSize: '#commonTotalSize',
        commonTotal: '#commonTotal',
        commonRemaining: '#commonRemaining',
        lookCommonResult: '#lookCommonResult',
        
        //bg
        bgimgWidthinput: '#bgimgWidthinput',
        bgimgHeightinput: '#bgimgHeightinput',
        largeImageThreshold: '#largeImageThreshold',
        calculateBg: '#calculateBg',
        bgTotalSize: '#bgTotalSize',
        bgTotal: '#bgTotal',
        bgRemaining: '#bgRemaining',
        lookBgResult: '#lookBgResult',

        //single
        calculateSingle: '#calculateSingle',
        singleTotalSize: '#singleTotalSize',
        singleTotal: '#singleTotal',
        singleRemaining: '#singleRemaining',
        lookSingleResult: '#lookSingleResult',

        //sameDir
        calculateSameDir: '#calculateSameDir',
        sameDirTotalSize: '#sameDirTotalSize',
        sameDirTotal: '#sameDirTotal',
        sameDirRemaining: '#sameDirRemaining',
        lookSameDirResult: '#lookSameDirResult',

        //sizecount
        sizecountWidthinput: '#sizecountWidthinput',
        sizecountHeightinput: '#sizecountHeightinput',
        sizecountCountinput: '#sizecountCountinput',
        sizeCountThreshold: '#sizeCountThreshold',
        calculateSizeCount: '#calculateSizeCount',
        sizeCountTotalSize: '#sizeCountTotalSize',
        sizeCountTotal: '#sizeCountTotal',
        sizeCountRemaining: '#sizeCountRemaining',
        lookSizeCountResult: '#lookSizeCountResult',

        //其他大图
        otherbigToCommonBtn: '#otherbigToCommonBtn',
        otherbigTotal: '#otherbigTotal',
        otherbigTotalSize: '#otherbigTotalSize',
        otherbigRemaining: '#otherbigRemaining',
        lookotherbigResult: '#lookotherbigResult',

        //其他小图
        othersmallToCopyMoreBtn: '#othersmallToCopyMoreBtn',
        othersmallTotal: '#othersmallTotal',
        othersmallTotalSize: '#othersmallTotalSize',
        othersmallRemaining: '#othersmallRemaining',
        lookothersmallResult: '#lookothersmallResult',

        processAll: '#processAll',
        lookRemaining: '#lookRemaining',
        //移动图片
        preprocessIdenticalImagesBtn: '#preprocessIdenticalImagesBtn',
        lookPreprocessIdenticalImagesBtn: '#lookPreprocessIdenticalImagesBtn',

        caseConflictKeepOld: '#caseConflictKeepOld',
        caseConflictUseNew: '#caseConflictUseNew',
        autoRename: '#autoRename',
        
        //移动大图
        moveBgImagesBtn: '#moveBgImagesBtn',
        PreLookmoveBgImagesBtn: '#PreLookmoveBgImagesBtn',
        bgPrefabRegex: '#bgPrefabRegex',
        bgTargetPattern: '#bgTargetPattern',

        //移动common图片
        commonTargetPattern: '#commonTargetPattern',
        bigcommonTargetPattern: '#bigcommonTargetPattern',
        moveCommonImagesBtn: '#moveCommonImagesBtn',
        PreLookmoveCommonImagesBtn: '#PreLookmoveCommonImagesBtn',

        //移动单独图片
        singlePrefabRegex: '#singlePrefabRegex',
        singleTargetPattern: '#singleTargetPattern',
        bigsingleTargetPattern: '#bigsingleTargetPattern',
        moveSingleImagesBtn: '#moveSingleImagesBtn',
        PreLookmoveSingleImagesBtn: '#PreLookmoveSingleImagesBtn',

        //移动sameDir图片
        sameDirPrefabRegex: '#sameDirPrefabRegex',
        sameDirTargetPattern: '#sameDirTargetPattern',
        bigsameDirTargetPattern: '#bigsameDirTargetPattern',
        moveSameDirImagesBtn: '#moveSameDirImagesBtn',
        PreLookmoveSameDirImagesBtn: '#PreLookmoveSameDirImagesBtn',

        //移动其他大图
        otherbigTargetPattern: '#otherbigTargetPattern',
        moveOtherbigImagesBtn: '#moveOtherbigImagesBtn',
        PreLookmoveOtherbigImagesBtn: '#PreLookmoveOtherbigImagesBtn',

    },
    
    methods: {
        // #region 基础功能方法
        switchTab(tabId: string) {
            const tabs = this.$.tabs!.querySelectorAll('.tab-button');
            const panels = this.$.content!.querySelectorAll('.tab-content');

            panels.forEach(panel => {
                (panel as HTMLElement).style.display = 'none';
            });

            tabs.forEach(tab => tab.classList.remove('active'));

            const activeTab = this.$.tabs!.querySelector(`.tab-button[data-tab="${tabId}"]`);
            const activePanel = this.$.content!.querySelector(`#${tabId}`);
            activeTab?.classList.add('active');
            if (activePanel) {
                (activePanel as HTMLElement).style.display = 'block';
            }
        },
        // #endregion

        // #region 阈值更新方法
        updateThreshold() {
            const w = parseInt(this.$.bgimgWidthinput.value) || 0;
            const h = parseInt(this.$.bgimgHeightinput.value) || 0;
            this.$.largeImageThreshold.value = w * h;
        },

        updatesizeCountThreshold(){
            const w = parseInt(this.$.sizecountWidthinput.value) || 0;
            const h = parseInt(this.$.sizecountHeightinput.value) || 0;
            const c = parseInt(this.$.sizecountCountinput.value) || 0;
            this.$.sizeCountThreshold.value = w * h * c;
        },

        updatePreImageThreshold(){
            const w = parseInt(this.$.preimgWidthinput.value) || 0;
            const h = parseInt(this.$.preimgHeightinput.value) || 0;
            this.$.preImageThreshold.value = w * h;
        },

        updateDefineLargeImageThreshold() {
            const w = parseInt((this.$.defineLargeImageWidth as HTMLInputElement).value) || 0;
            const h = parseInt((this.$.defineLargeImageHeight as HTMLInputElement).value) || 0;
            (this.$.defineLargeImageThreshold as HTMLInputElement).value = (w * h).toString();
        },

        updateDefineSSmallImageThreshold() {
            const w = parseInt((this.$.defineSSmallImageWidth as HTMLInputElement).value) || 0;
            const h = parseInt((this.$.defineSSmallImageHeight as HTMLInputElement).value) || 0;
            (this.$.defineSSmallImageThreshold as HTMLInputElement).value = (w * h).toString();
        },
        // #endregion

        // #region 数据处理方法
        buildMapsData(dir: string) {
            console.log('点击了构建基础数据按钮');
            
            Editor.Message.request('assetsindex', 'dynamic-message', {method: 'buildMapsData', dir: dir})
            .then((data) => {
                Editor.Dialog.info(`构建完成，数据缓存成功,路径:${data.out2}`, {title:'构建完成', buttons:['我知道了']});
                _dataCache = data;
                this.$.buildMapsDataResultContainer!.style.visibility = 'visible';
                (this.$.buildMapsDataResultPath as HTMLInputElement).value = data.out2;
                Editor.Profile.setConfig('assetsindex','resourcesdeal_outputdata2_directory', data.out2);
            })
        },
        // #endregion

        // #region 表格渲染方法
        renderImageTable(spriteFrameMaps_name: Record<string, string[]>, path2info: any) {
            console.log('开始渲染图片表格，数据量:', Object.keys(spriteFrameMaps_name).length);
            
            if (!spriteFrameMaps_name || Object.keys(spriteFrameMaps_name).length === 0) {
                console.warn('spriteFrameMaps_name 数据为空');
                return;
            }

            const rows = Object.entries(spriteFrameMaps_name)
                .map(([img, prefabs]) => ({
                    img,
                    count: prefabs.length,
                    size: path2info[img]?.size || 0,
                    prefabs: prefabs.slice().sort((a, b) => a.localeCompare(b)),
                }))
                .sort((a, b) => {
                    if (a.count !== b.count) return a.count - b.count;
                    return a.size - b.size;
                });

            const rowStrings = rows.map(row => `
                <tr>
                    <td>${row.img}</td>
                    <td>${row.count}</td>
                    <td>${formatSize(row.size)}</td>
                    <td>${row.prefabs.join('<br/>')}</td>
                </tr>
            `);

            if (this._clusterize) {
                this._clusterize.update(rowStrings);
            } else {
                const tbody = this.$.imageTable.querySelector('tbody')!;
                tbody.innerHTML = '';
                rows.forEach(row => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${row.img}</td>
                        <td>${row.count}</td>
                        <td>${formatSize(row.size)}</td>
                        <td>${row.prefabs.join('<br/>')}</td>
                    `;
                    tbody.appendChild(tr);
                });
            }

            // 统计数据
            const statsMap: Record<number, { total: number; size: number }> = {};
            rows.forEach(row => {
                if (!statsMap[row.count]) statsMap[row.count] = { total: 0, size: 0 };
                statsMap[row.count].total += 1;
                statsMap[row.count].size += row.size;
            });
            
            const statsDiv = this.$.imageStatsContent!;
            statsDiv.innerHTML = '';
            for (const [count, info] of Object.entries(statsMap)) {
                const div = document.createElement('div');
                div.textContent = `${count} 次引用: ${info.total} 张图片, 总大小 ${formatSize(info.size)}`;
                statsDiv.appendChild(div);
            }
            
            const unusedCount = Object.values(path2info).filter((info: any) => info.count === 0).length;
            this.$.imageStatsPicUsed!.textContent = `共 ${rows.length} 张图片被引用, ${unusedCount} 张未被引用`;
        },

        renderPrefabTable(prefabMaps_name: Record<string, string[]>, spriteFrameMaps_name: Record<string, string[]>) {
            const tbody = this.$.prefabTable.querySelector('tbody')!;
            tbody.innerHTML = '';

            const imgCountMap: Record<string, number> = {};
            for (const [img, prefabs] of Object.entries(spriteFrameMaps_name)) {
                imgCountMap[img] = prefabs.length;
            }

            Object.entries(prefabMaps_name).forEach(([prefab, imgs]) => {
                imgs.forEach(img => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${prefab}</td>
                        <td>${img}</td>
                        <td>${imgCountMap[img] || 0}</td>
                    `;
                    tbody.appendChild(tr);
                });
            });
        },
        // #endregion

        // #region 弹窗显示方法
        showAlert(msg: any) {
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed; top: 50px; left: 50px; width: 500px; height: 400px;
                overflow: auto; background: white; border: 1px solid #333; padding: 10px;
                z-index: 9999; color: black; font-family: monospace; white-space: pre;
            `;
            modal.textContent = JSON.stringify(msg, null, 2);

            const closeBtn = document.createElement('button');
            closeBtn.textContent = '关闭';
            closeBtn.style.cssText = 'position: fixed; top: 50px; left: 575px;';
            closeBtn.onclick = () => document.body.removeChild(modal);
            modal.appendChild(closeBtn);

            document.body.appendChild(modal);
        },

        showAlert2(msg: any) {
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 50px; left: 50px;
                width: 700px;
                height: 500px;
                overflow: auto;
                background: white;
                border: 1px solid #333;
                z-index: 9999;
                display: flex;
                flex-direction: column;
            `;

            // 创建标题栏
            const header = document.createElement('div');
            header.style.cssText = `
                background: #f0f0f0;
                padding: 10px;
                border-bottom: 1px solid #ccc;
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;
            header.innerHTML = `
                <span style="font-weight: bold; color: #333;">数据查看器</span>
                <div>
                    <button id="expandAll" style="margin-right: 5px; padding: 5px 10px;">全部展开</button>
                    <button id="collapseAll" style="margin-right: 5px; padding: 5px 10px;">全部收起</button>
                    <button id="closeModal" style="padding: 5px 10px;">关闭</button>
                </div>
            `;

            // 创建内容区域
            const content = document.createElement('div');
            content.style.cssText = `
                flex: 1;
                padding: 10px;
                overflow: auto;
                font-family: monospace;
                color: black;
                line-height: 1.4;
            `;

            // 递归创建树状结构
            const createTreeNode = (obj: any, key: string = '', level: number = 0, isRoot: boolean = false): HTMLElement => {
                const container = document.createElement('div');
                container.style.marginLeft = `${level * 4}px`;

                if (obj === null || obj === undefined) {
                    container.innerHTML = `<span style="color: #666;">${key}: <span style="color: #999;">null</span></span>`;
                    return container;
                }

                if (typeof obj !== 'object') {
                    const valueColor = typeof obj === 'string' ? '#d14' : 
                                     typeof obj === 'number' ? '#099' : 
                                     typeof obj === 'boolean' ? '#0c5' : '#333';
                    const displayValue = typeof obj === 'string' ? `"${obj}"` : String(obj);
                    container.innerHTML = `<span style="color: #666;">${key}: <span style="color: ${valueColor};">${displayValue}</span></span>`;
                    return container;
                }

                if (Array.isArray(obj)) {
                    const toggle = document.createElement('span');
                    toggle.style.cssText = 'cursor: pointer; user-select: none; color: #666; margin-right: 5px;';
                    
                    if (isRoot) {
                        toggle.textContent = obj.length === 0 ? '' : '▼';
                        toggle.style.cursor = 'default';
                        toggle.style.color = '#999';
                    } else {
                        toggle.textContent = obj.length === 0 ? '' : '▶';
                    }
                    
                    const label = document.createElement('span');
                    label.style.color = '#666';
                    label.textContent = `${key}: Array[${obj.length}]`;
                    
                    const childContainer = document.createElement('div');
                    childContainer.style.display = (obj.length === 0) ? 'none' : (isRoot ? 'block' : 'none');
                    
                    if (obj.length === 0) {
                        label.textContent += ' []';
                    } else {
                        obj.forEach((item, index) => {
                            childContainer.appendChild(createTreeNode(item, `[${index}]`, level + 1, false));
                        });
                    }

                    if (obj.length > 0 && !isRoot) {
                        toggle.addEventListener('click', () => {
                            const isExpanded = childContainer.style.display !== 'none';
                            childContainer.style.display = isExpanded ? 'none' : 'block';
                            toggle.textContent = isExpanded ? '▶' : '▼';
                        });
                    }

                    container.appendChild(toggle);
                    container.appendChild(label);
                    container.appendChild(childContainer);
                    return container;
                }

                // 处理对象
                const keys = Object.keys(obj);
                const toggle = document.createElement('span');
                toggle.style.cssText = 'cursor: pointer; user-select: none; color: #666; margin-right: 5px;';
                
                if (isRoot) {
                    toggle.textContent = keys.length === 0 ? '' : '▼';
                    toggle.style.cursor = 'default';
                    toggle.style.color = '#999';
                } else {
                    toggle.textContent = keys.length === 0 ? '' : '▶';
                }
                
                const label = document.createElement('span');
                label.style.color = '#666';
                
                // 生成对象预览
                let preview = '';
                if (keys.length === 0) {
                    preview = ' {}';
                } else {
                    const firstKey = keys[0];
                    const firstValue = obj[firstKey];
                    if (typeof firstValue === 'string') {
                        // 如果第一个值是字符串，显示前15个字符
                        const truncatedValue = firstValue.length > 15 ? firstValue.substring(0, 15) + '...' : firstValue;
                        preview = ` {${firstKey}: "${truncatedValue}"...}`;
                    } else if (typeof firstValue === 'number' || typeof firstValue === 'boolean') {
                        // 如果是数字或布尔值，直接显示
                        preview = ` {${firstKey}: ${firstValue}...}`;
                    } else {
                        // 其他类型只显示键名
                        preview = ` {${firstValue}...}`;
                    }
                }
                
                label.textContent = `${key}: ${preview}..(${keys.length})`;
                
                const childContainer = document.createElement('div');
                childContainer.style.display = (keys.length === 0) ? 'none' : (isRoot ? 'block' : 'none');
                
                if (keys.length === 0) {
                    // 空对象不需要额外处理，已在预览中显示
                } else {
                    keys.forEach(objKey => {
                        childContainer.appendChild(createTreeNode(obj[objKey], objKey, level + 1, false));
                    });
                }

                if (keys.length > 0 && !isRoot) {
                    toggle.addEventListener('click', () => {
                        const isExpanded = childContainer.style.display !== 'none';
                        childContainer.style.display = isExpanded ? 'none' : 'block';
                        toggle.textContent = isExpanded ? '▶' : '▼';
                    });
                }

                container.appendChild(toggle);
                container.appendChild(label);
                container.appendChild(childContainer);
                return container;
            };

            // 生成树状结构
            content.appendChild(createTreeNode(msg, 'root', 0, true));

            // 添加全部展开/收起功能
            const expandAll = header.querySelector('#expandAll') as HTMLButtonElement;
            const collapseAll = header.querySelector('#collapseAll') as HTMLButtonElement;
            const closeModal = header.querySelector('#closeModal') as HTMLButtonElement;

            expandAll.addEventListener('click', () => {
                const allContainers = content.querySelectorAll('div div');
                const allToggles = content.querySelectorAll('span[style*="cursor: pointer"]');
                allContainers.forEach(container => {
                    (container as HTMLElement).style.display = 'block';
                });
                allToggles.forEach(toggle => {
                    if (toggle.textContent && toggle.textContent.trim() && (toggle as HTMLElement).style.cursor !== 'default') {
                        toggle.textContent = '▼';
                    }
                });
            });

            collapseAll.addEventListener('click', () => {
                const allContainers = content.querySelectorAll('div div');
                const allToggles = content.querySelectorAll('span[style*="cursor: pointer"]');
                allContainers.forEach((container, index) => {
                    const parentContainer = container.parentElement;
                    const isFirstLevel = parentContainer && parentContainer.style.marginLeft === '0px';
                    if (!isFirstLevel) {
                        (container as HTMLElement).style.display = 'none';
                    }
                });
                allToggles.forEach(toggle => {
                    if (toggle.textContent && toggle.textContent.trim() && (toggle as HTMLElement).style.cursor !== 'default') {
                        const container = toggle.parentElement;
                        const isFirstLevel = container && container.style.marginLeft === '4px';
                        if (!isFirstLevel) {
                            toggle.textContent = '▶';
                        }
                    }
                });
            });

            closeModal.addEventListener('click', () => {
                document.body.removeChild(modal);
            });

            modal.appendChild(header);
            modal.appendChild(content);
            document.body.appendChild(modal);

            // 让modal可拖拽
            let isDragging = false;
            let currentX = 0;
            let currentY = 0;
            let initialX = 0;
            let initialY = 0;

            header.addEventListener('mousedown', (e) => {
                if ((e.target as HTMLElement).tagName !== 'BUTTON') {
                    isDragging = true;
                    initialX = e.clientX - modal.offsetLeft;
                    initialY = e.clientY - modal.offsetTop;
                    header.style.cursor = 'move';
                }
            });

            document.addEventListener('mousemove', (e) => {
                if (isDragging) {
                    e.preventDefault();
                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;
                    modal.style.left = currentX + 'px';
                    modal.style.top = currentY + 'px';
                }
            });

            document.addEventListener('mouseup', () => {
                isDragging = false;
                header.style.cursor = 'default';
            });
        },
        // #endregion

        // #region 配置初始化方法
        async initializeConfigurations() {
            const configs = [
                { key: 'resourcesdeal_input_directory', element: 'directoryInput', defaultValue: 'E:\\gitfolders\\killercity-client\\killercity-client\\assets\\remotemain' },
                { key: 'resourcesdeal_outputdata2_directory', element: 'buildMapsDataResultPath', defaultValue: '', special: 'outputPath' },
                { key: 'resourcesdeal_bgPrefabRegex', element: 'bgPrefabRegex', defaultValue: 'remotemain/preb[/\\](.*)[/\\](.*)\.prefab' },
                { key: 'resourcesdeal_bgTargetPattern', element: 'bgTargetPattern', defaultValue: 'remotemain/staticRes/$1/bg/' },
                { key: 'resourcesdeal_bgimgWidthinput', element: 'bgimgWidthinput', defaultValue: '400' },
                { key: 'resourcesdeal_bgimgHeightinput', element: 'bgimgHeightinput', defaultValue: '400' },
                { key: 'resourcesdeal_largeImageThreshold', element: 'largeImageThreshold', defaultValue: '160000' },
                { key: 'resourcesdeal_commonThreshold', element: 'commonThreshold', defaultValue: '10' },
                { key: 'resourcesdeal_commonTargetPattern', element: 'commonTargetPattern', defaultValue: 'remotemain/staticRes/common/atlas/' },
                { key: 'resourcesdeal_bigcommonTargetPattern', element: 'bigcommonTargetPattern', defaultValue: 'remotemain/staticRes/common/bg/' },
                { key: 'resourcesdeal_sizecountWidthinput', element: 'sizecountWidthinput', defaultValue: '100' },
                { key: 'resourcesdeal_sizecountHeightinput', element: 'sizecountHeightinput', defaultValue: '100' },
                { key: 'resourcesdeal_sizecountCountinput', element: 'sizecountCountinput', defaultValue: '100' },
                { key: 'resourcesdeal_sizeCountThreshold', element: 'sizeCountThreshold', defaultValue: '1000000' },
                { key: 'resourcesdeal_singlePrefabRegex', element: 'singlePrefabRegex', defaultValue: 'remotemain/preb[/\\\\](.*)[/\\\\](.*)\\.prefab' },
                { key: 'resourcesdeal_singleTargetPattern', element: 'singleTargetPattern', defaultValue: 'remotemain/staticRes/$1/atlas/' },
                { key: 'resourcesdeal_bigsingleTargetPattern', element: 'bigsingleTargetPattern', defaultValue: 'remotemain/staticRes/$1/bg/' },
                { key: 'resourcesdeal_sameDirPrefabRegex', element: 'sameDirPrefabRegex', defaultValue: 'remotemain/preb[/\\\\](.*)[/\\\\](.*)\\.prefab' },
                { key: 'resourcesdeal_sameDirTargetPattern', element: 'sameDirTargetPattern', defaultValue: 'remotemain/staticRes/$1/atlas/' },
                { key: 'resourcesdeal_bigsameDirTargetPattern', element: 'bigsameDirTargetPattern', defaultValue: 'remotemain/staticRes/$1/bg/' },
                { key: 'resourcesdeal_preimgWidthinput', element: 'preimgWidthinput', defaultValue: '100' },
                { key: 'resourcesdeal_preimgHeightinput', element: 'preimgHeightinput', defaultValue: '100' },
                { key: 'resourcesdeal_preImageThreshold', element: 'preImageThreshold', defaultValue: '10000' },
                { key: 'resourcesdeal_ignorePattern', element: 'ignorePattern', defaultValue: 'i18' },
                { key: 'resourcesdeal_caseConflictKeepOld', element: 'caseConflictKeepOld', defaultValue: '1', type: 'checkbox' },
                { key: 'resourcesdeal_caseConflictUseNew', element: 'caseConflictUseNew', defaultValue: '0', type: 'checkbox' },
                // 大图定义相关配置
                { key: 'resourcesdeal_defineLargeImageWidth', element: 'defineLargeImageWidth', defaultValue: '400' },
                { key: 'resourcesdeal_defineLargeImageHeight', element: 'defineLargeImageHeight', defaultValue: '400' },
                { key: 'resourcesdeal_defineLargeImageThreshold', element: 'defineLargeImageThreshold', defaultValue: '160000' },
                { key: 'resourcesdeal_defineLargeImageByWidth', element: 'defineLargeImageByWidth', defaultValue: '0', type: 'checkbox' },
                { key: 'resourcesdeal_defineLargeImageByHeight', element: 'defineLargeImageByHeight', defaultValue: '0', type: 'checkbox' },
                { key: 'resourcesdeal_defineLargeImageByArea', element: 'defineLargeImageByArea', defaultValue: '1', type: 'checkbox' },
                // 小小图定义相关配置
                { key: 'resourcesdeal_defineSSmallImageWidth', element: 'defineSSmallImageWidth', defaultValue: '50' },
                { key: 'resourcesdeal_defineSSmallImageHeight', element: 'defineSSmallImageHeight', defaultValue: '50' },
                { key: 'resourcesdeal_defineSSmallImageThreshold', element: 'defineSSmallImageThreshold', defaultValue: '2500' },
                { key: 'resourcesdeal_defineSSmallImageByWidth', element: 'defineSSmallImageByWidth', defaultValue: '1', type: 'checkbox' },
                { key: 'resourcesdeal_defineSSmallImageByHeight', element: 'defineSSmallImageByHeight', defaultValue: '1', type: 'checkbox' },
                { key: 'resourcesdeal_defineSSmallImageByArea', element: 'defineSSmallImageByArea', defaultValue: '1', type: 'checkbox' },
                // 移动其他大图相关配置
                { key: 'resourcesdeal_otherbigTargetPattern', element: 'otherbigTargetPattern', defaultValue: 'remotemain/staticRes/common/bg/' },
            ];

            for (const config of configs) {
                try {
                    const value = await Editor.Profile.getConfig('assetsindex', config.key);
                    const element = this.$[config.element as keyof typeof this.$] as HTMLInputElement;
                    
                    if (element) {
                        if (config.type === 'checkbox') {
                            element.checked = value === "1";
                        } else {
                            element.value = value || config.defaultValue;
                        }
                        
                        if (config.special === 'outputPath' && value) {
                            this.$.buildMapsDataResultContainer!.style.visibility = 'visible';
                        }
                    }
                } catch (error) {
                    console.warn(`无法加载配置 ${config.key}:`, error);
                }
            }

            // 初始化全局大图定义配置
            try {
                const defineWidth = parseInt(await Editor.Profile.getConfig('assetsindex', 'resourcesdeal_defineLargeImageWidth') || '400');
                const defineHeight = parseInt(await Editor.Profile.getConfig('assetsindex', 'resourcesdeal_defineLargeImageHeight') || '400');
                const defineThreshold = parseInt(await Editor.Profile.getConfig('assetsindex', 'resourcesdeal_defineLargeImageThreshold') || '160000');
                const defineByWidth = (await Editor.Profile.getConfig('assetsindex', 'resourcesdeal_defineLargeImageByWidth')) === '1';
                const defineByHeight = (await Editor.Profile.getConfig('assetsindex', 'resourcesdeal_defineLargeImageByHeight')) === '1';
                const defineByArea = (await Editor.Profile.getConfig('assetsindex', 'resourcesdeal_defineLargeImageByArea')) !== '0'; // 默认启用

                _defineBigImage = {
                    width: defineWidth,
                    height: defineHeight,
                    threshold: defineThreshold,
                    byWidth: defineByWidth,
                    byHeight: defineByHeight,
                    byArea: defineByArea,
                };

                console.log('初始化大图定义配置:', _defineBigImage);
            } catch (error) {
                console.warn('无法加载大图定义配置，使用默认值:', error);
            }

            // 初始化全局小小图定义配置
            try {
                const defineSmallWidth = parseInt(await Editor.Profile.getConfig('assetsindex', 'resourcesdeal_defineSSmallImageWidth') || '50');
                const defineSmallHeight = parseInt(await Editor.Profile.getConfig('assetsindex', 'resourcesdeal_defineSSmallImageHeight') || '50');
                const defineSmallThreshold = parseInt(await Editor.Profile.getConfig('assetsindex', 'resourcesdeal_defineSSmallImageThreshold') || '2500');
                const defineSmallByWidth = (await Editor.Profile.getConfig('assetsindex', 'resourcesdeal_defineSSmallImageByWidth')) !== '0'; // 默认启用
                const defineSmallByHeight = (await Editor.Profile.getConfig('assetsindex', 'resourcesdeal_defineSSmallImageByHeight')) !== '0'; // 默认启用
                const defineSmallByArea = (await Editor.Profile.getConfig('assetsindex', 'resourcesdeal_defineSSmallImageByArea')) !== '0'; // 默认启用

                _defineSSmallImage = {
                    width: defineSmallWidth,
                    height: defineSmallHeight,
                    threshold: defineSmallThreshold,
                    byWidth: defineSmallByWidth,
                    byHeight: defineSmallByHeight,
                    byArea: defineSmallByArea,
                };

                console.log('初始化小小图定义配置:', _defineSSmallImage);
            } catch (error) {
                console.warn('无法加载小小图定义配置，使用默认值:', error);
            }
        },
        // #endregion

        // #region 事件绑定方法
        bindEvents() {
            this.bindTabEvents();
            this.bindDataBuildEvents();
            this.bindThresholdEvents();
            this.bindCalculationEvents();
            this.bindViewResultEvents();
            this.bindMoveEvents();
            this.bindPreprocessEvents();
        },

        bindTabEvents() {
            if (this.$.tabs) {
                const tabs = this.$.tabs.querySelectorAll('.tab-button');
                tabs.forEach(tab => {
                    const tabId = tab.getAttribute('data-tab');
                    if (tabId) {
                        tab.addEventListener('click', () => this.switchTab(tabId));
                    }
                });
            }
        },

        bindDataBuildEvents() {
            if (this.$.buildmapsdatabtn) {
                this.$.buildmapsdatabtn.addEventListener('click', () => {
                    const dir = (this.$.directoryInput as HTMLInputElement)?.value;
                    this.buildMapsData(dir);
                    Editor.Profile.setConfig('assetsindex', 'resourcesdeal_input_directory', dir);
                });
            }

            if (this.$.genImageTableBtn) {
                this.$.genImageTableBtn.addEventListener('click', () => {
                    this.generateImageTable();
                });
            }

            if (this.$.deleteEmptyFoldersBtn) {
                this.$.deleteEmptyFoldersBtn.addEventListener('click', () => {
                    this.deleteEmptyFolders();
                });
            }
        },

        bindThresholdEvents() {
            this.$.bgimgWidthinput?.addEventListener('input', this.updateThreshold.bind(this));
            this.$.bgimgHeightinput?.addEventListener('input', this.updateThreshold.bind(this));
            this.updateThreshold();
            
            this.$.sizecountWidthinput?.addEventListener('input', this.updatesizeCountThreshold.bind(this));
            this.$.sizecountHeightinput?.addEventListener('input', this.updatesizeCountThreshold.bind(this));
            this.$.sizecountCountinput?.addEventListener('input', this.updatesizeCountThreshold.bind(this));
            this.updatesizeCountThreshold();
            
            this.$.preimgWidthinput?.addEventListener('input', this.updatePreImageThreshold.bind(this));
            this.$.preimgHeightinput?.addEventListener('input', this.updatePreImageThreshold.bind(this));
            this.updatePreImageThreshold();

            // 大图定义相关事件
            this.$.defineLargeImageWidth?.addEventListener('input', this.updateDefineLargeImageThreshold.bind(this));
            this.$.defineLargeImageHeight?.addEventListener('input', this.updateDefineLargeImageThreshold.bind(this));
            this.updateDefineLargeImageThreshold();

            // 小小图定义相关事件
            this.$.defineSSmallImageWidth?.addEventListener('input', this.updateDefineSSmallImageThreshold.bind(this));
            this.$.defineSSmallImageHeight?.addEventListener('input', this.updateDefineSSmallImageThreshold.bind(this));
            this.updateDefineSSmallImageThreshold();
        },

        bindCalculationEvents() {
            this.$.setIgnorePatternBtn?.addEventListener('click', () => {
                this.calculateIgnore(_dataCache?.path2info);
            });
            this.$.calculatePreSameImageBtn?.addEventListener('click', () => {
                this.calculatePreImage(_ignoreRemainingdataCache || _dataCache?.path2info);
            });
            this.$.calculateBg?.addEventListener('click', () => {
                this.calculateBg(_preImageRemainingdataCache || _ignoreRemainingdataCache || _dataCache?.path2info);
            });
            this.$.calculateCommon?.addEventListener('click', () => {
                this.calculateCommon(_ignoreRemainingdataCache || _dataCache?.path2info);
            });
            this.$.calculateSingle?.addEventListener('click', () => {
                this.calculateSingle(_commonRemainingdataCache || _dataCache?.path2info);
            });
            this.$.calculateSameDir?.addEventListener('click', () => {
                this.calculateSame(_singleRemainingdataCache || _dataCache?.path2info);
            });
            this.$.calculateSizeCount?.addEventListener('click', () => {
                this.calculateSizeCount(_sameRemainingdataCache || _dataCache?.path2info);
            });
            this.$.processAll?.addEventListener('click', () => {
                this.processAllCalculations();
            });
            this.$.lookRemaining?.addEventListener('click', () => {
                this.lookRemaining(_dataCache?.path2info);
            });
            // 大图定义按钮事件
            this.$.defineLargeImageBtn?.addEventListener('click', () => {
                this.defineLargeImages(_dataCache?.path2info);
            });
            // 小小图定义按钮事件
            this.$.defineSSmallImageBtn?.addEventListener('click', () => {
                this.defineSmallImages(_dataCache?.path2info);
            });
            // 其他大图按钮事件
            this.$.otherbigToCommonBtn?.addEventListener('click', () => {
                this.calculateOtherBigImages(_sameRemainingdataCache || _dataCache?.path2info);
            });
            // 其他小图按钮事件
            this.$.othersmallToCopyMoreBtn?.addEventListener('click', () => {
                this.calculateOtherSmallImages(_otherbigRemainingdataCache || _sameRemainingdataCache || _dataCache?.path2info);
            });
        },

        bindViewResultEvents() {
            const viewResultButtons = [
                { button: 'lookIgnorePatternResult', cache: () => _ignoreCache, message: '请先计算忽略跳过包含的内容' },
                { button: 'lookPreImageResultBtn', cache: () => _preImageCache, message: '请先计算预处理相同大图', useAlert2: true },
                { button: 'lookBgResult', cache: () => _bgdataCache, message: '请先计算大图文件夹图片数量' },
                { button: 'lookCommonResult', cache: () => _commondataCache, message: '请先计算图集文件夹图片数量' },
                { button: 'lookSingleResult', cache: () => _singledataCache, message: '请先计算单独文件夹图片数量' },
                { button: 'lookSameDirResult', cache: () => _samedataCache, message: '请先计算相同目录文件夹图片数量' },
                { button: 'lookSizeCountResult', cache: () => _sizecountdataCache, message: '请先计算按大小引用次数图片数量' },
                { button: 'lookotherbigResult', cache: () => _otherbigdataCache, message: '请先计算其他大图数量' },
                { button: 'lookothersmallResult', cache: () => _othersmalldataCache, message: '请先计算其他小图数量' },
            ];

            viewResultButtons.forEach(({ button, cache, message, useAlert2 }) => {
                this.$[button as keyof typeof this.$]?.addEventListener('click', () => {
                    const data = cache();
                    if (!data) {
                        console.warn(message);
                        return;
                    }
                    useAlert2 ? this.showAlert2(data) : this.showAlert(data);
                });
            });
        },

        bindMoveEvents() {
            // 预览移动
            this.$.PreLookmoveBgImagesBtn?.addEventListener('click', () => this.moveBgImage(true));
            this.$.PreLookmoveCommonImagesBtn?.addEventListener('click', () => this.moveCommonImage(true));
            this.$.PreLookmoveSingleImagesBtn?.addEventListener('click', () => this.moveSingleImage(true));
            this.$.PreLookmoveSameDirImagesBtn?.addEventListener('click', () => this.moveSameImage(true));
            this.$.PreLookmoveOtherbigImagesBtn?.addEventListener('click', () => this.moveOtherbigImage(true));

            // 实际移动
            this.$.moveBgImagesBtn?.addEventListener('click', () => this.moveBgImage());
            this.$.moveCommonImagesBtn?.addEventListener('click', () => this.moveCommonImage());
            this.$.moveSingleImagesBtn?.addEventListener('click', () => this.moveSingleImage());
            this.$.moveSameDirImagesBtn?.addEventListener('click', () => this.moveSameImage());
            this.$.moveOtherbigImagesBtn?.addEventListener('click', () => this.moveOtherbigImage());
        },

        bindPreprocessEvents() {
            this.$.preprocessIdenticalImagesBtn?.addEventListener('click', () => {
                this.preChangeImagesAndPrefabs();
            });
        },
        // #endregion

        // #region 数据生成方法
        generateImageTable() {
            console.log('点击了生成图片使用表按钮');
            const filePath = (this.$.buildMapsDataResultPath as HTMLInputElement)?.value;
            if (!filePath) {
                console.warn('输出数据文件路径为空');
                return;
            }

            try {
                const raw = fs.readFileSync(filePath, 'utf8');
                const parsed = JSON.parse(raw);

                _dataCache = {
                    prefabMaps_name: parsed.prefabMaps_name,
                    spriteFrameMaps_name: parsed.spriteFrameMaps_name,
                    path2info: parsed.path2info,
                };
                _spriteFrameMaps_nameCache = deepClone(_dataCache.spriteFrameMaps_name);
                console.log('成功读取缓存数据，开始渲染图片使用表');
                this.renderImageTable(_dataCache.spriteFrameMaps_name, _dataCache.path2info);
            } catch (err) {
                console.error('读取或解析数据文件失败:', err);
            }
        },
        // #endregion

        // #region 计算功能方法
        calculateIgnore(path2info: any) {
            if (!path2info) {
                console.warn('请先构建基础数据');
                return;
            }

            let _remainpath2info = deepClone(path2info);
            _remainpath2info = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => (info as any).count > 0));
            
            const pattern = (this.$.ignorePattern as HTMLInputElement).value;
            const patterns = pattern.split(',').map(p => p.trim()).filter(p => p.length > 0);
            Editor.Profile.setConfig('assetsindex', 'resourcesdeal_ignorePattern', pattern);
            
            _ignoreRemainingdataCache = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => {
                return !patterns.some(p => path.includes(p));
            }));
            
            const num_ignoreTotal = Object.keys(_remainpath2info).length - Object.keys(_ignoreRemainingdataCache).length;
            const num_ignoreRemaining = Object.keys(_ignoreRemainingdataCache).length;
            
            (this.$.ignoreTotal as HTMLInputElement).textContent = num_ignoreTotal.toString();
            (this.$.ignoreRemaining as HTMLInputElement).textContent = num_ignoreRemaining.toString();
            
            _ignoreCache = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => {
                return patterns.some(p => path.includes(p));
            }));
            
            const totalSize = Number(Object.values(_ignoreCache).reduce((sum, info: any) => sum + info.size, 0));
            (this.$.ignoreTotalSize as HTMLInputElement).textContent = formatSize(totalSize);
            
            console.log('计算忽略跳过包含的内容完成,共:', num_ignoreTotal, '剩余:', num_ignoreRemaining);
        },

        // 其他计算方法类似结构，为了简洁省略...
        calculateBg(path2info: any) {
            if (!path2info) {
                console.warn('请先构建基础数据');
                return;
            }

            let _remainpath2info = deepClone(path2info);
            _remainpath2info = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => (info as any).count > 0));
            const largeImageThreshold = parseInt((this.$.largeImageThreshold as HTMLInputElement).value) || 200000;
            
            Editor.Profile.setConfig('assetsindex','resourcesdeal_bgimgWidthinput',(this.$.bgimgWidthinput as HTMLInputElement).value);
            Editor.Profile.setConfig('assetsindex','resourcesdeal_bgimgHeightinput',(this.$.bgimgHeightinput as HTMLInputElement).value);
            Editor.Profile.setConfig('assetsindex','resourcesdeal_largeImageThreshold',(this.$.largeImageThreshold as HTMLInputElement).value);
            
            _bgRemainingdataCache = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => ((info as any).width * (info as any).height) < largeImageThreshold));
            const num_bgTotal = Object.keys(_remainpath2info).length - Object.keys(_bgRemainingdataCache).length;
            const num_bgRemaining = Object.keys(_bgRemainingdataCache).length;
            
            (this.$.bgTotal as HTMLInputElement).textContent = num_bgTotal.toString();
            (this.$.bgRemaining as HTMLInputElement).textContent = num_bgRemaining.toString();

            _bgdataCache = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => ((info as any).width * (info as any).height) >= largeImageThreshold));
            const totalSize = Number(Object.values(_bgdataCache).reduce((sum, info: any) => sum + info.size , 0));
            (this.$.bgTotalSize as HTMLInputElement).textContent = formatSize(totalSize);
            
            console.log('计算大图文件夹图片数量完成,共:',num_bgTotal,'剩余:',num_bgRemaining);
        },

        calculateCommon(path2info: any) {
            if (!path2info) {
                console.warn('请先构建基础数据');
                return;
            }

            let _remainpath2info = deepClone(path2info);
            _remainpath2info = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => (info as any).count > 0));
            const commonThreshold = parseInt((this.$.commonThreshold as HTMLInputElement).value) || 10;
            
            Editor.Profile.setConfig('assetsindex','resourcesdeal_commonThreshold',(this.$.commonThreshold as HTMLInputElement).value);
            
            _commonRemainingdataCache = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => (info as any).count < commonThreshold));
            const num_commonTotal = Object.keys(_remainpath2info).length - Object.keys(_commonRemainingdataCache).length;
            const num_commonRemaining = Object.keys(_commonRemainingdataCache).length;
            
            (this.$.commonTotal as HTMLInputElement).textContent = num_commonTotal.toString();
            (this.$.commonRemaining as HTMLInputElement).textContent = num_commonRemaining.toString();

            _commondataCache = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => (info as any).count >= commonThreshold));
            const totalSize = Number(Object.values(_commondataCache).reduce((sum, info: any) => sum + info.size , 0));
            (this.$.commonTotalSize as HTMLInputElement).textContent = formatSize(totalSize);
            
            console.log('计算Common文件夹图片数量完成,共:',num_commonTotal,'剩余:',num_commonRemaining);
        },

        calculateSingle(path2info: any) {
            if (!path2info) {
                console.warn('请先构建基础数据');
                return;
            }

            let _remainpath2info = deepClone(path2info);
            _remainpath2info = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => (info as any).count > 0));
            
            _singleRemainingdataCache = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => (info as any).count != 1));
            const num_singleTotal = Object.keys(_remainpath2info).length - Object.keys(_singleRemainingdataCache).length;
            const num_singleRemaining = Object.keys(_singleRemainingdataCache).length;
            
            (this.$.singleTotal as HTMLInputElement).textContent = num_singleTotal.toString();
            (this.$.singleRemaining as HTMLInputElement).textContent = num_singleRemaining.toString();

            _singledataCache = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => (info as any).count <= 1));
            const totalSize = Number(Object.values(_singledataCache).reduce((sum, info: any) => sum + info.size , 0));
            (this.$.singleTotalSize as HTMLInputElement).textContent = formatSize(totalSize);
            
            console.log('计算单独文件夹图片数量完成,共:',num_singleTotal,'剩余:',num_singleRemaining);
        },

        calculateSame(path2info: any) {
            if (!path2info) {
                console.warn('请先构建基础数据');
                return;
            }

            let _remainpath2info = deepClone(path2info);
            _remainpath2info = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => (info as any).count > 0));
            
            // 检查图片的引用路径是否都在同一个目录下
            const checkSameDirectory = (imagePath: string): boolean => {
                const prefabPaths = _spriteFrameMaps_nameCache[imagePath];
                if (!prefabPaths || prefabPaths.length <= 1) {
                    return false;
                }
                
                const directories = prefabPaths.map(prefabPath => {
                    const lastSlashIndex = Math.max(prefabPath.lastIndexOf('/'), prefabPath.lastIndexOf('\\'));
                    return lastSlashIndex > -1 ? prefabPath.substring(0, lastSlashIndex) : '';
                });
                
                const firstDir = directories[0];
                return directories.every(dir => dir === firstDir);
            };
            
            _samedataCache = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => {
                return checkSameDirectory(path);
            }));
            
            _sameRemainingdataCache = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => {
                return !checkSameDirectory(path);
            }));
            
            const num_sameTotal = Object.keys(_samedataCache).length;
            const num_sameRemaining = Object.keys(_sameRemainingdataCache).length;
            
            (this.$.sameDirTotal as HTMLInputElement).textContent = num_sameTotal.toString();
            (this.$.sameDirRemaining as HTMLInputElement).textContent = num_sameRemaining.toString();

            const totalSize = Number(Object.values(_samedataCache).reduce((sum, info: any) => sum + info.size , 0));
            (this.$.sameDirTotalSize as HTMLInputElement).textContent = formatSize(totalSize);
            
            console.log('计算相同目录文件夹图片数量完成,共:',num_sameTotal,'剩余:',num_sameRemaining);
        },

        calculateSizeCount(path2info: any) {
            if (!path2info) {
                console.warn('请先构建基础数据');
                return;
            }

            let _remainpath2info = deepClone(path2info);
            _remainpath2info = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => (info as any).count > 0));
            const sizeCountThreshold = parseInt((this.$.sizeCountThreshold as HTMLInputElement).value) || 1000000;
            
            Editor.Profile.setConfig('assetsindex','resourcesdeal_sizecountWidthinput',(this.$.sizecountWidthinput as HTMLInputElement).value);
            Editor.Profile.setConfig('assetsindex','resourcesdeal_sizecountHeightinput',(this.$.sizecountHeightinput as HTMLInputElement).value);
            Editor.Profile.setConfig('assetsindex','resourcesdeal_sizecountCountinput',(this.$.sizecountCountinput as HTMLInputElement).value);
            Editor.Profile.setConfig('assetsindex','resourcesdeal_sizeCountThreshold',(this.$.sizeCountThreshold as HTMLInputElement).value);
            
            _sizecountRemainingdataCache = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => (info as any).width*(info as any).height*(info as any).count > sizeCountThreshold));
            const num_sizeCountTotal = Object.keys(_remainpath2info).length - Object.keys(_sizecountRemainingdataCache).length;
            const num_sizeCountRemaining = Object.keys(_sizecountRemainingdataCache).length;
            
            (this.$.sizeCountTotal as HTMLInputElement).textContent = num_sizeCountTotal.toString();
            (this.$.sizeCountRemaining as HTMLInputElement).textContent = num_sizeCountRemaining.toString();

            _sizecountdataCache = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => (info as any).width*(info as any).height*(info as any).count <= sizeCountThreshold));
            const totalSize = Number(Object.values(_sizecountdataCache).reduce((sum: number, info: any) => sum + (info.size * info.count), 0));
            (this.$.sizeCountTotalSize as HTMLInputElement).textContent = formatSize(totalSize);
            
            console.log('计算按大小引用次数文件夹图片数量完成,共:',num_sizeCountTotal,'剩余:',num_sizeCountRemaining);
        },

        defineLargeImages(path2info: any) {
            if (!path2info) {
                console.warn('请先构建基础数据');
                return;
            }

            console.log('开始定义大图');
            
            // 保存配置
            Editor.Profile.setConfig('assetsindex','resourcesdeal_defineLargeImageWidth',(this.$.defineLargeImageWidth as HTMLInputElement).value);
            Editor.Profile.setConfig('assetsindex','resourcesdeal_defineLargeImageHeight',(this.$.defineLargeImageHeight as HTMLInputElement).value);
            Editor.Profile.setConfig('assetsindex','resourcesdeal_defineLargeImageThreshold',(this.$.defineLargeImageThreshold as HTMLInputElement).value);
            Editor.Profile.setConfig('assetsindex','resourcesdeal_defineLargeImageByWidth',(this.$.defineLargeImageByWidth as HTMLInputElement).checked ? '1' : '0');
            Editor.Profile.setConfig('assetsindex','resourcesdeal_defineLargeImageByHeight',(this.$.defineLargeImageByHeight as HTMLInputElement).checked ? '1' : '0');
            Editor.Profile.setConfig('assetsindex','resourcesdeal_defineLargeImageByArea',(this.$.defineLargeImageByArea as HTMLInputElement).checked ? '1' : '0');

            const width = parseInt((this.$.defineLargeImageWidth as HTMLInputElement).value) || 400;
            const height = parseInt((this.$.defineLargeImageHeight as HTMLInputElement).value) || 400;
            const areaThreshold = parseInt((this.$.defineLargeImageThreshold as HTMLInputElement).value) || 160000;
            
            const byWidth = (this.$.defineLargeImageByWidth as HTMLInputElement).checked;
            const byHeight = (this.$.defineLargeImageByHeight as HTMLInputElement).checked;
            const byArea = (this.$.defineLargeImageByArea as HTMLInputElement).checked;

            if (!byWidth && !byHeight && !byArea) {
                console.warn('请至少选择一种大图定义方式');
                Editor.Dialog.info('请至少选择一种大图定义方式（按宽度、按高度或按面积）', {title: '大图定义', buttons: ['我知道了']});
                return;
            }

            let _remainpath2info = deepClone(path2info);
            _remainpath2info = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => (info as any).count > 0));

            // 根据选择的条件筛选大图
            const largeImages: Record<string, any> = {};
            const normalImages: Record<string, any> = {};

            Object.entries(_remainpath2info).forEach(([path, info]) => {
                const imgInfo = info as any;
                let isLargeImage = false;

                if (byWidth && imgInfo.width >= width) {
                    isLargeImage = true;
                }
                if (byHeight && imgInfo.height >= height) {
                    isLargeImage = true;
                }
                if (byArea && (imgInfo.width * imgInfo.height) >= areaThreshold) {
                    isLargeImage = true;
                }

                if (isLargeImage) {
                    largeImages[path] = info;
                } else {
                    normalImages[path] = info;
                }
            });

            // 计算统计信息
            const largeImageCount = Object.keys(largeImages).length;
            const normalImageCount = Object.keys(normalImages).length;
            const largeImageSize = Object.values(largeImages).reduce((sum: number, info: any) => sum + info.size, 0);
            const normalImageSize = Object.values(normalImages).reduce((sum: number, info: any) => sum + info.size, 0);

            // 显示结果
            const resultMessage = `大图定义完成！\n\n定义条件：\n- 按宽度 >= ${width}px: ${byWidth ? '启用' : '禁用'}\n- 按高度 >= ${height}px: ${byHeight ? '启用' : '禁用'}\n- 按面积 >= ${areaThreshold}px²: ${byArea ? '启用' : '禁用'}\n\n结果统计：\n- 大图: ${largeImageCount} 张，总大小 ${formatSize(largeImageSize)}\n- 普通图: ${normalImageCount} 张，总大小 ${formatSize(normalImageSize)}`;

            Editor.Dialog.info(resultMessage, {title: '大图定义结果', buttons: ['我知道了']});

            // 缓存结果供其他功能使用
            _defineLargeImageCache = {
                largeImages: largeImages,
                normalImages: normalImages,
                criteria: {
                    width: width,
                    height: height,
                    areaThreshold: areaThreshold,
                    byWidth: byWidth,
                    byHeight: byHeight,
                    byArea: byArea
                },
                statistics: {
                    largeImageCount: largeImageCount,
                    normalImageCount: normalImageCount,
                    largeImageSize: largeImageSize,
                    normalImageSize: normalImageSize
                }
            };

            // 更新全局大图定义配置
            _defineBigImage = {
                width: width,
                height: height,
                threshold: areaThreshold,
                byWidth: byWidth,
                byHeight: byHeight,
                byArea: byArea,
            };

            console.log('大图定义完成:', `大图 ${largeImageCount} 张, 普通图 ${normalImageCount} 张`);
            console.log('更新大图定义配置:', _defineBigImage);
        },

        defineSmallImages(path2info: any) {
            if (!path2info) {
                console.warn('请先构建基础数据');
                return;
            }

            console.log('开始定义小小图');
            
            // 保存配置
            Editor.Profile.setConfig('assetsindex','resourcesdeal_defineSSmallImageWidth',(this.$.defineSSmallImageWidth as HTMLInputElement).value);
            Editor.Profile.setConfig('assetsindex','resourcesdeal_defineSSmallImageHeight',(this.$.defineSSmallImageHeight as HTMLInputElement).value);
            Editor.Profile.setConfig('assetsindex','resourcesdeal_defineSSmallImageThreshold',(this.$.defineSSmallImageThreshold as HTMLInputElement).value);
            Editor.Profile.setConfig('assetsindex','resourcesdeal_defineSSmallImageByWidth',(this.$.defineSSmallImageByWidth as HTMLInputElement).checked ? '1' : '0');
            Editor.Profile.setConfig('assetsindex','resourcesdeal_defineSSmallImageByHeight',(this.$.defineSSmallImageByHeight as HTMLInputElement).checked ? '1' : '0');
            Editor.Profile.setConfig('assetsindex','resourcesdeal_defineSSmallImageByArea',(this.$.defineSSmallImageByArea as HTMLInputElement).checked ? '1' : '0');

            const width = parseInt((this.$.defineSSmallImageWidth as HTMLInputElement).value) || 50;
            const height = parseInt((this.$.defineSSmallImageHeight as HTMLInputElement).value) || 50;
            const areaThreshold = parseInt((this.$.defineSSmallImageThreshold as HTMLInputElement).value) || 2500;
            
            const byWidth = (this.$.defineSSmallImageByWidth as HTMLInputElement).checked;
            const byHeight = (this.$.defineSSmallImageByHeight as HTMLInputElement).checked;
            const byArea = (this.$.defineSSmallImageByArea as HTMLInputElement).checked;

            // 更新全局配置，确保 isSSmallImage 函数使用最新设置
            _defineSSmallImage = {
                width: width,
                height: height,
                threshold: areaThreshold,
                byWidth: byWidth,
                byHeight: byHeight,
                byArea: byArea,
            };

            if (!byWidth && !byHeight && !byArea) {
                console.warn('请至少选择一种小小图定义方式');
                Editor.Dialog.info('请至少选择一种小小图定义方式（按宽度、按高度或按面积）', {title: '小小图定义', buttons: ['我知道了']});
                return;
            }

            let _remainpath2info = deepClone(path2info);
            _remainpath2info = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => (info as any).count > 0));

            // 根据选择的条件筛选小小图（注意：小小图是 <= 条件）
            const smallImages: Record<string, any> = {};
            const normalImages: Record<string, any> = {};

            Object.entries(_remainpath2info).forEach(([path, info]) => {
                const imgInfo = info as any;
                
                // 使用与 isSSmallImage 函数相同的 AND 逻辑
                const isSmallImage = isSSmallImage(imgInfo.width, imgInfo.height);

                if (isSmallImage) {
                    smallImages[path] = info;
                } else {
                    normalImages[path] = info;
                }
            });

            // 计算统计信息
            const smallImageCount = Object.keys(smallImages).length;
            const normalImageCount = Object.keys(normalImages).length;
            const smallImageSize = Object.values(smallImages).reduce((sum: number, info: any) => sum + info.size, 0);
            const normalImageSize = Object.values(normalImages).reduce((sum: number, info: any) => sum + info.size, 0);

            // 显示结果
            const resultMessage = `小小图定义完成！\n\n定义条件：\n- 按宽度 <= ${width}px: ${byWidth ? '启用' : '禁用'}\n- 按高度 <= ${height}px: ${byHeight ? '启用' : '禁用'}\n- 按面积 <= ${areaThreshold}px²: ${byArea ? '启用' : '禁用'}\n\n结果统计：\n- 小小图: ${smallImageCount} 张，总大小 ${formatSize(smallImageSize)}\n- 普通图: ${normalImageCount} 张，总大小 ${formatSize(normalImageSize)}`;

            Editor.Dialog.info(resultMessage, {title: '小小图定义结果', buttons: ['我知道了']});

            // 缓存结果供其他功能使用
            _defineSmallImageCache = {
                smallImages: smallImages,
                normalImages: normalImages,
                criteria: {
                    width: width,
                    height: height,
                    areaThreshold: areaThreshold,
                    byWidth: byWidth,
                    byHeight: byHeight,
                    byArea: byArea
                },
                statistics: {
                    smallImageCount: smallImageCount,
                    normalImageCount: normalImageCount,
                    smallImageSize: smallImageSize,
                    normalImageSize: normalImageSize
                }
            };

            // 更新全局小小图定义配置
            _defineSSmallImage = {
                width: width,
                height: height,
                threshold: areaThreshold,
                byWidth: byWidth,
                byHeight: byHeight,
                byArea: byArea,
            };

            console.log('小小图定义完成:', `小小图 ${smallImageCount} 张, 普通图 ${normalImageCount} 张`);
            console.log('更新小小图定义配置:', _defineSSmallImage);
        },

        calculateOtherBigImages(path2info: any) {
            if (!path2info) {
                console.warn('请先构建基础数据');
                return;
            }

            console.log('开始计算其他大图');
            
            let _remainpath2info = deepClone(path2info);
            _remainpath2info = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => (info as any).count > 0));
            
            // 使用isBigImage函数筛选大图
            _otherbigdataCache = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => {
                const imgInfo = info as any;
                return isBigImage(imgInfo.width, imgInfo.height);
            }));
            
            _otherbigRemainingdataCache = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => {
                const imgInfo = info as any;
                return !isBigImage(imgInfo.width, imgInfo.height);
            }));
            
            const num_otherbigTotal = Object.keys(_otherbigdataCache).length;
            const num_otherbigRemaining = Object.keys(_otherbigRemainingdataCache).length;
            
            (this.$.otherbigTotal as HTMLInputElement).textContent = num_otherbigTotal.toString();
            (this.$.otherbigRemaining as HTMLInputElement).textContent = num_otherbigRemaining.toString();

            const totalSize = Number(Object.values(_otherbigdataCache).reduce((sum: number, info: any) => sum + info.size, 0));
            (this.$.otherbigTotalSize as HTMLInputElement).textContent = formatSize(totalSize);
            
            console.log('计算其他大图完成,共:', num_otherbigTotal, '剩余:', num_otherbigRemaining);
        },

        calculateOtherSmallImages(path2info: any) {
            if (!path2info) {
                console.warn('请先构建基础数据');
                return;
            }

            console.log('开始计算其他小图');
            
            let _remainpath2info = deepClone(path2info);
            _remainpath2info = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => (info as any).count > 0));
            
            // 使用isSSmallImage函数筛选小图
            _othersmalldataCache = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => {
                const imgInfo = info as any;
                return isSSmallImage(imgInfo.width, imgInfo.height);
            }));
            
            _othersmallRemainingdataCache = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => {
                const imgInfo = info as any;
                return !isSSmallImage(imgInfo.width, imgInfo.height);
            }));
            
            const num_othersmallTotal = Object.keys(_othersmalldataCache).length;
            const num_othersmallRemaining = Object.keys(_othersmallRemainingdataCache).length;
            
            (this.$.othersmallTotal as HTMLInputElement).textContent = num_othersmallTotal.toString();
            (this.$.othersmallRemaining as HTMLInputElement).textContent = num_othersmallRemaining.toString();

            const totalSize = Number(Object.values(_othersmalldataCache).reduce((sum: number, info: any) => sum + info.size, 0));
            (this.$.othersmallTotalSize as HTMLInputElement).textContent = formatSize(totalSize);
            
            console.log('计算其他小图完成,共:', num_othersmallTotal, '剩余:', num_othersmallRemaining);
        },

        calculatePreImage(path2info: any) {
            if (!path2info) {
                console.warn('请先构建基础数据');
                return;
            }

            let _remainpath2info = deepClone(path2info);
            _remainpath2info = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => (info as any).count > 0));
            
            const preImageThreshold = parseInt((this.$.preImageThreshold as HTMLInputElement).value) || 10000;
            Editor.Profile.setConfig('assetsindex','resourcesdeal_preimgWidthinput',(this.$.preimgWidthinput as HTMLInputElement).value);
            Editor.Profile.setConfig('assetsindex','resourcesdeal_preimgHeightinput',(this.$.preimgHeightinput as HTMLInputElement).value);
            Editor.Profile.setConfig('assetsindex','resourcesdeal_preImageThreshold',(this.$.preImageThreshold as HTMLInputElement).value);
            
            // 筛选出尺寸大于阈值的图片
            const largeImages = Object.fromEntries(
                Object.entries(_remainpath2info).filter(([path, info]) => {
                    const imageSize = (info as any).width * (info as any).height;
                    return imageSize >= preImageThreshold;
                })
            );
            
            // 按MD5分组找出重复的图片
            const md5Groups: Record<string, string[]> = {};
            Object.entries(largeImages).forEach(([path, info]) => {
                const md5 = (info as any).md5;
                if (md5) {
                    if (!md5Groups[md5]) {
                        md5Groups[md5] = [];
                    }
                    md5Groups[md5].push(path);
                }
            });
            
            // 找出有重复的组
            const duplicateGroups: Record<string, string[]> = {};
            Object.entries(md5Groups).forEach(([md5, paths]) => {
                if (paths.length > 1) {
                    duplicateGroups[md5] = paths;
                }
            });
            
            const totalDuplicateFiles = Object.values(duplicateGroups).reduce((sum, paths) => sum + paths.length - 1, 0);
            
            // 构建预处理缓存数据
            _preImageCache = {
                duplicateGroups: duplicateGroups,
                keepImages: {},
                removeImages: {},
                summary: {
                    totalGroups: Object.keys(duplicateGroups).length,
                    totalDuplicateFiles: totalDuplicateFiles,
                    totalSavedSize: 0
                }
            };
            
            // 计算要保留和删除的图片
            let totalSavedSize = 0;
            Object.entries(duplicateGroups).forEach(([md5, paths]) => {
                const keepImage = paths[0];
                const removeImages = paths.slice(1);
                
                _preImageCache.keepImages[md5] = {
                    path: keepImage,
                    info: largeImages[keepImage],
                    originalReferences: _dataCache.spriteFrameMaps_name[keepImage] || []
                };
                
                _preImageCache.removeImages[md5] = removeImages.map(path => ({
                    path: path,
                    info: largeImages[path],
                    references: _dataCache.spriteFrameMaps_name[path] || []
                }));
                
                const imageSize = (largeImages[keepImage] as any).size;
                totalSavedSize += imageSize * (paths.length - 1);
            });
            
            _preImageCache.summary.totalSavedSize = totalSavedSize;
            
            // 更新缓存数据
            if (!_spriteFrameMaps_nameCache) {
                _spriteFrameMaps_nameCache = deepClone(_dataCache.spriteFrameMaps_name);
            }
            
            Object.entries(duplicateGroups).forEach(([md5, paths]) => {
                const keepImage = paths[0];
                const removeImages = paths.slice(1);
                
                let allReferences: string[] = [];
                paths.forEach(path => {
                    const refs = _spriteFrameMaps_nameCache[path] || [];
                    allReferences = allReferences.concat(refs);
                });
                
                allReferences = Array.from(new Set(allReferences)).sort();
                _spriteFrameMaps_nameCache[keepImage] = allReferences;
                
                removeImages.forEach(path => {
                    delete _spriteFrameMaps_nameCache[path];
                });
            });
            
            // 计算剩余数据
            const duplicatePathsSet = new Set<string>();
            Object.values(duplicateGroups).forEach(paths => {
                for (let i = 1; i < paths.length; i++) {
                    duplicatePathsSet.add(paths[i]);
                }
            });
            
            _preImageRemainingdataCache = Object.fromEntries(
                Object.entries(_remainpath2info).filter(([path, info]) => {
                    return !duplicatePathsSet.has(path);
                })
            );
            
            // 更新UI显示
            const duplicateCount = duplicatePathsSet.size;
            const remainingCount = Object.keys(_preImageRemainingdataCache).length;
            
            (this.$.preImageTotal as HTMLInputElement).textContent = totalDuplicateFiles.toString();
            (this.$.preImagesaving as HTMLInputElement).textContent = Object.keys(duplicateGroups).length.toString();
            (this.$.preImageRemaining as HTMLInputElement).textContent = remainingCount.toString();
            
            console.log(`预处理相同大图完成: 删除图片 ${totalDuplicateFiles} 张, 保留组 ${Object.keys(duplicateGroups).length} 组, 剩余 ${remainingCount} 张, 节省空间 ${formatSize(totalSavedSize)}`);
        },
        lookRemaining(){
            console.log('查看剩余未处理图片');
            
            if (!_dataCache || !_dataCache.path2info) {
                console.warn('请先构建基础数据，双向索引表');
                return;
            }
            
            // 从下往上找最后一个有数据的缓存
            const remainingCaches = [
                { name: '其他小图剩余', cache: _othersmallRemainingdataCache, description: '经过其他小图筛选后的剩余图片' },
                { name: '其他大图剩余', cache: _otherbigRemainingdataCache, description: '经过其他大图筛选后的剩余图片' },
                { name: '按大小引用次数剩余', cache: _sizecountRemainingdataCache, description: '经过按大小引用次数筛选后的剩余图片' },
                { name: '相同目录剩余', cache: _sameRemainingdataCache, description: '经过相同目录筛选后的剩余图片' },
                { name: '单独文件剩余', cache: _singleRemainingdataCache, description: '经过单独文件筛选后的剩余图片' },
                { name: 'Common图剩余', cache: _commonRemainingdataCache, description: '经过Common图筛选后的剩余图片' },
                { name: '大图剩余', cache: _bgRemainingdataCache, description: '经过大图筛选后的剩余图片' },
                { name: '预处理相同图剩余', cache: _preImageRemainingdataCache, description: '经过预处理相同图筛选后的剩余图片' },
                { name: '忽略模式剩余', cache: _ignoreRemainingdataCache, description: '经过忽略模式筛选后的剩余图片' },
            ];
            
            // 从下往上找第一个有数据的缓存
            let foundCache = null;
            for (const cacheInfo of remainingCaches) {
                if (cacheInfo.cache && Object.keys(cacheInfo.cache).length > 0) {
                    foundCache = cacheInfo;
                    break;
                }
            }
            
            if (!foundCache) {
                // 如果所有剩余缓存都没有数据，显示原始数据
                const originalRemaining = Object.fromEntries(
                    Object.entries(_dataCache.path2info).filter(([path, info]) => (info as any).count > 0)
                );
                
                if (Object.keys(originalRemaining).length === 0) {
                    Editor.Dialog.info('没有剩余未处理的图片', {title: '查看剩余图片', buttons: ['我知道了']});
                    return;
                }
                
                const totalSize = Number(Object.values(originalRemaining).reduce((sum: number, info: any) => sum + info.size, 0));
                const message = `查看原始剩余图片\n\n描述：所有被引用的图片（未经过任何筛选）\n\n统计：\n- 图片数量：${Object.keys(originalRemaining).length} 张\n- 总大小：${formatSize(totalSize)}`;
                
                Editor.Dialog.info(message, {title: '查看剩余图片', buttons: ['查看详情', '我知道了']})
                .then((result) => {
                    if (result.response === 0) { // 用户点击了查看详情
                        this.showAlert2(originalRemaining);
                    }
                });
                return;
            }
            
            // 显示找到的剩余数据
            const totalSize = Number(Object.values(foundCache.cache).reduce((sum: number, info: any) => sum + info.size, 0));
            const message = `查看${foundCache.name}\n\n描述：${foundCache.description}\n\n统计：\n- 图片数量：${Object.keys(foundCache.cache).length} 张\n- 总大小：${formatSize(totalSize)}`;
            
            Editor.Dialog.info(message, {title: '查看剩余图片', buttons: ['查看详情', '我知道了']})
            .then((result) => {
                if (result.response === 0) { // 用户点击了查看详情
                    this.showAlert2(foundCache.cache);
                }
            });
            
            console.log(`查看剩余未处理图片完成：${foundCache.name}，共 ${Object.keys(foundCache.cache).length} 张`);
        },
        processAllCalculations() {
            // 一键处理所有计算
            if (!_dataCache || !_dataCache.path2info) {
                console.warn('请先构建基础数据，双向索引表');
                return;
            }

            this.calculateIgnore(_dataCache.path2info);
            if (_ignoreRemainingdataCache) {
                this.calculatePreImage(_ignoreRemainingdataCache);
            }
            // if (_preImageRemainingdataCache) {
            //     this.calculateBg(_preImageRemainingdataCache);
            // }
            if (_preImageRemainingdataCache) {
                this.calculateCommon(_preImageRemainingdataCache);
            }
            if (_commonRemainingdataCache) {
                this.calculateSingle(_commonRemainingdataCache);
            }
            if (_singleRemainingdataCache) {
                this.calculateSame(_singleRemainingdataCache);
            }
            if (_sameRemainingdataCache) {
                this.calculateSizeCount(_sameRemainingdataCache);
            }
        },
        // #endregion

        // #region 移动功能方法
        moveImages(config: {
            type: 'bg' | 'common' | 'single',
            dataCache: any,
            prefabRegex?: string,
            targetPattern: string,
            bigTargetPattern?: string,
            configKeys: string[],
            title: string,
            checkMessage: string,
            preLook?: boolean,
        }) {
            console.log(`点击了移动${config.title}按钮`);
            
            // 检查冲突处理方式
            const caseConflictKeepOld = (this.$.caseConflictKeepOld as HTMLInputElement).checked;
            const caseConflictUseNew = (this.$.caseConflictUseNew as HTMLInputElement).checked;
            if(!caseConflictKeepOld && !caseConflictUseNew) {
                console.warn('请选择冲突处理方式');
                Editor.Dialog.info('请选择冲突处理方式',{title:'冲突处理方式', buttons:['我知道了']});
                return;
            }

            // 保存配置
            Editor.Profile.setConfig('assetsindex','resourcesdeal_caseConflictKeepOld',caseConflictKeepOld?'1':'0');
            Editor.Profile.setConfig('assetsindex','resourcesdeal_caseConflictUseNew',caseConflictUseNew?'1':'0');
            config.configKeys.forEach(key => {
                const element = this.$[key as keyof typeof this.$] as HTMLInputElement;
                if (element) {
                    Editor.Profile.setConfig('assetsindex', `resourcesdeal_${key}`, element.value);
                }
            });

            // 检查数据缓存
            if(!config.dataCache) {
                console.warn(config.checkMessage);
                return;
            }

            // 预计算每个图片的大小判断结果
            const imageSizeMap: Record<string, boolean> = {};
            Object.entries(config.dataCache).forEach(([imgPath, info]: [string, any]) => {
                imageSizeMap[imgPath] = isBigImage(info.width || 0, info.height || 0);
            });

            // 检查自动重命名选项
            const autoRename = (this.$.autoRename as HTMLInputElement).checked;

            // 构建请求参数
            const requestParams: any = {
                method: 'moveBgImages',
                spriteFrameMaps_name: _spriteFrameMaps_nameCache,
                path2info: config.dataCache,
                bgTargetPattern: config.targetPattern,
                bigTargetPattern: config.bigTargetPattern, // 添加大图目标路径
                imageSizeMap: imageSizeMap, // 传递预计算的大小判断结果
                keepOld: caseConflictKeepOld,
                preLook: config.preLook || false,
                autoRename: autoRename, // 传递自动重命名选项
            };

            // 如果有prefabRegex参数，添加到请求中
            if (config.prefabRegex) {
                requestParams.bgPrefabRegex = config.prefabRegex;
            }

            // 发送移动请求
            Editor.Message.request('assetsindex', 'dynamic-message', requestParams)
            .then((data)=>{
                if(config.preLook) {
                    this.showAlert2(data);
                    return;
                }
                console.log(`渲染进程：移动${config.title}完成`);
                Editor.Dialog.info(`${config.title}移动完成，已移动 ${data.movedCount} 张图片`,{title:`移动${config.title}`, buttons:['我知道了']});
            })
            .catch(err => {
                console.error(`渲染进程：移动失败`, err);
            });
        },

        moveBgImage(preLook = false) {
            const bgPrefabRegex = (this.$.bgPrefabRegex as HTMLInputElement).value;
            const bgTargetPattern = (this.$.bgTargetPattern as HTMLInputElement).value;
            this.moveImages({
                type: 'bg',
                dataCache: _bgdataCache,
                prefabRegex: bgPrefabRegex,
                targetPattern: bgTargetPattern,
                configKeys: ['bgPrefabRegex', 'bgTargetPattern'],
                title: '大图',
                checkMessage: '请先计算大图设置',
                preLook
            });
        },

        moveCommonImage(preLook = false) {
            const commonTargetPattern = (this.$.commonTargetPattern as HTMLInputElement).value;
            const bigcommonTargetPattern = (this.$.bigcommonTargetPattern as HTMLInputElement).value;
            this.moveImages({
                type: 'common',
                dataCache: _commondataCache,
                targetPattern: commonTargetPattern,
                bigTargetPattern: bigcommonTargetPattern,
                configKeys: ['commonTargetPattern', 'bigcommonTargetPattern'],
                title: 'common图',
                checkMessage: '请先计算图集设置',
                preLook
            });
        },

        moveSingleImage(preLook = false) {
            const singlePrefabRegex = (this.$.singlePrefabRegex as HTMLInputElement).value;
            const singleTargetPattern = (this.$.singleTargetPattern as HTMLInputElement).value;
            const bigsingleTargetPattern = (this.$.bigsingleTargetPattern as HTMLInputElement).value;
            this.moveImages({
                type: 'single',
                dataCache: _singledataCache,
                prefabRegex: singlePrefabRegex,
                targetPattern: singleTargetPattern,
                bigTargetPattern: bigsingleTargetPattern,
                configKeys: ['singlePrefabRegex', 'singleTargetPattern', 'bigsingleTargetPattern'],
                title: '单独图',
                checkMessage: '请先计算单独文件设置',
                preLook
            });
        },

        moveSameImage(preLook = false) {
            const sameDirPrefabRegex = (this.$.sameDirPrefabRegex as HTMLInputElement).value;
            const sameDirTargetPattern = (this.$.sameDirTargetPattern as HTMLInputElement).value;
            const bigsameDirTargetPattern = (this.$.bigsameDirTargetPattern as HTMLInputElement).value;
            this.moveImages({
                type: 'single',
                dataCache: _samedataCache,
                prefabRegex: sameDirPrefabRegex,
                targetPattern: sameDirTargetPattern,
                bigTargetPattern: bigsameDirTargetPattern,
                configKeys: ['sameDirPrefabRegex', 'sameDirTargetPattern', 'bigsameDirTargetPattern'],
                title: '相同目录图',
                checkMessage: '请先计算相同目录文件设置',
                preLook
            });
        },

        moveOtherbigImage(preLook = false) {
            const otherbigTargetPattern = (this.$.otherbigTargetPattern as HTMLInputElement).value;
            this.moveImages({
                type: 'common',
                dataCache: _otherbigdataCache,
                targetPattern: otherbigTargetPattern,
                configKeys: ['otherbigTargetPattern'],
                title: '其他大图',
                checkMessage: '请先计算其他大图设置',
                preLook
            });
        },

        preChangeImagesAndPrefabs() {
            if(!_preImageCache) {
                console.warn('请先计算预处理相同大图');
                Editor.Dialog.info('请先计算预处理相同大图', {title: '预处理提示', buttons: ['我知道了']});
                return;
            }
            
            // 检查是否有重复图片需要处理
            if (!_preImageCache.duplicateGroups || Object.keys(_preImageCache.duplicateGroups).length === 0) {
                console.log('没有重复的图片需要处理');
                Editor.Dialog.info('没有重复的图片需要处理', {title: '预处理结果', buttons: ['我知道了']});
                return;
            }
            
            // 确认操作
            const groupCount = Object.keys(_preImageCache.duplicateGroups).length;
            const duplicateCount = _preImageCache.summary.totalDuplicateFiles;
            const savedSizeStr = formatSize(_preImageCache.summary.totalSavedSize);

            const confirmMessage = `将要处理 ${groupCount} 组重复图片，删除 ${duplicateCount} 个重复文件，节省空间 ${savedSizeStr}。\n\n此操作将：\n1. 修改预制体文件中的引用指向\n2. 删除重复的图片文件\n3. 刷新资源数据库\n\n确定要继续吗？`;

            Editor.Dialog.warn(confirmMessage, {
                title: '确认预处理操作',
                buttons: ['确定', '取消']
            }).then((result) => {
                if (result.response === 0) { // 用户点击了确定
                    console.log('开始执行预处理相同大图操作...');
                    
                    Editor.Message.request('assetsindex', 'dynamic-message', {
                        method: 'preChangeImagesAndPrefabs',
                        preImageCache: _preImageCache,
                        
                    }).then((data)=>{
                        console.log('预处理完成:', data);
                        
                        if (data.success) {
                            const successMessage = data.message + 
                                `\n\n详细信息：\n- 处理的预制体文件: ${data.processedFiles} 个\n- 删除的重复图片: ${data.deletedFiles} 个\n- 重复组数: ${data.totalGroups}`;
                                
                            Editor.Dialog.info(successMessage, {
                                title: '预处理完成',
                                buttons: ['我知道了']
                            });
                            
                            // 清空预处理缓存，因为操作已完成
                            _preImageCache = null;
                            
                            // 更新UI显示
                            (this.$.preImageTotal as HTMLInputElement).textContent = '0';
                            (this.$.preImagesaving as HTMLInputElement).textContent = '0';
                            
                        } else {
                            Editor.Dialog.error(`预处理失败: ${data.message}`, {
                                title: '预处理错误',
                                buttons: ['我知道了']
                            });
                        }
                        
                        if (data.errors && data.errors.length > 0) {
                            console.warn('预处理过程中的错误:', data.errors);
                        }
                        
                    }).catch(err => {
                        console.error('预处理请求失败:', err);
                        Editor.Dialog.error(`预处理请求失败: ${err.message}`, {
                            title: '预处理错误',
                            buttons: ['我知道了']
                        });
                    });
                } else {
                    console.log('用户取消了预处理操作');
                }
            });
        },
        // #endregion

        // #region 初始化方法
        initializeClusterize() {
            setTimeout(() => {
                try {
                    // @ts-ignore
                    const Clusterize = require('../../../static/libs/clusterize.js');
                    if (!Clusterize) {
                        console.error('Clusterize.js 未正确加载');
                        return;
                    }

                    this._clusterize = new Clusterize({
                        scrollElem: this.$.scrollArea,
                        contentElem: this.$.contentArea,
                        rows: [],
                        no_data_text: '暂无图片引用数据',
                    });
                } catch (error) {
                    console.error('Clusterize 初始化失败:', error);
                }
            }, 1000);
        },

        // 删除空文件夹
        async deleteEmptyFolders() {
            console.log('开始删除空文件夹...');
            
            try {
                const result = await Editor.Message.request('assetsindex', 'dynamic-message', {
                    method: 'deleteEmptyFolders'
                });
                
                if (result.success) {
                    Editor.Dialog.info(
                        `删除完成！\n删除了 ${result.deletedCount} 个空文件夹`, 
                        { title: '删除空文件夹', buttons: ['我知道了'] }
                    );
                    
                    if (result.deletedFolders && result.deletedFolders.length > 0) {
                        console.log('已删除的空文件夹:', result.deletedFolders);
                    }
                } else {
                    Editor.Dialog.error(result.message || '删除失败', { title: '错误' });
                }
            } catch (error) {
                console.error('删除空文件夹时出错:', error);
                Editor.Dialog.error(`删除失败: ${error.message}`, { title: '错误' });
            }
        },
        // #endregion
    },

    async ready() {
        try {
            // 初始化配置
            await this.initializeConfigurations();
            
            // 绑定事件
            this.bindEvents();
            
            // 初始化 Clusterize
            this.initializeClusterize();
            
            console.log('ResourcesDeal 面板初始化完成');
        } catch (error) {
            console.error('ResourcesDeal 面板初始化失败:', error);
        }
    },

    beforeClose() { },
    close() { },
});
