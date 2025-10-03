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
    
    // 查询用户订阅信息
    console.log('\n🔍 查询用户订阅信息...\n');
    
    const subscriptions = await sql`
      SELECT 
        s.id,
        s.user_id,
        s.status,
        s.start_date,
        s.end_date,
        u.email,
        u.name,
        p.name as plan_name,
        p.description as plan_description
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      JOIN subscription_plans p ON s.plan_id = p.id
      ORDER BY s.created_at DESC
    `;
    
    console.log(`📊 找到 ${subscriptions.length} 个订阅:\n`);
    
    if (subscriptions.length > 0) {
      subscriptions.forEach((sub, index) => {
        console.log(`${index + 1}. 订阅信息:`);
        console.log(`   订阅ID: ${sub.id}`);
        console.log(`   用户: ${sub.email} (${sub.name || '未设置'})`);
        console.log(`   计划: ${sub.plan_name}`);
        console.log(`   状态: ${sub.status}`);
        console.log(`   开始时间: ${sub.start_date}`);
        console.log(`   结束时间: ${sub.end_date}`);
        console.log(`   计划描述: ${sub.plan_description}`);
        console.log('   ' + '-'.repeat(50));
      });
    } else {
      console.log('❌ 没有找到订阅信息');
    }
    
    // 查询用户角色统计
    console.log('\n📈 用户角色统计:\n');
    
    const roleStats = await sql`
      SELECT 
        role,
        COUNT(*) as count
      FROM users 
      GROUP BY role
      ORDER BY count DESC
    `;
    
    roleStats.forEach(stat => {
      console.log(`   ${stat.role}: ${stat.count} 人`);
    });
    
  } catch (error) {
    console.error('❌ 查询用户失败:', error);
  }
}

checkUsers();
