import React, { memo } from 'react';
import { NodeProps } from 'reactflow';
import BaseNode from './BaseNode';
import { StateNodeData } from '@/types/nodes';
import { Database } from 'lucide-react';

const StateNode = ({ data, selected }: NodeProps<StateNodeData>) => {
    return (
        <BaseNode
            label={data.label || 'State'}
            selected={selected}
            icon={<Database className="w-4 h-4 text-white" />}
            gradient="from-cyan-500 to-blue-600"
        >
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 text-[10px] font-bold border border-slate-700 uppercase">
                        {data.operation || 'get'}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px] truncate">{data.key || 'state.key'}</span>
                </div>
            </div>
        </BaseNode>
    );
};

export default memo(StateNode);
