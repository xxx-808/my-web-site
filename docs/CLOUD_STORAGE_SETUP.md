# 🌥️ 云存储配置指南

## 📋 概述

为了让部署到Vercel的网站能够让全世界的用户访问视频，我们使用Vercel Blob云存储来存储视频文件和缩略图。

## 🚀 配置步骤

### 1. Vercel Blob存储配置

#### 在Vercel Dashboard中启用Blob存储：
1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择您的项目：`my-web-site`
3. 进入 "Storage" 标签页
4. 点击 "Create Database"
5. 选择 "Blob" 存储
6. 创建Blob存储实例

#### 获取环境变量：
创建Blob存储后，Vercel会自动添加以下环境变量：
- `BLOB_READ_WRITE_TOKEN`：读写权限令牌

### 2. 本地开发配置

在 `.env.local` 文件中添加：
```env
# Vercel Blob存储（从Vercel Dashboard获取）
BLOB_READ_WRITE_TOKEN="your_blob_token_here"
```

### 3. 部署配置

环境变量会自动在Vercel部署时生效，无需手动配置。

## 🎯 功能特性

### 视频存储
- **存储位置**：Vercel Blob云存储
- **访问方式**：全球CDN加速
- **文件路径**：`videos/timestamp_filename.mp4`
- **访问权限**：公开访问

### 缩略图存储
- **存储位置**：Vercel Blob云存储
- **图片处理**：自动调整为800x450 (16:9比例)
- **格式转换**：自动转换为WebP格式
- **文件路径**：`thumbnails/timestamp_thumbnail.webp`

## 📊 存储限制

### Vercel Blob免费额度：
- **存储空间**：1GB
- **带宽**：100GB/月
- **请求数**：1M请求/月

### 文件限制：
- **视频文件**：最大500MB
- **缩略图**：最大10MB

## 🌍 全球访问

配置云存储后：
- ✅ **本地开发**：localhost可以访问
- ✅ **Vercel部署**：全世界用户都可以访问
- ✅ **CDN加速**：全球快速加载
- ✅ **持久存储**：文件永久保存

## 🔧 API更改

### 视频上传API (`/api/upload/video`)
```javascript
// 之前：本地存储
const fileUrl = `/uploads/videos/${fileName}`;

// 现在：云存储
const blob = await put(fileName, file, {
  access: 'public',
  contentType: file.type,
});
const fileUrl = blob.url; // https://xxx.public.blob.vercel-storage.com/...
```

### 缩略图上传API (`/api/upload/thumbnail`)
```javascript
// 之前：本地存储
const fileUrl = `/uploads/thumbnails/${fileName}`;

// 现在：云存储
const blob = await put(fileName, processedImageBuffer, {
  access: 'public',
  contentType: 'image/webp',
});
const fileUrl = blob.url; // https://xxx.public.blob.vercel-storage.com/...
```

## 🎥 上传流程

1. **管理员上传视频** → Vercel Blob云存储
2. **生成公开URL** → 全球可访问
3. **保存到数据库** → 存储云存储URL
4. **用户访问** → 从全球CDN加载

## 🔐 安全性

- **访问控制**：通过应用层权限控制
- **文件验证**：类型和大小验证
- **公开访问**：文件URL公开，但需要通过应用权限才能获取URL

## 💰 成本优化

### 免费额度管理：
- 定期清理无用文件
- 压缩视频文件大小
- 监控存储使用量

### 升级选项：
- **Pro计划**：$20/月，100GB存储，1TB带宽
- **Enterprise**：按需定价

## 🚨 故障排除

### 常见问题：

**Q: 上传失败 "BLOB_READ_WRITE_TOKEN not found"**
A: 检查环境变量配置，确保在Vercel中启用了Blob存储

**Q: 视频无法播放**
A: 检查云存储URL是否有效，确认文件已成功上传

**Q: 本地开发无法上传**
A: 确保 `.env.local` 中配置了正确的 `BLOB_READ_WRITE_TOKEN`

## 📈 监控和管理

### Vercel Dashboard监控：
- 存储使用量
- 带宽消耗
- 请求统计

### 文件管理：
- 通过Vercel Dashboard查看文件
- 可以手动删除不需要的文件
- 支持批量操作

---

## ✅ 配置完成检查清单

- [ ] 在Vercel Dashboard中创建Blob存储
- [ ] 获取 `BLOB_READ_WRITE_TOKEN`
- [ ] 更新本地 `.env.local` 文件
- [ ] 测试视频上传功能
- [ ] 验证全球访问能力
- [ ] 监控存储使用量
