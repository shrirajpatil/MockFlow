import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Zap, Linkedin } from 'lucide-react';

export default function SiteHeader() {
    return (
        <header className="relative z-50 border-b border-indigo-500/10">
            <nav className="flex items-center justify-between px-6 lg:px-12 h-16 max-w-7xl mx-auto">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-shadow">
                            <Zap className="w-4.5 h-4.5 text-white" />
                        </div>
                        <span className="font-semibold text-lg bg-gradient-to-r from-white to-indigo-100 bg-clip-text text-transparent">MockFlow</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-6 text-sm text-indigo-300/60">
                        <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
                        <Link href="/#how-it-works" className="hover:text-white transition-colors">How it works</Link>
                        <Link href="/use-cases" className="hover:text-white transition-colors">Use cases</Link>
                        <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
                        <Link href="/workflows" className="hover:text-white transition-colors">Workflows</Link>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Link
                        href="https://www.linkedin.com/in/shriraj-patil-526072227/"
                        target="_blank"
                        className="hidden sm:flex items-center gap-1.5 text-sm text-indigo-300/60 hover:text-white transition-colors"
                    >
                        <Linkedin className="w-4 h-4" />
                        <span>Shriraj</span>
                    </Link>
                    <Link href="/editor">
                        <Button className="bg-white text-indigo-950 hover:bg-indigo-50 font-medium rounded-lg h-9 px-5 text-sm transition-all shadow-lg shadow-white/10 hover:shadow-white/20">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </nav>
        </header>
    );
}
