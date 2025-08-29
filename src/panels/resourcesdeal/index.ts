import { readFileSync } from 'fs-extra';
import { join } from 'path';
const fs = require('fs-extra');

let _dataCache: any = null; // 缓存数据

let _spriteFrameMaps_nameCache: any = null; // 缓存 spriteFrameMaps_name 数据,用来预计算的，处理后会跟_dataCache源数据不一样
let _ignoreCache: any = null; // 忽略跳过包含的内容
let _preImageCache: any = null; // 缓存 preImage 数据
let _bgdataCache: any = null; // 缓存 bg 数据
let _commondataCache: any = null; // 缓存 common 数据
let _singledataCache: any = null; // 缓存 single 数据
let _samedataCache: any = null; // 缓存 same 数据
let _sizecountdataCache: any = null; // 缓存 sizecount 数据
let _ignoreRemainingdataCache: any = null; // 计算 ignore 后剩余数据缓存
let _preImageRemainingdataCache: any = null; // 计算 preImage 后剩余数据缓存
let _bgRemainingdataCache: any = null; // 计算 bg 后剩余数据缓存
let _commonRemainingdataCache: any = null; // 计算 common 后剩余数据缓存
let _singleRemainingdataCache: any = null; // 计算 single 后剩余数据缓存
let _sameRemainingdataCache: any = null; // 计算 same 后剩余数据缓存
let _sizecountRemainingdataCache: any = null; // 计算 sizecount 后剩余数据缓存

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
/**
 * @zh 如果希望兼容 3.3 之前的版本可以使用下方的代码
 * @en You can add the code below if you want compatibility with versions prior to 3.3
 */
// Editor.Panel.define = Editor.Panel.define || function(options: any) { return options }
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

        //图集设置处理
        //ignore
        ignorePattern: '#ignorePattern',// 输入框
        setIgnorePatternBtn: '#setIgnorePatternBtn',// 设置按钮
        ignoreTotalSize: '#ignoreTotalSize',// 计算结果
        ignoreTotal: '#ignoreTotal',// 计算结果
        ignoreRemaining: '#ignoreRemaining',// 计算结果
        lookIgnorePatternResult: '#lookIgnorePatternResult',// 查看结果按钮
        //preImage
        preimgWidthinput: '#preimgWidthinput',// 输入框
        preimgHeightinput: '#preimgHeightinput',// 输入框
        preImageThreshold: '#preImageThreshold',// 输入框
        calculateIgnoreSameImage: '#calculateIgnoreSameImage',// 设置按钮
        preImageTotal: '#preImageTotal',// 计算结果
        preImagesaving: '#preImagesaving',// 计算结果
        preImageRemaining: '#preImageRemaining',// 计算结果
        lookPreImageResultBtn: '#lookPreImageResultBtn',// 查看结果按钮
        //common
        commonThreshold: '#commonThreshold',// 输入框
        calculateCommon: '#calculateCommon',// 计算按钮
        commonTotalSize: '#commonTotalSize',// 计算结果
        commonTotal: '#commonTotal',// 计算结果
        commonRemaining: '#commonRemaining',// 计算结果
        lookCommonResult: '#lookCommonResult',// 查看结果按钮
        
        //bg
        bgimgWidthinput: '#bgimgWidthinput',// 输入框
        bgimgHeightinput: '#bgimgHeightinput',// 输入框
        largeImageThreshold: '#largeImageThreshold',// 输入框
        calculateBg: '#calculateBg',// 计算按钮
        bgTotalSize: '#bgTotalSize',// 计算结果
        bgTotal: '#bgTotal',// 计算结果
        bgRemaining: '#bgRemaining',// 计算结果
        lookBgResult: '#lookBgResult',// 查看结果按钮

        //single
        calculateSingle: '#calculateSingle',// 计算按钮
        singleTotalSize: '#singleTotalSize',// 计算结果
        singleTotal: '#singleTotal',// 计算结果
        singleRemaining: '#singleRemaining',// 计算结果
        lookSingleResult: '#lookSingleResult',// 查看结果按钮

        //sameDir
        calculateSameDir: '#calculateSameDir',// 计算按钮
        sameDirTotalSize: '#sameDirTotalSize',// 计算结果
        sameDirTotal: '#sameDirTotal',// 计算结果
        sameDirRemaining: '#sameDirRemaining',// 计算结果
        lookSameDirResult: '#lookSameDirResult',// 查看结果按钮

        //sizecount
        sizecountWidthinput: '#sizecountWidthinput',// 输入框
        sizecountHeightinput: '#sizecountHeightinput',// 输入框
        sizecountCountinput: '#sizecountCountinput',// 输入框
        sizeCountThreshold: '#sizeCountThreshold',// 输入框
        calculateSizeCount: '#calculateSizeCount',// 计算按钮
        sizeCountTotalSize: '#sizeCountTotalSize',// 计算结果
        sizeCountTotal: '#sizeCountTotal',// 计算结果
        sizeCountRemaining: '#sizeCountRemaining',// 计算结果
        lookSizeCountResult: '#lookSizeCountResult',// 查看结果按钮

        processAll: '#processAll',// 一键计算按钮


        //移动图片
        preprocessIdenticalImagesBtn: '#preprocessIdenticalImagesBtn',// 预处理完全相同的图和预制体引用重新指向
        lookPreprocessIdenticalImagesBtn: '#lookPreprocessIdenticalImagesBtn',// 预查看预处理结果


        caseConflictKeepOld: '#caseConflictKeepOld',// 保留旧文件夹名
        caseConflictUseNew: '#caseConflictUseNew',// 使用新文件夹名
        //移动大图
        moveBgImagesBtn: '#moveBgImagesBtn',// 移动图片按钮
        PreLookmoveBgImagesBtn: '#PreLookmoveBgImagesBtn',// 预查看需要移动的图片按钮
        bgPrefabRegex: '#bgPrefabRegex',// 大图预制体正则
        bgTargetPattern: '#bgTargetPattern',// 大图图集正则

        //移动common图片
        commonTargetPattern: '#commonTargetPattern',// common图集正则
        moveCommonImagesBtn: '#moveCommonImagesBtn',// 移动common图片按钮
        PreLookmoveCommonImagesBtn: '#PreLookmoveCommonImagesBtn',// 预查看需要移动的common图片按钮

        //移动单独图片
        singlePrefabRegex: '#singlePrefabRegex',// 单独图预制体正则
        singleTargetPattern: '#singleTargetPattern',// 单独图目标路径模板
        moveSingleImagesBtn: '#moveSingleImagesBtn',// 移动单独图片按钮
        PreLookmoveSingleImagesBtn: '#PreLookmoveSingleImagesBtn',// 预查看需要移动的单独图片按钮

        //移动sameDir图片
        sameDirPrefabRegex: '#sameDirPrefabRegex',// sameDir图预制体正则
        sameDirTargetPattern: '#sameDirTargetPattern',// sameDir图目标路径模板
        moveSameDirImagesBtn: '#moveSameDirImagesBtn',// 移动sameDir图片按钮
        PreLookmoveSameDirImagesBtn: '#PreLookmoveSameDirImagesBtn',// 预查看需要移动的sameDir图片按钮
    },
    // 缓存数据
    
    methods: {
        switchTab(tabId: string) {
            // 获取所有 Tab 和内容
            const tabs = this.$.tabs!.querySelectorAll('.tab-button');
            const panels = this.$.content!.querySelectorAll('.tab-content');

            // 隐藏所有 Tab 内容
            panels.forEach(panel => {
                (panel as HTMLElement).style.display = 'none';
            });

            // 移除所有 Tab 按钮的 active
            tabs.forEach(tab => tab.classList.remove('active'));

            // 激活当前 Tab 按钮和内容
            const activeTab = this.$.tabs!.querySelector(`.tab-button[data-tab="${tabId}"]`);
            const activePanel = this.$.content!.querySelector(`#${tabId}`);
            activeTab?.classList.add('active');
            if (activePanel) {
                (activePanel as HTMLElement).style.display = 'block';
            }
        },
        updateThreshold() {
            const w = parseInt(this.$.bgimgWidthinput.value) || 0;
            const h = parseInt(this.$.bgimgHeightinput.value) || 0;
            this.$.largeImageThreshold.value = w * h;
            // console.log('大图阈值更新:', this.$.largeImageThreshold.value);
        },
        updatesizeCountThreshold(){
            const w = parseInt(this.$.sizecountWidthinput.value) || 0;
            const h = parseInt(this.$.sizecountHeightinput.value) || 0;
            const c = parseInt(this.$.sizecountCountinput.value) || 0;
            this.$.sizeCountThreshold.value = w * h * c;
            // console.log('按大小引用次数阈值更新:', this.$.sizeCountThreshold.value);
        },
        updatePreImageThreshold(){
            const w = parseInt(this.$.preimgWidthinput.value) || 0;
            const h = parseInt(this.$.preimgHeightinput.value) || 0;
            this.$.preImageThreshold.value = w * h;
            // console.log('预处理大图阈值更新:', this.$.preImageThreshold.value);
        },
        buildMapsData(dir:string) {
            console.log('点击了构建基础数据按钮');
            
            Editor.Message.request('assetsindex', 'dynamic-message',{method: 'buildMapsData', dir:dir})
            .then((data)=>{
                //这里使用数据{prefabMaps, spriteFrameMaps, prefabMaps_name, spriteFrameMaps_name}后两个
                Editor.Dialog.info(`构建完成，数据缓存成功,路径:${data.out2}`,{title:'构建完成', buttons:['我知道了']});
                _dataCache = data; // 缓存起来
                this.$.buildMapsDataResultContainer!.style.visibility = 'visible';
                // console.log('渲染进程：构建完成，数据缓存成功,路径:',data.out2);
                (this.$.buildMapsDataResultPath as HTMLInputElement).value = data.out2;
                Editor.Profile.setConfig('assetsindex','resourcesdeal_outputdata2_directory',data.out2);
            })
        },
        renderImageTable(spriteFrameMaps_name: Record<string, string[]>,path2info:any) {
            console.log('开始渲染图片表格，数据量:', Object.keys(spriteFrameMaps_name).length);
            
            // 检查数据有效性
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
                    if (a.count !== b.count) return a.count - b.count;   // 先按引用次数
                    return a.size - b.size;                             // 再按大小
                });

            console.log('处理后的行数:', rows.length);

            // 使用 Clusterize.js 渲染
            const rowStrings = rows.map(row => `
                <tr>
                    <td>${row.img}</td>
                    <td>${row.count}</td>
                    <td>${formatSize(row.size)}</td>
                    <td>${row.prefabs.join('<br/>')}</td>
                </tr>
            `);

            // 更新 Clusterize
            if (this._clusterize) {
                console.log('使用 Clusterize 更新数据，行数:', rowStrings.length);
                this._clusterize.update(rowStrings);
            } else {
                console.warn('Clusterize 未初始化，使用传统方式渲染');
                // 回退到传统渲染方式
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

            // 计算统计数据
            const statsMap: Record<number, { total: number; size: number }> = {};
            rows.forEach(row => {
                if (!statsMap[row.count]) statsMap[row.count] = { total: 0, size: 0 };
                statsMap[row.count].total += 1;
                statsMap[row.count].size += row.size;
            });
            // 渲染统计数据
            const statsDiv = this.$.imageStatsContent!;
            statsDiv.innerHTML = '';
            for (const [count, info] of Object.entries(statsMap)) {
                const div = document.createElement('div');
                div.textContent = `${count} 次引用: ${info.total} 张图片, 总大小 ${formatSize(info.size)} KB`;
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

        showAlert(msg: any) {
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 50px; left: 50px;
                width: 500px;
                height: 400px;
                overflow: auto;
                background: white;
                border: 1px solid #333;
                padding: 10px;
                z-index: 9999;
                color: black;       /* 设置字体为黑色 */
                font-family: monospace; /* 可选，便于查看 JSON */
                white-space: pre;       /* 保留换行缩进 */
            `;
            modal.textContent = JSON.stringify(msg, null, 2);

            // 添加关闭按钮
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
                width: 600px;
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
                container.style.marginLeft = `${level * 4}px`; // 缩小缩进从20px到4px

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
                    
                    // 对于root节点，设置为不可点击的样式
                    if (isRoot) {
                        toggle.textContent = obj.length === 0 ? '' : '▼';
                        toggle.style.cursor = 'default';
                        toggle.style.color = '#999';
                    } else {
                        // 非root节点默认收起
                        toggle.textContent = obj.length === 0 ? '' : '▶';
                    }
                    
                    const label = document.createElement('span');
                    label.style.color = '#666';
                    label.textContent = `${key}: Array[${obj.length}]`;
                    
                    const childContainer = document.createElement('div');
                    // root节点默认展开，其他节点默认收起
                    childContainer.style.display = (obj.length === 0) ? 'none' : (isRoot ? 'block' : 'none');
                    
                    if (obj.length === 0) {
                        label.textContent += ' []';
                    } else {
                        obj.forEach((item, index) => {
                            childContainer.appendChild(createTreeNode(item, `[${index}]`, level + 1, false));
                        });
                    }

                    // 只有非root节点且有内容才能点击
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
                
                // 对于root节点，设置为不可点击的样式
                if (isRoot) {
                    toggle.textContent = keys.length === 0 ? '' : '▼';
                    toggle.style.cursor = 'default';
                    toggle.style.color = '#999';
                } else {
                    // 非root节点默认收起
                    toggle.textContent = keys.length === 0 ? '' : '▶';
                }
                
                const label = document.createElement('span');
                label.style.color = '#666';
                label.textContent = `${key}: Object{${keys.length}}`;
                
                const childContainer = document.createElement('div');
                // root节点默认展开，其他节点默认收起
                childContainer.style.display = (keys.length === 0) ? 'none' : (isRoot ? 'block' : 'none');
                
                if (keys.length === 0) {
                    label.textContent += ' {}';
                } else {
                    keys.forEach(objKey => {
                        childContainer.appendChild(createTreeNode(obj[objKey], objKey, level + 1, false));
                    });
                }

                // 只有非root节点且有内容才能点击
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

            // 生成树状结构 - root节点设置为true
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
                    // 排除root节点的toggle（cursor: default）
                    if (toggle.textContent && toggle.textContent.trim() && (toggle as HTMLElement).style.cursor !== 'default') {
                        toggle.textContent = '▼';
                    }
                });
            });

            collapseAll.addEventListener('click', () => {
                const allContainers = content.querySelectorAll('div div');
                const allToggles = content.querySelectorAll('span[style*="cursor: pointer"]');
                allContainers.forEach((container, index) => {
                    // 保持root节点的第一级子容器展开，其他的收起
                    const parentContainer = container.parentElement;
                    const isFirstLevel = parentContainer && parentContainer.style.marginLeft === '0px';
                    if (!isFirstLevel) {
                        (container as HTMLElement).style.display = 'none';
                    }
                });
                allToggles.forEach(toggle => {
                    // 排除root节点的toggle（cursor: default）
                    if (toggle.textContent && toggle.textContent.trim() && (toggle as HTMLElement).style.cursor !== 'default') {
                        const container = toggle.parentElement;
                        const isFirstLevel = container && container.style.marginLeft === '4px'; // 第一级是4px
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
        }
    },
    ready() {

        //ready的时候读取缓存的值赋值到输入框
        Editor.Profile.getConfig('assetsindex','resourcesdeal_input_directory').then((value:any)=>{
            if(this.$.directoryInput) {
                (this.$.directoryInput as HTMLInputElement).value = value;
            }
        });
        Editor.Profile.getConfig('assetsindex','resourcesdeal_outputdata2_directory').then((value:any)=>{
            this.$.buildMapsDataResultContainer!.style.visibility = 'visible';
            if(this.$.buildMapsDataResultPath) {
                (this.$.buildMapsDataResultPath as HTMLInputElement).value = value;
            }
        });
        Editor.Profile.getConfig('assetsindex','resourcesdeal_bgPrefabRegex').then((value:any)=>{
            if(this.$.bgPrefabRegex) {
                (this.$.bgPrefabRegex as HTMLInputElement).value = value || `preb[/\\](.*)[/\\](.*)\.prefab`;
            }
        });
        Editor.Profile.getConfig('assetsindex','resourcesdeal_bgTargetPattern').then((value:any)=>{
            if(this.$.bgTargetPattern) {
                (this.$.bgTargetPattern as HTMLInputElement).value = value || "staticRes/$1/$2/";
            }
        });
        Editor.Profile.getConfig('assetsindex','resourcesdeal_bgimgWidthinput').then((value:any)=>{
            if(this.$.bgimgWidthinput) {
                (this.$.bgimgWidthinput as HTMLInputElement).value = value || "400";
            }
        });
        Editor.Profile.getConfig('assetsindex','resourcesdeal_bgimgHeightinput').then((value:any)=>{
            if(this.$.bgimgHeightinput) {
                (this.$.bgimgHeightinput as HTMLInputElement).value = value || "400";
            }
        });
        Editor.Profile.getConfig('assetsindex','resourcesdeal_largeImageThreshold').then((value:any)=>{
            if(this.$.largeImageThreshold) {
                (this.$.largeImageThreshold as HTMLInputElement).value = value || "160000";
            }
        });
        Editor.Profile.getConfig('assetsindex','resourcesdeal_commonThreshold').then((value:any)=>{
            if(this.$.commonThreshold) {
                (this.$.commonThreshold as HTMLInputElement).value = value || "10";
            }
        });
        Editor.Profile.getConfig('assetsindex','resourcesdeal_sizecountWidthinput').then((value:any)=>{
            if(this.$.sizecountWidthinput) {
                (this.$.sizecountWidthinput as HTMLInputElement).value = value || "100";
            }
        });
        Editor.Profile.getConfig('assetsindex','resourcesdeal_sizecountHeightinput').then((value:any)=>{
            if(this.$.sizecountHeightinput) {
                (this.$.sizecountHeightinput as HTMLInputElement).value = value || "100";
            }
        });
        Editor.Profile.getConfig('assetsindex','resourcesdeal_sizecountCountinput').then((value:any)=>{
            if(this.$.sizecountCountinput) {
                (this.$.sizecountCountinput as HTMLInputElement).value = value || "100";
            }
        });
        Editor.Profile.getConfig('assetsindex','resourcesdeal_sizeCountThreshold').then((value:any)=>{
            if(this.$.sizeCountThreshold) {
                (this.$.sizeCountThreshold as HTMLInputElement).value = value || "1000000";
            }
        });

        Editor.Profile.getConfig('assetsindex','resourcesdeal_commonTargetPattern').then((value:any)=>{
            if(this.$.commonTargetPattern) {
                (this.$.commonTargetPattern as HTMLInputElement).value = value || "resources/staticRes/common/";
            }
        });
        Editor.Profile.getConfig('assetsindex','resourcesdeal_singlePrefabRegex').then((value:any)=>{
            if(this.$.singlePrefabRegex) {
                (this.$.singlePrefabRegex as HTMLInputElement).value = value || `preb[/\\](.*)[/\\](.*)\.prefab`;
            }
        });
        Editor.Profile.getConfig('assetsindex','resourcesdeal_singleTargetPattern').then((value:any)=>{
            if(this.$.singleTargetPattern) {
                (this.$.singleTargetPattern as HTMLInputElement).value = value || "staticRes/$1/single/$2/";
            }
        });
        Editor.Profile.getConfig('assetsindex','resourcesdeal_ignorePattern').then((value:any)=>{
            if(this.$.ignorePattern) {
                (this.$.ignorePattern as HTMLInputElement).value = value || "i18";
            }
        });
        Editor.Profile.getConfig('assetsindex','resourcesdeal_caseConflictKeepOld').then((value:any)=>{
            if(this.$.caseConflictKeepOld) {
                (this.$.caseConflictKeepOld as HTMLInputElement).checked = value === "1"?true:false;
            }
        });
        Editor.Profile.getConfig('assetsindex','resourcesdeal_caseConflictUseNew').then((value:any)=>{
            if(this.$.caseConflictUseNew) {
                (this.$.caseConflictUseNew as HTMLInputElement).checked = value === "1"?true:false;
            }
        });
        Editor.Profile.getConfig('assetsindex','resourcesdeal_sameDirPrefabRegex').then((value:any)=>{
            if(this.$.sameDirPrefabRegex) {
                (this.$.sameDirPrefabRegex as HTMLInputElement).value = value || `preb[/\\](.*)[/\\](.*)\.prefab`;
            }
        });
        Editor.Profile.getConfig('assetsindex','resourcesdeal_sameDirTargetPattern').then((value:any)=>{
            if(this.$.sameDirTargetPattern) {
                (this.$.sameDirTargetPattern as HTMLInputElement).value = value || "staticRes/$1/same/$2/";
            }
        });
        Editor.Profile.getConfig('assetsindex','resourcesdeal_preimgWidthinput').then((value:any)=>{
            if(this.$.preimgWidthinput) {
                (this.$.preimgWidthinput as HTMLInputElement).value = value || "100";
            }
        });
        Editor.Profile.getConfig('assetsindex','resourcesdeal_preimgHeightinput').then((value:any)=>{
            if(this.$.preimgHeightinput) {
                (this.$.preimgHeightinput as HTMLInputElement).value = value || "100";
            }
        });
        Editor.Profile.getConfig('assetsindex','resourcesdeal_preImageThreshold').then((value:any)=>{
            if(this.$.preImageThreshold) {
                (this.$.preImageThreshold as HTMLInputElement).value = value || "10000";
            }
        });
  

        // 绑定 Tab 点击事件
        if(this.$.tabs) {
            const tabs = this.$.tabs.querySelectorAll('.tab-button');
            tabs.forEach(tab => {
                const tabId = tab.getAttribute('data-tab');
                if (tabId) {
                    tab.addEventListener('click', () => this.switchTab(tabId));
                }
            });
        }
        // 绑定构建基础数据按钮点击事件
        if(this.$.buildmapsdatabtn) {
            
            this.$.buildmapsdatabtn.addEventListener('click', () => {
                const dir = (this.$.directoryInput as HTMLInputElement)?.value;
                
                this.buildMapsData(dir);
                //保存两个输入框的值到缓存还是哪里等下次ready的时候读取赋值
                Editor.Profile.setConfig('assetsindex','resourcesdeal_input_directory',dir);
                
            });
            
        }


        if (this.$.genImageTableBtn) {
            this.$.genImageTableBtn.addEventListener('click', () => {
                console.log('点击了生成图片使用表按钮');
                //读取这个路径的数据文件，然后赋值给_dataCache的{ prefabMaps_name, spriteFrameMaps_name }
                const filePath = (this.$.buildMapsDataResultPath as HTMLInputElement)?.value;
                if (!filePath) {
                    console.warn('输出数据文件路径为空');
                    return;
                }

                try {
                    // 读取 out2.json 数据
                    const raw = fs.readFileSync(filePath, 'utf8');
                    const parsed = JSON.parse(raw);

                    // 只取需要的两个字段
                    _dataCache = {
                        prefabMaps_name: parsed.prefabMaps_name,
                        spriteFrameMaps_name: parsed.spriteFrameMaps_name,
                        path2info: parsed.path2info,
                    };
                    _spriteFrameMaps_nameCache = deepClone(_dataCache.spriteFrameMaps_name); // 缓存 spriteFrameMaps_name 数据
                    console.log('成功读取缓存数据，开始渲染图片使用表');
                    this.renderImageTable(_dataCache.spriteFrameMaps_name,_dataCache.path2info);
                } catch (err) {
                    console.error('读取或解析数据文件失败:', err);
                    return
                }
            });
        }
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
        // 初始化 Clusterize.js
        // 延迟 Clusterize 初始化
        setTimeout(() => {
            // @ts-ignore
            const Clusterize = require('../../../static/libs/clusterize.js'); // 或 import Clusterize from ...

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
        }, 1000); // 延迟 1000ms

        //忽略跳过包含xx的内容
        this.$.setIgnorePatternBtn?.addEventListener('click', () => {
            functioncalignore( _dataCache.path2info);
        });
        this.$.calculateIgnoreSameImage?.addEventListener('click', () => {
            functioncalpreImage( _ignoreRemainingdataCache||_dataCache.path2info);
        });
        this.$.calculateBg?.addEventListener('click', () => {
            functioncalBg( _preImageRemainingdataCache||_ignoreRemainingdataCache||_dataCache.path2info);
        })
        
        this.$.calculateCommon?.addEventListener('click', () => {
            functioncalCommon( _bgRemainingdataCache||_dataCache.path2info);
        })
        
        this.$.calculateSingle?.addEventListener('click', () => {
            functioncalSingle( _commonRemainingdataCache||_dataCache.path2info);
        })
        this.$.calculateSameDir?.addEventListener('click', () => {
            functioncalSame( _singleRemainingdataCache||_dataCache.path2info);
        })
        this.$.calculateSizeCount?.addEventListener('click', () => {
            functioncalSizeCount( _sameRemainingdataCache||_dataCache.path2info);
        })
        this.$.lookIgnorePatternResult?.addEventListener('click', () => {
            //查看_ignoreCache的内容
            if(!_ignoreCache) {
                console.warn('请先计算忽略跳过包含的内容');
                return;
            }
            // 简单 alert 弹窗
            this.showAlert(_ignoreCache);
        });
        this.$.lookPreImageResultBtn?.addEventListener('click', () => {
            //查看_preImageCache的内容
            if(!_preImageCache) {
                console.warn('请先计算预处理相同大图');
                return;
            }
            // 使用 showAlert2 显示树形结构
            this.showAlert2(_preImageCache);
        });
        this.$.lookBgResult?.addEventListener('click', () => {
            //查看_bgdataCache的内容
            if(!_bgdataCache) {
                console.warn('请先计算大图文件夹图片数量');
                return;
            }
            // 简单 alert 弹窗
            this.showAlert(_bgdataCache);
        });
        this.$.lookCommonResult?.addEventListener('click', () => {
            //查看_commondataCache的内容
            if(!_commondataCache) {
                console.warn('请先计算图集文件夹图片数量');
                return;
            }
            // 简单 alert 弹窗
            this.showAlert(_commondataCache);
        });
        this.$.lookSingleResult?.addEventListener('click', () => {
            //查看_singledataCache的内容
            if(!_singledataCache) {
                console.warn('请先计算单独文件夹图片数量');
                return;
            }
            // 简单 alert 弹窗
            this.showAlert(_singledataCache);
        });
        this.$.lookSameDirResult?.addEventListener('click', () => {
            //查看_samedataCache的内容
            if(!_samedataCache) {
                console.warn('请先计算相同目录文件夹图片数量');
                return;
            }
            // 简单 alert 弹窗
            this.showAlert(_samedataCache);
        });
        this.$.lookSizeCountResult?.addEventListener('click', () => {
            //查看_sizecountdataCache的内容
            if(!_sizecountdataCache) {
                console.warn('请先计算按大小引用次数图片数量');
                return;
            }
            // 简单 alert 弹窗
            this.showAlert(_sizecountdataCache);
        });
        const functioncalignore=(path2info)=>{
            let _remainpath2info = deepClone(path2info);
            _remainpath2info = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => (info as any).count > 0));
            console.log('点击了计算忽略跳过包含的内容按钮');
            const pattern = (this.$.ignorePattern as HTMLInputElement).value;
            
            const patterns = pattern.split(',').map(p => p.trim()).filter(p => p.length > 0);
            Editor.Profile.setConfig('assetsindex','resourcesdeal_ignorePattern',pattern);
            
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
            const totalSize = Number(Object.values(_ignoreCache).reduce((sum, info: any) => sum + info.size , 0));
            (this.$.ignoreTotalSize as HTMLInputElement).textContent = formatSize(totalSize);
            console.log('计算忽略跳过包含的内容完成,共:',num_ignoreTotal,'剩余:',num_ignoreRemaining)
        }
        const functioncalBg=(path2info)=>{
            let _remainpath2info = deepClone(path2info);
            _remainpath2info = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => (info as any).count > 0));
            const largeImageThreshold = parseInt((this.$.largeImageThreshold as HTMLInputElement).value) || 200000;
            Editor.Profile.setConfig('assetsindex','resourcesdeal_bgimgWidthinput',(this.$.bgimgWidthinput as HTMLInputElement).value);
            Editor.Profile.setConfig('assetsindex','resourcesdeal_bgimgHeightinput',(this.$.bgimgHeightinput as HTMLInputElement).value);
            Editor.Profile.setConfig('assetsindex','resourcesdeal_largeImageThreshold',(this.$.largeImageThreshold as HTMLInputElement).value);
            console.log('点击了计算大图设置按钮,阈值:',largeImageThreshold);
            _bgRemainingdataCache = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => ((info as any).width * (info as any).height) < largeImageThreshold));
            const num_bgTotal = Object.keys(_remainpath2info).length - Object.keys(_bgRemainingdataCache).length;
            const num_bgRemaining = Object.keys(_bgRemainingdataCache).length;
            (this.$.bgTotal as HTMLInputElement).textContent = num_bgTotal.toString();
            (this.$.bgRemaining as HTMLInputElement).textContent = num_bgRemaining.toString();

            _bgdataCache = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => ((info as any).width * (info as any).height) >= largeImageThreshold));
            //@ts-ignore
            const totalSize = Number(Object.values(_bgdataCache).reduce((sum, info: any) => sum + info.size , 0));
            (this.$.bgTotalSize as HTMLInputElement).textContent = formatSize(totalSize);
            console.log('计算大图文件夹图片数量完成,共:',num_bgTotal,'剩余:',num_bgRemaining)
        }
        const functioncalCommon=(path2info)=>{
            let _remainpath2info = deepClone(path2info);
            _remainpath2info = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => (info as any).count > 0));
            const commonThreshold = parseInt((this.$.commonThreshold as HTMLInputElement).value) || 10;
            Editor.Profile.setConfig('assetsindex','resourcesdeal_commonThreshold',(this.$.commonThreshold as HTMLInputElement).value);
            console.log('点击了计算图集设置按钮,阈值:',commonThreshold);
            _commonRemainingdataCache = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => (info as any).count < commonThreshold));
            const num_commonTotal = Object.keys(_remainpath2info).length - Object.keys(_commonRemainingdataCache).length;
            const num_commonRemaining = Object.keys(_commonRemainingdataCache).length;
            (this.$.commonTotal as HTMLInputElement).textContent = num_commonTotal.toString();
            (this.$.commonRemaining as HTMLInputElement).textContent = num_commonRemaining.toString();

            _commondataCache = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => (info as any).count >= commonThreshold));
            //@ts-ignore
            const totalSize = Number(Object.values(_commondataCache).reduce((sum, info: any) => sum + info.size , 0));
            (this.$.commonTotalSize as HTMLInputElement).textContent = formatSize(totalSize);
            console.log('计算Common文件夹图片数量完成,共:',num_commonTotal,'剩余:',num_commonRemaining)
        }
        const functioncalSingle=(path2info)=>{
            let _remainpath2info = deepClone(path2info);
            _remainpath2info = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => (info as any).count > 0));
            console.log('点击了计算单独文件设置按钮');
            _singleRemainingdataCache = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => (info as any).count != 1));
            const num_singleTotal = Object.keys(_remainpath2info).length - Object.keys(_singleRemainingdataCache).length;
            const num_singleRemaining = Object.keys(_singleRemainingdataCache).length;
            (this.$.singleTotal as HTMLInputElement).textContent = num_singleTotal.toString();
            (this.$.singleRemaining as HTMLInputElement).textContent = num_singleRemaining.toString();

            _singledataCache = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => (info as any).count <= 1));
            //@ts-ignore
            const totalSize = Number(Object.values(_singledataCache).reduce((sum, info: any) => sum + info.size , 0));
            (this.$.singleTotalSize as HTMLInputElement).textContent = formatSize(totalSize);
            console.log('计算单独文件夹图片数量完成,共:',num_singleTotal,'剩余:',num_singleRemaining)
        }
        const functioncalSame=(path2info)=>{
            let _remainpath2info = deepClone(path2info);
            _remainpath2info = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => (info as any).count > 0));
            console.log('点击了计算相同文件设置按钮');
            
            // 检查图片的引用路径是否都在同一个目录下
            const checkSameDirectory = (imagePath: string): boolean => {
                const prefabPaths = _spriteFrameMaps_nameCache[imagePath];
                if (!prefabPaths || prefabPaths.length <= 1) {
                    return false; // 没有引用或只有一个引用，不算同目录
                }
                
                // 提取所有引用路径的目录部分
                const directories = prefabPaths.map(prefabPath => {
                    const lastSlashIndex = Math.max(prefabPath.lastIndexOf('/'), prefabPath.lastIndexOf('\\'));
                    return lastSlashIndex > -1 ? prefabPath.substring(0, lastSlashIndex) : '';
                });
                
                // 检查是否所有目录都相同
                const firstDir = directories[0];
                return directories.every(dir => dir === firstDir);
            };
            
            // 按照是否在同一目录分类
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

            //@ts-ignore
            const totalSize = Number(Object.values(_samedataCache).reduce((sum, info: any) => sum + info.size , 0));
            (this.$.sameDirTotalSize as HTMLInputElement).textContent = formatSize(totalSize);
            console.log('计算相同目录文件夹图片数量完成,共:',num_sameTotal,'剩余:',num_sameRemaining)
        }
        const functioncalSizeCount=(path2info)=>{
            let _remainpath2info = deepClone(path2info);
            _remainpath2info = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => (info as any).count > 0));
            const sizeCountThreshold = parseInt((this.$.sizeCountThreshold as HTMLInputElement).value) || 1000000;
            console.log('点击了计算按大小引用次数设置按钮,阈值:',sizeCountThreshold);
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
            //@ts-ignore
            const totalSize = Number(Object.values(_sizecountdataCache).reduce((sum, info: any) => sum + info.size * info.count, 0));
            (this.$.sizeCountTotalSize as HTMLInputElement).textContent = formatSize(totalSize);
            console.log('计算按大小引用次数文件夹图片数量完成,共:',num_sizeCountTotal,'剩余:',num_sizeCountRemaining)
        }
        const functioncalpreImage=(path2info)=>{
            let _remainpath2info = deepClone(path2info);
            _remainpath2info = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => (info as any).count > 0));
            console.log('点击了预处理相同大图设置按钮');
            
            const preImageThreshold = parseInt((this.$.preImageThreshold as HTMLInputElement).value) || 10000;
            Editor.Profile.setConfig('assetsindex','resourcesdeal_preimgWidthinput',(this.$.preimgWidthinput as HTMLInputElement).value);
            Editor.Profile.setConfig('assetsindex','resourcesdeal_preimgHeightinput',(this.$.preimgHeightinput as HTMLInputElement).value);
            Editor.Profile.setConfig('assetsindex','resourcesdeal_preImageThreshold',(this.$.preImageThreshold as HTMLInputElement).value);
            
            // 1. 筛选出尺寸大于阈值的图片
            const largeImages = Object.fromEntries(
                Object.entries(_remainpath2info).filter(([path, info]) => {
                    const imageSize = (info as any).width * (info as any).height;
                    return imageSize >= preImageThreshold;
                })
            );
            
            console.log(`找到 ${Object.keys(largeImages).length} 张大图（尺寸 >= ${preImageThreshold}）`);
            
            // 2. 按MD5分组找出重复的图片
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
            
            // 3. 找出有重复的组（同一个MD5有多个文件）
            const duplicateGroups: Record<string, string[]> = {};
            Object.entries(md5Groups).forEach(([md5, paths]) => {
                if (paths.length > 1) {
                    duplicateGroups[md5] = paths;
                }
            });
            
            console.log(`找到 ${Object.keys(duplicateGroups).length} 组重复的大图`);
            const totalDuplicateFiles = Object.values(duplicateGroups).reduce((sum, paths) => sum + paths.length - 1, 0);
            
            // 4. 构建预处理缓存数据
            _preImageCache = {
                duplicateGroups: duplicateGroups,
                keepImages: {}, // 每组保留的图片（取第一个）
                removeImages: {}, // 每组需要删除的图片
                summary: {
                    totalGroups: Object.keys(duplicateGroups).length,
                    totalDuplicateFiles: totalDuplicateFiles,
                    totalSavedSize: 0 // 后面计算
                }
            };
            
            // 5. 为每组选择保留的图片（选第一个）和要删除的图片
            let totalSavedSize = 0;
            Object.entries(duplicateGroups).forEach(([md5, paths]) => {
                const keepImage = paths[0]; // 保留第一个
                const removeImages = paths.slice(1); // 删除其他的
                
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
                
                // 计算节省的大小
                const imageSize = (largeImages[keepImage] as any).size;
                totalSavedSize += imageSize * (paths.length - 1);
            });
            
            _preImageCache.summary.totalSavedSize = totalSavedSize;
            
            // 6. 更新 _spriteFrameMaps_nameCache，将所有重复图片的引用都指向保留的图片
            if (!_spriteFrameMaps_nameCache) {
                _spriteFrameMaps_nameCache = deepClone(_dataCache.spriteFrameMaps_name);
            }
            
            Object.entries(duplicateGroups).forEach(([md5, paths]) => {
                const keepImage = paths[0];
                const removeImages = paths.slice(1);
                
                // 收集所有引用
                let allReferences: string[] = [];
                paths.forEach(path => {
                    const refs = _spriteFrameMaps_nameCache[path] || [];
                    allReferences = allReferences.concat(refs);
                });
                
                // 去重并排序
                allReferences = Array.from(new Set(allReferences)).sort();
                
                // 将所有引用都指向保留的图片
                _spriteFrameMaps_nameCache[keepImage] = allReferences;
                
                // 删除要移除图片的引用记录
                removeImages.forEach(path => {
                    delete _spriteFrameMaps_nameCache[path];
                });
            });
            
            // 7. 计算剩余数据（去除重复的图片）
            const duplicatePathsSet = new Set<string>();
            Object.values(duplicateGroups).forEach(paths => {
                // 除了第一个，其他都是重复的
                for (let i = 1; i < paths.length; i++) {
                    duplicatePathsSet.add(paths[i]);
                }
            });
            
            _preImageRemainingdataCache = Object.fromEntries(
                Object.entries(_remainpath2info).filter(([path, info]) => {
                    return !duplicatePathsSet.has(path);
                })
            );
            
            // 8. 更新UI显示
            const duplicateCount = duplicatePathsSet.size;
            const remainingCount = Object.keys(_preImageRemainingdataCache).length;
            
            (this.$.preImageTotal as HTMLInputElement).textContent = totalDuplicateFiles.toString();
            (this.$.preImagesaving as HTMLInputElement).textContent = Object.keys(duplicateGroups).length.toString();
            (this.$.preImageRemaining as HTMLInputElement).textContent = remainingCount.toString();
            
            console.log(`预处理相同大图完成: 删除图片 ${totalDuplicateFiles} 张, 保留组 ${Object.keys(duplicateGroups).length} 组, 剩余 ${remainingCount} 张, 节省空间 ${formatSize(totalSavedSize)}`);
        }
        this.$.processAll?.addEventListener('click', () => {
            Editor.Profile.setConfig('assetsindex','resourcesdeal_bgimgWidthinput',(this.$.bgimgWidthinput as HTMLInputElement).value);
            Editor.Profile.setConfig('assetsindex','resourcesdeal_bgimgHeightinput',(this.$.bgimgHeightinput as HTMLInputElement).value);
            Editor.Profile.setConfig('assetsindex','resourcesdeal_largeImageThreshold',(this.$.largeImageThreshold as HTMLInputElement).value);
            Editor.Profile.setConfig('assetsindex','resourcesdeal_commonThreshold',(this.$.commonThreshold as HTMLInputElement).value);
            Editor.Profile.setConfig('assetsindex','resourcesdeal_sizecountWidthinput',(this.$.sizecountWidthinput as HTMLInputElement).value);
            Editor.Profile.setConfig('assetsindex','resourcesdeal_sizecountHeightinput',(this.$.sizecountHeightinput as HTMLInputElement).value);
            Editor.Profile.setConfig('assetsindex','resourcesdeal_sizecountCountinput',(this.$.sizecountCountinput as HTMLInputElement).value);
            Editor.Profile.setConfig('assetsindex','resourcesdeal_sizeCountThreshold',(this.$.sizeCountThreshold as HTMLInputElement).value);
            Editor.Profile.setConfig('assetsindex','resourcesdeal_ignorePattern',(this.$.ignorePattern as HTMLInputElement).value);
            Editor.Profile.setConfig('assetsindex','resourcesdeal_preimgWidthinput',(this.$.preimgWidthinput as HTMLInputElement).value);
            Editor.Profile.setConfig('assetsindex','resourcesdeal_preimgHeightinput',(this.$.preimgHeightinput as HTMLInputElement).value);
            Editor.Profile.setConfig('assetsindex','resourcesdeal_preImageThreshold',(this.$.preImageThreshold as HTMLInputElement).value);


            if(!_dataCache || !_dataCache.path2info) {
                console.warn('请先构建基础数据，双向索引表');
                return;
            }
            functioncalignore( _dataCache.path2info);
            if(!_ignoreRemainingdataCache) {
                console.warn('请先计算忽略跳过包含的内容');
                return;
            }
            functioncalpreImage( _ignoreRemainingdataCache);
            if(!_preImageRemainingdataCache) {
                console.warn('请先计算预处理相同大图');
                return;
            }
            functioncalBg( _preImageRemainingdataCache);
            if(!_bgRemainingdataCache) {
                console.warn('请先计算大图设置');
                return;
            }
            functioncalCommon( _bgRemainingdataCache);
            if(!_commonRemainingdataCache) {
                console.warn('请先计算图集设置');
                return;
            }
            functioncalSingle( _commonRemainingdataCache);
            if(!_singleRemainingdataCache) {
                console.warn('请先计算单独文件设置');
                return;
            }
            functioncalSame( _singleRemainingdataCache);
            if(!_sameRemainingdataCache) {
                console.warn('请先计算相同目录设置');
                return;
            }
            functioncalSizeCount( _sameRemainingdataCache);
        })
        // 提取公共的移动图片函数
        const moveImages = (config: {
            type: 'bg' | 'common' | 'single',
            dataCache: any,
            prefabRegex?: string,
            targetPattern: string,
            configKeys: string[],
            title: string,
            checkMessage: string,
            preLook?: boolean,
        }) => {
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

            // 构建请求参数
            const requestParams: any = {
                method: 'moveBgImages',
                spriteFrameMaps_name: _spriteFrameMaps_nameCache,
                path2info: config.dataCache,
                bgTargetPattern: config.targetPattern,
                keepOld: caseConflictKeepOld,
                preLook: config.preLook || false,
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
        };

        this.$.PreLookmoveBgImagesBtn?.addEventListener('click', () => {
            moveBgImage(true);
        });
        this.$.PreLookmoveCommonImagesBtn?.addEventListener('click', () => {
            moveCommonImage(true);
        });
        this.$.PreLookmoveSingleImagesBtn?.addEventListener('click', () => {
            moveSingleImage(true);
        });
        this.$.PreLookmoveSameDirImagesBtn?.addEventListener('click', () => {
            moveSameImage(true);
        });

        this.$.preprocessIdenticalImagesBtn?.addEventListener('click', () => {
            preChangeImagesAndPrefabs();
        });
        
        const preChangeImagesAndPrefabs = () => {
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
        }
        
        // 移动大图按钮
        this.$.moveBgImagesBtn?.addEventListener('click', () => {
            moveBgImage();
        });
        
        const moveBgImage=(preLook=false)=>{
            const bgPrefabRegex = (this.$.bgPrefabRegex as HTMLInputElement).value;
            const bgTargetPattern = (this.$.bgTargetPattern as HTMLInputElement).value;
            moveImages({
                type: 'bg',
                dataCache: _bgdataCache,
                prefabRegex: bgPrefabRegex,
                targetPattern: bgTargetPattern,
                configKeys: ['bgPrefabRegex', 'bgTargetPattern'],
                title: '大图',
                checkMessage: '请先计算大图设置',
                preLook
            });
        }
        const moveCommonImage=(preLook=false)=>{
            const commonTargetPattern = (this.$.commonTargetPattern as HTMLInputElement).value;
            moveImages({
                type: 'common',
                dataCache: _commondataCache,
                targetPattern: commonTargetPattern,
                configKeys: ['commonTargetPattern'],
                title: 'common图',
                checkMessage: '请先计算图集设置',
                preLook
            });
        }
        const moveSingleImage=(preLook=false)=>{
            const singlePrefabRegex = (this.$.singlePrefabRegex as HTMLInputElement).value;
            const singleTargetPattern = (this.$.singleTargetPattern as HTMLInputElement).value;
            moveImages({
                type: 'single',
                dataCache: _singledataCache,
                prefabRegex: singlePrefabRegex,
                targetPattern: singleTargetPattern,
                configKeys: ['singlePrefabRegex', 'singleTargetPattern'],
                title: '单独图',
                checkMessage: '请先计算单独文件设置',
                preLook
            });
        }
        const moveSameImage=(preLook=false)=>{
            const singlePrefabRegex = (this.$.singlePrefabRegex as HTMLInputElement).value;
            const singleTargetPattern = (this.$.singleTargetPattern as HTMLInputElement).value;
            moveImages({
                type: 'single',
                dataCache: _samedataCache,
                prefabRegex: singlePrefabRegex,
                targetPattern: singleTargetPattern,
                configKeys: ['singlePrefabRegex', 'singleTargetPattern'],
                title: '相同目录图',
                checkMessage: '请先计算相同目录文件设置',
                preLook
            });
        }
        // 移动common图按钮
        this.$.moveCommonImagesBtn?.addEventListener('click', () => {
            moveCommonImage();
        });

        // 移动单独图按钮
        this.$.moveSingleImagesBtn?.addEventListener('click', () => {
            moveSingleImage();
        });
        // 移动相同目录图按钮
        this.$.moveSameDirImagesBtn?.addEventListener('click', () => {
            moveSameImage();
        });
    },
    beforeClose() { },
    close() { },
});
