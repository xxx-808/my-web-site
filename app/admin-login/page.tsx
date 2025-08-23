"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

export default function AdminLoginPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // 模拟管理员数据
  const mockAdmin: Admin = {
    id: "admin_001",
    name: "管理员",
    email: "admin@tiffanyscollege.com",
    role: "超级管理员",
    permissions: ["用户管理", "视频管理", "权限控制", "数据分析", "系统设置"],
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 模拟登录验证
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email === "admin@tiffanyscollege.com" && password === "admin123") {
        setIsLoggedIn(true);
        setAdmin(mockAdmin);
        setError("");
      } else {
        setError("邮箱或密码错误");
      }
    } catch (err) {
      setError("登录失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAdmin(null);
    setEmail("");
    setPassword("");
  };

  if (isLoggedIn && admin) {
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
                <h1 className="text-2xl font-bold text-gray-900">管理员控制台</h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{admin.name}</span>
                  <span className="mx-2">•</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {admin.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  退出登录
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-8 text-white mb-8">
            <h2 className="text-3xl font-bold mb-4">欢迎回来，{admin.name}！</h2>
            <p className="text-purple-100 text-lg mb-4">
              管理系统用户、视频权限和系统设置
            </p>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-purple-300 rounded-full"></span>
                <span>角色: {admin.role}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-purple-300 rounded-full"></span>
                <span>权限: {admin.permissions.length} 项</span>
              </div>
            </div>
          </div>

          {/* Admin Dashboard */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
              <div className="text-4xl mb-3">👥</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">用户管理</h4>
              <p className="text-sm text-gray-600 mb-4">管理学生账户、权限和订阅</p>
              <button 
                onClick={() => router.push("/admin")}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
              >
                进入用户管理
              </button>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
              <div className="text-4xl mb-3">🎥</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">视频管理</h4>
              <p className="text-sm text-gray-600 mb-4">上传、编辑和权限控制</p>
                             <button 
                 onClick={() => router.push("/admin/video-management")}
                 className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
               >
                 进入视频管理
               </button>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
              <div className="text-4xl mb-3">🔒</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">权限控制</h4>
              <p className="text-sm text-gray-600 mb-4">IP绑定、防录屏设置</p>
              <button 
                onClick={() => router.push("/admin")}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
              >
                进入权限控制
              </button>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
              <div className="text-4xl mb-3">📊</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">数据分析</h4>
              <p className="text-sm text-gray-600 mb-4">学习进度和访问统计</p>
              <button 
                onClick={() => router.push("/admin")}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
              >
                查看数据报告
              </button>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
              <div className="text-4xl mb-3">⚙️</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">系统设置</h4>
              <p className="text-sm text-gray-600 mb-4">网站配置和系统参数</p>
              <button 
                onClick={() => router.push("/admin")}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
              >
                系统设置
              </button>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
              <div className="text-4xl mb-3">📚</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">内容管理</h4>
              <p className="text-sm text-gray-600 mb-4">课程、模块和材料管理</p>
              <button 
                onClick={() => router.push("/admin")}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
              >
                内容管理
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">系统概览</h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">156</div>
                <div className="text-sm text-gray-600">注册学生</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">42</div>
                <div className="text-sm text-gray-600">视频课程</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">89%</div>
                <div className="text-sm text-gray-600">活跃用户</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">2.3K</div>
                <div className="text-sm text-gray-600">今日访问</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">管理员登录</h2>
          <p className="mt-2 text-sm text-gray-600">
            登录后访问管理员控制台
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                管理员邮箱
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="请输入管理员邮箱"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                管理员密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="请输入管理员密码"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "登录中..." : "登录"}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="text-sm text-purple-600 hover:text-purple-500"
            >
              返回首页
            </button>
          </div>
        </form>

        {/* Demo Account Info */}
        <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-purple-900 mb-2">演示账号</h4>
          <p className="text-xs text-purple-700">
            邮箱: admin@tiffanyscollege.com<br />
            密码: admin123
          </p>
        </div>
      </div>
    </div>
  );
}
