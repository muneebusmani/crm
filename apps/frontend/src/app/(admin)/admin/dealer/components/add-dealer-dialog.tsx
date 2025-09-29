import { Dealer } from '@crm/types';
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

// Your Dealer type

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
  initialData?: Dealer;
  isEditing?: boolean;
}

interface DealerFormData {
  name: string;
  email: string;
  username: string;
  password: string;
  owner: string;
  location: string;
  logo: string; // preview URL
  logoFile: File | null;
  website: string;
  contactEmail: string;
  tierId: number;
}

const AddDealerDialog: React.FC<AddDealerDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
}) => {
  const theme = useTheme();

  const [formData, setFormData] = useState<DealerFormData>({
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
        tierId: initialData.tierId || 1,
      });
    } else {
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
        tierId: 1,
      });
    }
  }, [initialData, isEditing]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
            <FormControl fullWidth margin="normal">
              <InputLabel>Tier</InputLabel>
              <Select
                name="tierId"
                value={formData.tierId}
                onChange={handleSelectChange}
              >
                <MenuItem value={1}>Tier 1</MenuItem>
                <MenuItem value={2}>Tier 2</MenuItem>
                <MenuItem value={3}>Tier 3</MenuItem>
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
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {isEditing ? 'Update Dealer' : 'Add Dealer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddDealerDialog;
