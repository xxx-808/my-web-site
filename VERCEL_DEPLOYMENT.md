# Vercel 部署指南

## 问题解决

之前的错误 "There is a problem with the server configuration" 是因为使用了本地SQLite数据库，而Vercel是无服务器环境，无法访问本地文件系统。

## 解决方案

### 1. 使用 Vercel Postgres

1. 在 Vercel Dashboard 中，进入你的项目
2. 点击 "Storage" 标签
3. 点击 "Create Database" 
4. 选择 "Postgres"
5. 创建数据库

### 2. 配置环境变量

在 Vercel Dashboard 的 "Settings" > "Environment Variables" 中添加：

```
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-app.vercel.app
```

### 3. 部署步骤

1. 推送代码到 GitHub
2. Vercel 会自动检测到 `vercel.json` 配置
3. 构建时会自动运行 `prisma generate`
4. 部署完成后，数据库会自动创建表结构

### 4. 初始化数据

部署完成后，需要手动运行种子数据：

```bash
# 在 Vercel 的 Functions 中创建一个 API 路由来初始化数据
# 或者使用 Vercel CLI 运行
vercel env pull .env.local
npx prisma db push
npx prisma db seed
```

## 本地开发

本地开发时仍然使用 SQLite：

```bash
# 本地环境变量 (.env.local)
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="your-local-secret"
NEXTAUTH_URL="http://localhost:3000"
```

## 注意事项

- Vercel Postgres 有免费额度限制
- 生产环境建议使用更稳定的数据库服务
- 确保所有环境变量都正确配置
