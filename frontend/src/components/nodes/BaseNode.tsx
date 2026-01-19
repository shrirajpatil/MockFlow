import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

interface BaseNodeProps {
    label: string;
    children?: React.ReactNode;
    selected?: boolean;
    showSourceHandle?: boolean;
    showTargetHandle?: boolean;
    icon?: React.ReactNode;
    gradient?: string;
}

const BaseNode = ({
    label,
    children,
    selected,
    showSourceHandle = true,
    showTargetHandle = true,
    icon,
    gradient = 'from-indigo-500 to-violet-500'
}: BaseNodeProps) => {
    return (
        <div className="relative group">
            {showTargetHandle && (
                <Handle
                    type="target"
                    position={Position.Top}
                    className="!w-3 !h-3 !bg-slate-900 !border-2 !border-slate-700 !rounded-full !-top-1.5"
                />
            )}
            <div className={`
                w-[280px] rounded-xl overflow-hidden transition-all duration-300
                bg-slate-900/95 backdrop-blur-xl border border-slate-800
                shadow-2xl shadow-black/50
                ${selected ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#0a0d1a] scale-[1.02]' : ''}
                group-hover:border-slate-600 group-hover:shadow-indigo-500/10
            `}>
                {/* Header Area */}
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 border-b border-slate-800/50">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                        {icon || <span className="text-white text-xs font-bold font-mono">N</span>}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-100 text-sm tracking-tight">{label}</span>
                        <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Node Module</span>
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-4 bg-slate-900/20">
                    {children}
                </div>
            </div>
            {showSourceHandle && (
                <Handle
                    type="source"
                    position={Position.Bottom}
                    className="!w-3 !h-3 !bg-slate-900 !border-2 !border-slate-700 !rounded-full !-bottom-1.5"
                />
            )}
        </div>
    );
};

export default memo(BaseNode);
