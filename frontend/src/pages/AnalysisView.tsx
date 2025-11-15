import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getFunctions, getDisassembly } from '../lib/api';
import type { FunctionEntry } from '../types';
import FunctionList from '../components/FunctionList';
import CodeView from '../components/CodeView';
import ExplanationPanel from '../components/ExplanationPanel';
import Header from '../components/Header';

export default function AnalysisView() {
  const { fileId } = useParams<{ fileId: string }>();
  const [functions, setFunctions] = useState<FunctionEntry[]>([]);
  const [selected, setSelected] = useState<FunctionEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!fileId) return;

    async function load() {
      try {
        const data = await getFunctions(fileId);
        setFunctions(data);
        if (data.length > 0) {
          setSelected(data[0]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Failed to load functions:', error);
        setLoading(false);
      }
    }
    load();
  }, [fileId]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center pt-16">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-white/60">Loading analysis...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="fixed top-32 bottom-0 left-0 right-0 flex flex-col">
        <div className="flex-1 grid grid-cols-[300px_1fr_400px] overflow-hidden">
          <div className="border-r border-white/10 overflow-y-auto">
            <FunctionList
              functions={functions}
              selectedAddress={selected?.address || null}
              onSelectFunction={(addr) => {
                const func = functions.find((f) => f.address === addr);
                if (func) setSelected(func);
              }}
            />
          </div>
          <div className="border-r border-white/10 overflow-y-auto">
            <CodeView fileId={fileId || ''} address={selected?.address || null} />
          </div>
          <div className="overflow-y-auto">
            <ExplanationPanel fileId={fileId || ''} address={selected?.address || null} />
          </div>
        </div>
      </div>
    </>
  );
}