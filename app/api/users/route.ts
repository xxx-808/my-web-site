import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { neon } = require('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL!);
    
    console.log('🔍 查询数据库中的用户...');
    
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
    
    console.log(`📊 找到 ${users.length} 个用户`);
    
    // 查询用户订阅信息
    const subscriptions = await sql`
      SELECT 
        u.id as user_id,
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
    
    // 统计角色分布
    const roleStats = users.reduce((acc: any, user: any) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
    
    return NextResponse.json({
      success: true,
      totalUsers: users.length,
      users: users,
      subscriptions: subscriptions,
      roleStats: roleStats,
      summary: {
        total: users.length,
        roles: roleStats,
        withSubscriptions: subscriptions.filter((s: any) => s.subscription_status).length,
        withoutSubscriptions: subscriptions.filter((s: any) => !s.subscription_status).length
      }
    });
    
  } catch (error) {
    console.error('❌ 查询用户失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
