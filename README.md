# 雅思录课视频管理系统

一个完整的雅思课程视频管理系统，支持用户管理、视频上传、权限控制和观看进度跟踪。

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 环境配置
创建 `.env.local` 文件并配置数据库连接：
```env
DATABASE_URL="postgresql://username:password@localhost:5432/your_database"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. 数据库设置
```bash
# 生成Prisma客户端
npx prisma generate

# 推送数据库架构
npx prisma db push

# 初始化数据库（清空所有数据并创建初始用户）
npx tsx prisma/seed.ts
```

### 4. 启动开发服务器
```bash
npm run dev
```

## 📊 初始数据库状态

运行种子脚本后，数据库将包含：

- **用户账号**:
  - 学生: `student@example.com` (张同学)
  - 管理员: `admin@tiffanyscollege.com` (管理员)

- **视频分类**: 写作、口语、阅读、听力
- **订阅计划**: 基础版、高级版
- **视频**: 0个（等待上传）

## 🔑 登录信息

### 学生账号
- 邮箱: `student@example.com`
- 角色: STUDENT
- 订阅: 基础版（30天）

### 管理员账号
- 邮箱: `admin@tiffanyscollege.com`
- 角色: ADMIN

## 🎬 功能特性

- **用户管理**: 学生和管理员角色管理
- **视频管理**: 上传、编辑、删除视频
- **权限控制**: 基于订阅计划和直接授权的访问控制
- **观看进度**: 跟踪用户观看历史和进度
- **批量操作**: 支持批量视频管理
- **响应式设计**: 支持移动端和桌面端

## 🏗️ 技术栈

- **前端**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: PostgreSQL + Prisma ORM
- **认证**: NextAuth.js
- **部署**: Vercel

## 📁 项目结构

```
├── app/                    # Next.js 应用代码
│   ├── admin/             # 管理员页面
│   ├── api/               # API 路由
│   ├── videos/            # 学生视频页面
│   └── ...
├── lib/                   # 工具库
├── prisma/                # 数据库相关
├── types/                 # TypeScript 类型定义
└── public/                # 静态资源
```

## 🚀 部署

项目已配置为可直接部署到 Vercel：

```bash
npm run build
```

## 📝 注意事项

- 首次运行需要先初始化数据库
- 视频文件需要手动上传到服务器
- 确保环境变量正确配置
- 生产环境请使用强密码和安全的密钥

---

**开发状态**: ✅ 完成  
**部署状态**: ✅ 可部署  
**最后更新**: 2024年12月
