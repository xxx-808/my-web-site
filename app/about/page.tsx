"use client";

import { useRouter } from "next/navigation";

export default function AboutPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white text-black">
      {/* Hero */}
      <section className="border-b bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">关于我们</h1>
              <p className="mt-3 text-gray-600 max-w-2xl">
                这里展示学校与产品的简介占位。稍后替换为正式文案与图像素材。
              </p>
              <div className="mt-6 flex gap-3">
                <button onClick={() => router.push("/")} className="px-4 py-2 rounded-md border hover:bg-gray-100 text-sm">
                  返回首页
                </button>
                <button onClick={() => router.push("/videos")} className="px-4 py-2 rounded-md bg-black text-white text-sm hover:opacity-90">
                  前往视频中心
                </button>
              </div>
            </div>
            <div className="hidden md:block w-[40%] rounded-2xl overflow-hidden border bg-white">
              <div className="aspect-[4/3] w-full bg-gray-100 grid place-items-center text-gray-400 text-sm">
                图像占位
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="border-b">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">使命与愿景</h2>
          <div className="mt-6 grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border p-6 bg-white">
                <div className="text-2xl mb-2">🌟</div>
                <h3 className="font-semibold mb-2">要点标题 {i}</h3>
                <p className="text-sm text-gray-600">占位描述，稍后补充具体内容与示例。</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-b bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">核心价值</h2>
          <div className="mt-6 grid md:grid-cols-2 gap-6">
            {["以学习者為本", "科学方法", "数据驱动", "隐私与安全"].map((title) => (
              <div key={title} className="rounded-xl border p-6 bg-white">
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-gray-600">占位描述，稍后替换为正式内容。</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="border-b">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">发展里程</h2>
          <div className="mt-6 space-y-6">
            {["阶段一", "阶段二", "阶段三"].map((phase, idx) => (
              <div key={phase} className="flex gap-4">
                <div className="mt-1 size-3 rounded-full bg-rose-600"></div>
                <div>
                  <h4 className="font-semibold">{phase}</h4>
                  <p className="text-sm text-gray-600">时间节点与成果占位 {idx + 1}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="border-b bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">团队</h2>
          <div className="mt-6 grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border bg-white p-6">
                <div className="w-20 h-20 rounded-full bg-gray-200 mb-3"></div>
                <h3 className="font-semibold">成员姓名 {i}</h3>
                <p className="text-sm text-gray-600">岗位与简介占位</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3">期待进一步了解</h2>
          <p className="text-gray-600 mb-6">此处为联系與合作占位内容</p>
          <button onClick={() => router.push("/#contact")} className="px-6 py-3 rounded-xl bg-black text-white text-sm hover:opacity-90">
            联系我们
          </button>
        </div>
      </section>
    </main>
  );
}


