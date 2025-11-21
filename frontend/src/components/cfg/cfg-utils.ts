import dagre from 'dagre';
import { Edge, Node, Position } from 'reactflow';
import type { CFGBlock } from '../../types'; // ← Fixed path

export interface CFGNodeData {
  address: string;
  instructions: string[];
  size: number;
}

export const convertCFGToReactFlow = (blocks: CFGBlock[]): { nodes: Node[]; edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const blockMap = new Map<string, CFGBlock>();

  // Index blocks by offset
  blocks.forEach(block => {
    blockMap.set(block.offset, block);
  });

  // Create nodes
  blocks.forEach((block) => {
    const instructions = block.instructions?.map(instr => 
      `${instr.offset}: ${instr.disasm}`
    ) || [];

    nodes.push({
      id: block.offset,
      type: 'cfgNode',
      position: { x: 0, y: 0 }, // Will be calculated by dagre
      data: {
        address: block.offset,
        instructions: instructions,
        size: block.size,
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    });

    // Create edges
    if (block.jump) {
      edges.push({
        id: `${block.offset}-jump-${block.jump}`,
        source: block.offset,
        target: block.jump,
        type: 'smoothstep',
        label: 'true',
        style: { stroke: '#22c55e', strokeWidth: 2 },
        labelBgStyle: { fill: '#1a1a1a' },
        labelStyle: { fill: '#22c55e', fontSize: 10 },
        animated: true,
      });
    }

    if (block.fail) {
      edges.push({
        id: `${block.offset}-fail-${block.fail}`,
        source: block.offset,
        target: block.fail,
        type: 'smoothstep',
        label: 'false',
        style: { stroke: '#ef4444', strokeWidth: 2 },
        labelBgStyle: { fill: '#1a1a1a' },
        labelStyle: { fill: '#ef4444', fontSize: 10 },
        animated: true,
      });
    }
  });

  return { nodes, edges };
};

export const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'TB', ranksep: 80, nodesep: 50 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 250, height: 150 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.position = {
      x: nodeWithPosition.x - 125,
      y: nodeWithPosition.y - 75,
    };
  });

  return { nodes, edges };
};

export type CFGBlock = {
  offset?: number | string;
  size?: number;
  jump?: number | string | null;
  fail?: number | string | null;
  instructions?: Array<{ offset?: number | string; disasm?: string; opcode?: string }>;
  ops?: Array<{ offset?: number | string; disasm?: string; opcode?: string }>;
};

function toHexId(v: number | string | null | undefined) {
  if (v === null || v === undefined) return null;
  if (typeof v === 'string') {
    if (v.startsWith('0x')) return v.toLowerCase();
    const n = Number(v);
    return Number.isFinite(n) ? `0x${n.toString(16)}` : v.toLowerCase();
  }
  if (typeof v === 'number') return `0x${v.toString(16)}`;
  return null;
}

export function normalizeCFGPayload(payload: any): { blocks: CFGBlock[] } {
  if (!payload) return { blocks: [] };
  const raw = Array.isArray(payload) ? payload : (payload.blocks ?? payload.nodes ?? payload.basic_blocks ?? []);
  const blocks: CFGBlock[] = (raw || []).map((b: any) => {
    const instructions = Array.isArray(b?.instructions) ? b.instructions : (Array.isArray(b?.ops) ? b.ops : []);
    return {
      offset: b?.offset ?? b?.addr ?? b?.start ?? null,
      size: b?.size ?? null,
      jump: b?.jump ?? null,
      fail: b?.fail ?? null,
      instructions
    };
  });
  return { blocks };
}

export function buildGraph(blocks: CFGBlock[]) {
  // nodes: {id, label}, edges: {from, to, kind}
  const nodes: Array<{ id: string; label: string }> = [];
  const edges: Array<{ from: string; to: string; kind: 'jump' | 'fallthrough' }> = [];

  const seen = new Set<string>();
  for (const b of blocks) {
    const id = toHexId(b.offset);
    if (!id) continue;
    if (!seen.has(id)) {
      const first = (b.instructions || [])[0];
      const label = first?.disasm ? `${id}\n${first.disasm}` : id;
      nodes.push({ id, label });
      seen.add(id);
    }
  }

  for (const b of blocks) {
    const from = toHexId(b.offset);
    if (!from) continue;

    const j = toHexId(b.jump);
    if (j) edges.push({ from, to: j, kind: 'jump' });

    const f = toHexId(b.fail);
    if (f) edges.push({ from, to: f, kind: 'fallthrough' });
  }

  return { nodes, edges };
}