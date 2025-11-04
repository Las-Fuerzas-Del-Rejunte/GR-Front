import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface BarChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface BarChartProps {
  data: BarChartData[];
  dataKey?: string;
  color?: string;
  height?: number;
  showLegend?: boolean;
}

export const CustomBarChart = ({ data, dataKey = 'value', color = '#3b82f6', height = 300, showLegend = false }: BarChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="name" 
          stroke="#6b7280"
          fontSize={12}
          tick={{ fill: '#6b7280' }}
        />
        <YAxis 
          stroke="#6b7280"
          fontSize={12}
          tick={{ fill: '#6b7280' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '8px'
          }}
          labelStyle={{ color: '#111827', fontWeight: 'bold' }}
        />
        {showLegend && <Legend />}
        <Bar dataKey={dataKey} fill={color} radius={[8, 8, 0, 0]} />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default CustomBarChart;

