import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SectionBreakdownProps {
  sections: {
    introduction: string;
    methodology: string;
    results: string;
    conclusion: string;
  };
}

export function SectionBreakdown({ sections }: SectionBreakdownProps) {
  const data = Object.entries(sections).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    length: value.length,
    words: value.split(' ').length
  }));

  return (
    <div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            formatter={(value, name) => [value, name === 'words' ? 'Word Count' : 'Character Count']}
            labelStyle={{ color: '#374151' }}
          />
          <Bar dataKey="words" fill="#8B5CF6" name="words" />
        </BarChart>
      </ResponsiveContainer>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Content distribution across paper sections (by word count)
        </p>
      </div>
    </div>
  );
}