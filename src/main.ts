// @ts-ignore

import packageJSON from '../package.json';
const fs = require('fs');
const path = require('path');
const fg = require('fast-glob');
const crypto = require('crypto');

/**
 * @en 
 * @zh 为扩展的主进程的注册方法
 */
export const methods: { [key: string]: (...any: any) => any } = {
    openPanel() {
        Editor.Panel.open(packageJSON.name);
    },
    openPanel2() {
        // 生成assetsindex.json
        Editor.Panel.open('assetsindex.resourcesdeal');
    },
    generateAssetsIndex(arg) {
        console.log('主进程：开始生成 assetsindex.json');
        // 遍历构建文件夹中的每个 bundle 的 config
        const fs = require('fs');
        const path = require('path');
        const buildDir = path.join(Editor.Project.path, 'build');
        console.log('arg:', arg);
        const buildplatformdir = path.join(buildDir, arg);
        if (!fs.existsSync(buildplatformdir)) {
            console.error('构建平台目录不存在:', buildplatformdir);
            return;
        }

        // 读取构建目录下assets\assets下的文件夹，这下面都是bundle文件夹，找到每个bundle文件夹下的cc.config.匹配任意值.json,读取json里的"paths":{"0":["texture/i18n/zh_tw/common/tips_btn_djly",1],"1":["texture/i18n/zh_ko/crossPvpTop/2",1],
        //paths字段里的所有路径，生成assetsindex.json
        const assetsIndex: { [key: string]: any } = {};
        
        let findfunction = (assetsDir: string) => {
            if (!fs.existsSync(assetsDir)) {
                console.error('assets目录不存在:', assetsDir);
                return;
            }
            const bundles = fs.readdirSync(assetsDir).filter((file: any) => {
                const filePath = path.join(assetsDir, file);
                return fs.statSync(filePath).isDirectory();
            });
            //找到每个bundle文件夹下的cc.config.匹配任意值.json,读取json里的"paths"字段
            console.log('已找到构建文件夹列表:', assetsDir, bundles);
            bundles.forEach((bundle:string) => {
                const configPath = path.join(assetsDir, bundle, 'cc.config.*.json').replace(/\\/g, '/');
                console.log(`正在处理 ${bundle} 的配置文件: ${configPath}`);
                const configFiles = fg.sync(configPath); // 使用 fast-glob 匹配文件
                if (configFiles.length === 0) {
                    console.warn(`未找到 ${bundle} 的配置文件`);
                    return;
                }
                //这里只会有一个文件
                if (configFiles.length > 0) {
                    const configFile = configFiles[0];
                    const configData = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
                    if (configData.paths) {
                        // 遍历paths字段
                        Object.keys(configData.paths).forEach((key) => {
                            const paths = configData.paths[key];
                            // console.log(`处理 ${bundle} 的路径:`, paths);
                            if (Array.isArray(paths) && paths.length > 0) {
                                // 只取第一个路径，顺便检测一下同名的，有就打印出来
                                const assetPath = paths[0];
                                if (assetsIndex[assetPath] && assetsIndex[assetPath] !== bundle) {
                                    console.warn(`警告：路径 ${assetPath} 在多个 bundle 中重复，当前 bundle: ${bundle}`);
                                    //如果路径中没有'i18n'，则打印出来
                                    if (!assetPath.includes('i18n')) {
                                        console.error(`检测到重名且非i18路径: ${assetPath}，已存在于 bundle: ${assetsIndex[assetPath]}，当前 bundle: ${bundle}`);
                                    }

                                }
                                
                                assetsIndex[assetPath] = bundle; // 将路径和对应的 bundle 存入 assetsIndex
                            }
                        });
                    }
                }
            });
        }
        const _assetsDir = path.join(buildplatformdir, 'assets', 'assets');
        findfunction(_assetsDir);
        const _remoteAssetsDir = path.join(buildplatformdir, 'remote');
        findfunction(_remoteAssetsDir);

        console.log('生成的 assetsindex:', assetsIndex);

        
        // 生成assetsindex.json
        fs.writeFileSync(path.join(buildplatformdir, 'assetsindex.json'), JSON.stringify(assetsIndex, null, 4));
    },
    fetchBuildFolders() {
        console.log('主进程：获取已构建文件列表');
        // 这里可以写获取已构建文件夹列表的逻辑
        const fs = require('fs');
        const path = require('path');
        const buildDir = path.join(Editor.Project.path, 'build');
        if (!fs.existsSync(buildDir)) {
            console.error('构建目录不存在:', buildDir);
            return [];
        }
        // 读取构建目录下的所有文件夹列表
        const folders = fs.readdirSync(buildDir).filter((file: any) => {
            const filePath = path.join(buildDir, file);
            return fs.statSync(filePath).isDirectory();
        })
        return fs.readdirSync(buildDir)
    },
    


    handleDynamicMessage(args) {
        const methodMap: any = {
            "buildMapsData": buildMapsData,
            "moveBgImages": moveBgImages,
            "preChangeImagesAndPrefabs": preChangeImagesAndPrefabs,
            "deleteEmptyFolders": deleteEmptyFolders
        };

        if (methodMap[args.method]) {
            return methodMap[args.method](args);
        } else {
            console.error(`Unknown method: ${args.method}`);
        }
    }
};
async function preChangeImagesAndPrefabs(args: any) {
    console.log('preChangeImagesAndPrefabs called with args:', args);
    
    const { preImageCache } = args;
    
    if (!preImageCache) {
        throw new Error('preImageCache 参数是必需的');
    }
    
    if (!preImageCache.duplicateGroups || Object.keys(preImageCache.duplicateGroups).length === 0) {
        console.log('没有重复的图片需要处理');
        return {
            success: true,
            processedFiles: 0,
            deletedFiles: 0,
            message: '没有重复的图片需要处理'
        };
    }
    
    const projectRoot = path.join(Editor.Project.path, 'assets');
    let processedFiles = 0;
    let deletedFiles = 0;
    const errors: string[] = [];
    
    try {
        // 1. 修改预制体文件中的引用
        console.log('开始修改预制体文件中的引用...');
        Object.entries(preImageCache.duplicateGroups).forEach(([md5, paths]: [string, string[]]) => {
            const keepImage = paths[0];
            const removeImages = paths.slice(1);
            
            // 获取保留图片的 UUID
            const keepImageInfo = preImageCache.keepImages[md5];
            if (!keepImageInfo) {
                console.warn(`未找到保留图片信息: ${md5}`);
                return;
            }
            
            const keepImageUuid = keepImageInfo.info.uuid;
            
            // 处理每个要删除的图片的引用
            removeImages.forEach(removePath => {
                const removeItem = preImageCache.removeImages[md5].find((item: any) => item.path === removePath);
                if (!removeItem) return;
                
                const removeImageUuid = removeItem.info.uuid;
                const references = removeItem.references;
                
                // 修改每个引用该图片的预制体文件
                references.forEach((prefabPath: string) => {
                    try {
                        const prefabAbsPath = path.join(projectRoot, prefabPath);
                        if (!fs.existsSync(prefabAbsPath)) {
                            console.warn(`预制体文件不存在: ${prefabPath}`);
                            return;
                        }
                        
                        let content = fs.readFileSync(prefabAbsPath, 'utf8');
                        let modified = false;
                        
                        // 替换 UUID 引用
                        const originalContent = content;
                        
                        // 使用正则表达式替换所有对旧 UUID 的引用
                        const uuidPattern = new RegExp(`"${removeImageUuid}"`, 'g');
                        content = content.replace(uuidPattern, `"${keepImageUuid}"`);
                        
                        if (content !== originalContent) {
                            fs.writeFileSync(prefabAbsPath, content, 'utf8');
                            console.log(`更新预制体文件: ${prefabPath}, 将 ${removeImageUuid} 替换为 ${keepImageUuid}`);
                            processedFiles++;
                            modified = true;
                        }
                        
                        if (!modified) {
                            console.warn(`在预制体文件中未找到需要替换的 UUID: ${prefabPath}`);
                        }
                        
                    } catch (e) {
                        console.error(`处理预制体文件失败: ${prefabPath}`, e);
                        errors.push(`处理预制体文件失败: ${prefabPath} - ${e.message}`);
                    }
                });
            });
        });
        
        // 2. 刷新资源数据库
        console.log('刷新资源数据库...');
        try {
            await Editor.Message.send('asset-db', 'refresh-asset', 'db://assets');
            console.log('资源数据库刷新完成');
        } catch (e) {
            console.warn('刷新资源数据库失败:', e);
        }
        
        // 3. 删除重复的图片文件
        console.log('开始删除重复的图片文件...');
        for (const [md5, removeList] of Object.entries(preImageCache.removeImages)) {
            for (const item of removeList as any[]) {
                const imgPath = item.path;
                const dbPath = `db://assets/${imgPath}`;
                
                try {
                    // 使用 asset-db API 删除文件
                    await Editor.Message.request('asset-db', 'delete-asset', dbPath);
                    console.log(`删除重复文件: ${imgPath}`);
                    deletedFiles++;
                } catch (e) {
                    console.error(`删除文件失败: ${imgPath}`, e);
                    errors.push(`删除文件失败: ${imgPath} - ${e.message}`);
                }
            }
        }
        
        const summary = preImageCache.summary;
        console.log(`预制体引用修改完成:`);
        console.log(`- 处理的预制体文件: ${processedFiles} 个`);
        console.log(`- 删除的重复图片: ${deletedFiles} 个`);
        console.log(`- 重复组数: ${summary.totalGroups}`);
        console.log(`- 节省空间: ${formatSize(summary.totalSavedSize)}`);
        
        return {
            success: true,
            processedFiles,
            deletedFiles,
            totalGroups: summary.totalGroups,
            totalSavedSize: summary.totalSavedSize,
            errors: errors.length > 0 ? errors : undefined,
            message: `成功处理 ${processedFiles} 个预制体文件，删除 ${deletedFiles} 个重复图片，节省空间 ${formatSize(summary.totalSavedSize)}`
        };
        
    } catch (e) {
        console.error('预制体引用修改过程中出错:', e);
        throw e;
    }
}

// 辅助函数：格式化文件大小
function formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
function buildMapsData(args: any) {
    // 在这里实现函数逻辑
    console.log('buildMapsData called with args:', args);
    const dir = args.dir;
    if (!dir || !fs.existsSync(dir)) {
        throw new Error('args.dir 必须是有效路径（一般传 assets 目录）');
    }
    /** @type {Record<string, string[]>} */
    const prefabMaps = {};
    /** @type {Record<string, Set<string>>} */
    const spriteFrameToPrefabs = {};
    const files = fg.sync('**/*.prefab', {
        cwd: dir,
        absolute: false,
        dot: true,
        ignore: ['**/library/**', '**/temp/**', '**/local/**', '**/build/**', '**/.**/**'],
    });
    const addPair = (prefabRel:any, uuid:any) => {
        if (!uuid) return;
        if (!prefabMaps[prefabRel]) prefabMaps[prefabRel] = [];
        if (!prefabMaps[prefabRel].includes(uuid)) prefabMaps[prefabRel].push(uuid);
        if (!spriteFrameToPrefabs[uuid]) spriteFrameToPrefabs[uuid] = new Set();
        spriteFrameToPrefabs[uuid].add(prefabRel);
    };
    console.log(` → ${files.length} 个 prefab`);
    const assetsDir = path.join(Editor.Project.path, 'assets');
    
    for (const rel of files) {
        const abs = path.join(dir, rel);
        let content = '';
        try {
            content = fs.readFileSync(abs, 'utf8');
        } catch (e) {
            console.warn('[read error]', rel, e.message);
            continue;
        }

        const uuids = new Set();

        // 1) 首选 JSON 解析 + 递归遍历
        let parsed = null;
        try {
            parsed = JSON.parse(content);
        } catch (_) {
            // 2) 兜底：正则查找 "_spriteFrame"/"spriteFrame"/"_N$spriteFrame" 的 __uuid__
            const patterns = [
                /"_N?\$?spriteFrame"\s*:\s*\{\s*"__uuid__"\s*:\s*"([^"]+)"\s*\}/g,
                /"_spriteFrame"\s*:\s*\{\s*"__uuid__"\s*:\s*"([^"]+)"\s*\}/g,
                /"spriteFrame"\s*:\s*\{\s*"__uuid__"\s*:\s*"([^"]+)"\s*\}/g,
            ];
            for (const re of patterns) {
                let m;
                while ((m = re.exec(content))) uuids.add(m[1]);
            }
        }

        if (parsed) {
            const visit = (node:any) => {
                if (!node) return;
                if (Array.isArray(node)) {
                for (const it of node) visit(it);
                return;
                }
                if (typeof node === 'object') {
                for (const [k, v] of Object.entries(node)) {
                    // 匹配 _spriteFrame / spriteFrame / _N$spriteFrame
                    if ((/(\b|_|\$)spriteFrame\b/i).test(String(k)) && v && typeof v === 'object') {
                    const id = v['__uuid__'] || v['uuid'];
                    if (typeof id === 'string' && id) uuids.add(id);
                    }
                    visit(v);
                }
            }
        };
        visit(parsed);
        }

        // 计算相对于 assets 目录的路径
        let prefabRelToAssets = '';
        if (abs.startsWith(assetsDir)) {
            // 如果预制体在 assets 目录下，使用相对路径
            prefabRelToAssets = path.relative(assetsDir, abs).replace(/\\/g, '/');
        } else {
            // 如果预制体不在 assets 目录下，使用原来的相对路径
            prefabRelToAssets = rel;
        }

        for (const id of uuids) addPair(prefabRelToAssets, id);
    }
    // 归一化输出
    /** @type {Record<string, string[]>} */
    const spriteFrameMaps = {};
    for (const [uuid, set] of Object.entries(spriteFrameToPrefabs)) {
        spriteFrameMaps[uuid] = Array.from(set as Set<string>).sort();
    }
    for (const k of Object.keys(prefabMaps)) {
        prefabMaps[k].sort();
    }
    console.log(`共 ${Object.keys(prefabMaps).length} 个 prefab，涉及 ${Object.keys(spriteFrameMaps).length} 个 spriteFrame`);
    // ------- 新增: 构建 uuid -> 路径 映射 -------
    const projectRoot =path.join(Editor.Project.path, 'assets') ; // dir 就是 assets 目录
    console.log('projectRoot:', projectRoot);
    const uuid2info: Record<string, { path: string, size: number }> = {};
    const path2info: Record<string, { count: number,uuid: string, size: number,width: number,height: number,md5: string }> = {};
    const metaFiles = fg.sync('**/*.meta', {
        cwd: projectRoot,
        absolute: false,
        dot: true,
        ignore: ['**/library/**', '**/temp/**', '**/local/**', '**/build/**', '**/.**/**'],
    });
    console.log(` → ${metaFiles.length} 个 meta`);
    for (const rel of metaFiles) {
        const abs = path.join(projectRoot, rel);
        let content = '';
        try {
            content = fs.readFileSync(abs, 'utf8');
        } catch {
            continue;
        }

        let meta = null;
        try {
            meta = JSON.parse(content);
        } catch {
            continue;
        }
        if (!meta || !meta.subMetas) continue;
        for (const sub of Object.values<any>(meta.subMetas)) {
            if (sub.importer === 'sprite-frame' && sub.uuid) {
                // 记录 uuid -> 文件路径 (去掉 .meta)
                const imgPath = abs.slice(projectRoot.length + 1, -5).replace(/\\/g, '/');

                // 计算对应贴图大小（如果有对应的导入文件）
                let size = 0;
                let md5 = '';
                const texFile = abs.replace(/\.meta$/, ''); // 对应的源图
                if (fs.existsSync(texFile)) {
                    try {
                        const stat = fs.statSync(texFile);
                        size = stat.size;
                        // 计算文件MD5
                        const buffer = fs.readFileSync(texFile);
                        md5 = crypto.createHash('md5').update(buffer).digest('hex');
                    } catch(e) {
                        console.error('error:', texFile, e.message);
                    }
                }
                // 直接从 userData 取宽高
                const width = sub.userData?.width ?? sub.userData?.rawWidth ?? 0;
                const height = sub.userData?.height ?? sub.userData?.rawHeight ?? 0;
                // 存成对象
                uuid2info[sub.uuid] = {
                    path: imgPath,
                    size,
                };
                path2info[imgPath] = {
                    count: 0,
                    uuid: sub.uuid,
                    size,
                    width,
                    height,
                    md5,
                };
            }
        }
    }
    // ------- 新增: 用路径替换 uuid -------
    const prefabMaps_name: Record<string, string[]> = {};
    const spriteFrameMaps_name: Record<string, string[]> = {};

    for (const [prefab, uuids] of Object.entries(prefabMaps)) {
        prefabMaps_name[prefab] = (uuids as string[])
        .map((id) => uuid2info[id]?.path)
        .filter(Boolean)
        .sort();
    }
    for (const [uuid, prefabs] of Object.entries(spriteFrameMaps)) {
        const info = uuid2info[uuid];
        if (!info) continue;
        spriteFrameMaps_name[info.path] = (prefabs as string[]).slice();
        path2info[info.path].count = (prefabs as string[]).length;
    }
    // ------- 输出 -------
    if(!args?.out) {
        // 项目根目录
        const projectRoot = Editor.Project.path;
        // extensions/resultouts 目录
        const outDir = path.join(projectRoot, 'extensions', packageJSON.name, 'resultouts');
        // 如果不存在则创建
        if (!fs.existsSync(outDir)) {
            fs.mkdirSync(outDir, { recursive: true });
        }
        // 输出文件
        args.out = path.join(outDir, 'sprite_maps.json');
    }
    const outDir = path.isAbsolute(args.out) ? args.out : path.join(Editor.Project.path, args.out);
    fs.mkdirSync(path.dirname(outDir), { recursive: true });
    const out1 = outDir.replace(/(\.json)?$/, '1.json');
    const out2 = outDir.replace(/(\.json)?$/, '2.json');
    fs.writeFileSync(out1, JSON.stringify({ prefabMaps, spriteFrameMaps }, null, 2), 'utf8');
    fs.writeFileSync(out2, JSON.stringify({ prefabMaps_name, spriteFrameMaps_name, path2info }, null, 2), 'utf8');
    console.log(`映射已写入 → ${out1}, ${out2}`);
    return { prefabMaps, spriteFrameMaps, prefabMaps_name, spriteFrameMaps_name, uuid2info, path2info, out1, out2 };
}
async function moveBgImages(args:any){
    console.log('moveBgImages called');
    
    // 添加超时包装函数
    const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
        return Promise.race([
            promise,
            new Promise<never>((_, reject) => 
                setTimeout(() => reject(new Error(`操作超时 (${ms}ms)`)), ms)
            )
        ]);
    };
    
    const spriteFrameMaps_name = args.spriteFrameMaps_name;
    const path2info = args.path2info;
    // const bgPrefabRegex = new RegExp(args.bgPrefabRegex); // e.g., "preb/(.*?)/(.*?).prefab"
    const bgTargetPattern = args.bgTargetPattern; // e.g., "staticRes/$1/$2/" 普通图片路径
    const bigTargetPattern = args.bigTargetPattern; // 大图路径
    const defineBigImage = args.defineBigImage; // 大图定义配置
    const absprefix = path.join(Editor.Project.path, 'assets');
    const regex = new RegExp(args.bgPrefabRegex || ".*"); // 默认匹配所有
    let caseConflictStrategy = 'keepOld'; // 'useNew' 或 'keepOld'
    if(!args.keepOld){
        caseConflictStrategy = 'useNew';
    }
    
    // 获取自动重命名选项，默认为 true
    const autoRename = args.autoRename !== undefined ? args.autoRename : true;
    
    // 记录移动操作
    const recordMoveOperation = (src: string, dest: string, targetDir: string, imgPath: string) => {
        operations.push({ src, dest, targetDir, imgPath });
    };

    let movedCount = 0;
    let errorCount = 0;
    const operations = []; // 收集所有移动操作
    const no_ops = []; // 收集所有不需要移动的文件
    const errors = [];
        // 第一阶段：收集所有移动操作
    console.log('开始分析需要移动的文件...');
    
    for (const [imgPath, info] of Object.entries(path2info)) {
        const prefabList = spriteFrameMaps_name[imgPath];
        if (!prefabList || prefabList.length === 0) {
            console.warn(`未被引用的图片: ${imgPath}`);
            continue;
        }

        // 取第一个 prefab 进行匹配
        const prefabPath = prefabList[0];
        const match = prefabPath.match(regex);
        if (!match) {
            console.warn(`prefab 路径不匹配正则: ${prefabPath}`);
            continue;
        }

        // 判断是否为大图 - 使用预计算的结果
        const imgInfo = info as any;
        const isLarge = args.imageSizeMap ? args.imageSizeMap[imgPath] : false;
        
        // 根据是否为大图选择目标路径模板
        let targetDir = isLarge ? (bigTargetPattern || bgTargetPattern) : bgTargetPattern;

        // 构建新的目标目录
        // 如果有捕获组，进行替换；否则直接使用 targetPattern
        if (match.length > 1) {
            match.forEach((g, i) => {
                if (i > 0) { // 跳过完整匹配
                    targetDir = targetDir.replace(new RegExp("\\$" + i, "g"), g);
                }
            });
        }

        // 规范化路径分隔符并确保以 / 结尾
        targetDir = targetDir.replace(/\\/g, '/');
        if (!targetDir.endsWith('/')) {
            targetDir += '/';
        }

        // 拼接源和目标 db:// 路径
        const src = `db://assets/${imgPath.replace(/\\/g, '/')}`;
        const fileName = path.basename(imgPath);
        const dest = `db://assets/${targetDir}${fileName}`;
        
        if (src !== dest) {
            operations.push({ src, dest, targetDir, imgPath });
        }
        else{
            no_ops.push({ src, dest, targetDir, imgPath, reason: '源路径与目标路径相同' });
        }
    }

    
    if (operations.length === 0) {
        console.log('没有需要移动的文件');
        return { movedCount: 0, errorCount: 0, errors: [] };
    }
    // 第二阶段：处理大小写冲突并创建目录
    console.log('开始处理大小写冲突并创建目录...');
    const caseConflictMap = await handleCaseConflictsAndCreateDirs(operations, caseConflictStrategy, errors);
    
    // 大小写冲突处理后，重新过滤掉源路径和目标路径相同的文件
    const originalCount = operations.length;
    const filteredOperations = operations.filter(op => op.src !== op.dest);
    const removedCount = originalCount - filteredOperations.length;
    
    if (removedCount > 0) {
        console.log(`大小写冲突处理后，过滤掉 ${removedCount} 个源路径与目标路径相同的文件`);
        // 将过滤掉的文件添加到no_ops中
        operations.filter(op => op.src === op.dest).forEach(op => {
            no_ops.push({ ...op, reason: '大小写冲突处理后，源路径与目标路径相同' });
        });
    }
    
    // 更新operations为过滤后的数组
    operations.length = 0;
    operations.push(...filteredOperations);

    console.log(`处理后，实际需要移动 ${operations.length} 个文件`);

    if(args.preLook) {
        console.log('预览模式，返回分析结果，不进行实际移动');
        
        // 找出所有有重复dest的操作组
        const destGroups = new Map<string, any[]>();
        operations.forEach(op => {
            if (!destGroups.has(op.dest)) {
                destGroups.set(op.dest, []);
            }
            destGroups.get(op.dest)!.push(op);
        });
        
        // 筛选出有冲突的组（超过1个文件指向同一个目标）
        const duplicateDestGroups = Array.from(destGroups.entries())
            .filter(([dest, ops]) => ops.length > 1)
            .map(([dest, ops]) => ({
                dest,
                count: ops.length,
                operations: ops
            }));
        
        // 为了兼容性，也保留原来的平铺格式
        const duplicateDest = duplicateDestGroups.flatMap(group => group.operations);
        
        return {
            tips1:'不需要移动的图片',
            no_ops,
            tips2:'需要移动的图片',
            totalProcessed: operations.length,
            operations,
            caseConflictStrategy,
            tips3:"会同目录同名的文件",
            duplicateDest,
            tips4:"详细的冲突分组",
            duplicateDestGroups
        };
    }
    
    // 第三阶段：刷新资源数据库
    try {
        await Editor.Message.send('asset-db', 'refresh-asset', 'db://assets');
    } catch (e) {
        console.warn('刷新资源数据库失败:', e);
    }
    
    // 第四阶段：批量移动文件
    console.log('开始移动文件...');
    console.log(`准备移动 ${operations.length} 个文件`);
    console.log('移动操作开始时间:', new Date().toLocaleTimeString());
    
    const timeoutFiles = []; // 记录超时的文件
    
    for (let i = 0; i < operations.length; i++) {
        const { src, dest, imgPath } = operations[i];
        const fileName = path.basename(imgPath);
        
        // 输出进度
        if (i % 5 === 0 || i === 0) {
            const currentTime = new Date().toLocaleTimeString();
            console.log(`[${currentTime}] 进度: [${i + 1}/${operations.length}] 正在处理: ${fileName}`);
        }
        
        try {
            // 构建移动操作的选项
            const moveOptions = autoRename ? { rename: true } : {};
            
            // 直接执行移动操作，不做预查询
            console.log(`执行移动: ${fileName}${autoRename ? '(自动重命名)' : ''}`);
            const result = await withTimeout(
                Editor.Message.request('asset-db', 'move-asset', src, dest, moveOptions),
                15000 // 15秒超时
            );
            // console.log(`move-asset 返回结果: ${result}`);
            
            movedCount++;
            
        } catch (e) {
            console.error(`[${i + 1}/${operations.length}] 移动异常: ${fileName}`, e.message);
            
            // 检查是否为超时错误
            if (e.message && e.message.includes('超时')) {
                console.warn(`[${i + 1}/${operations.length}] ${fileName} 操作超时，记录待重试`);
                timeoutFiles.push({ src, dest, imgPath, fileName });
                continue;
            }
            
            // 即使出现异常，也检查目标文件是否存在
            try {
                const destExists = await withTimeout(
                    Editor.Message.request('asset-db', 'query-asset-info', dest),
                    5000 // 5秒超时
                );
                if (destExists) {
                    console.log(`[${i + 1}/${operations.length}] 移动成功 (异常后验证): ${fileName}, 从 ${src} 到 ${dest}`);
                    movedCount++;
                } else {
                    errorCount++;
                    errors.push(`移动失败: ${imgPath} - ${e.message}`);
                }
            } catch (verifyError) {
                console.error(`验证移动结果失败: ${verifyError.message}`);
                errorCount++;
                errors.push(`移动失败: ${imgPath} - ${e.message}`);
            }
        }
    }
    
    // 第五阶段：刷新资源数据库
    console.log('第一轮移动完成，刷新资源数据库...');
    try {
        await Editor.Message.send('asset-db', 'refresh-asset', 'db://assets');
        console.log('资源数据库刷新完成');
    } catch (e) {
        console.warn('刷新资源数据库失败:', e);
    }
    
    // 第六阶段：重试超时的文件
    if (timeoutFiles.length > 0) {
        console.log(`开始重试 ${timeoutFiles.length} 个超时文件...`);
        
        for (let i = 0; i < timeoutFiles.length; i++) {
            const { src, dest, imgPath, fileName } = timeoutFiles[i];
            
            console.log(`[重试 ${i + 1}/${timeoutFiles.length}] 重新尝试移动: ${fileName}${autoRename ? '(自动重命名)' : ''}`);
            
            try {
                // 构建移动操作的选项
                const moveOptions = autoRename ? { rename: true } : {};
                
                const result = await withTimeout(
                    Editor.Message.request('asset-db', 'move-asset', src, dest, moveOptions),
                    15000 // 15秒超时
                );
                
                console.log(`[重试 ${i + 1}/${timeoutFiles.length}] 移动成功: ${fileName}`);
                movedCount++;
                
            } catch (e) {
                console.error(`[重试 ${i + 1}/${timeoutFiles.length}] 移动仍然失败: ${fileName}`, e.message);
                errorCount++;
                errors.push(`移动超时重试失败: ${imgPath}`);
            }
        }
        
        // 最终刷新
        console.log('重试完成，最终刷新资源数据库...');
        try {
            await Editor.Message.send('asset-db', 'refresh-asset', 'db://assets');
            console.log('最终刷新完成');
        } catch (e) {
            console.warn('最终刷新资源数据库失败:', e);
        }
    }

    // 输出统计信息
    console.log(`移动操作完成：成功 ${movedCount} 个，失败 ${errorCount} 个`);
    if (caseConflictMap.size > 0) {
        console.log('大小写冲突处理结果:');
        caseConflictMap.forEach((resolvedPath, originalPath) => {
            console.log(`  ${originalPath} -> ${resolvedPath}`);
        });
    }
    if (errors.length > 0) {
        console.error('错误汇总:', errors);
    }

    return {
        movedCount,
        errorCount,
        errors,
        totalProcessed: operations.length,
        caseConflicts: caseConflictMap.size
    };
}

async function handleCaseConflictsAndCreateDirs(operations: any[], strategy: string, errors: string[]): Promise<Map<string, string>> {
    const caseConflictMap = new Map<string, string>();
    const uniqueDirs = [...new Set(operations.map(op => op.targetDir))];
    
    // 1. 检测和解决每个路径的每一级目录大小写冲突
    const resolvedDirs = new Map<string, string>(); // 原路径 -> 解决后的路径
    
    for (const dir of uniqueDirs) {
        const resolvedPath = await resolvePathCaseConflicts(dir, strategy, errors);
        if (resolvedPath !== dir) {
            caseConflictMap.set(dir, resolvedPath);
            resolvedDirs.set(dir, resolvedPath);
        }
    }
    
    // 2. 更新 operations 中被修改的路径
    for (const op of operations) {
        if (caseConflictMap.has(op.targetDir)) {
            const newTargetDir = caseConflictMap.get(op.targetDir)!;
            // 确保新目录路径以 / 结尾
            const normalizedTargetDir = newTargetDir.endsWith('/') ? newTargetDir : newTargetDir + '/';
            const fileName = path.basename(op.src.split('/').pop() || '');
            
            console.log(`更新操作路径: ${op.targetDir} -> ${newTargetDir}`);
            
            op.targetDir = newTargetDir;
            op.dest = `db://assets/${normalizedTargetDir}${fileName}`;
        }
    }
    
    // 3. 创建所有需要的目录
    const finalUniqueDirs = [...new Set(operations.map(op => op.targetDir))];
    for (const dir of finalUniqueDirs) {
        const absDir = path.join(Editor.Project.path, 'assets', dir);
        if (!fs.existsSync(absDir)) {
            try {
                fs.mkdirSync(absDir, { recursive: true });
                console.log(`创建目录: ${dir}`);
            } catch (e) {
                console.error(`创建目录失败: ${dir}`, e);
                errors.push(`创建目录失败: ${dir} - ${e.message}`);
            }
        }
    }
    
    return caseConflictMap;
}

// 新增：逐级检查并解决路径的大小写冲突
async function resolvePathCaseConflicts(targetPath: string, strategy: string, errors: string[]): Promise<string> {
    const assetsPath = path.join(Editor.Project.path, 'assets');
    const pathParts = targetPath.split(/[/\\]/).filter(Boolean);
    const resolvedParts: string[] = [];
    
    let currentAbsPath = assetsPath;
    
    for (let i = 0; i < pathParts.length; i++) {
        const currentPart = pathParts[i];
        const nextAbsPath = path.join(currentAbsPath, currentPart);
        
        // 检查当前级别是否存在大小写冲突
        if (fs.existsSync(currentAbsPath)) {
            const siblings = fs.readdirSync(currentAbsPath);
            const conflictingSibling = siblings.find(sibling => 
                sibling.toLowerCase() === currentPart.toLowerCase() && 
                sibling !== currentPart &&
                fs.statSync(path.join(currentAbsPath, sibling)).isDirectory()
            );
            
            if (conflictingSibling) {
                const conflictingAbsPath = path.join(currentAbsPath, conflictingSibling);
                const currentRelPath = [...resolvedParts, conflictingSibling].join('/');
                const targetRelPath = [...resolvedParts, currentPart].join('/');
                
                console.warn(`检测到第 ${i + 1} 级目录大小写冲突: "${currentRelPath}" 与 "${targetRelPath}"`);
                
                if (strategy == 'keepOld') {
                    console.log(`使用已存在的目录名: "${conflictingSibling}"`);
                    resolvedParts.push(conflictingSibling);
                    currentAbsPath = conflictingAbsPath;
                } else {
                    // 策略：使用新名称，将旧目录重命名为新目录名
                    const oldDbPath = `db://assets/${[...resolvedParts, conflictingSibling].join('/')}`;
                    const newDbPath = `db://assets/${[...resolvedParts, currentPart].join('/')}`;
                    
                    try {
                        console.log(`重命名目录: "${currentRelPath}" -> "${targetRelPath}"`);
                        await Editor.Message.request('asset-db', 'move-asset', oldDbPath, newDbPath);
                        console.log(`成功使用新的目录名: "${currentPart}"`);
                        resolvedParts.push(currentPart);
                        currentAbsPath = nextAbsPath;
                    } catch (e) {
                        console.error(`重命名第 ${i + 1} 级目录失败: ${currentRelPath} -> ${targetRelPath}`, e);
                        errors.push(`重命名目录失败: ${currentRelPath} -> ${targetRelPath} - ${e.message}`);
                        // 失败时回退到保持旧名称
                        console.log(`重命名失败，回退使用旧目录名: "${conflictingSibling}"`);
                        resolvedParts.push(conflictingSibling);
                        currentAbsPath = conflictingAbsPath;
                    }
                }
            } else {
                // 没有冲突，直接使用
                resolvedParts.push(currentPart);
                currentAbsPath = nextAbsPath;
            }
        } else {
            // 父目录不存在，直接使用
            resolvedParts.push(currentPart);
            currentAbsPath = nextAbsPath;
        }
    }
    
    let resolvedPath = resolvedParts.join('/');
    
    // 保持原路径的末尾斜杠
    if (targetPath.endsWith('/') && !resolvedPath.endsWith('/')) {
        resolvedPath += '/';
    }
    
    if (resolvedPath !== targetPath) {
        console.log(`路径解决结果: "${targetPath}" -> "${resolvedPath}"`);
    }
    
    return resolvedPath;
}

// 删除空文件夹的函数
async function deleteEmptyFolders(args: any) {
    console.log('deleteEmptyFolders called');
    
    const assetsPath = path.join(Editor.Project.path, 'assets');
    const deletedFolders: string[] = [];
    let deletedCount = 0;
    
    // 递归检查空文件夹的函数
    async function findEmptyFoldersRecursive(dirPath: string): Promise<string[]> {
        const emptyFolders: string[] = [];
        
        try {
            if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
                return emptyFolders;
            }
            
            const items = fs.readdirSync(dirPath);
            let hasNonEmptyItems = false;
            
            // 先递归处理子目录
            for (const item of items) {
                const itemPath = path.join(dirPath, item);
                const stats = fs.statSync(itemPath);
                
                if (stats.isDirectory()) {
                    const subEmptyFolders = await findEmptyFoldersRecursive(itemPath);
                    emptyFolders.push(...subEmptyFolders);
                    
                    // 重新检查子目录是否还存在（可能被删除了）
                    if (fs.existsSync(itemPath)) {
                        hasNonEmptyItems = true;
                    }
                } else {
                    // 如果是文件，检查是否为孤立的 .meta 文件
                    if (item.endsWith('.meta')) {
                        const originalFile = item.slice(0, -5);
                        const originalPath = path.join(dirPath, originalFile);
                        if (fs.existsSync(originalPath)) {
                            hasNonEmptyItems = true;
                        }
                    } else {
                        hasNonEmptyItems = true;
                    }
                }
            }
            
            // 如果当前目录为空，添加到删除列表
            if (!hasNonEmptyItems) {
                emptyFolders.push(dirPath);
            }
            
        } catch (error) {
            console.error(`检查目录时出错: ${dirPath}`, error);
        }
        
        return emptyFolders;
    }
    
    try {
        console.log(`开始检查空文件夹: ${assetsPath}`);
        
        // 多轮删除，直到没有更多空文件夹
        let maxIterations = 5;
        let totalDeleted = 0;
        
        while (maxIterations > 0) {
            const emptyFolders = await findEmptyFoldersRecursive(assetsPath);
            
            if (emptyFolders.length === 0) {
                console.log('没有发现更多空文件夹');
                break;
            }
            
            console.log(`第 ${6 - maxIterations} 轮：发现 ${emptyFolders.length} 个空文件夹`);
            
            // 按路径长度倒序排序，先删除深层目录
            emptyFolders.sort((a, b) => b.length - a.length);
            
            let roundDeleted = 0;
            for (const folderPath of emptyFolders) {
                try {
                    // 转换为相对于assets的db://路径
                    const relativePath = path.relative(assetsPath, folderPath).replace(/\\/g, '/');
                    const dbPath = `db://assets/${relativePath}`;
                    
                    console.log(`删除空文件夹: ${relativePath}`);
                    
                    // 使用Cocos Creator的资源管理API删除
                    await Editor.Message.request('asset-db', 'delete-asset', dbPath);
                    
                    deletedFolders.push(relativePath);
                    roundDeleted++;
                    totalDeleted++;
                    
                } catch (error) {
                    console.error(`删除文件夹失败: ${folderPath}`, error);
                }
            }
            
            console.log(`第 ${6 - maxIterations} 轮完成，删除了 ${roundDeleted} 个文件夹`);
            
            if (roundDeleted === 0) {
                console.log('本轮没有删除任何文件夹，停止');
                break;
            }
            
            maxIterations--;
        }
        
        deletedCount = totalDeleted;
        console.log(`删除空文件夹完成，共删除 ${deletedCount} 个文件夹`);
        
        return {
            success: true,
            deletedCount,
            deletedFolders,
            message: `成功删除 ${deletedCount} 个空文件夹`
        };
        
    } catch (error) {
        console.error('删除空文件夹时出错:', error);
        return {
            success: false,
            deletedCount: 0,
            message: `删除失败: ${error.message}`
        };
    }
}




/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
export function load() {
    console.log(`[cocos-panel-html.${packageJSON.name}]: load`);
    // 在这里可以进行一些初始化操作，比如注册面板、事件监听等
 }

/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
export function unload() { }
