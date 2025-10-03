"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [userType, setUserType] = useState<"student" | "admin">("student");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 调用登录API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          role: userType === 'admin' ? 'ADMIN' : 'STUDENT'
        }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        // 记住登录状态
        localStorage.setItem("tc_auth", JSON.stringify({ 
          role: userType === 'admin' ? 'ADMIN' : 'STUDENT', 
          id: data.user.id, 
          plan: data.user.subscription?.accessLevel === 'PREMIUM' ? 'pro' : 'basic'
        }));
        
        // 根据用户类型跳转到不同页面
        if (userType === 'admin') {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } else {
        setError(data.error || "登录失败");
      }
    } catch (error) {
      console.error('登录错误:', error);
      setError("网络错误，请检查连接");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // 注册只支持学生
    if (userType === 'admin') {
      setError("管理员账号需要联系系统管理员创建");
      setLoading(false);
      return;
    }

    // 验证必填字段
    if (!name.trim()) {
      setError("请输入您的姓名");
      setLoading(false);
      return;
    }

    try {
      // 调用注册API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name: name.trim()
        }),
      });

      const data = await response.json();

      if (data.success) {
        // 注册成功后自动登录
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            role: 'STUDENT'
          }),
        });

        const loginData = await loginResponse.json();

        if (loginData.success && loginData.user) {
          // 记住登录状态
          localStorage.setItem("tc_auth", JSON.stringify({ 
            role: "STUDENT", 
            id: loginData.user.id, 
            plan: 'basic'
          }));
          
          // 注册并登录成功后跳转到首页
          router.push("/");
        } else {
          setError("注册成功，但自动登录失败，请手动登录");
          setIsRegisterMode(false);
        }
      } else {
        setError(data.error || "注册失败");
      }
    } catch (error) {
      console.error('注册错误:', error);
      setError("网络错误，请检查连接");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setError("");
    setEmail("");
    setPassword("");
    setName("");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            {isRegisterMode ? '用户注册' : '用户登录'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isRegisterMode ? '注册账号访问雅思视频教学中心' : '登录后访问雅思视频教学中心'}
          </p>
        </div>

        {/* 用户类型选择 */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setUserType('student')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              userType === 'student'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            学生登录
          </button>
          <button
            type="button"
            onClick={() => setUserType('admin')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              userType === 'admin'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            管理员登录
          </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={isRegisterMode ? handleRegister : handleLogin}>
          <div className="space-y-4">
            {isRegisterMode && userType === 'student' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  姓名
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="请输入您的姓名"
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {userType === 'admin' ? '管理员邮箱' : '邮箱地址'}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="请输入邮箱"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {userType === 'admin' ? '管理员密码' : '密码'}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                placeholder={isRegisterMode ? "密码至少6位字符" : "请输入密码"}
                minLength={isRegisterMode ? 6 : undefined}
              />
              {isRegisterMode && userType === 'student' && (
                <p className="mt-1 text-xs text-gray-500">
                  密码至少需要6位字符
                </p>
              )}
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
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (isRegisterMode ? "注册中..." : "登录中...") : (isRegisterMode ? "注册" : "登录")}
            </button>
          </div>

          <div className="text-center space-y-2">
            {userType === 'student' && (
              <button
                type="button"
                onClick={toggleMode}
                className="text-sm text-emerald-600 hover:text-emerald-500"
              >
                {isRegisterMode ? "已有账号？点击登录" : "没有账号？点击注册"}
              </button>
            )}
            <div>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="text-sm text-gray-600 hover:text-gray-500"
              >
                返回首页
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
