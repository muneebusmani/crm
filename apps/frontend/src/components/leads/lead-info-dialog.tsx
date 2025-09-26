'use client';

import { Lead } from '@crm/types';
import {
  Build,
  CalendarToday,
  CheckCircle,
  Close,
  DirectionsCar,
  Email,
  Info,
  LocalGasStation,
  LocalShipping,
  LocationOn,
  Note,
  Settings,
  Speed,
  Title as TitleIcon,
  Update,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  type GridProps,
  IconButton,
  Paper,
  Typography,
  TypographyVariant,
  useTheme,
} from '@mui/material';

// Helper component for consistent info display
const InfoItem = ({
  icon: Icon,
  label,
  value,
  valueVariant = 'body1' as const,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  valueVariant?:
    | 'body1'
    | 'body2'
    | 'subtitle1'
    | 'subtitle2'
    | 'caption'
    | 'button'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'inherit'
    | 'overline'
    | 'srOnly';
}) => (
  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
    <Box sx={{ mt: 0.5, color: 'primary.main' }}>
      <Icon fontSize="small" />
    </Box>
    <Box>
      <Typography variant="subtitle2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant={valueVariant as TypographyVariant}>
        {value || '-'}
      </Typography>
    </Box>
  </Box>
);

interface LeadInfoDialogProps {
  open: boolean;
  onClose: () => void;
  lead: Lead | null;
  isLoading?: boolean;
}

// Grid item with proper typing
const GridItem = (props: GridProps) => <Grid item component="div" {...props} />;

const LeadInfoDialog: React.FC<LeadInfoDialogProps> = ({
  open,
  onClose,
  lead,
  isLoading,
}) => {
  const theme = useTheme();

  if (!lead) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>No Lead Selected</DialogTitle>
        <DialogContent>
          <Typography>No lead information available.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  if (isLoading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Loading Lead Information</DialogTitle>
        <DialogContent>
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Format date for display
  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get condition status
  const getConditionStatus = () => {
    if (!lead) return null;
    const conditions = [];
    if (lead.reconditioned_condition === 'Yes')
      conditions.push('Reconditioned');
    if (lead.used_condition === 'Yes') conditions.push('Used');
    if (lead.new_condition === 'Yes') conditions.push('New');
    if (conditions.length === 0) return 'Not specified';
    return conditions.join(', ');
  };

  // Get supply preference
  const getSupplyPreference = () => {
    if (lead.part_supplied === 'No') return 'Not supplying parts';
    if (lead.supply_only === 'Yes') return 'Supply only';
    if (lead.consider_both === 'Yes') return 'Open to both';
    return 'Not specified';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Info color="primary" />
            <Typography variant="h6">
              Lead Information: {lead.name || `#${lead.id}`}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent>
        <Box sx={{ py: 2 }}>
          {/* Lead Header */}
          <Paper sx={{ p: 3, mb: 3, backgroundColor: theme.palette.grey[50] }}>
            <Typography variant="h5" gutterBottom>
              {lead.name || 'Unnamed Lead'}
            </Typography>

            <Grid container spacing={2}>
              <GridItem size={{ xs: 12, sm: 6 }}>
                <InfoItem icon={Email} label="Email" value={lead.email} />
              </GridItem>
              <GridItem size={{ xs: 12, sm: 6 }}>
                <InfoItem
                  icon={LocationOn}
                  label="Postcode"
                  value={lead.postcode}
                />
              </GridItem>
              <GridItem size={{ xs: 12, sm: 6 }}>
                <InfoItem
                  icon={CalendarToday}
                  label="Created"
                  value={lead.createdAt ? formatDate(lead.createdAt) : '-'}
                />
              </GridItem>
              <GridItem size={{ xs: 12, sm: 6 }}>
                <InfoItem
                  icon={Update}
                  label="Last Updated"
                  value={lead.updatedAt ? formatDate(lead.updatedAt) : '-'}
                />
              </GridItem>
              {lead.status && (
                <GridItem size={{ xs: 12 }}>
                  <Chip
                    label={lead.status}
                    color={
                      lead.status === 'Converted'
                        ? 'success'
                        : lead.status === 'Lost'
                          ? 'error'
                          : 'default'
                    }
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </GridItem>
              )}
            </Grid>
          </Paper>

          {/* Vehicle Information */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <DirectionsCar color="primary" />
              Vehicle Information
            </Typography>

            <Grid container spacing={2}>
              <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoItem
                  icon={TitleIcon}
                  label="Make & Model"
                  value={`${lead.vehicle_brand || ''} ${
                    lead.vehicle_model || ''
                  }`.trim()}
                />
              </GridItem>
              <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoItem
                  icon={Speed}
                  label="Engine"
                  value={`${lead.engin_capacity || ''} ${
                    lead.engine_code ? `(${lead.engine_code})` : ''
                  }`.trim()}
                />
              </GridItem>
              <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoItem
                  icon={LocalGasStation}
                  label="Fuel Type"
                  value={lead.fuelType}
                />
              </GridItem>
              <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoItem
                  icon={Settings}
                  label="Vehicle Drive"
                  value={lead.vehicle_drive}
                />
              </GridItem>
              <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoItem
                  icon={DirectionsCar}
                  label="Registration"
                  value={lead.vehicle_reg}
                />
              </GridItem>
              <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoItem
                  icon={Build}
                  label="Vehicle Part"
                  value={lead.vehicle_part}
                />
              </GridItem>
              <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoItem
                  icon={CheckCircle}
                  label="Part Condition"
                  value={getConditionStatus()}
                />
              </GridItem>
              <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoItem
                  icon={LocalShipping}
                  label="Collection Required"
                  value={lead.collection_required}
                />
              </GridItem>
            </Grid>
          </Paper>

          {/* Part Requirements */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <Build color="primary" />
              Part Requirements
            </Typography>

            <Grid container spacing={2}>
              <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoItem
                  icon={CheckCircle}
                  label="Part Supply"
                  value={getSupplyPreference()}
                />
              </GridItem>
              <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoItem
                  icon={LocalShipping}
                  label="Collection Required"
                  value={lead.collection_required || 'Not specified'}
                />
              </GridItem>
              {lead.consider_all_condition === 'Yes' && (
                <GridItem size={{ xs: 12 }}>
                  <Chip
                    label="Considers all conditions"
                    color="info"
                    size="small"
                    icon={<CheckCircle />}
                  />
                </GridItem>
              )}
            </Grid>
          </Paper>

          {/* Additional Information */}
          <Grid container spacing={3}>
            {/* Description */}
            {lead.description && (
              <GridItem size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <Note color="primary" />
                    Description
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {lead.description}
                  </Typography>
                </Paper>
              </GridItem>
            )}

            {/* Notes */}
            {lead.notes && (
              <GridItem size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <Note color="primary" />
                    Notes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {lead.notes}
                  </Typography>
                </Paper>
              </GridItem>
            )}
          </Grid>

          {/* System Information */}
          <Paper sx={{ p: 3, mt: 3, backgroundColor: theme.palette.grey[50] }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              System Information
            </Typography>
            <Grid container spacing={2}>
              <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoItem
                  icon={CalendarToday}
                  label="Created"
                  value={lead.createdAt ? formatDate(lead.createdAt) : '-'}
                  valueVariant="body2"
                />
              </GridItem>
              <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoItem
                  icon={Update}
                  label="Last Updated"
                  value={lead.updatedAt ? formatDate(lead.updatedAt) : '-'}
                  valueVariant="body2"
                />
              </GridItem>
              <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoItem
                  icon={Info}
                  label="Lead ID"
                  value={`#${lead.id}`}
                  valueVariant="body2"
                />
              </GridItem>
            </Grid>
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}
      >
        <Button
          onClick={onClose}
          variant="contained"
          color="primary"
          sx={{
            minWidth: 120,
            '&:hover': { backgroundColor: theme.palette.primary.dark },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LeadInfoDialog;
