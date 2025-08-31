import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    // 获取用户会话
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const userId = session.user.id as string;

    // 从数据库查询视频
    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        category: true,
        videoAccesses: {
          where: {
            userId: userId,
            isActive: true,
            OR: [
              { expiresAt: null },
              { expiresAt: { gte: new Date() } }
            ]
          }
        }
      }
    });

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // 检查视频状态
    if (video.status !== 'ACTIVE') {
      return NextResponse.json({ 
        error: 'Video is not available' 
      }, { status: 403 });
    }

    // 检查用户是否有访问权限
    const hasAccess = video.videoAccesses.length > 0;
    
    if (!hasAccess) {
      // 检查用户订阅状态
      const userSubscription = await prisma.subscription.findFirst({
        where: {
          userId: userId,
          status: 'ACTIVE',
          endDate: { gte: new Date() }
        },
        include: {
          plan: true
        }
      });

      if (!userSubscription) {
        return NextResponse.json({ 
          error: 'Subscription required to access this video' 
        }, { status: 403 });
      }

      // 检查订阅计划是否满足视频访问级别要求
      if (video.accessLevel === 'PREMIUM' && userSubscription.plan.name !== 'premium') {
        return NextResponse.json({ 
          error: 'Premium subscription required for this video' 
        }, { status: 403 });
      }
    }

    // 获取客户端IP地址（保留用于日志记录）
    const _clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1';

    // 记录观看历史
    try {
      await prisma.watchHistory.upsert({
        where: {
          userId_videoId: {
            userId: userId,
            videoId: video.id
          }
        },
        update: {
          lastWatched: new Date()
        },
        create: {
          userId: userId,
          videoId: video.id,
          watchTime: 0,
          progress: 0
        }
      });
    } catch (error) {
      console.error('Failed to update watch history:', error);
    }

    // 检查Range请求（支持视频流式播放）
    const range = request.headers.get('range');
    
    if (range) {
      // 处理Range请求，支持视频流式播放
      // 这里简化处理，实际部署时需要读取真实视频文件
      const videoSize = 1024 * 1024 * 100; // 假设视频100MB
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : videoSize - 1;
      const chunksize = (end - start) + 1;

      const headers = {
        'Content-Range': `bytes ${start}-${end}/${videoSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize.toString(),
        'Content-Type': 'video/mp4',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        // 防下载头部
        'Content-Disposition': 'inline',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
      } as Record<string, string>;

      // 返回206状态码和部分内容
      return new NextResponse(null, {
        status: 206,
        headers,
      });
    }

    // 如果没有Range请求，返回完整视频（不推荐，会消耗大量带宽）
    const headers = {
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      // 防下载头部
      'Content-Disposition': 'inline',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    } as Record<string, string>;

    // 实际部署时，这里应该返回真实的视频文件流
    // 现在返回一个占位响应
    return new NextResponse('Video stream placeholder', {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Video API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// 禁用其他HTTP方法
export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
