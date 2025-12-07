import { useState, useEffect } from 'react';
import { Cloud, Sparkles } from 'lucide-react';
import UploadZone from './components/UploadZone';
import ProcessingPipeline, { defaultSteps } from './components/ProcessingPipeline';
import Results from './components/Results';
import DownloadSection from './components/DownloadSection';

type AppState = 'upload' | 'processing' | 'results';

function App() {
  const [state, setState] = useState<AppState>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [steps, setSteps] = useState(defaultSteps);

  const mockClassificationData = {
    totalPoints: 15847293,
    classifiedPoints: 15847293,
    unclassifiedPoints: 0,
    processingTime: 187,
    classes: [
      { name: 'Ground', points: 5234567, percentage: 33.03, color: '#8B4513' },
      { name: 'Vegetation', points: 4123890, percentage: 26.02, color: '#228B22' },
      { name: 'Building', points: 3456721, percentage: 21.81, color: '#DC143C' },
      { name: 'Water', points: 1234567, percentage: 7.79, color: '#1E90FF' },
      { name: 'Road', points: 987654, percentage: 6.23, color: '#696969' },
      { name: 'Bridge', points: 456789, percentage: 2.88, color: '#FF8C00' },
      { name: 'Rail', points: 234567, percentage: 1.48, color: '#4B0082' },
      { name: 'Noise', points: 118538, percentage: 0.75, color: '#FF1493' },
    ]
  };

  useEffect(() => {
    if (state === 'processing') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setState('results'), 500);
            return 100;
          }
          return prev + 2;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [state]);

  useEffect(() => {
    if (state === 'processing') {
      const stepDuration = 100 / steps.length;
      const currentStepIndex = Math.floor(progress / stepDuration);

      setSteps(prev => prev.map((step, index) => ({
        ...step,
        status: index < currentStepIndex ? 'done' :
                index === currentStepIndex ? 'processing' :
                'waiting'
      })));
    }
  }, [progress, state]);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setState('processing');
    setProgress(0);
    setSteps(defaultSteps.map(step => ({ ...step, status: 'waiting' as const })));
  };

  const handleDownloadLAS = () => {
    console.log('Downloading LAS file...');
  };

  const handleDownloadReport = () => {
    console.log('Downloading report...');
  };

  const handleReset = () => {
    setState('upload');
    setSelectedFile(null);
    setProgress(0);
    setSteps(defaultSteps);
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMTAgNjAgTSAwIDEwIEwgNjAgMTAgTSAyMCAwIEwgMjAgNjAgTSAwIDIwIEwgNjAgMjAgTSAzMCAwIEwgMzAgNjAgTSAwIDMwIEwgNjAgMzAgTSA0MCAwIEwgNDAgNjAgTSAwIDQwIEwgNjAgNDAgTSA1MCAwIEwgNTAgNjAgTSAwIDUwIEwgNjAgNTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAxNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50" />

      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#4C7DFF]/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-radial from-[#00C7E6]/10 via-transparent to-transparent pointer-events-none blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 py-8">
        <header className="mb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#4C7DFF] to-[#00C7E6] rounded-2xl blur-xl opacity-50" />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4C7DFF] to-[#00C7E6] flex items-center justify-center">
                  <Cloud className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#E6E6E6] tracking-tight flex items-center gap-3">
                  CPK Cloud Classifier
                  <Sparkles className="w-6 h-6 text-[#00C7E6] animate-pulse" />
                </h1>
                <p className="text-[#A9B1C7] mt-1">
                  Automated LAS/LAZ Point Cloud Classification with RandLA-Net
                </p>
              </div>
            </div>

            {state !== 'upload' && (
              <button
                onClick={handleReset}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#2A3441] to-[#1A1F2E] border border-[#2A3441] hover:border-[#4C7DFF] text-[#E6E6E6] font-semibold transition-all duration-300 hover:scale-105"
              >
                New Classification
              </button>
            )}
          </div>

          <div className="mt-6 h-px bg-gradient-to-r from-transparent via-[#2A3441] to-transparent" />
        </header>

        <main className="space-y-12">
          {state === 'upload' && (
            <div className="max-w-4xl mx-auto">
              <UploadZone onFileSelect={handleFileSelect} />

              <div className="mt-8 grid grid-cols-3 gap-4">
                <FeatureCard
                  title="Fast Processing"
                  description="Optimized RandLA-Net inference with GPU acceleration"
                  icon="⚡"
                />
                <FeatureCard
                  title="High Accuracy"
                  description="Industry-leading classification accuracy >95%"
                  icon="🎯"
                />
                <FeatureCard
                  title="8 Classes"
                  description="Ground, Vegetation, Building, Water, Road, Bridge, Rail, Noise"
                  icon="🏗️"
                />
              </div>
            </div>
          )}

          {state === 'processing' && (
            <div className="max-w-6xl mx-auto">
              <div className="p-8 rounded-2xl bg-gradient-to-br from-[#0E111B] to-[#0B0F1A] border border-[#2A3441]">
                {selectedFile && (
                  <div className="mb-8 p-4 rounded-xl bg-[#1A1F2E]/50 border border-[#2A3441]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#4C7DFF]/30 to-[#00C7E6]/30 flex items-center justify-center">
                        <Cloud className="w-5 h-5 text-[#00C7E6]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#E6E6E6]">{selectedFile.name}</p>
                        <p className="text-xs text-[#6B7280]">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <div className="px-4 py-2 rounded-lg bg-[#4C7DFF]/20 border border-[#4C7DFF]">
                        <span className="text-sm text-[#4C7DFF] font-semibold">Processing</span>
                      </div>
                    </div>
                  </div>
                )}

                <ProcessingPipeline steps={steps} progress={progress} />
              </div>
            </div>
          )}

          {state === 'results' && (
            <div className="space-y-12">
              <div className="p-8 rounded-2xl bg-gradient-to-br from-[#0E111B] to-[#0B0F1A] border border-[#2A3441]">
                <Results data={mockClassificationData} />
              </div>

              <div className="p-8 rounded-2xl bg-gradient-to-br from-[#0E111B] to-[#0B0F1A] border border-[#2A3441]">
                <DownloadSection
                  onDownloadLAS={handleDownloadLAS}
                  onDownloadReport={handleDownloadReport}
                />
              </div>
            </div>
          )}
        </main>

        <footer className="mt-16 pb-8">
          <div className="h-px bg-gradient-to-r from-transparent via-[#2A3441] to-transparent mb-6" />
          <div className="flex items-center justify-between text-sm text-[#6B7280]">
            <p>© 2025 CPK Cloud Classifier. Advanced Point Cloud Processing.</p>
            <div className="flex items-center gap-6">
              <span>Powered by RandLA-Net</span>
              <span>|</span>
              <span>v2.1.0</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="p-6 rounded-xl bg-gradient-to-br from-[#1A1F2E] to-[#0E111B] border border-[#2A3441] hover:border-[#4C7DFF]/50 transition-all duration-300 hover:scale-105">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-[#E6E6E6] mb-2">{title}</h3>
      <p className="text-sm text-[#A9B1C7] leading-relaxed">{description}</p>
    </div>
  );
}

export default App;
