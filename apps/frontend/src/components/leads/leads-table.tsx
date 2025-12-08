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
  AutoFixHigh as AutoFixHighIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import ChatIcon from '@mui/icons-material/Chat';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';

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
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useRouter, useSearchParams } from 'next/navigation'; // ✅ App Router hook
import { useEffect, useState, useMemo } from 'react';
import { socketService } from '@/services/socket.service';
import LeadEditDialog from './lead-edit-dialog';
import LeadEmailDialog from './lead-email-dialog';
import LeadInfoDialog from './lead-info-dialog';
import VehicleDetailsDialog from './vehicle-details-dialog';
import SendInvoiceDialog from './send-invoice-dialog';
import SendQuotationDialog from './send-quotation-dialog';
import LeadNotesPanel from '../LeadNotesPanel';
import { get, post, post2 } from '@/lib/api';

const LeadsTable: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const handleOpenChat = (leadId: number) => {
    router.push(`/dealer/messages?leadId=${leadId}`);
  };

  const theme = useTheme();
  const ACTION_COL_WIDTH = 140; // Reduced from 180 to decrease space between status and actions
  const STATUS_COL_WIDTH = 180;
  const NOTES_COL_WIDTH = 150;
  const TABLE_MIN_WIDTH = 2400;
  const [leads, setLeads] = useState<Lead[]>([]);
  const [hqLeads, setHqLeads] = useState<Lead[]>([]); // Separate state for assigned HQ leads
  const [hqQuota, setHqQuota] = useState<{ canAssign: boolean; assignedCount: number; dailyLimit: number } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [hqPage, setHqPage] = useState(1);
  const [hqRowsPerPage, setHqRowsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [regularLeadsExpanded, setRegularLeadsExpanded] = useState(true);
  const [hqLeadsExpanded, setHqLeadsExpanded] = useState(true);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openEmailDialog, setOpenEmailDialog] = useState(false);
  const [openInfoDialog, setOpenInfoDialog] = useState(false);
  const [openVehicleDetailsDialog, setOpenVehicleDetailsDialog] =
    useState(false);
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
  const [currentDealerId, setCurrentDealerId] = useState<number | undefined>(
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
      const res = await fetch('/api/leads');
      // console.log('Why Response is not okay', res.status);
      if (!res.ok) throw new Error('Failed to fetch leads');
      const leadsData = (await res.json()) as Lead[];
      console.log('Leads Data:', leadsData);
      const sortedLeads = leadsData.sort(
        (a, b) =>
          new Date(b.createdAt as unknown as Date).getTime() -
          new Date(a.createdAt as unknown as Date).getTime(),
      );
      // Filter out HQ leads - they will be fetched separately via assigned endpoint
      setLeads(sortedLeads.filter(lead => !lead.isHqLead));
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

  // Fetch HQ leads assigned to this dealer
  const fetchHqLeads = async () => {
    try {
      const res = await fetch('/api/leads/hq/my-leads', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch HQ leads');
      const hqLeadsData = (await res.json()) as Lead[];
      const sortedHqLeads = hqLeadsData.sort(
        (a, b) =>
          new Date(b.createdAt as unknown as Date).getTime() -
          new Date(a.createdAt as unknown as Date).getTime(),
      );
      setHqLeads(sortedHqLeads);
    } catch (error) {
      console.error('Failed to fetch HQ leads:', error);
      // Don't show error for HQ leads if dealer has no access
    }
  };

  // Fetch HQ quota status
  const fetchHqQuota = async () => {
    try {
      const res = await fetch('/api/leads/hq/my-quota', { credentials: 'include' });
      if (res.ok) {
        const quotaData = await res.json();
        setHqQuota(quotaData);
      }
    } catch (error) {
      console.error('Failed to fetch HQ quota:', error);
    }
  };

  const fetchLeadById = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leads/${id}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch lead info');
      const leadData = (await res.json()) as Lead;
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
    fetchHqLeads();
    fetchHqQuota();
  }, []);

  // Handle opening lead from URL query parameter
  useEffect(() => {
    const leadId = searchParams.get('id');
    if (leadId && leads.length > 0 && !openInfoDialog) {
      const lead = leads.find((l) => String(l.id) === leadId);
      if (lead) {
        console.log('Opening lead from URL:', leadId);
        handleActionClick('info', lead);
        // Clear the query parameter after a short delay
        setTimeout(() => {
          router.replace('/dealer/leads', { scroll: false });
        }, 100);
      }
    }
  }, [searchParams, leads, openInfoDialog, router]);

  // Fetch current profile ID
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/selected-profile', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentProfileId(data.id);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };
    fetchProfile();
  }, []);
  useEffect(() => {
    const fetchDealer = async () => {
      try {
        const res = await fetch('/api/dealer-profile', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentDealerId(data.dealerId);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };
    fetchDealer();
  }, []);

  // Reset page to 1 when rows per page changes
  useEffect(() => {
    setPage(1);
  }, []);

  // Calculate filtered leads - only regular leads (HQ leads are now separate)
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

  // Calculate filtered HQ leads (from separate hqLeads state)
  const filteredHqLeads = useMemo(() => {
    return hqLeads.filter(
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
  }, [hqLeads, searchTerm]);

  // Calculate current page leads for regular leads
  const currentLeads = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    return filteredLeads.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredLeads, page, rowsPerPage]);

  // Calculate current page leads for HQ leads
  const currentHqLeads = useMemo(() => {
    const startIndex = (hqPage - 1) * hqRowsPerPage;
    return filteredHqLeads.slice(startIndex, startIndex + hqRowsPerPage);
  }, [filteredHqLeads, hqPage, hqRowsPerPage]);

  const totalPages = Math.ceil(filteredLeads.length / rowsPerPage);
  const totalHqPages = Math.ceil(filteredHqLeads.length / hqRowsPerPage);

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
            const res = await fetch(`/api/leads/${lead.id}/notes`, {
              credentials: 'include',
            });
            if (res.ok) {
              const data = await res.json();
              const notes = data.data || [];
              if (notes.length > 0) {
                // Get the first 5 characters of the latest note
                const latestNote = notes[0];
                previews.set(lead.id!, latestNote.content.substring(0, 5));
              } else {
                previews.set(lead.id!, '...');
              }
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
      const res = await fetch(`/api/leads/${leadId}/notes`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        const notes = data.data || [];
        const newPreviews = new Map(notePreviews);
        if (notes.length > 0) {
          const latestNote = notes[0];
          newPreviews.set(leadId, latestNote.content.substring(0, 5));
        } else {
          newPreviews.set(leadId, '...');
        }
        setNotePreviews(newPreviews);
      }
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

  const handleHqPageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    setHqPage(value);
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
        break;
      }

      case 'vehicle-details': {
        setSelectedLead(lead);
        setOpenVehicleDetailsDialog(true);
        break;
      }

      default:
        break;
    }
  };

  const handleLeadSave = async (updatedLead: Lead) => {
    try {
      const res = await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...updatedLead }),
      });
      if (!res.ok) throw new Error('Failed to update lead');
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

  const handleFetchMoreInfo = async (lead: Lead) => {
    if (!lead.id) return;

    try {
      // const res = await fetch(`/api/leads/${lead.id}/fetch-more-info`, {
      //   method: 'POST',
      //   credentials: 'include',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      const result = await post2(`/leads/${lead.id}/fetch-more-info`);
      // });

      if (result.success) {
        // Update the local lead data with the new info
        setSnackbar({
          open: true,
          message: 'Additional lead information fetched successfully',
          severity: 'success',
        });

        // Refresh the leads data to show the update
        fetchLeads();
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to fetch additional lead info',
        severity: 'error',
      });
    }
  };

  const handleLeadDelete = async (leadId: number) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete lead');
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
      case 'vehicle-details':
        handleActionClick('vehicle-details', currentMenuLead);
        break;
      case 'chat':
        handleOpenChat(currentMenuLead.id!);
        break;
      case 'invoice':
        setSelectedLead(currentMenuLead);
        setOpenInvoiceDialog(true);
        break;
      case 'fetch-info':
        handleFetchMoreInfo(currentMenuLead);
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
    <Box sx={{ width: '100%' }}>
      {/* Search Bar */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
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
            backgroundColor: 'white',
            '& input': { padding: '0 !important' },
          }}
        />
      </Box>

      {/* Regular Leads Accordion */}
      <Accordion 
        expanded={regularLeadsExpanded} 
        onChange={() => setRegularLeadsExpanded(!regularLeadsExpanded)}
        sx={{ mb: 2 }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            backgroundColor: theme.palette.grey[100],
            '&:hover': {
              backgroundColor: theme.palette.grey[200],
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Regular Leads
            </Typography>
            <Chip 
              label={`${filteredLeads.length} Total`} 
              color="primary" 
              size="small"
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          <Paper elevation={0} sx={{ overflow: 'hidden' }}>

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
              '& th:nth-of-type(7), & td:nth-of-type(7)': { minWidth: 160 }, // Year
              '& th:nth-of-type(8), & td:nth-of-type(8)': { minWidth: 280 }, // Customer Notes
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
                    VRM
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Post Code
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
                    Year
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Customer Notes
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
                    width: NOTES_COL_WIDTH,
                    padding: '12px 8px',
                    borderRight: `1px solid ${theme.palette.divider}`,
                    textAlign: 'center',
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
                    width: STATUS_COL_WIDTH,
                    maxWidth: STATUS_COL_WIDTH,
                    padding: '12px 8px',
                    borderRight: `1px solid ${theme.palette.divider}`,
                    textAlign: 'center',
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
                    width: ACTION_COL_WIDTH,
                    maxWidth: ACTION_COL_WIDTH,
                    padding: '12px 8px',
                    textAlign: 'center',
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
                  <TableCell>
                    {lead.email ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Tooltip title={lead.email} placement="top">
                          <Typography variant="body2" sx={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                            {lead.email}
                          </Typography>
                        </Tooltip>
                        <IconButton
                          size="small"
                          onClick={() => window.location.href = `mailto:${lead.email}`}
                          sx={{ color: '#1976d2', p: 0.5, ml: 'auto', flexShrink: 0 }}
                        >
                          <EmailIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {lead.number ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Tooltip title={lead.number} placement="top">
                          <Typography variant="body2" sx={{ flex: 1 }}>
                            {lead.number}
                          </Typography>
                        </Tooltip>
                        <IconButton
                          size="small"
                          onClick={() => window.open(`https://wa.me/${lead.number.replace(/\D/g, '')}`, '_blank')}
                          sx={{ color: '#25D366', p: 0.5, ml: 'auto', flexShrink: 0 }}
                        >
                          <WhatsAppIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {(lead.vehicle_vrm?.toUpperCase().trim() || '-').replace(
                      /\s+/g,
                      '',
                    ) || '-'}
                  </TableCell>
                  <TableCell>
                    {(lead.postcode?.toUpperCase().trim() || '-').replace(
                      /\s+/g,
                      '',
                    ) || '-'}
                  </TableCell>
                  <TableCell>{lead.vehicle_brand || '-'}</TableCell>
                  <TableCell>
                    {lead.vehicle_model || lead.vehicle_series || '-'}
                  </TableCell>
                  <TableCell>{lead.vehicle_reg || '-'}</TableCell>
                  <TableCell>
                    <Tooltip
                      title={lead.description}
                      placement="top"
                      componentsProps={{
                        tooltip: {
                          sx: {
                            fontSize: '1.25rem', // Increase tooltip text size
                          },
                        },
                      }}
                    >
                      <span>
                        {lead.description
                          ? lead.description.length > 15
                            ? `${lead.description.slice(0, 15)}...`
                            : lead.description
                          : '-'}
                      </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{lead.fuelType || '-'}</TableCell>
                  <TableCell>{lead.vehicle_title || '-'}</TableCell>
                  <TableCell>
                    {lead.engin_capacity ? `${lead.engin_capacity}.0L` : '-'}
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    {new Date(
                      lead.createdAt as unknown as string,
                    ).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                    <br />
                    {new Date(
                      lead.createdAt as unknown as string,
                    ).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
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
                      width: NOTES_COL_WIDTH,
                      padding: '12px 8px',
                      borderRight: `1px solid ${theme.palette.divider}`,
                      textAlign: 'center',
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
                      width: STATUS_COL_WIDTH,
                      maxWidth: STATUS_COL_WIDTH,
                      padding: '12px 8px',
                      borderRight: `1px solid ${theme.palette.divider}`,
                      overflow: 'visible',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                        alignItems: 'center',
                      }}
                    >
                      <Chip
                        label={lead.status || 'Unknown'}
                        color={getStatusColor(lead.status)}
                        size="small"
                      />
                    </Box>
                  </TableCell>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      right: 0,
                      backgroundColor: theme.palette.background.paper,
                      zIndex: 3,
                      minWidth: ACTION_COL_WIDTH,
                      width: ACTION_COL_WIDTH,
                      maxWidth: ACTION_COL_WIDTH,
                      padding: '12px 8px',
                      overflow: 'visible',
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      {/* Check if lead is won by another dealer */}
                      {lead.wonByDealerId &&
                      lead.wonByDealerId !== currentDealerId ? (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ fontStyle: 'italic' }}
                          title="This lead has been won by another dealer"
                        >
                          Won by other dealer
                        </Typography>
                      ) : (
                        <>
                          {/* Info Icon - Outside Menu */}
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => {
                              handleActionClick('info', lead);
                            }}
                            title="View Info"
                          >
                            <InfoIcon fontSize="small" />
                          </IconButton>

                          {/* Vehicle Details Icon - Outside Menu (Only if details available) */}
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => {
                              handleActionClick('vehicle-details', lead);
                            }}
                            title={
                              lead.moreInfoFetched
                                ? 'View Detailed Vehicle Information'
                                : 'No Detailed Information Available'
                            }
                            disabled={!lead.moreInfoFetched}
                          >
                            <DashboardIcon
                              fontSize="small"
                              color={
                                lead.moreInfoFetched ? 'primary' : 'disabled'
                              }
                            />
                          </IconButton>

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
                        </>
                      )}

                      {/* Three Dots Menu for remaining actions - always available */}
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
        </AccordionDetails>
      </Accordion>

      {/* HQ Leads Accordion */}
      {filteredHqLeads.length > 0 && (
        <Accordion 
          expanded={hqLeadsExpanded} 
          onChange={() => setHqLeadsExpanded(!hqLeadsExpanded)}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
            sx={{
              backgroundColor: '#D4A017',
              '&:hover': {
                backgroundColor: '#C89812',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
                🏆 HQ Leads (Premium Brands)
              </Typography>
              <Chip 
                label={`${filteredHqLeads.length} Total`} 
                color="default" 
                size="small"
                sx={{ fontWeight: 'bold', backgroundColor: 'rgba(255, 255, 255, 0.3)', color: 'white' }}
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <Paper elevation={0} sx={{ overflow: 'hidden' }}>

          {/* HQ Table */}
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table
              stickyHeader
              aria-label="hq leads table"
              sx={{
                minWidth: TABLE_MIN_WIDTH,
                tableLayout: 'auto',
                '& th, & td': { whiteSpace: 'nowrap' },
                '& th:nth-of-type(1), & td:nth-of-type(1)': { minWidth: 180 },
                '& th:nth-of-type(2), & td:nth-of-type(2)': { minWidth: 240 },
                '& th:nth-of-type(3), & td:nth-of-type(3)': { minWidth: 160 },
                '& th:nth-of-type(4), & td:nth-of-type(4)': { minWidth: 140 },
                '& th:nth-of-type(5), & td:nth-of-type(5)': { minWidth: 160 },
                '& th:nth-of-type(6), & td:nth-of-type(6)': { minWidth: 140 },
                '& th:nth-of-type(7), & td:nth-of-type(7)': { minWidth: 160 },
                '& th:nth-of-type(8), & td:nth-of-type(8)': { minWidth: 280 },
                '& th:nth-of-type(9), & td:nth-of-type(9)': { minWidth: 140 },
                '& th:nth-of-type(10), & td:nth-of-type(10)': { minWidth: 180 },
                '& th:nth-of-type(11), & td:nth-of-type(11)': { minWidth: 140 },
                '& th:nth-of-type(12), & td:nth-of-type(12)': { minWidth: 180 },
                '& th:nth-of-type(13), & td:nth-of-type(13)': { minWidth: STATUS_COL_WIDTH },
                '& th:nth-of-type(14), & td:nth-of-type(14)': { minWidth: ACTION_COL_WIDTH },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">Name</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">Email</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">Phone</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">VRM</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">Post Code</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">Make</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">Model</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">Year</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">Customer Notes</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">Fuel Type</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">Engine Title</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">Engine Capacity</Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle2" fontWeight="bold">Received at</Typography>
                  </TableCell>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      right: ACTION_COL_WIDTH + STATUS_COL_WIDTH,
                      backgroundColor: theme.palette.background.paper,
                      zIndex: 4,
                      minWidth: NOTES_COL_WIDTH,
                      width: NOTES_COL_WIDTH,
                      padding: '12px 8px',
                      borderRight: `1px solid ${theme.palette.divider}`,
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight="bold">Notes</Typography>
                  </TableCell>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      right: ACTION_COL_WIDTH,
                      backgroundColor: theme.palette.background.paper,
                      zIndex: 4,
                      minWidth: STATUS_COL_WIDTH,
                      width: STATUS_COL_WIDTH,
                      maxWidth: STATUS_COL_WIDTH,
                      padding: '12px 8px',
                      borderRight: `1px solid ${theme.palette.divider}`,
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight="bold">Status</Typography>
                  </TableCell>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      right: 0,
                      backgroundColor: theme.palette.background.paper,
                      zIndex: 4,
                      minWidth: ACTION_COL_WIDTH,
                      width: ACTION_COL_WIDTH,
                      maxWidth: ACTION_COL_WIDTH,
                      padding: '12px 8px',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight="bold">Action</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentHqLeads.map((lead) => (
                  <TableRow key={lead.id} sx={{ backgroundColor: theme.palette.warning.light || '#fff8e1' }}>
                    <TableCell>
                      <Typography>{lead.name || '-'}</Typography>
                    </TableCell>
                    <TableCell>
                      {lead.email ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Tooltip title={lead.email} placement="top">
                            <Typography variant="body2" sx={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                              {lead.email}
                            </Typography>
                          </Tooltip>
                          <IconButton
                            size="small"
                            onClick={() => window.location.href = `mailto:${lead.email}`}
                            sx={{ color: '#1976d2', p: 0.5, ml: 'auto', flexShrink: 0 }}
                          >
                            <EmailIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {lead.number ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Tooltip title={lead.number} placement="top">
                            <Typography variant="body2" sx={{ flex: 1 }}>
                              {lead.number}
                            </Typography>
                          </Tooltip>
                          <IconButton
                            size="small"
                            onClick={() => window.open(`https://wa.me/${lead.number.replace(/\D/g, '')}`, '_blank')}
                            sx={{ color: '#25D366', p: 0.5, ml: 'auto', flexShrink: 0 }}
                          >
                            <WhatsAppIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {(lead.vehicle_vrm?.toUpperCase().trim() || '-').replace(
                        /\s+/g,
                        '',
                      ) || '-'}
                    </TableCell>
                    <TableCell>
                      {(lead.postcode?.toUpperCase().trim() || '-').replace(
                        /\s+/g,
                        '',
                      ) || '-'}
                    </TableCell>
                    <TableCell>{lead.vehicle_brand || '-'}</TableCell>
                    <TableCell>
                      {lead.vehicle_model || lead.vehicle_series || '-'}
                    </TableCell>
                    <TableCell>{lead.vehicle_reg || '-'}</TableCell>
                    <TableCell>
                      <Tooltip
                        title={lead.description}
                        placement="top"
                        componentsProps={{
                          tooltip: {
                            sx: {
                              fontSize: '1.25rem',
                            },
                          },
                        }}
                      >
                        <span>
                          {lead.description
                            ? lead.description.length > 15
                              ? `${lead.description.slice(0, 15)}...`
                              : lead.description
                            : '-'}
                        </span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{lead.fuelType || '-'}</TableCell>
                    <TableCell>{lead.vehicle_title || '-'}</TableCell>
                    <TableCell>
                      {lead.engin_capacity ? `${lead.engin_capacity}.0L` : '-'}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      {new Date(
                        lead.createdAt as unknown as string,
                      ).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                      <br />
                      {new Date(
                        lead.createdAt as unknown as string,
                      ).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
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
                        backgroundColor: theme.palette.warning.light || '#fff8e1',
                        zIndex: 3,
                        minWidth: NOTES_COL_WIDTH,
                        width: NOTES_COL_WIDTH,
                        padding: '12px 8px',
                        borderRight: `1px solid ${theme.palette.divider}`,
                        textAlign: 'center',
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
                        backgroundColor: theme.palette.warning.light || '#fff8e1',
                        zIndex: 3,
                        minWidth: STATUS_COL_WIDTH,
                        width: STATUS_COL_WIDTH,
                        maxWidth: STATUS_COL_WIDTH,
                        padding: '12px 8px',
                        borderRight: `1px solid ${theme.palette.divider}`,
                        overflow: 'visible',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.5,
                          alignItems: 'center',
                        }}
                      >
                        <Chip
                          label={lead.status || 'Unknown'}
                          color={getStatusColor(lead.status)}
                          size="small"
                        />
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{
                        position: 'sticky',
                        right: 0,
                        backgroundColor: theme.palette.warning.light || '#fff8e1',
                        zIndex: 3,
                        minWidth: ACTION_COL_WIDTH,
                        width: ACTION_COL_WIDTH,
                        maxWidth: ACTION_COL_WIDTH,
                        padding: '12px 8px',
                        overflow: 'visible',
                      }}
                    >
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {lead.wonByDealerId &&
                        lead.wonByDealerId !== currentDealerId ? (
                          <Typography
                            variant="caption"
                            color="error"
                            sx={{ fontStyle: 'italic' }}
                            title="This lead has been won by another dealer"
                          >
                            Won by other dealer
                          </Typography>
                        ) : (
                          <>
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => {
                                handleActionClick('info', lead);
                              }}
                              title="View Info"
                            >
                              <InfoIcon fontSize="small" />
                            </IconButton>

                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => {
                                handleActionClick('vehicle-details', lead);
                              }}
                              title={
                                lead.moreInfoFetched
                                  ? 'View Detailed Vehicle Information'
                                  : 'No Detailed Information Available'
                              }
                              disabled={!lead.moreInfoFetched}
                            >
                              <DashboardIcon
                                fontSize="small"
                                color={
                                  lead.moreInfoFetched ? 'primary' : 'disabled'
                                }
                              />
                            </IconButton>

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

                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => {
                                setSelectedLead(lead);
                                setOpenInvoiceDialog(true);
                              }}
                              title="Send Invoice"
                            >
                              <ReceiptLongIcon fontSize="small" />
                            </IconButton>

                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenChat(lead.id!)}
                              title="Chat"
                            >
                              <ChatIcon fontSize="small" />
                            </IconButton>

                            <IconButton
                              size="small"
                              onClick={(e) => {
                                setMenuAnchorEl(e.currentTarget);
                                setCurrentMenuLead(lead);
                              }}
                              title="More actions"
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* HQ Pagination */}
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
                value={hqRowsPerPage}
                onChange={(e) => setHqRowsPerPage(Number(e.target.value))}
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
              count={totalHqPages}
              page={hqPage}
              onChange={handleHqPageChange}
              color="primary"
              showFirstButton
              showLastButton
              siblingCount={1}
              boundaryCount={1}
              shape="rounded"
            />
          </Box>
        </Paper>
          </AccordionDetails>
        </Accordion>
      )}

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
        <MenuItem
          onClick={() => handleMenuAction('edit')}
          disabled={
            currentMenuLead?.wonByDealerId !== undefined &&
            currentMenuLead?.wonByDealerId !== null &&
            currentMenuLead?.wonByDealerId !== currentDealerId
          }
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => handleMenuAction('info')}
          disabled={
            currentMenuLead?.wonByDealerId !== undefined &&
            currentMenuLead?.wonByDealerId !== null &&
            currentMenuLead?.wonByDealerId !== currentDealerId
          }
        >
          <ListItemIcon>
            <InfoIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Info</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => handleMenuAction('fetch-info')}
          disabled={
            currentMenuLead?.moreInfoFetched === true ||
            (currentMenuLead?.wonByDealerId !== undefined &&
              currentMenuLead?.wonByDealerId !== null &&
              currentMenuLead?.wonByDealerId !== currentDealerId)
          }
        >
          <ListItemIcon>
            <AutoFixHighIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            {currentMenuLead?.moreInfoFetched
              ? 'Info Fetched'
              : 'Fetch More Info'}
          </ListItemText>
        </MenuItem>
        {/* WARN: DO NOT REMOVE THIS */}
        {/*<MenuItem
            onClick={() => handleMenuAction("chat")}
            disabled={
              currentMenuLead?.wonByDealerId !== undefined &&
              currentMenuLead?.wonByDealerId !== null &&
              currentMenuLead?.wonByDealerId !== currentProfileId
            }
          >*/}
        {/*<ListItemIcon>
              <ChatIcon fontSize="small" />
            </ListItemIcon>*/}
        {/*<ListItemText>Open Chat</ListItemText>*/}
        {/*</MenuItem>*/}
        {/* WARN: DO NOT REMOVE THIS */}
        <MenuItem
          onClick={() => handleMenuAction('invoice')}
          disabled={
            currentMenuLead?.wonByDealerId !== undefined &&
            currentMenuLead?.wonByDealerId !== null &&
            currentMenuLead?.wonByDealerId !== currentDealerId
          }
        >
          <ListItemIcon>
            <ReceiptLongIcon fontSize="small" color="warning" />
          </ListItemIcon>
          <ListItemText>Send Invoice</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => handleMenuAction('delete')}
          disabled={
            currentMenuLead?.wonByDealerId !== undefined &&
            currentMenuLead?.wonByDealerId !== null &&
            currentMenuLead?.wonByDealerId !== currentDealerId
          }
        >
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

      {/* Vehicle Details Dialog */}
      {selectedLead && (
        <VehicleDetailsDialog
          open={openVehicleDetailsDialog}
          onClose={() => setOpenVehicleDetailsDialog(false)}
          leadId={selectedLead.id ?? null}
          leadHasDetails={!!selectedLead.moreInfoFetched}
        />
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
