'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Inbox, Shield, Shuffle, Send, Database, GitBranch, Sparkles } from 'lucide-react';

export default function Sidebar() {
    const nodeTypes = [
        { type: 'request', label: 'Request', icon: Inbox, desc: 'API endpoint', gradient: 'from-blue-500 to-indigo-600', tooltip: 'Where a call comes in. Set the method and path, e.g. GET /users/:id.' },
        { type: 'validation', label: 'Validation', icon: Shield, desc: 'Validate data', gradient: 'from-indigo-500 to-purple-600', tooltip: "Reject bad input before your logic runs, e.g. require an email field." },
        { type: 'transformation', label: 'Transform', icon: Shuffle, desc: 'Modify data', gradient: 'from-amber-500 to-orange-600', tooltip: 'Copy or reshape a value for later, e.g. combine first+last name into fullName.' },
        { type: 'response', label: 'Response', icon: Send, desc: 'Return result', gradient: 'from-emerald-500 to-teal-600', tooltip: "What gets sent back: status code and JSON body, e.g. 200 with {status:'ok'}." },
        { type: 'state', label: 'State', icon: Database, desc: 'Store data', gradient: 'from-cyan-500 to-blue-600', tooltip: 'Remember something between separate requests, e.g. a counter that increments each call.' },
        { type: 'conditional', label: 'Conditional', icon: GitBranch, desc: 'If/else logic', gradient: 'from-fuchsia-500 to-pink-600', tooltip: "Branch the flow, e.g. respond 401 if the request has no token." },
    ];

    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="w-64 bg-[#0b0b0d] backdrop-blur-2xl border-r border-white/10 flex flex-col">
            {/* Header */}
            <div className="px-5 py-5 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <h2 className="font-semibold text-sm text-white">Node Library</h2>
                </div>
                <p className="text-xs text-white/35 mt-1">Drag to canvas</p>
            </div>

            {/* Node List */}
            <ScrollArea className="flex-1">
                <TooltipProvider delayDuration={300}>
                    <div className="p-4 space-y-3">
                        {nodeTypes.map((node) => {
                            const Icon = node.icon;
                            return (
                                <Tooltip key={node.type}>
                                    <TooltipTrigger asChild>
                                        <div
                                            className="group p-4 rounded-xl bg-[#111114] border border-white/10 hover:border-indigo-500/40 cursor-grab active:cursor-grabbing transition-all duration-300 hover:translate-x-1"
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
                                                    <span className="text-xs text-white/35">
                                                        {node.desc}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="max-w-[220px]">
                                        <p>{node.tooltip}</p>
                                    </TooltipContent>
                                </Tooltip>
                            );
                        })}
                    </div>
                </TooltipProvider>
            </ScrollArea>

            {/* Footer hint */}
            <div className="px-4 py-4 border-t border-white/10">
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3">
                    <p className="text-xs text-indigo-300">
                        💡 <span className="font-medium">Tip:</span> Connect nodes by dragging from edges
                    </p>
                </div>
            </div>
        </div>
    );
}
