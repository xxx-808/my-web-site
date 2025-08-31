const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabaseConnection() {
  try {
    console.log('🔍 测试数据库连接...');
    
    // 测试连接
    await prisma.$connect();
    console.log('✅ 数据库连接成功');
    
    // 检查用户数量
    const userCount = await prisma.user.count();
    console.log(`📊 用户数量: ${userCount}`);
    
    // 检查视频数量
    const videoCount = await prisma.video.count();
    console.log(`📊 视频数量: ${videoCount}`);
    
    // 检查分类数量
    const categoryCount = await prisma.videoCategory.count();
    console.log(`📊 分类数量: ${categoryCount}`);
    
    // 检查订阅计划数量
    const planCount = await prisma.subscriptionPlan.count();
    console.log(`📊 订阅计划数量: ${planCount}`);
    
    // 列出所有用户
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
    
    console.log('👥 用户列表:');
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ${user.role}`);
    });
    
    // 列出所有分类
    const categories = await prisma.videoCategory.findMany({
      select: {
        id: true,
        name: true,
        displayName: true
      }
    });
    
    console.log('📚 分类列表:');
    categories.forEach(category => {
      console.log(`  - ${category.displayName} (${category.name})`);
    });
    
    console.log('🎉 数据库测试完成');
    
  } catch (error) {
    console.error('❌ 数据库测试失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();
