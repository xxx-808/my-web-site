import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    // 获取用户会话
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.userId) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const userId = session.user.userId as string;

    // 获取用户详细信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
              include: {
                category: true
              }
            }
          }
        },
        watchHistories: {
          include: {
            video: {
              include: {
                category: true
              }
            }
          },
          orderBy: {
            watchedAt: 'desc'
          },
          take: 10
        }
      }
    });

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    // 处理用户数据
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      // 订阅信息
      subscription: user.subscriptions[0] ? {
        planName: user.subscriptions[0].plan.name,
        planDescription: user.subscriptions[0].plan.description,
        startDate: user.subscriptions[0].startDate,
        endDate: user.subscriptions[0].endDate,
        status: user.subscriptions[0].status,
        daysRemaining: Math.ceil((user.subscriptions[0].endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      } : null,
      // 视频访问统计
      videoStats: {
        totalAccess: user.videoAccesses.length,
        categories: user.videoAccesses.reduce((acc, access) => {
          const category = access.video.category.name;
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      },
      // 观看历史
      watchHistories: user.watchHistories.map(history => ({
        videoId: history.video.id,
        videoTitle: history.video.title,
        category: history.video.category.name,
        progress: history.progress,
        watchedAt: history.watchedAt
      }))
    };

    return NextResponse.json(userData);

  } catch (error) {
    console.error('Users API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// 更新用户信息
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.userId) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const userId = session.user.userId as string;
    const body = await request.json();

    // 只允许更新特定字段
    const allowedFields = ['name'];
    const updateData: Record<string, string> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ 
        error: 'No valid fields to update' 
      }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    return NextResponse.json({
      message: 'User updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role
      }
    });

  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// 禁用其他HTTP方法
export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
