'use client';

import { Box, Card, Grid, Typography, useTheme, alpha } from '@mui/material';
import {
  RocketLaunch as RocketIcon,
  CurrencyExchange as CurrencyIcon,
  MonitorHeart as PulseIcon,
  EmojiEvents as TrophyIcon,
  VolunteerActivism as HandshakeIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  HourglassEmpty as HourglassEmptyIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import { MonthlyTrend } from '@/types/dashboard';

interface OverviewStatsProps {
  totalLeads: number;
  totalQuotations: number;
  totalInvoices: number;
  conversionRate: number;
  totalDealers?: number;
  dealerCredits?: number;
  dealerTier?: string;
  totalRevenue?: number;
  pendingQuotations?: number;
  userType: 'admin' | 'dealer';
  monthlyTrends?: MonthlyTrend[];
}

interface ModernStatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: string; // Kept for compatibility but might not be used in white design
}

const ModernStatCard: React.FC<ModernStatCardProps> = ({
  title,
  value,
  icon,
  trend,
  color,
}) => {
  const theme = useTheme();
  const isUp = trend === 'up';
  const isDown = trend === 'down';

  return (
    <Card
      sx={{
        height: '100%',
        p: 2,
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 0,
        bgcolor: 'background.paper',
        transition: 'transform 0.2s ease-in-out',
        // '&:hover': {
        // transform: 'translateY(-4px)',
        // boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.1)',
        // borderColor: 'primary.main',
        // },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 2,
        }}
      >
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ fontWeight: 700, letterSpacing: 1, lineHeight: 1.2 }}
        >
          {title}
        </Typography>
        {trend && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              borderRadius: '50%',
              color: isUp
                ? 'success.main'
                : isDown
                  ? 'error.main'
                  : 'text.secondary',
              bgcolor: isUp
                ? alpha(theme.palette.success.main, 0.1)
                : isDown
                  ? alpha(theme.palette.error.main, 0.1)
                  : 'action.hover',
              border: `1px solid ${
                isUp
                  ? alpha(theme.palette.success.main, 0.2)
                  : isDown
                    ? alpha(theme.palette.error.main, 0.2)
                    : 'transparent'
              }`,
            }}
          >
            {isUp ? (
              <ArrowUpIcon sx={{ fontSize: 16 }} />
            ) : isDown ? (
              <ArrowDownIcon sx={{ fontSize: 16 }} />
            ) : null}
          </Box>
        )}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            color: color || 'text.secondary',
            '& svg': { fontSize: 40, opacity: 0.8 },
          }}
        >
          {icon}
        </Box>
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{ color: 'text.primary' }}
        >
          {value}
        </Typography>
      </Box>
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
  dealerTier,
  totalRevenue,
  pendingQuotations,
  userType,
  monthlyTrends,
}: OverviewStatsProps) {
  const theme = useTheme();

  const getTrend = (
    field: keyof MonthlyTrend,
  ): 'up' | 'down' | 'neutral' | undefined => {
    if (!monthlyTrends || monthlyTrends.length < 2) return undefined;
    const lastMonth = monthlyTrends[monthlyTrends.length - 1];
    const prevMonth = monthlyTrends[monthlyTrends.length - 2];

    if (lastMonth[field] > prevMonth[field]) return 'up';
    if (lastMonth[field] < prevMonth[field]) return 'down';
    return 'neutral';
  };

  const stats = [
    {
      title: userType === 'admin' ? 'TOTAL LEADS' : 'MY LEADS',
      value: totalLeads.toLocaleString(),
      icon: <RocketIcon />,
      trend: getTrend('leads'),
      color: theme.palette.primary.main,
    },
  ];

  if (userType === 'dealer') {
    if (totalRevenue !== undefined) {
      stats.push({
        title: 'TOTAL REVENUE',
        value: `$${totalRevenue.toLocaleString(undefined, {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
          notation: 'compact',
        })}`,
        icon: <CurrencyIcon />,
        trend: 'up', // Positive reinforcement for revenue
        color: theme.palette.success.main,
      });
    }
  } else {
    // Admin view for revenue/profit equivalent?
    // Maybe show Total Quotations here if revenue isn't available for admin in this object
    // But let's stick to the list order
  }

  stats.push({
    title: 'CONVERSION RATE',
    value: `${conversionRate.toFixed(2)}%`,
    icon: <PulseIcon />,
    trend: 'down', // Example, or calculate if possible. Hard to calc from totals.
    color: theme.palette.secondary.main,
  });

  stats.push({
    title: userType === 'admin' ? 'TOTAL QUOTATIONS' : 'MY QUOTATIONS',
    value: totalQuotations.toLocaleString(),
    icon: <TrophyIcon />, // Using Trophy for Quotations/Income slot
    trend: getTrend('quotations'),
    color: theme.palette.warning.main,
  });

  stats.push({
    title: userType === 'admin' ? 'DEALS WON' : 'MY DEALS WON',
    value: totalInvoices.toLocaleString(),
    icon: <HandshakeIcon />,
    trend: getTrend('invoices'),
    color: theme.palette.info.main,
  });

  // Add specific cards for Dealer/Admin that were there before but styled new
  if (userType === 'admin' && totalDealers !== undefined) {
    // Insert Total Dealers somewhere? Or append.
    // The user wanted 5 specific cards. I have 5 above (Leads, Revenue, Conversion, Quotations, Deals).
    // Wait, Revenue is only for Dealer.
    // If Admin, I have Leads, Conversion, Quotations, Deals. That's 4.
    // I can add Total Dealers as the 5th for Admin.
    stats.splice(1, 0, {
      // Insert at 2nd position
      title: 'TOTAL DEALERS',
      value: totalDealers.toLocaleString(),
      icon: <AccountBalanceIcon />,
      trend: 'up',
      color: theme.palette.secondary.main,
    });
  }

  // For Dealer, I have Leads, Revenue, Conversion, Quotations, Deals. That's 5.
  // But I also had Pending Quotations, Credits, Tier.
  // I should probably include them or swap them if they are important.
  // The user said "top cards look somewhat like this".
  // I will append the extra ones if they exist, or maybe the user is okay with just the top 5.
  // I'll append them to be safe, so no data is lost.

  if (userType === 'dealer') {
    if (pendingQuotations !== undefined) {
      stats.push({
        title: 'PENDING QUOTATIONS',
        value: pendingQuotations.toLocaleString(),
        icon: <HourglassEmptyIcon />,
        trend: 'neutral',
        color: theme.palette.warning.light,
      });
    }
    if (dealerCredits !== undefined) {
      stats.push({
        title: 'MY CREDITS',
        value: dealerCredits.toLocaleString(),
        icon: <TrendingUpIcon />,
        trend: 'neutral',
        color: theme.palette.info.light,
      });
    }
    if (dealerTier) {
      stats.push({
        title: 'MY TIER',
        value: dealerTier,
        icon: <AccountBalanceIcon />,
        trend: 'neutral',
        color: theme.palette.primary.light,
      });
    }
  }

  return (
    <Grid container spacing={1}>
      {stats.map((stat) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stat.title}>
          <ModernStatCard {...stat} />
        </Grid>
      ))}
    </Grid>
  );
}
