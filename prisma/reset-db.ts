import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function resetDatabase() {
  console.log('🔄 开始重置数据库...')

  try {
    // 按依赖关系顺序删除数据
    console.log('清理现有数据...')
    
    // 删除依赖数据
    await prisma.videoAccess.deleteMany()
    console.log('✅ 删除视频访问记录')
    
    await prisma.watchHistory.deleteMany()
    console.log('✅ 删除观看历史')
    
    await prisma.subscription.deleteMany()
    console.log('✅ 删除订阅记录')
    
    await prisma.video.deleteMany()
    console.log('✅ 删除视频数据')
    
    await prisma.user.deleteMany()
    console.log('✅ 删除用户数据')
    
    await prisma.subscriptionPlan.deleteMany()
    console.log('✅ 删除订阅计划')
    
    await prisma.videoCategory.deleteMany()
    console.log('✅ 删除视频分类')
    
    await prisma.systemConfig.deleteMany()
    console.log('✅ 删除系统配置')

    console.log('🎉 数据库重置完成！')
    console.log('📊 当前数据库状态: 完全清空，等待重新初始化')

  } catch (error) {
    console.error('❌ 数据库重置失败:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

resetDatabase()
  .catch((e) => {
    console.error('重置失败:', e)
    process.exit(1)
  })
