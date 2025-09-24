'use client';

import { Lead } from '@crm/types';
import {
  Build,
  Close,
  DirectionsCar,
  Email,
  Info,
  LocalGasStation,
  LocationOn,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';

interface LeadInfoDialogProps {
  open: boolean;
  onClose: () => void;
  lead: Lead;
}

const LeadInfoDialog: React.FC<LeadInfoDialogProps> = ({
  open,
  onClose,
  lead,
}) => {
  const theme = useTheme();

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
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Lead ID: #{lead.id}
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
              {lead.email && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email fontSize="small" color="primary" />
                  <Typography variant="body2">{lead.email}</Typography>
                </Box>
              )}

              {lead.postcode && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn fontSize="small" color="primary" />
                  <Typography variant="body2">{lead.postcode}</Typography>
                </Box>
              )}

              {/* <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}> */}
              {/*   <CalendarToday fontSize="small" color="primary" /> */}
              {/*   <Typography variant="body2"> */}
              {/*     Created: {formatDate(lead.createdAt)} */}
              {/*   </Typography> */}
              {/* </Box> */}

              {lead.status && (
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
                />
              )}
            </Box>
          </Paper>

          {/* Vehicle Information */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <DirectionsCar color="primary" />
              Vehicle Information
            </Typography>

            <Grid container spacing={2}>
              {lead.vehicle_model && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Model
                  </Typography>
                  <Typography variant="body1">{lead.vehicle_model}</Typography>
                </Grid>
              )}

              {lead.vehicle_reg && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Registration
                  </Typography>
                  <Typography variant="body1">{lead.vehicle_reg}</Typography>
                </Grid>
              )}

              {lead.vehicle_brand && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Brand
                  </Typography>
                  <Typography variant="body1">{lead.vehicle_brand}</Typography>
                </Grid>
              )}

              {lead.engin_capacity && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Engine Capacity
                  </Typography>
                  <Typography variant="body1">{lead.engin_capacity}</Typography>
                </Grid>
              )}

              {lead.fuelType && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    <LocalGasStation fontSize="small" sx={{ mr: 0.5 }} />
                    Fuel Type
                  </Typography>
                  <Typography variant="body1">{lead.fuelType}</Typography>
                </Grid>
              )}

              {lead.engine_code && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Engine Code
                  </Typography>
                  <Typography variant="body1">{lead.engine_code}</Typography>
                </Grid>
              )}
            </Grid>
          </Box>

          {/* Part Information */}
          {(lead.part_supplied || lead.vehicle_part) && (
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Build color="primary" />
                Part Information
              </Typography>

              <Grid container spacing={2}>
                {lead.part_supplied && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Part Supplied
                    </Typography>
                    <Typography variant="body1">
                      {lead.part_supplied}
                    </Typography>
                  </Grid>
                )}

                {lead.vehicle_part && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Vehicle Part
                    </Typography>
                    <Typography variant="body1">{lead.vehicle_part}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}

          {/* Description */}
          {lead.description && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Paper sx={{ p: 2, backgroundColor: theme.palette.grey[50] }}>
                <Typography variant="body2">{lead.description}</Typography>
              </Paper>
            </Box>
          )}

          {/* Notes */}
          {lead.notes && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Notes
              </Typography>
              <Paper sx={{ p: 2, backgroundColor: theme.palette.grey[50] }}>
                <Typography variant="body2">{lead.notes}</Typography>
              </Paper>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onClose}
          variant="contained"
          color="primary"
          sx={{
            backgroundColor: theme.palette.primary.main,
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
