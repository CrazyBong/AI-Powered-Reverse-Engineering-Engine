import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import FileUploader from '../components/FileUploader';
import Header from '../components/Header';
import VariableProximity from '../components/VariableProximity';

export default function UploadView() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleUploadSuccess = (fileId: string) => {
    navigate(`/processing/${fileId}`);
  };

  return (
    <>
      <Header />
      <div ref={containerRef} className="min-h-screen flex flex-col items-center justify-center p-6 pt-32" style={{ position: 'relative' }}>
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <div className="mb-8">
              <VariableProximity
                label="Re:verse"
                className="text-6xl text-white"
                fromFontVariationSettings="'wght' 300, 'opsz' 9"
                toFontVariationSettings="'wght' 900, 'opsz' 40"
                containerRef={containerRef}
                radius={150}
                falloff="linear"
              />
            </div>
            <h1 className="text-white mb-4">AI-Powered Reverse Engineering Platform</h1>
            <p className="text-white/60 max-w-2xl mx-auto">
              Upload a binary to analyze functions, disassembly, and get AI-powered explanations
            </p>
          </div>

          <FileUploader onSuccess={handleUploadSuccess} />

          <div className="mt-12 grid grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <h3 className="text-white/90 mb-2">Static Analysis</h3>
              <p className="text-white/50">
                Automated function extraction and disassembly using radare2
              </p>
            </div>
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <h3 className="text-white/90 mb-2">AI Explanations</h3>
              <p className="text-white/50">
                GPT-5 powered analysis of assembly code and behavior
              </p>
            </div>
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <h3 className="text-white/90 mb-2">Smart Caching</h3>
              <p className="text-white/50">
                Lightning-fast retrieval of previously analyzed functions
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}