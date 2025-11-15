import { useEffect, useState } from 'react';
import { Code2, Loader2, Download } from 'lucide-react';
import { getDisassembly } from '../lib/api';
import type { DisassemblyResponse, DisassemblyLine } from '../types';

interface CodeViewProps {
  fileId: string;
  address: string | null;
}

// Helper to determine instruction color based on type
const getInstructionColor = (type: string): string => {
  switch (type) {
    case 'call':
      return 'text-yellow-400';
    case 'jmp':
    case 'cjmp':
      return 'text-green-400';
    case 'ret':
      return 'text-red-400';
    case 'push':
    case 'pop':
      return 'text-purple-400';
    case 'mov':
      return 'text-blue-300';
    case 'cmp':
    case 'test':
      return 'text-orange-400';
    case 'nop':
      return 'text-gray-500';
    default:
      return 'text-white/90';
  }
};

// Helper to check if instruction is a jump/call
const isJumpOrCall = (type: string): boolean => {
  return ['jmp', 'cjmp', 'call'].includes(type);
};

export default function CodeView({ fileId, address }: CodeViewProps) {
  const [disassembly, setDisassembly] = useState<DisassemblyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);

  useEffect(() => {
    if (!address) {
      setDisassembly(null);
      return;
    }

    setLoading(true);
    getDisassembly(fileId, address)
      .then((data) => {
        setDisassembly(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [fileId, address]);

  const downloadJSON = () => {
    if (!disassembly) return;
    
    const json = JSON.stringify(disassembly, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${disassembly.function_name}_${disassembly.address}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-black/20 backdrop-blur-sm">
        <Code2 className="w-16 h-16 text-white/20 mb-4" />
        <p className="text-white/40">Select a function to view disassembly</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-black/20 backdrop-blur-sm">
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin mb-4" />
        <p className="text-white/60">Loading disassembly...</p>
      </div>
    );
  }

  if (!disassembly) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-black/20 backdrop-blur-sm">
        <p className="text-white/40">Failed to load disassembly</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black/20 backdrop-blur-sm">
      <div className="px-6 py-4 border-b border-white/10 bg-black/30 flex items-center justify-between">
        <div>
          <h2 className="text-white/90">{disassembly.function_name}</h2>
          <p className="text-white/50 mt-1">{disassembly.address}</p>
        </div>
        <button
          onClick={downloadJSON}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white/80 hover:text-white"
          title="Download raw JSON"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm">Export JSON</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto font-mono text-sm">
        <table className="w-full">
          <thead className="sticky top-0 bg-black/50 backdrop-blur-sm border-b border-white/10">
            <tr>
              <th className="px-4 py-3 text-left text-white/70 w-24">Offset</th>
              <th className="px-4 py-3 text-left text-white/70 w-32">Bytes</th>
              <th className="px-4 py-3 text-left text-white/70 w-20">Size</th>
              <th className="px-4 py-3 text-left text-white/70 w-24">Type</th>
              <th className="px-4 py-3 text-left text-white/70">Disassembly</th>
              <th className="px-4 py-3 text-left text-white/70">Comment</th>
            </tr>
          </thead>
          <tbody>
            {disassembly.lines.map((line: DisassemblyLine, idx: number) => (
              <tr
                key={idx}
                className={`border-b border-white/5 hover:bg-white/10 transition-colors relative group ${
                  isJumpOrCall(line.type) ? 'bg-white/5' : ''
                }`}
                onMouseEnter={() => setHoveredLine(idx)}
                onMouseLeave={() => setHoveredLine(null)}
              >
                {/* Offset */}
                <td className="px-4 py-2 text-cyan-400">
                  0x{line.offset.toString(16).padStart(4, '0')}
                </td>
                
                {/* Bytes */}
                <td className="px-4 py-2 text-gray-400 font-mono text-xs">
                  {line.bytes}
                </td>
                
                {/* Size */}
                <td className="px-4 py-2 text-gray-500">
                  {line.size}
                </td>
                
                {/* Type */}
                <td className={`px-4 py-2 ${getInstructionColor(line.type)}`}>
                  {line.type}
                </td>
                
                {/* Disassembly */}
                <td className={`px-4 py-2 ${getInstructionColor(line.type)}`}>
                  {line.disasm}
                  {line.jump !== undefined && (
                    <span className="ml-2 text-xs text-green-400 opacity-70">
                      → 0x{line.jump.toString(16)}
                    </span>
                  )}
                </td>
                
                {/* Comment */}
                <td className="px-4 py-2 text-gray-500 italic text-xs">
                  {line.comment && `; ${line.comment}`}
                </td>

                {/* Hover tooltip showing full JSON */}
                {hoveredLine === idx && (
                  <td className="absolute left-full top-0 ml-2 z-10 pointer-events-none">
                    <div className="bg-black/90 border border-white/20 rounded-lg p-3 shadow-xl min-w-[300px] backdrop-blur-sm">
                      <pre className="text-xs text-white/80 whitespace-pre-wrap">
                        {JSON.stringify(line, null, 2)}
                      </pre>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="px-6 py-3 border-t border-white/10 bg-black/30 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-yellow-400">●</span>
          <span className="text-white/60">Call</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-green-400">●</span>
          <span className="text-white/60">Jump</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-red-400">●</span>
          <span className="text-white/60">Return</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-purple-400">●</span>
          <span className="text-white/60">Stack</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-blue-300">●</span>
          <span className="text-white/60">Move</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-orange-400">●</span>
          <span className="text-white/60">Compare</span>
        </div>
      </div>
    </div>
  );
}
