import { useEffect, useState } from "react";
import { getStatus } from "../lib/api";

export default function ProcessingView({
  fileId,
  onComplete,
  onBack,
}: {
  fileId: string;
  onComplete: () => void;
  onBack: () => void;
}) {
  // const [status, setStatus] = useState<string>("PENDING");
  const [message, setMessage] = useState<string>("Waiting for analysis...");

  useEffect(() => {
    let mounted = true;
    async function poll() {
      try {
        const res = await getStatus(fileId);
        const s = res.status || res;
        if (!mounted) return;
        // setStatus(s);
        setMessage(`Status: ${s}`);
        if (s === "SUCCESS") {
          onComplete();
        } else if (s === "FAILED") {
          setMessage("Analysis failed. See logs.");
        } else {
          setTimeout(poll, 1500);
        }
      } catch (e) {
        if (!mounted) return;
        setMessage("Error checking status.");
        setTimeout(poll, 2000);
      }
    }
    poll();
    return () => {
      mounted = false;
    };
  }, [fileId]);

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Processing</h2>
        <button className="text-sm text-slate-500" onClick={onBack}>Back</button>
      </div>
      <div className="text-sm text-slate-600 mb-4">File ID: {fileId}</div>
      <div className="p-4 bg-slate-50 rounded">{message}</div>
    </div>
  );
}