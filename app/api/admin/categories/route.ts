import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 获取所有视频分类
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // 验证管理员权限
    if (!session?.user?.userId) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.userId as string }
    });

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ 
        error: 'Admin access required' 
      }, { status: 403 });
    }

    // 获取所有分类
    const categories = await prisma.videoCategory.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({
      categories: categories
    });

  } catch (error) {
    console.error('Admin categories API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// 创建新分类
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // 验证管理员权限
    if (!session?.user?.userId) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.userId as string }
    });

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ 
        error: 'Admin access required' 
      }, { status: 403 });
    }

    const body = await request.json();
    const { name, description } = body;

    // 验证必填字段
    if (!name) {
      return NextResponse.json({ 
        error: 'Name is required' 
      }, { status: 400 });
    }

    // 检查名称是否已存在
    const existingCategory = await prisma.videoCategory.findUnique({
      where: { name }
    });

    if (existingCategory) {
      return NextResponse.json({ 
        error: 'Category with this name already exists' 
      }, { status: 400 });
    }

    // 创建分类
    const newCategory = await prisma.videoCategory.create({
      data: {
        name,
        description: description || ''
      }
    });

    return NextResponse.json({
      message: 'Category created successfully',
      category: newCategory
    });

  } catch (error) {
    console.error('Admin create category error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
