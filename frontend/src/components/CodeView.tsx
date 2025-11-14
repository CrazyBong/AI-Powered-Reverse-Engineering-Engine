export default function CodeView({ data }: { data: any }) {
  if (!data) return <div className="text-sm text-slate-400">Select a function to view disassembly.</div>;

  // Basic pretty print of JSON disassembly (improve later)
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Disassembly</h3>
      <pre className="text-sm overflow-auto max-h-[70vh] bg-slate-50 p-3 rounded">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}