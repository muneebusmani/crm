'use client';

import type { Lead, UpdateLeadDto } from '@crm/types';
import { Close, Delete, Edit } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  TextField,
  Typography,
  useTheme,
  // FormControl,
  // InputLabel,
  // Select,
  // MenuItem,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { leadsApi } from '@/services/leads.service';

interface LeadEditDialogProps {
  open: boolean;
  onClose: () => void;
  lead: Lead;
  onSave: (updatedLead: Lead) => void;
  onDelete: (leadId: number) => void;
}

const LeadEditDialog: React.FC<LeadEditDialogProps> = ({
  open,
  onClose,
  lead,
  onSave,
  onDelete,
}) => {
  const theme = useTheme();
  const [formData, setFormData] = useState<UpdateLeadDto>({
    // id: lead.id,
    name: lead.name || '',
    email: lead.email || '',
    vehicle_model: lead.vehicle_model || '',
    vehicle_reg: lead.vehicle_reg || '',
    vehicle_brand: lead.vehicle_brand || '',
    postcode: lead.postcode || '',
    description: lead.description || '',
    // status: lead.status || "",
    // assigned_to: lead.assigned_to || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData({
        // id: lead.id,
        name: lead.name || '',
        email: lead.email || '',
        vehicle_model: lead.vehicle_model || '',
        vehicle_reg: lead.vehicle_reg || '',
        vehicle_brand: lead.vehicle_brand || '',
        postcode: lead.postcode || '',
        description: lead.description || '',
        // status: lead.status || "",
        // assigned_to: lead.assigned_to || "",
      });
      setConfirmDelete(false);
    }
  }, [open, lead]);

  const handleChange = (field: keyof UpdateLeadDto, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedLead = await leadsApi.update(formData);
      onSave(updatedLead);
      onClose();
    } catch (error) {
      console.error('Failed to update lead:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(lead.id);
      onClose();
    } else {
      setConfirmDelete(true);
      setTimeout(() => {
        setConfirmDelete(false);
      }, 3000);
    }
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
            <Edit color="primary" />
            <Typography variant="h6">
              Edit Lead: {lead.name || `#${lead.id}`}
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
          {/* <Typography variant="subtitle1" gutterBottom> */}
          {/*   Lead ID: <strong>#{lead.id}</strong> | Created:{" "} */}
          {/*   <strong>{new Date(lead.createdAt).toLocaleDateString()}</strong> */}
          {/* </Typography> */}

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Full Name"
                variant="outlined"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Email Address"
                variant="outlined"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Vehicle Model"
                variant="outlined"
                value={formData.vehicle_model}
                onChange={(e) => handleChange('vehicle_model', e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Vehicle Registration"
                variant="outlined"
                value={formData.vehicle_reg}
                onChange={(e) => handleChange('vehicle_reg', e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Vehicle Brand"
                variant="outlined"
                value={formData.vehicle_brand}
                onChange={(e) => handleChange('vehicle_brand', e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Postcode"
                variant="outlined"
                value={formData.postcode}
                onChange={(e) => handleChange('postcode', e.target.value)}
              />
            </Grid>

            {/* <Grid size={{ xs: 12, sm: 6 }}> */}
            {/*   <FormControl fullWidth> */}
            {/*     <InputLabel>Status</InputLabel> */}
            {/*     <Select */}
            {/*       value={formData.status} */}
            {/*       label="Status" */}
            {/*       onChange={(e) => handleChange("status", e.target.value)} */}
            {/*     > */}
            {/*       <MenuItem value="New">New</MenuItem> */}
            {/*       <MenuItem value="Contacted">Contacted</MenuItem> */}
            {/*       <MenuItem value="Qualified">Qualified</MenuItem> */}
            {/*       <MenuItem value="Lost">Lost</MenuItem> */}
            {/*       <MenuItem value="Converted">Converted</MenuItem> */}
            {/*     </Select> */}
            {/*   </FormControl> */}
            {/* </Grid> */}

            {/* <Grid size={{ xs: 12, sm: 6 }}> */}
            {/*   <TextField */}
            {/*     fullWidth */}
            {/*     label="Assigned To" */}
            {/*     variant="outlined" */}
            {/*     value={formData.assigned_to} */}
            {/*     onChange={(e) => handleChange("assigned_to", e.target.value)} */}
            {/*   /> */}
            {/* </Grid> */}

            <Grid size={{ xs: 12 }}>
              <TextField
                multiline
                rows={4}
                fullWidth
                label="Description"
                variant="outlined"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button onClick={onClose} variant="outlined" color="secondary">
            Cancel
          </Button>

          <Button
            onClick={handleSave}
            variant="contained"
            disabled={isSaving}
            startIcon={<Edit />}
            sx={{
              backgroundColor: theme.palette.primary.main,
              '&:hover': { backgroundColor: theme.palette.primary.dark },
            }}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>

          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            startIcon={<Delete />}
            sx={{
              '&:hover': { backgroundColor: theme.palette.error.dark },
            }}
          >
            {confirmDelete ? 'Confirm Delete' : 'Delete Lead'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default LeadEditDialog;
