import { useState } from 'react';
import { Sparkles, Copy, Check, Loader2 } from 'lucide-react';
import { getExplanation } from '../lib/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
        await navigator.clipboard.writeText(explanation);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
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
          <article className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Headings
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold text-white/95 mt-8 mb-4 pb-2 border-b border-white/20">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-semibold text-white/90 mt-6 mb-3">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-medium text-white/85 mt-4 mb-2">
                    {children}
                  </h3>
                ),
                
                // Paragraphs
                p: ({ children }) => (
                  <p className="text-white/70 mb-3 leading-relaxed">
                    {children}
                  </p>
                ),
                
                // Lists
                ul: ({ children }) => (
                  <ul className="list-disc list-inside text-white/70 mb-4 space-y-1">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside text-white/70 mb-4 space-y-1">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-white/70 ml-4">
                    {children}
                  </li>
                ),
                
                // Code blocks
                code: ({ inline, children, ...props }: any) => {
                  if (inline) {
                    return (
                      <code
                        className="px-1.5 py-0.5 bg-white/10 text-blue-300 rounded text-sm font-mono"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code
                      className="block p-4 bg-black/40 text-green-300 rounded-lg overflow-x-auto font-mono text-sm border border-white/10 my-3"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => (
                  <pre className="mb-4">
                    {children}
                  </pre>
                ),
                
                // Blockquote
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-blue-500/50 pl-4 py-2 my-4 bg-white/5 rounded-r">
                    {children}
                  </blockquote>
                ),
                
                // Strong/Bold
                strong: ({ children }) => (
                  <strong className="font-semibold text-white/90">
                    {children}
                  </strong>
                ),
                
                // Emphasis/Italic
                em: ({ children }) => (
                  <em className="italic text-white/80">
                    {children}
                  </em>
                ),
                
                // Links
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline transition-colors"
                  >
                    {children}
                  </a>
                ),
                
                // Tables
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4">
                    <table className="min-w-full border border-white/20 rounded-lg">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-white/5">
                    {children}
                  </thead>
                ),
                th: ({ children }) => (
                  <th className="px-4 py-2 text-left text-white/80 font-semibold border-b border-white/20">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-2 text-white/70 border-b border-white/10">
                    {children}
                  </td>
                ),
                
                // Horizontal rule
                hr: () => (
                  <hr className="my-6 border-white/20" />
                ),
              }}
            >
              {explanation}
            </ReactMarkdown>
          </article>
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