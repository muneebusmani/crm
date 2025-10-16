// @ts-nocheck
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import LogoUpload from './logo-upload';
import { DealerFlatData } from '@crm/types';
import { dealerTierApi, DealerTier } from '@services/dealer-tier.service';

interface AddDealerDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    email: string;
    username: string;
    password: string;
    owner: string;
    location: string;
    logo: string;
    logoFile: File | null; // real file
    website: string;
    contactEmail: string;
    tierId?: number;
  }) => void;
  initialData?: DealerFlatData;
  isEditing?: boolean;
}

const AddDealerDialog: React.FC<AddDealerDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
}) => {
  const theme = useTheme();

  const [formData, setFormData] = useState<DealerFlatData>({
    name: '',
    email: '',
    username: '',
    password: '',
    owner: '',
    location: '',
    logo: '', // preview URL
    logoFile: null, // actual file
    website: '',
    contactEmail: '',
    tierId: 1,
  });

  const [dealerTiers, setDealerTiers] = useState<DealerTier[]>([]);
  const [loadingTiers, setLoadingTiers] = useState(true);

  // Fetch dealer tiers when dialog opens
  useEffect(() => {
    if (open) {
      const fetchTiers = async () => {
        try {
          setLoadingTiers(true);
          const tiers = await dealerTierApi.getAll();
          const sortedTiers = tiers.sort((a, b) => b.id - a.id);
          setDealerTiers(sortedTiers);

          // Set default tier to first available tier if no initial data
          if (!initialData && tiers.length > 0) {
            setFormData((prev) => ({ ...prev, tierId: tiers[0].id }));
          }
        } catch (error) {
          console.error('Failed to fetch dealer tiers:', error);
        } finally {
          setLoadingTiers(false);
        }
      };

      fetchTiers();
    }
  }, [open, initialData]);

  // Populate form if editing
  useEffect(() => {
    if (initialData && isEditing) {
      setFormData({
        name: initialData.name,
        email: initialData.email,
        username: initialData.username,
        password: '',
        owner: initialData.owner,
        location: initialData.location,
        logo: initialData.logo || '',
        logoFile: null, // fallback
        website: initialData.website,
        contactEmail: initialData.contactEmail,
        tierId:
          initialData.tierId ||
          (dealerTiers.length > 0 ? dealerTiers[0].id : 1),
      });
    } else if (!isEditing) {
      setFormData({
        name: '',
        email: '',
        username: '',
        password: '',
        owner: '',
        location: '',
        logo: '',
        logoFile: null,
        website: '',
        contactEmail: '',
        tierId: dealerTiers.length > 0 ? dealerTiers[0].id : 1,
      });
    }
  }, [initialData, isEditing, dealerTiers]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            backgroundColor: theme.palette.background.paper,
            borderRadius: theme.shape.borderRadius,
            boxShadow: theme.shadows[6],
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: theme.spacing(2),
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h6" component="div">
          {isEditing ? 'Edit Dealer' : 'Add Dealer'}
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ padding: theme.spacing(3) }}>
        <Box
          sx={{ display: 'flex', justifyContent: 'center', marginBottom: 3 }}
        >
          <LogoUpload
            value={formData.logo}
            onChange={(file, previewUrl) =>
              setFormData((prev) => ({
                ...prev,
                logo: previewUrl || '',
                logoFile: file,
              }))
            }
          />
        </Box>

        <form onSubmit={handleSubmit}>
          {/* Dealer Information */}
          <Box sx={{ mb: theme.spacing(4) }}>
            <Typography variant="subtitle1" gutterBottom>
              Dealer Information
            </Typography>
            <TextField
              fullWidth
              label="Dealer Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Owner Name"
              name="owner"
              value={formData.owner}
              onChange={handleChange}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              margin="normal"
            />
          </Box>

          {/* Account Information */}
          <Box sx={{ mb: theme.spacing(4) }}>
            <Typography variant="subtitle1" gutterBottom>
              Account Information
            </Typography>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              margin="normal"
            />
            <FormControl fullWidth variant="outlined" margin="normal">
              <InputLabel htmlFor="password">Password</InputLabel>
              <OutlinedInput
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required={!isEditing}
                label="Password"
              />
            </FormControl>
            <FormControl fullWidth margin="normal" disabled={loadingTiers}>
              <InputLabel>Tier</InputLabel>
              <Select
                name="tierId"
                value={formData.tierId}
                onChange={handleSelectChange}
                displayEmpty
              >
                {loadingTiers ? (
                  <MenuItem value="">
                    <em>Loading...</em>
                  </MenuItem>
                ) : dealerTiers.length === 0 ? (
                  <MenuItem value="">
                    <em>No tiers available</em>
                  </MenuItem>
                ) : (
                  dealerTiers.map((tier) => (
                    <MenuItem key={tier.id} value={tier.id}>
                      {/* {tier.name} (ID: {tier.id}) */}
                      {tier.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Box>

          {/* Contact Information */}
          <Box sx={{ mb: theme.spacing(4) }}>
            <Typography variant="subtitle1" gutterBottom>
              Contact Information
            </Typography>
            <TextField
              fullWidth
              label="Contact Email"
              name="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={handleChange}
              required
              margin="normal"
            />
          </Box>
        </form>
      </DialogContent>

      <DialogActions
        sx={{ padding: theme.spacing(2), justifyContent: 'flex-end' }}
      >
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loadingTiers}
        >
          {isEditing ? 'Update Dealer' : 'Add Dealer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddDealerDialog;
