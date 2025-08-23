// app/api/video/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

// （如需使用 Node 能力，请取消注释下一行，确保在 Node Runtime 运行，而非 Edge）
// export const runtime = "nodejs";

// 模拟视频数据库
const videoDatabase = {
  "ielts-writing-task1": {
    title: "雅思写作 Task 1 - 图表描述技巧",
    filePath: "/videos/ielts-writing-task1.mp4",
    accessControl: {
      allowedIPs: ["192.168.1.100", "127.0.0.1"],
      expiresAt: "2025-12-31T23:59:59Z",
      allowDownload: false,
      allowScreenRecord: false,
    },
  },
  "ielts-speaking-part2": {
    title: "雅思口语 Part 2 - 话题展开策略",
    filePath: "/videos/ielts-speaking-part2.mp4",
    accessControl: {
      allowedIPs: ["192.168.1.100", "127.0.0.1"],
      expiresAt: "2025-12-31T23:59:59Z",
      allowDownload: false,
      allowScreenRecord: false,
    },
  },
  "ielts-reading-skills": {
    title: "雅思阅读 - 快速定位与理解技巧",
    filePath: "/videos/ielts-reading-skills.mp4",
    accessControl: {
      allowedIPs: ["192.168.1.100", "127.0.0.1"],
      expiresAt: "2025-12-31T23:59:59Z",
      allowDownload: false,
      allowScreenRecord: false,
    },
  },
} as const;

export async function GET(
  request: NextRequest,
  // ⬇️ Next 15: params 是 Promise，需要 await
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ✅ 关键修复
    const video = videoDatabase[id as keyof typeof videoDatabase];

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // 获取客户端 IP（x-forwarded-for 可能是逗号分隔，取第一个）
    const xff = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const clientIP = (xff ? xff.split(",")[0].trim() : realIp) ?? "127.0.0.1";

    // 权限：IP 白名单
    if (!video.accessControl.allowedIPs.includes(clientIP)) {
      return NextResponse.json(
        { error: "Access denied. IP not authorized." },
        { status: 403 }
      );
    }

    // 权限：有效期
    if (new Date() > new Date(video.accessControl.expiresAt)) {
      return NextResponse.json({ error: "Access expired" }, { status: 403 });
    }

    // Range 支持（示例：未实际读取文件，仅作占位）
    const range = request.headers.get("range");
    const headers = new Headers({
      "Accept-Ranges": "bytes",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      "Content-Type": "video/mp4",
      "Content-Disposition": "inline", // 防止浏览器下载
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
    });

    if (range) {
      // 假设 100MB（仅演示；真实环境应读取文件并按 Range 返回流）
      const videoSize = 100 * 1024 * 1024;
      const match = /bytes=(\d*)-(\d*)/.exec(range);
      const start = match?.[1] ? parseInt(match[1], 10) : 0;
      const end = match?.[2]
        ? parseInt(match[2], 10)
        : Math.max(videoSize - 1, 0);

      if (Number.isNaN(start) || Number.isNaN(end) || start > end) {
        return NextResponse.json(
          { error: "Invalid Range" },
          {
            status: 416,
            headers: { "Content-Range": `bytes */${videoSize}` },
          }
        );
      }

      headers.set("Content-Range", `bytes ${start}-${end}/${videoSize}`);
      headers.set("Content-Length", String(end - start + 1));

      // 占位 206（实际应返回读取到的字节流）
      return new NextResponse(new Uint8Array(0), {
        status: 206,
        headers,
      });
    }

    // 无 Range 请求：返回完整内容（占位）
    headers.set("Content-Length", "0");
    return new NextResponse(new Uint8Array(0), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Video API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
export async function PUT() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
export async function DELETE() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
