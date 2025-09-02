@echo off
echo 正在构建 Cocos Creator 扩展...

REM 编译 TypeScript 代码
echo 1. 编译 TypeScript 代码...
call npm run build
if errorlevel 1 (
    echo 编译失败！
    pause
    exit /b 1
)

REM 创建分发目录
echo 2. 创建分发包...
if exist "release" rmdir /s /q "release"
mkdir "release"
mkdir "release\assetsindex"

REM 复制必要文件
echo 3. 复制文件...
copy "package.json" "release\assetsindex\"
xcopy "dist" "release\assetsindex\dist\" /E /I /Q
xcopy "static" "release\assetsindex\static\" /E /I /Q
xcopy "i18n" "release\assetsindex\i18n\" /E /I /Q
xcopy "@types" "release\assetsindex\@types\" /E /I /Q
copy "README.md" "release\assetsindex\" 2>nul
copy "README-zh-CN.md" "release\assetsindex\" 2>nul
copy "DISTRIBUTION.md" "release\assetsindex\" 2>nul
copy "LICENSE" "release\assetsindex\" 2>nul
copy "使用手册.md" "release\assetsindex\" 2>nul
copy "快速入门.md" "release\assetsindex\" 2>nul
copy "功能特性.md" "release\assetsindex\" 2>nul
copy "文件冲突处理说明.md" "release\assetsindex\" 2>nul

REM 创建 ZIP 包
echo 4. 创建 ZIP 包...
cd release
powershell -command "Compress-Archive -Path 'assetsindex' -DestinationPath 'assetsindex-extension.zip' -Force"
cd ..

echo.
echo ✅ 分发包创建完成！
echo 📁 位置：release\assetsindex-extension.zip
echo.
echo 📋 用户安装步骤：
echo 1. 解压 assetsindex-extension.zip
echo 2. 将 assetsindex 文件夹放到 Cocos Creator 项目的 extensions 目录下
echo 3. 重启 Cocos Creator 或刷新扩展管理器
echo 4. 在菜单栏 扩展 -^> assetsindex 中找到功能
echo.
echo 📦 包含内容：
echo - 编译后的 JavaScript 代码
echo - 静态资源文件
echo - 类型定义文件
echo - 安装说明
echo.
pause
