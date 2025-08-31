import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 获取所有订阅记录
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // 验证管理员权限
    if (!session?.user?.userId) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.userId as string }
    });

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ 
        error: 'Admin access required' 
      }, { status: 403 });
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const planId = searchParams.get('planId');

    // 构建查询条件
    const where: Record<string, unknown> = {};
    
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    if (planId) {
      where.planId = planId;
    }

    // 计算分页
    const skip = (page - 1) * limit;

    // 获取订阅列表
    const [subscriptions, totalCount] = await Promise.all([
      prisma.subscription.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          plan: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.subscription.count({ where })
    ]);

    // 处理订阅数据
    const processedSubscriptions = subscriptions.map(subscription => ({
      id: subscription.id,
      user: subscription.user,
      plan: {
        id: subscription.plan.id,
        name: subscription.plan.name,
        description: subscription.plan.description,
        price: subscription.plan.price,
        duration: subscription.plan.duration
      },
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      status: subscription.status,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
      
      // 计算剩余天数
      daysRemaining: subscription.status === 'ACTIVE' 
        ? Math.max(0, Math.ceil((subscription.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
        : 0,
      
      // 计算使用天数
      daysUsed: Math.ceil((new Date().getTime() - subscription.startDate.getTime()) / (1000 * 60 * 60 * 24))
    }));

    return NextResponse.json({
      subscriptions: processedSubscriptions,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Admin subscriptions API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// 创建新订阅
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // 验证管理员权限
    if (!session?.user?.userId) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.userId as string }
    });

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ 
        error: 'Admin access required' 
      }, { status: 403 });
    }

    const body = await request.json();
    const { userId, planId, startDate, customDuration } = body;

    // 验证必填字段
    if (!userId || !planId) {
      return NextResponse.json({ 
        error: 'User ID and plan ID are required' 
      }, { status: 400 });
    }

    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 400 });
    }

    // 检查计划是否存在
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      return NextResponse.json({ 
        error: 'Plan not found' 
      }, { status: 400 });
    }

    // 检查用户是否已有活跃订阅
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId: userId,
        status: 'ACTIVE',
        endDate: { gte: new Date() }
      }
    });

    if (existingSubscription) {
      return NextResponse.json({ 
        error: 'User already has an active subscription' 
      }, { status: 400 });
    }

    // 计算订阅时间
    const subscriptionStart = startDate ? new Date(startDate) : new Date();
    const duration = customDuration || plan.duration;
    const subscriptionEnd = new Date(subscriptionStart.getTime() + duration * 24 * 60 * 60 * 1000);

    // 创建订阅
    const newSubscription = await prisma.subscription.create({
      data: {
        userId: userId,
        planId: planId,
        startDate: subscriptionStart,
        endDate: subscriptionEnd,
        status: 'ACTIVE'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        plan: true
      }
    });

    return NextResponse.json({
      message: 'Subscription created successfully',
      subscription: {
        id: newSubscription.id,
        user: newSubscription.user,
        plan: newSubscription.plan,
        startDate: newSubscription.startDate,
        endDate: newSubscription.endDate,
        status: newSubscription.status,
        createdAt: newSubscription.createdAt
      }
    });

  } catch (error) {
    console.error('Admin create subscription error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
