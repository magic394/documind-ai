import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';

export default function ActivityChart({ documents = [] }) {
  // Generate last 7 days
  const dates = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date()
  });

  const data = dates.map(date => {
    const dayStr = format(date, 'yyyy-MM-dd');
    const count = documents.filter(doc => 
      format(new Date(doc.upload_date), 'yyyy-MM-dd') === dayStr
    ).length;

    return {
      date: format(date, 'MMM dd'),
      uploads: count
    };
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis 
          dataKey="date" 
          className="text-xs fill-gray-600 dark:fill-gray-400"
        />
        <YAxis 
          className="text-xs fill-gray-600 dark:fill-gray-400"
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            color: '#1f2937'
          }}
        />
        <Line 
          type="monotone" 
          dataKey="uploads" 
          stroke="#3b82f6" 
          strokeWidth={2}
          dot={{ fill: '#3b82f6', strokeWidth: 2 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}