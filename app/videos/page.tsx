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
  categoryDisplayName: string;
  accessLevel: Plan;
  canAccess: boolean;
  watchProgress: number;
  lastWatched?: string;
  tags: string[];
  cognitiveObjectives: string[];
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
    categoryDisplayName: "写作技能",
    accessLevel: "pro",
    canAccess: true,
    watchProgress: 0,
    tags: ["写作", "Task1", "图表描述"],
    cognitiveObjectives: ["提高图表分析能力", "培养逻辑表达思维"]
  },
  {
    id: "ielts-speaking-part2",
    title: "雅思口语 Part 2 - 话题展开策略",
    description: "学会如何用2分钟时间完整展开一个话题，避免冷场。",
    thumbnail: "https://picsum.photos/id/1019/400/225",
    duration: "38:15",
    uploadedAt: "2024-08-18",
    category: "speaking",
    categoryDisplayName: "口语表达",
    accessLevel: "pro",
    canAccess: true,
    watchProgress: 0,
    tags: ["口语", "Part2", "话题展开"],
    cognitiveObjectives: ["提高口语流利度", "增强话题组织能力"]
  },
  {
    id: "ielts-reading-skills",
    title: "雅思阅读 - 快速定位与理解技巧",
    description: "掌握Skimming和Scanning技巧，提高阅读速度和准确率。",
    thumbnail: "https://picsum.photos/id/1020/400/225",
    duration: "52:20",
    uploadedAt: "2024-08-17",
    category: "reading",
    categoryDisplayName: "阅读策略",
    accessLevel: "basic",
    canAccess: true,
    watchProgress: 0,
    tags: ["阅读", "定位技巧", "理解策略"],
    cognitiveObjectives: ["提高阅读速度", "增强理解能力"]
  },
  {
    id: "ielts-listening-predict",
    title: "雅思听力 - 预测技巧与关键词识别",
    description: "通过关键词预测与场景推断提升正确率。",
    thumbnail: "https://picsum.photos/id/1021/400/225",
    duration: "41:20",
    uploadedAt: "2024-08-16",
    category: "listening",
    categoryDisplayName: "听力技巧",
    accessLevel: "basic",
    canAccess: true,
    watchProgress: 0,
    tags: ["听力", "预测技巧", "关键词"],
    cognitiveObjectives: ["提高听力理解", "增强预测能力"]
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
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  // 恢复登录状态（站内持久）
  useEffect(() => {
    try {
      const raw = localStorage.getItem("tc_auth");
      if (raw) {
        const parsed = JSON.parse(raw) as { role: string; plan?: Plan };
        setIsLoggedIn(true);
        setUserRole(parsed.role);
        setPlan(parsed.plan ?? "basic");
      } else {
        setIsLoggedIn(false);
        setPlan(null);
        setUserRole(null);
      }
    } catch {
      setIsLoggedIn(false);
      setPlan(null);
      setUserRole(null);
    }
  }, []);

  // 初始化课程
  useEffect(() => {
    if (isLoggedIn) {
      fetchVideos();
    } else {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/videos');
      if (response.ok) {
        const data = await response.json();
        setVideos(data.videos || []);
        setPlan(data.userSubscription?.planName === 'premium' ? 'pro' : 'basic');
      } else {
        console.error('Failed to fetch videos');
        // 不设置回退数据，保持空数组
        setVideos([]);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      // 不设置回退数据，保持空数组
      setVideos([]);
    } finally {
      setIsLoading(false);
    }
  };

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
    
    // 检查访问权限
    if (!selectedVideo.canAccess) {
    if (selectedVideo.accessLevel === "pro" && plan !== "pro") {
      alert("此视频为 Pro 会员专享。请升级到 Pro 后观看。");
      return;
      } else {
        alert("您没有访问此视频的权限。请联系管理员。");
        return;
      }
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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/")}
                className="text-gray-600 hover:text-gray-900"
              >
                ← 返回首页
              </button>
              <h1 className="text-2xl font-bold text-gray-900">雅思录课视频库</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                当前套餐: <span className="font-medium">{plan === "pro" ? "Pro" : "Basic"}</span>
              </div>
              {userRole === 'ADMIN' && (
                <button
                  onClick={() => router.push("/admin")}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  管理面板
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Video List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">课程分类</h2>
                <p className="text-gray-600 mt-1">按技能分类浏览课程内容</p>
              </div>
              
              <div className="p-6">
                {sections.map((section) => (
                  <div key={section.key} className="mb-8 last:mb-0">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <span>{section.icon}</span>
                      {section.title}
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      {grouped[section.key].length === 0 ? (
                        <div className="col-span-2 text-center py-8">
                          <div className="text-gray-400">
                            <div className="text-4xl mb-2">📹</div>
                            <div className="text-sm">该分类暂无视频</div>
                            <div className="text-xs text-gray-300 mt-1">管理员正在准备课程内容</div>
                          </div>
                        </div>
                      ) : (
                        grouped[section.key].map((video) => (
                          <div
                            key={video.id}
                            onClick={() => handleVideoSelect(video)}
                            className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                              selectedVideo?.id === video.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            } ${!video.canAccess ? 'opacity-60' : ''}`}
                          >
                            <div className="flex gap-3">
                              <img
                                src={video.thumbnail}
                                alt={video.title}
                                className="w-20 h-12 object-cover rounded"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <h4 className="text-sm font-medium text-gray-900 truncate">
                                    {video.title}
                                  </h4>
                                  <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                                    video.accessLevel === "pro"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-green-100 text-green-800"
                                  }`}>
                                    {video.accessLevel === "pro" ? "Pro" : "Basic"}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                  {video.description}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-xs text-gray-400">{video.duration}</span>
                                  {video.watchProgress > 0 && (
                                    <div className="flex items-center gap-1">
                                      <div className="w-16 bg-gray-200 rounded-full h-1">
                                        <div
                                          className="bg-blue-600 h-1 rounded-full"
                                          style={{ width: `${video.watchProgress}%` }}
                                        ></div>
                                      </div>
                                      <span className="text-xs text-gray-500">{video.watchProgress}%</span>
                      </div>
                                  )}
                    </div>
                                {!video.canAccess && (
                                  <div className="mt-2">
                                    <span className="text-xs text-red-600 font-medium">
                                      {video.accessLevel === "pro" ? "需要 Pro 套餐" : "无访问权限"}
                                    </span>
                      </div>
                                )}
                      </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Video Player */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden sticky top-8">
            {selectedVideo ? (
                <>
                  <div className="aspect-video bg-black relative">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-contain"
                      poster={selectedVideo.thumbnail}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                    >
                    <source src={`/api/video/${selectedVideo.id}`} type="video/mp4" />
                    您的浏览器不支持视频播放。
                  </video>
                    
                    {/* Play Button Overlay */}
                    {!isPlaying && (
                      <button
                        onClick={handlePlayPause}
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-40 transition-all"
                      >
                        <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                          <div className="w-0 h-0 border-l-[12px] border-l-gray-800 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"></div>
                        </div>
                      </button>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {selectedVideo.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {selectedVideo.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={handlePlayPause}
                        className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
                      >
                        {isPlaying ? (
                          <>
                            <span className="text-xl">⏸️</span>
                            暂停
                          </>
                        ) : (
                          <>
                            <span className="text-xl">▶️</span>
                            播放
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">音量</span>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={volume}
                          onChange={handleVolumeChange}
                          className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                      </div>
                    </div>

                    {/* Video Info */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>分类: {selectedVideo.categoryDisplayName}</span>
                        <span>时长: {selectedVideo.duration}</span>
                    </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>上传: {new Date(selectedVideo.uploadedAt).toLocaleDateString()}</span>
                        <span className={`px-2 py-1 rounded-full ${
                          selectedVideo.accessLevel === "pro"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-green-100 text-green-800"
                        }`}>
                          {selectedVideo.accessLevel === "pro" ? "Pro" : "Basic"}
                        </span>
                  </div>
                </div>
              </div>
                </>
              ) : (
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-4xl mb-2">🎬</div>
                    <p>选择一个视频开始观看</p>
                  </div>
                </div>
            )}
          </div>
      </div>
        </div>
      </main>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}
