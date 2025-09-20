import { PrismaClient } from '@prisma/client'

// PrismaClient单例模式，避免在开发环境中创建多个实例
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// 优雅关闭数据库连接
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

export default prisma
