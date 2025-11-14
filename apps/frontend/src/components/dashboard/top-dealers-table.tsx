'use client';

import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Avatar,
  useTheme,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import type { DealerRanking } from '@/types/dashboard';

interface TopDealersTableProps {
  dealers: DealerRanking[];
}

export default function TopDealersTable({ dealers }: TopDealersTableProps) {
  const theme = useTheme();

  if (dealers.length === 0) {
    return (
      <Card>
        <CardHeader title="Top Performing Dealers" />
        <CardContent>
          <Typography variant="body2" color="text.secondary" align="center">
            No dealer data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const getRankColor = (index: number) => {
    if (index === 0) return theme.palette.warning.main; // Gold
    if (index === 1) return theme.palette.grey[400]; // Silver
    if (index === 2) return '#CD7F32'; // Bronze
    return theme.palette.text.secondary;
  };

  const getConversionColor = (rate: number) => {
    if (rate >= 70) return 'success';
    if (rate >= 50) return 'info';
    if (rate >= 30) return 'warning';
    return 'error';
  };

  return (
    <Card>
      <CardHeader
        title="Top Performing Dealers"
        subheader="Ranked by number of deals won (invoices created)"
      />
      <CardContent>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Dealer</TableCell>
                <TableCell align="center">Deals Won</TableCell>
                <TableCell align="center">Quotations</TableCell>
                <TableCell align="center">Conversion Rate</TableCell>
                <TableCell align="center">Performance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dealers.map((dealer, index) => (
                <TableRow
                  key={dealer.dealerId}
                  sx={{
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  <TableCell>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: getRankColor(index),
                          fontSize: 14,
                          fontWeight: 700,
                        }}
                      >
                        {index + 1}
                      </Avatar>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {dealer.dealerName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {dealer.dealerEmail}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="subtitle2" fontWeight={600}>
                      {dealer.invoiceCount}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {dealer.quotationCount}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={`${dealer.conversionRate.toFixed(1)}%`}
                      size="small"
                      color={getConversionColor(dealer.conversionRate) as any}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    {dealer.conversionRate >= 50 ? (
                      <TrendingUpIcon color="success" />
                    ) : (
                      <TrendingDownIcon color="error" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
