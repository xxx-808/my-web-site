// app/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

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

const gridCards = [
  {
    id: 21,
    title: "Contemplating the Future of EMI Assessment",
    date: "2024-05-31",
    image: "https://picsum.photos/id/1035/600/400",
  },
  {
    id: 22,
    title: "EAP-Enriched Curriculum at WKU",
    date: "2024-05-31",
    image: "https://picsum.photos/id/1041/600/400",
  },
  {
    id: 23,
    title: "ESL Curriculum in Sino-American Context",
    date: "2022-09-10",
    image: "https://picsum.photos/id/1043/600/400",
  },
  {
    id: 24,
    title: "Mythopoeic Function of Fantasy",
    date: "2022-09-10",
    image: "https://picsum.photos/id/1047/600/400",
  },
];

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

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Top info bar */}
      <div className="hidden md:block bg-gray-100 text-xs">
        <div className="mx-auto max-w-6xl px-4 py-2 flex items-center gap-6 overflow-x-auto">
          <span className="inline-flex items-center rounded-full bg-rose-600 text-white px-2 py-0.5 font-semibold">Research Highlights</span>
          <a className="shrink-0 hover:text-gray-600" href="#">EAP-Enriched Curriculum</a>
          <a className="shrink-0 hover:text-gray-600" href="#">Workshops</a>
          <a className="ml-auto shrink-0 text-gray-600" href="#">{new Date().toLocaleDateString()}</a>
        </div>
      </div>

      {/* Site title */}
      <div className="mx-auto max-w-6xl px-4 py-6 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">Tiffany&rsquo;s College</h1>
        <p className="mt-2 text-sm text-gray-600">订阅式英语课程｜学术英语｜考试与升学路径｜小班制与导师精批</p>
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-20 bg-black text-white">
        <nav className="mx-auto max-w-6xl px-4">
          <div className="flex items-center gap-6 text-sm font-medium">
            <a className="py-3 border-b-2 border-rose-600">HOME</a>
            <a className="py-3 hover:text-gray-300" href="#about">ABOUT</a>
            <a className="py-3 hover:text-gray-300" href="#courses">COURSES</a>
            <a className="py-3 hover:text-gray-300" href="#service">SERVICE</a>
            <a className="py-3 hover:text-gray-300" href="#pricing">PRICING</a>
            <a className="py-3 hover:text-gray-300" href="#blog">BLOG</a>
            <a className="py-3 hover:text-gray-300" href="#contact">CONTACT</a>
            <div className="ml-auto flex items-center gap-3 py-2">
              <input placeholder="Search" className="hidden md:block bg-white/10 placeholder-gray-300 focus:bg-white/20 transition-colors rounded px-3 py-1 text-sm outline-none" />
              <span className="text-gray-300">🔍</span>
            </div>
          </div>
        </nav>
      </header>

      {/* Main hero + sidebar */}
      <section className="border-b">
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
                    <h3 className="text-sm font-semibold group-hover:underline line-clamp-2">{p.title}</h3>
                    <div className="mt-1 text-xs text-gray-500">{new Date(p.date).toLocaleDateString()}</div>
                  </div>
                </a>
              ))}
            </div>
          </aside>
        </div>
      </section>

      {/* Grid section: Conference Papers */}
      <section className="">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight"><span className="border-l-4 border-rose-600 pl-3">CONFERENCE PAPERS</span></h2>
            <a href="#" className="text-sm text-rose-700 hover:underline">View all</a>
          </div>
          <div className="mt-6 grid md:grid-cols-4 gap-6">
            {gridCards.map((c) => (
              <article key={c.id} className="rounded-lg border overflow-hidden hover:shadow-sm">
                <img src={c.image} alt={c.title} className="aspect-[16/10] w-full object-cover" />
                <div className="p-4">
                  <div className="text-xs text-gray-500">{new Date(c.date).toLocaleDateString()}</div>
                  <h3 className="mt-2 font-semibold leading-snug line-clamp-2">{c.title}</h3>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">订阅后解锁：每周主题课程视频、要点讲义、练习题与参考答案，附学习清单与进度追踪。</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Two-column stripe like proposals + desk */}
      <section className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-10 grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight"><span className="border-l-4 border-rose-600 pl-3">RESEARCH PROPOSALS</span></h2>
            <div className="mt-6 grid md:grid-cols-2 gap-6">
              {[...gridCards].slice(0, 2).map((c) => (
                <article key={c.id} className="rounded-lg border overflow-hidden hover:shadow-sm">
                  <img src={c.image} alt={c.title} className="aspect-[16/10] w-full object-cover" />
                  <div className="p-4">
                    <div className="text-xs text-gray-500">{new Date(c.date).toLocaleDateString()}</div>
                    <h3 className="mt-2 font-semibold leading-snug line-clamp-2">{c.title}</h3>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">面向大学/机构的团体订阅方案：统一课程包 + 学情报告 + 私人教研支持，按人数阶梯计费。</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside>
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight"><span className="border-l-4 border-rose-600 pl-3">FROM TIFFANY&rsquo;S COLLEGE</span></h2>
            <div className="mt-4 space-y-4">
              {rightPosts.map((p) => (
                <a key={p.id} href="#" className="flex gap-3 group">
                  <img src={p.image} alt="thumb" className="size-16 object-cover rounded" />
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold group-hover:underline line-clamp-2">{p.title}</h3>
                    <div className="mt-1 text-xs text-gray-500">{new Date(p.date).toLocaleDateString()}</div>
                  </div>
                </a>
              ))}
            </div>
          </aside>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight"><span className="border-l-4 border-rose-600 pl-3">PLANS & PRICING</span></h2>
          <p className="mt-2 text-gray-600">三种订阅周期，随时升级或续费。所有计划均含回放与作业批改，支持7天可退款试学。</p>

          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {pricingPlans.map((p) => (
              <div key={p.id} className={`rounded-lg border overflow-hidden ${p.highlight ? "ring-2 ring-rose-600" : ""}`}>
                <div className={`p-5 ${p.highlight ? "bg-black text-white" : "bg-gray-50"}`}>
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

          <p className="mt-6 text-xs text-gray-500">结算占位：点击按钮将滚动到“联系”表单，可接入支付后端（如 Stripe/支付宝服务商）替换为安全结算链接。</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-gray-600 flex flex-col md:flex-row gap-3 items-center justify-between">
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
