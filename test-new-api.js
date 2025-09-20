// 测试新的简化视频API
require('dotenv').config({ path: '.env.local' });

async function testNewAPI() {
  try {
    console.log('🔍 测试新的简化视频API...\n');
    
    // 1. 测试不带用户ID的API调用
    console.log('1. 测试不带用户ID的API调用...');
    const response1 = await fetch('http://localhost:3000/api/videos-simple');
    
    if (response1.ok) {
      const data1 = await response1.json();
      console.log('✅ API调用成功');
      console.log('视频数量:', data1.videos?.length || 0);
      console.log('调试信息:', data1.debug);
      
      if (data1.videos && data1.videos.length > 0) {
        console.log('\n📹 视频列表:');
        data1.videos.forEach((video, index) => {
          console.log(`${index + 1}. ${video.title}`);
          console.log(`   分类: ${video.category} (${video.categoryName})`);
          console.log(`   访问权限: ${video.canAccess ? '✅' : '❌'}`);
          console.log(`   访问级别: ${video.accessLevel}`);
          console.log('');
        });
      }
    } else {
      const errorText = await response1.text();
      console.log('❌ API调用失败:', response1.status, errorText);
    }
    
    // 2. 获取测试用户ID并测试带用户ID的API调用
    console.log('\n2. 获取测试用户ID...');
    const { neon } = require('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL);
    
    const testUser = await sql`
      SELECT id, email FROM users 
      WHERE email = 'student@test.com'
      LIMIT 1
    `;
    
    if (testUser.length > 0) {
      const userId = testUser[0].id;
      console.log('✅ 找到测试用户:', testUser[0].email, '(ID:', userId, ')');
      
      console.log('\n3. 测试带用户ID的API调用...');
      const response2 = await fetch(`http://localhost:3000/api/videos-simple?userId=${userId}`);
      
      if (response2.ok) {
        const data2 = await response2.json();
        console.log('✅ API调用成功');
        console.log('视频数量:', data2.videos?.length || 0);
        console.log('用户订阅:', data2.userSubscription?.planName || '无');
        console.log('调试信息:', data2.debug);
        
        if (data2.videos && data2.videos.length > 0) {
          console.log('\n📹 用户可访问的视频:');
          const accessibleVideos = data2.videos.filter(v => v.canAccess);
          console.log('可访问视频数量:', accessibleVideos.length);
          
          accessibleVideos.forEach((video, index) => {
            console.log(`${index + 1}. ${video.title}`);
            console.log(`   分类: ${video.category} (${video.categoryName})`);
            console.log(`   访问级别: ${video.accessLevel}`);
            console.log(`   URL: ${video.url ? video.url.substring(0, 50) + '...' : '无URL'}`);
            console.log('');
          });
          
          // 特别检查云存储视频
          const cloudVideo = data2.videos.find(v => v.url && v.url.includes('vercel-storage.com'));
          if (cloudVideo) {
            console.log('☁️ 找到云存储视频:');
            console.log('   标题:', cloudVideo.title);
            console.log('   分类:', cloudVideo.category);
            console.log('   可访问:', cloudVideo.canAccess ? '✅' : '❌');
          }
        }
      } else {
        const errorText = await response2.text();
        console.log('❌ API调用失败:', response2.status, errorText);
      }
    } else {
      console.log('❌ 未找到测试用户');
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
    console.error('详细错误:', error.message);
  }
}

testNewAPI();
