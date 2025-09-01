import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 获取视频访问权限列表（管理员权限）
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
    const videoId = searchParams.get('videoId');
    const userId = searchParams.get('userId');

    // 构建查询条件
    const where: Record<string, unknown> = {};
    
    if (videoId) {
      where.videoId = videoId;
    }

    if (userId) {
      where.userId = userId;
    }

    // 获取视频访问权限列表
    const videoAccesses = await prisma.videoAccess.findMany({
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
        video: {
          select: {
            id: true,
            title: true,
            category: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        grantedAt: 'desc'
      }
    });

    // 处理数据
    const processedAccesses = videoAccesses.map(access => ({
      id: access.id,
      userId: access.user.id,
      userName: access.user.name,
      userEmail: access.user.email,
      userRole: access.user.role,
      videoId: access.video.id,
      videoTitle: access.video.title,
      videoCategory: access.video.category,
      accessType: access.accessType,
      grantedAt: access.grantedAt,
      expiresAt: access.expiresAt,
      isActive: access.isActive
    }));

    return NextResponse.json({
      videoAccesses: processedAccesses
    });

  } catch (error) {
    console.error('Admin video access API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// 为用户分配视频访问权限（管理员权限）
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
    const { 
      userId, 
      videoId, 
      accessType = 'GRANTED', 
      expiresAt 
    } = body;

    // 验证必填字段
    if (!userId || !videoId) {
      return NextResponse.json({ 
        error: 'User ID and Video ID are required' 
      }, { status: 400 });
    }

    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    // 检查视频是否存在
    const video = await prisma.video.findUnique({
      where: { id: videoId }
    });

    if (!video) {
      return NextResponse.json({ 
        error: 'Video not found' 
      }, { status: 404 });
    }

    // 检查是否已存在访问权限
    const existingAccess = await prisma.videoAccess.findFirst({
      where: {
        userId,
        videoId
      }
    });

    if (existingAccess) {
      // 更新现有访问权限
      const updatedAccess = await prisma.videoAccess.update({
        where: { id: existingAccess.id },
        data: {
          accessType: accessType.toUpperCase(),
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          isActive: true,
          updatedAt: new Date()
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          video: {
            select: {
              id: true,
              title: true
            }
          }
        }
      });

      return NextResponse.json({
        message: 'Video access updated successfully',
        videoAccess: {
          id: updatedAccess.id,
          userId: updatedAccess.user.id,
          userName: updatedAccess.user.name,
          userEmail: updatedAccess.user.email,
          videoId: updatedAccess.video.id,
          videoTitle: updatedAccess.video.title,
          accessType: updatedAccess.accessType,
          grantedAt: updatedAccess.grantedAt,
          expiresAt: updatedAccess.expiresAt,
          isActive: updatedAccess.isActive
        }
      });
    } else {
      // 创建新的访问权限
      const newAccess = await prisma.videoAccess.create({
        data: {
          userId,
          videoId,
          accessType: accessType.toUpperCase(),
          grantedAt: new Date(),
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          isActive: true
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          video: {
            select: {
              id: true,
              title: true
            }
          }
        }
      });

      return NextResponse.json({
        message: 'Video access granted successfully',
        videoAccess: {
          id: newAccess.id,
          userId: newAccess.user.id,
          userName: newAccess.user.name,
          userEmail: newAccess.user.email,
          videoId: newAccess.video.id,
          videoTitle: newAccess.video.title,
          accessType: newAccess.accessType,
          grantedAt: newAccess.grantedAt,
          expiresAt: newAccess.expiresAt,
          isActive: newAccess.isActive
        }
      });
    }

  } catch (error) {
    console.error('Admin grant video access error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// 撤销视频访问权限（管理员权限）
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const accessId = searchParams.get('accessId');
    const userId = searchParams.get('userId');
    const videoId = searchParams.get('videoId');

    if (!accessId && (!userId || !videoId)) {
      return NextResponse.json({ 
        error: 'Access ID or User ID and Video ID are required' 
      }, { status: 400 });
    }

    let whereClause: Record<string, unknown> = {};
    
    if (accessId) {
      whereClause.id = accessId;
    } else {
      whereClause = {
        userId,
        videoId
      };
    }

    // 检查访问权限是否存在
    const existingAccess = await prisma.videoAccess.findFirst({
      where: whereClause
    });

    if (!existingAccess) {
      return NextResponse.json({ 
        error: 'Video access not found' 
      }, { status: 404 });
    }

    // 删除访问权限
    await prisma.videoAccess.delete({
      where: { id: existingAccess.id }
    });

    return NextResponse.json({
      message: 'Video access revoked successfully'
    });

  } catch (error) {
    console.error('Admin revoke video access error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
