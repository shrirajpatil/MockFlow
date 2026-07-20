'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Workflow, Shield, Rocket, Terminal, ChevronRight, Sparkles, Inbox, Shuffle, Send, GitBranch, Layers, MousePointerClick, PlugZap, Users, Zap, Dices } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import SiteHeader from '@/components/marketing/SiteHeader';
import SiteFooter from '@/components/marketing/SiteFooter';

const FAQ_ITEMS = [
  {
    q: 'Is MockFlow free to use?',
    a: 'Yes. MockFlow is free to use: build workflows, test them in the editor, and deploy live mock endpoints without a credit card.',
  },
  {
    q: 'Do I need to write any backend code?',
    a: 'No. Every endpoint is assembled visually from nodes for request, validation, transformation, conditional, state, and response. There is no server code to write or deploy.',
  },
  {
    q: 'Can a mock API remember state across requests?',
    a: 'Yes. State nodes persist values across requests using Redis, so you can simulate things like a counter, a cart, or a login session in a mock endpoint.',
  },
  {
    q: 'Can I mock an API that does not exist yet?',
    a: 'That is the main use case. Frontend and QA teams use MockFlow to stand up a realistic endpoint, complete with validation and branching logic, before the real backend is built, so nobody has to wait.',
  },
  {
    q: 'Can I test against an API running on my own machine?',
    a: 'Yes. Click Local APIs in the editor toolbar to connect one with a no-signup SSH tunnel, or use the optional bundled ngrok agent for a persistent connection.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.a,
    },
  })),
};

/** A quiet, mostly-static dot field that only reacts within a small radius of the
 * cursor — a detail meant to be noticed, not a light show. */
const InteractiveGrid = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePos = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let dots: { x: number; y: number }[] = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = Math.min(window.innerHeight, 900);
      initDots();
    };

    const initDots = () => {
      dots = [];
      const spacing = 44;
      const rows = Math.ceil(canvas.height / spacing);
      const cols = Math.ceil(canvas.width / spacing);
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          dots.push({ x: j * spacing, y: i * spacing });
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach((dot) => {
        const dx = mousePos.current.x - dot.x;
        const dy = mousePos.current.y - dot.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 170;
        const near = distance < maxDistance;
        const intensity = near ? 1 - distance / maxDistance : 0;

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, near ? 1.4 + intensity * 1.2 : 1, 0, Math.PI * 2);
        ctx.fillStyle = near
          ? `rgba(167, 139, 250, ${0.35 + intensity * 0.65})`
          : 'rgba(255, 255, 255, 0.06)';
        ctx.fill();
      });
      animationFrameId = requestAnimationFrame(draw);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    draw();
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) mousePos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-x-0 top-0 h-[900px] pointer-events-none"
      onMouseMove={handleMouseMove}
      style={{ pointerEvents: 'auto' }}
    />
  );
};

const FEATURES = [
  { icon: Workflow, title: 'Visual workflow builder', desc: 'Assemble request handling from six node types on a canvas. No backend code required.' },
  { icon: Shield, title: 'Built-in validation', desc: 'Validate required fields, types, regex, and min/max on every request, with clear error responses.' },
  { icon: Rocket, title: 'One-click deploy', desc: 'Deploy to a live endpoint instantly. Curl it from anywhere the moment you click Deploy.' },
  { icon: GitBranch, title: 'Conditional branching', desc: 'Route requests through a safe expression evaluator to simulate real business logic.' },
  { icon: Layers, title: 'Ready-made templates', desc: 'Start from a library of working templates instead of an empty canvas.' },
  { icon: Zap, title: 'Chaos mode', desc: 'Inject random latency or failures into any response to test how your frontend handles a flaky API.' },
  { icon: Dices, title: 'Built-in fake data', desc: 'Generate realistic names, emails, and IDs on every call with a single template token.' },
  { icon: PlugZap, title: 'Stateful mocks', desc: 'Persist state across requests with Redis to simulate carts, counters, and sessions.' },
];

const STEPS = [
  { icon: MousePointerClick, step: '01', title: 'Design the flow', desc: 'Drag request, validation, transformation, conditional, state, and response nodes onto the canvas and wire them together.' },
  { icon: PlugZap, step: '02', title: 'Test in the editor', desc: 'Run the workflow with the same engine that serves production, right inside the canvas, with no deploy needed to iterate.' },
  { icon: Rocket, step: '03', title: 'Deploy and share', desc: 'Click Deploy to get a live HTTP endpoint at /api/{workspace}/{path} that anyone on your team can curl.' },
];

const USE_CASES = [
  { icon: Terminal, title: 'Frontend development', desc: 'Build and ship UI against a realistic API before the real backend exists, so nobody is blocked waiting on another team.' },
  { icon: Shield, title: 'QA and integration testing', desc: 'Simulate edge cases, error codes, and flaky third-party responses that are hard to reproduce against a real service.' },
  { icon: Users, title: 'Demos and sales prototypes', desc: 'Stand up a convincing, stateful API for a demo or hackathon without provisioning real infrastructure.' },
  { icon: PlugZap, title: 'Third-party API simulation', desc: 'Mock a vendor API you do not control yet, including rate limits, auth errors, and paginated responses.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0b0b0d] text-white font-sans antialiased selection:bg-violet-500/30 overflow-x-hidden">
      <SiteHeader />

      {/* Hero */}
      <main className="relative">
        <div className="absolute inset-x-0 top-0 h-[900px] overflow-hidden pointer-events-none">
          <div className="ambient-glow absolute w-[900px] h-[900px] rounded-full left-1/2 -top-32 -translate-x-1/2 blur-3xl" />
          <InteractiveGrid />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center pt-20 pb-16 px-6">
          <Link
            href="/editor"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full hairline-border border text-xs font-medium text-white/70 hover:text-white hover:border-white/25 transition-colors mb-8"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            Now in beta, free while in beta
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </Link>

          <h1 className="text-5xl sm:text-6xl lg:text-[4.5rem] font-semibold tracking-tight leading-[1.05] mb-6 text-white">
            Build mock APIs,
            <br />
            <span className="text-violet-400">visually.</span>
          </h1>

          <p className="text-lg text-white/50 max-w-xl mx-auto mb-10 leading-relaxed">
            A free visual workflow builder for creating, testing, and deploying mock REST APIs.
            No backend code. A live HTTP endpoint in under a minute.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-20">
            <Link href="/editor">
              <Button
                size="lg"
                className="h-11 px-7 bg-violet-500 hover:bg-violet-400 text-[#0b0b0d] font-medium rounded-lg text-sm border-0 transition-colors"
              >
                Open the editor
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link
              href="/workflows"
              className="flex items-center gap-2 h-11 px-6 text-sm text-white/60 hover:text-white hairline-border border rounded-lg hover:bg-white/[0.03] transition-colors"
            >
              <Terminal className="w-4 h-4" />
              View my workflows
            </Link>
          </div>

          {/* Product Preview */}
          <div className="relative mx-auto max-w-5xl">
            <div className="surface-card rounded-2xl overflow-hidden shadow-2xl shadow-black/40 text-left">
              <div className="flex items-center gap-2 px-4 h-10 hairline-b border-b bg-white/[0.02]">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/15" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/15" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/15" />
                </div>
                <div className="flex-1 flex justify-center">
                  <span className="text-xs text-white/30 font-mono">mockflow-studio</span>
                </div>
              </div>

              <div className="p-8 sm:p-10 min-h-[340px] bg-grid-faint relative flex items-center justify-center">
                <div className="flex items-center justify-center gap-2 lg:gap-5 relative z-10 scale-[0.72] sm:scale-90 lg:scale-100">
                  {[
                    { icon: Inbox, label: 'Request', meta: 'GET /api/users' },
                    { icon: Shuffle, label: 'Transform', meta: '2 steps active' },
                    { icon: Send, label: 'Response', meta: '200 OK' },
                  ].map((n, i) => (
                    <div key={i} className="flex items-center gap-2 lg:gap-5">
                      <div className="w-[168px] shrink-0 rounded-lg surface-raised overflow-hidden">
                        <div className="flex items-center gap-2.5 px-3.5 py-3 hairline-b border-b">
                          <div className="w-7 h-7 rounded-md bg-violet-500/15 border border-violet-500/25 flex items-center justify-center shrink-0">
                            <n.icon className="w-3.5 h-3.5 text-violet-400" />
                          </div>
                          <span className="font-medium text-white text-xs">{n.label}</span>
                        </div>
                        <div className="px-3.5 py-2.5">
                          <span className="text-white/40 font-mono text-[10px]">{n.meta}</span>
                        </div>
                      </div>
                      {i < 2 && <div className="hidden md:block w-6 h-px bg-white/10 shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features */}
      <section id="features" className="relative py-24 px-6 hairline-t border-t scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <SectionHeading eyebrow="Features" title="Everything you need" subtitle="Build production-ready mock APIs in minutes, not hours." />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="surface-card p-5 rounded-xl">
                <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
                  <f.icon className="w-4.5 h-4.5 text-violet-400" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1.5">{f.title}</h3>
                <p className="text-[13px] text-white/45 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative py-24 px-6 hairline-t border-t scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <SectionHeading eyebrow="Process" title="How MockFlow works" subtitle="From empty canvas to a live endpoint, in three steps." />

          <div className="grid md:grid-cols-3 gap-4">
            {STEPS.map((s, i) => (
              <div key={i} className="relative surface-card p-6 rounded-xl">
                <span className="absolute top-5 right-6 text-3xl font-semibold text-white/[0.06] tabular-nums">{s.step}</span>
                <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-5">
                  <s.icon className="w-4.5 h-4.5 text-violet-400" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section id="use-cases" className="relative py-24 px-6 hairline-t border-t scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <SectionHeading eyebrow="Use cases" title="Built for teams who cannot wait on a backend" subtitle="A few of the ways people use MockFlow every day." />

          <div className="grid md:grid-cols-2 gap-4">
            {USE_CASES.map((u, i) => (
              <div key={i} className="flex items-start gap-4 surface-card p-5 rounded-xl">
                <div className="w-9 h-9 shrink-0 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <u.icon className="w-4.5 h-4.5 text-violet-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">{u.title}</h3>
                  <p className="text-[13px] text-white/45 leading-relaxed">{u.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/use-cases" className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors">
              See detailed use cases
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative py-24 px-6 hairline-t border-t scroll-mt-20">
        <div className="max-w-2xl mx-auto">
          <SectionHeading eyebrow="FAQ" title="Frequently asked questions" />

          <div className="space-y-2">
            {FAQ_ITEMS.map((item, i) => (
              <details key={i} className="group surface-card rounded-xl">
                <summary className="flex items-center justify-between gap-4 p-4 cursor-pointer list-none">
                  <span className="font-medium text-white text-sm">{item.q}</span>
                  <ChevronRight className="w-4 h-4 text-white/30 shrink-0 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="px-4 pb-4 text-sm text-white/50 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 px-6 hairline-t border-t">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-semibold text-white mb-3 tracking-tight">
            Ready to build your first mock API?
          </h2>
          <p className="text-white/50 mb-8">
            It is free, and you will have a live endpoint in under a minute.
          </p>
          <Link href="/editor">
            <Button
              size="lg"
              className="h-11 px-7 bg-violet-500 hover:bg-violet-400 text-[#0b0b0d] font-medium rounded-lg text-sm border-0 transition-colors"
            >
              Open the editor
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </section>

      <SiteFooter />

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </div>
  );
}

function SectionHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-12">
      <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">{eyebrow}</span>
      <h2 className="text-2xl sm:text-3xl font-semibold text-white mt-2 mb-3 tracking-tight">{title}</h2>
      {subtitle && <p className="text-white/45 max-w-md mx-auto text-[15px]">{subtitle}</p>}
    </div>
  );
}
