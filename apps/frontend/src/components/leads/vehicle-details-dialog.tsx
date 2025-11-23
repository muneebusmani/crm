'use client';

import { VehicleDetails } from '@crm/types';
import {
  Build,
  CalendarToday,
  Close,
  DirectionsCar,
  Info,
  LocalGasStation,
  LocalShipping,
  Note,
  Settings,
  Speed,
  Title as TitleIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
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
import { useEffect, useRef, useState } from 'react';
import { get } from '@/lib/api';

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
      {value != null && value !== '' ? value : '-'}
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
  const [vehicleDetails, setVehicleDetails] = useState<VehicleDetails | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  useEffect(() => {
    if (!open) {
      setVehicleDetails(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    if (leadId) {
      if (leadHasDetails) {
        let cancelled = false;
        setIsLoading(true);
        setError(null);

        get(`/leads/${leadId}/vehicle-details`, { credentials: 'include' })
          .then((data) => {
            if (cancelled) return;
            console.log('Vehicle details loaded:', data);
            if (data.success) {
              setVehicleDetails(data.data);
            } else {
              setError(data.message || 'No vehicle details found');
            }
          })
          .catch((e) => {
            if (cancelled) return;
            console.error('Error loading vehicle details:', e);
            setError(e.message || 'Failed to load vehicle details');
          })
          .finally(() => {
            if (!cancelled) {
              setIsLoading(false);
            }
          });

        return () => {
          cancelled = true;
        };
      } else {
        setError('No vehicle details available for this lead');
        setVehicleDetails(null);
        setIsLoading(false);
      }
    }
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
            <Typography variant="h6">Detailed Vehicle Information</Typography>
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
                      value={
                        vehicleDetails.vehicleRegistration.YearOfManufacture
                      }
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
                      value={formatDate(
                        vehicleDetails.vehicleRegistration.DateOfLastUpdate,
                      )}
                    />
                  </GridItem>
                  <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem
                      label="Date First Registered (UK)"
                      value={formatDate(
                        vehicleDetails.vehicleRegistration
                          .DateFirstRegisteredUk,
                      )}
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
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 2,
                    }}
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
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 2,
                    }}
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
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 2,
                    }}
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

              {/* Consumption Information */}
              {vehicleDetails.consumption && (
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <LocalGasStation color="primary" />
                    Fuel Consumption
                  </Typography>

                  <Grid container spacing={2}>
                    <GridItem size={{ xs: 12, sm: 4, md: 4 }}>
                      <InfoItem
                        label="Combined"
                        value={
                          vehicleDetails.consumption.Combined
                            ? `${vehicleDetails.consumption.Combined.Mpg || ''} mpg / ${vehicleDetails.consumption.Combined.Lkm || ''} L/100km`
                            : '-'
                        }
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 4, md: 4 }}>
                      <InfoItem
                        label="Urban (Cold)"
                        value={
                          vehicleDetails.consumption.UrbanCold
                            ? `${vehicleDetails.consumption.UrbanCold.Mpg || ''} mpg / ${vehicleDetails.consumption.UrbanCold.Lkm || ''} L/100km`
                            : '-'
                        }
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 4, md: 4 }}>
                      <InfoItem
                        label="Extra Urban"
                        value={
                          vehicleDetails.consumption.ExtraUrban
                            ? `${vehicleDetails.consumption.ExtraUrban.Mpg || ''} mpg / ${vehicleDetails.consumption.ExtraUrban.Lkm || ''} L/100km`
                            : '-'
                        }
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
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <CalendarToday color="primary" />
                    Vehicle History
                  </Typography>

                  <Grid container spacing={2}>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Number of Previous Keepers"
                        value={
                          vehicleDetails.vehicleHistory.NumberOfPreviousKeepers
                        }
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="V5C Certificate Count"
                        value={
                          vehicleDetails.vehicleHistory.V5CCertificateCount
                        }
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
                        value={
                          vehicleDetails.vehicleRegistration.Scrapped
                            ? 'Yes'
                            : 'No'
                        }
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Exported"
                        value={
                          vehicleDetails.vehicleRegistration.Exported
                            ? 'Yes'
                            : 'No'
                        }
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Imported from Non-EU"
                        value={
                          vehicleDetails.vehicleRegistration.ImportNonEu
                            ? 'Yes'
                            : 'No'
                        }
                      />
                    </GridItem>
                  </Grid>
                </Paper>
              )}

              {/* SMMT Details */}
              {vehicleDetails.smmtDetails && (
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <Settings color="primary" />
                    SMMT Details
                  </Typography>

                  <Grid container spacing={2}>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Marque"
                        value={vehicleDetails.smmtDetails.Marque}
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Model"
                        value={vehicleDetails.smmtDetails.ModelVariant}
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Range"
                        value={vehicleDetails.smmtDetails.Range}
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Body Style"
                        value={vehicleDetails.smmtDetails.BodyStyle}
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Fuel Type"
                        value={vehicleDetails.smmtDetails.FuelType}
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Engine Capacity"
                        value={`${vehicleDetails.smmtDetails.EngineCapacity || ''} cc`}
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Transmission"
                        value={vehicleDetails.smmtDetails.Transmission}
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Number of Gears"
                        value={vehicleDetails.smmtDetails.NumberOfGears}
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Number of Doors"
                        value={vehicleDetails.smmtDetails.NumberOfDoors}
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Drive Type"
                        value={vehicleDetails.smmtDetails.DriveType}
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Country of Origin"
                        value={vehicleDetails.smmtDetails.CountryOfOrigin}
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Series"
                        value={vehicleDetails.smmtDetails.Series}
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Market Sector"
                        value={vehicleDetails.smmtDetails.MarketSectorCode}
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
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 2,
                    }}
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

              {/* General Information */}
              {vehicleDetails.general && (
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <Info color="primary" />
                    General Specifications
                  </Typography>

                  <Grid container spacing={2}>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Type Approval Category"
                        value={vehicleDetails.general.TypeApprovalCategory}
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Driver Position"
                        value={vehicleDetails.general.DriverPosition}
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Driving Axle"
                        value={vehicleDetails.general.DrivingAxle}
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Power Delivery"
                        value={vehicleDetails.general.PowerDelivery}
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Euro Status"
                        value={vehicleDetails.general.EuroStatus}
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Series Description"
                        value={vehicleDetails.general.SeriesDescription}
                      />
                    </GridItem>
                    <GridItem size={{ xs: 12, sm: 6, md: 4 }}>
                      <InfoItem
                        label="Limited Edition"
                        value={
                          vehicleDetails.general.IsLimitedEdition ? 'Yes' : 'No'
                        }
                      />
                    </GridItem>
                  </Grid>
                </Paper>
              )}
            </>
          )}

          {!vehicleDetails && !isLoading && (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              py={8}
            >
              <Typography variant="h6" color="text.secondary">
                No detailed vehicle information available. Click "Fetch More
                Info" to retrieve details.
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
