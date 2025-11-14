import { useEffect, useState } from "react";
import { getFunctions, getDisassembly } from "../lib/api";
import { FunctionEntry } from "../type";
import FunctionList from "../components/FunctionList";
import CodeView from "../components/CodeView";

export default function AnalysisView({ fileId, onBack }: { fileId: string; onBack: () => void }) {
  const [functions, setFunctions] = useState<FunctionEntry[]>([]);
  const [selected, setSelected] = useState<FunctionEntry | null>(null);
  const [disasm, setDisasm] = useState<any | null>(null);

  useEffect(() => {
    async function load() {
      const res = await getFunctions(fileId);
      setFunctions(res.functions || []);
      if (res.functions && res.functions.length > 0) {
        setSelected(res.functions[0]);
      }
    }
    load();
  }, [fileId]);

  useEffect(() => {
    async function loadDisasm() {
      if (!selected) return;
      const addr = String(selected.offset || selected.addr || selected.offset);
      const res = await getDisassembly(fileId, addr);
      setDisasm(res.disassembly || res);
    }
    loadDisasm();
  }, [selected]);

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-3">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Functions</h3>
            <button onClick={onBack} className="text-sm text-slate-500">Close</button>
          </div>
          <FunctionList items={functions} onSelect={(f)=>setSelected(f)} selected={selected} fileId={fileId} />
        </div>
      </div>

      <div className="col-span-9">
        <div className="card">
          <CodeView data={disasm} />
        </div>
      </div>
    </div>
  );
}