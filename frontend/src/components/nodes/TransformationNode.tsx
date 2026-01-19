import React, { memo } from 'react';
import { NodeProps } from 'reactflow';
import BaseNode from './BaseNode';
import { TransformationNodeData } from '@/types/nodes';
import { Shuffle } from 'lucide-react';

const TransformationNode = ({ data, selected }: NodeProps<TransformationNodeData>) => {
    return (
        <BaseNode
            label={data.label || 'Transform'}
            selected={selected}
            icon={<Shuffle className="w-4 h-4 text-white" />}
            gradient="from-amber-500 to-orange-600"
        >
            <div className="space-y-1">
                {data.transformations && data.transformations.length > 0 ? (
                    <div className="text-slate-400 text-[10px] flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-orange-400"></span>
                        <span className="text-slate-100 font-semibold">{data.transformations.length}</span> steps active
                    </div>
                ) : (
                    <div className="text-slate-500 text-[10px]">No transformations</div>
                )}
            </div>
        </BaseNode>
    );
};

export default memo(TransformationNode);
