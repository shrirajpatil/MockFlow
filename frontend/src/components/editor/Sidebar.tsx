'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Inbox, Shield, Shuffle, Send, Database, GitBranch, Sparkles } from 'lucide-react';

export default function Sidebar() {
    const nodeTypes = [
        { type: 'request', label: 'Request', icon: Inbox, desc: 'API endpoint', gradient: 'from-blue-500 to-indigo-600' },
        { type: 'validation', label: 'Validation', icon: Shield, desc: 'Validate data', gradient: 'from-violet-500 to-purple-600' },
        { type: 'transformation', label: 'Transform', icon: Shuffle, desc: 'Modify data', gradient: 'from-amber-500 to-orange-600' },
        { type: 'response', label: 'Response', icon: Send, desc: 'Return result', gradient: 'from-emerald-500 to-teal-600' },
        { type: 'state', label: 'State', icon: Database, desc: 'Store data', gradient: 'from-cyan-500 to-blue-600' },
        { type: 'conditional', label: 'Conditional', icon: GitBranch, desc: 'If/else logic', gradient: 'from-fuchsia-500 to-pink-600' },
    ];

    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="w-64 bg-[#0d1024]/90 backdrop-blur-2xl border-r border-indigo-500/10 flex flex-col">
            {/* Header */}
            <div className="px-5 py-5 border-b border-indigo-500/10">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    <h2 className="font-semibold text-sm bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">Node Library</h2>
                </div>
                <p className="text-xs text-indigo-300/50 mt-1">Drag to canvas</p>
            </div>

            {/* Node List */}
            <ScrollArea className="flex-1">
                <div className="p-4 space-y-3">
                    {nodeTypes.map((node) => {
                        const Icon = node.icon;
                        return (
                            <div
                                key={node.type}
                                className="group p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50 hover:border-violet-500/50 cursor-grab active:cursor-grabbing transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/10 hover:translate-x-1"
                                draggable
                                onDragStart={(event) => onDragStart(event, node.type)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${node.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <span className="text-sm font-semibold text-white block">
                                            {node.label}
                                        </span>
                                        <span className="text-xs text-zinc-500">
                                            {node.desc}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>

            {/* Footer hint */}
            <div className="px-4 py-4 border-t border-white/[0.08]">
                <div className="bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20 rounded-lg p-3">
                    <p className="text-xs text-violet-300">
                        💡 <span className="font-medium">Tip:</span> Connect nodes by dragging from edges
                    </p>
                </div>
            </div>
        </div>
    );
}
