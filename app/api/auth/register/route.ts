import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();
    
    // 验证必填字段
    if (!email || !password || !name) {
      return NextResponse.json({
        success: false,
        error: '邮箱、密码和姓名都是必填项'
      }, { status: 400 });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        error: '请输入有效的邮箱地址'
      }, { status: 400 });
    }

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        error: '密码至少需要6位字符'
      }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // 检查邮箱是否已存在
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser.length > 0) {
      return NextResponse.json({
        success: false,
        error: '该邮箱已被注册，请使用其他邮箱或直接登录'
      }, { status: 409 });
    }

    // 生成用户ID
    const userId = 'user_' + Math.random().toString(36).substr(2, 9);
    
    // 创建新用户
    const newUser = await sql`
      INSERT INTO users (
        id, 
        email, 
        name, 
        password, 
        role, 
        created_at, 
        updated_at
      )
      VALUES (
        ${userId},
        ${email},
        ${name},
        ${password}, -- 注意：实际项目中应该加密密码
        'STUDENT',
        NOW(),
        NOW()
      )
      RETURNING id, email, name, role, created_at
    `;

    if (newUser.length === 0) {
      throw new Error('用户创建失败');
    }

    const user = newUser[0];

    console.log('✅ 新用户注册成功:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });

    return NextResponse.json({
      success: true,
      message: '注册成功！',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('注册API错误:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '注册失败，请稍后重试'
    }, { status: 500 });
  }
}
