# 故障排除指南

## 🚨 常见问题

### 1. Internal Server Error (500)

**症状**: 页面显示"Internal server error"错误

**可能原因**:
- 数据库连接失败
- 环境变量未正确配置
- Prisma客户端未生成
- 数据库架构不匹配

**解决方案**:

#### 步骤1: 检查环境变量
```bash
node check-env.js
```

确保以下变量已设置:
- `DATABASE_URL` - 数据库连接字符串
- `NEXTAUTH_SECRET` - NextAuth密钥
- `NEXTAUTH_URL` - 应用URL

#### 步骤2: 测试数据库连接
```bash
# 健康检查API
curl http://localhost:3000/api/health

# 或者直接测试数据库
node test-db-connection.js
```

#### 步骤3: 重新生成Prisma客户端
```bash
npx prisma generate
npx prisma db push
```

#### 步骤4: 检查数据库状态
```bash
npx prisma db seed
```

### 2. 数据库连接失败

**症状**: 控制台显示数据库连接错误

**解决方案**:

#### 检查数据库服务
- PostgreSQL: 确保服务正在运行
- 检查端口是否正确 (默认5432)
- 验证用户名和密码

#### 检查防火墙
- 确保数据库端口未被阻止
- 检查网络连接

#### 测试连接字符串
```bash
# 使用psql测试PostgreSQL连接
psql "postgresql://username:password@localhost:5432/database"
```

### 3. 权限验证失败

**症状**: 用户无法登录或访问管理功能

**解决方案**:

#### 检查用户角色
```sql
-- 在数据库中检查用户角色
SELECT id, name, email, role FROM "User";
```

#### 验证会话状态
- 检查localStorage中的认证信息
- 清除浏览器缓存和cookies
- 重新登录

### 4. API路由错误

**症状**: API调用返回错误状态码

**解决方案**:

#### 检查API路由
- 确保路由文件存在且正确
- 检查导入语句
- 验证权限验证逻辑

#### 查看服务器日志
- 检查控制台输出
- 查看网络请求状态
- 验证请求参数

## 🔧 调试步骤

### 1. 启用详细日志
```typescript
// 在Prisma客户端中启用日志
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
  errorFormat: 'pretty',
});
```

### 2. 检查网络请求
- 打开浏览器开发者工具
- 查看Network标签页
- 检查请求和响应状态

### 3. 验证数据库架构
```bash
npx prisma db pull
npx prisma generate
```

### 4. 重置数据库
```bash
# 完全重置数据库
npx prisma migrate reset
npx prisma db push
npx prisma db seed
```

## 📋 检查清单

### 环境配置
- [ ] `.env.local` 文件存在
- [ ] `DATABASE_URL` 正确设置
- [ ] `NEXTAUTH_SECRET` 已生成
- [ ] `NEXTAUTH_URL` 正确配置

### 数据库状态
- [ ] 数据库服务正在运行
- [ ] 连接字符串正确
- [ ] 用户有足够权限
- [ ] 数据库架构已同步

### 应用状态
- [ ] Prisma客户端已生成
- [ ] 所有依赖已安装
- [ ] 开发服务器正在运行
- [ ] 端口未被占用

### 认证状态
- [ ] NextAuth配置正确
- [ ] 用户账号存在
- [ ] 角色权限正确
- [ ] 会话管理正常

## 🆘 获取帮助

如果问题仍然存在:

1. **检查控制台错误** - 查看详细的错误信息
2. **查看网络请求** - 验证API调用状态
3. **测试数据库连接** - 使用提供的测试脚本
4. **检查环境变量** - 运行环境检查脚本
5. **查看健康检查** - 访问 `/api/health` 端点

## 📞 紧急联系

- **数据库问题**: 检查数据库服务状态
- **网络问题**: 验证防火墙和网络配置
- **代码问题**: 检查最近的代码更改
- **环境问题**: 验证部署环境配置

---

**最后更新**: 2024年12月  
**状态**: 🔧 故障排除中
