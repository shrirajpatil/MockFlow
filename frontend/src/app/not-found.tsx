import Link from 'next/link';
import SiteHeader from '@/components/marketing/SiteHeader';
import SiteFooter from '@/components/marketing/SiteFooter';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col bg-[#0b0b0d] text-white">
            <SiteHeader />
            <main className="flex-1 flex items-center justify-center px-6 py-24 text-center">
                <div>
                    <p className="text-sm font-mono text-violet-400 mb-4">404</p>
                    <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-3">
                        Page not found
                    </h1>
                    <p className="text-white/45 max-w-sm mx-auto mb-8">
                        The page you are looking for does not exist, or the link is out of date.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex h-10 items-center px-6 rounded-lg bg-violet-500 hover:bg-violet-400 text-[#0b0b0d] font-medium text-sm transition-colors"
                    >
                        Back to home
                    </Link>
                </div>
            </main>
            <SiteFooter />
        </div>
    );
}
