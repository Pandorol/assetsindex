// import { readFileSync } from 'fs-extra';
// import { join } from 'path';
// const fs = require('fs-extra');
// // #region 全局数据缓存
// let _dataCache: any = null; 
// let _spriteFrameMaps_nameCache: any = null; 
// let _ignoreCache: any = null; 
// let _preImageCache: any = null; 
// let _bgdataCache: any = null; 
// let _commondataCache: any = null; 
// let _singledataCache: any = null; 
// let _samedataCache: any = null; 
// let _sizecountdataCache: any = null; 
// let _ignoreRemainingdataCache: any = null; 
// let _preImageRemainingdataCache: any = null; 
// let _bgRemainingdataCache: any = null; 
// let _commonRemainingdataCache: any = null; 
// let _singleRemainingdataCache: any = null; 
// let _sameRemainingdataCache: any = null; 
// let _sizecountRemainingdataCache: any = null; 
// // #endregion
// // #region 工具函数
// function formatSize(bytes: number): string {
//     if (bytes >= 1024 * 1024) {
//         return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
//     } else {
//         return (bytes / 1024).toFixed(2) + ' KB';
//     }
// }
// function deepClone(obj: any): any {
//     return JSON.parse(JSON.stringify(obj));
// }
// // #endregion
// module.exports = Editor.Panel.define({
//     listeners: {
//         show() { console.log('show'); },
//         hide() { console.log('hide'); },
//     },
//     template: readFileSync(join(__dirname, '../../../static/template/resourcesdeal/index.html'), 'utf-8'),
//     style: readFileSync(join(__dirname, '../../../static/style/resourcesdeal/index.css'), 'utf-8'),
//     $: {
//         tabs: '#tabs',
//         content: '#content',
//         buildmapsdatabtn: '#buildmapsdatabtn',
//         directoryInput: '#directoryInput',
//         directoryOutput: '#directoryOutput',
//         genImageTableBtn: '#genImageTableBtn',
//         genPrefabTableBtn: '#genPrefabTableBtn',
//         imageTable: '#imageTable',
//         prefabTable: '#prefabTable',
//         buildMapsDataResultContainer: '#buildMapsDataResultContainer',
//         buildMapsDataResultPath: '#buildMapsDataResultPath',
//         imageStatsPicUsed: '#imageStatsPicUsed',
//         imageStatsContent: '#imageStatsContent',
//         scrollArea: '#scrollArea',
//         contentArea: '#contentArea',
//         //图集设置处理
//         //大图定义
//         defineLargeImageWidth: '#defineLargeImageWidth',
//         defineLargeImageHeight: '#defineLargeImageHeight',
//         defineLargeImageThreshold: '#defineLargeImageThreshold',
//         defineLargeImageByWidth: '#defineLargeImageByWidth',
//         defineLargeImageByHeight: '#defineLargeImageByHeight',
//         defineLargeImageByArea: '#defineLargeImageByArea',
//         defineLargeImageBtn: '#defineLargeImageBtn',
//         //ignore
//         ignorePattern: '#ignorePattern',
//         setIgnorePatternBtn: '#setIgnorePatternBtn',
//         ignoreTotalSize: '#ignoreTotalSize',
//         ignoreTotal: '#ignoreTotal',
//         ignoreRemaining: '#ignoreRemaining',
//         lookIgnorePatternResult: '#lookIgnorePatternResult',
//         //preImage
//         preimgWidthinput: '#preimgWidthinput',
//         preimgHeightinput: '#preimgHeightinput',
//         preImageThreshold: '#preImageThreshold',
//         calculatePreSameImageBtn: '#calculatePreSameImageBtn',
//         preImageTotal: '#preImageTotal',
//         preImagesaving: '#preImagesaving',
//         preImageRemaining: '#preImageRemaining',
//         lookPreImageResultBtn: '#lookPreImageResultBtn',
//         //common
//         commonThreshold: '#commonThreshold',
//         calculateCommon: '#calculateCommon',
//         commonTotalSize: '#commonTotalSize',
//         commonTotal: '#commonTotal',
//         commonRemaining: '#commonRemaining',
//         lookCommonResult: '#lookCommonResult',
//         //bg
//         bgimgWidthinput: '#bgimgWidthinput',
//         bgimgHeightinput: '#bgimgHeightinput',
//         largeImageThreshold: '#largeImageThreshold',
//         calculateBg: '#calculateBg',
//         bgTotalSize: '#bgTotalSize',
//         bgTotal: '#bgTotal',
//         bgRemaining: '#bgRemaining',
//         lookBgResult: '#lookBgResult',
//         //single
//         calculateSingle: '#calculateSingle',
//         singleTotalSize: '#singleTotalSize',
//         singleTotal: '#singleTotal',
//         singleRemaining: '#singleRemaining',
//         lookSingleResult: '#lookSingleResult',
//         //sameDir
//         calculateSameDir: '#calculateSameDir',
//         sameDirTotalSize: '#sameDirTotalSize',
//         sameDirTotal: '#sameDirTotal',
//         sameDirRemaining: '#sameDirRemaining',
//         lookSameDirResult: '#lookSameDirResult',
//         //sizecount
//         sizecountWidthinput: '#sizecountWidthinput',
//         sizecountHeightinput: '#sizecountHeightinput',
//         sizecountCountinput: '#sizecountCountinput',
//         sizeCountThreshold: '#sizeCountThreshold',
//         calculateSizeCount: '#calculateSizeCount',
//         sizeCountTotalSize: '#sizeCountTotalSize',
//         sizeCountTotal: '#sizeCountTotal',
//         sizeCountRemaining: '#sizeCountRemaining',
//         lookSizeCountResult: '#lookSizeCountResult',
//         processAll: '#processAll',
//         //移动图片
//         preprocessIdenticalImagesBtn: '#preprocessIdenticalImagesBtn',
//         lookPreprocessIdenticalImagesBtn: '#lookPreprocessIdenticalImagesBtn',
//         caseConflictKeepOld: '#caseConflictKeepOld',
//         caseConflictUseNew: '#caseConflictUseNew',
//         //移动大图
//         moveBgImagesBtn: '#moveBgImagesBtn',
//         PreLookmoveBgImagesBtn: '#PreLookmoveBgImagesBtn',
//         bgPrefabRegex: '#bgPrefabRegex',
//         bgTargetPattern: '#bgTargetPattern',
//         //移动common图片
//         commonTargetPattern: '#commonTargetPattern',
//         moveCommonImagesBtn: '#moveCommonImagesBtn',
//         PreLookmoveCommonImagesBtn: '#PreLookmoveCommonImagesBtn',
//         //移动单独图片
//         singlePrefabRegex: '#singlePrefabRegex',
//         singleTargetPattern: '#singleTargetPattern',
//         moveSingleImagesBtn: '#moveSingleImagesBtn',
//         PreLookmoveSingleImagesBtn: '#PreLookmoveSingleImagesBtn',
//         //移动sameDir图片
//         sameDirPrefabRegex: '#sameDirPrefabRegex',
//         sameDirTargetPattern: '#sameDirTargetPattern',
//         moveSameDirImagesBtn: '#moveSameDirImagesBtn',
//         PreLookmoveSameDirImagesBtn: '#PreLookmoveSameDirImagesBtn',
//     },
//     methods: {
//         // #region 基础功能方法
//         switchTab(tabId: string) {
//             const tabs = this.$.tabs!.querySelectorAll('.tab-button');
//             const panels = this.$.content!.querySelectorAll('.tab-content');
//             panels.forEach(panel => {
//                 (panel as HTMLElement).style.display = 'none';
//             });
//             tabs.forEach(tab => tab.classList.remove('active'));
//             const activeTab = this.$.tabs!.querySelector(`.tab-button[data-tab="${tabId}"]`);
//             const activePanel = this.$.content!.querySelector(`#${tabId}`);
//             activeTab?.classList.add('active');
//             if (activePanel) {
//                 (activePanel as HTMLElement).style.display = 'block';
//             }
//         },
//         // #endregion
//         // #region 阈值更新方法
//         updateThreshold() {
//             const w = parseInt(this.$.bgimgWidthinput.value) || 0;
//             const h = parseInt(this.$.bgimgHeightinput.value) || 0;
//             this.$.largeImageThreshold.value = w * h;
//         },
//         updatesizeCountThreshold(){
//             const w = parseInt(this.$.sizecountWidthinput.value) || 0;
//             const h = parseInt(this.$.sizecountHeightinput.value) || 0;
//             const c = parseInt(this.$.sizecountCountinput.value) || 0;
//             this.$.sizeCountThreshold.value = w * h * c;
//         },
//         updatePreImageThreshold(){
//             const w = parseInt(this.$.preimgWidthinput.value) || 0;
//             const h = parseInt(this.$.preimgHeightinput.value) || 0;
//             this.$.preImageThreshold.value = w * h;
//         },
//         // #endregion
//         // #region 数据处理方法
//         buildMapsData(dir: string) {
//             console.log('点击了构建基础数据按钮');
//             Editor.Message.request('assetsindex', 'dynamic-message', {method: 'buildMapsData', dir: dir})
//             .then((data) => {
//                 Editor.Dialog.info(`构建完成，数据缓存成功,路径:${data.out2}`, {title:'构建完成', buttons:['我知道了']});
//                 _dataCache = data;
//                 this.$.buildMapsDataResultContainer!.style.visibility = 'visible';
//                 (this.$.buildMapsDataResultPath as HTMLInputElement).value = data.out2;
//                 Editor.Profile.setConfig('assetsindex','resourcesdeal_outputdata2_directory', data.out2);
//             })
//         },
//         // #endregion
//         // #region 表格渲染方法
//         renderImageTable(spriteFrameMaps_name: Record<string, string[]>, path2info: any) {
//             console.log('开始渲染图片表格，数据量:', Object.keys(spriteFrameMaps_name).length);
//             if (!spriteFrameMaps_name || Object.keys(spriteFrameMaps_name).length === 0) {
//                 console.warn('spriteFrameMaps_name 数据为空');
//                 return;
//             }
//             const rows = Object.entries(spriteFrameMaps_name)
//                 .map(([img, prefabs]) => ({
//                     img,
//                     count: prefabs.length,
//                     size: path2info[img]?.size || 0,
//                     prefabs: prefabs.slice().sort((a, b) => a.localeCompare(b)),
//                 }))
//                 .sort((a, b) => {
//                     if (a.count !== b.count) return a.count - b.count;
//                     return a.size - b.size;
//                 });
//             const rowStrings = rows.map(row => `
//                 <tr>
//                     <td>${row.img}</td>
//                     <td>${row.count}</td>
//                     <td>${formatSize(row.size)}</td>
//                     <td>${row.prefabs.join('<br/>')}</td>
//                 </tr>
//             `);
//             if (this._clusterize) {
//                 this._clusterize.update(rowStrings);
//             } else {
//                 const tbody = this.$.imageTable.querySelector('tbody')!;
//                 tbody.innerHTML = '';
//                 rows.forEach(row => {
//                     const tr = document.createElement('tr');
//                     tr.innerHTML = `
//                         <td>${row.img}</td>
//                         <td>${row.count}</td>
//                         <td>${formatSize(row.size)}</td>
//                         <td>${row.prefabs.join('<br/>')}</td>
//                     `;
//                     tbody.appendChild(tr);
//                 });
//             }
//             // 统计数据
//             const statsMap: Record<number, { total: number; size: number }> = {};
//             rows.forEach(row => {
//                 if (!statsMap[row.count]) statsMap[row.count] = { total: 0, size: 0 };
//                 statsMap[row.count].total += 1;
//                 statsMap[row.count].size += row.size;
//             });
//             const statsDiv = this.$.imageStatsContent!;
//             statsDiv.innerHTML = '';
//             for (const [count, info] of Object.entries(statsMap)) {
//                 const div = document.createElement('div');
//                 div.textContent = `${count} 次引用: ${info.total} 张图片, 总大小 ${formatSize(info.size)}`;
//                 statsDiv.appendChild(div);
//             }
//             const unusedCount = Object.values(path2info).filter((info: any) => info.count === 0).length;
//             this.$.imageStatsPicUsed!.textContent = `共 ${rows.length} 张图片被引用, ${unusedCount} 张未被引用`;
//         },
//         renderPrefabTable(prefabMaps_name: Record<string, string[]>, spriteFrameMaps_name: Record<string, string[]>) {
//             const tbody = this.$.prefabTable.querySelector('tbody')!;
//             tbody.innerHTML = '';
//             const imgCountMap: Record<string, number> = {};
//             for (const [img, prefabs] of Object.entries(spriteFrameMaps_name)) {
//                 imgCountMap[img] = prefabs.length;
//             }
//             Object.entries(prefabMaps_name).forEach(([prefab, imgs]) => {
//                 imgs.forEach(img => {
//                     const tr = document.createElement('tr');
//                     tr.innerHTML = `
//                         <td>${prefab}</td>
//                         <td>${img}</td>
//                         <td>${imgCountMap[img] || 0}</td>
//                     `;
//                     tbody.appendChild(tr);
//                 });
//             });
//         },
//         // #endregion
//         // #region 弹窗显示方法
//         showAlert(msg: any) {
//             const modal = document.createElement('div');
//             modal.style.cssText = `
//                 position: fixed; top: 50px; left: 50px; width: 500px; height: 400px;
//                 overflow: auto; background: white; border: 1px solid #333; padding: 10px;
//                 z-index: 9999; color: black; font-family: monospace; white-space: pre;
//             `;
//             modal.textContent = JSON.stringify(msg, null, 2);
//             const closeBtn = document.createElement('button');
//             closeBtn.textContent = '关闭';
//             closeBtn.style.cssText = 'position: fixed; top: 50px; left: 575px;';
//             closeBtn.onclick = () => document.body.removeChild(modal);
//             modal.appendChild(closeBtn);
//             document.body.appendChild(modal);
//         },
//         showAlert2(msg: any) {
//             // 这里是完整的树形结构显示代码，为了简洁暂时省略
//             // 可以从原文件复制过来
//             this.showAlert(msg); // 临时使用简单版本
//         },
//         // #endregion
//         // #region 配置初始化方法
//         async initializeConfigurations() {
//             const configs = [
//                 { key: 'resourcesdeal_input_directory', element: 'directoryInput', defaultValue: '' },
//                 { key: 'resourcesdeal_outputdata2_directory', element: 'buildMapsDataResultPath', defaultValue: '', special: 'outputPath' },
//                 { key: 'resourcesdeal_bgPrefabRegex', element: 'bgPrefabRegex', defaultValue: 'preb[/\\\\](.*)[/\\\\](.*)\\.prefab' },
//                 { key: 'resourcesdeal_bgTargetPattern', element: 'bgTargetPattern', defaultValue: 'staticRes/$1/$2/' },
//                 { key: 'resourcesdeal_bgimgWidthinput', element: 'bgimgWidthinput', defaultValue: '400' },
//                 { key: 'resourcesdeal_bgimgHeightinput', element: 'bgimgHeightinput', defaultValue: '400' },
//                 { key: 'resourcesdeal_largeImageThreshold', element: 'largeImageThreshold', defaultValue: '160000' },
//                 { key: 'resourcesdeal_commonThreshold', element: 'commonThreshold', defaultValue: '10' },
//                 { key: 'resourcesdeal_commonTargetPattern', element: 'commonTargetPattern', defaultValue: 'resources/staticRes/common/' },
//                 { key: 'resourcesdeal_sizecountWidthinput', element: 'sizecountWidthinput', defaultValue: '100' },
//                 { key: 'resourcesdeal_sizecountHeightinput', element: 'sizecountHeightinput', defaultValue: '100' },
//                 { key: 'resourcesdeal_sizecountCountinput', element: 'sizecountCountinput', defaultValue: '100' },
//                 { key: 'resourcesdeal_sizeCountThreshold', element: 'sizeCountThreshold', defaultValue: '1000000' },
//                 { key: 'resourcesdeal_singlePrefabRegex', element: 'singlePrefabRegex', defaultValue: 'preb[/\\\\](.*)[/\\\\](.*)\\.prefab' },
//                 { key: 'resourcesdeal_singleTargetPattern', element: 'singleTargetPattern', defaultValue: 'staticRes/$1/single/$2/' },
//                 { key: 'resourcesdeal_sameDirPrefabRegex', element: 'sameDirPrefabRegex', defaultValue: 'preb[/\\\\](.*)[/\\\\](.*)\\.prefab' },
//                 { key: 'resourcesdeal_sameDirTargetPattern', element: 'sameDirTargetPattern', defaultValue: 'staticRes/$1/same/$2/' },
//                 { key: 'resourcesdeal_preimgWidthinput', element: 'preimgWidthinput', defaultValue: '100' },
//                 { key: 'resourcesdeal_preimgHeightinput', element: 'preimgHeightinput', defaultValue: '100' },
//                 { key: 'resourcesdeal_preImageThreshold', element: 'preImageThreshold', defaultValue: '10000' },
//                 { key: 'resourcesdeal_ignorePattern', element: 'ignorePattern', defaultValue: 'i18' },
//                 { key: 'resourcesdeal_caseConflictKeepOld', element: 'caseConflictKeepOld', defaultValue: '0', type: 'checkbox' },
//                 { key: 'resourcesdeal_caseConflictUseNew', element: 'caseConflictUseNew', defaultValue: '0', type: 'checkbox' },
//             ];
//             for (const config of configs) {
//                 try {
//                     const value = await Editor.Profile.getConfig('assetsindex', config.key);
//                     const element = this.$[config.element as keyof typeof this.$] as HTMLInputElement;
//                     if (element) {
//                         if (config.type === 'checkbox') {
//                             element.checked = value === "1";
//                         } else {
//                             element.value = value || config.defaultValue;
//                         }
//                         if (config.special === 'outputPath' && value) {
//                             this.$.buildMapsDataResultContainer!.style.visibility = 'visible';
//                         }
//                     }
//                 } catch (error) {
//                     console.warn(`无法加载配置 ${config.key}:`, error);
//                 }
//             }
//         },
//         // #endregion
//         // #region 事件绑定方法
//         bindEvents() {
//             this.bindTabEvents();
//             this.bindDataBuildEvents();
//             this.bindThresholdEvents();
//             this.bindCalculationEvents();
//             this.bindViewResultEvents();
//             this.bindMoveEvents();
//             this.bindPreprocessEvents();
//         },
//         bindTabEvents() {
//             if (this.$.tabs) {
//                 const tabs = this.$.tabs.querySelectorAll('.tab-button');
//                 tabs.forEach(tab => {
//                     const tabId = tab.getAttribute('data-tab');
//                     if (tabId) {
//                         tab.addEventListener('click', () => this.switchTab(tabId));
//                     }
//                 });
//             }
//         },
//         bindDataBuildEvents() {
//             if (this.$.buildmapsdatabtn) {
//                 this.$.buildmapsdatabtn.addEventListener('click', () => {
//                     const dir = (this.$.directoryInput as HTMLInputElement)?.value;
//                     this.buildMapsData(dir);
//                     Editor.Profile.setConfig('assetsindex', 'resourcesdeal_input_directory', dir);
//                 });
//             }
//             if (this.$.genImageTableBtn) {
//                 this.$.genImageTableBtn.addEventListener('click', () => {
//                     this.generateImageTable();
//                 });
//             }
//         },
//         bindThresholdEvents() {
//             this.$.bgimgWidthinput?.addEventListener('input', this.updateThreshold.bind(this));
//             this.$.bgimgHeightinput?.addEventListener('input', this.updateThreshold.bind(this));
//             this.updateThreshold();
//             this.$.sizecountWidthinput?.addEventListener('input', this.updatesizeCountThreshold.bind(this));
//             this.$.sizecountHeightinput?.addEventListener('input', this.updatesizeCountThreshold.bind(this));
//             this.$.sizecountCountinput?.addEventListener('input', this.updatesizeCountThreshold.bind(this));
//             this.updatesizeCountThreshold();
//             this.$.preimgWidthinput?.addEventListener('input', this.updatePreImageThreshold.bind(this));
//             this.$.preimgHeightinput?.addEventListener('input', this.updatePreImageThreshold.bind(this));
//             this.updatePreImageThreshold();
//         },
//         bindCalculationEvents() {
//             this.$.setIgnorePatternBtn?.addEventListener('click', () => {
//                 this.calculateIgnore(_dataCache?.path2info);
//             });
//             this.$.calculatePreSameImageBtn?.addEventListener('click', () => {
//                 this.calculatePreImage(_ignoreRemainingdataCache || _dataCache?.path2info);
//             });
//             this.$.calculateBg?.addEventListener('click', () => {
//                 this.calculateBg(_preImageRemainingdataCache || _ignoreRemainingdataCache || _dataCache?.path2info);
//             });
//             this.$.calculateCommon?.addEventListener('click', () => {
//                 this.calculateCommon(_preImageRemainingdataCache || _dataCache?.path2info);
//             });
//             this.$.calculateSingle?.addEventListener('click', () => {
//                 this.calculateSingle(_commonRemainingdataCache || _dataCache?.path2info);
//             });
//             this.$.calculateSameDir?.addEventListener('click', () => {
//                 this.calculateSame(_singleRemainingdataCache || _dataCache?.path2info);
//             });
//             this.$.calculateSizeCount?.addEventListener('click', () => {
//                 this.calculateSizeCount(_sameRemainingdataCache || _dataCache?.path2info);
//             });
//             this.$.processAll?.addEventListener('click', () => {
//                 this.processAllCalculations();
//             });
//         },
//         bindViewResultEvents() {
//             const viewResultButtons = [
//                 { button: 'lookIgnorePatternResult', cache: () => _ignoreCache, message: '请先计算忽略跳过包含的内容' },
//                 { button: 'lookPreImageResultBtn', cache: () => _preImageCache, message: '请先计算预处理相同大图', useAlert2: true },
//                 { button: 'lookBgResult', cache: () => _bgdataCache, message: '请先计算大图文件夹图片数量' },
//                 { button: 'lookCommonResult', cache: () => _commondataCache, message: '请先计算图集文件夹图片数量' },
//                 { button: 'lookSingleResult', cache: () => _singledataCache, message: '请先计算单独文件夹图片数量' },
//                 { button: 'lookSameDirResult', cache: () => _samedataCache, message: '请先计算相同目录文件夹图片数量' },
//                 { button: 'lookSizeCountResult', cache: () => _sizecountdataCache, message: '请先计算按大小引用次数图片数量' },
//             ];
//             viewResultButtons.forEach(({ button, cache, message, useAlert2 }) => {
//                 this.$[button as keyof typeof this.$]?.addEventListener('click', () => {
//                     const data = cache();
//                     if (!data) {
//                         console.warn(message);
//                         return;
//                     }
//                     useAlert2 ? this.showAlert2(data) : this.showAlert(data);
//                 });
//             });
//         },
//         bindMoveEvents() {
//             // 预览移动
//             this.$.PreLookmoveBgImagesBtn?.addEventListener('click', () => this.moveBgImage(true));
//             this.$.PreLookmoveCommonImagesBtn?.addEventListener('click', () => this.moveCommonImage(true));
//             this.$.PreLookmoveSingleImagesBtn?.addEventListener('click', () => this.moveSingleImage(true));
//             this.$.PreLookmoveSameDirImagesBtn?.addEventListener('click', () => this.moveSameImage(true));
//             // 实际移动
//             this.$.moveBgImagesBtn?.addEventListener('click', () => this.moveBgImage());
//             this.$.moveCommonImagesBtn?.addEventListener('click', () => this.moveCommonImage());
//             this.$.moveSingleImagesBtn?.addEventListener('click', () => this.moveSingleImage());
//             this.$.moveSameDirImagesBtn?.addEventListener('click', () => this.moveSameImage());
//         },
//         bindPreprocessEvents() {
//             this.$.preprocessIdenticalImagesBtn?.addEventListener('click', () => {
//                 this.preChangeImagesAndPrefabs();
//             });
//         },
//         // #endregion
//         // #region 数据生成方法
//         generateImageTable() {
//             console.log('点击了生成图片使用表按钮');
//             const filePath = (this.$.buildMapsDataResultPath as HTMLInputElement)?.value;
//             if (!filePath) {
//                 console.warn('输出数据文件路径为空');
//                 return;
//             }
//             try {
//                 const raw = fs.readFileSync(filePath, 'utf8');
//                 const parsed = JSON.parse(raw);
//                 _dataCache = {
//                     prefabMaps_name: parsed.prefabMaps_name,
//                     spriteFrameMaps_name: parsed.spriteFrameMaps_name,
//                     path2info: parsed.path2info,
//                 };
//                 _spriteFrameMaps_nameCache = deepClone(_dataCache.spriteFrameMaps_name);
//                 console.log('成功读取缓存数据，开始渲染图片使用表');
//                 this.renderImageTable(_dataCache.spriteFrameMaps_name, _dataCache.path2info);
//             } catch (err) {
//                 console.error('读取或解析数据文件失败:', err);
//             }
//         },
//         // #endregion
//         // #region 计算功能方法
//         calculateIgnore(path2info: any) {
//             if (!path2info) {
//                 console.warn('请先构建基础数据');
//                 return;
//             }
//             let _remainpath2info = deepClone(path2info);
//             _remainpath2info = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => (info as any).count > 0));
//             const pattern = (this.$.ignorePattern as HTMLInputElement).value;
//             const patterns = pattern.split(',').map(p => p.trim()).filter(p => p.length > 0);
//             Editor.Profile.setConfig('assetsindex', 'resourcesdeal_ignorePattern', pattern);
//             _ignoreRemainingdataCache = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => {
//                 return !patterns.some(p => path.includes(p));
//             }));
//             const num_ignoreTotal = Object.keys(_remainpath2info).length - Object.keys(_ignoreRemainingdataCache).length;
//             const num_ignoreRemaining = Object.keys(_ignoreRemainingdataCache).length;
//             (this.$.ignoreTotal as HTMLInputElement).textContent = num_ignoreTotal.toString();
//             (this.$.ignoreRemaining as HTMLInputElement).textContent = num_ignoreRemaining.toString();
//             _ignoreCache = Object.fromEntries(Object.entries(_remainpath2info).filter(([path, info]) => {
//                 return patterns.some(p => path.includes(p));
//             }));
//             const totalSize = Number(Object.values(_ignoreCache).reduce((sum, info: any) => sum + info.size, 0));
//             (this.$.ignoreTotalSize as HTMLInputElement).textContent = formatSize(totalSize);
//             console.log('计算忽略跳过包含的内容完成,共:', num_ignoreTotal, '剩余:', num_ignoreRemaining);
//         },
//         // 其他计算方法类似结构，为了简洁省略...
//         calculateBg(path2info: any) {
//             // 大图计算逻辑
//         },
//         calculateCommon(path2info: any) {
//             // 通用图集计算逻辑
//         },
//         calculateSingle(path2info: any) {
//             // 单独图片计算逻辑
//         },
//         calculateSame(path2info: any) {
//             // 相同目录计算逻辑
//         },
//         calculateSizeCount(path2info: any) {
//             // 按大小计数计算逻辑
//         },
//         calculatePreImage(path2info: any) {
//             // 预处理相同大图逻辑
//         },
//         processAllCalculations() {
//             // 一键处理所有计算
//             if (!_dataCache || !_dataCache.path2info) {
//                 console.warn('请先构建基础数据，双向索引表');
//                 return;
//             }
//             this.calculateIgnore(_dataCache.path2info);
//             if (_ignoreRemainingdataCache) {
//                 this.calculatePreImage(_ignoreRemainingdataCache);
//             }
//             if (_preImageRemainingdataCache) {
//                 this.calculateBg(_preImageRemainingdataCache);
//             }
//             if (_bgRemainingdataCache) {
//                 this.calculateCommon(_bgRemainingdataCache);
//             }
//             if (_commonRemainingdataCache) {
//                 this.calculateSingle(_commonRemainingdataCache);
//             }
//             if (_singleRemainingdataCache) {
//                 this.calculateSame(_singleRemainingdataCache);
//             }
//             if (_sameRemainingdataCache) {
//                 this.calculateSizeCount(_sameRemainingdataCache);
//             }
//         },
//         // #endregion
//         // #region 移动功能方法
//         moveBgImage(preLook = false) {
//             // 移动大图逻辑
//         },
//         moveCommonImage(preLook = false) {
//             // 移动通用图逻辑
//         },
//         moveSingleImage(preLook = false) {
//             // 移动单独图逻辑
//         },
//         moveSameImage(preLook = false) {
//             // 移动相同目录图逻辑
//         },
//         preChangeImagesAndPrefabs() {
//             // 预处理相同图片和预制体逻辑
//         },
//         // #endregion
//         // #region 初始化方法
//         initializeClusterize() {
//             setTimeout(() => {
//                 try {
//                     // @ts-ignore
//                     const Clusterize = require('../../../static/libs/clusterize.js');
//                     if (!Clusterize) {
//                         console.error('Clusterize.js 未正确加载');
//                         return;
//                     }
//                     this._clusterize = new Clusterize({
//                         scrollElem: this.$.scrollArea,
//                         contentElem: this.$.contentArea,
//                         rows: [],
//                         no_data_text: '暂无图片引用数据',
//                     });
//                 } catch (error) {
//                     console.error('Clusterize 初始化失败:', error);
//                 }
//             }, 1000);
//         },
//         // #endregion
//     },
//     async ready() {
//         try {
//             // 初始化配置
//             await this.initializeConfigurations();
//             // 绑定事件
//             this.bindEvents();
//             // 初始化 Clusterize
//             this.initializeClusterize();
//             console.log('ResourcesDeal 面板初始化完成');
//         } catch (error) {
//             console.error('ResourcesDeal 面板初始化失败:', error);
//         }
//     },
//     beforeClose() { },
//     close() { },
// });
