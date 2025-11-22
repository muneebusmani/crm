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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { MonthlyTrend } from '@/types/dashboard';

interface MonthlyTrendsChartProps {
  data: MonthlyTrend[];
  userType: 'admin' | 'dealer';
}

export default function MonthlyTrendsChart({
  data,
  userType,
}: MonthlyTrendsChartProps) {
  const theme = useTheme();

  // Format month labels (e.g., "2025-11" -> "Nov 2025")
  const formattedData = data.map((item) => {
    const [year, month] = item.month.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    return {
      ...item,
      monthLabel: `${monthName} ${year}`,
    };
  });

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader
          title={
            userType === 'admin' ? 'Monthly Trends' : 'My Monthly Performance'
          }
        />
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
              No data available
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title={
          userType === 'admin' ? 'Monthly Trends' : 'My Monthly Performance'
        }
        subheader="Leads, Quotations, and Invoices over time"
      />
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart
            data={formattedData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme.palette.divider}
            />
            <XAxis
              dataKey="monthLabel"
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            />
            <YAxis
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
              label={{
                value: 'Count',
                angle: -90,
                position: 'insideLeft',
                style: { fill: theme.palette.text.secondary },
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: theme.shape.borderRadius,
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="leads"
              name="Leads"
              stroke={theme.palette.primary.main}
              strokeWidth={2}
              dot={{ fill: theme.palette.primary.main, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="quotations"
              name="Quotations"
              stroke={theme.palette.info.main}
              strokeWidth={2}
              dot={{ fill: theme.palette.info.main, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="invoices"
              name="Invoices"
              stroke={theme.palette.success.main}
              strokeWidth={2}
              dot={{ fill: theme.palette.success.main, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
