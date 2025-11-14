'use client';

import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Groups as GroupsIcon,
  Description as DescriptionIcon,
  Receipt as ReceiptIcon,
  Percent as PercentIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';

interface OverviewStatsProps {
  totalLeads: number;
  totalQuotations: number;
  totalInvoices: number;
  conversionRate: number;
  totalDealers?: number;
  dealerCredits?: number;
  userType: 'admin' | 'dealer';
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'visible',
        '&:hover': {
          boxShadow: theme.shadows[8],
          transform: 'translateY(-4px)',
          transition: 'all 0.3s ease-in-out',
        },
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              gutterBottom
              sx={{ fontWeight: 500 }}
            >
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: alpha(color, 0.1),
              color: color,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default function OverviewStats({
  totalLeads,
  totalQuotations,
  totalInvoices,
  conversionRate,
  totalDealers,
  dealerCredits,
  userType,
}: OverviewStatsProps) {
  const theme = useTheme();

  const stats = [
    {
      title: userType === 'admin' ? 'Total Leads' : 'My Leads',
      value: totalLeads.toLocaleString(),
      icon: <GroupsIcon sx={{ fontSize: 32 }} />,
      color: theme.palette.primary.main,
    },
    {
      title: userType === 'admin' ? 'Total Quotations' : 'My Quotations',
      value: totalQuotations.toLocaleString(),
      icon: <DescriptionIcon sx={{ fontSize: 32 }} />,
      color: theme.palette.info.main,
    },
    {
      title: userType === 'admin' ? 'Deals Won' : 'My Deals Won',
      value: totalInvoices.toLocaleString(),
      icon: <ReceiptIcon sx={{ fontSize: 32 }} />,
      color: theme.palette.success.main,
    },
  ];

  // 4th card varies by user type
  if (userType === 'admin' && totalDealers !== undefined) {
    stats.push({
      title: 'Total Dealers',
      value: totalDealers.toLocaleString(),
      icon: <AccountBalanceIcon sx={{ fontSize: 32 }} />,
      color: theme.palette.warning.main,
    });
  } else if (userType === 'dealer' && dealerCredits !== undefined) {
    stats.push({
      title: 'My Credits',
      value: dealerCredits.toLocaleString(),
      icon: <TrendingUpIcon sx={{ fontSize: 32 }} />,
      color: theme.palette.warning.main,
    });
    // Add conversion rate as 5th card for dealers with credits
    stats.push({
      title: 'Conversion Rate',
      value: `${conversionRate.toFixed(1)}%`,
      icon: <PercentIcon sx={{ fontSize: 32 }} />,
      color: theme.palette.secondary.main,
    });
  } else {
    stats.push({
      title: 'Conversion Rate',
      value: `${conversionRate.toFixed(1)}%`,
      icon: <PercentIcon sx={{ fontSize: 32 }} />,
      color: theme.palette.secondary.main,
    });
  }

  return (
    <Grid container spacing={3}>
      {stats.map((stat) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stat.title}>
          <StatCard {...stat} />
        </Grid>
      ))}
    </Grid>
  );
}
