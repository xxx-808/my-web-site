import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 获取单个用户详情
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await context.params;
    const session = await getServerSession(authOptions);
    
    // 验证管理员权限
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id as string }
    });

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ 
        error: 'Admin access required' 
      }, { status: 403 });
    }

    // 获取用户详细信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: {
          include: {
            plan: true
          },
          orderBy: {
            createdAt: 'desc'
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
        watchHistory: {
          include: {
            video: {
              include: {
                category: true
              }
            }
          },
          orderBy: {
            lastWatched: 'desc'
          },
          take: 20
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
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      
      // 订阅历史
      subscriptions: user.subscriptions.map(sub => ({
        id: sub.id,
        planName: sub.plan.name,
        planDescription: sub.plan.description,
        startDate: sub.startDate,
        endDate: sub.endDate,
        status: sub.status,
        createdAt: sub.createdAt
      })),

      // 视频访问权限
      videoAccesses: user.videoAccesses.map(access => ({
        id: access.id,
        videoId: access.video.id,
        videoTitle: access.video.title,
        category: access.video.category.displayName,
        accessType: access.accessType,
        grantedAt: access.grantedAt,
        expiresAt: access.expiresAt,
        isActive: access.isActive
      })),

      // 观看历史
      watchHistory: user.watchHistory.map(history => ({
        id: history.id,
        videoId: history.video.id,
        videoTitle: history.video.title,
        category: history.video.category.displayName,
        watchTime: history.watchTime,
        progress: history.progress,
        lastWatched: history.lastWatched
      })),

      // 统计信息
      stats: {
        totalVideoAccess: user.videoAccesses.length,
        totalWatchTime: user.watchHistory.reduce((total, history) => total + history.watchTime, 0),
        averageProgress: user.watchHistory.length > 0 
          ? user.watchHistory.reduce((total, history) => total + history.progress, 0) / user.watchHistory.length 
          : 0,
        categoriesAccessed: [...new Set(user.videoAccesses.map(access => access.video.category.name))].length
      }
    };

    return NextResponse.json(userData);

  } catch (error) {
    console.error('Admin user detail error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// 更新用户信息
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await context.params;
    const session = await getServerSession(authOptions);
    
    // 验证管理员权限
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id as string }
    });

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ 
        error: 'Admin access required' 
      }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, role } = body;

    // 检查用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    // 如果更新邮箱，检查是否重复
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });

      if (emailExists) {
        return NextResponse.json({ 
          error: 'Email already exists' 
        }, { status: 400 });
      }
    }

    // 更新用户信息
    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role.toUpperCase();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    return NextResponse.json({
      message: 'User updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        updatedAt: updatedUser.updatedAt
      }
    });

  } catch (error) {
    console.error('Admin update user error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// 删除用户
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await context.params;
    const session = await getServerSession(authOptions);
    
    // 验证管理员权限
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id as string }
    });

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ 
        error: 'Admin access required' 
      }, { status: 403 });
    }

    // 检查用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    // 防止删除自己
    if (userId === session.user.id) {
      return NextResponse.json({ 
        error: 'Cannot delete yourself' 
      }, { status: 400 });
    }

    // 删除用户（Prisma会自动处理级联删除）
    await prisma.user.delete({
      where: { id: userId }
    });

    return NextResponse.json({
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Admin delete user error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
