import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface LineChartData {
  name: string;
  [key: string]: any;
}

interface LineChartProps {
  data: LineChartData[];
  dataKeys: { key: string; color: string; name: string }[];
  height?: number;
  showLegend?: boolean;
}

export const CustomLineChart = ({ data, dataKeys, height = 300, showLegend = true }: LineChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
        {dataKeys.map(({ key, color, name }) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={color}
            strokeWidth={2}
            name={name}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

export default CustomLineChart;

