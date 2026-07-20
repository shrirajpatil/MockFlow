import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/marketing/SiteHeader';
import SiteFooter from '@/components/marketing/SiteFooter';
import { ArrowRight, Terminal, Shield, Users, PlugZap } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Use Cases',
    description:
        'How frontend teams, QA engineers, and demo builders use MockFlow to mock APIs that don’t exist yet, simulate edge cases, and stand up realistic prototypes without backend infrastructure.',
    alternates: { canonical: '/use-cases' },
};

const USE_CASES = [
    {
        icon: Terminal,
        title: 'Frontend development, without waiting on a backend',
        color: 'text-violet-400',
        box: 'from-violet-500/20 to-violet-600/10 border-violet-500/30',
        body: [
            'The most common reason teams reach for MockFlow: the backend for a feature doesn’t exist yet, but the frontend work can start today. Instead of hardcoding fake data in components (data that has to be ripped out later), you build a Request → Response workflow that returns realistic JSON at a real URL.',
            'Add a Validation node to match the contract you’ve agreed on with the backend team (required fields, types), and a Conditional node to return different responses for different inputs. When the real API ships, you change one base URL. The rest of the frontend code doesn’t know the difference.',
        ],
    },
    {
        icon: Shield,
        title: 'QA and integration testing',
        color: 'text-violet-400',
        box: 'from-violet-500/20 to-violet-600/10 border-violet-500/30',
        body: [
            'Some of the most important test cases are also the hardest to trigger against a real service: a 500 from a payment provider, a rate-limit response, a malformed payload, an auth token that just expired. MockFlow lets you build those exact responses on purpose.',
            'A Conditional node can branch on a header, a query value, or a body field to deterministically return the failure case you’re testing, and a State node can simulate a service that only fails on the third request: the kind of flaky behavior that’s normally impossible to reproduce on demand.',
        ],
    },
    {
        icon: Users,
        title: 'Demos, prototypes, and hackathons',
        color: 'text-violet-400',
        box: 'from-violet-500/20 to-violet-600/10 border-violet-500/30',
        body: [
            'A convincing demo needs data that behaves like a real product: a cart that remembers what’s in it, a login that actually rejects the wrong password, a profile you can edit and see persist. Standing up real infrastructure for a one-off demo is rarely worth it.',
            'State nodes give you that persistence without a database: save a value on one request, read it back on the next. Combined with a couple of Templates, you can have a stateful, believable API running in the time it takes to explain the idea.',
        ],
    },
    {
        icon: PlugZap,
        title: 'Simulating third-party APIs you don’t control',
        color: 'text-violet-400',
        box: 'from-violet-500/20 to-violet-600/10 border-violet-500/30',
        body: [
            'Vendor APIs are often the least predictable part of a system: rate limits, paginated responses, inconsistent error shapes, and sandbox environments that don’t match production. MockFlow lets you build a stand-in you fully control.',
            'Because a Request node can also call a real external API, you can start by mirroring the vendor’s actual response shape, then layer in the edge cases (timeouts, 429s, partial pages) that you need to handle but can’t reliably force the real vendor to produce.',
        ],
    },
];

export default function UseCasesPage() {
    return (
        <div className="min-h-screen bg-[#0b0b0d] text-white">
            <SiteHeader />

            <main className="max-w-3xl mx-auto px-6 py-16">
                <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-3">Use cases</p>
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-b from-white to-violet-200 bg-clip-text text-transparent">
                    Who uses MockFlow, and why
                </h1>
                <p className="text-lg text-white/55 mb-14 leading-relaxed">
                    MockFlow exists for the moments when you need an API to act like the real thing: before it
                    exists, when it&apos;s unreliable, or when standing up real infrastructure isn&apos;t worth it. Here&apos;s
                    where it fits.
                </p>

                <div className="space-y-12">
                    {USE_CASES.map((uc) => (
                        <section key={uc.title}>
                            <div className="flex items-start gap-4 mb-4">
                                <div className={`w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br border ${uc.box} flex items-center justify-center`}>
                                    <uc.icon className={`w-5 h-5 ${uc.color}`} />
                                </div>
                                <h2 className="text-xl font-semibold text-white pt-2">{uc.title}</h2>
                            </div>
                            <div className="pl-[60px] space-y-3">
                                {uc.body.map((p, i) => (
                                    <p key={i} className="text-white/55 leading-relaxed">{p}</p>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>

                <section className="mt-16 rounded-2xl surface-card p-8 text-center">
                    <h2 className="text-xl font-semibold text-white mb-2">See how it&apos;s built</h2>
                    <p className="text-white/55 mb-5">
                        Read the <Link href="/docs" className="text-violet-300 hover:text-white underline underline-offset-2">documentation</Link> for
                        a full reference of the six node types, or jump straight in.
                    </p>
                    <Link href="/editor">
                        <span className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-violet-500 hover:bg-violet-400 text-[#0b0b0d] font-medium text-sm transition-colors">
                            Open the Editor
                            <ArrowRight className="w-4 h-4" />
                        </span>
                    </Link>
                </section>
            </main>

            <SiteFooter />
        </div>
    );
}
