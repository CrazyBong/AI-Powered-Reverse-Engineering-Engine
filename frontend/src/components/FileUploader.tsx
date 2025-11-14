import React from "react";

export default function FileUploader({ onFile, disabled = false }: { onFile: (file: File) => void; disabled?: boolean }) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0];
    if (f) onFile(f);
  }

  return (
    <div>
      <input type="file" onChange={handleChange} disabled={disabled} />
      <div className="mt-2 text-sm text-slate-400">Drag & drop supported by your OS; pick a single binary file.</div>
    </div>
  );
}