"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
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
    template: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/template/default/index.html'), 'utf-8'),
    style: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/style/default/index.css'), 'utf-8'),
    $: {
        app: '#app',
        myButton: '#myButton',
        buildFolders: '#buildFolders',
        tab1: '#tab1',
        tab2: '#tab2',
        panel1: '#panel1',
        panel2: '#panel2',
    },
    methods: {
        hello() {
            if (this.$.app) {
                this.$.app.innerHTML = 'hello';
                console.log('[cocos-panel-html.default]: hello');
            }
        },
        generateAssetsIndex() {
            var _a;
            console.log('生成 assetsindex.json1741');
            // 这里可以写生成 assetsindex.json 的逻辑
            const selectedFolder = (_a = this.$.buildFolders) === null || _a === void 0 ? void 0 : _a.value;
            Editor.Message.request('assetsindex', 'generate-assets-index', selectedFolder)
                .then(() => {
                console.log('渲染进程：生成完成');
            })
                .catch(err => {
                console.error('渲染进程：生成失败', err);
            });
        },
        fetchBuildFolders() {
            console.log('获取已构建文件列表');
            Editor.Message.request('assetsindex', 'fetch-build-folders')
                .then((folders) => {
                console.log('已获取构建文件夹列表', folders);
                //把folders填充到下拉框中
                const select = this.$.buildFolders;
                if (!select) {
                    console.error('下拉框元素未找到');
                    return;
                }
                select.innerHTML = ''; // 清空现有选项
                folders.forEach((folder) => {
                    const option = document.createElement('option');
                    option.value = folder;
                    option.textContent = folder;
                    select.appendChild(option);
                });
            });
        },
        switchTab(tabId) {
            // 移除所有 Tab 和内容的 active 状态
            this.$.tab1 && this.$.tab1.classList.remove('active');
            this.$.tab2 && this.$.tab2.classList.remove('active');
            this.$.panel1 && this.$.panel1.classList.remove('active');
            this.$.panel2 && this.$.panel2.classList.remove('active');
            // 激活选中的 Tab 和内容
            if (tabId === 'tab1') {
                this.$.tab1 && this.$.tab1.classList.add('active');
                this.$.panel1 && this.$.panel1.classList.add('active');
            }
            else if (tabId === 'tab2') {
                this.$.tab2 && this.$.tab2.classList.add('active');
                this.$.panel2 && this.$.panel2.classList.add('active');
            }
        },
    },
    ready() {
        if (this.$.myButton) {
            this.$.myButton.addEventListener('click', this.generateAssetsIndex.bind(this));
        }
        if (this.$.tab1) {
            this.$.tab1.addEventListener('click', () => { this.switchTab('tab1'); });
        }
        if (this.$.tab2) {
            this.$.tab2.addEventListener('click', () => { this.switchTab('tab2'); });
        }
        this.fetchBuildFolders(); // 初始化下拉框
    },
    beforeClose() { },
    close() { },
});
