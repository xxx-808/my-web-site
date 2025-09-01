import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('开始初始化数据库...')

  // 清空现有数据（除了用户和分类）
  console.log('清理现有数据...')
  try {
    await prisma.videoAccess.deleteMany()
    await prisma.watchHistory.deleteMany()
    await prisma.subscription.deleteMany()
    await prisma.video.deleteMany()
    await prisma.user.deleteMany()
    await prisma.subscriptionPlan.deleteMany()
    await prisma.videoCategory.deleteMany()
    await prisma.systemConfig.deleteMany()
    console.log('✅ 现有数据清理完成')
  } catch (error) {
    console.log('⚠️ 清理数据时出现错误（可能是首次运行）:', error)
  }

  // 创建视频分类
  const categories = [
    {
      name: 'writing',
      description: '雅思写作相关课程'
    },
    {
      name: 'speaking',
      description: '雅思口语相关课程'
    },
    {
      name: 'reading',
      description: '雅思阅读相关课程'
    },
    {
      name: 'listening',
      description: '雅思听力相关课程'
    }
  ]

  for (const category of categories) {
    await prisma.videoCategory.create({
      data: category
    })
  }

  console.log('✅ 视频分类创建完成')

  // 创建订阅计划
  const plans = [
    {
      name: 'basic',
      description: '基础会员计划 - 每周2次直播小班课，作业批改与要点讲义，课程回放与练习题库',
      price: 299.0,
      duration: 30
    },
    {
      name: 'premium',
      description: '高级会员计划 - 每周3次直播与口语演练房，导师精批（写作/演讲各2次/月），学术术语速记包与检索工作坊',
      price: 799.0,
      duration: 90
    }
  ]

  for (const plan of plans) {
    await prisma.subscriptionPlan.create({
      data: plan
    })
  }

  console.log('✅ 订阅计划创建完成')

  // 创建示例用户（只保留两个账号）
  const users = [
    {
      email: 'student@example.com',
      name: '张同学',
      password: 'password123',
      role: 'STUDENT' as const
    },
    {
      email: 'admin@tiffanyscollege.com',
      name: '管理员',
      password: 'admin123',
      role: 'ADMIN' as const
    }
  ]

  for (const user of users) {
    await prisma.user.create({
      data: user
    })
  }

  console.log('✅ 用户创建完成')

  // 为学生用户创建订阅
  const student = await prisma.user.findUnique({
    where: { email: 'student@example.com' }
  })

  const basicPlan = await prisma.subscriptionPlan.findFirst({
    where: { name: 'basic' }
  })

  if (student && basicPlan) {
    await prisma.subscription.create({
      data: {
        userId: student.id,
        planId: basicPlan.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后
        status: 'ACTIVE' as const
      }
    })
  }

  console.log('✅ 用户订阅创建完成')

  console.log('🎉 数据库初始化完成！')
  console.log('📊 当前数据库状态:')
  console.log('   - 用户: 2个 (1个学生 + 1个管理员)')
  console.log('   - 视频: 0个 (等待上传)')
  console.log('   - 分类: 4个 (写作、口语、阅读、听力)')
  console.log('   - 订阅计划: 2个 (基础版 + 高级版)')
}

main()
  .catch((e) => {
    console.error('数据库初始化失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
