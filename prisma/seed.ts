import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始数据库种子数据初始化...')

  // 创建管理员用户
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tiffanyscollege.com' },
    update: {},
    create: {
      email: 'admin@tiffanyscollege.com',
      name: 'Tiffany Admin',
      password: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      cognitiveProfile: {
        create: {
          listeningLevel: 9,
          speakingLevel: 9,
          readingLevel: 9,
          writingLevel: 9,
          learningPace: 'FAST',
          memoryType: 'MULTIMODAL',
          attentionSpan: 'LONG',
          l1Interference: ['无'],
          cognitiveBarriers: ['无'],
          recommendedStrategies: ['认知诊断', '策略指导', '能力迁移'],
          adaptiveContent: ['高级认知训练', '研究型学习']
        }
      },
      learningStyle: {
        create: {
          visual: 8,
          auditory: 7,
          reading: 9,
          kinesthetic: 6,
          prefersStructured: true,
          prefersInteractive: true,
          prefersVisual: true,
          prefersAudio: true,
          optimalSessionLength: 60,
          preferredTimeOfDay: 'MORNING'
        }
      }
    }
  })

  // 创建示例学生用户
  const studentPassword = await bcrypt.hash('student123', 12)
  const student = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      email: 'student@example.com',
      name: '张三',
      password: studentPassword,
      role: 'STUDENT',
      status: 'ACTIVE',
      cognitiveProfile: {
        create: {
          listeningLevel: 5,
          speakingLevel: 4,
          readingLevel: 6,
          writingLevel: 5,
          learningPace: 'MEDIUM',
          memoryType: 'VISUAL',
          attentionSpan: 'MEDIUM',
          l1Interference: ['中文语法结构影响', '词汇搭配习惯'],
          cognitiveBarriers: ['抽象概念理解困难', '长句分析能力弱'],
          recommendedStrategies: ['视觉化学习', '结构化练习', '渐进式训练'],
          adaptiveContent: ['图表辅助', '实例说明', '互动练习']
        }
      },
      learningStyle: {
        create: {
          visual: 8,
          auditory: 5,
          reading: 6,
          kinesthetic: 4,
          prefersStructured: true,
          prefersInteractive: true,
          prefersVisual: true,
          prefersAudio: false,
          optimalSessionLength: 45,
          preferredTimeOfDay: 'AFTERNOON'
        }
      }
    }
  })

  // 创建雅思写作课程
  const writingCourse = await prisma.course.upsert({
    where: { id: 'ielts-writing-course' },
    update: {},
    create: {
      id: 'ielts-writing-course',
      title: '雅思写作认知提升课程',
      description: '基于认知语言科学的雅思写作训练，解决中国学生写作中的深层认知障碍',
      category: 'IELTS_WRITING',
      level: 'INTERMEDIATE',
      duration: 1200, // 20小时
      price: 2999.00,
      cognitiveObjectives: [
        '提升图表描述的逻辑思维能力',
        '培养议论文的批判性思维',
        '建立英语写作的认知框架'
      ],
      learningStrategies: [
        '认知诊断-策略指导-能力迁移',
        '母语负迁移分析',
        '个性化学习路径'
      ],
      assessmentMethods: [
        '认知能力评估',
        '写作策略分析',
        '学习效果追踪'
      ]
    }
  })

  // 创建课程模块
  const writingModule1 = await prisma.module.create({
    data: {
      courseId: writingCourse.id,
      title: 'Task 1 图表描述认知训练',
      description: '通过认知科学方法提升图表描述的逻辑思维和语言表达能力',
      order: 1,
      duration: 240, // 4小时
      cognitiveFocus: '逻辑思维与数据可视化',
      prerequisiteSkills: ['基础英语语法', '基本图表理解']
    }
  })

  const writingModule2 = await prisma.module.create({
    data: {
      courseId: writingCourse.id,
      title: 'Task 2 议论文认知构建',
      description: '培养批判性思维和论证能力，建立英语议论文的认知框架',
      order: 2,
      duration: 360, // 6小时
      cognitiveFocus: '批判性思维与论证结构',
      prerequisiteSkills: ['Task 1 完成', '基础议论文概念']
    }
  })

  // 创建示例视频
  const video1 = await prisma.video.create({
    data: {
      moduleId: writingModule1.id,
      title: '图表描述认知策略 - 数据趋势分析',
      description: '学习如何通过认知策略分析图表数据趋势，提升描述的逻辑性',
      filePath: '/videos/writing-task1-trend-analysis.mp4',
      duration: 1800, // 30分钟
      thumbnail: '/thumbnails/writing-task1-trend.jpg',
      cognitiveObjectives: [
        '数据趋势识别',
        '逻辑描述构建',
        '语言表达优化'
      ],
      learningStrategies: [
        '认知诊断',
        '策略指导',
        '能力迁移'
      ],
      difficultyLevel: 3
    }
  })

  // 创建视频访问控制
  await prisma.videoAccessControl.create({
    data: {
      videoId: video1.id,
      allowedIPs: ['127.0.0.1', '::1'],
      allowedUserIds: [student.id],
      expiresAt: new Date('2025-12-31'),
      allowDownload: false,
      allowScreenRecord: false,
      watermarkEnabled: true,
      adaptivePlayback: true,
      cognitivePacing: true
    }
  })

  // 创建用户IP地址
  await prisma.userIP.create({
    data: {
      userId: student.id,
      ipAddress: '192.168.1.100',
      location: '北京',
      deviceInfo: 'Windows 10, Chrome',
      isActive: true
    }
  })

  // 创建课程报名
  await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: writingCourse.id,
      status: 'ACTIVE',
      enrolledAt: new Date(),
      expiresAt: new Date('2025-12-31'),
      cognitiveProgress: {
        currentLevel: 'INTERMEDIATE',
        targetLevel: 'ADVANCED',
        estimatedCompletion: '2025-06-30'
      }
    }
  })

  // 创建学习进度
  await prisma.progress.create({
    data: {
      userId: student.id,
      moduleId: writingModule1.id,
      completedVideos: [video1.id],
      completedMaterials: [],
      overallProgress: 25.0,
      cognitiveScores: {
        logicalThinking: 7.5,
        dataAnalysis: 8.0,
        languageExpression: 6.5
      },
      learningEfficiency: 0.85
    }
  })

  console.log('✅ 数据库种子数据初始化完成！')
  console.log(`👤 创建用户: ${admin.name}, ${student.name}`)
  console.log(`📚 创建课程: ${writingCourse.title}`)
  console.log(`🎥 创建视频: ${video1.title}`)
}

main()
  .catch((e) => {
    console.error('❌ 数据库种子数据初始化失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
