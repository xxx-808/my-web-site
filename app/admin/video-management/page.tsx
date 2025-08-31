"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Video {
  id: string;
  title: string;
  description: string;
  category: {
    id: string;
    name: string;
    displayName: string;
  };
  duration: string;
  filePath: string;
  thumbnail: string;
  uploadDate: string;
  status: "ACTIVE" | "INACTIVE" | "PROCESSING";
  accessLevel: "BASIC" | "PREMIUM";
  tags: string[];
  cognitiveObjectives: string[];
  stats: {
    accessCount: number;
    watchCount: number;
    averageProgress: number;
  };
  accessUsers: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    accessType: string;
    grantedAt: string;
    expiresAt: string | null;
    isActive: boolean;
  }>;
}

interface VideoCategory {
  id: string;
  name: string;
  displayName: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Explicit type for newVideo form state to avoid literal narrowing
type NewVideo = {
  title: string;
  description: string;
  categoryId: string;
  accessLevel: "BASIC" | "PREMIUM";
  tags: string[];
  cognitiveObjectives: string[];
};

export default function VideoManagementPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'manage' | 'batch' | 'access'>('upload');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // 数据状态
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedVideoForAccess, setSelectedVideoForAccess] = useState<Video | null>(null);
  const [selectedUserForAccess, setSelectedUserForAccess] = useState<string>('');

  const [newVideo, setNewVideo] = useState<NewVideo>({
    title: "",
    description: "",
    categoryId: "",
    accessLevel: "BASIC",
    tags: [] as string[],
    cognitiveObjectives: [] as string[]
  });

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

  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      // 并行加载视频、分类和用户数据
      const [videosResponse, categoriesResponse, usersResponse] = await Promise.all([
        fetch('/api/admin/videos'),
        fetch('/api/admin/categories'),
        fetch('/api/admin/users')
      ]);

      if (videosResponse.ok) {
        const videosData = await videosResponse.json();
        setVideos(videosData.videos);
      }

      // 如果没有分类API，使用默认分类
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.categories);
      } else {
        // 使用默认分类
        setCategories([
          { id: "writing", name: "writing", displayName: "写作技能" },
          { id: "speaking", name: "speaking", displayName: "口语表达" },
          { id: "reading", name: "reading", displayName: "阅读策略" },
          { id: "listening", name: "listening", displayName: "听力技巧" }
        ]);
      }

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  // 文件上传处理
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    // 模拟上传进度
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // 模拟上传完成
    setTimeout(() => {
      setUploading(false);
      setUploadProgress(0);
      alert("视频上传成功！");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }, 2000);
  };

  // 添加新视频
  const handleAddVideo = async () => {
    if (!newVideo.title || !newVideo.description || !newVideo.categoryId) {
      alert("请填写完整信息");
      return;
    }

    try {
      const response = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newVideo),
      });

      if (response.ok) {
        alert("视频创建成功");
        setNewVideo({
          title: "",
          description: "",
          categoryId: "",
          accessLevel: "BASIC",
          tags: [],
          cognitiveObjectives: []
        });
        loadData(); // 重新加载数据
      } else {
        const error = await response.json();
        alert(error.error || "创建失败");
      }
    } catch (error) {
      console.error('Failed to create video:', error);
      alert("创建失败");
    }
  };

  // 删除视频
  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm("确定要删除这个视频吗？")) return;

    try {
      const response = await fetch(`/api/admin/videos?id=${videoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert("视频删除成功");
        loadData(); // 重新加载数据
      } else {
        const error = await response.json();
        alert(error.error || "删除失败");
      }
    } catch (error) {
      console.error('Failed to delete video:', error);
      alert("删除失败");
    }
  };

  // 为用户分配视频访问权限
  const handleGrantAccess = async () => {
    if (!selectedVideoForAccess || !selectedUserForAccess) {
      alert("请选择视频和用户");
      return;
    }

    try {
      const response = await fetch('/api/admin/video-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUserForAccess,
          videoId: selectedVideoForAccess.id,
          accessType: 'GRANTED'
        }),
      });

      if (response.ok) {
        alert("访问权限分配成功");
        setSelectedUserForAccess('');
        loadData(); // 重新加载数据
      } else {
        const error = await response.json();
        alert(error.error || "分配失败");
      }
    } catch (error) {
      console.error('Failed to grant access:', error);
      alert("分配失败");
    }
  };

  // 撤销用户视频访问权限
  const handleRevokeAccess = async (userId: string, videoId: string) => {
    if (!confirm("确定要撤销这个用户的访问权限吗？")) return;

    try {
      const response = await fetch(`/api/admin/video-access?userId=${userId}&videoId=${videoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert("访问权限撤销成功");
        loadData(); // 重新加载数据
      } else {
        const error = await response.json();
        alert(error.error || "撤销失败");
      }
    } catch (error) {
      console.error('Failed to revoke access:', error);
      alert("撤销失败");
    }
  };

  // 批量操作
  const handleBatchOperation = async (operation: string) => {
    if (selectedVideos.length === 0) {
      alert("请先选择视频");
      return;
    }

    try {
      const response = await fetch('/api/admin/videos/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation,
          videoIds: selectedVideos
        }),
      });

      if (response.ok) {
        alert("批量操作成功");
        setSelectedVideos([]);
        loadData();
      } else {
        const error = await response.json();
        alert(error.error || "操作失败");
      }
    } catch (error) {
      console.error('Failed to perform batch operation:', error);
      alert("操作失败");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">验证中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">视频管理</h1>
            <button
              onClick={() => router.push("/admin")}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              返回管理面板
            </button>
          </div>

          {/* 标签页导航 */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'upload', name: '上传视频', icon: '📤' },
                { id: 'manage', name: '管理视频', icon: '🎬' },
                { id: 'access', name: '访问权限', icon: '🔐' },
                { id: 'batch', name: '批量操作', icon: '⚡' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'upload' | 'manage' | 'batch' | 'access')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* 上传视频标签页 */}
          {activeTab === 'upload' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">上传新视频</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    视频文件
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {uploading && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">上传进度: {uploadProgress}%</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    缩略图
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    标题 *
                  </label>
                  <input
                    type="text"
                    value={newVideo.title}
                    onChange={(e) => setNewVideo({...newVideo, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="输入视频标题"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    分类 *
                  </label>
                  <select
                    value={newVideo.categoryId}
                    onChange={(e) => setNewVideo({...newVideo, categoryId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">选择分类</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.displayName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  描述 *
                </label>
                <textarea
                  value={newVideo.description}
                  onChange={(e) => setNewVideo({...newVideo, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入视频描述"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    访问级别
                  </label>
                  <select
                    value={newVideo.accessLevel}
                    onChange={(e) => setNewVideo({...newVideo, accessLevel: e.target.value as "BASIC" | "PREMIUM"})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="BASIC">基础用户</option>
                    <option value="PREMIUM">高级用户</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    标签
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="用逗号分隔多个标签"
                    onChange={(e) => setNewVideo({...newVideo, tags: e.target.value.split(',').map(tag => tag.trim())})}
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleAddVideo}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  创建视频
                </button>
              </div>
            </div>
          )}

          {/* 管理视频标签页 */}
          {activeTab === 'manage' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold">视频列表</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        视频信息
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        分类
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        访问级别
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        统计
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {videos.map((video) => (
                      <tr key={video.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              className="h-12 w-20 object-cover rounded"
                              src={video.thumbnail}
                              alt={video.title}
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {video.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {video.description.substring(0, 50)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {video.category.displayName}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            video.accessLevel === 'PREMIUM' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {video.accessLevel}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>访问: {video.stats.accessCount}</div>
                          <div>观看: {video.stats.watchCount}</div>
                          <div>进度: {video.stats.averageProgress.toFixed(1)}%</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleDeleteVideo(video.id)}
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

          {/* 访问权限标签页 */}
          {activeTab === 'access' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">视频访问权限管理</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    选择视频
                  </label>
                  <select
                    value={selectedVideoForAccess?.id || ''}
                    onChange={(e) => {
                      const video = videos.find(v => v.id === e.target.value);
                      setSelectedVideoForAccess(video || null);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">选择视频</option>
                    {videos.map((video) => (
                      <option key={video.id} value={video.id}>
                        {video.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    选择用户
                  </label>
                  <select
                    value={selectedUserForAccess}
                    onChange={(e) => setSelectedUserForAccess(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">选择用户</option>
                    {users.filter(user => user.role === 'STUDENT').map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleGrantAccess}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                分配访问权限
              </button>

              {selectedVideoForAccess && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">
                    {selectedVideoForAccess.title} - 访问用户列表
                  </h3>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            用户
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            访问类型
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            授权时间
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            过期时间
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            状态
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            操作
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedVideoForAccess.accessUsers.map((access) => (
                          <tr key={access.userId}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {access.userName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {access.userEmail}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                {access.accessType}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(access.grantedAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {access.expiresAt ? new Date(access.expiresAt).toLocaleDateString() : '永久'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                access.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {access.isActive ? '有效' : '无效'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleRevokeAccess(access.userId, selectedVideoForAccess.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                撤销
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 批量操作标签页 */}
          {activeTab === 'batch' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">批量操作</h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择视频
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {videos.map((video) => (
                    <label key={video.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedVideos.includes(video.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedVideos([...selectedVideos, video.id]);
                          } else {
                            setSelectedVideos(selectedVideos.filter(id => id !== video.id));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{video.title}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-x-4">
                <button
                  onClick={() => handleBatchOperation('delete')}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  批量删除
                </button>
                <button
                  onClick={() => handleBatchOperation('activate')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  批量激活
                </button>
                <button
                  onClick={() => handleBatchOperation('deactivate')}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  批量停用
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
