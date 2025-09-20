import { PrismaClient, UserRole, AccessLevel, SubscriptionStatus, VideoStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始数据库种子数据初始化...')

  try {
    // 清理现有数据（可选，谨慎使用）
    console.log('🧹 清理现有数据...')
    await prisma.watchHistory.deleteMany()
    await prisma.videoAccess.deleteMany()
    await prisma.subscription.deleteMany()
    await prisma.video.deleteMany()
    await prisma.videoCategory.deleteMany()
    await prisma.subscriptionPlan.deleteMany()
    await prisma.user.deleteMany()
    await prisma.systemConfig.deleteMany()

    // 1. 创建视频分类
    console.log('📂 创建视频分类...')
    const categories = await Promise.all([
      prisma.videoCategory.create({
        data: {
          name: '雅思听力',
          description: '雅思听力技巧与练习'
        }
      }),
      prisma.videoCategory.create({
        data: {
          name: '雅思阅读',
          description: '雅思阅读理解与技巧'
        }
      }),
      prisma.videoCategory.create({
        data: {
          name: '雅思写作',
          description: '雅思写作技巧与范文'
        }
      }),
      prisma.videoCategory.create({
        data: {
          name: '雅思口语',
          description: '雅思口语表达与练习'
        }
      }),
      prisma.videoCategory.create({
        data: {
          name: '基础英语',
          description: '英语基础语法与词汇'
        }
      })
    ])

    console.log(`✅ 创建了 ${categories.length} 个视频分类`)

    // 2. 创建订阅计划
    console.log('💳 创建订阅计划...')
    const plans = await Promise.all([
      prisma.subscriptionPlan.create({
        data: {
          name: '免费体验',
          description: '免费观看基础级别课程',
          price: 0,
          duration: 7, // 7天
          accessLevel: AccessLevel.BASIC
        }
      }),
      prisma.subscriptionPlan.create({
        data: {
          name: '标准会员',
          description: '观看所有基础和高级课程',
          price: 99.99,
          duration: 30, // 30天
          accessLevel: AccessLevel.PREMIUM
        }
      }),
      prisma.subscriptionPlan.create({
        data: {
          name: 'VIP会员',
          description: '享受所有课程和一对一指导',
          price: 299.99,
          duration: 90, // 90天
          accessLevel: AccessLevel.VIP
        }
      })
    ])

    console.log(`✅ 创建了 ${plans.length} 个订阅计划`)

    // 3. 创建用户
    console.log('👤 创建用户...')
    const users = await Promise.all([
      prisma.user.create({
        data: {
          email: 'admin@example.com',
          name: '系统管理员',
          password: 'admin123456', // 实际项目中应该加密
          role: UserRole.ADMIN
        }
      }),
      prisma.user.create({
        data: {
          email: 'student@example.com',
          name: '测试学生',
          password: 'student123', // 实际项目中应该加密
          role: UserRole.STUDENT
        }
      }),
      prisma.user.create({
        data: {
          email: 'demo@example.com',
          name: '演示用户',
          password: 'demo123',
          role: UserRole.STUDENT
        }
      })
    ])

    console.log(`✅ 创建了 ${users.length} 个用户`)

    // 4. 创建示例视频
    console.log('🎥 创建示例视频...')
    const videos = await Promise.all([
      prisma.video.create({
        data: {
          title: '雅思听力基础 - 数字与时间',
          description: '学习雅思听力考试中常见的数字和时间表达方式',
          url: 'https://example.com/video1.mp4',
          thumbnail: 'https://picsum.photos/800/450?random=1',
          duration: 1800, // 30分钟
          categoryId: categories[0].id, // 雅思听力
          accessLevel: AccessLevel.BASIC,
          status: VideoStatus.ACTIVE
        }
      }),
      prisma.video.create({
        data: {
          title: '雅思阅读技巧 - 快速定位',
          description: '掌握雅思阅读考试中的关键词定位技巧',
          url: 'https://example.com/video2.mp4',
          thumbnail: 'https://picsum.photos/800/450?random=2',
          duration: 2400, // 40分钟
          categoryId: categories[1].id, // 雅思阅读
          accessLevel: AccessLevel.PREMIUM,
          status: VideoStatus.ACTIVE
        }
      }),
      prisma.video.create({
        data: {
          title: '雅思写作 - Task 1 图表描述',
          description: '学习如何有效描述雅思写作Task 1中的各种图表',
          url: 'https://example.com/video3.mp4',
          thumbnail: 'https://picsum.photos/800/450?random=3',
          duration: 3000, // 50分钟
          categoryId: categories[2].id, // 雅思写作
          accessLevel: AccessLevel.VIP,
          status: VideoStatus.ACTIVE
        }
      }),
      prisma.video.create({
        data: {
          title: '雅思口语 - Part 1 常见话题',
          description: '雅思口语Part 1部分的常见话题和回答技巧',
          url: 'https://example.com/video4.mp4',
          thumbnail: 'https://picsum.photos/800/450?random=4',
          duration: 2100, // 35分钟
          categoryId: categories[3].id, // 雅思口语
          accessLevel: AccessLevel.BASIC,
          status: VideoStatus.ACTIVE
        }
      }),
      prisma.video.create({
        data: {
          title: '英语语法基础 - 时态详解',
          description: '英语基础语法中各种时态的用法和区别',
          url: 'https://example.com/video5.mp4',
          thumbnail: 'https://picsum.photos/800/450?random=5',
          duration: 2700, // 45分钟
          categoryId: categories[4].id, // 基础英语
          accessLevel: AccessLevel.BASIC,
          status: VideoStatus.ACTIVE
        }
      })
    ])

    console.log(`✅ 创建了 ${videos.length} 个示例视频`)

    // 5. 为学生用户创建订阅
    console.log('📋 创建用户订阅...')
    const studentUser = users.find(u => u.email === 'student@example.com')!
    const demoUser = users.find(u => u.email === 'demo@example.com')!
    const basicPlan = plans.find(p => p.name === '免费体验')!
    const premiumPlan = plans.find(p => p.name === '标准会员')!

    const subscriptions = await Promise.all([
      prisma.subscription.create({
        data: {
          userId: studentUser.id,
          planId: premiumPlan.id,
          status: SubscriptionStatus.ACTIVE,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30天后
        }
      }),
      prisma.subscription.create({
        data: {
          userId: demoUser.id,
          planId: basicPlan.id,
          status: SubscriptionStatus.ACTIVE,
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7天后
        }
      })
    ])

    console.log(`✅ 创建了 ${subscriptions.length} 个用户订阅`)

    // 6. 创建系统配置
    console.log('⚙️ 创建系统配置...')
    const configs = await Promise.all([
      prisma.systemConfig.create({
        data: {
          key: 'site_name',
          value: '在线学习平台'
        }
      }),
      prisma.systemConfig.create({
        data: {
          key: 'max_video_size',
          value: '500' // MB
        }
      }),
      prisma.systemConfig.create({
        data: {
          key: 'supported_video_formats',
          value: 'mp4,avi,mov,wmv'
        }
      })
    ])

    console.log(`✅ 创建了 ${configs.length} 个系统配置`)

    // 7. 验证数据
    console.log('\n📊 数据库初始化完成！')
    console.log('==========================================')
    
    const counts = await Promise.all([
      prisma.user.count(),
      prisma.videoCategory.count(),
      prisma.video.count(),
      prisma.subscriptionPlan.count(),
      prisma.subscription.count(),
      prisma.systemConfig.count()
    ])

    console.log(`👥 用户数量: ${counts[0]}`)
    console.log(`📂 视频分类: ${counts[1]}`)
    console.log(`🎥 视频数量: ${counts[2]}`)
    console.log(`💳 订阅计划: ${counts[3]}`)
    console.log(`📋 用户订阅: ${counts[4]}`)
    console.log(`⚙️ 系统配置: ${counts[5]}`)

    console.log('\n🎯 测试账户信息:')
    console.log('==========================================')
    console.log('管理员: admin@example.com / admin123456')
    console.log('学生: student@example.com / student123')
    console.log('演示: demo@example.com / demo123')

  } catch (error) {
    console.error('❌ 数据库种子初始化失败:', error)
    throw error
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
    console.log('\n🔌 数据库连接已关闭')
  })
  .catch(async (e) => {
    console.error('❌ 种子脚本执行失败:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
