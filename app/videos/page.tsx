"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface VideoAccess {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  accessUntil: string;
  allowDownload: boolean;
  allowScreenRecord: boolean;
  accessLevel: "basic" | "pro";
}

const sampleVideos: VideoAccess[] = [
  {
    id: "ielts-writing-task1",
    title: "雅思写作 Task 1 - 图表描述技巧",
    description: "掌握各类图表描述的核心词汇和句型结构，提升写作得分。",
    thumbnail: "https://picsum.photos/id/1018/400/225",
    duration: "45:30",
    accessUntil: "2025-12-31",
    allowDownload: false,
    allowScreenRecord: false,
    accessLevel: "pro",
  },
  {
    id: "ielts-speaking-part2",
    title: "雅思口语 Part 2 - 话题展开策略",
    description: "学会如何用2分钟时间完整展开一个话题，避免冷场。",
    thumbnail: "https://picsum.photos/id/1019/400/225",
    duration: "38:15",
    accessUntil: "2025-12-31",
    allowDownload: false,
    allowScreenRecord: false,
    accessLevel: "pro",
  },
  {
    id: "ielts-reading-skills",
    title: "雅思阅读 - 快速定位与理解技巧",
    description: "掌握Skimming和Scanning技巧，提高阅读速度和准确率。",
    thumbnail: "https://picsum.photos/id/1020/400/225",
    duration: "52:20",
    accessUntil: "2025-12-31",
    allowDownload: false,
    allowScreenRecord: false,
    accessLevel: "basic",
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
  const [plan, setPlan] = useState<"basic" | "pro" | null>(null);
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  // 恢复登录状态（站内持久）
  useEffect(() => {
    try {
      const raw = localStorage.getItem("tc_auth");
      if (raw) {
        const parsed = JSON.parse(raw) as { role: string; plan?: "basic" | "pro" };
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
      setVideos(sampleVideos);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

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
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = (e: React.ChangeEvent<HTMLVideoElement>) => {
    setCurrentTime(e.target.currentTime);
  };

  const handleLoadedMetadata = (e: React.ChangeEvent<HTMLVideoElement>) => {
    setDuration(e.target.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
              <div className="text-sm text-gray-500">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                已登录
              </div>
              <button onClick={() => router.push("/")} className="text-gray-600 hover:text-gray-900 transition-colors">← 返回首页</button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Video List */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              📚 课程列表
              <span className="text-sm text-gray-500 font-normal">({videos.length} 门课程)</span>
            </h2>
            <div className="space-y-3">
              {videos.map((video) => (
                <div key={video.id} onClick={() => handleVideoSelect(video)} className={`bg-white rounded-lg border cursor-pointer transition-all hover:shadow-md ${selectedVideo?.id === video.id ? "ring-2 ring-blue-500 shadow-lg" : ""}`}>
                  <div className="p-4">
                    <div className="flex gap-3">
                      <img src={video.thumbnail} alt={video.title} className="w-20 h-12 object-cover rounded" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm line-clamp-2">{video.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">⏱️ 时长: {video.duration}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {!video.allowDownload && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">🚫 禁止下载</span>
                          )}
                          {!video.allowScreenRecord && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">🚫 禁止录屏</span>
                          )}
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${video.accessLevel === "pro" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"}`}>{video.accessLevel === "pro" ? "Pro" : "Basic"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Video Player */}
          <div className="lg:col-span-2">
            {selectedVideo ? (
              <div className="bg-white rounded-lg border overflow-hidden shadow-lg">
                <div className="relative">
                  {/* 防录屏水印 */}
                  <div className="absolute inset-0 pointer-events-none z-10">
                    <div className="absolute top-4 left-4 text-white text-sm font-bold opacity-50 bg-black bg-opacity-30 px-2 py-1 rounded">{new Date().toLocaleDateString()}</div>
                    <div className="absolute top-4 right-4 text-white text-sm font-bold opacity-50 bg-black bg-opacity-30 px-2 py-1 rounded">Tiffany&rsquo;s College</div>
                  </div>
                  
                  <video
                    ref={videoRef}
                    className="w-full aspect-video bg-black"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onContextMenu={(e) => e.preventDefault()}
                    onKeyDown={(e) => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); } }}
                  >
                    <source src={`/api/video/${selectedVideo.id}`} type="video/mp4" />
                    您的浏览器不支持视频播放。
                  </video>

                  <div className="bg-black bg-opacity-90 p-3">
                    <div className="flex items-center gap-3">
                      <button onClick={handlePlayPause} className={`px-3 py-1 rounded text-white ${selectedVideo.accessLevel === "pro" && plan !== "pro" ? "opacity-50 cursor-not-allowed" : "hover:text-blue-400"}`}>
                        {isPlaying ? "⏸️" : "▶️"}
                      </button>

                      <div className="flex-1">
                        <input type="range" min="0" max={duration || 0} value={currentTime} onChange={handleSeek} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
                      </div>

                      <div className="text-white text-sm">{formatTime(currentTime)} / {formatTime(duration)}</div>

                      <div className="flex items-center gap-2">
                        <span className="text白 text-sm">🔊</span>
                        <input type="range" min="0" max="1" step="0.1" value={volume} onChange={handleVolumeChange} className="w-16 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
                      </div>
                    </div>
                    {selectedVideo.accessLevel === "pro" && plan !== "pro" && (
                      <div className="mt-2 text-center text-amber-300 text-sm">此视频为 Pro 专享，请升级套餐以解锁播放。</div>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-3">{selectedVideo.title}</h1>
                  <p className="text-gray-600 mb-4 leading-relaxed">{selectedVideo.description}</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border p-12 text-center">
                <div className="text-gray-400 text-6xl mb-4">📺</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">选择要播放的视频</h3>
                <p className="text-gray-500 mb-6">从左侧列表中选择一个课程开始学习</p>
                <div className="text-sm text-gray-400">💡 提示：Pro 标识为高级专享视频</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
