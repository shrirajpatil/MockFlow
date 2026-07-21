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
            <div className="h-screen w-screen bg-[#0b0b0d] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-[#0b0b0d] text-white overflow-hidden">
            <Toolbar />

            <div className="flex-1 flex overflow-hidden relative z-10">
                <Sidebar />

                {/* Main Canvas Area */}
                <div className="flex-1 flex flex-col m-3 ml-0">
                    <div className="flex-1 surface-card rounded-xl overflow-hidden flex flex-col">
                        {/* Window Header */}
                        <div className="h-9 hairline-b border-b bg-white/[0.02] flex items-center px-4 gap-2 shrink-0">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-white/10"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-white/10"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-white/10"></div>
                            </div>
                            <span className="flex-1 text-center text-xs font-mono text-white/30">
                                mockflow-studio
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
        </div>
    );
}
