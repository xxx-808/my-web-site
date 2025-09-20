"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Student {
  id: string;
  name: string;
  email: string;
  subscription: "basic" | "pro";
  expiresAt: string;
}

interface Video {
  id: string;
  title: string;
  category: "writing" | "speaking" | "reading" | "listening";
  duration: string;
  description: string;
  thumbnail: string;
  accessLevel: "basic" | "pro";
}

export default function StudentLoginPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
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
        const parsed = JSON.parse(raw) as { role: "STUDENT" | "ADMIN"; id: string; plan?: "basic" | "pro" };
        if (parsed.role === "STUDENT") {
          setIsLoggedIn(true);
          setStudent({ ...mockStudent, subscription: parsed.plan ?? mockStudent.subscription });
        }
      }
    } catch {}
  }, []);

  // 模拟学生数据（可切换 basic/pro 验证权限）
  const mockStudent: Student = {
    id: "student_001",
    name: "张同学",
    email: "student@example.com",
    subscription: "pro",
    expiresAt: "2025-12-31",
  };

  // 模拟视频数据
  const mockVideos: Video[] = [
    {
      id: "video_001",
      title: "雅思写作Task 1: 图表描述认知策略",
      category: "writing",
      duration: "45:30",
      description: "基于认知科学的图表描述方法，解决中国学生常见表达障碍",
      thumbnail: "https://picsum.photos/id/1011/400/225",
      accessLevel: "pro",
    },
    {
      id: "video_002",
      title: "雅思口语Part 2: 话题展开策略训练",
      category: "speaking",
      duration: "52:15",
      description: "运用认知语言学理论，培养话题深度展开能力",
      thumbnail: "https://picsum.photos/id/1005/400/225",
      accessLevel: "pro",
    },
    {
      id: "video_003",
      title: "雅思阅读: Skimming与Scanning技巧",
      category: "reading",
      duration: "38:45",
      description: "认知阅读策略训练，提高信息定位与理解效率",
      thumbnail: "https://picsum.photos/id/1025/400/225",
      accessLevel: "basic",
    },
    {
      id: "video_004",
      title: "雅思听力: 预测技巧与关键词识别",
      category: "listening",
      duration: "41:20",
      description: "基于认知负荷理论的听力训练方法",
      thumbnail: "https://picsum.photos/id/1041/400/225",
      accessLevel: "basic",
    },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 调用真实的登录API
      const response = await fetch('/api/auth/login', {
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

      const data = await response.json();

      if (data.success && data.user) {
        const user = data.user;
        setIsLoggedIn(true);
        
        // 创建学生对象
        const studentData: Student = {
          id: user.id,
          name: user.name,
          email: user.email,
          subscription: user.subscription?.accessLevel === 'PREMIUM' ? 'pro' : 'basic',
          expiresAt: user.subscription?.endDate ? new Date(user.subscription.endDate).toISOString().split('T')[0] : '2025-12-31',
        };
        
        setStudent(studentData);
        
        // 记住登录状态
        localStorage.setItem("tc_auth", JSON.stringify({ 
          role: "STUDENT", 
          id: user.id, 
          plan: studentData.subscription 
        }));
        
        setError("");
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

  const handleLogout = () => {
    setIsLoggedIn(false);
    setStudent(null);
    setEmail("");
    setPassword("");
    localStorage.removeItem("tc_auth");
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "writing": return "✍️";
      case "speaking": return "🗣️";
      case "reading": return "📖";
      case "listening": return "👂";
      default: return "📚";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "writing": return "bg-blue-100 text-blue-800";
      case "speaking": return "bg-green-100 text-green-800";
      case "reading": return "bg-purple-100 text-purple-800";
      case "listening": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // 分类中文标签
  const categoryLabels: Record<Video["category"], string> = {
    writing: "写作技能",
    speaking: "口语表达",
    reading: "阅读策略",
    listening: "听力技巧",
  };

  if (isLoggedIn && student) {
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
                <h1 className="text-2xl font-bold text-gray-900">学生中心</h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{student.name}</span>
                  <span className="mx-2">•</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    student.subscription === "pro" 
                      ? "bg-emerald-100 text-emerald-800" 
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    {student.subscription === "pro" ? "Pro 会员" : "普通会员"}
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
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-8 text-white mb-8">
            <h2 className="text-3xl font-bold mb-4">欢迎回来，{student.name}！</h2>
            <p className="text-emerald-100 text-lg mb-4">
              基于认知语言科学的雅思备考体系，专为你定制
            </p>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-emerald-300 rounded-full"></span>
                <span>会员到期: {new Date(student.expiresAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-emerald-300 rounded-full"></span>
                <span>可观看视频: {mockVideos.length} 个</span>
              </div>
            </div>
          </div>

          {/* Video Categories */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">雅思技能模块</h3>
            <div className="grid md:grid-cols-4 gap-6">
              {["writing", "speaking", "reading", "listening"].map((category) => {
                const categoryVideos = mockVideos.filter(v => v.category === category);
                const label = categoryLabels[category as Video["category"]];
                
                return (
                  <div key={category} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
                    <div className="text-4xl mb-3">{getCategoryIcon(category)}</div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{label}</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      {categoryVideos.length} 个视频课程
                    </p>
                    <div className="text-xs text-gray-500">
                      基于认知科学设计，解决深层学习障碍
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Video List */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">所有视频课程</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockVideos.map((video) => (
                <div key={video.id} className="bg-white rounded-xl overflow-hidden shadow-sm border hover:shadow-md transition-shadow">
                  <div className="relative">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title} 
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        video.accessLevel === "pro" 
                          ? "bg-emerald-100 text-emerald-800" 
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {video.accessLevel === "pro" ? "Pro" : "Basic"}
                      </span>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      {video.duration}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(video.category)}`}>
                        {getCategoryIcon(video.category)} {
                          {writing: "写作", speaking: "口语", reading: "阅读", listening: "听力"}[video.category]
                        }
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{video.title}</h4>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{video.description}</p>
                    <button 
                      onClick={() => router.push(`/videos?student=${student.id}&video=${video.id}`)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
                    >
                      观看视频
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Access Notice */}
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-blue-900 mb-3">📚 学习须知</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <h5 className="font-medium mb-2">✅ 可以做的：</h5>
                <ul className="space-y-1">
                  <li>• 在线观看所有视频课程</li>
                  <li>• 重复观看学习内容</li>
                  <li>• 查看学习进度和笔记</li>
                  <li>• 参与在线讨论和问答</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">❌ 禁止做的：</h5>
                <ul className="space-y-1">
                  <li>• 下载视频文件</li>
                  <li>• 录屏或截图分享</li>
                  <li>• 将账号借给他人使用</li>
                  <li>• 商业用途传播内容</li>
                </ul>
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
          <h2 className="text-3xl font-bold text-gray-900">学生登录</h2>
          <p className="mt-2 text-sm text-gray-600">
            登录后访问雅思视频教学中心
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                邮箱地址
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
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="请输入密码"
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
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "登录中..." : "登录"}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="text-sm text-emerald-600 hover:text-emerald-500"
            >
              返回首页
            </button>
          </div>
        </form>

        {/* Demo Account Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">演示账号</h4>
          <p className="text-xs text-blue-700">
            邮箱: student@example.com<br />
            密码: password123
          </p>
        </div>
      </div>
    </div>
  );
}
