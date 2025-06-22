import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface CredibilityChartProps {
  score: number;
}

export function CredibilityChart({ score }: CredibilityChartProps) {
  const data = [
    { name: 'Credible', value: score },
    { name: 'Remaining', value: 100 - score }
  ];

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Review';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981'; // green-500
    if (score >= 60) return '#F59E0B'; // amber-500
    return '#EF4444'; // red-500
  };

  const COLORS = [getScoreColor(score), '#E5E7EB']; // Active color and gray-200

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center Score Display */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: getScoreColor(score) }}>
            {score}%
          </div>
          <div className="text-sm text-gray-600">
            {getScoreLabel(score)}
          </div>
        </div>
      </div>
    </div>
  );
}