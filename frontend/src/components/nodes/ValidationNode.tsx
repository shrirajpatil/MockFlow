import React, { memo } from 'react';
import { NodeProps } from 'reactflow';
import BaseNode from './BaseNode';
import { ValidationNodeData } from '@/types/nodes';
import { Shield } from 'lucide-react';

const ValidationNode = ({ data, selected }: NodeProps<ValidationNodeData>) => {
    return (
        <BaseNode
            label={data.label || 'Validation'}
            selected={selected}
            icon={<Shield className="w-4 h-4 text-white" />}
            gradient="from-indigo-500 to-purple-600"
        >
            <div className="space-y-1">
                {data.rules && data.rules.length > 0 ? (
                    <div className="text-white/45 text-[10px] flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-indigo-400"></span>
                        <span className="text-white font-semibold">{data.rules.length}</span> rules active
                    </div>
                ) : (
                    <div className="text-white/35 text-[10px]">No rules configured</div>
                )}
            </div>
        </BaseNode>
    );
};

export default memo(ValidationNode);
