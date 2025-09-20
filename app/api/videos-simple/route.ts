import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('📹 简化版视频API被调用');

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const accessLevel = searchParams.get('accessLevel');
    const userId = searchParams.get('userId'); // 从前端传递用户ID

    console.log('查询参数:', { category, accessLevel, userId });

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

    // 从数据库查询视频（使用原生SQL避免Prisma字段映射问题）
    console.log('查询数据库视频...');
    const { neon } = require('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL!);
    
    // 如果没有云存储视频，先创建一个
    const correctVideoUrl = 'https://32eqetnp69vf1ntv.public.blob.vercel-storage.com/video/841a11e088af31b2203caa7367d3b09d.mp4';
    
    // 检查是否存在正确的视频
    const existingVideo = await sql`
      SELECT id FROM videos WHERE url = ${correctVideoUrl}
    `;
    
    if (existingVideo.length === 0) {
      console.log('用户视频不存在，正在创建...');
      
      // 获取口语分类
      const speakingCategory = await sql`
        SELECT id FROM video_categories WHERE name = '雅思口语'
      `;
      
      if (speakingCategory.length > 0) {
        // 先删除所有其他视频
        await sql`DELETE FROM videos WHERE url != ${correctVideoUrl}`;
        
        // 创建用户的真实视频
        await sql`
          INSERT INTO videos (
            id, title, description, url, thumbnail, duration, 
            category_id, access_level, status, created_at, updated_at
          )
          VALUES (
            'video_user_real',
            '雅思口语实战练习',
            '雅思口语Part 1-3全面练习，包含常见话题和答题技巧',
            ${correctVideoUrl},
            'https://picsum.photos/800/450?random=speaking',
            1800,
            ${speakingCategory[0].id},
            'BASIC',
            'ACTIVE',
            NOW(),
            NOW()
          )
        `;
        console.log('✅ 已创建用户真实视频');
      }
    }
    
    // 查询所有活跃视频（现在应该只有用户的真实视频）
    const videos = await sql`
      SELECT 
        v.id, v.title, v.description, v.url, v.thumbnail, v.duration, 
        v.category_id, v.access_level, v.status, v.created_at, v.updated_at,
        c.name as category_name, c.description as category_description
      FROM videos v
      LEFT JOIN video_categories c ON v.category_id = c.id
      WHERE v.status = 'ACTIVE'
      ORDER BY v.created_at DESC
    `;

    console.log('找到视频数量:', videos.length);

    // 检查用户订阅状态（如果提供了userId）
    let userSubscription = null;
    if (userId) {
      const subscriptionResult = await sql`
        SELECT s.id, s.status, s.start_date, s.end_date, 
               p.name as plan_name, p.description as plan_description
        FROM subscriptions s
        JOIN subscription_plans p ON s.plan_id = p.id
        WHERE s.user_id = ${userId} AND s.status = 'ACTIVE' AND s.end_date >= NOW()
        LIMIT 1
      `;
      
      if (subscriptionResult.length > 0) {
        const sub = subscriptionResult[0];
        userSubscription = {
          plan: {
            name: sub.plan_name,
            description: sub.plan_description
          },
          status: sub.status,
          startDate: sub.start_date,
          endDate: sub.end_date
        };
      }
      console.log('用户订阅状态:', userSubscription ? userSubscription.plan.name : '无订阅');
    }

    // 分类映射配置
    const categoryMapping: Record<string, string> = {
      '雅思听力': 'listening',
      '雅思口语': 'speaking', 
      '雅思阅读': 'reading',
      '雅思写作': 'writing'
    };

    // 处理视频数据，所有视频对所有人开放
    const processedVideos = videos.map(video => {
      // 所有视频都可以访问，不需要权限验证
      const canAccess = true;
      
      // 映射分类名称到代码
      const categoryCode = categoryMapping[video.category_name] || 'other';

      return {
        id: video.id,
        title: video.title,
        description: video.description,
        category: categoryCode, // 使用映射后的分类代码
        categoryName: video.category_name, // 保留原始分类名称
        duration: video.duration,
        thumbnail: video.thumbnail,
        accessLevel: video.access_level ? video.access_level.toLowerCase() : 'basic', // 转换为小写以匹配前端
        canAccess,
        watchProgress: 0, // 简化：暂时不查询观看进度
        lastWatched: null, // 简化：暂时不查询观看历史
        url: video.url, // 包含视频URL
        // 访问权限详情
        accessInfo: {
          hasDirectAccess: false,
          hasSubscriptionAccess,
          subscriptionPlan: userSubscription?.plan.name || null,
          subscriptionExpiry: userSubscription?.endDate || null
        }
      };
    });

    console.log('处理后的视频数量:', processedVideos.length);
    console.log('视频详情:', processedVideos.map(v => ({ title: v.title, category: v.category, canAccess: v.canAccess })));

    return NextResponse.json({
      videos: processedVideos,
      userSubscription: userSubscription ? {
        planName: userSubscription.plan.name,
        planDescription: userSubscription.plan.description,
        startDate: userSubscription.startDate,
        endDate: userSubscription.endDate,
        status: userSubscription.status
      } : null,
      debug: {
        totalVideos: videos.length,
        userId: userId,
        hasSubscription: !!userSubscription
      }
    });

  } catch (error) {
    console.error('简化视频API错误:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
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
