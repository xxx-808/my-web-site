"use client";

import { useState, useEffect } from "react";
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

  // 恢复登录状态（本地存储）
  useEffect(() => {
    try {
      const raw = localStorage.getItem("tc_auth");
      if (raw) {
        const parsed = JSON.parse(raw) as { role: "STUDENT" | "ADMIN"; id: string };
        if (parsed.role === "ADMIN") {
          setIsLoggedIn(true);
          setAdmin(mockAdmin);
        }
      }
    } catch {}
  }, []);

  // 模拟管理员数据
  const mockAdmin: Admin = {
    id: "admin_001",
    name: "管理员",
    email: "admin@tiffanyscollege.com",
    role: "超级管理员",
    permissions: ["用户管理", "视频管理"],
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
        // 记住登录（站内持久）
        localStorage.setItem("tc_auth", JSON.stringify({ role: "ADMIN", id: mockAdmin.id }));
        setError("");
      } else {
        setError("邮箱或密码错误");
      }
    } catch {
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
    localStorage.removeItem("tc_auth");
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
                  className="bg-red-600 hover:bg-red-700 text白 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  退出登录
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Two Modules Only */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg白 rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
              <div className="text-4xl mb-3">👥</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">用户管理</h4>
              <p className="text-sm text-gray-600 mb-4">管理学生账户、权限与订阅套餐</p>
              <button 
                onClick={() => router.push("/admin")}
                className="w-full bg-purple-600 hover:bg-purple-700 text白 py-2 px-4 rounded-md text-sm font-medium transition-colors"
              >
                进入用户管理
              </button>
            </div>

            <div className="bg白 rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
              <div className="text-4xl mb-3">🎥</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">视频管理</h4>
              <p className="text-sm text-gray-600 mb-4">上传、编辑与访问控制（Basic/Pro）</p>
              <button 
                onClick={() => router.push("/admin/video-management")}
                className="w-full bg-purple-600 hover:bg-purple-700 text白 py-2 px-4 rounded-md text-sm font-medium transition-colors"
              >
                进入视频管理
              </button>
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
            登录后进入控制台
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
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text白 bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
