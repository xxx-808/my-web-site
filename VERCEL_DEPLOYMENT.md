# 🚀 Vercel部署指南 - Tiffany's College

## 📋 部署前准备

### 1. 确保代码完整性
- ✅ 所有页面组件已创建
- ✅ 数据库配置已完成
- ✅ 环境变量已配置
- ✅ 项目可以本地构建

### 2. 检查必要文件
```
my-web-site/
├── app/                    # Next.js App Router
├── lib/                    # 工具函数
├── prisma/                 # 数据库配置
├── public/                 # 静态资源
├── next.config.ts          # Next.js配置
├── vercel.json             # Vercel配置
├── package.json            # 依赖配置
└── .env.local              # 环境变量
```

## 🌐 Vercel部署步骤

### 方法1: 通过Vercel Dashboard (推荐)

#### 步骤1: 准备Git仓库
```bash
# 初始化Git仓库
git init
git add .
git commit -m "Initial commit for Vercel deployment"

# 推送到GitHub/GitLab
git remote add origin https://github.com/yourusername/my-web-site.git
git push -u origin main
```

#### 步骤2: 连接Vercel
1. 访问 [vercel.com](https://vercel.com)
2. 使用GitHub/GitLab账号登录
3. 点击 "New Project"
4. 选择你的Git仓库
5. 配置项目设置

#### 步骤3: 环境变量配置
在Vercel Dashboard中添加以下环境变量：
```env
# 数据库配置
DATABASE_URL=your_production_database_url

# NextAuth.js配置
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_production_secret

# JWT配置
JWT_SECRET=your_production_jwt_secret

# 其他配置
NODE_ENV=production
```

#### 步骤4: 部署设置
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Root Directory**: `./` (默认)

### 方法2: 通过Vercel CLI

#### 步骤1: 安装Vercel CLI
```bash
npm i -g vercel
```

#### 步骤2: 登录Vercel
```bash
vercel login
```

#### 步骤3: 部署项目
```bash
# 在项目根目录执行
vercel

# 或者指定生产环境
vercel --prod
```

#### 步骤4: 配置环境变量
```bash
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add JWT_SECRET
```

## 🔧 部署配置详解

### vercel.json 配置说明
```json
{
  "buildCommand": "npm run build",        // 构建命令
  "outputDirectory": ".next",             // 输出目录
  "framework": "nextjs",                  // 框架类型
  "installCommand": "npm install",        // 安装命令
  "devCommand": "npm run dev",            // 开发命令
  "regions": ["hkg1"],                    // 部署区域(香港)
  "env": {
    "NODE_ENV": "production"              // 环境变量
  }
}
```

### 区域选择建议
- **hkg1**: 香港 (推荐，访问中国用户最快)
- **syd1**: 悉尼
- **nrt1**: 东京
- **iad1**: 华盛顿

## 🚨 常见问题解决

### 1. 构建失败
```bash
# 本地测试构建
npm run build

# 检查错误日志
# 常见问题：依赖缺失、TypeScript错误、环境变量未配置
```

### 2. 数据库连接问题
- 确保生产环境数据库可访问
- 检查防火墙设置
- 验证连接字符串格式

### 3. 环境变量问题
- 在Vercel Dashboard中正确配置
- 区分开发和生产环境
- 敏感信息不要提交到代码

### 4. 图片加载问题
- 确保图片域名在next.config.ts中配置
- 使用相对路径或CDN链接
- 检查图片文件是否存在

## 📱 部署后配置

### 1. 自定义域名
1. 在Vercel Dashboard中添加域名
2. 配置DNS记录
3. 等待DNS传播

### 2. 性能监控
- 启用Vercel Analytics
- 配置性能监控
- 设置错误追踪

### 3. 自动部署
- 配置GitHub Actions
- 设置分支保护
- 启用预览部署

## 🔒 安全配置

### 1. 环境变量安全
- 不要在代码中硬编码敏感信息
- 使用Vercel的环境变量管理
- 定期轮换密钥

### 2. 数据库安全
- 使用强密码
- 限制IP访问
- 启用SSL连接

### 3. 应用安全
- 启用HTTPS
- 配置安全头部
- 实施速率限制

## 📊 部署检查清单

### 部署前
- [ ] 代码已提交到Git
- [ ] 本地构建成功
- [ ] 环境变量已配置
- [ ] 数据库连接正常

### 部署后
- [ ] 网站可以正常访问
- [ ] 所有页面加载正常
- [ ] 图片和资源加载正常
- [ ] 数据库连接正常
- [ ] 功能测试通过

## 🆘 技术支持

### Vercel支持
- [Vercel文档](https://vercel.com/docs)
- [Vercel社区](https://github.com/vercel/vercel/discussions)
- [Vercel状态页](https://vercel-status.com)

### 项目支持
- 技术团队: tech@tiffanyscollege.com
- 产品团队: product@tiffanyscollege.com

---

*Tiffany's College - 融合认知语言科学与AI技术的创新教育科技*
