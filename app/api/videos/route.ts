import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { neon } = require('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL!);
    
    const correctVideoUrl = 'https://32eqetnp69vf1ntv.public.blob.vercel-storage.com/video/841a11e088af31b2203caa7367d3b09d.mp4';
    
    // 确保口语分类存在
    let speakingCategory = await sql`
      SELECT id FROM video_categories WHERE name = '雅思口语'
    `;
    
    if (speakingCategory.length === 0) {
      speakingCategory = await sql`
        INSERT INTO video_categories (id, name, description, created_at, updated_at)
        VALUES ('speaking_cat', '雅思口语', '雅思口语练习', NOW(), NOW())
        RETURNING id
      `;
    }
    
    // 确保用户视频存在
    let userVideo = await sql`
      SELECT * FROM videos WHERE url = ${correctVideoUrl}
    `;
    
    if (userVideo.length === 0) {
      // 先清理其他视频
      await sql`DELETE FROM videos WHERE url != ${correctVideoUrl}`;
      
      // 创建用户视频
      userVideo = await sql`
        INSERT INTO videos (
          id, title, description, url, thumbnail, duration, 
          category_id, access_level, status, created_at, updated_at
        )
        VALUES (
          'user_video_1',
          '雅思口语实战练习',
          '雅思口语Part 1-3全面练习，包含常见话题和答题技巧',
          ${correctVideoUrl},
          'https://picsum.photos/800/450?random=1',
          1800,
          ${speakingCategory[0].id},
          'BASIC',
          'ACTIVE',
          NOW(),
          NOW()
        )
        RETURNING *
      `;
    }
    
    // 返回视频数据
    const videos = await sql`
      SELECT 
        v.id, v.title, v.description, v.url, v.thumbnail, v.duration,
        c.name as category_name
      FROM videos v
      LEFT JOIN video_categories c ON v.category_id = c.id
      WHERE v.status = 'ACTIVE'
    `;
    
    const processedVideos = videos.map(video => ({
      id: video.id,
      title: video.title,
      description: video.description,
      url: video.url,
      thumbnail: video.thumbnail,
      duration: video.duration,
      category: video.category_name === '雅思口语' ? 'speaking' : 'other'
    }));
    
    return NextResponse.json({
      success: true,
      videos: processedVideos
    });
    
  } catch (error) {
    console.error('视频API错误:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}