# Vercel 部署完整指南

## 🚀 快速部署步骤

### 1. 推送代码到GitHub

确保您的代码已推送到GitHub仓库。

### 2. 在Vercel中配置环境变量

在 Vercel Dashboard 的 "Settings" > "Environment Variables" 中添加以下变量：

```
DATABASE_URL=postgresql://neondb_owner:npg_ZnLAzPvU8EM6@ep-proud-mud-a1iu2mv5-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production-2024
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
```

⚠️ **重要**：请将 `https://your-vercel-domain.vercel.app` 替换为您的实际Vercel域名。

### 3. 部署项目

1. 在Vercel中连接您的GitHub仓库
2. Vercel会自动检测Next.js项目并开始构建
3. 等待部署完成

### 4. 初始化数据库

部署完成后，访问以下URL来初始化数据库：

```
POST https://your-vercel-domain.vercel.app/api/init-database
Content-Type: application/json

{
  "secret": "your-super-secret-key-change-this-in-production-2024"
}
```

或者使用curl命令：

```bash
curl -X POST https://your-vercel-domain.vercel.app/api/init-database \
  -H "Content-Type: application/json" \
  -d '{"secret":"your-super-secret-key-change-this-in-production-2024"}'
```

### 5. 测试登录

初始化完成后，您可以使用以下测试账户：

- **管理员**：admin@test.com / admin123
- **学生**：student@test.com / student123

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
