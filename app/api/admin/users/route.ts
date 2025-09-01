import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 获取所有用户（管理员权限）
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 开始获取用户列表...');
    
    const session = await getServerSession(authOptions);
    console.log('📋 会话信息:', { 
      hasSession: !!session, 
      userId: session?.user?.userId,
      userRole: session?.user?.role 
    });
    
    // 验证管理员权限
    if (!session?.user?.userId) {
      console.log('❌ 未找到用户会话');
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    // 检查是否为管理员
    console.log('🔐 验证管理员权限...');
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.userId as string }
    });

    console.log('👤 管理员用户信息:', { 
      found: !!adminUser, 
      role: adminUser?.role 
    });

    if (!adminUser || adminUser.role !== 'ADMIN') {
      console.log('❌ 用户不是管理员');
      return NextResponse.json({ 
        error: 'Admin access required' 
      }, { status: 403 });
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role');

    // 构建查询条件
    const where: Record<string, unknown> = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (role && role !== 'all') {
      where.role = role.toUpperCase();
    }

    // 计算分页
    const skip = (page - 1) * limit;

    // 获取用户列表
    console.log('📊 开始查询用户数据...');
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          subscriptions: {
            include: {
              plan: true
            }
          },
          videoAccesses: {
            include: {
              video: {
                select: {
                  id: true,
                  title: true
                }
              }
            }
          },
          watchHistories: {
            take: 1,
            orderBy: {
              watchedAt: 'desc'
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ]);
    
    console.log(`✅ 成功获取 ${users.length} 个用户，总计 ${totalCount} 个`);

    // 处理用户数据
    const processedUsers = users.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      // 订阅信息
      subscription: user.subscriptions[0] ? {
        id: user.subscriptions[0].id,
        planName: user.subscriptions[0].plan.name,
        planDescription: user.subscriptions[0].plan.description,
        startDate: user.subscriptions[0].startDate,
        endDate: user.subscriptions[0].endDate,
        status: user.subscriptions[0].status,
        daysRemaining: Math.ceil((user.subscriptions[0].endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      } : null,
      // 统计信息
      stats: {
        videoAccessCount: user.videoAccesses.length,
        lastActivity: user.watchHistory[0]?.watchedAt || null
      }
    }));

    return NextResponse.json({
      users: processedUsers,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Admin users API error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown'
    });
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined
    }, { status: 500 });
  }
}

// 创建新用户（管理员权限）
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
    const { name, email, role, password, subscriptionPlanId } = body;

    // 验证必填字段
    if (!name || !email || !role || !password) {
      return NextResponse.json({ 
        error: 'Name, email, role, and password are required' 
      }, { status: 400 });
    }

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ 
        error: 'User with this email already exists' 
      }, { status: 400 });
    }

    // 创建用户
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password,
        role: role.toUpperCase()
      }
    });

    // 如果指定了订阅计划，创建订阅
    if (subscriptionPlanId) {
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { id: subscriptionPlanId }
      });

      if (plan) {
        await prisma.subscription.create({
          data: {
            userId: newUser.id,
            planId: plan.id,
            startDate: new Date(),
            endDate: new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000),
            status: 'ACTIVE'
          }
        });
      }
    }

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Admin create user error:', error);
    
    // 提供更详细的错误信息
    let errorMessage = 'Internal server error';
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // 根据错误类型设置状态码
      if (error.message.includes('connect')) {
        statusCode = 503; // Service Unavailable
        errorMessage = 'Database connection failed';
      } else if (error.message.includes('timeout')) {
        statusCode = 408; // Request Timeout
        errorMessage = 'Database query timeout';
      } else if (error.message.includes('unique constraint')) {
        statusCode = 400; // Bad Request
        errorMessage = 'User with this email already exists';
      }
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: statusCode });
  }
}
