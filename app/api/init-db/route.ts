import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // 检查是否是生产环境
    if (process.env.NODE_ENV === 'production') {
      // 在生产环境中，只允许特定的初始化密钥
      const authHeader = request.headers.get('authorization');
      if (authHeader !== `Bearer ${process.env.INIT_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // 清理现有数据
    await prisma.watchHistory.deleteMany();
    await prisma.videoAccess.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.video.deleteMany();
    await prisma.user.deleteMany();
    await prisma.subscriptionPlan.deleteMany();
    await prisma.videoCategory.deleteMany();
    await prisma.systemConfig.deleteMany();

    // 创建视频分类
    const categories = await Promise.all([
      prisma.videoCategory.create({
        data: {
          name: '雅思听力',
          description: '雅思听力相关视频课程',
        },
      }),
      prisma.videoCategory.create({
        data: {
          name: '雅思阅读',
          description: '雅思阅读相关视频课程',
        },
      }),
      prisma.videoCategory.create({
        data: {
          name: '雅思写作',
          description: '雅思写作相关视频课程',
        },
      }),
      prisma.videoCategory.create({
        data: {
          name: '雅思口语',
          description: '雅思口语相关视频课程',
        },
      }),
    ]);

    // 创建订阅计划
    const basicPlan = await prisma.subscriptionPlan.create({
      data: {
        name: 'basic',
        description: '基础套餐 - 包含基础视频课程',
        price: 99.0,
        duration: 30,
        accessLevel: 'BASIC',
      },
    });

    const proPlan = await prisma.subscriptionPlan.create({
      data: {
        name: 'pro',
        description: '专业套餐 - 包含所有视频课程和高级功能',
        price: 199.0,
        duration: 30,
        accessLevel: 'PREMIUM',
      },
    });

    // 创建管理员用户
    const admin = await prisma.user.create({
      data: {
        email: 'admin@tiffanyscollege.com',
        name: '管理员',
        password: 'admin123',
        role: 'ADMIN',
      },
    });

    // 创建学生用户
    const student = await prisma.user.create({
      data: {
        email: 'student@tiffanyscollege.com',
        name: '学生',
        password: 'password123',
        role: 'STUDENT',
      },
    });

    // 为学生创建订阅
    if (student && basicPlan) {
      await prisma.subscription.create({
        data: {
          userId: student.id,
          planId: basicPlan.id,
          status: 'ACTIVE',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后
        },
      });
    }

    // 创建系统配置
    await prisma.systemConfig.createMany({
      data: [
        {
          key: 'site_name',
          value: 'Tiffany\'s College',
        },
        {
          key: 'max_upload_size',
          value: '100MB',
        },
        {
          key: 'allowed_video_formats',
          value: 'mp4,avi,mov',
        },
      ],
    });

    return NextResponse.json({
      message: 'Database initialized successfully',
      data: {
        categories: categories.length,
        plans: 2,
        users: 2,
        configs: 3,
      },
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
