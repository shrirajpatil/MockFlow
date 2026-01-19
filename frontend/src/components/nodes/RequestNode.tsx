import React, { memo } from 'react';
import { NodeProps } from 'reactflow';
import BaseNode from './BaseNode';
import { RequestNodeData } from '@/types/nodes';
import { Inbox } from 'lucide-react';

const RequestNode = ({ data, selected }: NodeProps<RequestNodeData>) => {
    return (
        <BaseNode
            label={data.label || 'Request'}
            selected={selected}
            showTargetHandle={false}
            icon={<Inbox className="w-4 h-4 text-white" />}
            gradient="from-blue-500 to-indigo-600"
        >
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold text-[10px] border border-blue-500/20">
                        {data.method || 'GET'}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px] truncate">{data.path || '/api/endpoint'}</span>
                </div>
                {data.pathParams && data.pathParams.length > 0 && (
                    <div className="text-slate-500 text-[10px]">
                        Path Params: {data.pathParams.length}
                    </div>
                )}
            </div>
        </BaseNode>
    );
};

export default memo(RequestNode);
