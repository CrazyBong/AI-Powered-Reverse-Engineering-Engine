import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { getStatus } from '../lib/api';
import type { StatusResponse } from '../types';
import Header from '../components/Header';

export default function ProcessingView() {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!fileId) return;

    let interval: NodeJS.Timeout;
    let progressInterval: NodeJS.Timeout;

    const pollStatus = async () => {
      try {
        const statusData = await getStatus(fileId);
        setStatus(statusData);

        if (statusData.status === 'SUCCESS') {
          setProgress(100);
          setTimeout(() => {
            navigate(`/analysis/${fileId}`);
          }, 1000);
          clearInterval(interval);
          clearInterval(progressInterval);
        } else if (statusData.status === 'FAILED') {
          clearInterval(interval);
          clearInterval(progressInterval);
        }
      } catch (error) {
        console.error('Status polling error:', error);
      }
    };

    pollStatus();
    interval = setInterval(pollStatus, 1500);

    progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 500);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, [fileId, navigate]);

  const getStatusMessage = () => {
    if (!status) return 'Initializing...';
    switch (status.status) {
      case 'PENDING':
        return 'Queued for analysis...';
      case 'RUNNING':
        return 'Analyzing binary with radare2...';
      case 'SUCCESS':
        return 'Analysis complete!';
      case 'FAILED':
        return 'Analysis failed';
      default:
        return 'Processing...';
    }
  };

  const getStatusIcon = () => {
    if (!status || status.status === 'PENDING' || status.status === 'RUNNING') {
      return <Loader2 className="w-16 h-16 text-blue-400 animate-spin" />;
    }
    if (status.status === 'SUCCESS') {
      return <CheckCircle2 className="w-16 h-16 text-green-400" />;
    }
    return <AlertCircle className="w-16 h-16 text-red-400" />;
  };

  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col items-center justify-center p-6 pt-32">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">{getStatusIcon()}</div>

          <h2 className="text-white/90 mb-4">{getStatusMessage()}</h2>

          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-blue-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="space-y-2 text-white/50">
            <p className="flex items-center justify-between">
              <span>Extracting functions</span>
              {progress > 20 && <CheckCircle2 className="w-4 h-4 text-green-400" />}
            </p>
            <p className="flex items-center justify-between">
              <span>Analyzing control flow</span>
              {progress > 50 && <CheckCircle2 className="w-4 h-4 text-green-400" />}
            </p>
            <p className="flex items-center justify-between">
              <span>Building symbol table</span>
              {progress > 80 && <CheckCircle2 className="w-4 h-4 text-green-400" />}
            </p>
          </div>

          {status?.status === 'FAILED' && (
            <button
              onClick={() => navigate('/')}
              className="mt-8 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </>
  );
}