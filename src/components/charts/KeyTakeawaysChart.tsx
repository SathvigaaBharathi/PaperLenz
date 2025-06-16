import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface KeyTakeawaysChartProps {
  takeaways: string[];
}

export function KeyTakeawaysChart({ takeaways }: KeyTakeawaysChartProps) {
  const data = takeaways.map((takeaway, index) => ({
    name: `Point ${index + 1}`,
    importance: Math.floor(Math.random() * 30) + 70, // Mock importance score
    length: takeaway.length,
    words: takeaway.split(' ').length
  }));

  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            formatter={(value, name) => [
              value, 
              name === 'importance' ? 'Importance Score' : 'Word Count'
            ]}
            labelStyle={{ color: '#374151' }}
          />
          <Bar dataKey="importance" fill="#14B8A6" name="importance" />
        </BarChart>
      </ResponsiveContainer>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Relative importance of key takeaways
        </p>
      </div>
    </div>
  );
}