// 直接测试API接口
require('dotenv').config({ path: '.env.local' });

async function testAPI() {
  try {
    console.log('🔍 测试视频API接口...\n');
    
    // 1. 测试登录API
    console.log('1. 测试登录API...');
    const loginResponse = await fetch('https://my-web-site-xi-puce.vercel.app/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'student@test.com',
        password: 'student123',
        role: 'STUDENT'
      })
    });
    
    if (!loginResponse.ok) {
      console.log('❌ 登录失败:', loginResponse.status, loginResponse.statusText);
      const errorText = await loginResponse.text();
      console.log('错误详情:', errorText);
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ 登录成功:', loginData.user?.email);
    
    // 2. 获取session cookie（模拟浏览器行为）
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('🍪 Cookie信息:', cookies ? '已获取' : '未获取');
    
    // 3. 测试视频API（需要认证）
    console.log('\n2. 测试视频API...');
    
    // 这里需要模拟NextAuth的session，但直接测试可能有困难
    // 让我们先检查API是否能正常响应
    const videoResponse = await fetch('https://my-web-site-xi-puce.vercel.app/api/videos', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 注意：这里可能需要session信息
      }
    });
    
    console.log('视频API状态码:', videoResponse.status);
    
    if (videoResponse.ok) {
      const videoData = await videoResponse.json();
      console.log('✅ 视频API响应成功');
      console.log('视频数量:', videoData.videos?.length || 0);
      
      if (videoData.videos && videoData.videos.length > 0) {
        console.log('\n📹 视频列表:');
        videoData.videos.forEach((video, index) => {
          console.log(`${index + 1}. ${video.title}`);
          console.log(`   分类: ${video.category}`);
          console.log(`   访问权限: ${video.canAccess ? '✅' : '❌'}`);
          console.log('');
        });
      } else {
        console.log('⚠️ API返回的视频列表为空');
      }
      
      if (videoData.userSubscription) {
        console.log('👤 用户订阅信息:', videoData.userSubscription.planName);
      } else {
        console.log('❌ 未找到用户订阅信息');
      }
      
    } else {
      const errorText = await videoResponse.text();
      console.log('❌ 视频API失败:', errorText);
      
      if (videoResponse.status === 401) {
        console.log('🔐 认证问题：API需要有效的session');
      }
    }
    
    // 4. 测试不需要认证的健康检查
    console.log('\n3. 测试健康检查...');
    try {
      const healthResponse = await fetch('https://my-web-site-xi-puce.vercel.app/api/health', {
        method: 'GET'
      });
      console.log('健康检查状态:', healthResponse.status);
    } catch (error) {
      console.log('健康检查接口不存在，这是正常的');
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
    console.error('错误详情:', error.message);
  }
}

testAPI();
