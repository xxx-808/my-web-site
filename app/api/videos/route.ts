import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // 获取用户会话
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.userId) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const userId = session.user.userId as string;

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const accessLevel = searchParams.get('accessLevel');

    // 构建查询条件
    const where: Record<string, unknown> = {
      status: 'ACTIVE'
    };

    if (category) {
      where.category = { name: category };
    }

    if (accessLevel) {
      where.accessLevel = accessLevel.toUpperCase();
    }

    // 从数据库查询视频
    const videos = await prisma.video.findMany({
      where,
      include: {
        category: true,
        videoAccesses: {
          where: {
            userId: userId,
            OR: [
              { expiresAt: null },
              { expiresAt: { gte: new Date() } }
            ]
          }
        },
        watchHistories: {
          where: {
            userId: userId
          }
        }
      },
      orderBy: {
        uploadDate: 'desc'
      }
    });

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

    // 处理视频数据，添加访问权限信息
    const processedVideos = videos.map(video => {
      const hasDirectAccess = video.videoAccesses.length > 0;
      const hasSubscriptionAccess = userSubscription && 
        (video.accessLevel === 'BASIC' || 
         (video.accessLevel === 'PREMIUM' && userSubscription.plan.name === 'premium'));
      
      const canAccess = hasDirectAccess || hasSubscriptionAccess;
      const watchProgress = video.watchHistory[0]?.progress || 0;
      const lastWatched = video.watchHistory[0]?.lastWatched;

      return {
        id: video.id,
        title: video.title,
        description: video.description,
        category: video.category.name,
        categoryDisplayName: video.category.displayName,
        duration: video.duration,
        thumbnail: video.thumbnail,
        accessLevel: video.accessLevel,
        tags: video.tags,
        cognitiveObjectives: video.cognitiveObjectives,
        uploadDate: video.uploadDate,
        canAccess,
        watchProgress,
        lastWatched,
        // 访问权限详情
        accessInfo: {
          hasDirectAccess,
          hasSubscriptionAccess,
          subscriptionPlan: userSubscription?.plan.name || null,
          subscriptionExpiry: userSubscription?.endDate || null
        }
      };
    });

    return NextResponse.json({
      videos: processedVideos,
      userSubscription: userSubscription ? {
        planName: userSubscription.plan.name,
        planDescription: userSubscription.plan.description,
        startDate: userSubscription.startDate,
        endDate: userSubscription.endDate,
        status: userSubscription.status
      } : null
    });

  } catch (error) {
    console.error('Videos API error:', error);
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
