import Link from 'next/link';
import { Zap, Linkedin } from 'lucide-react';

export default function SiteFooter() {
    return (
        <footer className="relative hairline-t border-t py-14 px-6 bg-[#08080a]">
            <div className="max-w-7xl mx-auto">
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10 pb-10">
                    <div>
                        <Link href="/" className="flex items-center gap-2.5 mb-3">
                            <div className="w-7 h-7 rounded-md bg-indigo-500 flex items-center justify-center">
                                <Zap className="w-3.5 h-3.5 text-[#0b0b0d]" />
                            </div>
                            <span className="font-semibold text-white text-sm">MockFlow</span>
                        </Link>
                        <p className="text-sm text-white/35 leading-relaxed">
                            Build, test, and deploy mock APIs visually.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Product</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/#features" className="text-white/40 hover:text-white transition-colors">Features</Link></li>
                            <li><Link href="/#how-it-works" className="text-white/40 hover:text-white transition-colors">How it works</Link></li>
                            <li><Link href="/editor" className="text-white/40 hover:text-white transition-colors">Editor</Link></li>
                            <li><Link href="/workflows" className="text-white/40 hover:text-white transition-colors">Workflows</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Resources</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/docs" className="text-white/40 hover:text-white transition-colors">Documentation</Link></li>
                            <li><Link href="/use-cases" className="text-white/40 hover:text-white transition-colors">Use cases</Link></li>
                            <li><Link href="/#faq" className="text-white/40 hover:text-white transition-colors">FAQ</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Connect</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="https://www.linkedin.com/in/shriraj-patil-526072227/" target="_blank" className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors">
                                    <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="pt-8 hairline-t border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-sm text-white/35">© {new Date().getFullYear()} MockFlow. Built by Shriraj Patil.</span>
                </div>
            </div>
        </footer>
    );
}
