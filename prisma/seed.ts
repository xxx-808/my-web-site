import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('开始初始化数据库...')

  // 创建视频分类
  const categories = [
    {
      name: 'writing',
      displayName: '写作技能',
      description: '雅思写作相关课程',
      icon: '✍️'
    },
    {
      name: 'speaking',
      displayName: '口语表达',
      description: '雅思口语相关课程',
      icon: '🗣️'
    },
    {
      name: 'reading',
      displayName: '阅读策略',
      description: '雅思阅读相关课程',
      icon: '📖'
    },
    {
      name: 'listening',
      displayName: '听力技巧',
      description: '雅思听力相关课程',
      icon: '👂'
    }
  ]

  for (const category of categories) {
    await prisma.videoCategory.upsert({
      where: { name: category.name },
      update: category,
      create: category
    })
  }

  console.log('✅ 视频分类创建完成')

  // 创建订阅计划
  const plans = [
    {
      name: 'basic',
      description: '基础会员计划',
      price: 299.0,
      duration: 30,
      features: ['每周2次直播小班课', '作业批改与要点讲义', '课程回放与练习题库']
    },
    {
      name: 'premium',
      description: '高级会员计划',
      price: 799.0,
      duration: 90,
      features: ['每周3次直播与口语演练房', '导师精批（写作/演讲各2次/月）', '学术术语速记包与检索工作坊']
    }
  ]

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan
    })
  }

  console.log('✅ 订阅计划创建完成')

  // 创建示例用户
  const users = [
    {
      email: 'student@example.com',
      name: '张同学',
      role: 'STUDENT'
    },
    {
      email: 'admin@tiffanyscollege.com',
      name: '管理员',
      role: 'ADMIN'
    }
  ]

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: user,
      create: user
    })
  }

  console.log('✅ 用户创建完成')

  // 创建示例视频
  const videos = [
    {
      title: '雅思写作Task 1: 图表描述认知策略',
      description: '基于认知科学的图表描述方法，解决中国学生常见表达障碍',
      categoryName: 'writing',
      duration: '45:30',
      filePath: '/videos/writing-task1.mp4',
      thumbnail: 'https://picsum.photos/id/1011/400/225',
      accessLevel: 'PREMIUM',
      tags: ['写作', 'Task1', '图表描述', '认知策略'],
      cognitiveObjectives: ['提高图表分析能力', '培养逻辑表达思维', '减少母语负迁移']
    },
    {
      title: '雅思口语Part 2: 话题展开策略训练',
      description: '运用认知语言学理论，培养话题深度展开能力',
      categoryName: 'speaking',
      duration: '52:15',
      filePath: '/videos/speaking-part2.mp4',
      thumbnail: 'https://picsum.photos/id/1005/400/225',
      accessLevel: 'PREMIUM',
      tags: ['口语', 'Part2', '话题展开', '认知语言学'],
      cognitiveObjectives: ['提升话题延展能力', '培养思维连贯性', '增强表达自信']
    },
    {
      title: '雅思阅读: 快速定位与理解技巧',
      description: '掌握Skimming和Scanning技巧，提高阅读速度和准确率',
      categoryName: 'reading',
      duration: '48:20',
      filePath: '/videos/reading-skills.mp4',
      thumbnail: 'https://picsum.photos/id/1020/400/225',
      accessLevel: 'BASIC',
      tags: ['阅读', '快速定位', '理解技巧'],
      cognitiveObjectives: ['提高阅读速度', '增强理解能力', '培养阅读策略']
    },
    {
      title: '雅思听力: 预测技巧与关键词识别',
      description: '通过关键词预测与场景推断提升正确率',
      categoryName: 'listening',
      duration: '41:20',
      filePath: '/videos/listening-predict.mp4',
      thumbnail: 'https://picsum.photos/id/1021/400/225',
      accessLevel: 'BASIC',
      tags: ['听力', '预测技巧', '关键词识别'],
      cognitiveObjectives: ['提高听力预测能力', '增强关键词识别', '培养场景推断']
    }
  ]

  for (const video of videos) {
    const category = await prisma.videoCategory.findUnique({
      where: { name: video.categoryName }
    })

    if (category) {
      await prisma.video.upsert({
        where: { title: video.title },
        update: {
          ...video,
          categoryId: category.id
        },
        create: {
          ...video,
          categoryId: category.id
        }
      })
    }
  }

  console.log('✅ 示例视频创建完成')

  // 为学生用户创建订阅
  const student = await prisma.user.findUnique({
    where: { email: 'student@example.com' }
  })

  const basicPlan = await prisma.subscriptionPlan.findUnique({
    where: { name: 'basic' }
  })

  if (student && basicPlan) {
    await prisma.subscription.upsert({
      where: {
        userId_planId: {
          userId: student.id,
          planId: basicPlan.id
        }
      },
      update: {},
      create: {
        userId: student.id,
        planId: basicPlan.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后
        status: 'ACTIVE'
      }
    })
  }

  console.log('✅ 用户订阅创建完成')

  console.log('🎉 数据库初始化完成！')
}

main()
  .catch((e) => {
    console.error('数据库初始化失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
