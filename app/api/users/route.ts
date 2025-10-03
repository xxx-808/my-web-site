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
    
    console.log(`📊 找到 ${subscriptions.length} 个订阅`);
    
    // 查询用户角色统计
    const roleStats = await sql`
      SELECT 
        role,
        COUNT(*) as count
      FROM users 
      GROUP BY role
      ORDER BY count DESC
    `;
    
    return NextResponse.json({
      success: true,
      data: {
        users: users,
        subscriptions: subscriptions,
        roleStats: roleStats,
        summary: {
          totalUsers: users.length,
          totalSubscriptions: subscriptions.length,
          roles: roleStats
        }
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
