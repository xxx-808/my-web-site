"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  subscription: {
    id: string;
    planName: string;
    planDescription: string;
    endDate: string;
    daysRemaining: number;
  } | null;
  stats: {
    videoAccessCount: number;
    lastActivity: string | null;
  };
}

interface VideoData {
  id: string;
  title: string;
  description: string;
  category: {
    name: string;
  };
  accessLevel: string;
  status: string;
  createdAt: string;
  stats: {
    accessCount: number;
    watchCount: number;
    averageProgress: number;
  };
}

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalVideos: number;
    activeSubscriptions: number;
    totalRevenue: number;
  };
  userStats: {
    byRole: Array<{ role: string; count: number }>;
  };
  videoStats: {
    byCategory: Array<{ categoryName: string; count: number }>;
    topVideos: Array<{ title: string; watchCount: number; avgProgress: number }>;
  };
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'videos' | 'analytics'>('analytics');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 用户管理状态
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "STUDENT"
  });

  // 移除未使用的视频管理状态（已移到专门的视频管理页面）

  const checkAuthentication = useCallback(() => {
    try {
      const raw = localStorage.getItem("tc_auth");
      if (raw) {
        const parsed = JSON.parse(raw) as { role: string; id: string };
        if (parsed.role === "ADMIN") {
          setIsAuthenticated(true);
        } else {
          router.push("/admin-login");
        }
      } else {
        router.push("/admin-login");
      }
    } catch {
      router.push("/admin-login");
    }
  }, [router]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'analytics') {
        const response = await fetch('/api/admin/analytics');
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        }
      } else if (activeTab === 'users') {
        const response = await fetch('/api/admin/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users);
        }
      } else if (activeTab === 'videos') {
        const response = await fetch('/api/admin/videos');
        if (response.ok) {
          const data = await response.json();
          setVideos(data.videos);
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, activeTab, loadData]);

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email) {
      alert("请填写完整信息");
      return;
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        alert("用户创建成功");
        setNewUser({ name: "", email: "", role: "STUDENT" });
      setShowAddUser(false);
        loadData();
      } else {
        const error = await response.json();
        alert(error.error || "创建失败");
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      alert("创建失败");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("确定要删除该用户吗？")) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert("用户删除成功");
        loadData();
      } else {
        const error = await response.json();
        alert(error.error || "删除失败");
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert("删除失败");
    }
  };

  const handleUpdateVideoStatus = async (videoId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/videos/${videoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        alert("状态更新成功");
        loadData();
      } else {
        const error = await response.json();
        alert(error.error || "更新失败");
      }
    } catch (error) {
      console.error('Failed to update video status:', error);
      alert("更新失败");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">验证管理员权限...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🔧 管理员控制台</h1>
              <p className="text-sm text-gray-600">用户管理 • 视频管理 • 数据分析</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                管理员模式
              </span>
              <button
                onClick={() => router.push("/admin/video-management")}
                className="text-gray-600 hover:text-gray-900"
              >
                📺 视频管理
              </button>
              <button
                onClick={() => router.push("/")}
                className="text-gray-600 hover:text-gray-900"
              >
                🏠 返回首页
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'analytics', label: '数据分析', icon: '📊' },
              { id: 'users', label: '用户管理', icon: '👥' },
              { id: 'videos', label: '视频管理', icon: '🎥' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'users' | 'videos' | 'analytics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">加载数据中...</p>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && analytics && !isLoading && (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{analytics.overview.totalUsers}</div>
                  <div className="text-sm text-gray-500">总用户数</div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{analytics.overview.totalVideos}</div>
                  <div className="text-sm text-gray-500">视频数量</div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{analytics.overview.activeSubscriptions}</div>
                  <div className="text-sm text-gray-500">活跃订阅</div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">¥{analytics.overview.totalRevenue}</div>
                  <div className="text-sm text-gray-500">总收入</div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* User Stats */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">用户角色分布</h3>
                <div className="space-y-3">
                  {analytics.userStats.byRole.map((item) => (
                    <div key={item.role} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {item.role === 'STUDENT' ? '学生' : '管理员'}
                      </span>
                      <span className="text-sm font-medium">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Video Stats */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">视频分类分布</h3>
                <div className="space-y-3">
                  {analytics.videoStats.byCategory.map((item) => (
                    <div key={item.categoryName} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{item.categoryName}</span>
                      <span className="text-sm font-medium">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Videos */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">热门视频</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">视频标题</th>
                      <th className="text-left py-2">观看次数</th>
                      <th className="text-left py-2">平均进度</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.videoStats.topVideos.map((video, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 text-sm">{video.title}</td>
                        <td className="py-2 text-sm">{video.watchCount}</td>
                        <td className="py-2 text-sm">{Math.round(video.avgProgress * 100)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && !isLoading && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">用户管理</h2>
              <button
                onClick={() => setShowAddUser(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                添加用户
              </button>
            </div>

            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      用户信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      角色
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      订阅状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      注册时间
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role === 'ADMIN' ? '管理员' : '学生'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.subscription ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.subscription.planName}</div>
                            <div className="text-sm text-gray-500">剩余 {user.subscription.daysRemaining} 天</div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">无订阅</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && !isLoading && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">视频管理</h2>
              <button
                onClick={() => router.push("/admin/video-management")}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                📺 详细管理
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <div key={video.id} className="bg-white rounded-lg border p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{video.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{video.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">分类:</span>
                                              <span>{video.category.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">访问级别:</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        video.accessLevel === 'PREMIUM' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {video.accessLevel === 'PREMIUM' ? '高级' : '基础'}
                          </span>
                      </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">状态:</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        video.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {video.status === 'ACTIVE' ? '已激活' : '已停用'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">观看次数:</span>
                      <span>{video.stats.watchCount}</span>
                    </div>
                    </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleUpdateVideoStatus(video.id, video.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                      className={`flex-1 px-3 py-2 rounded text-sm font-medium ${
                        video.status === 'ACTIVE' 
                          ? 'bg-gray-600 text-white hover:bg-gray-700' 
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {video.status === 'ACTIVE' ? '停用' : '激活'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">添加新用户</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="STUDENT">学生</option>
                  <option value="ADMIN">管理员</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddUser}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                添加用户
              </button>
              <button
                onClick={() => setShowAddUser(false)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
