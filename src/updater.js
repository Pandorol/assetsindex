const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');

// const remoteDir = path.join(__dirname, '..', 'remote'); ;
// const baseRemoteDir = path.join(__dirname, 'baseremote');
// const updatesDir = path.join(__dirname, 'updates');

function fileChanged(file1, file2) {
  if (!fs.existsSync(file2)) return true;
  const buf1 = fs.readFileSync(file1);
  const buf2 = fs.readFileSync(file2);
  return !buf1.equals(buf2);
}

function collectChangedFiles(srcDir, compareDir, basePath = '') {
  let changedFiles = [];

  const entries = fs.readdirSync(srcDir);
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry);
    const relPath = path.join(basePath, entry);
    const comparePath = path.join(compareDir, relPath);

    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      changedFiles.push(...collectChangedFiles(srcPath, compareDir, relPath));
    } else {
      if (fileChanged(srcPath, comparePath)) {
        changedFiles.push(relPath);
      }
    }
  }

  return changedFiles;
}

function getNextVersion(updatesDir) {
  if (!fs.existsSync(updatesDir)) {
    fs.mkdirSync(updatesDir);
    return '1';
  }

  const versions = fs.readdirSync(updatesDir)
    .filter(name => /^\d+$/.test(name))
    .map(Number)
    .sort((a, b) => a - b);

  return versions.length === 0 ? '1' : String(versions[versions.length - 1] + 1);
}

function getAllVersionDirs(updatesDir) {
  if (!fs.existsSync(updatesDir)) return [];
  return fs.readdirSync(updatesDir)
    .filter(name => /^\d+$/.test(name))
    .map(name => path.join(updatesDir, name));
}

function isFileChangedInAllVersions(relPath, srcPath, versionDirs) {
  for (const verDir of versionDirs) {
    const comparePath = path.join(verDir, relPath);
    if (fs.existsSync(comparePath) && !fileChanged(srcPath, comparePath)) {
      return false; // 在某个版本中已存在且内容相同
    }
  }
  return true;
}

function main(remoteDir, baseRemoteDir, updatesDir) {
  if (!fs.existsSync(remoteDir)) {
    console.error('Error: remote 文件夹不存在');
    return;
  }

  // 情况1：首次运行，创建 baseremote
  if (!fs.existsSync(baseRemoteDir)) {
    console.log('首次运行：复制 remote 到 baseremote');
    fse.copySync(remoteDir, baseRemoteDir);
    return;
  }

  // 情况2：已有 baseremote，进入对比模式
  const changedFiles = collectChangedFiles(remoteDir, baseRemoteDir);
  const versionDirs = getAllVersionDirs(updatesDir);

  // 过滤掉在历史版本中已存在且内容相同的文件
  const trulyChangedFiles = changedFiles.filter(relPath => {
    const srcPath = path.join(remoteDir, relPath);
    return isFileChangedInAllVersions(relPath, srcPath, versionDirs);
  });

  if (trulyChangedFiles.length === 0) {
    console.log('无更新文件，跳过版本生成。');
    return;
  }

  const version = getNextVersion(updatesDir);
  const newVersionDir = path.join(updatesDir, version);

  console.log(`发现 ${trulyChangedFiles.length} 个真正更新文件，写入版本文件夹：${version}`);

  for (const relPath of trulyChangedFiles) {
    const srcPath = path.join(remoteDir, relPath);
    const destPath = path.join(newVersionDir, relPath);

    fse.ensureDirSync(path.dirname(destPath));
    fse.copySync(srcPath, destPath);
  }

  console.log('版本更新完成。');
}

// main();
