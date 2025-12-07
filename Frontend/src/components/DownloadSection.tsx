import { Download, FileText, CheckCircle2 } from 'lucide-react';

interface DownloadSectionProps {
  onDownloadLAS: () => void;
  onDownloadReport: () => void;
}

export default function DownloadSection({ onDownloadLAS, onDownloadReport }: DownloadSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-[#E6E6E6] tracking-tight">
          Download Results
        </h2>
        <div className="flex items-center gap-2 text-sm text-[#A9B1C7]">
          <CheckCircle2 className="w-4 h-4 text-[#00C7E6]" />
          <span>Ready to download</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <button
          onClick={onDownloadLAS}
          className="group relative overflow-hidden p-8 rounded-2xl bg-gradient-to-br from-[#4C7DFF]/30 to-[#00C7E6]/30 border-2 border-[#4C7DFF] hover:border-[#00C7E6] transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#4C7DFF]/0 to-[#00C7E6]/0 group-hover:from-[#4C7DFF]/20 group-hover:to-[#00C7E6]/20 transition-all duration-300" />

          <div className="relative flex flex-col items-center">
            <div className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-[#4C7DFF]/40 to-[#00C7E6]/40 group-hover:scale-110 transition-transform duration-300">
              <Download className="w-12 h-12 text-[#E6E6E6]" />
            </div>

            <h3 className="text-xl font-bold text-[#E6E6E6] mb-2">
              Classified Point Cloud
            </h3>
            <p className="text-sm text-[#A9B1C7] mb-4">
              LAS format with classification data
            </p>

            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0B0F1A]/50 border border-[#2A3441]">
              <div className="w-2 h-2 rounded-full bg-[#00C7E6] animate-pulse" />
              <span className="text-xs text-[#A9B1C7] font-mono">output.las</span>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4C7DFF] to-[#00C7E6] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </button>

        <button
          onClick={onDownloadReport}
          className="group relative overflow-hidden p-8 rounded-2xl bg-gradient-to-br from-[#1D9BEF]/20 to-[#4C7DFF]/20 border-2 border-[#2A3441] hover:border-[#1D9BEF] transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#1D9BEF]/0 to-[#4C7DFF]/0 group-hover:from-[#1D9BEF]/20 group-hover:to-[#4C7DFF]/20 transition-all duration-300" />

          <div className="relative flex flex-col items-center">
            <div className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-[#1D9BEF]/30 to-[#4C7DFF]/30 group-hover:scale-110 transition-transform duration-300">
              <FileText className="w-12 h-12 text-[#E6E6E6]" />
            </div>

            <h3 className="text-xl font-bold text-[#E6E6E6] mb-2">
              Analytics Report
            </h3>
            <p className="text-sm text-[#A9B1C7] mb-4">
              JSON/CSV with detailed statistics
            </p>

            <div className="flex gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0B0F1A]/50 border border-[#2A3441]">
                <span className="text-xs text-[#A9B1C7] font-mono">report.json</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0B0F1A]/50 border border-[#2A3441]">
                <span className="text-xs text-[#A9B1C7] font-mono">report.csv</span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1D9BEF] to-[#4C7DFF] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </button>
      </div>

      <div className="p-6 rounded-xl bg-gradient-to-br from-[#1A1F2E] to-[#0E111B] border border-[#2A3441]">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-[#00C7E6]/20">
            <CheckCircle2 className="w-5 h-5 text-[#00C7E6]" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-[#E6E6E6] mb-1">Files Ready</h4>
            <p className="text-sm text-[#A9B1C7]">
              Your classified point cloud and analytics report are ready to download.
              The LAS file includes all classification codes compatible with industry standards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
