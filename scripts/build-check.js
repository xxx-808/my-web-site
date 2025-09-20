// Vercel构建检查脚本
// 确保环境变量正确配置

console.log('🔍 检查构建环境...');
console.log('='.repeat(50));

// 检查关键环境变量
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL'
];

let allEnvVarsPresent = true;

console.log('📋 环境变量检查:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`);
  } else {
    console.log(`❌ ${varName}: 未设置`);
    allEnvVarsPresent = false;
  }
});

// 检查数据库URL格式
const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  console.log('\n🗄️ 数据库配置检查:');
  if (dbUrl.startsWith('postgresql://')) {
    console.log('✅ PostgreSQL 数据库配置正确');
  } else if (dbUrl.startsWith('file:')) {
    console.log('⚠️ 检测到SQLite配置，但应该使用PostgreSQL');
    console.log('💡 请确保Vercel环境变量中设置了正确的PostgreSQL连接字符串');
  } else {
    console.log('❌ 数据库URL格式不正确');
  }
}

console.log('\n🏗️ 构建环境信息:');
console.log(`Node.js版本: ${process.version}`);
console.log(`平台: ${process.platform}`);
console.log(`环境: ${process.env.NODE_ENV || 'development'}`);

if (process.env.VERCEL) {
  console.log('✅ 在Vercel环境中构建');
  console.log(`Vercel URL: ${process.env.VERCEL_URL || '未设置'}`);
} else {
  console.log('🏠 在本地环境中构建');
}

console.log('\n' + '='.repeat(50));

if (allEnvVarsPresent) {
  console.log('✅ 环境变量检查通过，可以继续构建');
  process.exit(0);
} else {
  console.log('❌ 环境变量检查失败，请检查Vercel环境变量配置');
  console.log('\n💡 解决方案:');
  console.log('1. 登录Vercel Dashboard');
  console.log('2. 进入项目设置 > Environment Variables');
  console.log('3. 添加缺失的环境变量');
  console.log('4. 重新部署项目');
  process.exit(1);
}
