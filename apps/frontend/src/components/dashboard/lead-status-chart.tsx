'use client';

import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  useTheme,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import type { StatusCount } from '@/types/dashboard';

interface LeadStatusChartProps {
  data: StatusCount[];
}

// Status color mapping
const STATUS_COLORS: Record<string, string> = {
  new: '#2196f3',
  assigned: '#ff9800',
  contacted: '#9c27b0',
  won: '#4caf50',
  lost: '#f44336',
  unknown: '#9e9e9e',
};

export default function LeadStatusChart({ data }: LeadStatusChartProps) {
  const theme = useTheme();

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader title="Leads by Status" />
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 300,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No leads data available
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Format data for chart
  const chartData = data.map((item) => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: item.count,
    color: STATUS_COLORS[item.status.toLowerCase()] || STATUS_COLORS.unknown,
  }));

  // Calculate total
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  // Custom label for pie slices - only show if >5%
  const renderLabel = (entry: any) => {
    const percent = (entry.value / total) * 100;
    // Only show label if slice is > 5% to avoid clutter
    if (percent < 5) return '';
    return `${percent.toFixed(1)}%`;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percent = ((data.value / total) * 100).toFixed(1);
      return (
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            p: 1.5,
          }}
        >
          <Typography variant="body2" fontWeight="bold">
            {data.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Count: {data.value.toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Percentage: {percent}%
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader
        title="Leads by Status"
        subheader={`Total: ${total.toLocaleString()} leads`}
      />
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(value, entry: any) => {
                const percent = ((entry.payload.value / total) * 100).toFixed(
                  1,
                );
                return (
                  <span style={{ color: theme.palette.text.primary }}>
                    {value.toUpperCase()} ({entry.payload.value}) - {percent}%
                  </span>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
