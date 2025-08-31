// app/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Slide = {
  id: number;
  title: string;
  excerpt: string;
  tag: string;
  image: string;
};

const slidesSeed: Slide[] = [
  {
    id: 1,
    title: "Cultural Fluency in Global Literary Pedagogy",
    excerpt: "订阅制学术英语课程：每周2次直播 + 作业精批 + 术语速记包，培养跨文化阅读与表达能力。",
    tag: "订阅课程",
    image: "https://picsum.photos/id/1011/1200/700",
  },
  {
    id: 2,
    title: "EAP-Enriched Curriculum for Universities",
    excerpt: "学术英语强化路径：写作模板库、口语演练房、资料检索工作坊，按月订阅随时加入。",
    tag: "订阅课程",
    image: "https://picsum.photos/id/1005/1200/700",
  },
  {
    id: 3,
    title: "Assessment for Learning in ELT",
    excerpt: "学习评估即学习：阶段测评 + 个性化学习单，形成性反馈驱动持续进步。",
    tag: "订阅课程",
    image: "https://picsum.photos/id/1025/1200/700",
  },
];

const rightPosts = [
  {
    id: 11,
    title: "Speaking for Academic Purposes",
    date: "2025-08-10",
    image: "https://picsum.photos/id/64/300/200",
  },
  {
    id: 12,
    title: "The Way of the Fantasist",
    date: "2024-10-18",
    image: "https://picsum.photos/id/65/300/200",
  },
  {
    id: 13,
    title: "Metaphysical Intersections in Language",
    date: "2024-03-14",
    image: "https://picsum.photos/id/66/300/200",
  },
  {
    id: 14,
    title: "Textual Surveillance and Sublime Voices",
    date: "2023-03-10",
    image: "https://picsum.photos/id/67/300/200",
  },
];

// 网格卡片数据（预留用于未来功能）
// const gridCards = [
//   {
//     id: 21,
//     title: "Contemplating the Future of EMI Assessment",
//     date: "2024-05-31",
//     image: "https://picsum.photos/id/1035/600/400",
//   },
//   {
//     id: 22,
//     title: "EAP-Enriched Curriculum at WKU",
//     date: "2024-05-31",
//     image: "https://picsum.photos/id/1041/600/400",
//   },
//   {
//     id: 23,
//     title: "ESL Curriculum in Sino-American Context",
//     date: "2022-09-10",
//     image: "https://picsum.photos/id/1043/600/400",
//   },
//   {
//     id: 24,
//     title: "Mythopoeic Function of Fantasy",
//     date: "2022-09-10",
//     image: "https://picsum.photos/id/1047/600/400",
//   },
// ];

const pricingPlans = [
  {
    id: "monthly",
    name: "月付计划",
    price: "¥299",
    period: "/月",
    highlight: false,
    features: [
      "每周2次直播小班课",
      "作业批改与要点讲义",
      "课程回放与练习题库",
    ],
  },
  {
    id: "quarter",
    name: "季付计划",
    price: "¥799",
    period: "/季",
    highlight: true,
    features: [
      "每周3次直播与口语演练房",
      "导师精批（写作/演讲各2次/月）",
      "学术术语速记包与检索工作坊",
    ],
  },
  {
    id: "term",
    name: "学期计划（16周）",
    price: "¥999",
    period: "/学期",
    highlight: false,
    features: [
      "听说读写与学术规范",
      "阶段测评与个性化学习单",
      "升学/考试规划与学情报告",
    ],
  },
];

export default function Home() {
  const [current, setCurrent] = useState(0);
  const slides = useMemo(() => slidesSeed, []);
  const router = useRouter();

  const [authRole, setAuthRole] = useState<"STUDENT" | "ADMIN" | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(id);
  }, [slides.length]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("tc_auth");
      if (raw) {
        const parsed = JSON.parse(raw) as { role: "STUDENT" | "ADMIN"; id: string };
        setAuthRole(parsed.role);
      } else {
        setAuthRole(null);
      }
    } catch {
      setAuthRole(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("tc_auth");
    setAuthRole(null);
  };

  return (
    <main className="min-h-screen bg-white text-black">
      {/* Top info bar */}
      <div className="hidden md:block bg-gray-100 text-xs text-black">
        <div className="mx-auto max-w-6xl px-4 py-2 flex items-center gap-6 overflow-x-auto">
          <span className="inline-flex items-center rounded-full bg-rose-600 text-white px-2 py-0.5 font-semibold">Research Highlights</span>
          <a className="shrink-0 hover:text-gray-600" href="#">EAP-Enriched Curriculum</a>
          <a className="shrink-0 hover:text-gray-600" href="#">Workshops</a>
          <a className="ml-auto shrink-0 text-gray-600" href="#">{new Date().toLocaleDateString()}</a>
        </div>
      </div>

      {/* Site title */}
      <div className="mx-auto max-w-6xl px-4 py-6 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-black">Tiffany&rsquo;s College</h1>
        <p className="mt-2 text-sm text-black">订阅式英语课程｜学术英语｜考试与升学路径｜小班制与导师精批</p>
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-20 bg-black text-white">
        <nav className="mx-auto max-w-6xl px-4">
          <div className="flex items-center gap-6 text-sm font-medium">
            <a className="py-3 border-b-2 border-rose-600">HOME</a>
            <a className="py-3 hover:text-gray-300" href="/about">ABOUT</a>
            <a className="py-3 hover:text-gray-300" href="/videos">VIDEOS</a>
            <a className="py-3 hover:text-gray-300" href="/dashboard">DASHBOARD</a>
            <a className="py-3 hover:text-gray-300" href="#courses">COURSES</a>
            <a className="py-3 hover:text-gray-300" href="#service">SERVICE</a>
            <a className="py-3 hover:text-gray-300" href="#pricing">PRICING</a>
            <a className="py-3 hover:text-gray-300" href="#blog">BLOG</a>
            <a className="py-3 hover:text-gray-300" href="#contact">CONTACT</a>
            <a className="py-3 hover:text-gray-300" href="/admin">ADMIN</a>
            <div className="ml-auto flex items-center gap-3 py-2">
              {authRole && (
                <span className="hidden md:inline-flex items-center gap-2 bg-white/10 text-white px-2 py-1 rounded">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                  已登录：{authRole === "ADMIN" ? "管理员" : "学生"}
                </span>
              )}
              <input placeholder="Search" className="hidden md:block bg-white/10 placeholder-gray-300 focus:bg-white/20 transition-colors rounded px-3 py-1 text-sm outline-none" />
              <span className="text-gray-300">🔍</span>
              <div className="flex items-center gap-2">
                {!authRole && (
                  <>
                    <button 
                      onClick={() => router.push("/student-login")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      学生登录
                    </button>
                    <button 
                      onClick={() => router.push("/admin-login")}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      管理员登录
                    </button>
                  </>
                )}
                {authRole && (
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                  >
                    退出登录
                  </button>
                )}
              </div>
            </div>
          </div>
          </nav>
      </header>

      {/* Main hero + sidebar */}
      <section className="border-b text-black">
        <div className="mx-auto max-w-6xl px-4 py-8 grid md:grid-cols-3 gap-6">
          {/* Slider */}
          <div className="md:col-span-2 relative overflow-hidden rounded-lg">
            {slides.map((s, idx) => (
              <article
                key={s.id}
                className={`absolute inset-0 transition-opacity duration-700 ${idx === current ? "opacity-100" : "opacity-0"}`}
              >
                <div className="relative h-[380px] md:h-[460px] w-full">
                  <img src={s.image} alt={s.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute left-5 right-5 bottom-5 text-white">
                    <span className="inline-block bg-rose-600 text-xs font-semibold px-2 py-1 rounded">{s.tag}</span>
                    <h2 className="mt-3 text-2xl md:text-3xl font-extrabold leading-tight">{s.title}</h2>
                    <p className="mt-2 text-sm md:text-base text-gray-200 max-w-2xl">{s.excerpt}</p>
                  </div>
            </div>
              </article>
            ))}
            {/* Slider controls */}
            <button aria-label="Prev" onClick={() => setCurrent((p) => (p - 1 + slides.length) % slides.length)} className="absolute left-2 top-1/2 -translate-y-1/2 grid place-items-center size-9 rounded-full bg-black/50 text-white">‹</button>
            <button aria-label="Next" onClick={() => setCurrent((p) => (p + 1) % slides.length)} className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center size-9 rounded-full bg-black/50 text-white">›</button>
            <div className="absolute left-1/2 -translate-x-1/2 bottom-3 flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`size-2.5 rounded-full ${i === current ? "bg-white" : "bg-white/50"}`}
                />
              ))}
            </div>
          </div>

          {/* Sidebar posts */}
          <aside className="md:col-span-1">
            <div className="space-y-5">
              {rightPosts.map((p) => (
                <a key={p.id} href="#" className="flex gap-3 group">
                  <img src={p.image} alt="thumb" className="size-24 object-cover rounded" />
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold group-hover:underline line-clamp-2 text-black">{p.title}</h3>
                    <div className="mt-1 text-xs text-black">{new Date(p.date).toLocaleDateString()}</div>
                  </div>
                </a>
              ))}
            </div>
          </aside>
        </div>
      </section>

      {/* Intro Section */}
      <section className="border-y bg-white text-black">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-2">
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">Tiffany’s College · 认知语言科学驱动的英语学习</h2>
              <p className="text-lg leading-relaxed mb-6">
                我们以“认知诊断—策略指导—能力迁移”为核心路径，结合 AI 学习分析，为中国学习者构建高效的学术英语训练体系。订阅制课程覆盖 IELTS 听说读写与科研写作，提供直播小班、作业精批与可视化进度跟踪。
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="rounded-xl border p-4">
                  <h4 className="font-semibold mb-1">认知诊断</h4>
                  <p className="text-sm text-gray-600">定位语言瓶颈，识别母语负迁移</p>
                </div>
                <div className="rounded-xl border p-4">
                  <h4 className="font-semibold mb-1">策略指导</h4>
                  <p className="text-sm text-gray-600">方法可操作，练习有反馈可追踪</p>
                </div>
                <div className="rounded-xl border p-4">
                  <h4 className="font-semibold mb-1">能力迁移</h4>
                  <p className="text-sm text-gray-600">从考试到学术与职场表达的迁移</p>
                </div>
              </div>
            </div>
            <div>
              <div className="rounded-2xl border overflow-hidden shadow-sm">
                <img src="https://picsum.photos/id/1050/800/560" alt="Tiffany’s College" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* IELTS Video Learning Section */}
      <section className="border-y text-black bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-extrabold mb-6 text-black">
              🎯 雅思视频教学中心
            </h2>
            <p className="text-xl text-black max-w-4xl mx-auto leading-relaxed">
              基于认知语言科学的雅思备考体系，独创&ldquo;认知诊断-策略指导-能力迁移&rdquo;三维培养模型
            </p>
            <p className="text-lg text-black mt-4 max-w-3xl mx-auto">
              专为中国学生设计，解决母语负迁移带来的深层认知障碍，培养英语思维能力
            </p>
          </div>
          
          {/* Four Skills Grid */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {/* Writing Skills */}
            <div className="bg-white rounded-2xl p-8 border hover:bg-gray-50 transition-all duration-300 group">
              <div className="flex items-start gap-6">
                <div className="text-6xl group-hover:scale-110 transition-transform duration-300"></div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 text-black">写作技能训练</h3>
                  <div className="space-y-3 text-black">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
                      <span>Task 1: 图表描述认知策略</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
                      <span>Task 2: 议论文批判性思维构建</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
                      <span>母语负迁移分析与纠正</span>
                    </div>
                  </div>
                  <div className="mt-4 inline-flex items-center gap-2 bg-emerald-100 px-4 py-2 rounded-full text-sm text-black">
                    <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
                    认知科学导向
                  </div>
                </div>
              </div>
            </div>

            {/* Speaking Skills */}
            <div className="bg-white rounded-2xl p-8 border hover:bg-gray-50 transition-all duration-300 group">
              <div className="flex items-start gap-6">
                <div className="text-6xl group-hover:scale-110 transition-transform duration-300">🗣️</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 text-black">口语表达提升</h3>
                  <div className="space-y-3 text-black">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
                      <span>Part 1: 个人信息流畅表达</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
                      <span>Part 2: 话题展开策略训练</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
                      <span>Part 3: 深度讨论与辩论技巧</span>
                    </div>
                  </div>
                  <div className="mt-4 inline-flex items-center gap-2 bg-emerald-100 px-4 py-2 rounded-full text-sm text-black">
                    <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
                    策略指导体系
                  </div>
                </div>
              </div>
            </div>

            {/* Reading Skills */}
            <div className="bg-white rounded-2xl p-8 border hover:bg-gray-50 transition-all duration-300 group">
              <div className="flex items-start gap-6">
                <div className="text-6xl group-hover:scale-110 transition-transform duration-300"></div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 text-black">阅读策略掌握</h3>
                  <div className="space-y-3 text-black">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
                      <span>Skimming: 快速主旨把握</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
                      <span>Scanning: 精准信息定位</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
                      <span>深度理解与批判性分析</span>
                    </div>
                  </div>
                  <div className="mt-4 inline-flex items-center gap-2 bg-emerald-100 px-4 py-2 rounded-full text-sm text-black">
                    <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
                    能力迁移训练
                  </div>
                </div>
          </div>
        </div>

            {/* Listening Skills */}
            <div className="bg-white rounded-2xl p-8 border hover:bg-gray-50 transition-all duration-300 group">
              <div className="flex items-start gap-6">
                <div className="text-6xl group-hover:scale-110 transition-transform duration-300">👂</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 text-black">听力技巧培养</h3>
                  <div className="space-y-3 text-black">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
                      <span>预测技巧与关键词识别</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
                      <span>语音语调变化感知</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
                      <span>上下文推理与信息整合</span>
                    </div>
                  </div>
                  <div className="mt-4 inline-flex items-center gap-2 bg-emerald-100 px-4 py-2 rounded-full text-sm text-black">
                    <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
                    认知诊断应用
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features & CTA */}
          <div className="text-center text-black">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 border">
                <div className="text-3xl mb-3"></div>
                <h4 className="text-lg font-semibold mb-2 text-black">认知科学设计</h4>
                <p className="text-sm text-black">基于认知语言科学的课程设计，解决深层学习障碍</p>
              </div>
              <div className="bg-white rounded-xl p-6 border">
                <div className="text-3xl mb-3">🎯</div>
                <h4 className="text-lg font-semibold mb-2 text-black">个性化学习路径</h4>
                <p className="text-sm text-black">VARK学习风格分析，定制专属学习策略</p>
              </div>
              <div className="bg-white rounded-xl p-6 border">
                <div className="text-3xl mb-3">🔒</div>
                <h4 className="text-lg font-semibold mb-2 text-black">企业级安全保护</h4>
                <p className="text-sm text-black">IP绑定、防录屏、权限管理，保护知识产权</p>
              </div>
            </div>
            
            <a
              href="/videos"
              className="inline-flex items-center gap-4 bg-gray-100 text-black px-12 py-6 rounded-2xl text-2xl font-bold hover:bg-gray-200 transition-all duration-300 shadow-2xl"
            >
              🚀 进入雅思视频教学中心
              <span className="text-3xl">→</span>
            </a>
            
            <div className="mt-8 flex items-center justify-center gap-8 text-black">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-emerald-600 rounded-full"></span>
                <span>IP地址绑定</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-emerald-600 rounded-full"></span>
                <span>防录屏下载</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-emerald-600 rounded-full"></span>
                <span>权限到期管理</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-emerald-600 rounded-full"></span>
                <span>认知进度追踪</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid section: Conference Papers */}
      
      {/* Two-column stripe like proposals + desk */}
      
      {/* Pricing */}
      <section id="pricing" className="border-t text-black">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight"><span className="border-l-4 border-rose-600 pl-3">PLANS & PRICING</span></h2>
          <p className="mt-2 text-black">三种订阅周期，随时升级或续费。所有计划均含回放与作业批改，支持7天可退款试学。</p>

          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {pricingPlans.map((p) => (
              <div key={p.id} className={`rounded-lg border overflow-hidden ${p.highlight ? "ring-2 ring-rose-600" : ""}`}>
                <div className={`p-5 ${p.highlight ? "bg-black text-white" : "bg-white"}`}>
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-lg font-semibold">{p.name}</h3>
                    {p.highlight && <span className="text-xs bg-rose-600 text-white rounded px-2 py-0.5">Most Popular</span>}
                  </div>
                  <div className="mt-3"><span className="text-3xl font-extrabold">{p.price}</span><span className="ml-1 text-sm opacity-80">{p.period}</span></div>
                </div>
                <ul className="p-5 space-y-2 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="mt-0.5 text-rose-600">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="px-5 pb-5">
            <button
                    onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                    className={`w-full rounded-md px-4 py-2 text-sm font-medium ${p.highlight ? "bg-black text-white hover:opacity-90" : "border hover:bg-gray-50"}`}
            >
                    立即订阅 / 咨询与开通
            </button>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 text-xs text-black">结算占位：点击按钮将滚动到“联系”表单，可接入支付后端（如 Stripe/支付宝服务商）替换为安全结算链接。</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white text-black">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-black flex flex-col md:flex-row gap-3 items-center justify-between">
          <span>© {new Date().getFullYear()} Tiffany&rsquo;s College</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-800">Privacy</a>
            <a href="#" className="hover:text-gray-800">Terms</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
