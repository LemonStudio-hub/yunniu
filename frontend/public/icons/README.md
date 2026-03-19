# 图标说明

此目录包含 PWA 应用图标。

## 图标尺寸

PWA 需要以下尺寸的图标：
- 72x72 (Android mdpi)
- 96x96 (Android xhdpi)
- 128x128 (Android xxhdpi)
- 144x144 (Android xxxhdpi)
- 152x152 (Apple)
- 192x192 (Android xxxhdpi, Favicon)
- 384x384 (Android xxxhdpi)
- 512x512 (Apple)

## 生成图标

### 方法 1: 使用在线工具

推荐使用以下在线工具生成图标：
- https://www.favicon-generator.org/
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

上传 `icon-placeholder.svg` 或您的 logo，然后下载所有尺寸的图标。

### 方法 2: 使用命令行工具

如果已安装 ImageMagick：

```bash
# 创建不同尺寸的图标
for size in 72 96 128 144 152 192 384 512; do
  convert icon-placeholder.svg -resize ${size}x${size} icon-${size}x${size}.png
done
```

### 方法 3: 使用 Node.js 脚本

安装 sharp 包：
```bash
npm install sharp
```

运行以下脚本：
```javascript
const sharp = require('sharp');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  for (const size of sizes) {
    await sharp('icon-placeholder.svg')
      .resize(size, size)
      .png()
      .toFile(`icon-${size}x${size}.png`);
    console.log(`Generated icon-${size}x${size}.png`);
  }
}

generateIcons();
```

## 替换图标

1. 将您的 logo 保存为 SVG 格式
2. 使用上述方法之一生成所有尺寸的图标
3. 替换此目录中的图标文件
4. 确保 manifest.json 中的图标路径正确

## 测试图标

在浏览器开发者工具中：
1. 打开 Application 面板
2. 查看 Manifest 部分
3. 确认所有图标显示正常