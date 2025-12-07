import { useState, useEffect } from "react";
import { Cloud, Sparkles } from "lucide-react";
import UploadZone from "./components/UploadZone";
import ProcessingPipeline, {
  defaultSteps,
} from "./components/ProcessingPipeline";
import DownloadSection from "./components/DownloadSection";

type AppState = "upload" | "processing" | "results";

interface ClassificationStats {
  file_id: string;
  total_points: number;
  input_file_size_mb: number;
  output_file_size_mb: number;
  classes: Array<{
    id: number;
    name: string;
    points: number;
    percentage: number;
  }>;
}

function App() {
  const [state, setState] = useState<AppState>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [steps, setSteps] = useState(defaultSteps);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ClassificationStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Poll for classification status ONLY
  useEffect(() => {
    if (state !== "processing" || !fileId) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/status/${fileId}`);
        const data = await response.json();

        if (data.status === "completed") {
          setProgress(100);
          clearInterval(pollInterval);
          // Don't automatically transition - wait for user to click "View Results"
        } else if (data.status === "error") {
          setError(data.error || "Classification failed");
          clearInterval(pollInterval);
          setState("upload");
        }
      } catch (err) {
        console.error("Status check failed:", err);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [state, fileId]);

  // Simulate progress while processing
  useEffect(() => {
    if (state === "processing") {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) return prev;
          return prev + Math.random() * 10;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [state]);

  useEffect(() => {
    if (state === "processing") {
      const stepDuration = 100 / steps.length;
      const currentStepIndex = Math.floor(progress / stepDuration);

      setSteps((prev) =>
        prev.map((step, index) => ({
          ...step,
          status:
            index < currentStepIndex
              ? "done"
              : index === currentStepIndex
              ? "processing"
              : "waiting",
        }))
      );
    }
  }, [progress, state]);

  const handleFileSelect = (file: File, id: string) => {
    setSelectedFile(file);
    setFileId(id);
    setState("processing");
    setProgress(0);
    setError(null);
    setStats(null);
    setSteps(
      defaultSteps.map((step) => ({ ...step, status: "waiting" as const }))
    );
  };

  const handleUploadError = (error: string) => {
    setError(error);
    setState("upload");
  };

  const handleDownloadLAS = () => {
    if (!fileId) return;
    window.location.href = `/api/download/${fileId}`;
  };

  const handleDownloadReport = () => {
    if (!stats) return;

    // Create CSV report
    const csvContent = [
      ["CPK Cloud Classifier - Classification Report"],
      [""],
      ["File ID", stats.file_id],
      ["Total Points", stats.total_points],
      ["Input File Size (MB)", stats.input_file_size_mb],
      ["Output File Size (MB)", stats.output_file_size_mb],
      [""],
      ["Class", "Points", "Percentage"],
      ...stats.classes.map((c) => [c.name, c.points, `${c.percentage}%`]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${stats.file_id}_report.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFetchStats = async () => {
    if (!fileId) return;
    
    setLoadingStats(true);
    try {
      const statsResponse = await fetch(`/api/stats/${fileId}`);
      const statsData = await statsResponse.json();
      
      if (statsResponse.ok) {
        setStats(statsData);
        setState("results");
      } else {
        console.error("Failed to fetch stats:", statsData.error);
        setError(statsData.error || "Failed to fetch statistics");
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Error fetching classification statistics");
    } finally {
      setLoadingStats(false);
    }
  };

  const handleReset = () => {
    setState("upload");
    setSelectedFile(null);
    setFileId(null);
    setProgress(0);
    setError(null);
    setStats(null);
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
                  Automated LAS/LAZ Point Cloud Classification with GENIUS
                </p>
              </div>
            </div>

            {state !== "upload" && (
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
          {error && (
            <div className="max-w-4xl mx-auto p-4 rounded-xl bg-red-500/20 border border-red-500 text-red-200 flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-300 hover:text-red-100 transition-colors"
              >
                ✕
              </button>
            </div>
          )}

          {state === "upload" && (
            <div className="max-w-4xl mx-auto">
              <UploadZone
                onFileSelect={handleFileSelect}
                onUploadError={handleUploadError}
              />
            </div>
          )}

          {state === "processing" && (
            <div className="max-w-6xl mx-auto">
              <div className="p-8 rounded-2xl bg-gradient-to-br from-[#0E111B] to-[#0B0F1A] border border-[#2A3441]">
                {selectedFile && (
                  <div className="mb-8 p-4 rounded-xl bg-[#1A1F2E]/50 border border-[#2A3441]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#4C7DFF]/30 to-[#00C7E6]/30 flex items-center justify-center">
                        <Cloud className="w-5 h-5 text-[#00C7E6]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#E6E6E6]">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-[#6B7280]">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <div className="px-4 py-2 rounded-lg bg-[#4C7DFF]/20 border border-[#4C7DFF]">
                        <span className="text-sm text-[#4C7DFF] font-semibold">
                          Processing
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <ProcessingPipeline steps={steps} progress={progress} />

                {progress >= 95 && (
                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={handleFetchStats}
                      disabled={loadingStats}
                      className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#4C7DFF] to-[#00C7E6] hover:from-[#5A8FFF] hover:to-[#00D7F6] text-white font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingStats ? (
                        <span className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Loading Results...
                        </span>
                      ) : (
                        "View Results"
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {state === "results" && stats && (
            <div className="space-y-12">
              <div className="p-8 rounded-2xl bg-gradient-to-br from-[#0E111B] to-[#0B0F1A] border border-[#2A3441]">
                <h2 className="text-2xl font-bold text-[#E6E6E6] mb-6">
                  Classification Results
                </h2>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <StatCard
                    label="Total Points"
                    value={stats.total_points.toLocaleString()}
                  />
                  <StatCard
                    label="Input File Size"
                    value={`${stats.input_file_size_mb} MB`}
                  />
                  <StatCard
                    label="Output File Size"
                    value={`${stats.output_file_size_mb} MB`}
                  />
                  <StatCard
                    label="Classes Detected"
                    value={stats.classes.length}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#E6E6E6]">
                    Classification Breakdown
                  </h3>
                  {stats.classes.map((cls) => (
                    <div key={cls.id} className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-[#E6E6E6]">
                            {cls.name}
                          </span>
                          <span className="text-sm text-[#A9B1C7]">
                            {cls.percentage}%
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#1A1F2E] overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#4C7DFF] to-[#00C7E6]"
                            style={{ width: `${cls.percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-[#6B7280] mt-1 block">
                          {cls.points.toLocaleString()} points
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
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
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="p-6 rounded-xl bg-gradient-to-br from-[#1A1F2E] to-[#0E111B] border border-[#2A3441] hover:border-[#4C7DFF]/50 transition-all duration-300 hover:scale-105">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-[#E6E6E6] mb-2">{title}</h3>
      <p className="text-sm text-[#A9B1C7] leading-relaxed">{description}</p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-4 rounded-xl bg-[#1A1F2E]/50 border border-[#2A3441]">
      <p className="text-xs text-[#6B7280] mb-1">{label}</p>
      <p className="text-2xl font-bold text-[#E6E6E6]">{value}</p>
    </div>
  );
}

export default App;