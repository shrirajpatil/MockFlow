import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/marketing/SiteHeader';
import SiteFooter from '@/components/marketing/SiteFooter';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Documentation',
    description:
        'Learn how to build, test, and deploy mock APIs with MockFlow: the six node types, templating syntax, state, and how to expose a local API for testing.',
    alternates: { canonical: '/docs' },
};

function Code({ children }: { children: React.ReactNode }) {
    return <code className="bg-white/10 text-indigo-200 px-1.5 py-0.5 rounded text-[0.85em] font-mono">{children}</code>;
}

function Pre({ children }: { children: React.ReactNode }) {
    return (
        <pre className="bg-black/30 border border-white/10 rounded-lg p-4 text-xs sm:text-sm overflow-x-auto text-indigo-100 font-mono">
            {children}
        </pre>
    );
}

const NODES = [
    {
        name: 'Request',
        summary: 'Defines the HTTP method and path that triggers the workflow. Every workflow starts with exactly one Request node.',
        fields: [
            ['Method', 'GET, POST, PUT, PATCH, or DELETE'],
            ['URL / Path', 'A path like /users/:id, or a full URL when calling a real external API'],
            ['Body Schema', 'Optional JSON shape used for documentation and testing (GET/DELETE skip this)'],
        ],
    },
    {
        name: 'Validation',
        summary: 'Rejects a request before it reaches your logic. Rules run in order; the first failure returns HTTP 400 with its error message.',
        fields: [
            ['Field', 'A field name in the request body, e.g. email'],
            ['Condition', 'required, type, regex, min, or max'],
            ['Value', 'Needed for type, regex, min, or max, e.g. "string" or ^[^@]+@[^@]+$'],
            ['Error message', 'Optional custom message returned in the 400 response'],
        ],
    },
    {
        name: 'Transformation',
        summary: 'Copies a value from Source into Target, so later nodes (typically Response) can read it as {{variables.target}}.',
        fields: [
            ['Source', 'Where the value comes from, e.g. request.body.name'],
            ['Target', 'The name to store it under, e.g. user.name'],
        ],
    },
    {
        name: 'Conditional',
        summary: "Branches the workflow with a safe expression evaluator. It's not full JavaScript, so there are no function calls like .includes().",
        fields: [
            ['Condition', 'e.g. request.body.age >= 18 && state.approved == true'],
            ['Operators', '== != > < >= <= && || !'],
            ['Paths', 'request., state., and variables. are readable inside the expression'],
            ['Outputs', 'Two handles, true and false; wire each to a different next node'],
        ],
    },
    {
        name: 'State',
        summary: 'Persists a value across separate requests to the same workflow using Redis: a POST that saves data, and a later GET that reads it back.',
        fields: [
            ['Operation', 'get loads a value into variables.<key>; set saves a value under a key'],
            ['Key', 'A short name for the stored value, e.g. profile or counter'],
            ['Value', 'For set only. Supports {{path}} templating, e.g. {{request.body}}'],
        ],
    },
    {
        name: 'Response',
        summary: 'What gets sent back to the caller: an HTTP status code and a JSON body template.',
        fields: [
            ['Status Code', 'e.g. 200, 201, 404'],
            ['Body Template', 'Valid JSON with optional {{path}} placeholders'],
        ],
    },
];

const TEMPLATE_PATHS = [
    ['{{request.body.name}}', 'A field from the incoming request body'],
    ['{{variables.user}}', 'A value set earlier by a Transformation node'],
    ['{{state.count}}', 'A value previously saved by a State node'],
];

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-[#0a0d1a] text-white">
            <SiteHeader />

            <main className="max-w-3xl mx-auto px-6 py-16">
                <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3">Documentation</p>
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-b from-white to-indigo-200 bg-clip-text text-transparent">
                    Build a mock API with MockFlow
                </h1>
                <p className="text-lg text-indigo-200/60 mb-8 leading-relaxed">
                    MockFlow turns a mock API into a small graph of nodes on a canvas, with no server code, no
                    deployment pipeline, and no infrastructure to manage. This page covers everything you need to
                    build, test, and deploy your first endpoint.
                </p>

                <p className="text-indigo-200/60 mb-12 leading-relaxed rounded-xl border border-indigo-500/10 bg-[#0d1024]/50 p-5">
                    <strong className="text-white">The mental model:</strong> a workflow is a pipeline. A{' '}
                    <strong className="text-white">Request</strong> node defines when it runs, and a{' '}
                    <strong className="text-white">Response</strong> node defines what comes back. Everything in
                    between (validation, transforms, branching, stored state) is optional logic you only add
                    when you actually need it.
                </p>

                <section className="mb-14">
                    <h2 className="text-2xl font-semibold mb-4 text-white">Quickstart</h2>
                    <ol className="space-y-4">
                        <li className="flex gap-3">
                            <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center justify-center">1</span>
                            <p className="text-indigo-200/70">
                                Open the <Link href="/editor" className="text-indigo-300 hover:text-white underline underline-offset-2">Editor</Link> and
                                drag a <strong className="text-white">Request</strong> node onto the canvas, or click <strong className="text-white">Templates</strong> to
                                start from a working example.
                            </p>
                        </li>
                        <li className="flex gap-3">
                            <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center justify-center">2</span>
                            <p className="text-indigo-200/70">
                                Add the nodes your logic needs (Validation, Transformation, Conditional, State) and
                                finish with a <strong className="text-white">Response</strong> node. Connect them by dragging from the dot on a node&apos;s
                                bottom edge to the top of the next one.
                            </p>
                        </li>
                        <li className="flex gap-3">
                            <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center justify-center">3</span>
                            <p className="text-indigo-200/70">
                                Click <strong className="text-white">Test</strong> to run it in the browser with the exact engine that will serve
                                production traffic. No deploy is required to iterate.
                            </p>
                        </li>
                        <li className="flex gap-3">
                            <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center justify-center">4</span>
                            <p className="text-indigo-200/70">
                                Click <strong className="text-white">Save</strong>, then <strong className="text-white">Deploy</strong>. You&apos;ll get a live URL in the shape{' '}
                                <Code>/api/{'{workspace}'}/{'{path}'}</Code> that you, or anyone with the link, can call with curl.
                            </p>
                        </li>
                    </ol>
                </section>

                <section className="mb-14">
                    <h2 className="text-2xl font-semibold mb-4 text-white">The six node types</h2>
                    <p className="text-indigo-200/60 mb-6">
                        Every workflow is a directed graph of these nodes. A minimal endpoint needs just a
                        Request and a Response; everything else is optional logic in between.
                    </p>
                    <div className="space-y-6">
                        {NODES.map((node) => (
                            <div key={node.name} className="rounded-xl border border-indigo-500/10 bg-[#0d1024]/50 p-5">
                                <h3 className="text-lg font-semibold text-white mb-1.5">{node.name}</h3>
                                <p className="text-sm text-indigo-200/60 mb-4 leading-relaxed">{node.summary}</p>
                                <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                                    {node.fields.map(([field, desc]) => (
                                        <div key={field} className="text-xs">
                                            <dt className="font-mono text-indigo-300 mb-0.5">{field}</dt>
                                            <dd className="text-indigo-200/50">{desc}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-14">
                    <h2 className="text-2xl font-semibold mb-4 text-white">Templating</h2>
                    <p className="text-indigo-200/60 mb-4 leading-relaxed">
                        Response bodies and State values support <Code>{'{{path}}'}</Code> placeholders that pull in
                        data at request time:
                    </p>
                    <div className="rounded-xl border border-indigo-500/10 bg-[#0d1024]/50 divide-y divide-indigo-500/10 mb-4">
                        {TEMPLATE_PATHS.map(([path, desc]) => (
                            <div key={path} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 p-4">
                                <Code>{path}</Code>
                                <span className="text-sm text-indigo-200/50">{desc}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-indigo-200/60 leading-relaxed">
                        A Response node&apos;s Body Template must still be valid JSON once template placeholders are
                        filled in, for example:
                    </p>
                    <div className="mt-3">
                        <Pre>
                            {'{'}
                            {'\n  '}<span className="text-violet-300">&quot;status&quot;</span>: <span className="text-emerald-300">&quot;success&quot;</span>,
                            {'\n  '}<span className="text-violet-300">&quot;user&quot;</span>: <span className="text-emerald-300">&quot;{'{{'}request.body.name{'}}'}&quot;</span>,
                            {'\n  '}<span className="text-violet-300">&quot;views&quot;</span>: <span className="text-emerald-300">&quot;{'{{'}state.count{'}}'}&quot;</span>
                            {'\n'}{'}'}
                        </Pre>
                    </div>
                </section>

                <section className="mb-14">
                    <h2 className="text-2xl font-semibold mb-4 text-white">Deployment &amp; endpoints</h2>
                    <p className="text-indigo-200/60 mb-4 leading-relaxed">
                        Deploying a workflow gives it a live HTTP endpoint served by MockFlow&apos;s serving engine
                        (Netlify Functions + Supabase). The URL shape is:
                    </p>
                    <Pre>
                        https://mockito.netlify.app/api/<span className="text-violet-300">{'{workspace}'}</span>/<span className="text-violet-300">{'{path}'}</span>
                    </Pre>
                    <p className="text-indigo-200/60 mt-4 leading-relaxed">
                        <strong className="text-white">Workspace</strong> is an unauthenticated namespace generated automatically for your
                        browser. Treat its ID like a password, since anyone who has it can edit workflows in that
                        workspace. You can restore a workspace on another device by pasting its ID into the
                        Workspace panel in the editor toolbar.
                    </p>
                </section>

                <section className="mb-14">
                    <h2 className="text-2xl font-semibold mb-4 text-white">Testing an API on your own machine</h2>
                    <p className="text-indigo-200/60 mb-4 leading-relaxed">
                        A Request node can call a real external API, but MockFlow&apos;s cloud can&apos;t reach{' '}
                        <Code>localhost</Code> on your computer directly. Click <strong className="text-white">Local APIs</strong> in
                        the editor toolbar to connect one. No signup is needed:
                    </p>
                    <Pre>
                        <span className="text-sky-300">ssh</span> <span className="text-amber-300">-R</span> 80:localhost:<span className="text-violet-300">{'{your-port}'}</span> <span className="text-emerald-300">localhost.run</span>
                    </Pre>
                    <p className="text-indigo-200/60 mt-4 leading-relaxed">
                        Run that in a terminal (SSH ships with macOS, Linux, and Windows 10+), copy the URL it prints,
                        and paste it into the dialog. It&apos;ll insert it straight into your Request node. Prefer a
                        persistent, auto-detected tunnel instead? The same dialog has an <strong className="text-white">Advanced</strong> section
                        for a bundled ngrok agent, which needs a free ngrok account and runs entirely on your machine.
                        Your token never touches MockFlow&apos;s servers.
                    </p>
                </section>

                <section className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 p-8 text-center">
                    <h2 className="text-xl font-semibold text-white mb-2">Ready to try it?</h2>
                    <p className="text-indigo-200/60 mb-5">Open the editor and load a template. You&apos;ll have a live endpoint in under a minute.</p>
                    <Link href="/editor">
                        <span className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 hover:from-violet-500 hover:via-indigo-500 hover:to-violet-500 font-medium text-sm transition-all shadow-lg shadow-indigo-500/20">
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
