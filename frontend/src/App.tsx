import { useState } from "react";
import UploadView from "./pages/UploadView";
import ProcessingView from "./pages/ProcessingView";
import AnalysisView from "./pages/AnalysisView";

type Page = "upload" | "processing" | "analysis";
export default function App() {
  const [page, setPage] = useState<Page>("upload");
  const [fileId, setFileId] = useState<string | null>(null);

  return (
    <div className="min-h-screen">
      <header className="header container">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">AI-Powered Reverse-Engineering (MVP)</h1>
          <div className="text-sm text-slate-500">Frontend — React White</div>
        </div>
      </header>

      <main className="container py-6">
        {page === "upload" && (
          <UploadView
            onUploaded={(id) => {
              setFileId(id);
              setPage("processing");
            }}
          />
        )}

        {page === "processing" && fileId && (
          <ProcessingView
            fileId={fileId}
            onComplete={() => setPage("analysis")}
            onBack={() => setPage("upload")}
          />
        )}

        {page === "analysis" && fileId && (
          <AnalysisView fileId={fileId} onBack={() => setPage("upload")} />
        )}
      </main>
    </div>
  );
}