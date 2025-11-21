import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getFunctions } from '../lib/api';
import type { FunctionEntry } from '../types';
import FunctionList from '../components/FunctionList';
import CodeView from '../components/CodeView';
import ExplanationPanel from '../components/ExplanationPanel';
import Header from '../components/Header';
import ControlFlowGraph from '../components/cfg/ControlFlowGraph';

export default function AnalysisView() {
  const { fileId } = useParams<{ fileId: string }>();
  const [functions, setFunctions] = useState<FunctionEntry[]>([]);
  const [selected, setSelected] = useState<FunctionEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'disassembly' | 'cfg' | 'explanation'>('disassembly');

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
            <div className="flex border-b border-white/10 bg-black/40">
              <button
                onClick={() => setActiveTab('disassembly')}
                className={`px-6 py-3 transition-colors ${
                  activeTab === 'disassembly'
                    ? 'bg-blue-600 text-white'
                    : 'bg-transparent text-white/60 hover:text-white/90'
                }`}
              >
                Disassembly
              </button>
              <button
                onClick={() => setActiveTab('cfg')}
                className={`px-6 py-3 transition-colors ${
                  activeTab === 'cfg'
                    ? 'bg-blue-600 text-white'
                    : 'bg-transparent text-white/60 hover:text-white/90'
                }`}
              >
                Control Flow Graph
              </button>
            </div>

            <div className="flex-1">
              {activeTab === 'disassembly' ? (
                <CodeView fileId={fileId || ''} address={selected?.address || null} />
              ) : (
                <ControlFlowGraph fileId={fileId || ''} address={selected?.address || null} />
              )}
            </div>
          </div>
          <div className="overflow-y-auto">
            <ExplanationPanel fileId={fileId || ''} address={selected?.address || null} />
          </div>
        </div>
      </div>
    </>
  );
}