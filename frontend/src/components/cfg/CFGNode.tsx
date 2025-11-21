import React from 'react';

type Instruction = {
  offset?: number | string;
  disasm?: string;
  opcode?: string;
  bytes?: string;
};

type CFGNodeData = {
  title: string;
  instructions: Instruction[] | string[];
  meta?: { size?: number } | any;
  preview?: string;
};

function toHex(v: number | string | undefined) {
  if (v === undefined || v === null) return '';
  if (typeof v === 'string') {
    if (v.toLowerCase().startsWith('0x')) return v.toLowerCase();
    const n = Number(v);
    return Number.isFinite(n) ? `0x${n.toString(16)}` : v;
  }
  return `0x${v.toString(16)}`;
}

function fmtInstruction(i: any): string {
  if (typeof i === 'string') return i;
  if (!i || typeof i !== 'object') return '';
  const addr = toHex(i.offset);
  const text = i.disasm || i.opcode || i.bytes || '';
  return `${addr}${text ? '  ' + text : ''}`;
}

export default function CFGNode({ data }: { data: CFGNodeData }) {
  const { title, preview, instructions = [], meta } = data;
  const lines = Array.isArray(instructions) ? instructions.slice(0, 12).map(fmtInstruction) : [];

  return (
    <div className="rounded-md border border-white/15 bg-[#0b0f17] text-white/90 shadow-lg min-w-[220px] max-w-[360px]">
      <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
        <div className="font-mono text-xs text-blue-300 break-all">{title}</div>
        {meta?.size !== undefined && (
          <div className="ml-2 text-[10px] text-white/50">size {meta.size}</div>
        )}
      </div>
      <div className="px-3 py-2">
        {preview && (
          <div className="text-xs text-white/80 font-mono truncate">{preview}</div>
        )}
        {lines.length > 0 && (
          <div className="mt-2 max-h-36 overflow-auto pr-1">
            <ul className="font-mono text-[11px] leading-5 text-white/80">
              {lines.map((l, idx) => (
                <li key={idx} className="whitespace-pre break-words">
                  {l}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}