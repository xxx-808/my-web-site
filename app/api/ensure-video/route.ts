import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 确保用户视频存在于数据库...');
    
    const { neon } = require('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL!);
    
    const correctVideoUrl = 'https://32eqetnp69vf1ntv.public.blob.vercel-storage.com/video/841a11e088af31b2203caa7367d3b09d.mp4';
    
    // 1. 检查视频是否存在
    const existingVideo = await sql`
      SELECT id, title FROM videos WHERE url = ${correctVideoUrl}
    `;
    
    if (existingVideo.length === 0) {
      console.log('用户视频不存在，正在创建...');
      
      // 2. 获取或创建口语分类
      let speakingCategory = await sql`
        SELECT id FROM video_categories WHERE name = '雅思口语'
      `;
      
      if (speakingCategory.length === 0) {
        // 创建分类
        speakingCategory = await sql`
          INSERT INTO video_categories (id, name, description, created_at, updated_at)
          VALUES ('speaking_category', '雅思口语', '雅思口语练习和技巧', NOW(), NOW())
          RETURNING id
        `;
      }
      
      // 3. 删除所有其他视频
      await sql`DELETE FROM videos WHERE url != ${correctVideoUrl}`;
      
      // 4. 创建用户视频
      const newVideo = await sql`
        INSERT INTO videos (
          id, title, description, url, thumbnail, duration, 
          category_id, access_level, status, created_at, updated_at
        )
        VALUES (
          'video_user_speaking_final',
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
        RETURNING id, title
      `;
      
      return NextResponse.json({
        success: true,
        message: '视频创建成功',
        video: newVideo[0]
      });
    } else {
      return NextResponse.json({
        success: true,
        message: '视频已存在',
        video: existingVideo[0]
      });
    }
    
  } catch (error) {
    console.error('确保视频失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
