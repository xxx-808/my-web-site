# SQLite 数据库设置

## 当前状态

由于Supabase连接问题，项目已临时切换到SQLite数据库进行开发。

## 数据库信息

- **类型**: SQLite
- **文件**: `dev.db` (位于项目根目录)
- **用户账号**:
  - 学生: `student@example.com` / `password123`
  - 管理员: `admin@tiffanyscollege.com` / `admin123`

## 数据库内容

- ✅ 2个用户账号 (1个学生 + 1个管理员)
- ✅ 4个视频分类 (写作、口语、阅读、听力)
- ✅ 2个订阅计划 (基础版 + 高级版)
- ✅ 0个视频 (等待上传)

## 环境变量

项目根目录的 `.env` 文件包含：
```
DATABASE_URL="file:./dev.db"
```

## 开发服务器

使用以下命令启动开发服务器：
```bash
npm run dev
```

## 数据库操作

### 查看数据库
```bash
npx prisma studio
```

### 重置数据库
```bash
npm run db:seed
```

### 生成Prisma客户端
```bash
npx prisma generate
```

## 切换回Supabase

当Supabase连接问题解决后，可以：

1. 恢复 `prisma/schema-postgres.prisma` 到 `prisma/schema.prisma`
2. 更新 `.env` 文件中的 `DATABASE_URL`
3. 运行 `npx prisma generate` 和 `npx prisma db push`

## 注意事项

- SQLite不支持枚举类型，所有枚举字段都使用字符串
- 数据库文件 `dev.db` 已添加到 `.gitignore`
- 生产环境建议使用PostgreSQL或MySQL
