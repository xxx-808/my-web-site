import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 获取所有视频（管理员权限）
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
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const accessLevel = searchParams.get('accessLevel');

    // 构建查询条件
    const where: Record<string, unknown> = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category && category !== 'all') {
      where.category = { name: category };
    }

    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    if (accessLevel && accessLevel !== 'all') {
      where.accessLevel = accessLevel.toUpperCase();
    }

    // 计算分页
    const skip = (page - 1) * limit;

    // 获取视频列表
    const [videos, totalCount] = await Promise.all([
      prisma.video.findMany({
        where,
        include: {
          category: true,
          videoAccesses: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          watchHistory: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.video.count({ where })
    ]);

    // 处理视频数据
    const processedVideos = videos.map(video => ({
      id: video.id,
      title: video.title,
      description: video.description,
      category: {
        id: video.category.id,
        name: video.category.name,
        displayName: video.category.displayName
      },
      duration: video.duration,
      filePath: video.filePath,
      thumbnail: video.thumbnail,
      accessLevel: video.accessLevel,
      status: video.status,
      tags: video.tags,
      cognitiveObjectives: video.cognitiveObjectives,
      uploadDate: video.uploadDate,
      createdAt: video.createdAt,
      updatedAt: video.updatedAt,
      
      // 统计信息
      stats: {
        accessCount: video.videoAccesses.length,
        watchCount: video.watchHistory.length,
        totalWatchTime: video.watchHistory.reduce((total, history) => total + history.watchTime, 0),
        averageProgress: video.watchHistory.length > 0 
          ? video.watchHistory.reduce((total, history) => total + history.progress, 0) / video.watchHistory.length 
          : 0
      },

      // 访问用户
      accessUsers: video.videoAccesses.map(access => ({
        userId: access.user.id,
        userName: access.user.name,
        userEmail: access.user.email,
        accessType: access.accessType,
        grantedAt: access.grantedAt,
        expiresAt: access.expiresAt,
        isActive: access.isActive
      }))
    }));

    return NextResponse.json({
      videos: processedVideos,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Admin videos API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// 创建新视频（管理员权限）
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
      title, 
      description, 
      categoryId, 
      duration, 
      filePath, 
      thumbnail, 
      accessLevel, 
      tags, 
      cognitiveObjectives 
    } = body;

    // 验证必填字段
    if (!title || !description || !categoryId) {
      return NextResponse.json({ 
        error: 'Title, description, and category are required' 
      }, { status: 400 });
    }

    // 检查分类是否存在
    const category = await prisma.videoCategory.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return NextResponse.json({ 
        error: 'Category not found' 
      }, { status: 400 });
    }

    // 创建视频
    const newVideo = await prisma.video.create({
      data: {
        title,
        description,
        categoryId,
        duration: duration || '00:00',
        filePath: filePath || '',
        thumbnail: thumbnail || 'https://picsum.photos/id/1000/400/225',
        accessLevel: accessLevel?.toUpperCase() || 'BASIC',
        tags: tags || [],
        cognitiveObjectives: cognitiveObjectives || []
      },
      include: {
        category: true
      }
    });

    return NextResponse.json({
      message: 'Video created successfully',
      video: {
        id: newVideo.id,
        title: newVideo.title,
        description: newVideo.description,
        category: newVideo.category,
        accessLevel: newVideo.accessLevel,
        status: newVideo.status,
        createdAt: newVideo.createdAt
      }
    });

  } catch (error) {
    console.error('Admin create video error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// 更新视频（管理员权限）
export async function PUT(request: NextRequest) {
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
      id,
      title, 
      description, 
      categoryId, 
      duration, 
      filePath, 
      thumbnail, 
      accessLevel, 
      tags, 
      cognitiveObjectives,
      status
    } = body;

    // 验证必填字段
    if (!id) {
      return NextResponse.json({ 
        error: 'Video ID is required' 
      }, { status: 400 });
    }

    // 检查视频是否存在
    const existingVideo = await prisma.video.findUnique({
      where: { id }
    });

    if (!existingVideo) {
      return NextResponse.json({ 
        error: 'Video not found' 
      }, { status: 404 });
    }

    // 更新视频
    const updatedVideo = await prisma.video.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(categoryId && { categoryId }),
        ...(duration && { duration }),
        ...(filePath && { filePath }),
        ...(thumbnail && { thumbnail }),
        ...(accessLevel && { accessLevel: accessLevel.toUpperCase() }),
        ...(tags && { tags }),
        ...(cognitiveObjectives && { cognitiveObjectives }),
        ...(status && { status: status.toUpperCase() })
      },
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

// 删除视频（管理员权限）
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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ 
        error: 'Video ID is required' 
      }, { status: 400 });
    }

    // 检查视频是否存在
    const existingVideo = await prisma.video.findUnique({
      where: { id }
    });

    if (!existingVideo) {
      return NextResponse.json({ 
        error: 'Video not found' 
      }, { status: 404 });
    }

    // 删除相关的访问记录和观看历史
    await prisma.$transaction([
      prisma.videoAccess.deleteMany({
        where: { videoId: id }
      }),
      prisma.watchHistory.deleteMany({
        where: { videoId: id }
      }),
      prisma.video.delete({
        where: { id }
      })
    ]);

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
