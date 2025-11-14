import { FunctionEntry } from "../type";
import React, { useState } from "react";
import ExplanationPanel from "./ExplanationPanel";

export default function FunctionList({ items, onSelect, selected, fileId }: { items: FunctionEntry[]; onSelect: (f: FunctionEntry) => void; selected?: FunctionEntry | null; fileId: string }) {
  const [selectedForExplanation, setSelectedForExplanation] = useState<{ addr: string } | null>(null);

  return (
    <div className="space-y-2 max-h-[60vh] overflow-auto">
      {items.map((f) => {
        const key = String(f.offset || f.addr);
        const isSel = selected && (selected.offset === f.offset || selected.addr === f.addr);
        return (
          <div key={key} className={`w-full text-left p-2 rounded ${isSel ? "bg-slate-100" : "hover:bg-slate-50"}`}>
            <button onClick={()=>onSelect(f)} className="w-full text-left">
              <div className="text-sm font-medium">{f.name || `fcn.${key}`}</div>
              <div className="text-xs text-slate-500">0x{(f.offset||f.addr||0).toString(16)}</div>
            </button>
            <div className="flex items-center gap-2 mt-2">
              <button
                className="text-xs px-2 py-1 border rounded"
                onClick={() => setSelectedForExplanation({ addr: key })}
              >
                Explain
              </button>
            </div>
          </div>
        );
      })}
      {items.length===0 && <div className="text-sm text-slate-400">No functions found.</div>}
      
      {selectedForExplanation && (
        <div className="mt-4">
          <ExplanationPanel
            fileId={fileId}
            addr={selectedForExplanation.addr}
            onClose={() => setSelectedForExplanation(null)}
          />
        </div>
      )}
    </div>
  );
}