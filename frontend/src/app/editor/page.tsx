'use client';

import Toolbar from '@/components/editor/Toolbar';
import Sidebar from '@/components/editor/Sidebar';
import NodeConfigPanel from '@/components/editor/NodeConfigPanel';
import TunnelStatus from '@/components/TunnelStatus';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import OnboardingGuide from '@/components/OnboardingGuide';

const EditorCanvas = dynamic(() => import('@/components/editor/EditorCanvas'), {
    ssr: false,
});

export default function EditorPage() {
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const hasSeenOnboarding = localStorage.getItem('mockflow_onboarding_seen');
        if (!hasSeenOnboarding) {
            setShowOnboarding(true);
            localStorage.setItem('mockflow_onboarding_seen', 'true');
        }
    }, []);

    if (!mounted) {
        return (
            <div className="h-screen w-screen bg-[#050508] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-[#0a0d1a] text-white overflow-hidden">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
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
                <div
                    className="absolute w-[800px] h-[800px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 50%)',
                        left: '20%',
                        top: '60%',
                        animation: 'pulse 10s ease-in-out infinite reverse',
                    }}
                />
            </div>

            {/* Grid Pattern */}
            <div
                className="absolute inset-0 opacity-[0.015] pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                    backgroundSize: '80px 80px',
                }}
            />

            <Toolbar />

            <div className="flex-1 flex overflow-hidden relative z-10">
                <Sidebar />

                {/* Main Canvas Area */}
                <div className="flex-1 flex flex-col m-3 ml-0">
                    {/* Dark Terminal Style Window */}
                    <div className="flex-1 bg-[#0d1024]/80 backdrop-blur-xl rounded-2xl border border-indigo-500/10 shadow-2xl shadow-indigo-500/5 overflow-hidden flex flex-col">
                        {/* Window Header */}
                        <div className="h-10 bg-gradient-to-r from-[#141830]/90 to-[#151a35]/80 border-b border-indigo-500/10 flex items-center px-4 gap-2 shrink-0">
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500 transition-colors"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-400 hover:bg-yellow-500 transition-colors"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400 hover:bg-green-500 transition-colors"></div>
                            </div>
                            <span className="flex-1 text-center text-xs font-medium text-indigo-300/50">
                                MockFlow Studio
                            </span>
                            <div className="w-14"></div>
                        </div>

                        {/* Canvas */}
                        <div className="flex-1 relative">
                            <EditorCanvas />
                            <TunnelStatus />
                        </div>
                    </div>
                </div>

                <NodeConfigPanel />
            </div>

            {/* Onboarding */}
            <OnboardingGuide open={showOnboarding} onClose={() => setShowOnboarding(false)} />

            {/* CSS Animations */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes pulse {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.02); }
                }
            `}} />
        </div>
    );
}
