/** biome-ignore-all lint/style/noNonNullAssertion: <needed> */
'use client';

import type { Lead } from '@crm/types';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Info as InfoIcon,
  ReceiptLong as ReceiptLongIcon,
  RequestQuote as RequestQuoteIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import ChatIcon from '@mui/icons-material/Chat';

import {
  Alert,
  Box,
  Chip,
  IconButton,
  InputBase,
  Pagination,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableContainer,
  TableRow,
  Typography,
  useTheme,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  Select,
} from '@mui/material';
import { useRouter } from 'next/navigation'; // ✅ App Router hook
import { useEffect, useState, useMemo } from 'react';
import { socketService } from '@/services/socket.service';
import { leadsApi } from '@/services/leads.service';
import { leadNotesApi } from '@/services/lead-notes.service';
import LeadEditDialog from './lead-edit-dialog';
import LeadEmailDialog from './lead-email-dialog';
import LeadInfoDialog from './lead-info-dialog';
import SendInvoiceDialog from './send-invoice-dialog';
import SendQuotationDialog from './send-quotation-dialog';
import LeadNotesPanel from '../LeadNotesPanel';

const LeadsTable: React.FC = () => {
  const router = useRouter();
  const handleOpenChat = (leadId: number) => {
    router.push(`/dealer/messages?leadId=${leadId}`);
  };

  const theme = useTheme();
  const ACTION_COL_WIDTH = 140; // Reduced from 180 to decrease space between status and actions
  const STATUS_COL_WIDTH = 140;
  const NOTES_COL_WIDTH = 150;
  const TABLE_MIN_WIDTH = 2400;
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openEmailDialog, setOpenEmailDialog] = useState(false);
  const [openInfoDialog, setOpenInfoDialog] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isInfoDialogLoading, setIsInfoDialogLoading] = useState(false);
  const [openQuotationDialog, setOpenQuotationDialog] = useState(false);
  const [openInvoiceDialog, setOpenInvoiceDialog] = useState(false);
  const [openNotesDialog, setOpenNotesDialog] = useState(false);
  const [selectedLeadForNotes, setSelectedLeadForNotes] = useState<Lead | null>(
    null,
  );
  const [currentProfileId, setCurrentProfileId] = useState<number | undefined>(
    undefined,
  );
  const [notePreviews, setNotePreviews] = useState<Map<number, string>>(
    new Map(),
  );

  // Menu state for three dots
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [currentMenuLead, setCurrentMenuLead] = useState<Lead | null>(null);
  const menuOpen = Boolean(menuAnchorEl);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  // Fetch leads from API
  const fetchLeads = async () => {
    setLoading(true); // start loading
    try {
      const leadsData = await leadsApi.getAll();
      console.log('Leads Data:', leadsData);
      const sortedLeads = leadsData.sort(
        (a, b) =>
          new Date(b.createdAt as unknown as Date).getTime() -
          new Date(a.createdAt as unknown as Date).getTime(),
      );
      setLeads(sortedLeads);
      // setLeads(leadsData); regular leads
      // const reversedleads = leadsData.reverse();
      // setLeads(reversedleads); reverse leads
    } catch (error) {
      setSnackbar({
        open: true,
        message:
          error instanceof Error ? error.message : 'Failed to fetch leads',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLeadById = async (id: number) => {
    setLoading(true);
    try {
      const leadData = await leadsApi.getOne(id);
      setSelectedLead(leadData);
      return leadData;
    } catch (error) {
      setSnackbar({
        open: true,
        message:
          error instanceof Error ? error.message : 'Failed to fetch lead info',
        severity: 'error',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Set up socket connection and event listeners
  useEffect(() => {
    socketService.connect();

    socketService.onLeadCreated((newLead: Lead) => {
      setLeads((prev) => [...prev, newLead]);
      setSnackbar({
        open: true,
        message: `New lead created: ${newLead.name || 'Unknown'}`,
        severity: 'success',
      });
    });

    socketService.onLeadUpdated((updatedLead: Lead) => {
      setLeads((prev) =>
        prev.map((lead) => (lead.id === updatedLead.id ? updatedLead : lead)),
      );
      setSnackbar({
        open: true,
        message: `Lead updated: ${updatedLead.name || 'Unknown'}`,
        severity: 'success',
      });
    });

    // Service
    socketService.onLeadDeleted((id) => {
      setLeads((prev) => prev.filter((lead) => String(lead.id) !== String(id)));
      setSnackbar({
        open: true,
        message: 'Lead deleted successfully',
        severity: 'success',
      });
    });

    const removeLeadCallback = (_: Lead) => {
      return;
    };

    const removeLeadCallback2 = (_: Partial<Lead>) => {
      return;
    };

    return () => {
      socketService.removeLeadCreatedListener(removeLeadCallback);
      socketService.removeLeadUpdatedListener(removeLeadCallback);
      socketService.removeLeadDeletedListener(removeLeadCallback2);
      socketService.disconnect();
    };
  }, []);

  // Fetch leads on component mount
  // biome-ignore lint/correctness/useExhaustiveDependencies: <idk>
  useEffect(() => {
    fetchLeads();
  }, []);

  // Fetch current profile ID from cookies
  useEffect(() => {
    const getProfileIdFromCookie = () => {
      try {
        // Read the selected_profile_id cookie (now it's not httpOnly, so we can access it)
        const cookieValue = document.cookie
          .split('; ')
          .find((row) => row.startsWith('selected_profile_id='))
          ?.split('=')[1];

        if (cookieValue) {
          const profileId = Number.parseInt(cookieValue, 10);
          if (!Number.isNaN(profileId)) {
            console.log('📍 [Leads] Profile ID from cookie:', profileId);
            setCurrentProfileId(profileId);
          } else {
            console.error(
              '❌ [Leads] Invalid profile ID in cookie:',
              cookieValue,
            );
            setSnackbar({
              open: true,
              message: 'No profile selected. Please select a profile.',
              severity: 'warning',
            });
          }
        } else {
          console.error('❌ [Leads] No selected_profile_id cookie found');
          setSnackbar({
            open: true,
            message: 'No profile selected. Please select a profile.',
            severity: 'warning',
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    getProfileIdFromCookie();
  }, []);

  // Reset page to 1 when rows per page changes
  useEffect(() => {
    setPage(1);
  }, [rowsPerPage]);

  // Calculate filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter(
      (lead) =>
        (lead.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.vehicle_model || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (lead.vehicle_reg || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
    );
  }, [leads, searchTerm]);

  // Calculate current page leads
  const currentLeads = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    return filteredLeads.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredLeads, page, rowsPerPage]);

  const totalPages = Math.ceil(filteredLeads.length / rowsPerPage);

  // Fetch note previews only for current page leads
  useEffect(() => {
    const fetchNotePreviews = async () => {
      if (!currentProfileId || currentLeads.length === 0) return;

      const previews = new Map(notePreviews); // Keep existing previews

      // Only fetch for leads that don't have previews yet
      const leadsToFetch = currentLeads.filter(
        (lead) => !previews.has(lead.id!),
      );

      if (leadsToFetch.length === 0) return; // All current page leads already have previews

      await Promise.all(
        leadsToFetch.map(async (lead) => {
          try {
            const notes = await leadNotesApi.getByLeadId(
              lead.id!,
              currentProfileId,
            );
            if (notes && notes.length > 0) {
              // Get the first 5 characters of the latest note
              const latestNote = notes[0];
              previews.set(lead.id!, latestNote.content.substring(0, 5));
            } else {
              previews.set(lead.id!, '...');
            }
          } catch (error) {
            console.error(`Failed to fetch notes for lead ${lead.id}:`, error);
            previews.set(lead.id!, '...');
          }
        }),
      );

      setNotePreviews(previews);
    };

    fetchNotePreviews();
  }, [currentLeads, currentProfileId]);

  // Refresh note preview for a specific lead
  const refreshNotePreview = async (leadId: number) => {
    if (!currentProfileId) return;

    try {
      const notes = await leadNotesApi.getByLeadId(leadId, currentProfileId);
      const newPreviews = new Map(notePreviews);
      if (notes.length > 0) {
        const latestNote = notes[0];
        newPreviews.set(leadId, latestNote.content.substring(0, 5));
      } else {
        newPreviews.set(leadId, '...');
      }
      setNotePreviews(newPreviews);
    } catch (error) {
      console.error(
        `Failed to refresh note preview for lead ${leadId}:`,
        error,
      );
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    setPage(value);
  };

  const handleRowSelect = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleActionClick = async (action: string, lead: Lead) => {
    switch (action) {
      case 'edit':
        setSelectedLead(lead);
        setOpenEditDialog(true);
        break;

      case 'info': {
        // Set the selected lead with basic info
        setSelectedLead(lead);
        setOpenInfoDialog(true);

        // Load detailed info in the background
        if (!lead.email || !lead.vehicle_brand) {
          // Only fetch if we don't have basic details
          try {
            setIsInfoDialogLoading(true);
            const detailedLead = await fetchLeadById(lead.id!);
            if (detailedLead) {
              setSelectedLead((prev) => ({
                ...prev,
                ...detailedLead,
                // Preserve any existing fields that might be missing in the detailed response
                ...(prev?.name && !detailedLead.name
                  ? { name: prev.name }
                  : {}),
                ...(prev?.email && !detailedLead.email
                  ? { email: prev.email }
                  : {}),
              }));
            }
          } catch (error) {
            console.error('Error fetching lead details:', error);
          } finally {
            setIsInfoDialogLoading(false);
          }
        }
        break;
      }

      default:
        break;
    }
  };

  const handleLeadSave = async (updatedLead: Lead) => {
    try {
      await leadsApi.update(updatedLead);
      setSnackbar({
        open: true,
        message: `Lead "${updatedLead.name}" updated successfully`,
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message:
          error instanceof Error ? error.message : 'Failed to update lead',
        severity: 'error',
      });
    }
  };

  const handleLeadDelete = async (leadId: number) => {
    try {
      await leadsApi.delete(leadId);
      setSnackbar({
        open: true,
        message: `Lead #${leadId} deleted successfully`,
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message:
          error instanceof Error ? error.message : 'Failed to delete lead',
        severity: 'error',
      });
    }
  };

  const handleEmailSent = async (emailData: {
    to: string;
    subject: string;
    body: string;
    cc?: string[];
    attachments: File[];
  }) => {
    // Implement email sending logic here
    setSnackbar({
      open: true,
      message: `Email sent to ${emailData.to}`,
      severity: 'success',
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Menu handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, lead: Lead) => {
    setMenuAnchorEl(event.currentTarget);
    setCurrentMenuLead(lead);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setCurrentMenuLead(null);
  };

  const handleMenuAction = (action: string) => {
    if (!currentMenuLead) return;

    switch (action) {
      case 'edit':
        handleActionClick('edit', currentMenuLead);
        break;
      case 'info':
        handleActionClick('info', currentMenuLead);
        break;
      case 'chat':
        handleOpenChat(currentMenuLead.id!);
        break;
      case 'delete':
        handleLeadDelete(currentMenuLead.id!);
        break;
      default:
        break;
    }
    handleMenuClose();
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'New':
        return 'primary';
      case 'Contacted':
        return 'info';
      case 'Qualified':
        return 'warning';
      case 'Converted':
        return 'success';
      case 'Lost':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return <Typography>Loading leads...</Typography>;
  }

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            backgroundColor: theme.palette.grey[100],
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <InputBase
              placeholder="Search for..."
              value={searchTerm}
              onChange={handleSearchChange}
              startAdornment={
                <SearchIcon
                  sx={{ color: theme.palette.text.secondary, ml: 1 }}
                  fontSize="small"
                />
              }
              sx={{
                width: 300,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                px: 2,
                py: 1,
                '& input': { padding: '0 !important' },
              }}
            />
          </Box>
        </Box>

        {/* Table */}
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table
            stickyHeader
            aria-label="leads table"
            sx={{
              minWidth: TABLE_MIN_WIDTH,
              tableLayout: 'auto',
              '& th, & td': { whiteSpace: 'nowrap' },
              '& th:nth-of-type(1), & td:nth-of-type(1)': { minWidth: 180 }, // Name
              '& th:nth-of-type(2), & td:nth-of-type(2)': { minWidth: 240 }, // Email
              '& th:nth-of-type(3), & td:nth-of-type(3)': { minWidth: 160 }, // Phone
              '& th:nth-of-type(4), & td:nth-of-type(4)': { minWidth: 140 }, // Make
              '& th:nth-of-type(5), & td:nth-of-type(5)': { minWidth: 160 }, // Model
              '& th:nth-of-type(6), & td:nth-of-type(6)': { minWidth: 140 }, // VRM
              '& th:nth-of-type(7), & td:nth-of-type(7)': { minWidth: 160 }, // Registration
              '& th:nth-of-type(8), & td:nth-of-type(8)': { minWidth: 280 }, // Additional Notes
              '& th:nth-of-type(9), & td:nth-of-type(9)': { minWidth: 140 }, // Fuel Type
              '& th:nth-of-type(10), & td:nth-of-type(10)': { minWidth: 180 }, // Engine Title
              '& th:nth-of-type(11), & td:nth-of-type(11)': { minWidth: 140 }, // Engine Capacity
              '& th:nth-of-type(12), & td:nth-of-type(12)': { minWidth: 180 }, // Recieved at
              '& th:nth-of-type(13), & td:nth-of-type(13)': {
                minWidth: STATUS_COL_WIDTH,
              }, // Status
              '& th:nth-of-type(14), & td:nth-of-type(14)': {
                minWidth: ACTION_COL_WIDTH,
              }, // Action
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Name
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Email
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Phone
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Make
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Model
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    VRM
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Registration
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Additional Notes
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Fuel Type
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Engine Title
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Engine Capacity
                  </Typography>
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Recieved at
                  </Typography>
                </TableCell>
                <TableCell
                  sx={{
                    position: 'sticky',
                    right: ACTION_COL_WIDTH + STATUS_COL_WIDTH,
                    backgroundColor: theme.palette.background.paper,
                    zIndex: 4,
                    minWidth: NOTES_COL_WIDTH,
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    Notes
                  </Typography>
                </TableCell>
                <TableCell
                  sx={{
                    position: 'sticky',
                    right: ACTION_COL_WIDTH,
                    backgroundColor: theme.palette.background.paper,
                    zIndex: 4,
                    minWidth: STATUS_COL_WIDTH,
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    Status
                  </Typography>
                </TableCell>
                <TableCell
                  sx={{
                    position: 'sticky',
                    right: 0,
                    backgroundColor: theme.palette.background.paper,
                    zIndex: 4,
                    minWidth: ACTION_COL_WIDTH,
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    Action
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <Typography>{lead.name || '-'}</Typography>
                  </TableCell>
                  <TableCell>{lead.email || '-'}</TableCell>
                  <TableCell>{lead.number || '-'}</TableCell>
                  <TableCell>{lead.vehicle_brand || '-'}</TableCell>
                  <TableCell>{lead.vehicle_model || '-'}</TableCell>
                  <TableCell>{lead.vehicle_vrm || '-'}</TableCell>
                  <TableCell>{lead.vehicle_reg || '-'}</TableCell>
                  <TableCell>
                    {lead.description
                      ? lead.description.length > 15
                        ? `${lead.description.slice(0, 15)}...`
                        : lead.description
                      : 'N/A'}
                  </TableCell>
                  <TableCell>{lead.fuelType || '-'}</TableCell>
                  <TableCell>{lead.vehicle_title || '-'}</TableCell>
                  <TableCell>
                    {lead.engin_capacity ? `${lead.engin_capacity}.0L` : '-'}
                  </TableCell>
                  <TableCell>
                    {new Date(
                      lead.createdAt as unknown as string,
                    ).toLocaleString()}
                  </TableCell>
                  <TableCell
                    onClick={() => {
                      setSelectedLeadForNotes(lead);
                      setOpenNotesDialog(true);
                    }}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                      position: 'sticky',
                      right: ACTION_COL_WIDTH + STATUS_COL_WIDTH,
                      backgroundColor: theme.palette.background.paper,
                      zIndex: 3,
                      minWidth: NOTES_COL_WIDTH,
                    }}
                  >
                    <Typography variant="body2" color="primary">
                      {notePreviews.get(lead.id!) || '...'}
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      right: ACTION_COL_WIDTH,
                      backgroundColor: theme.palette.background.paper,
                      zIndex: 3,
                      minWidth: STATUS_COL_WIDTH,
                    }}
                  >
                    <Chip
                      label={lead.status || 'Unknown'}
                      color={getStatusColor(lead.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      right: 0,
                      backgroundColor: theme.palette.background.paper,
                      zIndex: 3,
                      minWidth: ACTION_COL_WIDTH,
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      {/* Quotation Icon - Outside Menu */}
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => {
                          setSelectedLead(lead);
                          setOpenQuotationDialog(true);
                        }}
                        title="Send Quotation"
                      >
                        <RequestQuoteIcon fontSize="small" />
                      </IconButton>

                      {/* Invoice Icon - Outside Menu */}
                      <IconButton
                        size="small"
                        color="warning"
                        onClick={() => {
                          setSelectedLead(lead);
                          setOpenInvoiceDialog(true);
                        }}
                        title="Send Invoice"
                      >
                        <ReceiptLongIcon fontSize="small" />
                      </IconButton>

                      {/* Three Dots Menu for remaining actions */}
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, lead)}
                        title="More Actions"
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Rows per page:
            </Typography>
            <Select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              size="small"
              sx={{ minWidth: 70 }}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </Select>
          </Box>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
            siblingCount={1}
            boundaryCount={1}
            shape="rounded"
          />
        </Box>
      </Paper>

      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => handleMenuAction('edit')}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('info')}>
          <ListItemIcon>
            <InfoIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Info</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('chat')}>
          <ListItemIcon>
            <ChatIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Open Chat</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('delete')}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Dialog Components */}
      {selectedLead && (
        <>
          <LeadEmailDialog
            open={openEmailDialog}
            onClose={() => setOpenEmailDialog(false)}
            lead={{
              id: selectedLead.id!,
              name: selectedLead.name || '',
              email: selectedLead.email,
            }}
            onEmailSent={handleEmailSent}
          />

          <LeadEditDialog
            open={openEditDialog}
            onClose={() => setOpenEditDialog(false)}
            lead={selectedLead}
            onSave={handleLeadSave}
            onDelete={handleLeadDelete}
          />

          <LeadInfoDialog
            open={openInfoDialog}
            onClose={() => setOpenInfoDialog(false)}
            lead={selectedLead}
            isLoading={isInfoDialogLoading}
          />

          <SendQuotationDialog
            open={openQuotationDialog}
            onClose={() => setOpenQuotationDialog(false)}
            leadId={selectedLead.id ?? null}
            onSuccess={() =>
              setSnackbar({
                open: true,
                message: 'Quotation sent successfully',
                severity: 'success',
              })
            }
          />

          <SendInvoiceDialog
            open={openInvoiceDialog}
            onClose={() => setOpenInvoiceDialog(false)}
            leadId={selectedLead.id ?? null}
            onSuccess={() =>
              setSnackbar({
                open: true,
                message: 'Invoice sent successfully',
                severity: 'success',
              })
            }
          />
        </>
      )}

      {/* Notes Dialog */}
      <Dialog
        open={openNotesDialog}
        onClose={() => {
          if (selectedLeadForNotes?.id) {
            refreshNotePreview(selectedLeadForNotes.id);
          }
          setOpenNotesDialog(false);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Lead Notes
          {selectedLeadForNotes &&
            ` - ${selectedLeadForNotes.name || 'Unknown Lead'}`}
        </DialogTitle>
        <DialogContent>
          {selectedLeadForNotes && (
            <LeadNotesPanel
              leadId={selectedLeadForNotes.id!}
              currentProfileId={currentProfileId}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LeadsTable;
