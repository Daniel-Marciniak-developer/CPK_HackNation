import { useEffect, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { CheckCircle2, Clock, Layers, Activity } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

interface ClassificationData {
  totalPoints: number;
  classifiedPoints: number;
  unclassifiedPoints: number;
  processingTime: number;
  classes: {
    name: string;
    points: number;
    percentage: number;
    color: string;
  }[];
}

interface ResultsProps {
  data: ClassificationData;
}

export default function Results({ data }: ResultsProps) {
  const chartData = {
    labels: data.classes.map(c => c.name),
    datasets: [{
      data: data.classes.map(c => c.points),
      backgroundColor: data.classes.map(c => c.color),
      borderColor: '#0B0F1A',
      borderWidth: 3,
    }]
  };

  const barChartData = {
    labels: data.classes.map(c => c.name),
    datasets: [{
      label: 'Points',
      data: data.classes.map(c => c.points),
      backgroundColor: data.classes.map(c => c.color),
      borderColor: data.classes.map(c => c.color),
      borderWidth: 1,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1A1F2E',
        titleColor: '#E6E6E6',
        bodyColor: '#A9B1C7',
        borderColor: '#2A3441',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context: any) => {
            const value = context.parsed;
            const total = data.totalPoints;
            const percentage = ((value / total) * 100).toFixed(2);
            return ` ${value.toLocaleString()} points (${percentage}%)`;
          }
        }
      }
    }
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#2A3441',
        },
        ticks: {
          color: '#A9B1C7',
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#A9B1C7',
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-[#E6E6E6] tracking-tight">
          Classification Results
        </h2>
        {data.unclassifiedPoints === 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00C7E6]/20 to-[#4C7DFF]/20 border border-[#00C7E6]">
            <CheckCircle2 className="w-5 h-5 text-[#00C7E6]" />
            <span className="text-[#00C7E6] font-semibold">Perfect Classification</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Layers}
          label="Total Points"
          value={data.totalPoints.toLocaleString()}
          color="from-[#4C7DFF]/20 to-[#4C7DFF]/5"
          iconColor="text-[#4C7DFF]"
        />
        <StatCard
          icon={CheckCircle2}
          label="Classified"
          value={data.classifiedPoints.toLocaleString()}
          color="from-[#00C7E6]/20 to-[#00C7E6]/5"
          iconColor="text-[#00C7E6]"
        />
        <StatCard
          icon={Activity}
          label="Unclassified"
          value={data.unclassifiedPoints.toLocaleString()}
          color="from-[#6B7280]/20 to-[#6B7280]/5"
          iconColor="text-[#6B7280]"
        />
        <StatCard
          icon={Clock}
          label="Processing Time"
          value={`${data.processingTime}s`}
          color="from-[#1D9BEF]/20 to-[#1D9BEF]/5"
          iconColor="text-[#1D9BEF]"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1A1F2E] to-[#0E111B] border border-[#2A3441]">
          <h3 className="text-lg font-semibold text-[#E6E6E6] mb-6">Distribution</h3>
          <div className="h-80 flex items-center justify-center">
            <div className="w-full h-full">
              <Doughnut data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1A1F2E] to-[#0E111B] border border-[#2A3441]">
          <h3 className="text-lg font-semibold text-[#E6E6E6] mb-6">Points per Class</h3>
          <div className="h-80">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1A1F2E] to-[#0E111B] border border-[#2A3441]">
        <h3 className="text-lg font-semibold text-[#E6E6E6] mb-6">Class Legend</h3>
        <div className="grid grid-cols-3 gap-4">
          {data.classes.map((cls) => (
            <div
              key={cls.name}
              className="flex items-center gap-3 p-4 rounded-xl bg-[#0B0F1A]/50 border border-[#2A3441] hover:border-[#4C7DFF]/50 transition-colors"
            >
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: cls.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#E6E6E6] truncate">{cls.name}</p>
                <p className="text-xs text-[#6B7280]">{cls.percentage.toFixed(2)}%</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-mono text-[#A9B1C7]">{cls.points.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, iconColor }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
  iconColor: string;
}) {
  return (
    <div className={`p-6 rounded-xl bg-gradient-to-br ${color} border border-[#2A3441] hover:border-[#4C7DFF]/50 transition-colors`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg bg-[#0B0F1A]/50`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <span className="text-sm text-[#A9B1C7]">{label}</span>
      </div>
      <p className="text-2xl font-bold text-[#E6E6E6] font-mono">{value}</p>
    </div>
  );
}
