'use client';

import { Node } from 'reactflow';
import useStore from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

// Believable pool of "your backend just fell over" status codes.
const ERROR_CODE_POOL = [500, 502, 503, 504, 429];

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

/** Generates a fresh, fully unhinged chaos config for one Response node. Latency is capped at
 * 0-5000ms to match the 5s ceiling enforced server-side in workflowExecutor's applyChaos. */
function randomChaosConfig() {
    const a = randomInt(0, 5000);
    const b = randomInt(0, 5000);
    const latencyMinMs = Math.min(a, b);
    const latencyMaxMs = Math.max(a, b);

    const shuffled = [...ERROR_CODE_POOL].sort(() => Math.random() - 0.5);
    const errorStatusCodes = shuffled.slice(0, randomInt(1, 3));

    return {
        enabled: true,
        latencyMinMs,
        latencyMaxMs,
        errorRate: randomInt(0, 100),
        errorStatusCodes,
    };
}

const isResponseNode = (n: Node) => ((n.data as any)?.type || n.type) === 'response';

export default function PanicButton() {
    const { nodes, setNodes } = useStore();
    const { toast } = useToast();

    const responseNodeCount = nodes.filter(isResponseNode).length;
    const hasResponseNodes = responseNodeCount > 0;

    const handlePanic = () => {
        if (!hasResponseNodes) return;

        const nextNodes = nodes.map((n) => {
            if (!isResponseNode(n)) return n;
            return {
                ...n,
                data: {
                    ...n.data,
                    chaos: randomChaosConfig(),
                },
            };
        });

        setNodes(nextNodes);

        toast({
            title: `🔥 Chaos unleashed on ${responseNodeCount} endpoint${responseNodeCount === 1 ? '' : 's'}`,
            description: 'Every Response node now has randomized latency and failure rates. Ctrl+Z to undo.',
        });
    };

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span>
                    <Button
                        size="sm"
                        onClick={handlePanic}
                        disabled={!hasResponseNodes}
                        className="relative overflow-hidden border-0 text-white font-semibold bg-gradient-to-r from-red-600 via-fuchsia-600 to-red-600 bg-[length:200%_100%] hover:bg-[position:100%_0] transition-[background-position] duration-500 disabled:opacity-30 disabled:cursor-not-allowed animate-panic-shake hover:animate-none shadow-[0_0_16px_-2px_rgba(232,17,102,0.55)]"
                    >
                        😈 Panic Mode
                    </Button>
                </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-[220px]">
                {hasResponseNodes
                    ? `Randomizes chaos mode (latency + error rate) across all ${responseNodeCount} Response node${responseNodeCount === 1 ? '' : 's'} at once. For stress-testing a totally flaky backend. Undoable with Ctrl+Z.`
                    : 'Add a Response node first — nothing to unleash chaos on yet.'}
            </TooltipContent>
        </Tooltip>
    );
}
