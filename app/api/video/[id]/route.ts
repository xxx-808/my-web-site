import { NextRequest, NextResponse } from 'next/server';

// 模拟视频数据库
const videoDatabase = {
  'ielts-writing-task1': {
    title: '雅思写作 Task 1 - 图表描述技巧',
    filePath: '/videos/ielts-writing-task1.mp4', // 实际部署时改为真实视频路径
    accessControl: {
      allowedIPs: ['192.168.1.100', '127.0.0.1'], // 允许的IP地址
      expiresAt: '2025-12-31T23:59:59Z',
      allowDownload: false,
      allowScreenRecord: false,
    }
  },
  'ielts-speaking-part2': {
    title: '雅思口语 Part 2 - 话题展开策略',
    filePath: '/videos/ielts-speaking-part2.mp4',
    accessControl: {
      allowedIPs: ['192.168.1.100', '127.0.0.1'],
      expiresAt: '2025-12-31T23:59:59Z',
      allowDownload: false,
      allowScreenRecord: false,
    }
  },
  'ielts-reading-skills': {
    title: '雅思阅读 - 快速定位与理解技巧',
    filePath: '/videos/ielts-reading-skills.mp4',
    accessControl: {
      allowedIPs: ['192.168.1.100', '127.0.0.1'],
      expiresAt: '2025-12-31T23:59:59Z',
      allowDownload: false,
      allowScreenRecord: false,
    }
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = params.id;
    const video = videoDatabase[videoId as keyof typeof videoDatabase];

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // 获取客户端IP地址
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    '127.0.0.1';

    // 检查IP权限
    if (!video.accessControl.allowedIPs.includes(clientIP)) {
      return NextResponse.json({ 
        error: 'Access denied. IP not authorized.' 
      }, { status: 403 });
    }

    // 检查访问权限是否过期
    const now = new Date();
    const expiresAt = new Date(video.accessControl.expiresAt);
    if (now > expiresAt) {
      return NextResponse.json({ 
        error: 'Access expired' 
      }, { status: 403 });
    }

    // 检查Range请求（支持视频流式播放）
    const range = request.headers.get('range');
    
    if (range) {
      // 处理Range请求，支持视频流式播放
      // 这里简化处理，实际部署时需要读取真实视频文件
      const videoSize = 1024 * 1024 * 100; // 假设视频100MB
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : videoSize - 1;
      const chunksize = (end - start) + 1;

      const headers = {
        'Content-Range': `bytes ${start}-${end}/${videoSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize.toString(),
        'Content-Type': 'video/mp4',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        // 防下载头部
        'Content-Disposition': 'inline',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
      };

      // 返回206状态码和部分内容
      return new NextResponse(null, {
        status: 206,
        headers,
      });
    }

    // 如果没有Range请求，返回完整视频（不推荐，会消耗大量带宽）
    const headers = {
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      // 防下载头部
      'Content-Disposition': 'inline',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    };

    // 实际部署时，这里应该返回真实的视频文件流
    // 现在返回一个占位响应
    return new NextResponse('Video stream placeholder', {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Video API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// 禁用其他HTTP方法
export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
