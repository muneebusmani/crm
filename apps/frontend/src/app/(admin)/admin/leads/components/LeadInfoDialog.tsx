"use client";

import {
  CalendarToday,
  Close,
  Email,
  Info,
  Label,
  LocationOn,
  Phone,
} from "@mui/icons-material";

import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
} from "@mui/lab";
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";

interface LeadInfoDialogProps {
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
}

const LeadInfoDialog: React.FC<LeadInfoDialogProps> = ({
  open,
  onClose,
  lead,
}) => {
  const theme = useTheme();

  // Mock activity timeline data
  const activityTimeline = [
    {
      date: "2023-11-23",
      type: "call",
      description: "Initial call with lead",
      user: "John Smith",
    },
    {
      date: "2023-11-25",
      type: "email",
      description: "Sent product information",
      user: "Sarah Johnson",
    },
    {
      date: "2023-11-28",
      type: "meeting",
      description: "Scheduled demo meeting",
      user: "John Smith",
    },
    {
      date: "2023-12-01",
      type: "note",
      description: "Lead interested in premium package",
      user: "Sarah Johnson",
    },
  ];

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
            <Info color="primary" />
            <Typography variant="h6">Lead Information: {lead.name}</Typography>
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
              {lead.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Lead ID: #{lead.id}
            </Typography>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Phone fontSize="small" color="primary" />
                <Typography variant="body2">{lead.phone}</Typography>
              </Box>

              {lead.email && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Email fontSize="small" color="primary" />
                  <Typography variant="body2">{lead.email}</Typography>
                </Box>
              )}

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LocationOn fontSize="small" color="primary" />
                <Typography variant="body2">{lead.location}</Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarToday fontSize="small" color="primary" />
                <Typography variant="body2">
                  Created: {lead.createDate}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Tags Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Label color="primary" />
                Tags
              </Box>
            </Typography>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {lead.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ))}
              {lead.tags.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No tags assigned
                </Typography>
              )}
            </Box>
          </Box>

          {/* Activity Timeline */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Activity Timeline
            </Typography>

            <Timeline position="left">
              {activityTimeline.map((activity, index) => (
                <TimelineItem key={activity.date}>
                  <TimelineSeparator>
                    <TimelineDot
                      color={((type) => {
                        const map: Record<
                          string,
                          | "inherit"
                          | "grey"
                          | "primary"
                          | "secondary"
                          | "success"
                          | "error"
                          | "info"
                          | "warning"
                        > = {
                          call: "primary",
                          email: "secondary",
                          meeting: "success",
                        };
                        return map[type];
                      })(activity.type)}
                    >
                      {activity.type === "call" && <Phone fontSize="small" />}
                      {activity.type === "email" && <Email fontSize="small" />}
                      {activity.type === "meeting" && (
                        <CalendarToday fontSize="small" />
                      )}
                      {activity.type === "note" && <Info fontSize="small" />}
                    </TimelineDot>
                    {index < activityTimeline.length - 1 && (
                      <TimelineConnector />
                    )}
                  </TimelineSeparator>
                  <TimelineContent>
                    <Paper
                      sx={{ p: 2, backgroundColor: theme.palette.grey[50] }}
                    >
                      <Typography variant="subtitle2" fontWeight="bold">
                        {new Date(activity.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {activity.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        By: {activity.user}
                      </Typography>
                    </Paper>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </Box>

          {/* Lead Statistics */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Lead Statistics
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Paper sx={{ p: 2, textAlign: "center" }}>
                  <Typography variant="h4" color="primary">
                    12
                  </Typography>
                  <Typography variant="body2">Total Interactions</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Paper sx={{ p: 2, textAlign: "center" }}>
                  <Typography variant="h4" color="success.main">
                    8
                  </Typography>
                  <Typography variant="body2">Successful Contacts</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Paper sx={{ p: 2, textAlign: "center" }}>
                  <Typography variant="h4" color="warning.main">
                    3
                  </Typography>
                  <Typography variant="body2">Follow-ups Needed</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Paper sx={{ p: 2, textAlign: "center" }}>
                  <Typography variant="h4" color="error.main">
                    1
                  </Typography>
                  <Typography variant="body2">Missed Opportunities</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          {/* Notes Section */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Notes
            </Typography>

            <List>
              <ListItem>
                <ListItemIcon>
                  <Info color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="High-value potential client"
                  secondary="Interested in enterprise solutions"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Info color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Prefers email communication"
                  secondary="Avoid calling after 5 PM"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Info color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Budget approved for Q1"
                  secondary="Decision maker is CFO"
                />
              </ListItem>
            </List>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onClose}
          variant="contained"
          color="primary"
          sx={{
            backgroundColor: theme.palette.primary.main,
            "&:hover": { backgroundColor: theme.palette.primary.dark },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LeadInfoDialog;
