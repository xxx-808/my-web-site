"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";

type Plan = "basic" | "pro";

interface VideoAccess {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  uploadedAt: string; // ISO date for sorting
  category: "writing" | "speaking" | "reading" | "listening";
  accessLevel: Plan;
  allowDownload: boolean;
  allowScreenRecord: boolean;
}

const sampleVideos: VideoAccess[] = [
  {
    id: "ielts-writing-task1",
    title: "雅思写作 Task 1 - 图表描述技巧",
    description: "掌握各类图表描述的核心词汇和句型结构，提升写作得分。",
    thumbnail: "https://picsum.photos/id/1018/400/225",
    duration: "45:30",
    uploadedAt: "2024-08-19",
    category: "writing",
    accessLevel: "pro",
    allowDownload: false,
    allowScreenRecord: false,
  },
  {
    id: "ielts-speaking-part2",
    title: "雅思口语 Part 2 - 话题展开策略",
    description: "学会如何用2分钟时间完整展开一个话题，避免冷场。",
    thumbnail: "https://picsum.photos/id/1019/400/225",
    duration: "38:15",
    uploadedAt: "2024-08-18",
    category: "speaking",
    accessLevel: "pro",
    allowDownload: false,
    allowScreenRecord: false,
  },
  {
    id: "ielts-reading-skills",
    title: "雅思阅读 - 快速定位与理解技巧",
    description: "掌握Skimming和Scanning技巧，提高阅读速度和准确率。",
    thumbnail: "https://picsum.photos/id/1020/400/225",
    duration: "52:20",
    uploadedAt: "2024-08-17",
    category: "reading",
    accessLevel: "basic",
    allowDownload: false,
    allowScreenRecord: false,
  },
  {
    id: "ielts-listening-predict",
    title: "雅思听力 - 预测技巧与关键词识别",
    description: "通过关键词预测与场景推断提升正确率。",
    thumbnail: "https://picsum.photos/id/1021/400/225",
    duration: "41:20",
    uploadedAt: "2024-08-16",
    category: "listening",
    accessLevel: "basic",
    allowDownload: false,
    allowScreenRecord: false,
  },
];

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoAccess[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoAccess | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  // 恢复登录状态（站内持久）
  useEffect(() => {
    try {
      const raw = localStorage.getItem("tc_auth");
      if (raw) {
        const parsed = JSON.parse(raw) as { role: string; plan?: Plan };
        setIsLoggedIn(true);
        setPlan(parsed.plan ?? "basic");
      } else {
        setIsLoggedIn(false);
        setPlan(null);
      }
    } catch {
      setIsLoggedIn(false);
      setPlan(null);
    }
  }, []);

  // 初始化课程
  useEffect(() => {
    if (isLoggedIn) {
      // 按上传时间倒序
      const sorted = [...sampleVideos].sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));
      setVideos(sorted);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  const grouped = useMemo(() => {
    const buckets: Record<VideoAccess["category"], VideoAccess[]> = {
      writing: [], speaking: [], reading: [], listening: []
    };
    for (const v of videos) buckets[v.category].push(v);
    return buckets;
  }, [videos]);

  const handleVideoSelect = (video: VideoAccess) => {
    setSelectedVideo(video);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  const handlePlayPause = () => {
    if (!selectedVideo) return;
    if (selectedVideo.accessLevel === "pro" && plan !== "pro") {
      alert("此视频为 Pro 会员专享。请升级到 Pro 后观看。");
      return;
    }
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause(); else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = (e: React.ChangeEvent<HTMLVideoElement>) => setCurrentTime(e.target.currentTime);
  const handleLoadedMetadata = (e: React.ChangeEvent<HTMLVideoElement>) => setDuration(e.target.duration);
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value); if (videoRef.current) { videoRef.current.currentTime = time; setCurrentTime(time); }
  };
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => { const v = parseFloat(e.target.value); setVolume(v); if (videoRef.current) videoRef.current.volume = v; };
  const formatTime = (s: number) => `${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2,'0')}`;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔑</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">需要登录后观看</h1>
          <p className="text-gray-600 mb-6">请先登录您的账号（普通或 Pro 套餐）。</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => router.push("/student-login")} className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors">学生登录</button>
            <button onClick={() => router.push("/admin-login")} className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors">管理员登录</button>
            <button onClick={() => router.push("/")} className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">返回首页</button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载课程...</p>
        </div>
      </div>
    );
  }

  const sections: { key: VideoAccess["category"]; title: string; icon: string }[] = [
    { key: "writing", title: "写作（Writing）", icon: "✍️" },
    { key: "speaking", title: "口语（Speaking）", icon: "🗣️" },
    { key: "reading", title: "阅读（Reading）", icon: "📖" },
    { key: "listening", title: "听力（Listening）", icon: "👂" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🎥 雅思录课视频库</h1>
              <p className="text-sm text-gray-600">当前套餐：{plan === "pro" ? "Pro" : "Basic"}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500"><span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>已登录</div>
              <button onClick={() => router.push("/")} className="text-gray-600 hover:text-gray-900 transition-colors">← 返回首页</button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
        {sections.map(({ key, title, icon }) => (
          <section key={key}>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">{icon} {title}</h2>
            {grouped[key].length === 0 ? (
              <div className="text-sm text-gray-500">暂无该类视频</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {grouped[key].map((video) => (
                  <div key={video.id} className="bg-white rounded-xl overflow-hidden shadow-sm border hover:shadow-md transition-shadow">
                    <div className="relative">
                      <img src={video.thumbnail} alt={video.title} className="w-full h-48 object-cover" />
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${video.accessLevel === "pro" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"}`}>{video.accessLevel === "pro" ? "Pro" : "Basic"}</span>
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">{video.duration}</div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{video.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-3">{video.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>上传：{video.uploadedAt}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleVideoSelect(video)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors">选择</button>
                        <a href={`/api/video/${video.id}`} className="flex-1 border text-center py-2 rounded-md text-sm hover:bg-gray-50">直链</a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}

        {/* Player */}
        <section>
          <div className="lg:col-span-2">
            {selectedVideo ? (
              <div className="bg-white rounded-lg border overflow-hidden shadow-lg">
                <div className="relative">
                  <video ref={videoRef} className="w-full aspect-video bg-black" onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onContextMenu={(e) => e.preventDefault()}>
                    <source src={`/api/video/${selectedVideo.id}`} type="video/mp4" />
                    您的浏览器不支持视频播放。
                  </video>
                  <div className="bg-black bg-opacity-90 p-3">
                    <div className="flex items-center gap-3">
                      <button onClick={handlePlayPause} className={`px-3 py-1 rounded text-white ${selectedVideo.accessLevel === "pro" && plan !== "pro" ? "opacity-50 cursor-not-allowed" : "hover:text-blue-400"}`}>{isPlaying ? "⏸️" : "▶️"}</button>
                      <div className="flex-1"><input type="range" min="0" max={duration || 0} value={currentTime} onChange={handleSeek} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer" /></div>
                      <div className="text-white text-sm">{formatTime(currentTime)} / {formatTime(duration)}</div>
                      <div className="flex items-center gap-2"><span className="text-white text-sm">🔊</span><input type="range" min="0" max="1" step="0.1" value={volume} onChange={handleVolumeChange} className="w-16 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer" /></div>
                    </div>
                    {selectedVideo.accessLevel === "pro" && plan !== "pro" && (<div className="mt-2 text-center text-amber-300 text-sm">此视频为 Pro 专享，请升级套餐以解锁播放。</div>)}
                  </div>
                </div>
                <div className="p-6"><h1 className="text-2xl font-bold text-gray-900 mb-3">{selectedVideo.title}</h1><p className="text-gray-600 mb-4 leading-relaxed">{selectedVideo.description}</p></div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border p-12 text-center"><div className="text-gray-400 text-6xl mb-4">📺</div><h3 className="text-lg font-medium text-gray-900 mb-2">选择要播放的视频</h3><p className="text-gray-500">先在上方分类中选择任意课程</p></div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
