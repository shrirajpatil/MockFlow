import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Zap, Linkedin } from 'lucide-react';

export default function SiteHeader() {
    return (
        <header className="sticky top-0 z-50 hairline-b border-b bg-[#0b0b0d]/80 backdrop-blur-xl">
            <nav className="flex items-center justify-between px-6 lg:px-12 h-16 max-w-7xl mx-auto">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center transition-transform group-hover:scale-105">
                            <Zap className="w-4 h-4 text-[#0b0b0d]" />
                        </div>
                        <span className="font-semibold text-[15px] text-white">MockFlow</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-6 text-[13px] font-medium text-white/50">
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
                        className="hidden sm:flex items-center gap-1.5 text-[13px] text-white/40 hover:text-white transition-colors"
                    >
                        <Linkedin className="w-3.5 h-3.5" />
                        <span>Shriraj</span>
                    </Link>
                    <Link href="/editor">
                        <Button className="bg-indigo-500 hover:bg-indigo-400 text-[#0b0b0d] font-medium rounded-lg h-8 px-4 text-[13px] transition-colors border-0">
                            Get started
                        </Button>
                    </Link>
                </div>
            </nav>
        </header>
    );
}
