import { Search, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import type { FunctionEntry } from '../types';

interface FunctionListProps {
  functions: FunctionEntry[];
  selectedAddress: string | null;
  onSelectFunction: (address: string) => void;
}

function computeComplexity(edges: number, nodes: number) {
  return edges - nodes + 2; // McCabe's formula
}

export default function FunctionList({
  functions,
  selectedAddress,
  onSelectFunction,
}: FunctionListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFunctions = functions.filter(
    (fn) =>
      fn.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fn.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-black/30 backdrop-blur-sm border-r border-white/10">
      <div className="p-4 border-b border-white/10">
        <h2 className="mb-3 text-white/90">Functions</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search functions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <p className="mt-2 text-white/50">{filteredFunctions.length} functions</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredFunctions.map((fn) => (
          <button
            key={fn.address}
            onClick={() => onSelectFunction(fn.address)}
            className={`w-full px-4 py-3 text-left transition-colors border-b border-white/5 hover:bg-white/5 ${
              selectedAddress === fn.address
                ? 'bg-blue-500/20 border-l-4 border-l-blue-500'
                : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono">{fn.name}</span>
                  {fn.cfg_edges && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        computeComplexity(fn.cfg_edges, fn.cfg_nodes) > 10
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}
                    >
                      Complexity: {computeComplexity(fn.cfg_edges, fn.cfg_nodes)}
                    </span>
                  )}
                </div>
                <p className="text-white/50">{fn.address}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/30 shrink-0 ml-2" />
            </div>
            <p className="text-white/40 mt-1">{fn.size} bytes</p>
          </button>
        ))}
      </div>
    </div>
  );
}
