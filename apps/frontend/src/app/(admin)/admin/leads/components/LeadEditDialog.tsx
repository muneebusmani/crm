/** biome-ignore-all lint/suspicious/noExplicitAny: <idk> */
"use client";

import { Add, Close, Delete, Edit } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useState } from "react";

interface LeadEditDialogProps {
  open: boolean;
  onClose: () => void;
  lead: {
    id: number;
    name: string;
    phone: string;
    location: string;
    tags: string[];
    createDate: string;
    email?: string;
  };
  onSave: (updatedLead: any) => void;
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
  const [formData, setFormData] = useState({
    name: lead.name,
    phone: lead.phone,
    email: lead.email || "",
    location: lead.location,
    tags: [...lead.tags],
  });
  const [newTag, setNewTag] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    onSave({
      ...lead,
      ...formData,
    });

    // Simulate save delay
    setTimeout(() => {
      setIsSaving(false);
      onClose();
    }, 1000);
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
            <Typography variant="h6">Edit Lead: {lead.name}</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Lead ID: <strong>#{lead.id}</strong> | Created:{" "}
            <strong>{lead.createDate}</strong>
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 2,
              mb: 3,
            }}
          >
            <TextField
              label="Full Name"
              variant="outlined"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />

            <TextField
              label="Phone Number"
              variant="outlined"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              required
            />

            <TextField
              label="Email Address"
              variant="outlined"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />

            <TextField
              label="Location"
              variant="outlined"
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
              required
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Tags:
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
              {formData.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  size="small"
                  color="primary"
                />
              ))}
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                size="small"
                variant="outlined"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add new tag"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                sx={{ flex: 1 }}
              />
              <Button
                variant="outlined"
                size="small"
                startIcon={<Add />}
                onClick={handleAddTag}
                disabled={!newTag.trim()}
              >
                Add Tag
              </Button>
            </Box>
          </Box>

          <Box
            sx={{
              p: 2,
              backgroundColor: theme.palette.grey[50],
              borderRadius: 1,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              <strong>Changes Preview:</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Name: {formData.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Phone: {formData.phone}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Email: {formData.email || "Not provided"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Location: {formData.location}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tags: {formData.tags.join(", ") || "None"}
            </Typography>
          </Box>
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
