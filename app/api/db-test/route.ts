import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 检查环境变量
    const hasDatabaseUrl = !!process.env.DATABASE_URL;
    const hasNextAuthSecret = !!process.env.NEXTAUTH_SECRET;
    const hasNextAuthUrl = !!process.env.NEXTAUTH_URL;
    const hasInitSecret = !!process.env.INIT_SECRET;
    
    // 检查数据库URL格式
    const dbUrl = process.env.DATABASE_URL;
    const isPostgres = dbUrl?.startsWith('postgresql://');
    const isNeon = dbUrl?.includes('neon.tech');
    
    return NextResponse.json({
      message: 'Environment check',
      environment: process.env.NODE_ENV,
      variables: {
        DATABASE_URL: hasDatabaseUrl ? 'Set' : 'Missing',
        NEXTAUTH_SECRET: hasNextAuthSecret ? 'Set' : 'Missing',
        NEXTAUTH_URL: hasNextAuthUrl ? 'Set' : 'Missing',
        INIT_SECRET: hasInitSecret ? 'Set' : 'Missing',
      },
      database: {
        hasUrl: hasDatabaseUrl,
        isPostgres: isPostgres,
        isNeon: isNeon,
        urlPreview: dbUrl ? `${dbUrl.substring(0, 20)}...` : 'Not set',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Environment check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
