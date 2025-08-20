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
    excerpt: "Design ELT programs that build cross-cultural communication and critical reading.",
    tag: "Conference Papers",
    image: "https://picsum.photos/id/1011/1200/700",
  },
  {
    id: 2,
    title: "EAP-Enriched Curriculum for Universities",
    excerpt: "Integrate academic writing, speaking, and research into subject courses.",
    tag: "Curriculum",
    image: "https://picsum.photos/id/1005/1200/700",
  },
  {
    id: 3,
    title: "Assessment for Learning in ELT",
    excerpt: "Contract grading and formative feedback to empower students.",
    tag: "Workshops",
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
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">Tiffany’s College</h1>
        <p className="mt-2 text-sm text-gray-600">English Language Teaching • Academic Skills • Curriculum Design</p>
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-20 bg-black text-white">
        <nav className="mx-auto max-w-6xl px-4">
          <div className="flex items-center gap-6 text-sm font-medium">
            <a className="py-3 border-b-2 border-rose-600">HOME</a>
            <a className="py-3 hover:text-gray-300" href="#about">ABOUT</a>
            <a className="py-3 hover:text-gray-300" href="#courses">COURSES</a>
            <a className="py-3 hover:text-gray-300" href="#service">SERVICE</a>
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
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">A short abstract or teaser of the paper to attract clicks.</p>
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
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">Proposal overview and objectives.</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside>
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight"><span className="border-l-4 border-rose-600 pl-3">FROM TIFFANY’S COLLEGE</span></h2>
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

      {/* Footer */}
      <footer className="border-t bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-gray-600 flex flex-col md:flex-row gap-3 items-center justify-between">
          <span>© {new Date().getFullYear()} Tiffany's College</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-800">Privacy</a>
            <a href="#" className="hover:text-gray-800">Terms</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
