import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json()
    
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: '邮箱、密码和角色都是必填项' },
        { status: 400 }
      )
    }

    // 连接数据库
    const sql = neon(process.env.DATABASE_URL!)
    
    // 查询用户
    const users = await sql`
      SELECT id, email, name, password, role, created_at
      FROM users 
      WHERE email = ${email} AND role = ${role}
      LIMIT 1
    `
    
    if (users.length === 0) {
      return NextResponse.json(
        { error: '用户不存在或角色不匹配' },
        { status: 401 }
      )
    }
    
    const user = users[0]
    
    // 简单的密码验证（实际项目中应该使用加密对比）
    if (user.password !== password) {
      return NextResponse.json(
        { error: '密码错误' },
        { status: 401 }
      )
    }
    
    // 如果是学生，获取订阅信息
    let subscription = null
    if (role === 'STUDENT') {
      try {
        const subscriptions = await sql`
          SELECT s.*, sp.name as plan_name, sp.access_level
          FROM subscriptions s
          JOIN subscription_plans sp ON s.plan_id = sp.id
          WHERE s.user_id = ${user.id} AND s.status = 'ACTIVE'
          ORDER BY s.created_at DESC
          LIMIT 1
        `
        
        if (subscriptions.length > 0) {
          subscription = {
            planName: subscriptions[0].plan_name,
            accessLevel: subscriptions[0].access_level,
            startDate: subscriptions[0].start_date,
            endDate: subscriptions[0].end_date,
            status: subscriptions[0].status
          }
        }
      } catch (error) {
        console.log('获取订阅信息失败，但登录继续:', error)
      }
    }
    
    // 返回用户信息（不包含密码）
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscription
      }
    })
    
  } catch (error) {
    console.error('登录API错误:', error)
    return NextResponse.json(
      { error: '登录失败，请稍后重试' },
      { status: 500 }
    )
  }
}
