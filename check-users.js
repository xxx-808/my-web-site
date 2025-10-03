const { neon } = require('@neondatabase/serverless');

async function checkUsers() {
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    console.log('🔍 查询数据库中的用户...\n');
    
    // 查询所有用户
    const users = await sql`
      SELECT 
        id, 
        email, 
        name, 
        role, 
        created_at,
        updated_at
      FROM users 
      ORDER BY created_at DESC
    `;
    
    console.log(`📊 找到 ${users.length} 个用户:\n`);
    
    if (users.length === 0) {
      console.log('❌ 数据库中没有用户');
      return;
    }
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. 用户信息:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   邮箱: ${user.email}`);
      console.log(`   姓名: ${user.name || '未设置'}`);
      console.log(`   角色: ${user.role}`);
      console.log(`   创建时间: ${user.created_at}`);
      console.log(`   更新时间: ${user.updated_at}`);
      console.log('   ' + '-'.repeat(50));
    });
    
    // 统计角色分布
    const roleStats = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n📈 角色统计:');
    Object.entries(roleStats).forEach(([role, count]) => {
      console.log(`   ${role}: ${count} 人`);
    });
    
    // 查询用户订阅信息
    console.log('\n💳 用户订阅信息:');
    const subscriptions = await sql`
      SELECT 
        u.email,
        u.name,
        s.status as subscription_status,
        p.name as plan_name,
        s.start_date,
        s.end_date
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id
      LEFT JOIN subscription_plans p ON s.plan_id = p.id
      ORDER BY u.created_at DESC
    `;
    
    subscriptions.forEach((sub, index) => {
      console.log(`${index + 1}. ${sub.email} (${sub.name || '未设置'})`);
      if (sub.subscription_status) {
        console.log(`   订阅状态: ${sub.subscription_status}`);
        console.log(`   订阅计划: ${sub.plan_name}`);
        console.log(`   开始时间: ${sub.start_date}`);
        console.log(`   结束时间: ${sub.end_date}`);
      } else {
        console.log(`   订阅状态: 无订阅`);
      }
      console.log('   ' + '-'.repeat(40));
    });
    
  } catch (error) {
    console.error('❌ 查询用户失败:', error);
  }
}

checkUsers();
