"use client";

import { useState, useEffect, useRef } from "react";

interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  duration: number;
  category: string;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 加载视频
  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/videos');
      
      if (response.ok) {
        const data = await response.json();
        console.log('获取到的视频:', data);
        setVideos(data.videos || []);
      } else {
        console.error('获取视频失败:', response.status);
        setVideos([]);
      }
    } catch (error) {
      console.error('获取视频错误:', error);
      setVideos([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 选择视频
  const handleVideoSelect = (video: Video) => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    
    setSelectedVideo(video);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    
    console.log('选择视频:', video.title, video.url);
  };

  // 播放/暂停
  const handlePlayPause = async () => {
    if (!selectedVideo || !videoRef.current) return;
    
    try {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        await videoRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('播放失败:', error);
      alert('视频播放失败，请刷新页面重试。');
    }
  };

  // 时间更新
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // 元数据加载
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  // 进度条拖拽
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // 格式化时间
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // 按分类分组视频
  const speakingVideos = videos.filter(v => v.category === 'speaking');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载视频中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button 
                onClick={() => window.history.back()}
                className="text-gray-600 hover:text-gray-900 mr-4"
              >
                ← 返回首页
              </button>
              <h1 className="text-xl font-semibold text-gray-900">雅思录课视频库</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 视频列表 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-lg font-medium text-gray-900">课程分类</h2>
                <p className="text-sm text-gray-500 mt-1">按技能分类浏览课程内容</p>
              </div>

              <div className="p-6">
                {/* 口语分类 */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <span className="text-lg mr-2">🗣️</span>
                    <h3 className="text-lg font-medium text-gray-900">口语 (Speaking)</h3>
                  </div>
                  
                  {speakingVideos.length > 0 ? (
                    <div className="space-y-3">
                      {speakingVideos.map((video) => (
                        <div
                          key={video.id}
                          onClick={() => handleVideoSelect(video)}
                          className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                            selectedVideo?.id === video.id 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start space-x-4">
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className="w-20 h-12 object-cover rounded"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://picsum.photos/160/90?random=speaking';
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate">{video.title}</h4>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{video.description}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-500">{Math.floor(video.duration / 60)}分钟</span>
                                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Basic</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">📹</div>
                      <p>该分类暂无视频</p>
                      <p className="text-sm">敬请期待更多精彩内容</p>
                    </div>
                  )}
                </div>

                {/* 其他分类 - 暂无视频 */}
                {['写作 (Writing)', '阅读 (Reading)', '听力 (Listening)'].map((categoryName, index) => {
                  const icons = ['✍️', '📖', '👂'];
                  return (
                    <div key={categoryName} className="mb-8">
                      <div className="flex items-center mb-4">
                        <span className="text-lg mr-2">{icons[index]}</span>
                        <h3 className="text-lg font-medium text-gray-900">{categoryName}</h3>
                      </div>
                      <div className="text-center py-8 text-gray-500">
                        <div className="text-4xl mb-2">📹</div>
                        <p>该分类暂无视频</p>
                        <p className="text-sm">敬请期待更多精彩内容</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 视频播放器 */}
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
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onEnded={() => setIsPlaying(false)}
                      preload="metadata"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        console.error('视频加载错误:', e);
                        setIsPlaying(false);
                      }}
                    >
                      <source src={selectedVideo.url} type="video/mp4" />
                      您的浏览器不支持视频播放。
                    </video>
                    
                    {/* 播放按钮覆盖层 */}
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
                    <h3 className="font-medium text-gray-900 mb-2">{selectedVideo.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{selectedVideo.description}</p>
                    
                    {/* 播放控制 */}
                    <div className="space-y-3">
                      {/* 进度条 */}
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>{formatTime(currentTime)}</span>
                        <input
                          type="range"
                          min="0"
                          max={duration || 0}
                          value={currentTime}
                          onChange={handleSeek}
                          className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span>{formatTime(duration)}</span>
                      </div>
                      
                      {/* 播放按钮 */}
                      <div className="flex items-center justify-center">
                        <button
                          onClick={handlePlayPause}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <span>{isPlaying ? '⏸️' : '▶️'}</span>
                          <span>{isPlaying ? '暂停' : '播放'}</span>
                        </button>
                      </div>
                      
                      {/* 视频信息 */}
                      <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t">
                        <span>分类: speaking</span>
                        <span>时长: {Math.floor(selectedVideo.duration / 60)}分钟</span>
                      </div>
                      <div className="text-center">
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Basic</span>
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
      </div>
    </div>
  );
}