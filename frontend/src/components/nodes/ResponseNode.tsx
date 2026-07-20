import React, { memo } from 'react';
import { NodeProps } from 'reactflow';
import BaseNode from './BaseNode';
import { ResponseNodeData } from '@/types/nodes';
import { Send } from 'lucide-react';

const ResponseNode = ({ data, selected }: NodeProps<ResponseNodeData>) => {
    const statusCode = data.statusCode || 200;
    const isSuccess = statusCode >= 200 && statusCode < 300;

    return (
        <BaseNode
            label={data.label || 'Response'}
            selected={selected}
            showSourceHandle={false}
            icon={<Send className="w-4 h-4 text-white" />}
            gradient="from-emerald-500 to-teal-600"
        >
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded border ${isSuccess ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'} font-bold text-[10px]`}>
                        {statusCode}
                    </span>
                    <span className="text-white/35 text-[10px]">
                        {isSuccess ? 'Response Success' : 'Error Response'}
                    </span>
                </div>
            </div>
        </BaseNode>
    );
};

export default memo(ResponseNode);
