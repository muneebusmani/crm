///** biome-ignore-all lint/suspicious/noExplicitAny: <idk> */
//"use client";
//
//import { Add, Close, Delete, Edit } from "@mui/icons-material";
//import {
//  Box,
//  Button,
//  Chip,
//  Dialog,
//  DialogActions,
//  DialogContent,
//  DialogTitle,
//  Divider,
//  IconButton,
//  TextField,
//  Typography,
//  useTheme,
//} from "@mui/material";
//import { useState } from "react";
//
//interface LeadEditDialogProps {
//  open: boolean;
//  onClose: () => void;
//  lead: {
//    id: number;
//    name: string;
//    phone: string;
//    location: string;
//    tags: string[];
//    createDate: string;
//    email?: string;
//  };
//  onSave: (updatedLead: any) => void;
//  onDelete: (leadId: number) => void;
//}
//
//const LeadEditDialog: React.FC<LeadEditDialogProps> = ({
//  open,
//  onClose,
//  lead,
//  onSave,
//  onDelete,
//}) => {
//  const theme = useTheme();
//  const [formData, setFormData] = useState({
//    name: lead.name,
//    phone: lead.phone,
//    email: lead.email || "",
//    location: lead.location,
//    tags: [...lead.tags],
//  });
//  const [newTag, setNewTag] = useState("");
//  const [isSaving, setIsSaving] = useState(false);
//  const [confirmDelete, setConfirmDelete] = useState(false);
//
//  const handleChange = (field: string, value: any) => {
//    setFormData((prev) => ({
//      ...prev,
//      [field]: value,
//    }));
//  };
//
//  const handleAddTag = () => {
//    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
//      setFormData((prev) => ({
//        ...prev,
//        tags: [...prev.tags, newTag.trim()],
//      }));
//      setNewTag("");
//    }
//  };
//
//  const handleRemoveTag = (tagToRemove: string) => {
//    setFormData((prev) => ({
//      ...prev,
//      tags: prev.tags.filter((tag) => tag !== tagToRemove),
//    }));
//  };
//
//  const handleSave = () => {
//    setIsSaving(true);
//    onSave({
//      ...lead,
//      ...formData,
//    });
//
//    // Simulate save delay
//    setTimeout(() => {
//      setIsSaving(false);
//      onClose();
//    }, 1000);
//  };
//
//  const handleDelete = () => {
//    if (confirmDelete) {
//      onDelete(lead.id);
//      onClose();
//    } else {
//      setConfirmDelete(true);
//      setTimeout(() => {
//        setConfirmDelete(false);
//      }, 3000);
//    }
//  };
//
//  return (
//    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
//      <DialogTitle>
//        <Box
//          sx={{
//            display: "flex",
//            justifyContent: "space-between",
//            alignItems: "center",
//          }}
//        >
//          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//            <Edit color="primary" />
//            <Typography variant="h6">Edit Lead: {lead.name}</Typography>
//          </Box>
//          <IconButton onClick={onClose} size="small">
//            <Close />
//          </IconButton>
//        </Box>
//      </DialogTitle>
//
//      <Divider />
//
//      <DialogContent>
//        <Box sx={{ py: 2 }}>
//          <Typography variant="subtitle1" gutterBottom>
//            Lead ID: <strong>#{lead.id}</strong> | Created:{" "}
//            <strong>{lead.createDate}</strong>
//          </Typography>
//
//          <Box
//            sx={{
//              display: "grid",
//              gridTemplateColumns: "1fr 1fr",
//              gap: 2,
//              mb: 3,
//            }}
//          >
//            <TextField
//              label="Full Name"
//              variant="outlined"
//              value={formData.name}
//              onChange={(e) => handleChange("name", e.target.value)}
//              required
//            />
//
//            <TextField
//              label="Phone Number"
//              variant="outlined"
//              value={formData.phone}
//              onChange={(e) => handleChange("phone", e.target.value)}
//              required
//            />
//
//            <TextField
//              label="Email Address"
//              variant="outlined"
//              value={formData.email}
//              onChange={(e) => handleChange("email", e.target.value)}
//            />
//
//            <TextField
//              label="Location"
//              variant="outlined"
//              value={formData.location}
//              onChange={(e) => handleChange("location", e.target.value)}
//              required
//            />
//          </Box>
//
//          <Box sx={{ mb: 3 }}>
//            <Typography variant="subtitle2" gutterBottom>
//              Tags:
//            </Typography>
//            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
//              {formData.tags.map((tag) => (
//                <Chip
//                  key={tag}
//                  label={tag}
//                  onDelete={() => handleRemoveTag(tag)}
//                  size="small"
//                  color="primary"
//                />
//              ))}
//            </Box>
//
//            <Box sx={{ display: "flex", gap: 1 }}>
//              <TextField
//                size="small"
//                variant="outlined"
//                value={newTag}
//                onChange={(e) => setNewTag(e.target.value)}
//                placeholder="Add new tag"
//                onKeyDown={(e) => {
//                  if (e.key === "Enter") {
//                    e.preventDefault();
//                    handleAddTag();
//                  }
//                }}
//                sx={{ flex: 1 }}
//              />
//              <Button
//                variant="outlined"
//                size="small"
//                startIcon={<Add />}
//                onClick={handleAddTag}
//                disabled={!newTag.trim()}
//              >
//                Add Tag
//              </Button>
//            </Box>
//          </Box>
//
//          <Box
//            sx={{
//              p: 2,
//              backgroundColor: theme.palette.grey[50],
//              borderRadius: 1,
//              border: `1px solid ${theme.palette.divider}`,
//            }}
//          >
//            <Typography variant="body2" color="text.secondary">
//              <strong>Changes Preview:</strong>
//            </Typography>
//            <Typography variant="body2" color="text.secondary">
//              Name: {formData.name}
//            </Typography>
//            <Typography variant="body2" color="text.secondary">
//              Phone: {formData.phone}
//            </Typography>
//            <Typography variant="body2" color="text.secondary">
//              Email: {formData.email || "Not provided"}
//            </Typography>
//            <Typography variant="body2" color="text.secondary">
//              Location: {formData.location}
//            </Typography>
//            <Typography variant="body2" color="text.secondary">
//              Tags: {formData.tags.join(", ") || "None"}
//            </Typography>
//          </Box>
//        </Box>
//      </DialogContent>
//
//      <DialogActions sx={{ p: 2 }}>
//        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//          <Button onClick={onClose} variant="outlined" color="secondary">
//            Cancel
//          </Button>
//
//          <Button
//            onClick={handleSave}
//            variant="contained"
//            disabled={isSaving}
//            startIcon={<Edit />}
//            sx={{
//              backgroundColor: theme.palette.primary.main,
//              "&:hover": { backgroundColor: theme.palette.primary.dark },
//            }}
//          >
//            {isSaving ? "Saving..." : "Save Changes"}
//          </Button>
//
//          <Button
//            onClick={handleDelete}
//            variant="contained"
//            color="error"
//            startIcon={<Delete />}
//            sx={{
//              "&:hover": { backgroundColor: theme.palette.error.dark },
//            }}
//          >
//            {confirmDelete ? "Confirm Delete" : "Delete Lead"}
//          </Button>
//        </Box>
//      </DialogActions>
//    </Dialog>
//  );
//};
//
//export default LeadEditDialog;
"use client";

import type { Lead, UpdateLeadDto } from "@crm/types";
import { Close, Delete, Edit } from "@mui/icons-material";
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
} from "@mui/material";
import { useEffect, useState } from "react";
import { leadsApi } from "@/services/leads.service";

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
    name: lead.name || "",
    email: lead.email || "",
    vehicle_model: lead.vehicle_model || "",
    vehicle_reg: lead.vehicle_reg || "",
    vehicle_brand: lead.vehicle_brand || "",
    postcode: lead.postcode || "",
    description: lead.description || "",
    // status: lead.status || "",
    // assigned_to: lead.assigned_to || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData({
        // id: lead.id,
        name: lead.name || "",
        email: lead.email || "",
        vehicle_model: lead.vehicle_model || "",
        vehicle_reg: lead.vehicle_reg || "",
        vehicle_brand: lead.vehicle_brand || "",
        postcode: lead.postcode || "",
        description: lead.description || "",
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
      console.error("Failed to update lead:", error);
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
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Email Address"
                variant="outlined"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Vehicle Model"
                variant="outlined"
                value={formData.vehicle_model}
                onChange={(e) => handleChange("vehicle_model", e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Vehicle Registration"
                variant="outlined"
                value={formData.vehicle_reg}
                onChange={(e) => handleChange("vehicle_reg", e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Vehicle Brand"
                variant="outlined"
                value={formData.vehicle_brand}
                onChange={(e) => handleChange("vehicle_brand", e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Postcode"
                variant="outlined"
                value={formData.postcode}
                onChange={(e) => handleChange("postcode", e.target.value)}
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
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
              "&:hover": { backgroundColor: theme.palette.primary.dark },
            }}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>

          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            startIcon={<Delete />}
            sx={{
              "&:hover": { backgroundColor: theme.palette.error.dark },
            }}
          >
            {confirmDelete ? "Confirm Delete" : "Delete Lead"}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default LeadEditDialog;
