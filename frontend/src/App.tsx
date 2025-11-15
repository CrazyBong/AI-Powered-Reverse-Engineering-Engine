import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import UploadView from './pages/UploadView';
import ProcessingView from './pages/ProcessingView';
import AnalysisView from './pages/AnalysisView';
import AboutView from './pages/AboutView';
import ContactView from './pages/ContactView';

const Silk = lazy(() => import('./components/Silk'));

export default function App() {
  return (
    <>
      <Suspense fallback={null}>
        <Silk
          speed={3}
          scale={1.2}
          color="#FF4747"
          noiseIntensity={1.8}
          rotation={0}
        />
      </Suspense>
      <HashRouter>
        <Routes>
          <Route path="/" element={<UploadView />} />
          <Route path="/processing/:fileId" element={<ProcessingView />} />
          <Route path="/analysis/:fileId" element={<AnalysisView />} />
          <Route path="/about" element={<AboutView />} />
          <Route path="/contact" element={<ContactView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </>
  );
}