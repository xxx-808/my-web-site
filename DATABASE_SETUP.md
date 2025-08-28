# 数据库设置指南

## 概述
本项目使用 PostgreSQL 数据库和 Prisma ORM 来管理视频与用户账号的关联关系。

## 数据库架构

### 核心数据表
1. **users** - 用户表（学生/管理员）
2. **subscription_plans** - 订阅计划表
3. **subscriptions** - 用户订阅表
4. **video_categories** - 视频分类表
5. **videos** - 视频内容表
6. **video_accesses** - 视频访问权限表
7. **watch_history** - 观看历史表

### 关键关联关系
- 用户通过订阅计划获得视频访问权限
- 视频按访问级别（基础/高级）控制访问
- 系统自动记录用户观看历史和进度
- 支持IP绑定和权限到期管理

## 安装步骤

### 1. 安装依赖
```bash
npm install
```

### 2. 设置环境变量
创建 `.env` 文件并配置：
```env
DATABASE_URL="postgresql://username:password@localhost:5432/tiffanys_college"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

### 3. 数据库初始化
```bash
# 生成Prisma客户端
npm run db:generate

# 推送数据库架构
npm run db:push

# 运行种子数据
npm run db:seed
```

## 数据库操作

### 生成Prisma客户端
```bash
npm run db:generate
```

### 更新数据库架构
```bash
npm run db:push
```

### 运行数据库迁移
```bash
npx prisma migrate dev
```

### 查看数据库
```bash
npx prisma studio
```

## 测试账号

### 学生账号
- 邮箱: student@example.com
- 密码: password123
- 订阅: 基础会员（30天）

### 管理员账号
- 邮箱: admin@tiffanyscollege.com
- 密码: admin123
- 权限: 系统管理员

## 功能特性

### 用户权限管理
- 基于订阅计划的视频访问控制
- 支持基础会员和高级会员两种级别
- 自动权限到期管理

### 视频安全
- IP地址绑定（可配置）
- 防录屏和下载保护
- 访问权限实时验证

### 学习进度追踪
- 自动记录观看历史
- 学习进度统计
- 个性化推荐支持

## 故障排除

### 常见问题
1. **数据库连接失败**: 检查 DATABASE_URL 配置
2. **Prisma客户端错误**: 运行 `npm run db:generate`
3. **权限验证失败**: 检查用户订阅状态

### 日志查看
```bash
# 查看Prisma日志
npx prisma --log-level debug

# 查看应用日志
npm run dev
```

## 生产环境部署

### 数据库要求
- PostgreSQL 12+
- 支持连接池
- 定期备份策略

### 安全建议
- 使用强密码
- 启用SSL连接
- 限制数据库访问IP
- 定期更新依赖包
