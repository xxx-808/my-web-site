import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export async function POST(request: NextRequest) {
  try {
    // 简单的安全检查
    const { secret } = await request.json()
    
    if (secret !== process.env.NEXTAUTH_SECRET) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    const sql = neon(process.env.DATABASE_URL!)
    
    console.log('🚀 开始初始化数据库...')

    // 检查用户是否已存在
    const existingUsers = await sql`
      SELECT email FROM users 
      WHERE email IN ('admin@test.com', 'student@test.com')
    `
    
    if (existingUsers.length > 0) {
      return NextResponse.json({
        success: true,
        message: '数据库已初始化',
        existingUsers: existingUsers.map(u => u.email)
      })
    }

    // 创建测试用户
    console.log('👤 创建测试用户...')
    
    // 创建管理员
    await sql`
      INSERT INTO users (id, email, name, password, role, created_at, updated_at)
      VALUES (
        'admin_' || substr(md5(random()::text), 1, 8),
        'admin@test.com',
        '系统管理员',
        'admin123',
        'ADMIN',
        NOW(),
        NOW()
      )
    `
    
    // 创建学生
    await sql`
      INSERT INTO users (id, email, name, password, role, created_at, updated_at)
      VALUES (
        'student_' || substr(md5(random()::text), 1, 8),
        'student@test.com',
        '测试学生',
        'student123',
        'STUDENT',
        NOW(),
        NOW()
      )
    `

    // 创建听说读写视频分类
    console.log('📂 创建听说读写分类...')
    const categories = [
      { name: '雅思听力', description: '雅思听力技巧与练习，包括数字、时间、地点等关键信息捕获' },
      { name: '雅思口语', description: '雅思口语表达与练习，涵盖Part 1-3各部分应对策略' },
      { name: '雅思阅读', description: '雅思阅读理解与技巧，快速定位和理解文章核心信息' },
      { name: '雅思写作', description: '雅思写作技巧与范文，Task 1图表描述和Task 2议论文写作' }
    ]
    
    for (const category of categories) {
      await sql`
        INSERT INTO video_categories (id, name, description, created_at, updated_at)
        VALUES (
          'cat_' || substr(md5(random()::text), 1, 8),
          ${category.name},
          ${category.description},
          NOW(),
          NOW()
        )
        ON CONFLICT (name) DO NOTHING
      `
    }

    // 创建订阅计划（如果不存在）
    console.log('💳 创建订阅计划...')
    await sql`
      INSERT INTO subscription_plans (id, name, description, price, duration, access_level, created_at, updated_at)
      VALUES (
        'plan_' || substr(md5(random()::text), 1, 8),
        '免费体验',
        '免费观看基础级别课程',
        0,
        7,
        'BASIC',
        NOW(),
        NOW()
      )
      ON CONFLICT (name) DO NOTHING
    `

    await sql`
      INSERT INTO subscription_plans (id, name, description, price, duration, access_level, created_at, updated_at)
      VALUES (
        'plan_' || substr(md5(random()::text), 1, 8),
        '标准会员',
        '观看所有基础和高级课程',
        99.99,
        30,
        'PREMIUM',
        NOW(),
        NOW()
      )
      ON CONFLICT (name) DO NOTHING
    `

    // 验证创建结果
    const users = await sql`
      SELECT email, name, role FROM users 
      WHERE email IN ('admin@test.com', 'student@test.com')
    `

    const categoriesCount = await sql`
      SELECT COUNT(*) as count FROM video_categories
    `

    const plansCount = await sql`
      SELECT COUNT(*) as count FROM subscription_plans
    `

    console.log('✅ 数据库初始化完成')

    return NextResponse.json({
      success: true,
      message: '数据库初始化成功',
      data: {
        users: users,
        categoriesCount: parseInt(categoriesCount[0].count),
        plansCount: parseInt(plansCount[0].count)
      },
      testAccounts: {
        admin: 'admin@test.com / admin123',
        student: 'student@test.com / student123'
      }
    })

  } catch (error) {
    console.error('数据库初始化失败:', error)
    return NextResponse.json(
      { 
        error: '数据库初始化失败',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: '数据库初始化API',
    usage: 'POST请求，需要提供secret参数',
    note: '仅用于部署后的数据库初始化'
  })
}
