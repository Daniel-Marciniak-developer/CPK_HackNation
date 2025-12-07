import { Database, Grid3x3, Cpu, Layers, Download, Check, Loader2 } from 'lucide-react';

interface PipelineStep {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'waiting' | 'processing' | 'done';
}

interface ProcessingPipelineProps {
  steps: PipelineStep[];
  progress: number;
}

export default function ProcessingPipeline({ steps, progress }: ProcessingPipelineProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-[#E6E6E6] tracking-tight">
          Processing Pipeline
        </h2>
        <div className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4C7DFF]/20 to-[#00C7E6]/20 border border-[#4C7DFF]/30">
          <div className="w-2 h-2 rounded-full bg-[#00C7E6] animate-pulse" />
          <span className="text-[#E6E6E6] font-semibold">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      <div className="relative">
        <div className="absolute top-12 left-8 right-8 h-0.5 bg-[#2A3441]">
          <div
            className="h-full bg-gradient-to-r from-[#4C7DFF] to-[#00C7E6] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="grid grid-cols-5 gap-4 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`
                  relative w-24 h-24 rounded-2xl
                  flex items-center justify-center
                  transition-all duration-500
                  ${step.status === 'done'
                    ? 'bg-gradient-to-br from-[#00C7E6]/30 to-[#4C7DFF]/30 border-2 border-[#00C7E6]'
                    : step.status === 'processing'
                    ? 'bg-gradient-to-br from-[#4C7DFF]/30 to-[#00C7E6]/30 border-2 border-[#4C7DFF] animate-pulse'
                    : 'bg-[#1A1F2E] border-2 border-[#2A3441]'
                  }
                `}>
                  {step.status === 'done' && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#00C7E6] flex items-center justify-center border-2 border-[#0B0F1A]">
                      <Check className="w-5 h-5 text-[#0B0F1A]" />
                    </div>
                  )}

                  {step.status === 'processing' ? (
                    <Loader2 className="w-10 h-10 text-[#4C7DFF] animate-spin" />
                  ) : (
                    <Icon className={`w-10 h-10 ${
                      step.status === 'done' ? 'text-[#00C7E6]' : 'text-[#6B7280]'
                    }`} />
                  )}

                  <div className={`
                    absolute -bottom-1 left-1/2 transform -translate-x-1/2
                    w-3 h-3 rounded-full
                    ${step.status === 'processing' ? 'bg-[#4C7DFF] animate-pulse' : 'bg-transparent'}
                  `} />
                </div>

                <div className="mt-4 text-center">
                  <p className={`text-sm font-semibold mb-1 ${
                    step.status === 'done' ? 'text-[#00C7E6]' :
                    step.status === 'processing' ? 'text-[#4C7DFF]' :
                    'text-[#6B7280]'
                  }`}>
                    {step.name}
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    {step.status === 'done' ? 'Completed' :
                     step.status === 'processing' ? 'Processing...' :
                     'Waiting'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-[#1A1F2E] to-[#0E111B] border border-[#2A3441]">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#A9B1C7]">Estimated time remaining:</span>
          <span className="text-[#E6E6E6] font-mono font-semibold">
            {progress < 100 ? `~${Math.round((100 - progress) / 10)} min` : 'Complete'}
          </span>
        </div>
      </div>
    </div>
  );
}

export const defaultSteps: PipelineStep[] = [
  { id: '1', name: 'Preparing data', icon: Database, status: 'waiting' },
  { id: '2', name: 'Tiling', icon: Grid3x3, status: 'waiting' },
  { id: '3', name: 'Classification', icon: Cpu, status: 'waiting' },
  { id: '4', name: 'Merging', icon: Layers, status: 'waiting' },
  { id: '5', name: 'Exporting', icon: Download, status: 'waiting' },
];
