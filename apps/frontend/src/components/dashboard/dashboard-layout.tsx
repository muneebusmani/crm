'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  CircularProgress,
  Container,
  Typography,
  IconButton,
  Alert,
  Grid,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { get } from '@/lib/api';
import type { DashboardStats } from '@/types/dashboard';
import OverviewStats from './overview-stats';
import MonthlyTrendsChart from './monthly-trends-chart';
import LeadStatusChart from './lead-status-chart';
import RecentActivity from './recent-activity';
import TopDealersTable from './top-dealers-table';

interface DashboardLayoutProps {
  userType: 'admin' | 'dealer';
}

export default function DashboardLayout({ userType }: DashboardLayoutProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      setError(null);
      console.log('🔍 Loading dashboard data from /analytics/dashboard...');
      const response = await get<{
        data?: DashboardStats;
        success: boolean;
        error?: string;
      }>('/analytics/dashboard');

      console.log('📦 Dashboard response:', response);

      if (response.success && response.data) {
        console.log('✅ Dashboard data loaded successfully:', response.data);
        setStats(response.data);
      } else {
        console.error('❌ Dashboard response failed:', response);
        setError(
          `Failed to load dashboard data: ${response.error || 'Unknown error'}`,
        );
      }
    } catch (err) {
      console.error('💥 Dashboard error caught:', err);
      console.error('Error details:', JSON.stringify(err, null, 2));
      setError(
        `Failed to load dashboard data: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !stats) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Alert severity="error">{error || 'No data available'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {userType === 'admin' ? 'Admin Dashboard' : 'My Dashboard'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {userType === 'admin'
              ? 'Overview of all system activity'
              : 'Your performance overview'}
          </Typography>
        </Box>
        <IconButton
          onClick={handleRefresh}
          disabled={refreshing}
          color="primary"
          sx={{
            animation: refreshing ? 'spin 1s linear infinite' : 'none',
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' },
            },
          }}
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Overview Stats */}
      <Box sx={{ mb: 4 }}>
        <OverviewStats
          totalLeads={stats.overview.totalLeads}
          totalQuotations={stats.overview.totalQuotations}
          totalInvoices={stats.overview.totalInvoices}
          conversionRate={stats.overview.conversionRate}
          totalDealers={stats.overview.totalDealers}
          dealerCredits={stats.overview.dealerCredits}
          dealerTier={stats.overview.dealerTier}
          totalRevenue={stats.overview.totalRevenue}
          pendingQuotations={stats.overview.pendingQuotations}
          userType={userType}
        />
      </Box>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <MonthlyTrendsChart data={stats.monthlyTrends} userType={userType} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <LeadStatusChart data={stats.leadsByStatus} />
        </Grid>
      </Grid>

      {/* Top Dealers (Admin Only) */}
      {userType === 'admin' &&
        stats.topDealers &&
        stats.topDealers.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <TopDealersTable dealers={stats.topDealers} />
          </Box>
        )}

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <RecentActivity activity={stats.recentActivity} userType={userType} />
        </Grid>
      </Grid>
    </Container>
  );
}
