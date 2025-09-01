import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 获取单个视频详情
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: videoId } = await context.params;
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

    // 获取视频详细信息
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        category: true,
        videoAccesses: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        },
        watchHistories: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            watchedAt: 'desc'
          }
        }
      }
    });

    if (!video) {
      return NextResponse.json({ 
        error: 'Video not found' 
      }, { status: 404 });
    }

    // 处理视频数据
    const videoData = {
      id: video.id,
      title: video.title,
      description: video.description,
      category: {
        id: video.category.id,
        name: video.category.name
      },
      duration: video.duration,
      url: video.url,
      thumbnail: video.thumbnail,
      accessLevel: video.accessLevel,
      status: video.status,
      createdAt: video.createdAt,
      updatedAt: video.updatedAt,

      // 访问权限详情
      videoAccesses: video.videoAccesses.map(access => ({
        id: access.id,
        user: access.user,
        accessType: access.accessType,
        grantedAt: access.grantedAt,
        expiresAt: access.expiresAt,
        isActive: !access.expiresAt || access.expiresAt > new Date()
      })),

      // 观看历史详情
      watchHistories: video.watchHistories.map(history => ({
        id: history.id,
        user: history.user,
        progress: history.progress,
        watchedAt: history.watchedAt
      })),

      // 统计信息
      stats: {
        totalAccess: video.videoAccesses.length,
        activeAccess: video.videoAccesses.filter(access => !access.expiresAt || access.expiresAt > new Date()).length,
        totalViews: video.watchHistories.length,
        uniqueViewers: [...new Set(video.watchHistories.map(h => h.userId))].length,
        totalWatchRecords: video.watchHistories.length,
        averageProgress: video.watchHistories.length > 0 
          ? video.watchHistories.reduce((total, history) => total + history.progress, 0) / video.watchHistories.length 
          : 0,
        completionRate: video.watchHistories.filter(h => h.progress >= 0.9).length / Math.max(video.watchHistories.length, 1)
      }
    };

    return NextResponse.json(videoData);

  } catch (error) {
    console.error('Admin video detail error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// 更新视频信息
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: videoId } = await context.params;
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
      title, 
      description, 
      categoryId, 
      duration, 
      filePath, 
      thumbnail, 
      accessLevel, 
      status,
      tags, 
      cognitiveObjectives 
    } = body;

    // 检查视频是否存在
    const existingVideo = await prisma.video.findUnique({
      where: { id: videoId }
    });

    if (!existingVideo) {
      return NextResponse.json({ 
        error: 'Video not found' 
      }, { status: 404 });
    }

    // 如果更新分类，检查分类是否存在
    if (categoryId) {
      const category = await prisma.videoCategory.findUnique({
        where: { id: categoryId }
      });

      if (!category) {
        return NextResponse.json({ 
          error: 'Category not found' 
        }, { status: 400 });
      }
    }

    // 更新视频信息
    const updateData: Record<string, unknown> = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (categoryId) updateData.categoryId = categoryId;
    if (duration) updateData.duration = duration;
    if (filePath) updateData.filePath = filePath;
    if (thumbnail) updateData.thumbnail = thumbnail;
    if (accessLevel) updateData.accessLevel = accessLevel.toUpperCase();
    if (status) updateData.status = status.toUpperCase();
    if (tags) updateData.tags = tags;
    if (cognitiveObjectives) updateData.cognitiveObjectives = cognitiveObjectives;

    const updatedVideo = await prisma.video.update({
      where: { id: videoId },
      data: updateData,
      include: {
        category: true
      }
    });

    return NextResponse.json({
      message: 'Video updated successfully',
      video: {
        id: updatedVideo.id,
        title: updatedVideo.title,
        description: updatedVideo.description,
        category: updatedVideo.category,
        accessLevel: updatedVideo.accessLevel,
        status: updatedVideo.status,
        updatedAt: updatedVideo.updatedAt
      }
    });

  } catch (error) {
    console.error('Admin update video error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// 删除视频
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: videoId } = await context.params;
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

    // 检查视频是否存在
    const existingVideo = await prisma.video.findUnique({
      where: { id: videoId }
    });

    if (!existingVideo) {
      return NextResponse.json({ 
        error: 'Video not found' 
      }, { status: 404 });
    }

    // 删除视频（Prisma会自动处理级联删除）
    await prisma.video.delete({
      where: { id: videoId }
    });

    return NextResponse.json({
      message: 'Video deleted successfully'
    });

  } catch (error) {
    console.error('Admin delete video error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
