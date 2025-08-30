"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const fs = require('fs-extra');
// #region 全局数据缓存
let _dataCache = null;
let _spriteFrameMaps_nameCache = null;
let _ignoreCache = null;
let _preImageCache = null;
let _bgdataCache = null;
let _commondataCache = null;
let _singledataCache = null;
let _samedataCache = null;
let _sizecountdataCache = null;
let _otherbigdataCache = null;
let _othersmalldataCache = null;
let _ignoreRemainingdataCache = null;
let _preImageRemainingdataCache = null;
let _bgRemainingdataCache = null;
let _commonRemainingdataCache = null;
let _singleRemainingdataCache = null;
let _sameRemainingdataCache = null;
let _sizecountRemainingdataCache = null;
let _otherbigRemainingdataCache = null;
let _othersmallRemainingdataCache = null;
let _defineLargeImageCache = null; // 大图定义缓存
let _defineSmallImageCache = null; // 小小图定义缓存
let _defineBigImage = {
    width: 500,
    height: 500,
    threshold: 500 * 500,
    byWidth: false,
    byHeight: false,
    byArea: true,
};
let _defineSSmallImage = {
    width: 50,
    height: 50,
    threshold: 50 * 50,
    byWidth: false,
    byHeight: false,
    byArea: true,
}; // 小图定义缓存
// #endregion
// #region 工具函数
function isBigImage(width, height) {
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
function isSSmallImage(width, height) {
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
function formatSize(bytes) {
    if (bytes >= 1024 * 1024) {
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
    else {
        return (bytes / 1024).toFixed(2) + ' KB';
    }
}
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
// #endregion
module.exports = Editor.Panel.define({
    listeners: {
        show() { console.log('show'); },
        hide() { console.log('hide'); },
    },
    template: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/template/resourcesdeal/index.html'), 'utf-8'),
    style: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/style/resourcesdeal/index.css'), 'utf-8'),
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
    },
    methods: {
        // #region 基础功能方法
        switchTab(tabId) {
            const tabs = this.$.tabs.querySelectorAll('.tab-button');
            const panels = this.$.content.querySelectorAll('.tab-content');
            panels.forEach(panel => {
                panel.style.display = 'none';
            });
            tabs.forEach(tab => tab.classList.remove('active'));
            const activeTab = this.$.tabs.querySelector(`.tab-button[data-tab="${tabId}"]`);
            const activePanel = this.$.content.querySelector(`#${tabId}`);
            activeTab === null || activeTab === void 0 ? void 0 : activeTab.classList.add('active');
            if (activePanel) {
                activePanel.style.display = 'block';
            }
        },
        // #endregion
        // #region 阈值更新方法
        updateThreshold() {
            const w = parseInt(this.$.bgimgWidthinput.value) || 0;
            const h = parseInt(this.$.bgimgHeightinput.value) || 0;
            this.$.largeImageThreshold.value = w * h;
        },
        updatesizeCountThreshold() {
            const w = parseInt(this.$.sizecountWidthinput.value) || 0;
            const h = parseInt(this.$.sizecountHeightinput.value) || 0;
            const c = parseInt(this.$.sizecountCountinput.value) || 0;
            this.$.sizeCountThreshold.value = w * h * c;
        },
        updatePreImageThreshold() {
            const w = parseInt(this.$.preimgWidthinput.value) || 0;
            const h = parseInt(this.$.preimgHeightinput.value) || 0;
            this.$.preImageThreshold.value = w * h;
        },
        updateDefineLargeImageThreshold() {
            const w = parseInt(this.$.defineLargeImageWidth.value) || 0;
            const h = parseInt(this.$.defineLargeImageHeight.value) || 0;
            this.$.defineLargeImageThreshold.value = (w * h).toString();
        },
        updateDefineSSmallImageThreshold() {
            const w = parseInt(this.$.defineSSmallImageWidth.value) || 0;
            const h = parseInt(this.$.defineSSmallImageHeight.value) || 0;
            this.$.defineSSmallImageThreshold.value = (w * h).toString();
        },
        // #endregion
        // #region 数据处理方法
        buildMapsData(dir) {
            console.log('点击了构建基础数据按钮');
            Editor.Message.request('assetsindex', 'dynamic-message', { method: 'buildMapsData', dir: dir })
                .then((data) => {
                Editor.Dialog.info(`构建完成，数据缓存成功,路径:${data.out2}`, { title: '构建完成', buttons: ['我知道了'] });
                _dataCache = data;
                this.$.buildMapsDataResultContainer.style.visibility = 'visible';
                this.$.buildMapsDataResultPath.value = data.out2;
                Editor.Profile.setConfig('assetsindex', 'resourcesdeal_outputdata2_directory', data.out2);
            });
        },
        // #endregion
        // #region 表格渲染方法
        renderImageTable(spriteFrameMaps_name, path2info) {
            console.log('开始渲染图片表格，数据量:', Object.keys(spriteFrameMaps_name).length);
            if (!spriteFrameMaps_name || Object.keys(spriteFrameMaps_name).length === 0) {
                console.warn('spriteFrameMaps_name 数据为空');
                return;
            }
            const rows = Object.entries(spriteFrameMaps_name)
                .map(([img, prefabs]) => {
                var _a;
                return ({
                    img,
                    count: prefabs.length,
                    size: ((_a = path2info[img]) === null || _a === void 0 ? void 0 : _a.size) || 0,
                    prefabs: prefabs.slice().sort((a, b) => a.localeCompare(b)),
                });
            })
                .sort((a, b) => {
                if (a.count !== b.count)
                    return a.count - b.count;
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
            }
            else {
                const tbody = this.$.imageTable.querySelector('tbody');
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
            const statsMap = {};
            rows.forEach(row => {
                if (!statsMap[row.count])
                    statsMap[row.count] = { total: 0, size: 0 };
                statsMap[row.count].total += 1;
                statsMap[row.count].size += row.size;
            });
            const statsDiv = this.$.imageStatsContent;
            statsDiv.innerHTML = '';
            for (const [count, info] of Object.entries(statsMap)) {
                const div = document.createElement('div');
                div.textContent = `${count} 次引用: ${info.total} 张图片, 总大小 ${formatSize(info.size)}`;
                statsDiv.appendChild(div);
            }
            const unusedCount = Object.values(path2info).filter((info) => info.count === 0).length;
            this.$.imageStatsPicUsed.textContent = `共 ${rows.length} 张图片被引用, ${unusedCount} 张未被引用`;
        },
        renderPrefabTable(prefabMaps_name, spriteFrameMaps_name) {
            const tbody = this.$.prefabTable.querySelector('tbody');
            tbody.innerHTML = '';
            const imgCountMap = {};
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
        showAlert(msg) {
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
        showAlert2(msg) {
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
            const createTreeNode = (obj, key = '', level = 0, isRoot = false) => {
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
                    }
                    else {
                        toggle.textContent = obj.length === 0 ? '' : '▶';
                    }
                    const label = document.createElement('span');
                    label.style.color = '#666';
                    label.textContent = `${key}: Array[${obj.length}]`;
                    const childContainer = document.createElement('div');
                    childContainer.style.display = (obj.length === 0) ? 'none' : (isRoot ? 'block' : 'none');
                    if (obj.length === 0) {
                        label.textContent += ' []';
                    }
                    else {
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
                }
                else {
                    toggle.textContent = keys.length === 0 ? '' : '▶';
                }
                const label = document.createElement('span');
                label.style.color = '#666';
                // 生成对象预览
                let preview = '';
                if (keys.length === 0) {
                    preview = ' {}';
                }
                else {
                    const firstKey = keys[0];
                    const firstValue = obj[firstKey];
                    if (typeof firstValue === 'string') {
                        // 如果第一个值是字符串，显示前15个字符
                        const truncatedValue = firstValue.length > 15 ? firstValue.substring(0, 15) + '...' : firstValue;
                        preview = ` {${firstKey}: "${truncatedValue}"...}`;
                    }
                    else if (typeof firstValue === 'number' || typeof firstValue === 'boolean') {
                        // 如果是数字或布尔值，直接显示
                        preview = ` {${firstKey}: ${firstValue}...}`;
                    }
                    else {
                        // 其他类型只显示键名
                        preview = ` {${firstValue}...}`;
                    }
                }
                label.textContent = `${key}: ${preview}..(${keys.length})`;
                const childContainer = document.createElement('div');
                childContainer.style.display = (keys.length === 0) ? 'none' : (isRoot ? 'block' : 'none');
                if (keys.length === 0) {
                    // 空对象不需要额外处理，已在预览中显示
                }
                else {
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
            const expandAll = header.querySelector('#expandAll');
            const collapseAll = header.querySelector('#collapseAll');
            const closeModal = header.querySelector('#closeModal');
            expandAll.addEventListener('click', () => {
                const allContainers = content.querySelectorAll('div div');
                const allToggles = content.querySelectorAll('span[style*="cursor: pointer"]');
                allContainers.forEach(container => {
                    container.style.display = 'block';
                });
                allToggles.forEach(toggle => {
                    if (toggle.textContent && toggle.textContent.trim() && toggle.style.cursor !== 'default') {
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
                        container.style.display = 'none';
                    }
                });
                allToggles.forEach(toggle => {
                    if (toggle.textContent && toggle.textContent.trim() && toggle.style.cursor !== 'default') {
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
                if (e.target.tagName !== 'BUTTON') {
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
            ];
            for (const config of configs) {
                try {
                    const value = await Editor.Profile.getConfig('assetsindex', config.key);
                    const element = this.$[config.element];
                    if (element) {
                        if (config.type === 'checkbox') {
                            element.checked = value === "1";
                        }
                        else {
                            element.value = value || config.defaultValue;
                        }
                        if (config.special === 'outputPath' && value) {
                            this.$.buildMapsDataResultContainer.style.visibility = 'visible';
                        }
                    }
                }
                catch (error) {
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
            }
            catch (error) {
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
            }
            catch (error) {
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
                    var _a;
                    const dir = (_a = this.$.directoryInput) === null || _a === void 0 ? void 0 : _a.value;
                    this.buildMapsData(dir);
                    Editor.Profile.setConfig('assetsindex', 'resourcesdeal_input_directory', dir);
                });
            }
            if (this.$.genImageTableBtn) {
                this.$.genImageTableBtn.addEventListener('click', () => {
                    this.generateImageTable();
                });
            }
        },
        bindThresholdEvents() {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
            (_a = this.$.bgimgWidthinput) === null || _a === void 0 ? void 0 : _a.addEventListener('input', this.updateThreshold.bind(this));
            (_b = this.$.bgimgHeightinput) === null || _b === void 0 ? void 0 : _b.addEventListener('input', this.updateThreshold.bind(this));
            this.updateThreshold();
            (_c = this.$.sizecountWidthinput) === null || _c === void 0 ? void 0 : _c.addEventListener('input', this.updatesizeCountThreshold.bind(this));
            (_d = this.$.sizecountHeightinput) === null || _d === void 0 ? void 0 : _d.addEventListener('input', this.updatesizeCountThreshold.bind(this));
            (_e = this.$.sizecountCountinput) === null || _e === void 0 ? void 0 : _e.addEventListener('input', this.updatesizeCountThreshold.bind(this));
            this.updatesizeCountThreshold();
            (_f = this.$.preimgWidthinput) === null || _f === void 0 ? void 0 : _f.addEventListener('input', this.updatePreImageThreshold.bind(this));
            (_g = this.$.preimgHeightinput) === null || _g === void 0 ? void 0 : _g.addEventListener('input', this.updatePreImageThreshold.bind(this));
            this.updatePreImageThreshold();
            // 大图定义相关事件
            (_h = this.$.defineLargeImageWidth) === null || _h === void 0 ? void 0 : _h.addEventListener('input', this.updateDefineLargeImageThreshold.bind(this));
            (_j = this.$.defineLargeImageHeight) === null || _j === void 0 ? void 0 : _j.addEventListener('input', this.updateDefineLargeImageThreshold.bind(this));
            this.updateDefineLargeImageThreshold();
            // 小小图定义相关事件
            (_k = this.$.defineSSmallImageWidth) === null || _k === void 0 ? void 0 : _k.addEventListener('input', this.updateDefineSSmallImageThreshold.bind(this));
            (_l = this.$.defineSSmallImageHeight) === null || _l === void 0 ? void 0 : _l.addEventListener('input', this.updateDefineSSmallImageThreshold.bind(this));
            this.updateDefineSSmallImageThreshold();
        },
        bindCalculationEvents() {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
            (_a = this.$.setIgnorePatternBtn) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
                this.calculateIgnore(_dataCache === null || _dataCache === void 0 ? void 0 : _dataCache.path2info);
            });
            (_b = this.$.calculatePreSameImageBtn) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => {
                this.calculatePreImage(_ignoreRemainingdataCache || (_dataCache === null || _dataCache === void 0 ? void 0 : _dataCache.path2info));
            });
            (_c = this.$.calculateBg) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => {
                this.calculateBg(_preImageRemainingdataCache || _ignoreRemainingdataCache || (_dataCache === null || _dataCache === void 0 ? void 0 : _dataCache.path2info));
            });
            (_d = this.$.calculateCommon) === null || _d === void 0 ? void 0 : _d.addEventListener('click', () => {
                this.calculateCommon(_ignoreRemainingdataCache || (_dataCache === null || _dataCache === void 0 ? void 0 : _dataCache.path2info));
            });
            (_e = this.$.calculateSingle) === null || _e === void 0 ? void 0 : _e.addEventListener('click', () => {
                this.calculateSingle(_commonRemainingdataCache || (_dataCache === null || _dataCache === void 0 ? void 0 : _dataCache.path2info));
            });
            (_f = this.$.calculateSameDir) === null || _f === void 0 ? void 0 : _f.addEventListener('click', () => {
                this.calculateSame(_singleRemainingdataCache || (_dataCache === null || _dataCache === void 0 ? void 0 : _dataCache.path2info));
            });
            (_g = this.$.calculateSizeCount) === null || _g === void 0 ? void 0 : _g.addEventListener('click', () => {
                this.calculateSizeCount(_sameRemainingdataCache || (_dataCache === null || _dataCache === void 0 ? void 0 : _dataCache.path2info));
            });
            (_h = this.$.processAll) === null || _h === void 0 ? void 0 : _h.addEventListener('click', () => {
                this.processAllCalculations();
            });
            (_j = this.$.lookRemaining) === null || _j === void 0 ? void 0 : _j.addEventListener('click', () => {
                this.lookRemaining(_dataCache === null || _dataCache === void 0 ? void 0 : _dataCache.path2info);
            });
            // 大图定义按钮事件
            (_k = this.$.defineLargeImageBtn) === null || _k === void 0 ? void 0 : _k.addEventListener('click', () => {
                this.defineLargeImages(_dataCache === null || _dataCache === void 0 ? void 0 : _dataCache.path2info);
            });
            // 小小图定义按钮事件
            (_l = this.$.defineSSmallImageBtn) === null || _l === void 0 ? void 0 : _l.addEventListener('click', () => {
                this.defineSmallImages(_dataCache === null || _dataCache === void 0 ? void 0 : _dataCache.path2info);
            });
            // 其他大图按钮事件
            (_m = this.$.otherbigToCommonBtn) === null || _m === void 0 ? void 0 : _m.addEventListener('click', () => {
                this.calculateOtherBigImages(_sameRemainingdataCache || (_dataCache === null || _dataCache === void 0 ? void 0 : _dataCache.path2info));
            });
            // 其他小图按钮事件
            (_o = this.$.othersmallToCopyMoreBtn) === null || _o === void 0 ? void 0 : _o.addEventListener('click', () => {
                this.calculateOtherSmallImages(_otherbigRemainingdataCache || _sameRemainingdataCache || (_dataCache === null || _dataCache === void 0 ? void 0 : _dataCache.path2info));
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
                var _a;
                (_a = this.$[button]) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
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
            var _a, _b, _c, _d, _e, _f, _g, _h;
            // 预览移动
            (_a = this.$.PreLookmoveBgImagesBtn) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => this.moveBgImage(true));
            (_b = this.$.PreLookmoveCommonImagesBtn) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => this.moveCommonImage(true));
            (_c = this.$.PreLookmoveSingleImagesBtn) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => this.moveSingleImage(true));
            (_d = this.$.PreLookmoveSameDirImagesBtn) === null || _d === void 0 ? void 0 : _d.addEventListener('click', () => this.moveSameImage(true));
            // 实际移动
            (_e = this.$.moveBgImagesBtn) === null || _e === void 0 ? void 0 : _e.addEventListener('click', () => this.moveBgImage());
            (_f = this.$.moveCommonImagesBtn) === null || _f === void 0 ? void 0 : _f.addEventListener('click', () => this.moveCommonImage());
            (_g = this.$.moveSingleImagesBtn) === null || _g === void 0 ? void 0 : _g.addEventListener('click', () => this.moveSingleImage());
            (_h = this.$.moveSameDirImagesBtn) === null || _h === void 0 ? void 0 : _h.addEventListener('click', () => this.moveSameImage());
        },
        bindPreprocessEvents() {
            var _a;
            (_a = this.$.preprocessIdenticalImagesBtn) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
                this.preChangeImagesAndPrefabs();
            });
        },
        // #endregion
        // #region 数据生成方法
        generateImageTable() {
            var _a;
            console.log('点击了生成图片使用表按钮');
            const filePath = (_a = this.$.buildMapsDataResultPath) === null || _a === void 0 ? void 0 : _a.value;
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
            }
            catch (err) {
                console.error('读取或解析数据文件失败:', err);
            }
        },
        // #endregion
        // #region 计算功能方法
        calculateIgnore(path2info) {
            if (!path2info) {
                console.warn('请先构建基础数据');
                return;
            }
            let _remainpath2info = deepClone(path2info);
            _remainpath2info = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => info.count > 0));
            const pattern = this.$.ignorePattern.value;
            const patterns = pattern.split(',').map(p => p.trim()).filter(p => p.length > 0);
            Editor.Profile.setConfig('assetsindex', 'resourcesdeal_ignorePattern', pattern);
            _ignoreRemainingdataCache = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => {
                return !patterns.some(p => path.includes(p));
            }));
            const num_ignoreTotal = Object.keys(_remainpath2info).length - Object.keys(_ignoreRemainingdataCache).length;
            const num_ignoreRemaining = Object.keys(_ignoreRemainingdataCache).length;
            this.$.ignoreTotal.textContent = num_ignoreTotal.toString();
            this.$.ignoreRemaining.textContent = num_ignoreRemaining.toString();
            _ignoreCache = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => {
                return patterns.some(p => path.includes(p));
            }));
            const totalSize = Number(Object.values(_ignoreCache).reduce((sum, info) => sum + info.size, 0));
            this.$.ignoreTotalSize.textContent = formatSize(totalSize);
            console.log('计算忽略跳过包含的内容完成,共:', num_ignoreTotal, '剩余:', num_ignoreRemaining);
        },
        // 其他计算方法类似结构，为了简洁省略...
        calculateBg(path2info) {
            if (!path2info) {
                console.warn('请先构建基础数据');
                return;
            }
            let _remainpath2info = deepClone(path2info);
            _remainpath2info = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => info.count > 0));
            const largeImageThreshold = parseInt(this.$.largeImageThreshold.value) || 200000;
            Editor.Profile.setConfig('assetsindex', 'resourcesdeal_bgimgWidthinput', this.$.bgimgWidthinput.value);
            Editor.Profile.setConfig('assetsindex', 'resourcesdeal_bgimgHeightinput', this.$.bgimgHeightinput.value);
            Editor.Profile.setConfig('assetsindex', 'resourcesdeal_largeImageThreshold', this.$.largeImageThreshold.value);
            _bgRemainingdataCache = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => (info.width * info.height) < largeImageThreshold));
            const num_bgTotal = Object.keys(_remainpath2info).length - Object.keys(_bgRemainingdataCache).length;
            const num_bgRemaining = Object.keys(_bgRemainingdataCache).length;
            this.$.bgTotal.textContent = num_bgTotal.toString();
            this.$.bgRemaining.textContent = num_bgRemaining.toString();
            _bgdataCache = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => (info.width * info.height) >= largeImageThreshold));
            const totalSize = Number(Object.values(_bgdataCache).reduce((sum, info) => sum + info.size, 0));
            this.$.bgTotalSize.textContent = formatSize(totalSize);
            console.log('计算大图文件夹图片数量完成,共:', num_bgTotal, '剩余:', num_bgRemaining);
        },
        calculateCommon(path2info) {
            if (!path2info) {
                console.warn('请先构建基础数据');
                return;
            }
            let _remainpath2info = deepClone(path2info);
            _remainpath2info = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => info.count > 0));
            const commonThreshold = parseInt(this.$.commonThreshold.value) || 10;
            Editor.Profile.setConfig('assetsindex', 'resourcesdeal_commonThreshold', this.$.commonThreshold.value);
            _commonRemainingdataCache = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => info.count < commonThreshold));
            const num_commonTotal = Object.keys(_remainpath2info).length - Object.keys(_commonRemainingdataCache).length;
            const num_commonRemaining = Object.keys(_commonRemainingdataCache).length;
            this.$.commonTotal.textContent = num_commonTotal.toString();
            this.$.commonRemaining.textContent = num_commonRemaining.toString();
            _commondataCache = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => info.count >= commonThreshold));
            const totalSize = Number(Object.values(_commondataCache).reduce((sum, info) => sum + info.size, 0));
            this.$.commonTotalSize.textContent = formatSize(totalSize);
            console.log('计算Common文件夹图片数量完成,共:', num_commonTotal, '剩余:', num_commonRemaining);
        },
        calculateSingle(path2info) {
            if (!path2info) {
                console.warn('请先构建基础数据');
                return;
            }
            let _remainpath2info = deepClone(path2info);
            _remainpath2info = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => info.count > 0));
            _singleRemainingdataCache = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => info.count != 1));
            const num_singleTotal = Object.keys(_remainpath2info).length - Object.keys(_singleRemainingdataCache).length;
            const num_singleRemaining = Object.keys(_singleRemainingdataCache).length;
            this.$.singleTotal.textContent = num_singleTotal.toString();
            this.$.singleRemaining.textContent = num_singleRemaining.toString();
            _singledataCache = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => info.count <= 1));
            const totalSize = Number(Object.values(_singledataCache).reduce((sum, info) => sum + info.size, 0));
            this.$.singleTotalSize.textContent = formatSize(totalSize);
            console.log('计算单独文件夹图片数量完成,共:', num_singleTotal, '剩余:', num_singleRemaining);
        },
        calculateSame(path2info) {
            if (!path2info) {
                console.warn('请先构建基础数据');
                return;
            }
            let _remainpath2info = deepClone(path2info);
            _remainpath2info = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => info.count > 0));
            // 检查图片的引用路径是否都在同一个目录下
            const checkSameDirectory = (imagePath) => {
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
            this.$.sameDirTotal.textContent = num_sameTotal.toString();
            this.$.sameDirRemaining.textContent = num_sameRemaining.toString();
            const totalSize = Number(Object.values(_samedataCache).reduce((sum, info) => sum + info.size, 0));
            this.$.sameDirTotalSize.textContent = formatSize(totalSize);
            console.log('计算相同目录文件夹图片数量完成,共:', num_sameTotal, '剩余:', num_sameRemaining);
        },
        calculateSizeCount(path2info) {
            if (!path2info) {
                console.warn('请先构建基础数据');
                return;
            }
            let _remainpath2info = deepClone(path2info);
            _remainpath2info = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => info.count > 0));
            const sizeCountThreshold = parseInt(this.$.sizeCountThreshold.value) || 1000000;
            Editor.Profile.setConfig('assetsindex', 'resourcesdeal_sizecountWidthinput', this.$.sizecountWidthinput.value);
            Editor.Profile.setConfig('assetsindex', 'resourcesdeal_sizecountHeightinput', this.$.sizecountHeightinput.value);
            Editor.Profile.setConfig('assetsindex', 'resourcesdeal_sizecountCountinput', this.$.sizecountCountinput.value);
            Editor.Profile.setConfig('assetsindex', 'resourcesdeal_sizeCountThreshold', this.$.sizeCountThreshold.value);
            _sizecountRemainingdataCache = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => info.width * info.height * info.count > sizeCountThreshold));
            const num_sizeCountTotal = Object.keys(_remainpath2info).length - Object.keys(_sizecountRemainingdataCache).length;
            const num_sizeCountRemaining = Object.keys(_sizecountRemainingdataCache).length;
            this.$.sizeCountTotal.textContent = num_sizeCountTotal.toString();
            this.$.sizeCountRemaining.textContent = num_sizeCountRemaining.toString();
            _sizecountdataCache = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => info.width * info.height * info.count <= sizeCountThreshold));
            const totalSize = Number(Object.values(_sizecountdataCache).reduce((sum, info) => sum + (info.size * info.count), 0));
            this.$.sizeCountTotalSize.textContent = formatSize(totalSize);
            console.log('计算按大小引用次数文件夹图片数量完成,共:', num_sizeCountTotal, '剩余:', num_sizeCountRemaining);
        },
        defineLargeImages(path2info) {
            if (!path2info) {
                console.warn('请先构建基础数据');
                return;
            }
            console.log('开始定义大图');
            // 保存配置
            Editor.Profile.setConfig('assetsindex', 'resourcesdeal_defineLargeImageWidth', this.$.defineLargeImageWidth.value);
            Editor.Profile.setConfig('assetsindex', 'resourcesdeal_defineLargeImageHeight', this.$.defineLargeImageHeight.value);
            Editor.Profile.setConfig('assetsindex', 'resourcesdeal_defineLargeImageThreshold', this.$.defineLargeImageThreshold.value);
            Editor.Profile.setConfig('assetsindex', 'resourcesdeal_defineLargeImageByWidth', this.$.defineLargeImageByWidth.checked ? '1' : '0');
            Editor.Profile.setConfig('assetsindex', 'resourcesdeal_defineLargeImageByHeight', this.$.defineLargeImageByHeight.checked ? '1' : '0');
            Editor.Profile.setConfig('assetsindex', 'resourcesdeal_defineLargeImageByArea', this.$.defineLargeImageByArea.checked ? '1' : '0');
            const width = parseInt(this.$.defineLargeImageWidth.value) || 400;
            const height = parseInt(this.$.defineLargeImageHeight.value) || 400;
            const areaThreshold = parseInt(this.$.defineLargeImageThreshold.value) || 160000;
            const byWidth = this.$.defineLargeImageByWidth.checked;
            const byHeight = this.$.defineLargeImageByHeight.checked;
            const byArea = this.$.defineLargeImageByArea.checked;
            if (!byWidth && !byHeight && !byArea) {
                console.warn('请至少选择一种大图定义方式');
                Editor.Dialog.info('请至少选择一种大图定义方式（按宽度、按高度或按面积）', { title: '大图定义', buttons: ['我知道了'] });
                return;
            }
            let _remainpath2info = deepClone(path2info);
            _remainpath2info = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => info.count > 0));
            // 根据选择的条件筛选大图
            const largeImages = {};
            const normalImages = {};
            Object.entries(_remainpath2info).forEach(([path, info]) => {
                const imgInfo = info;
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
                }
                else {
                    normalImages[path] = info;
                }
            });
            // 计算统计信息
            const largeImageCount = Object.keys(largeImages).length;
            const normalImageCount = Object.keys(normalImages).length;
            const largeImageSize = Object.values(largeImages).reduce((sum, info) => sum + info.size, 0);
            const normalImageSize = Object.values(normalImages).reduce((sum, info) => sum + info.size, 0);
            // 显示结果
            const resultMessage = `大图定义完成！\n\n定义条件：\n- 按宽度 >= ${width}px: ${byWidth ? '启用' : '禁用'}\n- 按高度 >= ${height}px: ${byHeight ? '启用' : '禁用'}\n- 按面积 >= ${areaThreshold}px²: ${byArea ? '启用' : '禁用'}\n\n结果统计：\n- 大图: ${largeImageCount} 张，总大小 ${formatSize(largeImageSize)}\n- 普通图: ${normalImageCount} 张，总大小 ${formatSize(normalImageSize)}`;
            Editor.Dialog.info(resultMessage, { title: '大图定义结果', buttons: ['我知道了'] });
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
        defineSmallImages(path2info) {
            if (!path2info) {
                console.warn('请先构建基础数据');
                return;
            }
            console.log('开始定义小小图');
            // 保存配置
            Editor.Profile.setConfig('assetsindex', 'resourcesdeal_defineSSmallImageWidth', this.$.defineSSmallImageWidth.value);
            Editor.Profile.setConfig('assetsindex', 'resourcesdeal_defineSSmallImageHeight', this.$.defineSSmallImageHeight.value);
            Editor.Profile.setConfig('assetsindex', 'resourcesdeal_defineSSmallImageThreshold', this.$.defineSSmallImageThreshold.value);
            Editor.Profile.setConfig('assetsindex', 'resourcesdeal_defineSSmallImageByWidth', this.$.defineSSmallImageByWidth.checked ? '1' : '0');
            Editor.Profile.setConfig('assetsindex', 'resourcesdeal_defineSSmallImageByHeight', this.$.defineSSmallImageByHeight.checked ? '1' : '0');
            Editor.Profile.setConfig('assetsindex', 'resourcesdeal_defineSSmallImageByArea', this.$.defineSSmallImageByArea.checked ? '1' : '0');
            const width = parseInt(this.$.defineSSmallImageWidth.value) || 50;
            const height = parseInt(this.$.defineSSmallImageHeight.value) || 50;
            const areaThreshold = parseInt(this.$.defineSSmallImageThreshold.value) || 2500;
            const byWidth = this.$.defineSSmallImageByWidth.checked;
            const byHeight = this.$.defineSSmallImageByHeight.checked;
            const byArea = this.$.defineSSmallImageByArea.checked;
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
                Editor.Dialog.info('请至少选择一种小小图定义方式（按宽度、按高度或按面积）', { title: '小小图定义', buttons: ['我知道了'] });
                return;
            }
            let _remainpath2info = deepClone(path2info);
            _remainpath2info = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => info.count > 0));
            // 根据选择的条件筛选小小图（注意：小小图是 <= 条件）
            const smallImages = {};
            const normalImages = {};
            Object.entries(_remainpath2info).forEach(([path, info]) => {
                const imgInfo = info;
                // 使用与 isSSmallImage 函数相同的 AND 逻辑
                const isSmallImage = isSSmallImage(imgInfo.width, imgInfo.height);
                if (isSmallImage) {
                    smallImages[path] = info;
                }
                else {
                    normalImages[path] = info;
                }
            });
            // 计算统计信息
            const smallImageCount = Object.keys(smallImages).length;
            const normalImageCount = Object.keys(normalImages).length;
            const smallImageSize = Object.values(smallImages).reduce((sum, info) => sum + info.size, 0);
            const normalImageSize = Object.values(normalImages).reduce((sum, info) => sum + info.size, 0);
            // 显示结果
            const resultMessage = `小小图定义完成！\n\n定义条件：\n- 按宽度 <= ${width}px: ${byWidth ? '启用' : '禁用'}\n- 按高度 <= ${height}px: ${byHeight ? '启用' : '禁用'}\n- 按面积 <= ${areaThreshold}px²: ${byArea ? '启用' : '禁用'}\n\n结果统计：\n- 小小图: ${smallImageCount} 张，总大小 ${formatSize(smallImageSize)}\n- 普通图: ${normalImageCount} 张，总大小 ${formatSize(normalImageSize)}`;
            Editor.Dialog.info(resultMessage, { title: '小小图定义结果', buttons: ['我知道了'] });
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
        calculateOtherBigImages(path2info) {
            if (!path2info) {
                console.warn('请先构建基础数据');
                return;
            }
            console.log('开始计算其他大图');
            let _remainpath2info = deepClone(path2info);
            _remainpath2info = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => info.count > 0));
            // 使用isBigImage函数筛选大图
            _otherbigdataCache = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => {
                const imgInfo = info;
                return isBigImage(imgInfo.width, imgInfo.height);
            }));
            _otherbigRemainingdataCache = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => {
                const imgInfo = info;
                return !isBigImage(imgInfo.width, imgInfo.height);
            }));
            const num_otherbigTotal = Object.keys(_otherbigdataCache).length;
            const num_otherbigRemaining = Object.keys(_otherbigRemainingdataCache).length;
            this.$.otherbigTotal.textContent = num_otherbigTotal.toString();
            this.$.otherbigRemaining.textContent = num_otherbigRemaining.toString();
            const totalSize = Number(Object.values(_otherbigdataCache).reduce((sum, info) => sum + info.size, 0));
            this.$.otherbigTotalSize.textContent = formatSize(totalSize);
            console.log('计算其他大图完成,共:', num_otherbigTotal, '剩余:', num_otherbigRemaining);
        },
        calculateOtherSmallImages(path2info) {
            if (!path2info) {
                console.warn('请先构建基础数据');
                return;
            }
            console.log('开始计算其他小图');
            let _remainpath2info = deepClone(path2info);
            _remainpath2info = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => info.count > 0));
            // 使用isSSmallImage函数筛选小图
            _othersmalldataCache = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => {
                const imgInfo = info;
                return isSSmallImage(imgInfo.width, imgInfo.height);
            }));
            _othersmallRemainingdataCache = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => {
                const imgInfo = info;
                return !isSSmallImage(imgInfo.width, imgInfo.height);
            }));
            const num_othersmallTotal = Object.keys(_othersmalldataCache).length;
            const num_othersmallRemaining = Object.keys(_othersmallRemainingdataCache).length;
            this.$.othersmallTotal.textContent = num_othersmallTotal.toString();
            this.$.othersmallRemaining.textContent = num_othersmallRemaining.toString();
            const totalSize = Number(Object.values(_othersmalldataCache).reduce((sum, info) => sum + info.size, 0));
            this.$.othersmallTotalSize.textContent = formatSize(totalSize);
            console.log('计算其他小图完成,共:', num_othersmallTotal, '剩余:', num_othersmallRemaining);
        },
        calculatePreImage(path2info) {
            if (!path2info) {
                console.warn('请先构建基础数据');
                return;
            }
            let _remainpath2info = deepClone(path2info);
            _remainpath2info = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => info.count > 0));
            const preImageThreshold = parseInt(this.$.preImageThreshold.value) || 10000;
            Editor.Profile.setConfig('assetsindex', 'resourcesdeal_preimgWidthinput', this.$.preimgWidthinput.value);
            Editor.Profile.setConfig('assetsindex', 'resourcesdeal_preimgHeightinput', this.$.preimgHeightinput.value);
            Editor.Profile.setConfig('assetsindex', 'resourcesdeal_preImageThreshold', this.$.preImageThreshold.value);
            // 筛选出尺寸大于阈值的图片
            const largeImages = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => {
                const imageSize = info.width * info.height;
                return imageSize >= preImageThreshold;
            }));
            // 按MD5分组找出重复的图片
            const md5Groups = {};
            Object.entries(largeImages).forEach(([path, info]) => {
                const md5 = info.md5;
                if (md5) {
                    if (!md5Groups[md5]) {
                        md5Groups[md5] = [];
                    }
                    md5Groups[md5].push(path);
                }
            });
            // 找出有重复的组
            const duplicateGroups = {};
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
                const imageSize = largeImages[keepImage].size;
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
                let allReferences = [];
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
            const duplicatePathsSet = new Set();
            Object.values(duplicateGroups).forEach(paths => {
                for (let i = 1; i < paths.length; i++) {
                    duplicatePathsSet.add(paths[i]);
                }
            });
            _preImageRemainingdataCache = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => {
                return !duplicatePathsSet.has(path);
            }));
            // 更新UI显示
            const duplicateCount = duplicatePathsSet.size;
            const remainingCount = Object.keys(_preImageRemainingdataCache).length;
            this.$.preImageTotal.textContent = totalDuplicateFiles.toString();
            this.$.preImagesaving.textContent = Object.keys(duplicateGroups).length.toString();
            this.$.preImageRemaining.textContent = remainingCount.toString();
            console.log(`预处理相同大图完成: 删除图片 ${totalDuplicateFiles} 张, 保留组 ${Object.keys(duplicateGroups).length} 组, 剩余 ${remainingCount} 张, 节省空间 ${formatSize(totalSavedSize)}`);
        },
        lookRemaining() {
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
                const originalRemaining = Object.fromEntries(Object.entries(_dataCache.path2info).filter(([path, info]) => info.count > 0));
                if (Object.keys(originalRemaining).length === 0) {
                    Editor.Dialog.info('没有剩余未处理的图片', { title: '查看剩余图片', buttons: ['我知道了'] });
                    return;
                }
                const totalSize = Number(Object.values(originalRemaining).reduce((sum, info) => sum + info.size, 0));
                const message = `查看原始剩余图片\n\n描述：所有被引用的图片（未经过任何筛选）\n\n统计：\n- 图片数量：${Object.keys(originalRemaining).length} 张\n- 总大小：${formatSize(totalSize)}`;
                Editor.Dialog.info(message, { title: '查看剩余图片', buttons: ['查看详情', '我知道了'] })
                    .then((result) => {
                    if (result.response === 0) { // 用户点击了查看详情
                        this.showAlert2(originalRemaining);
                    }
                });
                return;
            }
            // 显示找到的剩余数据
            const totalSize = Number(Object.values(foundCache.cache).reduce((sum, info) => sum + info.size, 0));
            const message = `查看${foundCache.name}\n\n描述：${foundCache.description}\n\n统计：\n- 图片数量：${Object.keys(foundCache.cache).length} 张\n- 总大小：${formatSize(totalSize)}`;
            Editor.Dialog.info(message, { title: '查看剩余图片', buttons: ['查看详情', '我知道了'] })
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
        moveImages(config) {
            console.log(`点击了移动${config.title}按钮`);
            // 检查冲突处理方式
            const caseConflictKeepOld = this.$.caseConflictKeepOld.checked;
            const caseConflictUseNew = this.$.caseConflictUseNew.checked;
            if (!caseConflictKeepOld && !caseConflictUseNew) {
                console.warn('请选择冲突处理方式');
                Editor.Dialog.info('请选择冲突处理方式', { title: '冲突处理方式', buttons: ['我知道了'] });
                return;
            }
            // 保存配置
            Editor.Profile.setConfig('assetsindex', 'resourcesdeal_caseConflictKeepOld', caseConflictKeepOld ? '1' : '0');
            Editor.Profile.setConfig('assetsindex', 'resourcesdeal_caseConflictUseNew', caseConflictUseNew ? '1' : '0');
            config.configKeys.forEach(key => {
                const element = this.$[key];
                if (element) {
                    Editor.Profile.setConfig('assetsindex', `resourcesdeal_${key}`, element.value);
                }
            });
            // 检查数据缓存
            if (!config.dataCache) {
                console.warn(config.checkMessage);
                return;
            }
            // 预计算每个图片的大小判断结果
            const imageSizeMap = {};
            Object.entries(config.dataCache).forEach(([imgPath, info]) => {
                imageSizeMap[imgPath] = isBigImage(info.width || 0, info.height || 0);
            });
            // 构建请求参数
            const requestParams = {
                method: 'moveBgImages',
                spriteFrameMaps_name: _spriteFrameMaps_nameCache,
                path2info: config.dataCache,
                bgTargetPattern: config.targetPattern,
                bigTargetPattern: config.bigTargetPattern,
                imageSizeMap: imageSizeMap,
                keepOld: caseConflictKeepOld,
                preLook: config.preLook || false,
            };
            // 如果有prefabRegex参数，添加到请求中
            if (config.prefabRegex) {
                requestParams.bgPrefabRegex = config.prefabRegex;
            }
            // 发送移动请求
            Editor.Message.request('assetsindex', 'dynamic-message', requestParams)
                .then((data) => {
                if (config.preLook) {
                    this.showAlert2(data);
                    return;
                }
                console.log(`渲染进程：移动${config.title}完成`);
                Editor.Dialog.info(`${config.title}移动完成，已移动 ${data.movedCount} 张图片`, { title: `移动${config.title}`, buttons: ['我知道了'] });
            })
                .catch(err => {
                console.error(`渲染进程：移动失败`, err);
            });
        },
        moveBgImage(preLook = false) {
            const bgPrefabRegex = this.$.bgPrefabRegex.value;
            const bgTargetPattern = this.$.bgTargetPattern.value;
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
            const commonTargetPattern = this.$.commonTargetPattern.value;
            const bigcommonTargetPattern = this.$.bigcommonTargetPattern.value;
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
            const singlePrefabRegex = this.$.singlePrefabRegex.value;
            const singleTargetPattern = this.$.singleTargetPattern.value;
            const bigsingleTargetPattern = this.$.bigsingleTargetPattern.value;
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
            const sameDirPrefabRegex = this.$.sameDirPrefabRegex.value;
            const sameDirTargetPattern = this.$.sameDirTargetPattern.value;
            const bigsameDirTargetPattern = this.$.bigsameDirTargetPattern.value;
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
        preChangeImagesAndPrefabs() {
            if (!_preImageCache) {
                console.warn('请先计算预处理相同大图');
                Editor.Dialog.info('请先计算预处理相同大图', { title: '预处理提示', buttons: ['我知道了'] });
                return;
            }
            // 检查是否有重复图片需要处理
            if (!_preImageCache.duplicateGroups || Object.keys(_preImageCache.duplicateGroups).length === 0) {
                console.log('没有重复的图片需要处理');
                Editor.Dialog.info('没有重复的图片需要处理', { title: '预处理结果', buttons: ['我知道了'] });
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
                    }).then((data) => {
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
                            this.$.preImageTotal.textContent = '0';
                            this.$.preImagesaving.textContent = '0';
                        }
                        else {
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
                }
                else {
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
                }
                catch (error) {
                    console.error('Clusterize 初始化失败:', error);
                }
            }, 1000);
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
        }
        catch (error) {
            console.error('ResourcesDeal 面板初始化失败:', error);
        }
    },
    beforeClose() { },
    close() { },
});
