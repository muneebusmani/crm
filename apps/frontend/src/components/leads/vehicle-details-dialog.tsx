'use client';

import { VehicleDetails } from '@crm/types';
import {
  Build,
  CalendarToday,
  CheckCircle,
  Close,
  DirectionsCar,
  Info,
  LocalGasStation,
  LocalShipping,
  LocationOn,
  Note,
  Settings,
  Speed,
  Title as TitleIcon,
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
  IconButton,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';
import { useEffect, useState, useRef } from 'react';

// Helper component for consistent info display
const InfoItem = ({
  label,
  value,
  valueVariant = 'body1' as const,
}: {
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
  <Box sx={{ mb: 2 }}>
    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
      {label}
    </Typography>
    <Typography variant={valueVariant}>
      {value || '-'}
    </Typography>
  </Box>
);

interface VehicleDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  leadId: number | null;
  leadHasDetails: boolean;
}

// Grid item with proper typing
const GridItem = (props: any) => <Grid item component="div" {...props} />;

const VehicleDetailsDialog: React.FC<VehicleDetailsDialogProps> = ({
  open,
  onClose,
  leadId,
  leadHasDetails,
}) => {
  const [vehicleDetails, setVehicleDetails] = useState<VehicleDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasMadeApiCall = useRef(false);
  const theme = useTheme();

  // Reset local state when dialog closes
  useEffect(() => {
    if (!open) {
      // Reset on close to prepare for next open
      setVehicleDetails(null);
      setIsLoading(false);
      setError(null);
      hasMadeApiCall.current = false; // Reset the API call flag when dialog closes
    }
  }, [open]);

  // Load vehicle details from API when dialog opens
  useEffect(() => {
    let cancelled = false;

    const loadVehicleDetails = async () => {
      // Only proceed if dialog is open, leadId exists, it's the initial load for this dialog instance, and API hasn't been called yet
      if (open && leadId && !hasMadeApiCall.current) {
        hasMadeApiCall.current = true; // Set the flag to prevent duplicate calls
        setIsLoading(true);
        setError(null);

        try {
          const resp = await fetch(`/api/leads/${leadId}/vehicle-details`, {
            credentials: 'include',
          });
          
          if (!resp.ok) {
            const errorData = await resp.json();
            throw new Error(errorData.error || 'Failed to load vehicle details');
          }
          
          const data = await resp.json();
          if (!cancelled && data.success) {
            setVehicleDetails(data.data);
          }
        } catch (e: any) {
          console.error('Error loading vehicle details:', e);
          if (!cancelled) {
            setError(e.message || 'Failed to load vehicle details');
          }
        } finally {
          if (!cancelled) {
            setIsLoading(false);
          }
        }
      }
    };

    if (leadHasDetails) {
      loadVehicleDetails();
    }

    return () => {
      cancelled = true;
    };
  }, [open, leadId, leadHasDetails]);

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString; // Return as-is if parsing fails
    }
  };

  if (!leadId) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
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

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>Loading Vehicle Details</DialogTitle>
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

  // Show error if there was one
  if (error) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>Error Loading Details</DialogTitle>
        <DialogContent>
          <Typography color="error">{error}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DirectionsCar color="primary" />
            <Typography variant="h6">
              Detailed Vehicle Information
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
          {vehicleDetails && (
            <>
              {/* Vehicle Registration Information */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
                >
                  <TitleIcon color="primary" />
                  Vehicle Registration
                </Typography>

                <Grid container spacing={2}>
                  <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem
                      label="Make & Model"
                      value={`${vehicleDetails.vehicleRegistration.Make || ''} ${vehicleDetails.vehicleRegistration.Model || ''}`.trim()}
                    />
                  </GridItem>
                  <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem
                      label="Vehicle Class"
                      value={vehicleDetails.vehicleRegistration.VehicleClass}
                    />
                  </GridItem>
                  <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem
                      label="Year of Manufacture"
                      value={vehicleDetails.vehicleRegistration.YearOfManufacture}
                    />
                  </GridItem>
                  <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem
                      label="Engine Capacity"
                      value={`${vehicleDetails.vehicleRegistration.EngineCapacity || ''} cc`}
                    />
                  </GridItem>
                  <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem
                      label="Fuel Type"
                      value={vehicleDetails.vehicleRegistration.FuelType}
                    />
                  </GridItem>
                  <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem
                      label="CO2 Emissions"
                      value={`${vehicleDetails.vehicleRegistration.Co2Emissions || ''} g/km`}
                    />
                  </GridItem>
                  <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem
                      label="Transmission"
                      value={vehicleDetails.vehicleRegistration.Transmission}
                    />
                  </GridItem>
                  <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem
                      label="Colour"
                      value={vehicleDetails.vehicleRegistration.Colour}
                    />
                  </GridItem>
                  <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem
                      label="Date of Last Update"
                      value={formatDate(vehicleDetails.vehicleRegistration.DateOfLastUpdate)}
                    />
                  </GridItem>
                  <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem
                      label="Date First Registered (UK)"
                      value={formatDate(vehicleDetails.vehicleRegistration.DateFirstRegisteredUk)}
                    />
                  </GridItem>
                  <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem
                      label="VIN"
                      value={vehicleDetails.vehicleRegistration.Vin}
                    />
                  </GridItem>
                  <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem
                      label="VRM"
                      value={vehicleDetails.vehicleRegistration.Vrm}
                    />
                  </GridItem>
                </Grid>
              </Paper>

              {/* Engine Information */}
              {vehicleDetails.engine && (
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
                  >
                    <Build color="primary" />
                    Engine Details
                  </Typography>

                  <Grid container spacing={2}>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Engine Make"
                        value={vehicleDetails.engine.Make}
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Engine Type"
                        value={vehicleDetails.engine.Aspiration}
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Fuel System"
                        value={vehicleDetails.engine.FuelSystem}
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Number of Cylinders"
                        value={vehicleDetails.engine.NumberOfCylinders}
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Valves per Cylinder"
                        value={vehicleDetails.engine.ValvesPerCylinder}
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Stroke"
                        value={`${vehicleDetails.engine.Stroke || ''} mm`}
                      />
                    </GridItem>
                  </Grid>
                </Paper>
              )}

              {/* Performance Information */}
              {vehicleDetails.performance && (
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
                  >
                    <Speed color="primary" />
                    Performance
                  </Typography>

                  <Grid container spacing={2}>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Max Power"
                        value={
                          vehicleDetails.performance.Power
                            ? `${vehicleDetails.performance.Power.Kw || ''} kW (${vehicleDetails.performance.Power.Bhp || ''} bhp)`
                            : '-'
                        }
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Max Torque"
                        value={
                          vehicleDetails.performance.Torque
                            ? `${vehicleDetails.performance.Torque.Nm || ''} Nm`
                            : '-'
                        }
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Max Speed"
                        value={
                          vehicleDetails.performance.MaxSpeed
                            ? `${vehicleDetails.performance.MaxSpeed.Mph || ''} mph`
                            : '-'
                        }
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="CO2"
                        value={`${vehicleDetails.performance.Co2 || ''} g/km`}
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="0-60 mph"
                        value={
                          vehicleDetails.performance.Acceleration
                            ? `${vehicleDetails.performance.Acceleration.ZeroTo60Mph || ''} seconds`
                            : '-'
                        }
                      />
                    </GridItem>
                  </Grid>
                </Paper>
              )}

              {/* Vehicle Dimensions */}
              {vehicleDetails.dimensions && (
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
                  >
                    <LocalShipping color="primary" />
                    Dimensions & Weight
                  </Typography>

                  <Grid container spacing={2}>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Length"
                        value={`${vehicleDetails.dimensions.CarLength || ''} mm`}
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Width"
                        value={`${vehicleDetails.dimensions.Width || ''} mm`}
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Height"
                        value={`${vehicleDetails.dimensions.Height || ''} mm`}
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Wheelbase"
                        value={`${vehicleDetails.dimensions.WheelBase || ''} mm`}
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Gross Vehicle Weight"
                        value={`${vehicleDetails.dimensions.GrossVehicleWeight || ''} kg`}
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Kerb Weight"
                        value={`${vehicleDetails.dimensions.KerbWeight || ''} kg`}
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Number of Seats"
                        value={vehicleDetails.dimensions.NumberOfSeats}
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Number of Doors"
                        value={vehicleDetails.dimensions.NumberOfDoors}
                      />
                    </GridItem>
                  </Grid>
                </Paper>
              )}

              {/* Vehicle History */}
              {vehicleDetails.vehicleHistory && (
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
                  >
                    <CalendarToday color="primary" />
                    Vehicle History
                  </Typography>

                  <Grid container spacing={2}>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Number of Previous Keepers"
                        value={vehicleDetails.vehicleHistory.NumberOfPreviousKeepers}
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="V5C Certificate Count"
                        value={vehicleDetails.vehicleHistory.V5CCertificateCount}
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Plate Changes"
                        value={vehicleDetails.vehicleHistory.PlateChangeCount}
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Scrapped"
                        value={vehicleDetails.vehicleRegistration.Scrapped ? 'Yes' : 'No'}
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Exported"
                        value={vehicleDetails.vehicleRegistration.Exported ? 'Yes' : 'No'}
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Imported from Non-EU"
                        value={vehicleDetails.vehicleRegistration.ImportNonEu ? 'Yes' : 'No'}
                      />
                    </GridItem>
                  </Grid>
                </Paper>
              )}

              {/* VED Rate (Tax) */}
              {vehicleDetails.vedRate && (
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
                  >
                    <Note color="primary" />
                    VED Rate (Tax)
                  </Typography>

                  <Grid container spacing={2}>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="VED Band"
                        value={vehicleDetails.vedRate.vedBand}
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="6 Month Rate"
                        value={`£${vehicleDetails.vedRate.Standard?.SixMonth || 0}`}
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="12 Month Rate"
                        value={`£${vehicleDetails.vedRate.Standard?.TwelveMonth || 0}`}
                      />
                    </GridItem>
                  </Grid>
                </Paper>
              )}
            </>
          )}

          {!vehicleDetails && !isLoading && (
            <Box display="flex" justifyContent="center" alignItems="center" py={8}>
              <Typography variant="h6" color="text.secondary">
                No detailed vehicle information available. Click "Fetch More Info" to retrieve details.
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}
      >
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VehicleDetailsDialog;