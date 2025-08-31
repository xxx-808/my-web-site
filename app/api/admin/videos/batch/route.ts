import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 批量操作视频（管理员权限）
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
    const { operation, videoIds } = body;

    // 验证必填字段
    if (!operation || !videoIds || !Array.isArray(videoIds) || videoIds.length === 0) {
      return NextResponse.json({ 
        error: 'Operation and video IDs are required' 
      }, { status: 400 });
    }

    // 检查视频是否存在
    const existingVideos = await prisma.video.findMany({
      where: {
        id: { in: videoIds }
      }
    });

    if (existingVideos.length !== videoIds.length) {
      return NextResponse.json({ 
        error: 'Some videos not found' 
      }, { status: 404 });
    }

    let result;

    switch (operation) {
      case 'delete':
        // 批量删除视频（包括相关的访问记录和观看历史）
        result = await prisma.$transaction(async (tx) => {
          // 删除相关的访问记录
          await tx.videoAccess.deleteMany({
            where: { videoId: { in: videoIds } }
          });

          // 删除相关的观看历史
          await tx.watchHistory.deleteMany({
            where: { videoId: { in: videoIds } }
          });

          // 删除视频
          const deletedVideos = await tx.video.deleteMany({
            where: { id: { in: videoIds } }
          });

          return { deletedCount: deletedVideos.count };
        });
        break;

      case 'activate':
        // 批量激活视频
        result = await prisma.video.updateMany({
          where: { id: { in: videoIds } },
          data: { status: 'ACTIVE' }
        });
        break;

      case 'deactivate':
        // 批量停用视频
        result = await prisma.video.updateMany({
          where: { id: { in: videoIds } },
          data: { status: 'INACTIVE' }
        });
        break;

      default:
        return NextResponse.json({ 
          error: 'Invalid operation' 
        }, { status: 400 });
    }

    return NextResponse.json({
      message: `Batch ${operation} completed successfully`,
      result
    });

  } catch (error) {
    console.error('Admin batch video operation error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
