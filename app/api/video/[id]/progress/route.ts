import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: videoId } = await context.params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const userId = session.user.id as string;
    const body = await request.json();
    const { progress } = body;

    // 验证参数
    if (typeof progress !== 'number') {
      return NextResponse.json({ 
        error: 'Progress must be a number' 
      }, { status: 400 });
    }

    if (progress < 0 || progress > 1) {
      return NextResponse.json({ 
        error: 'Progress must be between 0 and 1' 
      }, { status: 400 });
    }

    // 查找现有观看历史
    let watchHistory = await prisma.watchHistory.findFirst({
      where: {
        userId: userId,
        videoId: videoId
      }
    });

    if (watchHistory) {
      // 更新现有记录
      watchHistory = await prisma.watchHistory.update({
        where: { id: watchHistory.id },
        data: {
          progress: progress,
          watchedAt: new Date()
        }
      });
    } else {
      // 创建新记录
      watchHistory = await prisma.watchHistory.create({
        data: {
          userId: userId,
          videoId: videoId,
          progress: progress,
          watchedAt: new Date()
        }
      });
    }

    return NextResponse.json({
      message: 'Progress updated successfully',
      data: {
        videoId: watchHistory.videoId,
        progress: watchHistory.progress,
        watchedAt: watchHistory.watchedAt
      }
    });

  } catch (error) {
    console.error('Progress update error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// 获取观看进度
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: videoId } = await context.params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const userId = session.user.id as string;

    // 获取观看历史
    const watchHistory = await prisma.watchHistory.findFirst({
      where: {
        userId: userId,
        videoId: videoId
      }
    });

    if (!watchHistory) {
      return NextResponse.json({
              data: {
        videoId: videoId,
        progress: 0,
        watchedAt: null
      }
      });
    }

    return NextResponse.json({
      data: {
        videoId: watchHistory.videoId,
        progress: watchHistory.progress,
        watchedAt: watchHistory.watchedAt
      }
    });

  } catch (error) {
    console.error('Progress fetch error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// 禁用其他HTTP方法
export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
