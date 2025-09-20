// Vercel部署检查脚本
// 使用方法: node check-deployment.js https://your-app.vercel.app

const https = require('https');

const domain = process.argv[2] || 'https://my-web-site-xi-puce.vercel.app';

console.log('🚀 检查Vercel部署状态...');
console.log('域名:', domain);
console.log('='.repeat(50));

async function checkEndpoint(url, description) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    https.get(url, (res) => {
      const duration = Date.now() - startTime;
      const status = res.statusCode;
      
      if (status >= 200 && status < 300) {
        console.log(`✅ ${description}: ${status} (${duration}ms)`);
        resolve(true);
      } else {
        console.log(`❌ ${description}: ${status} (${duration}ms)`);
        resolve(false);
      }
    }).on('error', (err) => {
      const duration = Date.now() - startTime;
      console.log(`❌ ${description}: 连接失败 (${duration}ms) - ${err.message}`);
      resolve(false);
    });
  });
}

async function checkDeployment() {
  console.log('🔍 检查核心页面...');
  
  const checks = [
    [domain, '主页'],
    [domain + '/student-login', '学生登录页'],
    [domain + '/admin-login', '管理员登录页'],
    [domain + '/api/auth/login', '登录API'],
    [domain + '/api/init-database', '数据库初始化API']
  ];
  
  let successCount = 0;
  
  for (const [url, desc] of checks) {
    const success = await checkEndpoint(url, desc);
    if (success) successCount++;
    await new Promise(resolve => setTimeout(resolve, 500)); // 延迟500ms
  }
  
  console.log('\n📊 检查结果:');
  console.log('='.repeat(50));
  console.log(`✅ 成功: ${successCount}/${checks.length}`);
  console.log(`❌ 失败: ${checks.length - successCount}/${checks.length}`);
  
  if (successCount === checks.length) {
    console.log('\n🎉 部署检查通过！所有服务正常运行');
    console.log('\n📚 测试账户 (需要先初始化数据库):');
    console.log('管理员: admin@test.com / admin123');
    console.log('学生: student@test.com / student123');
    console.log('\n🔧 初始化数据库命令:');
    console.log(`curl -X POST ${domain}/api/init-database -H "Content-Type: application/json" -d '{"secret":"your-super-secret-key-change-this-in-production-2024"}'`);
  } else {
    console.log('\n⚠️ 部署可能存在问题，请检查Vercel控制台的错误日志');
  }
}

checkDeployment().catch(console.error);
