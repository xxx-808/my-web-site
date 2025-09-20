import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 配置上传限制
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];

export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const session = await getServerSession(authOptions);
    if (!session?.user?.userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.userId as string }
    });

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // 解析表单数据
    const formData = await request.formData();
    const file = formData.get('video') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }

    // 验证文件类型
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only MP4, WebM, QuickTime, and AVI are allowed.' 
      }, { status: 400 });
    }

    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.` 
      }, { status: 400 });
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${originalName}`;
    
    // 确保上传目录存在
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'videos');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // 保存文件
    const filePath = path.join(uploadDir, fileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    await writeFile(filePath, buffer);

    // 生成访问URL
    const fileUrl = `/uploads/videos/${fileName}`;

    // 返回文件信息
    return NextResponse.json({
      success: true,
      message: 'Video uploaded successfully',
      data: {
        fileName,
        originalName: file.name,
        size: file.size,
        type: file.type,
        url: fileUrl,
        uploadedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Video upload error:', error);
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// 获取上传配置信息
export async function GET() {
  return NextResponse.json({
    maxFileSize: MAX_FILE_SIZE,
    allowedTypes: ALLOWED_TYPES,
    maxFileSizeMB: Math.floor(MAX_FILE_SIZE / 1024 / 1024)
  });
}
