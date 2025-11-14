'use client';

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
} from '@mui/material';
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'new') return 'primary';
    if (statusLower === 'contacted' || statusLower === 'sent') return 'info';
    if (statusLower === 'won' || statusLower === 'paid') return 'success';
    if (statusLower === 'lost' || statusLower === 'cancelled') return 'error';
    return 'default';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Recent Leads */}
      <Card>
        <CardHeader title="Recent Leads" />
        <CardContent>
          {activity.leads.length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center">
              No recent leads
            </Typography>
          ) : (
            <List disablePadding>
              {activity.leads.map((lead, index) => (
                <ListItem
                  key={lead.id}
                  divider={index < activity.leads.length - 1}
                  sx={{
                    px: 0,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                      borderRadius: 1,
                    },
                  }}
                >
                  <Link
                    href={`${baseUrl}/leads/${lead.id}`}
                    style={{ textDecoration: 'none', width: '100%' }}
                  >
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Typography variant="subtitle2" fontWeight={600}>
                            {lead.name || 'Unnamed Lead'}
                          </Typography>
                          <Chip
                            label={lead.status}
                            size="small"
                            color={getStatusColor(lead.status) as any}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            {lead.vehicle_brand} {lead.vehicle_model}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block' }}
                          >
                            {formatDate(lead.createdAt)}
                          </Typography>
                        </Box>
                      }
                    />
                  </Link>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Recent Quotations */}
      <Card>
        <CardHeader title="Recent Quotations" />
        <CardContent>
          {activity.quotations.length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center">
              No recent quotations
            </Typography>
          ) : (
            <List disablePadding>
              {activity.quotations.map((quotation, index) => (
                <ListItem
                  key={quotation.id}
                  divider={index < activity.quotations.length - 1}
                  sx={{
                    px: 0,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                      borderRadius: 1,
                    },
                  }}
                >
                  <Link
                    href={`${baseUrl}/quotations/${quotation.id}`}
                    style={{ textDecoration: 'none', width: '100%' }}
                  >
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Typography variant="subtitle2" fontWeight={600}>
                            {quotation.quotationNumber}
                          </Typography>
                          <Typography variant="subtitle2" color="primary">
                            £{quotation.grandTotal.toLocaleString()}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            {quotation.lead?.name || 'No lead info'}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block' }}
                          >
                            {formatDate(quotation.createdAt)}
                          </Typography>
                        </Box>
                      }
                    />
                  </Link>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Recent Invoices */}
      <Card>
        <CardHeader title="Recent Invoices" />
        <CardContent>
          {activity.invoices.length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center">
              No recent invoices
            </Typography>
          ) : (
            <List disablePadding>
              {activity.invoices.map((invoice, index) => (
                <ListItem
                  key={invoice.id}
                  divider={index < activity.invoices.length - 1}
                  sx={{
                    px: 0,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                      borderRadius: 1,
                    },
                  }}
                >
                  <Link
                    href={`${baseUrl}/invoices/${invoice.id}`}
                    style={{ textDecoration: 'none', width: '100%' }}
                  >
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Typography variant="subtitle2" fontWeight={600}>
                            {invoice.invoiceNumber}
                          </Typography>
                          <Typography variant="subtitle2" color="success.main">
                            £{invoice.grandTotal.toLocaleString()}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            {invoice.lead?.name || 'No lead info'}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block' }}
                          >
                            {formatDate(invoice.createdAt)}
                          </Typography>
                        </Box>
                      }
                    />
                  </Link>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
