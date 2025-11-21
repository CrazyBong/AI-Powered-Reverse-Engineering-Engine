import { useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Panel,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Loader2, Network } from 'lucide-react';
import { getCFG } from '../../lib/api';
import { getLayoutedElements } from './cfg-utils';
import CFGNode from './CFGNode';

interface ControlFlowGraphProps {
  fileId: string;
  address: string | null;
}

const nodeTypes = {
  cfgNode: CFGNode,
};

// Helpers to normalize CFG payloads and build RF graph
function toHexId(v: number | string | null | undefined) {
  if (v === null || v === undefined) return null;
  if (typeof v === 'string') {
    if (v.toLowerCase().startsWith('0x')) return v.toLowerCase();
    const n = Number(v);
    return Number.isFinite(n) ? `0x${n.toString(16)}` : v.toLowerCase();
  }
  if (typeof v === 'number') return `0x${v.toString(16)}`;
  return null;
}

type CFGBlock = {
  offset?: number | string;
  addr?: number | string;
  start?: number | string;
  size?: number;
  jump?: number | string | null;
  fail?: number | string | null;
  instructions?: Array<{ offset?: number | string; disasm?: string; opcode?: string }>;
  ops?: Array<{ offset?: number | string; disasm?: string; opcode?: string }>;
  [k: string]: any;
};

function extractRawBlocks(payload: any): any[] {
  if (!payload) return [];
  if (Array.isArray(payload)) {
    // Case: file-level array with one item containing { blocks: [...] }
    if (payload.length === 1 && Array.isArray(payload[0]?.blocks)) {
      return payload[0].blocks;
    }
    // Case: already an array of blocks
    return payload;
  }
  if (Array.isArray(payload.blocks)) return payload.blocks;
  if (Array.isArray(payload.nodes)) return payload.nodes;
  if (Array.isArray(payload.basic_blocks)) return payload.basic_blocks;
  // Nested shape: { blocks: { blocks: [...] } }
  if (payload.blocks?.blocks && Array.isArray(payload.blocks.blocks)) return payload.blocks.blocks;
  return [];
}

function normalizeBlocks(payload: any): CFGBlock[] {
  const raw = extractRawBlocks(payload);
  return (raw || []).map((b: any) => {
    const instructions = Array.isArray(b?.instructions) ? b.instructions : (Array.isArray(b?.ops) ? b.ops : []);
    return {
      offset: b?.offset ?? b?.addr ?? b?.start ?? null,
      size: b?.size ?? null,
      jump: b?.jump ?? null,
      fail: b?.fail ?? null,
      instructions,
      ...b,
    };
  });
}

function buildReactFlow(blocks: CFGBlock[]) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const seen = new Set<string>();

  for (const b of blocks) {
    const id = toHexId(b.offset);
    if (!id) continue;

    if (!seen.has(id)) {
      const first = (b.instructions || [])[0];
      const title = id;
      const preview = first?.disasm || first?.opcode || '';
      nodes.push({
        id,
        type: 'cfgNode',
        data: {
          title,
          // limit instructions passed to the node
          instructions: (b.instructions || []).slice(0, 24),
          meta: { size: b.size },
          preview,
        },
        position: { x: 0, y: 0 },
      });
      seen.add(id);
    }
  }

  for (const b of blocks) {
    const from = toHexId(b.offset);
    if (!from) continue;

    const j = toHexId(b.jump);
    const f = toHexId(b.fail);

    if (j) {
      edges.push({
        id: `${from}->${j}-jump`,
        source: from,
        target: j,
        data: { kind: 'jump' },
        style: { stroke: '#22c55e', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' },
      });
    }

    if (f) {
      edges.push({
        id: `${from}->${f}-fallthrough`,
        source: from,
        target: f,
        data: { kind: 'fallthrough' },
        style: { stroke: '#ef4444', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' },
      });
    }
  }

  return { nodes, edges };
}

export default function ControlFlowGraph({ fileId, address }: ControlFlowGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setNodes([]);
      setEdges([]);
      return;
    }

    let aborted = false;

    const fetchCFG = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getCFG(fileId, address);
        // Accept both { blocks: [...] } and raw arrays
        const blocks = normalizeBlocks(response?.blocks ?? response);

        const { nodes: rawNodes, edges: rawEdges } = buildReactFlow(blocks);
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
          rawNodes,
          rawEdges
        );

        if (!aborted) {
          setNodes(layoutedNodes);
          setEdges(layoutedEdges);
        }
      } catch (err) {
        if (!aborted) {
          setError('Failed to load control flow graph');
          console.error(err);
        }
      } finally {
        if (!aborted) setLoading(false);
      }
    };

    fetchCFG();
    return () => {
      aborted = true;
    };
  }, [fileId, address, setNodes, setEdges]);

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-black/30 backdrop-blur-sm border-l border-white/10">
        <Network className="w-16 h-16 text-white/20 mb-4" />
        <p className="text-white/40 text-center px-6">
          Select a function to view its control flow graph
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-black/30 backdrop-blur-sm border-l border-white/10">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-white/60 mt-4">Loading CFG…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-black/30 backdrop-blur-sm border-l border-white/10">
        <p className="text-red-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white/80"
        >
          Retry
        </button>
      </div>
    );
  }

  // Give ReactFlow a real height so it renders
  return (
    <div className="bg-black/30 backdrop-blur-sm border-l border-white/10" style={{ height: '72vh', minHeight: 480 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        className="bg-transparent"
        minZoom={0.1}
        maxZoom={2}
      >
        <Background color="#ffffff20" gap={16} className="bg-black/20" />
        <Controls className="!bg-black/60 !border-white/20 !shadow-xl" />
        <MiniMap
          className="!bg-black/60 !border-white/20"
          nodeColor="#3b82f6"
          maskColor="#00000080"
        />

        <Panel position="top-left" className="bg-black/60 backdrop-blur-sm border border-white/20 rounded-lg p-3 shadow-xl">
          <div className="text-sm text-white/90">
            <div className="font-semibold mb-1 flex items-center gap-2">
              <Network className="w-4 h-4" />
              Control Flow Graph
            </div>
            <div className="text-xs text-white/60">
              {nodes.length} blocks · {edges.length} edges
            </div>
          </div>
        </Panel>

        <Panel position="top-right" className="bg-black/60 backdrop-blur-sm border border-white/20 rounded-lg p-2 text-xs text-white/70">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-green-500"></div>
              <span>True Branch</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-red-500"></div>
              <span>False Branch</span>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}