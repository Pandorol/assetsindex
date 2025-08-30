// @ts-ignore
const fs = require('fs');
const path = require('path');

/**
 * 动态图片加载分析器
 * 从项目脚本文件中查找所有动态加载的图片路径
 */
export class DynamicPictureAnalyzer {
    // 默认脚本目录路径
    private static readonly DEFAULT_SCRIPTS_PATH = 'E:\\gitfolders\\killercity-client\\killercity-client\\assets\\scripts';
    
    // 图片加载相关的函数模式
    private static readonly IMAGE_LOADING_PATTERNS = [
        // SpriteUtil.ChangeSpriteframe 系列
        /SpriteUtil\.ChangeSpriteframe\s*\(\s*([^,]+)\s*,/g,
        /SpriteUtil\.changeSpriteframe\s*\(\s*([^,]+)\s*,/g,
        /SpriteUtil\.setSpriteFrame\s*\(\s*([^,]+)\s*,/g,
        
        // cc.loader 系列
        /cc\.loader\.loadRes\s*\(\s*([^,]+)\s*,/g,
        /cc\.loader\.load\s*\(\s*([^,]+)\s*,/g,
        
        // cc.resources 系列  
        /cc\.resources\.load\s*\(\s*([^,]+)\s*,/g,
        /cc\.resources\.loadDir\s*\(\s*([^,]+)\s*,/g,
        
        // 图片框架设置
        /\.spriteFrame\s*=\s*([^;]+)/g,
        /\.getComponent\s*\(\s*cc\.Sprite\s*\)\s*\.spriteFrame\s*=\s*([^;]+)/g,
        
        // 其他可能的图片加载模式
        /LoadUtil\.loadSprite\s*\(\s*([^,]+)\s*,/g,
        /ImageLoader\.load\s*\(\s*([^,]+)\s*,/g,
        /TextureLoader\.load\s*\(\s*([^,]+)\s*,/g,
    ];

    // 路径构建函数模式
    private static readonly PATH_BUILDER_PATTERNS = [
        // GameResPath.getTargetDir 等路径构建函数
        /(\w+)\.getTargetDir\s*\(\s*([^)]+)\s*\)/g,
        /(\w+)\.getImagePath\s*\(\s*([^)]+)\s*\)/g,
        /(\w+)\.getTexturePath\s*\(\s*([^)]+)\s*\)/g,
        /(\w+)\.buildPath\s*\(\s*([^)]+)\s*\)/g,
    ];

    // 字符串连接模式（用于路径拼接）
    private static readonly STRING_CONCAT_PATTERNS = [
        // 'texture/' + dir + "/" + filename 类型
        /['"`]([^'"`]*?)['"`]\s*\+\s*(\w+)\s*\+\s*['"`]([^'"`]*?)['"`]\s*\+\s*(\w+)/g,
        // 'texture/' + dir + '/filename' 类型
        /['"`]([^'"`]*?)['"`]\s*\+\s*(\w+)\s*\+\s*['"`]([^'"`]*?)['"`]/g,
        // dir + '/filename' 类型
        /(\w+)\s*\+\s*['"`]([^'"`]*?)['"`]/g,
    ];

    private scriptsPath: string;
    private foundImages: Set<string> = new Set();
    private pathBuilderFunctions: Map<string, any> = new Map();
    private variableValues: Map<string, string> = new Map();

    constructor(scriptsPath?: string) {
        this.scriptsPath = scriptsPath || DynamicPictureAnalyzer.DEFAULT_SCRIPTS_PATH;
    }

    /**
     * 开始分析动态图片加载
     */
    async analyze(): Promise<string[]> {
        console.log(`开始分析动态图片加载，脚本路径: ${this.scriptsPath}`);
        
        // 第一阶段：收集所有路径构建函数的定义
        await this.collectPathBuilderFunctions();
        
        // 第二阶段：分析所有脚本文件中的图片加载调用
        await this.analyzeImageLoadingCalls();
        
        // 第三阶段：解析和展开动态路径
        await this.expandDynamicPaths();
        
        const result = Array.from(this.foundImages).sort();
        console.log(`分析完成，共找到 ${result.length} 个动态加载的图片路径`);
        
        return result;
    }

    /**
     * 第一阶段：收集路径构建函数定义
     */
    private async collectPathBuilderFunctions(): Promise<void> {
        console.log('第一阶段：收集路径构建函数定义...');
        
        const files = await this.getAllTSFiles();
        
        for (const file of files) {
            try {
                const content = fs.readFileSync(file, 'utf-8');
                this.extractPathBuilderFunctions(content, file);
            } catch (error) {
                console.warn(`读取文件失败 ${file}:`, error);
            }
        }
        
        console.log(`找到 ${this.pathBuilderFunctions.size} 个路径构建函数`);
    }

    /**
     * 第二阶段：分析图片加载调用
     */
    private async analyzeImageLoadingCalls(): Promise<void> {
        console.log('第二阶段：分析图片加载调用...');
        
        const files = await this.getAllTSFiles();
        
        for (const file of files) {
            try {
                const content = fs.readFileSync(file, 'utf-8');
                this.extractImageLoadingCalls(content, file);
                this.extractVariableAssignments(content, file);
            } catch (error) {
                console.warn(`读取文件失败 ${file}:`, error);
            }
        }
    }

    /**
     * 第三阶段：展开动态路径
     */
    private async expandDynamicPaths(): Promise<void> {
        console.log('第三阶段：展开动态路径...');
        
        // 这里可以添加基于变量值和函数调用的路径展开逻辑
        // 暂时保留原始找到的路径
    }

    /**
     * 获取所有TypeScript文件
     */
    private async getAllTSFiles(): Promise<string[]> {
        const files: string[] = [];
        
        const walkDir = (dir: string) => {
            try {
                const items = fs.readdirSync(dir);
                
                for (const item of items) {
                    const fullPath = path.join(dir, item);
                    const stat = fs.statSync(fullPath);
                    
                    if (stat.isDirectory()) {
                        walkDir(fullPath);
                    } else if (item.endsWith('.ts') || item.endsWith('.js')) {
                        files.push(fullPath);
                    }
                }
            } catch (error) {
                console.warn(`无法读取目录 ${dir}:`, error);
            }
        };
        
        walkDir(this.scriptsPath);
        console.log(`找到 ${files.length} 个脚本文件`);
        
        return files;
    }

    /**
     * 提取路径构建函数定义
     */
    private extractPathBuilderFunctions(content: string, filePath: string): void {
        // 查找静态方法定义，如 getTargetDir
        const staticMethodPattern = /static\s+(\w+)\s*\([^)]*\)\s*\{([^}]*)\}/g;
        let match;
        
        while ((match = staticMethodPattern.exec(content)) !== null) {
            const methodName = match[1];
            const methodBody = match[2];
            
            // 检查是否是路径相关的方法
            if (this.isPathRelatedMethod(methodName, methodBody)) {
                const className = this.extractClassName(content, match.index);
                const fullName = `${className}.${methodName}`;
                
                this.pathBuilderFunctions.set(fullName, {
                    body: methodBody,
                    file: filePath,
                    name: methodName,
                    className: className
                });
                
                console.log(`找到路径构建函数: ${fullName}`);
            }
        }
    }

    /**
     * 检查是否是路径相关的方法
     */
    private isPathRelatedMethod(methodName: string, methodBody: string): boolean {
        const pathKeywords = ['path', 'dir', 'target', 'texture', 'image', 'sprite', 'resource'];
        const nameContainsKeyword = pathKeywords.some(keyword => 
            methodName.toLowerCase().includes(keyword)
        );
        
        const bodyContainsPath = /['"`][^'"`]*\/[^'"`]*['"`]/.test(methodBody) || 
                                methodBody.includes('texture') ||
                                methodBody.includes('path') ||
                                methodBody.includes('+');
        
        return nameContainsKeyword || bodyContainsPath;
    }

    /**
     * 从内容中提取类名
     */
    private extractClassName(content: string, position: number): string {
        const beforePosition = content.substring(0, position);
        const classMatch = beforePosition.match(/class\s+(\w+)/g);
        
        if (classMatch && classMatch.length > 0) {
            const lastClassMatch = classMatch[classMatch.length - 1];
            return lastClassMatch.replace(/class\s+/, '');
        }
        
        return 'Unknown';
    }

    /**
     * 提取图片加载调用
     */
    private extractImageLoadingCalls(content: string, filePath: string): void {
        // 使用所有图片加载模式进行匹配
        for (const pattern of DynamicPictureAnalyzer.IMAGE_LOADING_PATTERNS) {
            let match;
            const regex = new RegExp(pattern.source, pattern.flags);
            
            while ((match = regex.exec(content)) !== null) {
                const pathExpression = match[1].trim();
                this.processPathExpression(pathExpression, filePath, content, match.index);
            }
        }
    }

    /**
     * 提取变量赋值
     */
    private extractVariableAssignments(content: string, filePath: string): void {
        // 查找字符串变量赋值
        const variablePattern = /(?:let|const|var)\s+(\w+)\s*=\s*['"`]([^'"`]+)['"`]/g;
        let match;
        
        while ((match = variablePattern.exec(content)) !== null) {
            const varName = match[1];
            const varValue = match[2];
            
            // 如果看起来像路径，记录下来
            if (this.looksLikePath(varValue)) {
                this.variableValues.set(varName, varValue);
            }
        }
    }

    /**
     * 检查字符串是否看起来像路径
     */
    private looksLikePath(str: string): boolean {
        return str.includes('/') || 
               str.includes('texture') || 
               str.includes('image') || 
               str.includes('sprite') ||
               str.includes('res');
    }

    /**
     * 处理路径表达式
     */
    private processPathExpression(expression: string, filePath: string, content: string, position: number): void {
        // 移除引号
        expression = expression.replace(/['"]/g, '');
        
        // 如果是简单的字符串路径
        if (!expression.includes('+') && !expression.includes('(')) {
            if (this.looksLikePath(expression)) {
                this.foundImages.add(expression);
                console.log(`找到静态路径: ${expression} (在 ${path.basename(filePath)})`);
            }
            return;
        }
        
        // 如果包含函数调用
        if (expression.includes('(')) {
            this.processFunctionCall(expression, filePath, content, position);
            return;
        }
        
        // 如果包含字符串拼接
        if (expression.includes('+')) {
            this.processStringConcatenation(expression, filePath, content, position);
            return;
        }
    }

    /**
     * 处理函数调用
     */
    private processFunctionCall(expression: string, filePath: string, content: string, position: number): void {
        // 匹配路径构建函数调用
        for (const pattern of DynamicPictureAnalyzer.PATH_BUILDER_PATTERNS) {
            const regex = new RegExp(pattern.source, pattern.flags);
            let match;
            
            while ((match = regex.exec(expression)) !== null) {
                const className = match[1];
                const params = match[2];
                const fullFunctionName = `${className}.getTargetDir`; // 假设主要是getTargetDir
                
                if (this.pathBuilderFunctions.has(fullFunctionName)) {
                    const functionInfo = this.pathBuilderFunctions.get(fullFunctionName);
                    this.simulateFunction(functionInfo, params, filePath);
                }
            }
        }
    }

    /**
     * 处理字符串拼接
     */
    private processStringConcatenation(expression: string, filePath: string, content: string, position: number): void {
        // 尝试解析字符串拼接表达式
        for (const pattern of DynamicPictureAnalyzer.STRING_CONCAT_PATTERNS) {
            const regex = new RegExp(pattern.source, pattern.flags);
            let match;
            
            while ((match = regex.exec(expression)) !== null) {
                // 根据匹配的模式构建可能的路径
                this.buildConcatenatedPath(match, filePath, content, position);
            }
        }
    }

    /**
     * 模拟函数执行
     */
    private simulateFunction(functionInfo: any, params: string, filePath: string): void {
        // 这里简化处理，基于函数体和参数尝试构建路径
        const body = functionInfo.body;
        
        // 查找返回语句中的路径模式
        const returnPattern = /return\s+([^;]+)/;
        const returnMatch = body.match(returnPattern);
        
        if (returnMatch) {
            const returnExpression = returnMatch[1].trim();
            
            // 如果返回语句包含'texture/'等模式，尝试展开
            if (returnExpression.includes("'texture/'") || returnExpression.includes('"texture/"')) {
                // 简单情况：return 'texture/' + dir + "/" + img_name;
                // 我们可以生成一些常见的可能路径
                this.generateCommonPaths(params, filePath);
            }
        }
    }

    /**
     * 生成常见路径
     */
    private generateCommonPaths(params: string, filePath: string): void {
        // 解析参数
        const paramList = params.split(',').map(p => p.trim().replace(/['"]/g, ''));
        
        if (paramList.length >= 2) {
            const dir = paramList[0];
            const imageName = paramList[1];
            
            // 生成可能的路径
            const possiblePaths = [
                `texture/${dir}/${imageName}`,
                `texture/${dir}/${imageName}.png`,
                `texture/${dir}/${imageName}.jpg`,
            ];
            
            for (const pathStr of possiblePaths) {
                this.foundImages.add(pathStr);
                console.log(`推测路径: ${pathStr} (从 ${path.basename(filePath)})`);
            }
        }
    }

    /**
     * 构建拼接路径
     */
    private buildConcatenatedPath(match: RegExpMatchArray, filePath: string, content: string, position: number): void {
        // 根据不同的拼接模式构建路径
        if (match.length >= 5) {
            // 'texture/' + dir + "/" + filename 模式
            const prefix = match[1];
            const var1 = match[2];
            const middle = match[3];
            const var2 = match[4];
            
            // 尝试从上下文中获取变量值
            const var1Value = this.getVariableValue(var1, content, position);
            const var2Value = this.getVariableValue(var2, content, position);
            
            if (var1Value && var2Value) {
                const fullPath = prefix + var1Value + middle + var2Value;
                this.foundImages.add(fullPath);
                console.log(`拼接路径: ${fullPath} (从 ${path.basename(filePath)})`);
            }
        } else if (match.length >= 4) {
            // 'texture/' + dir + '/filename' 模式
            const prefix = match[1];
            const variable = match[2];
            const suffix = match[3];
            
            const varValue = this.getVariableValue(variable, content, position);
            if (varValue) {
                const fullPath = prefix + varValue + suffix;
                this.foundImages.add(fullPath);
                console.log(`拼接路径: ${fullPath} (从 ${path.basename(filePath)})`);
            }
        }
    }

    /**
     * 获取变量值
     */
    private getVariableValue(varName: string, content: string, position: number): string | null {
        // 首先检查全局变量映射
        if (this.variableValues.has(varName)) {
            return this.variableValues.get(varName)!;
        }
        
        // 在当前位置之前查找变量赋值
        const beforePosition = content.substring(0, position);
        const assignmentPattern = new RegExp(`${varName}\\s*=\\s*['"\`]([^'"\`]+)['"\`]`, 'g');
        let match;
        let lastValue = null;
        
        while ((match = assignmentPattern.exec(beforePosition)) !== null) {
            lastValue = match[1];
        }
        
        return lastValue;
    }

    /**
     * 打印分析结果
     */
    printResults(): void {
        console.log('\n=== 动态图片加载分析结果 ===');
        console.log(`总共找到 ${this.foundImages.size} 个动态加载的图片路径:\n`);
        
        const sortedImages = Array.from(this.foundImages).sort();
        sortedImages.forEach((imagePath, index) => {
            console.log(`${index + 1}. ${imagePath}`);
        });
        
        console.log('\n=== 路径构建函数 ===');
        this.pathBuilderFunctions.forEach((info, name) => {
            console.log(`${name} (在 ${path.basename(info.file)})`);
        });
    }

    /**
     * 导出结果到文件
     */
    exportResults(outputPath?: string): void {
        const output = outputPath || path.join(this.scriptsPath, '../dynamic_images_analysis.json');
        
        const results = {
            analysisDate: new Date().toISOString(),
            scriptsPath: this.scriptsPath,
            totalImages: this.foundImages.size,
            images: Array.from(this.foundImages).sort(),
            pathBuilderFunctions: Object.fromEntries(this.pathBuilderFunctions),
            variables: Object.fromEntries(this.variableValues)
        };
        
        fs.writeFileSync(output, JSON.stringify(results, null, 2), 'utf-8');
        console.log(`\n分析结果已导出到: ${output}`);
    }
}

// 使用示例和测试函数
export async function analyzeDynamicPictures(scriptsPath?: string): Promise<string[]> {
    const analyzer = new DynamicPictureAnalyzer(scriptsPath);
    const results = await analyzer.analyze();
    analyzer.printResults();
    analyzer.exportResults();
    return results;
}

// 如果直接运行此文件
if (require.main === module) {
    analyzeDynamicPictures()
        .then(results => {
            console.log(`\n分析完成！共找到 ${results.length} 个动态加载的图片路径。`);
        })
        .catch(error => {
            console.error('分析过程中出现错误:', error);
        });
}
