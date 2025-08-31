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
}

interface VideoCategory {
  id: string;
  name: string;
  displayName: string;
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
  const [activeTab, setActiveTab] = useState<'upload' | 'manage' | 'batch'>('upload');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // 数据状态
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);

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
    setIsLoading(true);
    try {
      // 并行加载视频和分类数据
      const [videosResponse, categoriesResponse] = await Promise.all([
        fetch('/api/admin/videos'),
        fetch('/api/admin/categories')
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
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
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

  // 批量操作
  const handleBatchOperation = async (operation: string) => {
    if (selectedVideos.length === 0) {
      alert("请先选择视频");
      return;
    }

    if (operation === "delete" && !confirm(`确定要删除选中的 ${selectedVideos.length} 个视频吗？`)) {
      return;
    }

    try {
      const promises = selectedVideos.map(async (videoId) => {
        if (operation === "delete") {
          return fetch(`/api/admin/videos/${videoId}`, { method: 'DELETE' });
        } else {
          const status = operation === "activate" ? "ACTIVE" : "INACTIVE";
          return fetch(`/api/admin/videos/${videoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
          });
        }
      });

      await Promise.all(promises);
      alert("批量操作完成");
      setSelectedVideos([]);
      loadData();
    } catch (error) {
      console.error('Batch operation failed:', error);
      alert("批量操作失败");
    }
  };

  // 全选/取消全选
  const handleSelectAll = () => {
    if (selectedVideos.length === videos.length) {
      setSelectedVideos([]);
    } else {
      setSelectedVideos(videos.map(v => v.id));
    }
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
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/admin-login")}
                className="text-gray-600 hover:text-gray-900"
              >
                ← 返回管理控制台
              </button>
              <h1 className="text-2xl font-bold text-gray-900">视频管理</h1>
            </div>
            <div className="text-sm text-gray-600">
              共 {videos.length} 个视频
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'upload', name: '视频上传', icon: '📤' },
              { id: 'manage', name: '视频管理', icon: '🎥' },
              { id: 'batch', name: '批量操作', icon: '⚡' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'upload' | 'manage' | 'batch')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon} {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="bg-white rounded-xl p-8 shadow-sm border">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">上传新视频</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* 文件上传 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">文件上传</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-purple-600 hover:text-purple-700 font-medium"
                  >
                    选择视频文件
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    支持 MP4, AVI, MOV 格式，最大 500MB
                  </p>
                </div>
                
                {uploading && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>上传进度</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* 视频信息 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">视频信息</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      视频标题 *
                    </label>
                    <input
                      type="text"
                      value={newVideo.title}
                      onChange={(e) => setNewVideo({...newVideo, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="请输入视频标题"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      视频描述 *
                    </label>
                    <textarea
                      value={newVideo.description}
                      onChange={(e) => setNewVideo({...newVideo, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="请输入视频描述"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        技能分类
                      </label>
                      <select
                        value={newVideo.categoryId}
                        onChange={(e) => setNewVideo({...newVideo, categoryId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">请选择分类</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.displayName}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        访问级别
                      </label>
                      <select
                        value={newVideo.accessLevel}
                        onChange={(e) => setNewVideo({...newVideo, accessLevel: e.target.value as 'BASIC' | 'PREMIUM'})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="BASIC">基础会员</option>
                        <option value="PREMIUM">高级会员</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      标签 (用逗号分隔)
                    </label>
                    <input
                      type="text"
                      value={newVideo.tags.join(', ')}
                      onChange={(e) => setNewVideo({...newVideo, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="写作, Task1, 图表描述"
                    />
                  </div>

                  <div>
                    <label className="block textsm font-medium text-gray-700 mb-1">
                      认知目标 (用逗号分隔)
                    </label>
                    <input
                      type="text"
                      value={newVideo.cognitiveObjectives.join(', ')}
                      onChange={(e) => setNewVideo({...newVideo, cognitiveObjectives: e.target.value.split(',').map(t => t.trim()).filter(t => t)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="提高图表分析能力, 培养逻辑表达思维"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddVideo}
                  className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-md font-medium transition-colors"
                >
                  添加视频
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Manage Tab */}
        {activeTab === 'manage' && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">视频管理</h2>
              <p className="text-gray-600 mt-2">管理所有已上传的视频内容</p>
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
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      访问级别
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      上传日期
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {videos.map((video) => (
                    <tr key={video.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img 
                            src={video.thumbnail} 
                            alt={video.title}
                            className="w-16 h-12 object-cover rounded mr-4"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{video.title}</div>
                            <div className="text-sm text-gray-500">{video.duration}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          video.category.name === 'writing' ? 'bg-blue-100 text-blue-800' :
                          video.category.name === 'speaking' ? 'bg-green-100 text-green-800' :
                          video.category.name === 'reading' ? 'bg-purple-100 text-purple-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {video.category.displayName}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          video.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          video.status === 'INACTIVE' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {video.status === 'ACTIVE' ? '已激活' :
                           video.status === 'INACTIVE' ? '已停用' : '处理中'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          video.accessLevel === 'PREMIUM' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {video.accessLevel === 'PREMIUM' ? '高级' : '基础'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {video.uploadDate}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <button className="text-purple-600 hover:text-purple-900 mr-3">编辑</button>
                        <button className="text-red-600 hover:text-red-900">删除</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Batch Tab */}
        {activeTab === 'batch' && (
          <div className="bg-white rounded-xl p-8 shadow-sm border">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">批量操作</h2>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    {selectedVideos.length === videos.length ? '取消全选' : '全选'}
                  </button>
                  <span className="text-sm text-gray-600">
                    已选择 {selectedVideos.length} 个视频
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBatchOperation('activate')}
                    disabled={selectedVideos.length === 0}
                    className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    批量激活
                  </button>
                  <button
                    onClick={() => handleBatchOperation('deactivate')}
                    disabled={selectedVideos.length === 0}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-md text-sm font-medium hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    批量停用
                  </button>
                  <button
                    onClick={() => handleBatchOperation('delete')}
                    disabled={selectedVideos.length === 0}
                    className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    批量删除
                  </button>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((video) => (
                <div 
                  key={video.id} 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedVideos.includes(video.id) 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    if (selectedVideos.includes(video.id)) {
                      setSelectedVideos(selectedVideos.filter(id => id !== video.id));
                    } else {
                      setSelectedVideos([...selectedVideos, video.id]);
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedVideos.includes(video.id)}
                      onChange={() => {}}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-12 h-8 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{video.title}</div>
                      <div className="text-xs text-gray-500">{video.category.displayName}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
