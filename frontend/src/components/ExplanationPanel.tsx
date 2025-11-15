import { useState } from 'react';
import { Sparkles, Copy, Check, Loader2 } from 'lucide-react';
import { getExplanation } from '../lib/api';

interface ExplanationPanelProps {
  fileId: string;
  address: string | null;
}

export default function ExplanationPanel({ fileId, address }: ExplanationPanelProps) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cached, setCached] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExplain = async () => {
    if (!address) return;

    setLoading(true);
    try {
      const response = await getExplanation(fileId, address);
      setExplanation(response.explanation);
      setCached(response.cached || false);
    } catch (error) {
      setExplanation('Failed to generate explanation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (explanation) {
      try {
        // Try to use the Clipboard API
        await navigator.clipboard.writeText(explanation);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        // Fallback for when Clipboard API is not available
        // Create a temporary textarea element
        const textArea = document.createElement('textarea');
        textArea.value = explanation;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (error) {
          console.error('Failed to copy text:', error);
        }
        textArea.remove();
      }
    }
  };

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-black/30 backdrop-blur-sm border-l border-white/10">
        <Sparkles className="w-16 h-16 text-white/20 mb-4" />
        <p className="text-white/40 text-center px-6">
          Select a function and click "Explain" to get AI-powered analysis
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black/30 backdrop-blur-sm border-l border-white/10">
      <div className="p-4 border-b border-white/10 bg-black/40">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white/90">AI Analysis</h2>
          {cached && (
            <span className="px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded">
              Cached
            </span>
          )}
        </div>
        <button
          onClick={handleExplain}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Explain Function
            </>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {explanation ? (
          <div className="prose prose-invert prose-sm max-w-none">
            {explanation.split('\n').map((line, idx) => {
              if (line.startsWith('## ')) {
                return (
                  <h2 key={idx} className="text-white/90 mt-6 mb-3">
                    {line.replace('## ', '')}
                  </h2>
                );
              }
              if (line.startsWith('### ')) {
                return (
                  <h3 key={idx} className="text-white/80 mt-4 mb-2">
                    {line.replace('### ', '')}
                  </h3>
                );
              }
              if (line.startsWith('- ')) {
                return (
                  <li key={idx} className="text-white/70 ml-4">
                    {line.replace('- ', '')}
                  </li>
                );
              }
              if (line.trim() === '') {
                return <br key={idx} />;
              }
              if (line.match(/^\d+\./)) {
                return (
                  <p key={idx} className="text-white/70 ml-4">
                    {line}
                  </p>
                );
              }
              return (
                <p key={idx} className="text-white/70 mb-2">
                  {line}
                </p>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-white/40">No explanation generated yet</p>
          </div>
        )}
      </div>

      {explanation && (
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleCopy}
            className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 text-white/80 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Explanation
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}