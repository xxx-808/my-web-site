// 检查数据库实际结构
require('dotenv').config({ path: '.env.local' });

const { neon } = require('@neondatabase/serverless');

async function checkDBStructure() {
  try {
    console.log('🔍 检查数据库实际结构...\n');
    
    const sql = neon(process.env.DATABASE_URL);
    
    // 1. 检查videos表的结构
    console.log('1. 检查videos表结构...');
    const videoColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'videos'
      ORDER BY ordinal_position
    `;
    
    console.log('videos表字段:');
    videoColumns.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // 2. 检查video_categories表的结构
    console.log('\n2. 检查video_categories表结构...');
    const categoryColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'video_categories'
      ORDER BY ordinal_position
    `;
    
    console.log('video_categories表字段:');
    categoryColumns.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // 3. 检查实际的视频数据
    console.log('\n3. 检查实际的视频数据...');
    const videos = await sql`
      SELECT id, title, category_id, access_level, status
      FROM videos 
      LIMIT 5
    `;
    
    console.log('视频数据示例:');
    videos.forEach((video, index) => {
      console.log(`${index + 1}. ${video.title}`);
      console.log(`   category_id: ${video.category_id}`);
      console.log(`   access_level: ${video.access_level}`);
      console.log(`   status: ${video.status}`);
      console.log('');
    });
    
    // 4. 检查分类数据
    console.log('4. 检查分类数据...');
    const categories = await sql`
      SELECT id, name FROM video_categories
    `;
    
    console.log('分类数据:');
    categories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} (ID: ${cat.id})`);
    });
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
    console.error('详细错误:', error.message);
  }
}

checkDBStructure();
