'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Workflow, Shield, Rocket, Terminal, ChevronRight, Sparkles, Inbox, Shuffle, Database, GitBranch, Send, Layers, MousePointerClick, PlugZap, Users, Zap, Dices } from 'lucide-react';
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

// Interactive Dot Grid Component
const InteractiveGrid = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let dots: { x: number; y: number }[] = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initDots();
    };

    const initDots = () => {
      dots = [];
      const spacing = 40;
      const rows = Math.ceil(canvas.height / spacing);
      const cols = Math.ceil(canvas.width / spacing);

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          dots.push({
            x: j * spacing,
            y: i * spacing
          });
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw dots
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      dots.forEach(dot => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 1, 0, Math.PI * 2);
        ctx.fill();

        // Draw lines to mouse
        const dx = mousePos.x - dot.x;
        const dy = mousePos.y - dot.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 150;

        if (distance < maxDistance) {
          ctx.beginPath();
          ctx.moveTo(dot.x, dot.y);
          ctx.lineTo(mousePos.x, mousePos.y);
          ctx.strokeStyle = `rgba(99, 102, 241, ${0.2 * (1 - distance / maxDistance)})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          // Highlight nearby dots
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(165, 180, 252, ${0.5 * (1 - distance / maxDistance)})`;
          ctx.fill();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'; // Reset
        }
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
  }, [mousePos]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none opacity-40"
      onMouseMove={handleMouseMove}
    />
  );
};

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      // Just for the spotlight effect
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0d1a] text-white font-sans antialiased selection:bg-violet-500/30 overflow-x-hidden">
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Main Glow */}
        <div
          className="absolute w-[1400px] h-[1400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.06) 30%, transparent 60%)',
            left: '50%',
            top: '25%',
            transform: 'translate(-50%, -50%)',
            animation: 'pulse 8s ease-in-out infinite',
          }}
        />
        {/* Secondary Glow */}
        <div
          className="absolute w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 50%)',
            left: '20%',
            top: '60%',
            animation: 'pulse 10s ease-in-out infinite reverse',
          }}
        />
        {/* Accent Glow */}
        <div
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 50%)',
            right: '10%',
            top: '30%',
            animation: 'pulse 12s ease-in-out infinite',
          }}
        />
      </div>

      {/* Interactive Dot Grid */}
      <InteractiveGrid />

      {/* Navigation */}
      <SiteHeader />

      {/* Hero */}
      <main className="relative z-10 pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Announcement Banner */}
          <Link
            href="/editor"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-sm text-indigo-300 hover:border-indigo-500/40 transition-all mb-10 group"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Now in beta
            <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-6">
            <span className="bg-gradient-to-b from-white via-white to-indigo-200 bg-clip-text text-transparent">Build APIs </span>
            <span className="relative">
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
                visually
              </span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                <path d="M2 6C50 2 150 2 198 6" stroke="url(#underline-gradient)" strokeWidth="3" strokeLinecap="round" />
                <defs>
                  <linearGradient id="underline-gradient" x1="0" y1="0" x2="200" y2="0">
                    <stop stopColor="#a78bfa" />
                    <stop offset="0.5" stopColor="#f0abfc" />
                    <stop offset="1" stopColor="#818cf8" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg lg:text-xl text-indigo-200/60 max-w-2xl mx-auto mb-12 leading-relaxed">
            MockFlow is a free visual tool for building, testing, and deploying mock REST APIs without writing backend code.
            Design your endpoints with <span className="text-indigo-100">drag-and-drop</span> nodes and get a live HTTP endpoint in under a minute.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-24">
            <Link href="/editor">
              <Button
                size="lg"
                className="h-12 px-8 bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 hover:from-violet-500 hover:via-indigo-500 hover:to-violet-500 font-medium rounded-xl text-base border-0 shadow-2xl shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:scale-[1.02] bg-[length:200%_100%] animate-gradient"
              >
                Open Editor
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link
              href="/workflows"
              className="flex items-center gap-2 px-6 py-3 text-sm text-indigo-200/60 hover:text-white border border-indigo-500/20 rounded-xl hover:border-indigo-500/40 hover:bg-indigo-500/10 transition-all"
            >
              <Terminal className="w-4 h-4" />
              View my workflows
            </Link>
          </div>

          {/* Product Preview */}
          <div className="relative mx-auto max-w-5xl group">
            {/* Glow behind preview */}
            <div className="absolute -inset-4 bg-gradient-to-r from-violet-600/20 via-indigo-600/20 to-violet-600/20 rounded-2xl blur-3xl opacity-40 group-hover:opacity-60 transition-opacity" />

            {/* Animated border */}
            <div className="absolute -inset-[1px] bg-gradient-to-r from-violet-500/30 via-indigo-500/30 to-violet-500/30 rounded-2xl opacity-50" />

            <div className="relative rounded-2xl bg-[#0a0d1a] overflow-hidden shadow-2xl border border-indigo-500/20">
              {/* Window Header */}
              <div className="flex items-center gap-2 px-4 h-11 bg-[#141830]/90 border-b border-indigo-500/10">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500 transition-colors" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400 hover:bg-yellow-500 transition-colors" />
                  <div className="w-3 h-3 rounded-full bg-green-400 hover:bg-green-500 transition-colors" />
                </div>
                <div className="flex-1 flex justify-center">
                  <span className="text-xs text-indigo-300/40 font-medium">MockFlow Studio</span>
                </div>
              </div>

              {/* Preview Content */}
              <div className="p-10 min-h-[380px] bg-[#0c1020] relative flex items-center justify-center">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

                <div className="flex items-center justify-center gap-2 lg:gap-6 relative z-10 scale-[0.7] sm:scale-85 md:scale-95 lg:scale-100 px-2">
                  {/* Node 1: Request */}
                  <div className="w-[200px] shrink-0 rounded-xl overflow-hidden bg-slate-900/95 border border-slate-800 shadow-2xl transition-all hover:scale-105 duration-300">
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 border-b border-slate-800/50 text-left">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shrink-0">
                        <Inbox className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-100 text-[13px] tracking-tight">Request</span>
                        <span className="text-[9px] text-slate-500 font-medium uppercase tracking-wider">Node Module</span>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-900/20 text-left">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold text-[9px] border border-blue-500/20 uppercase">GET</span>
                        <span className="text-slate-400 font-mono text-[9px] truncate">/api/users</span>
                      </div>
                    </div>
                  </div>

                  {/* Connector */}
                  <div className="hidden md:block w-8 h-px bg-slate-700/50 shrink-0" />

                  {/* Node 2: Transformation */}
                  <div className="w-[200px] shrink-0 rounded-xl overflow-hidden bg-slate-900/95 border border-slate-800 shadow-2xl transition-all hover:scale-105 duration-300">
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 border-b border-slate-800/50 text-left">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shrink-0">
                        <Shuffle className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-100 text-[13px] tracking-tight">Transform</span>
                        <span className="text-[9px] text-slate-500 font-medium uppercase tracking-wider">Node Module</span>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-900/20 text-left">
                      <div className="text-slate-400 text-[9px] flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-orange-400"></span>
                        <span className="text-slate-100 font-semibold">2</span> steps active
                      </div>
                    </div>
                  </div>

                  {/* Connector */}
                  <div className="hidden md:block w-8 h-px bg-slate-700/50 shrink-0" />

                  {/* Node 3: Response */}
                  <div className="w-[200px] shrink-0 rounded-xl overflow-hidden bg-slate-900/95 border border-slate-800 shadow-2xl transition-all hover:scale-105 duration-300">
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 border-b border-slate-800/50 text-left">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shrink-0">
                        <Send className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-100 text-[13px] tracking-tight">Response</span>
                        <span className="text-[9px] text-slate-500 font-medium uppercase tracking-wider">Node Module</span>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-900/20 text-left">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded border bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-bold text-[9px]">200</span>
                        <span className="text-slate-500 text-[9px]">Response Success</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features */}
      <section id="features" className="relative z-10 pt-10 pb-28 px-6 border-t border-indigo-500/10 scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-b from-white to-indigo-200 bg-clip-text text-transparent">
              Everything you need
            </h2>
            <p className="text-indigo-200/60 max-w-lg mx-auto">
              Build production-ready mock APIs in minutes, not hours.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              // Tailwind can't generate interpolated class names, so each card carries full class strings
              { icon: Workflow, title: 'Visual Workflow', desc: 'Build complex API logic with an intuitive drag-and-drop interface. No backend code required.', box: 'from-violet-500/20 to-violet-600/10 border-violet-500/30', text: 'text-violet-400' },
              { icon: Shield, title: 'Built-in Validation', desc: 'Add request validation for required fields, types, regex, and min/max, with clear error responses.', box: 'from-blue-500/20 to-blue-600/10 border-blue-500/30', text: 'text-blue-400' },
              { icon: Rocket, title: 'One-Click Deploy', desc: 'Deploy your mock API instantly to a live endpoint you can curl from anywhere.', box: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30', text: 'text-emerald-400' },
              { icon: GitBranch, title: 'Conditional Branching', desc: 'Route requests through a safe expression evaluator to simulate real business logic.', box: 'from-amber-500/20 to-orange-600/10 border-amber-500/30', text: 'text-amber-400' },
              { icon: Database, title: 'Stateful Mocks', desc: 'Persist state across requests with Redis to simulate carts, counters, and sessions.', box: 'from-fuchsia-500/20 to-pink-600/10 border-fuchsia-500/30', text: 'text-fuchsia-400' },
              { icon: Layers, title: 'Ready-Made Templates', desc: 'Start from a library of workflow templates instead of an empty canvas.', box: 'from-cyan-500/20 to-sky-600/10 border-cyan-500/30', text: 'text-cyan-400' },
              { icon: Zap, title: 'Chaos Mode', desc: 'Inject random latency or failures into any response to test how your frontend handles a flaky real API.', box: 'from-fuchsia-500/20 to-purple-600/10 border-fuchsia-500/30', text: 'text-fuchsia-400' },
              { icon: Dices, title: 'Built-in Fake Data', desc: 'Generate realistic names, emails, and IDs on every call with a single template token. No extra library.', box: 'from-teal-500/20 to-emerald-600/10 border-teal-500/30', text: 'text-teal-400' },
            ].map((f, i) => (
              <div
                key={i}
                className="group p-6 rounded-2xl bg-[#0d1024]/50 border border-indigo-500/10 hover:border-indigo-500/30 transition-all hover:shadow-xl hover:shadow-indigo-500/5 backdrop-blur-sm"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br border ${f.box} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <f.icon className={`w-6 h-6 ${f.text}`} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-indigo-200/50 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative z-10 py-24 px-6 border-t border-indigo-500/10 scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-b from-white to-indigo-200 bg-clip-text text-transparent">
              How MockFlow works
            </h2>
            <p className="text-indigo-200/60 max-w-lg mx-auto">
              From empty canvas to a live endpoint, in three steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: MousePointerClick, step: '01', title: 'Design the flow', desc: 'Drag request, validation, transformation, conditional, state, and response nodes onto the canvas and wire them together.' },
              { icon: PlugZap, step: '02', title: 'Test in the editor', desc: 'Run the workflow with the same engine that serves production, right inside the canvas, with no deploy needed to iterate.' },
              { icon: Rocket, step: '03', title: 'Deploy and share', desc: 'Click Deploy to get a live HTTP endpoint at /api/{workspace}/{path} that anyone on your team can curl.' },
            ].map((s, i) => (
              <div key={i} className="relative p-6 rounded-2xl bg-[#0d1024]/50 border border-indigo-500/10">
                <span className="absolute top-5 right-6 text-4xl font-bold text-indigo-500/10">{s.step}</span>
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-600/10 border border-indigo-500/30 flex items-center justify-center mb-5">
                  <s.icon className="w-5 h-5 text-indigo-300" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-indigo-200/50 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section id="use-cases" className="relative z-10 py-24 px-6 border-t border-indigo-500/10 scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-b from-white to-indigo-200 bg-clip-text text-transparent">
              Built for teams who can&apos;t wait on a backend
            </h2>
            <p className="text-indigo-200/60 max-w-lg mx-auto">
              A few of the ways people use MockFlow every day.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: Terminal, title: 'Frontend development', desc: 'Build and ship UI against a realistic API before the real backend exists, so nobody is blocked waiting on another team.' },
              { icon: Shield, title: 'QA & integration testing', desc: 'Simulate edge cases, error codes, and flaky third-party responses that are hard to reproduce against a real service.' },
              { icon: Users, title: 'Demos & sales prototypes', desc: 'Stand up a convincing, stateful API for a demo or hackathon without provisioning real infrastructure.' },
              { icon: PlugZap, title: 'Third-party API simulation', desc: 'Mock a vendor API you don’t control yet, including rate limits, auth errors, and paginated responses.' },
            ].map((u, i) => (
              <div key={i} className="flex items-start gap-4 p-6 rounded-2xl bg-[#0d1024]/50 border border-indigo-500/10 hover:border-indigo-500/30 transition-all">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-600/10 border border-violet-500/30 flex items-center justify-center">
                  <u.icon className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">{u.title}</h3>
                  <p className="text-sm text-indigo-200/50 leading-relaxed">{u.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/use-cases" className="inline-flex items-center gap-1.5 text-sm text-indigo-300 hover:text-white transition-colors">
              See detailed use cases
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative z-10 py-24 px-6 border-t border-indigo-500/10 scroll-mt-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-b from-white to-indigo-200 bg-clip-text text-transparent">
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <details
                key={i}
                className="group rounded-2xl bg-[#0d1024]/50 border border-indigo-500/10 open:border-indigo-500/30 transition-all"
              >
                <summary className="flex items-center justify-between gap-4 p-5 cursor-pointer list-none">
                  <span className="font-medium text-white text-sm sm:text-base">{item.q}</span>
                  <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="px-5 pb-5 text-sm text-indigo-200/60 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-20 px-6 border-t border-indigo-500/10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-b from-white to-indigo-200 bg-clip-text text-transparent">
            Ready to build your first mock API?
          </h2>
          <p className="text-indigo-200/60 mb-8">
            It&apos;s free, and you&apos;ll have a live endpoint in under a minute.
          </p>
          <Link href="/editor">
            <Button
              size="lg"
              className="h-12 px-8 bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 hover:from-violet-500 hover:via-indigo-500 hover:to-violet-500 font-medium rounded-xl text-base border-0 shadow-2xl shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:scale-[1.02]"
            >
              Open the Editor
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <SiteFooter />

      {/* FAQ structured data */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.02); }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}} />
    </div>
  );
}
