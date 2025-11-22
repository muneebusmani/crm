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

  // Custom label for pie slices
  const renderLabel = (entry: any) => {
    const percent = ((entry.value / total) * 100).toFixed(0);
    return `${percent}%`;
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
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: theme.shape.borderRadius,
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(value, entry: any) => (
                <span style={{ color: theme.palette.text.primary }}>
                  {value} ({entry.payload.value})
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
