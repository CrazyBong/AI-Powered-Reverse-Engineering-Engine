import { useState } from "react";
import FileUploader from "../components/FileUploader";
import { uploadFile } from "../lib/api";

export default function UploadView({ onUploaded }: { onUploaded: (id: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleFile(file: File) {
    setErr(null);
    setLoading(true);
    try {
      const resp = await uploadFile(file);
      const id = resp.file_id || resp.fileId || resp.id;
      if (!id) throw new Error("No file_id returned");
      onUploaded(id);
    } catch (e: any) {
      setErr(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Upload Binary</h2>
      <p className="text-sm text-slate-500 mb-4">Supports: .exe, .elf, .so — max 50MB</p>
      <FileUploader onFile={handleFile} disabled={loading} />
      {loading && <div className="mt-3 text-sm">Uploading...</div>}
      {err && <div className="mt-3 text-sm text-red-600">{err}</div>}
    </div>
  );
}