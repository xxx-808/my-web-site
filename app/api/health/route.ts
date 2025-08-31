import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🔍 开始健康检查...');
    
    // 测试数据库连接
    console.log('📊 测试数据库连接...');
    await prisma.$connect();
    console.log('✅ 数据库连接成功');
    
    // 测试基本查询
    console.log('📊 测试基本查询...');
    const userCount = await prisma.user.count();
    const categoryCount = await prisma.videoCategory.count();
    const videoCount = await prisma.video.count();
    
    console.log('✅ 查询测试成功');
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        status: 'connected',
        userCount,
        categoryCount,
        videoCount
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDatabaseUrl: !!process.env.DATABASE_URL
      }
    });
    
  } catch (error) {
    console.error('❌ 健康检查失败:', error);
    
    let errorMessage = 'Database connection failed';
    let statusCode = 503;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      if (error.message.includes('connect')) {
        statusCode = 503;
      } else if (error.message.includes('timeout')) {
        statusCode = 408;
      }
    }
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: statusCode });
    
  } finally {
    // 不要在这里断开连接，因为这是健康检查
    console.log('🏁 健康检查完成');
  }
}
