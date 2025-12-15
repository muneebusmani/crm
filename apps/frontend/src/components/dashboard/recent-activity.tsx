'use client';

import { ReactNode } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  List,
  ListItem,
  ListItemText,
  Typography,
  useTheme,
  Grid,
  Avatar,
  Divider,
  Button,
} from '@mui/material';
import {
  RocketLaunch,
  Description,
  Receipt,
  ArrowForward,
} from '@mui/icons-material';
import Link from 'next/link';
import type { RecentActivity as RecentActivityType } from '@/types/dashboard';

interface RecentActivityProps {
  activity: RecentActivityType;
  userType: 'admin' | 'dealer';
}

export default function RecentActivity({
  activity,
  userType,
}: RecentActivityProps) {
  const theme = useTheme();
  const baseUrl = userType === 'admin' ? '/admin' : '/dealer';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (
    status: string | null,
  ):
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning' => {
    if (!status) return 'default';
    const statusLower = status.toLowerCase();
    if (statusLower === 'new' || statusLower === 'draft') return 'primary';
    if (
      statusLower === 'contacted' ||
      statusLower === 'sent' ||
      statusLower === 'pending'
    )
      return 'warning';
    if (
      statusLower === 'won' ||
      statusLower === 'paid' ||
      statusLower === 'approved'
    )
      return 'success';
    if (
      statusLower === 'lost' ||
      statusLower === 'cancelled' ||
      statusLower === 'rejected'
    )
      return 'error';
    return 'default';
  };

  interface ModernCardProps {
    title: string;
    icon: ReactNode;
    color: string;
    children: ReactNode;
    link: string;
  }

  const ModernCard = ({
    title,
    icon,
    color,
    children,
    link,
  }: ModernCardProps) => (
    <Card
      sx={{
        height: '100%',
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 0,
      }}
    >
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'transparent', color: color }}>{icon}</Avatar>
        }
        title={
          <Typography variant="h6" fontWeight="bold">
            {title}
          </Typography>
        }
        action={
          <Button
            component={Link}
            href={link}
            endIcon={<ArrowForward />}
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            View All
          </Button>
        }
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ pt: 2 }}>{children}</CardContent>
    </Card>
  );

  // Helper to create alpha color since we can't import alpha from mui/material directly in some versions or it might be different
  // Actually alpha is available in @mui/material/styles or @mui/material
  // Let's use a simple hex opacity if alpha fails, but alpha is standard.
  // I'll import alpha from @mui/material above.

  return (
    <Grid container spacing={3}>
      {/* Recent Leads */}
      <Grid size={{ xs: 12, md: 4 }}>
        <ModernCard
          title="Recent Leads"
          icon={<RocketLaunch />}
          color={theme.palette.primary.main}
          link={`${baseUrl}/leads`}
        >
          {activity.leads.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              py={4}
            >
              No recent leads
            </Typography>
          ) : (
            <List disablePadding>
              {activity.leads.map((lead, index) => (
                <Box key={lead.id}>
                  <ListItem
                    disableGutters
                    component={Link}
                    href={`${baseUrl}/leads/${lead.id}`}
                    sx={{
                      textDecoration: 'none',
                      color: 'inherit',
                      py: 1.5,
                      '&:hover': {
                        bgcolor: 'action.hover',
                        px: 1,
                        borderRadius: 1,
                        mx: -1,
                      },
                      transition: 'all 0.2s',
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          mb={0.5}
                        >
                          <Typography variant="subtitle2" fontWeight={600}>
                            {lead.name || 'Unnamed'}
                          </Typography>
                          <Chip
                            label={lead.status || 'NEW'}
                            size="small"
                            color={getStatusColor(lead.status)}
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.65rem' }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography variant="caption" color="text.secondary">
                            {lead.vehicle_brand} {lead.vehicle_model}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(lead.createdAt)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < activity.leads.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          )}
        </ModernCard>
      </Grid>

      {/* Recent Quotations */}
      <Grid size={{ xs: 12, md: 4 }}>
        <ModernCard
          title="Recent Quotations"
          icon={<Description />}
          color={theme.palette.warning.main}
          link={`${baseUrl}/quotations`}
        >
          {activity.quotations.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              py={4}
            >
              No recent quotations
            </Typography>
          ) : (
            <List disablePadding>
              {activity.quotations.map((quotation, index) => (
                <Box key={quotation.id}>
                  <ListItem
                    disableGutters
                    component={Link}
                    href={`${baseUrl}/quotations/${quotation.id}`}
                    sx={{
                      textDecoration: 'none',
                      color: 'inherit',
                      py: 1.5,
                      '&:hover': {
                        bgcolor: 'action.hover',
                        px: 1,
                        borderRadius: 1,
                        mx: -1,
                      },
                      transition: 'all 0.2s',
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          mb={0.5}
                        >
                          <Typography variant="subtitle2" fontWeight={600}>
                            {quotation.quotationNumber}
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            color="primary.main"
                            fontWeight={700}
                          >
                            £{quotation.grandTotal.toLocaleString()}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography variant="caption" color="text.secondary">
                            {quotation.lead?.name || 'No Lead'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(quotation.createdAt)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < activity.quotations.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          )}
        </ModernCard>
      </Grid>

      {/* Recent Invoices */}
      <Grid size={{ xs: 12, md: 4 }}>
        <ModernCard
          title="Recent Invoices"
          icon={<Receipt />}
          color={theme.palette.success.main}
          link={`${baseUrl}/invoices`}
        >
          {activity.invoices.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              py={4}
            >
              No recent invoices
            </Typography>
          ) : (
            <List disablePadding>
              {activity.invoices.map((invoice, index) => (
                <Box key={invoice.id}>
                  <ListItem
                    disableGutters
                    component={Link}
                    href={`${baseUrl}/invoices/${invoice.id}`}
                    sx={{
                      textDecoration: 'none',
                      color: 'inherit',
                      py: 1.5,
                      '&:hover': {
                        bgcolor: 'action.hover',
                        px: 1,
                        borderRadius: 1,
                        mx: -1,
                      },
                      transition: 'all 0.2s',
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          mb={0.5}
                        >
                          <Typography variant="subtitle2" fontWeight={600}>
                            {invoice.invoiceNumber}
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            color="success.main"
                            fontWeight={700}
                          >
                            £{invoice.grandTotal.toLocaleString()}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography variant="caption" color="text.secondary">
                            {invoice.lead?.name || 'No Lead'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(invoice.createdAt)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < activity.invoices.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          )}
        </ModernCard>
      </Grid>
    </Grid>
  );
}
