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
    const { watchTime, progress } = body;

    // 验证参数
    if (typeof watchTime !== 'number' || typeof progress !== 'number') {
      return NextResponse.json({ 
        error: 'Invalid parameters' 
      }, { status: 400 });
    }

    if (progress < 0 || progress > 1) {
      return NextResponse.json({ 
        error: 'Progress must be between 0 and 1' 
      }, { status: 400 });
    }

    // 更新或创建观看历史
    const watchHistory = await prisma.watchHistory.upsert({
      where: {
        userId_videoId: {
          userId: userId,
          videoId: videoId
        }
      },
      update: {
        watchTime: watchTime,
        progress: progress,
        lastWatched: new Date()
      },
      create: {
        userId: userId,
        videoId: videoId,
        watchTime: watchTime,
        progress: progress,
        lastWatched: new Date()
      }
    });

    return NextResponse.json({
      message: 'Progress updated successfully',
      data: {
        videoId: watchHistory.videoId,
        watchTime: watchHistory.watchTime,
        progress: watchHistory.progress,
        lastWatched: watchHistory.lastWatched
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
    const watchHistory = await prisma.watchHistory.findUnique({
      where: {
        userId_videoId: {
          userId: userId,
          videoId: videoId
        }
      }
    });

    if (!watchHistory) {
      return NextResponse.json({
        data: {
          videoId: videoId,
          watchTime: 0,
          progress: 0,
          lastWatched: null
        }
      });
    }

    return NextResponse.json({
      data: {
        videoId: watchHistory.videoId,
        watchTime: watchHistory.watchTime,
        progress: watchHistory.progress,
        lastWatched: watchHistory.lastWatched
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
