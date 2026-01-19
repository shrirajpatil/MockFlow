import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { ConditionalNodeData } from '@/types/nodes';
import { GitBranch } from 'lucide-react';

const ConditionalNode = ({ data, selected }: NodeProps<ConditionalNodeData>) => {
    return (
        <div className="relative group">
            <Handle
                type="target"
                position={Position.Top}
                className="!w-3 !h-3 !bg-slate-900 !border-2 !border-slate-700 !rounded-full !-top-1.5"
            />
            <div className={`
                w-[280px] rounded-xl overflow-hidden transition-all duration-300
                bg-slate-900/95 backdrop-blur-xl border border-slate-800
                shadow-2xl shadow-black/50
                ${selected ? 'ring-2 ring-fuchsia-500 ring-offset-2 ring-offset-[#0a0d1a] scale-[1.02]' : ''}
                group-hover:border-slate-600
            `}>
                {/* Header Area */}
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 border-b border-slate-800/50">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fuchsia-500 to-pink-600 flex items-center justify-center shadow-lg">
                        <GitBranch className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-100 text-sm tracking-tight">{data.label || 'Conditional'}</span>
                        <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Logic Module</span>
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-4 space-y-3 bg-slate-900/20">
                    <div className="text-slate-400 text-[10px] font-mono bg-slate-950/50 rounded-lg p-2.5 border border-slate-800 flex items-center gap-2">
                        <code className="text-fuchsia-400 font-bold">IF</code>
                        <span className="truncate">{data.condition || 'condition'}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold">
                        <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-tighter">True Output</span>
                        <span className="px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-tighter">False Output</span>
                    </div>
                </div>
            </div>

            {/* Two output handles */}
            <Handle
                type="source"
                position={Position.Bottom}
                id="true"
                style={{ left: '25%' }}
                className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-slate-900 !rounded-full !-bottom-1.5 shadow-lg shadow-emerald-500/50"
            />
            <Handle
                type="source"
                position={Position.Bottom}
                id="false"
                style={{ left: '75%' }}
                className="!w-3 !h-3 !bg-red-500 !border-2 !border-slate-900 !rounded-full !-bottom-1.5 shadow-lg shadow-red-500/50"
            />
        </div>
    );
};

export default memo(ConditionalNode);
