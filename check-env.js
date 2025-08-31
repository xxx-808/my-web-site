console.log('🔍 检查环境变量配置...\n');

// 检查必要的环境变量
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL'
];

console.log('📋 必需的环境变量:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${varName}: 未设置`);
  }
});

console.log('\n🔧 其他环境变量:');
console.log(`NODE_ENV: ${process.env.NODE_ENV || '未设置'}`);
console.log(`PORT: ${process.env.PORT || '未设置'}`);

// 检查数据库URL格式
const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  if (dbUrl.startsWith('postgresql://')) {
    console.log('✅ DATABASE_URL 格式正确 (PostgreSQL)');
  } else if (dbUrl.startsWith('mysql://')) {
    console.log('✅ DATABASE_URL 格式正确 (MySQL)');
  } else if (dbUrl.startsWith('sqlite://')) {
    console.log('✅ DATABASE_URL 格式正确 (SQLite)');
  } else {
    console.log('⚠️ DATABASE_URL 格式可能不正确');
  }
}

console.log('\n📁 当前工作目录:', process.cwd());
console.log('🏁 环境检查完成');
