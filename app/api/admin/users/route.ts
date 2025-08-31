import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 获取所有用户（管理员权限）
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // 验证管理员权限
    if (!session?.user?.userId) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    // 检查是否为管理员
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
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          subscriptions: {
            where: {
              status: 'ACTIVE',
              endDate: { gte: new Date() }
            },
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
          watchHistory: {
            take: 1,
            orderBy: {
              lastWatched: 'desc'
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
        lastActivity: user.watchHistory[0]?.lastWatched || null
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
    const { name, email, role, subscriptionPlanId } = body;

    // 验证必填字段
    if (!name || !email || !role) {
      return NextResponse.json({ 
        error: 'Name, email, and role are required' 
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
    console.error('Admin create user error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
