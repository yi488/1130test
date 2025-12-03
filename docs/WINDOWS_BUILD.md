# Windows 构建指南

## 自动构建 (GitHub Actions)

### 触发构建
1. **推送到 main 分支**: 自动构建 Linux 和 Windows 版本
2. **创建 Release**: 构建并发布所有平台的安装包
3. **Pull Request**: 测试构建流程

### 构建产物
- **Windows**: NSIS 安装程序 (.exe)
- **Linux**: AppImage 和 deb 包
- **下载位置**: GitHub Actions 页面的 Artifacts 部分

## 本地 Windows 构建

### 环境要求

1. **Node.js** (版本 20+)
   ```bash
   # 从官网下载或使用 winget
   winget install OpenJS.NodeJS
   ```

2. **Rust** (最新稳定版)
   ```bash
   # 下载并安装 rustup
   # https://rustup.rs/
   ```

3. **pnpm**
   ```bash
   npm install -g pnpm
   ```

4. **Visual Studio Build Tools**
   - 安装 Visual Studio 2022 或 Visual Studio Build Tools
   - 确保安装 "C++ build tools" 和 "Windows SDK"

### 构建步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **安装依赖**
   ```bash
   pnpm install
   ```

3. **构建应用**
   ```bash
   # 开发模式构建
   pnpm tauri dev
   
   # 生产模式构建
   pnpm tauri build
   ```

4. **查找安装包**
   构建完成后，Windows 安装包位于：
   ```
   src-tauri\target\release\bundle\nsis\
   ```
   主要文件：
   - `test_0.1.0_x64-setup.exe` - 主安装程序
   - `test_0.1.0_x64-setup.exe.sig` - 签名文件（如果配置了签名）

## 构建选项

### 仅构建 Windows
```bash
pnpm tauri build -- --target x86_64-pc-windows-msvc
```

### 调试构建
```bash
pnpm tauri build --debug
```

### 自定义构建配置
编辑 `src-tauri/tauri.conf.json` 中的配置：

```json
{
  "bundle": {
    "targets": ["nsis", "msi"],
    "windows": {
      "nsis": {
        "displayLanguageSelector": true,
        "languages": ["SimpChinese", "English"]
      }
    }
  }
}
```

## 代码签名 (可选)

### 准备工作
1. 获取代码签名证书
2. 安装证书到 Windows 证书存储

### 配置签名
在 `tauri.conf.json` 中配置：
```json
{
  "bundle": {
    "windows": {
      "certificateThumbprint": "YOUR_CERTIFICATE_THUMBPRINT",
      "digestAlgorithm": "sha256",
      "timestampUrl": "http://timestamp.digicert.com"
    }
  }
}
```

## 故障排除

### 常见问题

1. **链接错误**: 确保 Visual Studio Build Tools 正确安装
2. **权限错误**: 以管理员身份运行命令提示符
3. **依赖缺失**: 运行 `pnpm install` 重新安装依赖

### 清理构建
```bash
# 清理 Rust 构建缓存
pnpm tauri clean

# 清理 Node.js 依赖
rm -rf node_modules
pnpm install
```

### 调试模式
```bash
# 启用详细日志
set RUST_LOG=debug
pnpm tauri build
```

## 发布流程

1. **更新版本号**
   - `package.json` 中的 `version`
   - `src-tauri/Cargo.toml` 中的 `version`
   - `src-tauri/tauri.conf.json` 中的 `version`

2. **创建 Git 标签**
   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```

3. **创建 GitHub Release**
   - 在 GitHub 上创建新的 Release
   - 自动触发构建流程

4. **下载安装包**
   - 从 GitHub Actions 下载构建产物
   - 或从 Release 页面下载附件

## 支持的安装包格式

### Windows
- **NSIS**: 推荐用于简单安装
- **MSI**: 适合企业环境部署
- **Portable**: 便携版本（可选配置）

### 配置示例
```json
{
  "bundle": {
    "targets": ["nsis", "msi", "deb", "appimage"],
    "windows": {
      "nsis": {
        "installerIcon": "icons/icon.ico",
        "uninstallerIcon": "icons/icon.ico",
        "allowDowngrades": true
      },
      "wix": {
        "language": ["zh-CN", "en-US"]
      }
    }
  }
}
```
