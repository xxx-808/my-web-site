"use client";

import { useState, useEffect } from "react";

interface UserAccess {
  id: string;
  name: string;
  email: string;
  ipAddress: string;
  accessLevel: 'basic' | 'premium' | 'admin';
  accessUntil: string;
  allowedVideos: string[];
  createdAt: string;
  lastAccess: string;
}

interface VideoAccess {
  id: string;
  title: string;
  allowedIPs: string[];
  expiresAt: string;
  allowDownload: boolean;
  allowScreenRecord: boolean;
}

const sampleUsers: UserAccess[] = [
  {
    id: "1",
    name: "张三",
    email: "zhangsan@example.com",
    ipAddress: "192.168.1.100",
    accessLevel: "premium",
    accessUntil: "2025-12-31",
    allowedVideos: ["ielts-writing-task1", "ielts-speaking-part2", "ielts-reading-skills"],
    createdAt: "2024-01-15",
    lastAccess: "2024-08-19",
  },
  {
    id: "2",
    name: "李四",
    email: "lisi@example.com",
    ipAddress: "192.168.1.101",
    accessLevel: "basic",
    accessUntil: "2024-12-31",
    allowedVideos: ["ielts-writing-task1"],
    createdAt: "2024-02-20",
    lastAccess: "2024-08-18",
  },
];

const sampleVideos: VideoAccess[] = [
  {
    id: "ielts-writing-task1",
    title: "雅思写作 Task 1 - 图表描述技巧",
    allowedIPs: ["192.168.1.100", "192.168.1.101"],
    expiresAt: "2025-12-31",
    allowDownload: false,
    allowScreenRecord: false,
  },
  {
    id: "ielts-speaking-part2",
    title: "雅思口语 Part 2 - 话题展开策略",
    allowedIPs: ["192.168.1.100"],
    expiresAt: "2025-12-31",
    allowDownload: false,
    allowScreenRecord: false,
  },
  {
    id: "ielts-reading-skills",
    title: "雅思阅读 - 快速定位与理解技巧",
    allowedIPs: ["192.168.1.100"],
    expiresAt: "2025-12-31",
    allowDownload: false,
    allowScreenRecord: false,
  },
];

export default function AdminPage() {
  const [users, setUsers] = useState<UserAccess[]>(sampleUsers);
  const [videos, setVideos] = useState<VideoAccess[]>(sampleVideos);
  const [activeTab, setActiveTab] = useState<'users' | 'videos' | 'analytics'>('users');
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddVideo, setShowAddVideo] = useState(false);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    ipAddress: "",
    accessLevel: "basic" as const,
    accessUntil: "",
    allowedVideos: [] as string[],
  });

  const [newVideo, setNewVideo] = useState({
    title: "",
    allowedIPs: [] as string[],
    expiresAt: "",
    allowDownload: false,
    allowScreenRecord: false,
  });

  const handleAddUser = () => {
    if (newUser.name && newUser.email && newUser.ipAddress) {
      const user: UserAccess = {
        id: Date.now().toString(),
        ...newUser,
        createdAt: new Date().toISOString().split('T')[0],
        lastAccess: new Date().toISOString().split('T')[0],
      };
      setUsers([...users, user]);
      setNewUser({
        name: "",
        email: "",
        ipAddress: "",
        accessLevel: "basic",
        accessUntil: "",
        allowedVideos: [],
      });
      setShowAddUser(false);
    }
  };

  const handleAddVideo = () => {
    if (newVideo.title) {
      const video: VideoAccess = {
        id: newVideo.title.toLowerCase().replace(/\s+/g, '-'),
        ...newVideo,
      };
      setVideos([...videos, video]);
      setNewVideo({
        title: "",
        allowedIPs: [],
        expiresAt: "",
        allowDownload: false,
        allowScreenRecord: false,
      });
      setShowAddVideo(false);
    }
  };

  const removeUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  const removeVideo = (videoId: string) => {
    setVideos(videos.filter(video => video.id !== videoId));
  };

  const updateUserAccess = (userId: string, field: keyof UserAccess, value: any) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, [field]: value } : user
    ));
  };

  const updateVideoAccess = (videoId: string, field: keyof VideoAccess, value: any) => {
    setVideos(videos.map(video => 
      video.id === videoId ? { ...video, [field]: value } : video
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tiffany&rsquo;s College 管理后台</h1>
              <p className="text-sm text-gray-600">IP权限管理 • 视频访问控制 • 用户管理</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                管理员模式
              </span>
              <a
                href="/"
                className="text-gray-600 hover:text-gray-900"
              >
                返回首页
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'users', label: '用户管理', count: users.length },
              { id: 'videos', label: '视频权限', count: videos.length },
              { id: 'analytics', label: '访问统计', count: 0 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'users' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">用户访问权限管理</h2>
              <button
                onClick={() => setShowAddUser(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                添加用户
              </button>
            </div>

            {/* Users Table */}
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      用户信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP地址
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      访问级别
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      权限到期
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
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {user.ipAddress}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.accessLevel === 'admin' ? 'bg-red-100 text-red-800' :
                          user.accessLevel === 'premium' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.accessLevel === 'admin' ? '管理员' :
                           user.accessLevel === 'premium' ? '高级用户' : '基础用户'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.accessUntil}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => removeUser(user.id)}
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

        {activeTab === 'videos' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">视频访问权限管理</h2>
              <button
                onClick={() => setShowAddVideo(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                添加视频
              </button>
            </div>

            {/* Videos Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <div key={video.id} className="bg-white rounded-lg border p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{video.title}</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        允许的IP地址
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {video.allowedIPs.map((ip, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {ip}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        权限到期
                      </label>
                      <span className="text-sm text-gray-900">{video.expiresAt}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={video.allowDownload}
                          onChange={(e) => updateVideoAccess(video.id, 'allowDownload', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">允许下载</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={video.allowScreenRecord}
                          onChange={(e) => updateVideoAccess(video.id, 'allowScreenRecord', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">允许录屏</span>
                      </label>
                    </div>
                    <button
                      onClick={() => removeVideo(video.id)}
                      className="w-full bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                    >
                      删除视频
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">访问统计</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{users.length}</div>
                <div className="text-sm text-gray-500">总用户数</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{videos.length}</div>
                <div className="text-sm text-gray-500">视频数量</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">98%</div>
                <div className="text-sm text-gray-500">系统可用性</div>
              </div>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">IP地址</label>
                <input
                  type="text"
                  value={newUser.ipAddress}
                  onChange={(e) => setNewUser({...newUser, ipAddress: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="192.168.1.100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">访问级别</label>
                <select
                  value={newUser.accessLevel}
                  onChange={(e) => setNewUser({...newUser, accessLevel: e.target.value as any})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="basic">基础用户</option>
                  <option value="premium">高级用户</option>
                  <option value="admin">管理员</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">权限到期</label>
                <input
                  type="date"
                  value={newUser.accessUntil}
                  onChange={(e) => setNewUser({...newUser, accessUntil: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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

      {/* Add Video Modal */}
      {showAddVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">添加新视频</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">视频标题</label>
                <input
                  type="text"
                  value={newVideo.title}
                  onChange={(e) => setNewVideo({...newVideo, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">权限到期</label>
                <input
                  type="date"
                  value={newVideo.expiresAt}
                  onChange={(e) => setNewVideo({...newVideo, expiresAt: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newVideo.allowDownload}
                    onChange={(e) => setNewVideo({...newVideo, allowDownload: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">允许下载</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newVideo.allowScreenRecord}
                    onChange={(e) => setNewVideo({...newVideo, allowScreenRecord: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">允许录屏</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddVideo}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                添加视频
              </button>
              <button
                onClick={() => setShowAddVideo(false)}
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
