// app/page.tsx
export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Navbar */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <a href="#" className="font-bold tracking-tight text-xl">Hengyu Studio</a>
          <nav className="hidden md:flex gap-6 text-sm">
            <a className="hover:text-gray-600" href="#services">服务</a>
            <a className="hover:text-gray-600" href="#work">作品</a>
            <a className="hover:text-gray-600" href="#about">关于</a>
            <a className="hover:text-gray-600" href="#contact">联系</a>
          </nav>
          <a
            href="#contact"
            className="inline-flex items-center rounded-xl border px-3 py-1.5 text-sm font-medium hover:bg-gray-50"
          >
            获取报价
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              为中小团队打造 <span className="bg-gradient-to-r from-black to-gray-500 bg-clip-text text-transparent">专业、快速、可增长</span> 的网站
            </h1>
            <p className="mt-5 text-gray-600">
              专注 Next.js / Tailwind / Vercel 全栈落地：企业官网、作品集、着陆页、表单与自动化、基础 SEO。
            </p>
            <div className="mt-8 flex gap-3">
              <a
                href="#contact"
                className="rounded-xl bg-black text-white px-5 py-3 text-sm font-medium hover:opacity-90"
              >
                预约咨询
              </a>
              <a
                href="#work"
                className="rounded-xl border px-5 py-3 text-sm font-medium hover:bg-gray-50"
              >
                查看案例
              </a>
            </div>
            <div className="mt-6 text-xs text-gray-500">
              已服务：个人工作室 / 初创公司 / 课程项目
            </div>
          </div>
          <div className="rounded-2xl border bg-gray-50 p-6">
            <div className="aspect-video rounded-lg bg-white border grid place-items-center text-sm text-gray-500">
              放一张你的项目图/Logo（/public/cover.png）
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-bold">服务范围</h2>
          <p className="mt-2 text-gray-600">小规模起步，按需扩展，确保性价比与可维护性。</p>

          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {[
              {
                title: "官网/着陆页",
                desc: "Next.js + Tailwind + Vercel，一周内上线可迭代。",
              },
              {
                title: "作品集与博客",
                desc: "MDX 或轻量 CMS（Notion/Sanity），支持基础 SEO。",
              },
              {
                title: "表单与自动化",
                desc: "联系/预约/邮件通知，接 Formspree/Resend，防垃圾。",
              },
            ].map((s) => (
              <div key={s.title} className="rounded-2xl border p-6 hover:shadow-sm">
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Work */}
      <section id="work" className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-bold">精选案例</h2>
          <p className="mt-2 text-gray-600">按“问题 → 方案 → 结果”的结构展示，更能体现价值。</p>

          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <article key={i} className="rounded-2xl border overflow-hidden hover:shadow-sm">
                <div className="aspect-video bg-gray-100 grid place-items-center text-gray-500 text-sm">
                  项目封面 {i}
                </div>
                <div className="p-5">
                  <h3 className="font-semibold">项目名称 {i}</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    问题：一句话痛点。方案：使用 Next.js/优化首屏/简化表单。结果：加载 1.2s，转化+30%。
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-16 grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">关于我</h2>
            <p className="mt-4 text-gray-600">
              我是 Hengyu，负责技术与交付。擅长前端工程化与轻后端集成（Next.js、API、部署自动化）。
              目标是用小而美的方法，帮助你以最低复杂度上线可增长的网站。
            </p>
            <ul className="mt-4 text-sm text-gray-600 list-disc pl-5 space-y-1">
              <li>技术栈：TypeScript / Next.js / Tailwind / Vercel</li>
              <li>优先事项：性能（Lighthouse≥90）/ SEO / 无障碍</li>
              <li>可扩展：MDX/CMS、表单自动化、分析 & A/B 测试</li>
            </ul>
          </div>
          <div className="rounded-2xl border p-6 bg-gray-50">
            <h3 className="font-semibold">合作流程（小规模）</h3>
            <ol className="mt-3 text-sm text-gray-700 space-y-2 list-decimal pl-5">
              <li>需求梳理（目标、页面、素材）</li>
              <li>线框与首页落地</li>
              <li>部署与域名绑定</li>
              <li>性能/SEO/A11y 基础优化</li>
              <li>持续小步迭代（内容/组件/转化）</li>
            </ol>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="border-t">
        <div className="mx-auto max-w-2xl px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-bold">联系我</h2>
          <p className="mt-2 text-gray-600">发需求/预算范围/上线时间，我会尽快回复。</p>

          {/* Formspree 示例：把 action 换成你自己的 endpoint */}
          <form
            action="https://formspree.io/f/your-form-id"
            method="POST"
            className="mt-6 grid gap-4"
          >
            <input
              type="text"
              name="name"
              placeholder="你的名字"
              required
              className="w-full rounded-xl border px-4 py-3"
            />
            <input
              type="email"
              name="email"
              placeholder="邮箱"
              required
              className="w-full rounded-xl border px-4 py-3"
            />
            <textarea
              name="message"
              placeholder="请简单描述你的需求和时间安排"
              rows={5}
              required
              className="w-full rounded-xl border px-4 py-3"
            />
            <button
              type="submit"
              className="rounded-xl bg-black text-white px-5 py-3 text-sm font-medium hover:opacity-90"
            >
              发送
            </button>
          </form>

          <p className="mt-3 text-xs text-gray-500">
            暂无表单？可直接发邮件：<a className="underline" href="mailto:hz6245179@gmail.com">hz6245179@gmail.com</a>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-gray-500 flex items-center justify-between">
          <span>© {new Date().getFullYear()} Hengyu Studio</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-700">隐私政策</a>
            <a href="#" className="hover:text-gray-700">使用条款</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
