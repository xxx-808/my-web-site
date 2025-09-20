# 📜 管理脚本说明

## 🎥 视频上传脚本

### 安装依赖
```bash
npm install node-fetch@2 form-data
```

### 使用方法
```bash
# 基本上传
node scripts/upload-video.js ./my-video.mp4

# 完整参数上传
node scripts/upload-video.js ./video.mp4 "视频标题" listening "详细描述"
```

### 参数说明
- `video-file-path`: 视频文件路径 (必需)
- `title`: 视频标题 (可选，默认使用文件名)
- `category`: 分类 (可选，默认为listening)
  - `listening`/`听力`: 雅思听力
  - `speaking`/`口语`: 雅思口语  
  - `reading`/`阅读`: 雅思阅读
  - `writing`/`写作`: 雅思写作
- `description`: 视频描述 (可选)

### 示例
```bash
# 上传听力视频
node scripts/upload-video.js ./listening-lesson1.mp4 "听力第1课" listening "雅思听力基础训练"

# 上传口语视频  
node scripts/upload-video.js ./speaking-part1.mp4 "口语Part1" speaking "雅思口语Part1话题练习"

# 上传阅读视频
node scripts/upload-video.js ./reading-skills.mp4 "阅读技巧" reading "快速定位关键信息"

# 上传写作视频
node scripts/upload-video.js ./writing-task1.mp4 "写作Task1" writing "图表描述方法"
```

## 🔧 其他脚本

### 构建检查脚本
```bash
node scripts/build-check.js
```
检查构建环境和环境变量配置

### 部署检查脚本  
```bash
node scripts/check-deployment.js https://your-domain.vercel.app
```
检查Vercel部署状态

## 📝 注意事项

1. **权限要求**: 上传脚本需要管理员权限
2. **文件格式**: 支持MP4、WebM、QuickTime、AVI
3. **文件大小**: 最大500MB
4. **网络要求**: 需要稳定的网络连接
5. **服务器状态**: 确保开发服务器正在运行

## 🚨 故障排除

### 常见错误
- `ENOENT: no such file or directory`: 视频文件路径不正确
- `Authentication required`: 管理员登录失败
- `File too large`: 文件超过500MB限制
- `Invalid file type`: 不支持的文件格式

### 解决方案
1. 检查文件路径是否正确
2. 确认管理员账户信息
3. 压缩视频文件大小
4. 转换为支持的格式
