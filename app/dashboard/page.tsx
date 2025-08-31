"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  subscription: {
    planName: string;
    planDescription: string;
    startDate: string;
    endDate: string;
    status: string;
    daysRemaining: number;
  } | null;
  videoStats: {
    totalAccess: number;
    categories: Record<string, number>;
  };
  watchHistory: Array<{
    videoId: string;
    videoTitle: string;
    category: string;
    watchTime: number;
    progress: number;
    lastWatched: string;
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // 检查登录状态
    try {
      const raw = localStorage.getItem("tc_auth");
      if (raw) {
        JSON.parse(raw) as { role: string; id: string };
        setIsLoggedIn(true);
        fetchUserData();
      } else {
        setIsLoggedIn(false);
        setIsLoading(false);
      }
    } catch {
      setIsLoggedIn(false);
      setIsLoading(false);
    }
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      } else {
        console.error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔑</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">需要登录</h1>
          <p className="text-gray-600 mb-6">请先登录您的账号查看仪表板。</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => router.push("/student-login")} className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors">学生登录</button>
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
          <p className="text-gray-600">正在加载用户数据...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">数据加载失败</h1>
          <p className="text-gray-600 mb-6">无法获取用户信息，请稍后重试。</p>
          <button onClick={() => router.push("/")} className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">返回首页</button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      writing: '✍️',
      speaking: '🗣️',
      reading: '📖',
      listening: '👂'
    };
    return icons[category] || '📚';
  };

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      writing: '写作技能',
      speaking: '口语表达',
      reading: '阅读策略',
      listening: '听力技巧'
    };
    return names[category] || category;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">👤 个人仪表板</h1>
              <p className="text-sm text-gray-600">欢迎回来，{userData.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => router.push("/videos")} className="text-gray-600 hover:text-gray-900 transition-colors">📺 视频库</button>
              <button onClick={() => router.push("/")} className="text-gray-600 hover:text-gray-900 transition-colors">🏠 返回首页</button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* 用户信息卡片 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">👤 基本信息</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">姓名</p>
              <p className="text-lg font-medium text-gray-900">{userData.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">邮箱</p>
              <p className="text-lg font-medium text-gray-900">{userData.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">角色</p>
              <p className="text-lg font-medium text-gray-900">
                {userData.role === 'STUDENT' ? '学生' : '管理员'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">注册时间</p>
              <p className="text-lg font-medium text-gray-900">{formatDate(userData.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* 订阅状态 */}
        {userData.subscription && (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">💳 订阅状态</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">当前计划</p>
                <p className="text-lg font-medium text-gray-900 capitalize">{userData.subscription.planName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">剩余天数</p>
                <p className={`text-lg font-medium ${userData.subscription.daysRemaining <= 7 ? 'text-red-600' : 'text-gray-900'}`}>
                  {userData.subscription.daysRemaining} 天
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">开始时间</p>
                <p className="text-lg font-medium text-gray-900">{formatDate(userData.subscription.startDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">到期时间</p>
                <p className="text-lg font-medium text-gray-900">{formatDate(userData.subscription.endDate)}</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">{userData.subscription.planDescription}</p>
            </div>
          </div>
        )}

        {/* 学习统计 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 学习统计</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">总访问视频数</p>
              <p className="text-3xl font-bold text-blue-600">{userData.videoStats.totalAccess}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">学习分类分布</p>
              <div className="space-y-2">
                {Object.entries(userData.videoStats.categories).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {getCategoryIcon(category)} {getCategoryName(category)}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 观看历史 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📺 最近观看</h2>
          {userData.watchHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-8">暂无观看记录</p>
          ) : (
            <div className="space-y-4">
              {userData.watchHistory.map((history) => (
                <div key={history.videoId} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
                  <div className="text-2xl">{getCategoryIcon(history.category)}</div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{history.videoTitle}</h3>
                    <p className="text-sm text-gray-500">
                      {getCategoryName(history.category)} • 上次观看: {formatDate(history.lastWatched)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {Math.round(history.progress * 100)}% 完成
                    </div>
                    <div className="text-xs text-gray-500">
                      观看时长: {formatDuration(history.watchTime)}
                    </div>
                  </div>
                  <button 
                    onClick={() => router.push(`/videos`)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    继续观看
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 快速操作 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">⚡ 快速操作</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <button 
              onClick={() => router.push("/videos")}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <div className="text-2xl mb-2">📺</div>
              <div className="font-medium text-gray-900">浏览视频</div>
              <div className="text-sm text-gray-500">查看所有可用课程</div>
            </button>
            <button 
              onClick={() => router.push("/")}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <div className="text-2xl mb-2">🏠</div>
              <div className="font-medium text-gray-900">返回首页</div>
              <div className="text-sm text-gray-500">查看网站主页</div>
            </button>
            <button 
              onClick={() => router.push("/about")}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <div className="text-2xl mb-2">ℹ️</div>
              <div className="font-medium text-gray-900">关于我们</div>
              <div className="text-sm text-gray-500">了解更多信息</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
