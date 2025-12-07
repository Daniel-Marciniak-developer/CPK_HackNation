import { Upload, FileType } from 'lucide-react';
import { useState } from 'react';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
}

export default function UploadZone({ onFileSelect }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.las') || file.name.endsWith('.laz'))) {
      onFileSelect(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative overflow-hidden
        border-2 border-dashed rounded-2xl
        transition-all duration-300
        ${isDragging
          ? 'border-[#00C7E6] bg-[#00C7E6]/10 scale-[1.02]'
          : 'border-[#2A3441] hover:border-[#4C7DFF] bg-gradient-to-br from-[#0E111B] to-[#0B0F1A]'
        }
        cursor-pointer group
      `}
    >
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />

      <input
        type="file"
        accept=".las,.laz"
        onChange={handleFileInput}
        className="hidden"
        id="file-upload"
      />

      <label
        htmlFor="file-upload"
        className="relative flex flex-col items-center justify-center py-24 px-8 cursor-pointer"
      >
        <div className={`
          mb-6 p-6 rounded-2xl
          transition-all duration-300
          ${isDragging
            ? 'bg-[#00C7E6]/20 scale-110'
            : 'bg-gradient-to-br from-[#4C7DFF]/20 to-[#00C7E6]/20 group-hover:scale-110'
          }
        `}>
          <div className="relative">
            <Upload
              className={`w-16 h-16 transition-colors duration-300 ${
                isDragging ? 'text-[#00C7E6]' : 'text-[#4C7DFF] group-hover:text-[#00C7E6]'
              }`}
            />
            <FileType
              className="w-6 h-6 text-[#00C7E6] absolute -bottom-1 -right-1 animate-pulse"
            />
          </div>
        </div>

        <h3 className="text-2xl font-bold text-[#E6E6E6] mb-3 tracking-tight">
          Upuść plik LAS/LAZ
        </h3>
        <p className="text-[#A9B1C7] text-lg mb-6">
          lub kliknij, aby wybrać
        </p>

        <div className="flex items-center gap-4 text-sm text-[#6B7280]">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1A1F2E]/50 border border-[#2A3441]">
            <div className="w-2 h-2 rounded-full bg-[#00C7E6] animate-pulse" />
            <span>Format: LAS/LAZ</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1A1F2E]/50 border border-[#2A3441]">
            <div className="w-2 h-2 rounded-full bg-[#4C7DFF]" />
            <span>Maks. rozmiar: 5GB</span>
          </div>
        </div>
      </label>

      <div className={`
        absolute bottom-0 left-0 right-0 h-1
        bg-gradient-to-r from-[#4C7DFF] via-[#00C7E6] to-[#4C7DFF]
        transition-opacity duration-300
        ${isDragging ? 'opacity-100' : 'opacity-0'}
      `} />
    </div>
  );
}
