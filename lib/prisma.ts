import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// 创建Prisma客户端实例，添加错误处理
const createPrismaClient = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  })

  // 添加连接错误处理
  client.$connect()
    .then(() => {
      console.log('✅ Prisma数据库连接成功')
    })
    .catch((error) => {
      console.error('❌ Prisma数据库连接失败:', error)
    })

  return client
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// 优雅关闭
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})
