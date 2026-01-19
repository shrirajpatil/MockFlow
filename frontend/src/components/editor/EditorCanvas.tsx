'use client';

import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
    Controls,
    Background,
    MiniMap,
    ReactFlowProvider,
    useReactFlow,
    BackgroundVariant,
    ConnectionMode,
    MarkerType,
} from 'reactflow';
import RequestNode from '../nodes/RequestNode';
import ValidationNode from '../nodes/ValidationNode';
import TransformationNode from '../nodes/TransformationNode';
import ResponseNode from '../nodes/ResponseNode';
import StateNode from '../nodes/StateNode';
import ConditionalNode from '../nodes/ConditionalNode';
import 'reactflow/dist/style.css';
import useStore from '@/store/useStore';

const nodeTypes = {
    request: RequestNode,
    validation: ValidationNode,
    transformation: TransformationNode,
    response: ResponseNode,
    state: StateNode,
    conditional: ConditionalNode,
};

// Professional edge styling with animated markers
const defaultEdgeOptions = {
    type: 'smoothstep',
    animated: true,
    style: { strokeWidth: 2 },
    markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
    },
};

const EditorCanvasContent = () => {
    const { nodes, edges, onNodesChange, onEdgesChange, onConnect, setNodes, setEdges } = useStore();
    const reactFlowWrapper = React.useRef<HTMLDivElement>(null);
    const { project, setViewport, getNodes, getEdges } = useReactFlow();

    // Keyboard shortcuts for professional UX
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Check if user is typing in an input/textarea/contenteditable
            const target = event.target as HTMLElement;
            const isTyping = target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable ||
                target.closest('[contenteditable="true"]');

            // Delete selected nodes/edges with Delete or Backspace
            // Only if NOT typing in an input field
            if ((event.key === 'Delete' || event.key === 'Backspace') && !isTyping) {
                const selectedNodes = getNodes().filter(node => node.selected);
                const selectedEdges = getEdges().filter(edge => edge.selected);

                if (selectedNodes.length > 0 || selectedEdges.length > 0) {
                    event.preventDefault();
                    setNodes(getNodes().filter(node => !node.selected));
                    setEdges(getEdges().filter(edge => !edge.selected));
                }
            }

            // Fit view with 'F' key (only if not typing)
            if ((event.key === 'f' || event.key === 'F') && !isTyping) {
                event.preventDefault();
                setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 300 });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [getNodes, getEdges, setNodes, setEdges, setViewport]);


    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');
            if (typeof type === 'undefined' || !type) {
                return;
            }

            const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
            const position = project({
                x: event.clientX - (reactFlowBounds?.left || 0),
                y: event.clientY - (reactFlowBounds?.top || 0),
            });

            // Create node with proper default data based on type
            const defaultData: Record<string, any> = {
                request: { label: 'Request', type: 'request', method: 'GET', path: '/api/endpoint' },
                validation: { label: 'Validation', type: 'validation', rules: [] },
                transformation: { label: 'Transformation', type: 'transformation', transformations: [] },
                response: { label: 'Response', type: 'response', statusCode: 200, bodyTemplate: '{}' },
                state: { label: 'State', type: 'state', operation: 'get', key: 'state.key' },
                conditional: { label: 'Conditional', type: 'conditional', condition: 'true' },
            };

            const newNode = {
                id: `${type}-${Date.now()}`,
                type,
                position,
                data: defaultData[type] || { label: `${type} node`, type },
            };

            setNodes(nodes.concat(newNode));
        },
        [project, nodes, setNodes]
    );

    return (
        <div className="w-full h-full" ref={reactFlowWrapper}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                onDragOver={onDragOver}
                onDrop={onDrop}
                defaultEdgeOptions={defaultEdgeOptions}
                connectionMode={ConnectionMode.Loose}
                fitView
                snapToGrid
                snapGrid={[15, 15]}
                attributionPosition="bottom-left"
                className="dark-canvas"
            >
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={25}
                    size={1.5}
                    color="rgba(255,255,255,0.2)"
                    className="!bg-[#0c1020]"
                />
                <Controls
                    showInteractive={false}
                    className="!bg-zinc-800 !border-zinc-700 !rounded-xl !shadow-2xl [&>button]:!bg-zinc-800 [&>button]:!border-zinc-700 [&>button]:!text-zinc-400 [&>button:hover]:!bg-zinc-700"
                />
                <MiniMap
                    nodeStrokeWidth={3}
                    zoomable
                    pannable
                    className="!bg-zinc-800/80 !border-zinc-700 !rounded-xl !shadow-2xl"
                    maskColor="rgba(0,0,0,0.7)"
                />
            </ReactFlow>
        </div>
    );
};

export default function EditorCanvas() {
    return (
        <ReactFlowProvider>
            <EditorCanvasContent />
        </ReactFlowProvider>
    );
}
