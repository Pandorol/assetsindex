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
        tabs: '#tabs',
        content: '#content',
    },
    methods: {
        hello() {
            if (this.$.app) {
                this.$.app.innerHTML = 'hello';
                console.log('[cocos-panel-html.default]: hello');
            }
        },
        switchTab(tabId) {
            // 获取所有 Tab 和内容
            const tabs = this.$.tabs.querySelectorAll('.tab-button');
            const panels = this.$.content.querySelectorAll('.tab-content');
            // 移除所有 Tab 和内容的 active 状态
            tabs.forEach(tab => tab.classList.remove('active'));
            panels.forEach(panel => panel.classList.remove('active'));
            // 激活选中的 Tab 和内容
            const activeTab = this.$.tabs.querySelector(`.tab-button[data-tab="${tabId}"]`);
            const activePanel = this.$.content.querySelector(`#${tabId}`);
            activeTab === null || activeTab === void 0 ? void 0 : activeTab.classList.add('active');
            activePanel === null || activePanel === void 0 ? void 0 : activePanel.classList.add('active');
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
    },
    ready() {
        // 绑定 Tab 点击事件
        if (this.$.tabs) {
            const tabs = this.$.tabs.querySelectorAll('.tab-button');
            tabs.forEach(tab => {
                const tabId = tab.getAttribute('data-tab');
                if (tabId) {
                    tab.addEventListener('click', () => this.switchTab(tabId));
                }
            });
        }
        if (this.$.myButton) {
            this.$.myButton.addEventListener('click', this.generateAssetsIndex.bind(this));
        }
        this.fetchBuildFolders(); // 初始化下拉框
    },
    beforeClose() { },
    close() { },
});
