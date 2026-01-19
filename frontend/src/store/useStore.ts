import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';

interface HistoryState {
  nodes: Node[];
  edges: Edge[];
}

type RFState = {
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  history: HistoryState[];
  historyIndex: number;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSelectedNode: (node: Node | null) => void;
  updateNodeData: (nodeId: string, data: any) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
};

const MAX_HISTORY = 50;

const useStore = create<RFState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  history: [],
  historyIndex: -1,

  onNodesChange: (changes: NodeChange[]) => {
    const newNodes = applyNodeChanges(changes, get().nodes);
    set({
      nodes: newNodes,
    });

    // Save to history for undo/redo (only for significant changes)
    const hasSignificantChange = changes.some(
      change => change.type === 'add' || change.type === 'remove'
    );

    if (hasSignificantChange) {
      const { history, historyIndex } = get();
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({ nodes: newNodes, edges: get().edges });

      set({
        history: newHistory.slice(-MAX_HISTORY),
        historyIndex: Math.min(newHistory.length - 1, MAX_HISTORY - 1),
      });
    }
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    const newEdges = applyEdgeChanges(changes, get().edges);
    set({
      edges: newEdges,
    });

    // Save to history for undo/redo
    const hasSignificantChange = changes.some(
      change => change.type === 'add' || change.type === 'remove'
    );

    if (hasSignificantChange) {
      const { history, historyIndex } = get();
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({ nodes: get().nodes, edges: newEdges });

      set({
        history: newHistory.slice(-MAX_HISTORY),
        historyIndex: Math.min(newHistory.length - 1, MAX_HISTORY - 1),
      });
    }
  },

  onConnect: (connection: Connection) => {
    const newEdges = addEdge(connection, get().edges);
    set({
      edges: newEdges,
    });

    // Save to history
    const { history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: get().nodes, edges: newEdges });

    set({
      history: newHistory.slice(-MAX_HISTORY),
      historyIndex: Math.min(newHistory.length - 1, MAX_HISTORY - 1),
    });
  },

  setNodes: (nodes: Node[]) => {
    set({ nodes });

    // Save to history
    const { history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes, edges: get().edges });

    set({
      history: newHistory.slice(-MAX_HISTORY),
      historyIndex: Math.min(newHistory.length - 1, MAX_HISTORY - 1),
    });
  },

  setEdges: (edges: Edge[]) => {
    set({ edges });
  },

  setSelectedNode: (node: Node | null) => {
    set({ selectedNode: node });
  },

  updateNodeData: (nodeId: string, data: any) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      ),
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const state = history[newIndex];
      set({
        nodes: state.nodes,
        edges: state.edges,
        historyIndex: newIndex,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const state = history[newIndex];
      set({
        nodes: state.nodes,
        edges: state.edges,
        historyIndex: newIndex,
      });
    }
  },

  canUndo: () => {
    return get().historyIndex > 0;
  },

  canRedo: () => {
    const { history, historyIndex } = get();
    return historyIndex < history.length - 1;
  },
}));

export default useStore;
