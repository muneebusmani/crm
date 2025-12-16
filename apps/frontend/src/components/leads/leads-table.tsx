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
  CircularProgress,
  IconButton,
  InputBase,
  Pagination,
  Paper,
  Skeleton,
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
import { alpha } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useRouter, useSearchParams } from 'next/navigation'; // ✅ App Router hook
import { useEffect, useState, useCallback, useRef } from 'react';
import { socketService } from '@/services/socket.service';
import LeadEditDialog from './lead-edit-dialog';
import LeadEmailDialog from './lead-email-dialog';
import LeadInfoDialog from './lead-info-dialog';
import VehicleDetailsDialog from './vehicle-details-dialog';
import SendInvoiceDialog from './send-invoice-dialog';
import SendQuotationDialog from './send-quotation-dialog';
import LeadNotesPanel from '../LeadNotesPanel';
import { get, post, post2 } from '@/lib/api';

const HighlightText = ({
  text,
  highlight,
}: {
  text: string;
  highlight: string;
}) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  const regex = new RegExp(
    `(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
    'gi',
  );
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: <index is stable>
            key={i}
            style={{
              backgroundColor: '#fff59d', // Light yellow
              color: 'black',
              fontWeight: 'bold',
              borderRadius: '2px',
              padding: '0 2px',
            }}
          >
            {part}
          </span>
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: <index is stable>
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  );
};

const TruncatedCell = ({
  text,
  highlight = '',
  limit = 10,
}: {
  text: string;
  highlight?: string;
  limit?: number;
}) => {
  if (!text || text === '-') return <span>-</span>;

  const shouldTruncate = text.length > limit;
  const displayText = shouldTruncate ? `${text.substring(0, limit)}...` : text;

  return (
    <Tooltip title={text} placement="top">
      <span>
        <HighlightText text={displayText} highlight={highlight} />
      </span>
    </Tooltip>
  );
};

// Skeleton rows for table loading state
const TableSkeletonRows = ({
  rows = 5,
  columns = 9,
}: {
  rows?: number;
  columns?: number;
}) => (
  <>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <TableRow key={`skeleton-row-${rowIndex}`}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <TableCell key={`skeleton-cell-${rowIndex}-${colIndex}`}>
            <Skeleton variant="text" width="80%" height={24} />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
);

const LeadsTable: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const handleOpenChat = (leadId: number) => {
    router.push(`/dealer/messages?leadId=${leadId}`);
  };

  const theme = useTheme();
  const ACTION_COL_WIDTH = 160; // Reduced from 180 to decrease space between status and actions
  const STATUS_COL_WIDTH = 100;
  const NOTES_COL_WIDTH = 150;
  const TABLE_MIN_WIDTH = 2400;
  const [leads, setLeads] = useState<Lead[]>([]);
  const [hqLeads, setHqLeads] = useState<Lead[]>([]); // Separate state for assigned HQ leads
  const [hqQuota, setHqQuota] = useState<{
    canAssign: boolean;
    assignedCount: number;
    dailyLimit: number;
  } | null>(null);
  const [regularSearchTerm, setRegularSearchTerm] = useState('');
  const [hqSearchTerm, setHqSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [hqPage, setHqPage] = useState(1);
  const [hqRowsPerPage, setHqRowsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [regularLeadsExpanded, setRegularLeadsExpanded] = useState(true);
  const [hqLeadsExpanded, setHqLeadsExpanded] = useState(true);

  // Separate loading states for each table
  const [loading, setLoading] = useState(true); // Initial page load
  const [leadsLoading, setLeadsLoading] = useState(false); // Regular leads table loading
  const [hqLeadsLoading, setHqLeadsLoading] = useState(false); // HQ leads table loading

  // Server-side pagination state for regular leads
  const [serverTotalLeads, setServerTotalLeads] = useState(0);
  const [serverTotalPages, setServerTotalPages] = useState(0);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Server-side pagination state for HQ leads
  const [hqServerTotalLeads, setHqServerTotalLeads] = useState(0);
  const [hqServerTotalPages, setHqServerTotalPages] = useState(0);
  const [debouncedHqSearchTerm, setDebouncedHqSearchTerm] = useState('');
  // Track if HQ leads section should be visible (set once on initial load if dealer has HQ access)
  const [showHqSection, setShowHqSection] = useState(false);

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

  // Fetch leads from API with server-side pagination
  const fetchLeads = useCallback(
    async (
      pageNum: number = page,
      limitNum: number = rowsPerPage,
      search: string = debouncedSearchTerm,
      isInitialLoad: boolean = false,
    ) => {
      // Use global loading only for initial load, table-specific loading otherwise
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setLeadsLoading(true);
      }
      try {
        const params = new URLSearchParams();
        params.set('page', pageNum.toString());
        params.set('limit', limitNum.toString());
        if (search) {
          params.set('search', search);
        }

        const res = await fetch(`/api/leads?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch leads');

        const response = await res.json();

        // Handle paginated response
        if (response.data && Array.isArray(response.data)) {
          setLeads(response.data);
          setServerTotalLeads(response.total || 0);
          setServerTotalPages(response.totalPages || 0);
        } else if (Array.isArray(response)) {
          // Fallback for backward compatibility
          const sortedLeads = response.sort(
            (a: Lead, b: Lead) =>
              new Date(b.createdAt as unknown as Date).getTime() -
              new Date(a.createdAt as unknown as Date).getTime(),
          );
          setLeads(sortedLeads.filter((lead: Lead) => !lead.isHqLead));
          setServerTotalLeads(sortedLeads.length);
          setServerTotalPages(Math.ceil(sortedLeads.length / limitNum));
        }
      } catch (error) {
        setSnackbar({
          open: true,
          message:
            error instanceof Error ? error.message : 'Failed to fetch leads',
          severity: 'error',
        });
      } finally {
        if (isInitialLoad) {
          setLoading(false);
        } else {
          setLeadsLoading(false);
        }
      }
    },
    [page, rowsPerPage, debouncedSearchTerm],
  );

  // Fetch HQ leads assigned to this dealer with server-side pagination
  const fetchHqLeads = useCallback(
    async (
      pageNum: number = hqPage,
      limitNum: number = hqRowsPerPage,
      search: string = debouncedHqSearchTerm,
      isInitialLoad: boolean = false,
    ) => {
      if (!isInitialLoad) {
        setHqLeadsLoading(true);
      }
      try {
        const params = new URLSearchParams();
        params.set('page', pageNum.toString());
        params.set('limit', limitNum.toString());
        if (search) {
          params.set('search', search);
        }

        const res = await fetch(`/api/leads/hq/my-leads?${params.toString()}`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to fetch HQ leads');

        const response = await res.json();

        // Handle paginated response
        if (response.data && Array.isArray(response.data)) {
          setHqLeads(response.data);
          setHqServerTotalLeads(response.total || 0);
          setHqServerTotalPages(response.totalPages || 0);
          // Show HQ section once we've successfully loaded HQ leads (even if 0 results due to search)
          if (isInitialLoad && response.total > 0) {
            setShowHqSection(true);
          }
        } else if (Array.isArray(response)) {
          // Fallback for backward compatibility
          const sortedHqLeads = response.sort(
            (a: Lead, b: Lead) =>
              new Date(b.createdAt as unknown as Date).getTime() -
              new Date(a.createdAt as unknown as Date).getTime(),
          );
          setHqLeads(sortedHqLeads);
          setHqServerTotalLeads(sortedHqLeads.length);
          setHqServerTotalPages(Math.ceil(sortedHqLeads.length / limitNum));
          // Show HQ section if dealer has any HQ leads
          if (isInitialLoad && sortedHqLeads.length > 0) {
            setShowHqSection(true);
          }
        }
      } catch (error) {
        console.error('Failed to fetch HQ leads:', error);
        // Don't show error for HQ leads if dealer has no access
      } finally {
        if (!isInitialLoad) {
          setHqLeadsLoading(false);
        }
      }
    },
    [hqPage, hqRowsPerPage, debouncedHqSearchTerm],
  );

  // Fetch HQ quota status
  const fetchHqQuota = async () => {
    try {
      const res = await fetch('/api/leads/hq/my-quota', {
        credentials: 'include',
      });
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
  // biome-ignore lint/correctness/useExhaustiveDependencies: Initial load only
  useEffect(() => {
    fetchLeads(1, rowsPerPage, '', true); // isInitialLoad = true
    fetchHqLeads(1, hqRowsPerPage, '', true); // isInitialLoad = true
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

  // For regular leads, we use server-side filtering - leads state already contains filtered results
  // Just use leads directly as currentLeads

  // For regular leads, we use server-side filtering - leads state already contains filtered results
  // Just use leads directly as currentLeads

  // For HQ leads, server now returns paginated data directly - no client-side filtering needed
  // The hqLeads state already contains the current page results from server

  // For regular leads, server returns current page data directly
  const currentLeads = leads;

  // For HQ leads, server returns current page data directly
  const currentHqLeads = hqLeads;

  // totalPages for regular leads comes from server
  const totalPages = serverTotalPages;
  // totalHqPages for HQ leads comes from server
  const totalHqPages = hqServerTotalPages;

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
                previews.set(lead.id!, latestNote.content);
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
          newPreviews.set(leadId, latestNote.content);
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

  // Debounced search handler for regular leads
  const handleRegularSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    setRegularSearchTerm(value);

    // Debounce the search - wait 300ms before triggering API call
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(value);
      setPage(1); // Reset to first page on search
      fetchLeads(1, rowsPerPage, value);
    }, 300);
  };

  // Track ref for debouncing
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hqSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search handler for HQ leads
  const handleHqSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHqSearchTerm(value);

    // Debounce the search - wait 300ms before triggering API call
    if (hqSearchTimeoutRef.current) {
      clearTimeout(hqSearchTimeoutRef.current);
    }
    hqSearchTimeoutRef.current = setTimeout(() => {
      setDebouncedHqSearchTerm(value);
      setHqPage(1); // Reset to first page on search
      fetchHqLeads(1, hqRowsPerPage, value);
    }, 300);
  };

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    setPage(value);
    fetchLeads(value, rowsPerPage, debouncedSearchTerm);
  };

  const handleHqPageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    setHqPage(value);
    fetchHqLeads(value, hqRowsPerPage, debouncedHqSearchTerm);
  };

  // Handler for rows-per-page change - resets to page 1 and refetches
  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1); // Always reset to page 1 when changing rows per page
    fetchLeads(1, newRowsPerPage, debouncedSearchTerm);
  };

  // Handler for HQ rows-per-page change - resets to page 1 and refetches
  const handleHqRowsPerPageChange = (newRowsPerPage: number) => {
    setHqRowsPerPage(newRowsPerPage);
    setHqPage(1); // Always reset to page 1 when changing rows per page
    fetchHqLeads(1, newRowsPerPage, debouncedHqSearchTerm);
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
      {/* Regular Leads Accordion */}
      <Accordion
        expanded={regularLeadsExpanded}
        onChange={() => setRegularLeadsExpanded(!regularLeadsExpanded)}
        sx={{ mb: 2 }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            backgroundColor: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              width: '100%',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                color: theme.palette.primary.contrastText,
              }}
            >
              Regular Leads
            </Typography>
            <Chip
              label={`${serverTotalLeads} Total`}
              color="primary"
              size="small"
            />
            <Box
              onClick={(e) => e.stopPropagation()}
              sx={{ ml: 'auto', mr: 2 }}
            >
              <InputBase
                placeholder="Search Regular Leads..."
                value={regularSearchTerm}
                onChange={handleRegularSearchChange}
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
                  backgroundColor: theme.palette.background.paper,
                  '& input': { padding: '0 !important' },
                }}
              />
            </Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          <Paper elevation={0} sx={{ overflow: 'hidden' }}>
            {/* Table */}
            <TableContainer sx={{}}>
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
                  '& th:nth-of-type(4), & td:nth-of-type(4)': {
                    minWidth: 140,
                    textAlign: 'center',
                  }, // Received at
                  '& th:nth-of-type(5), & td:nth-of-type(5)': { minWidth: 160 }, // VRM
                  '& th:nth-of-type(6), & td:nth-of-type(6)': { minWidth: 120 }, // Post Code
                  '& th:nth-of-type(7), & td:nth-of-type(7)': { minWidth: 120 }, // Make
                  '& th:nth-of-type(8), & td:nth-of-type(8)': { minWidth: 120 }, // Model
                  '& th:nth-of-type(9), & td:nth-of-type(9)': {
                    minWidth: 60,
                    textAlign: 'center',
                  }, // Year
                  '& th:nth-of-type(10), & td:nth-of-type(10)': {
                    minWidth: 200,
                  }, // Customer Notes
                  '& th:nth-of-type(11), & td:nth-of-type(11)': {
                    minWidth: 90,
                    textAlign: 'center',
                  }, // Fuel Type
                  '& th:nth-of-type(12), & td:nth-of-type(12)': {
                    minWidth: 90,
                    textAlign: 'center',
                  }, // Engine Title
                  '& th:nth-of-type(13), & td:nth-of-type(13)': {
                    minWidth: 90,
                    textAlign: 'center',
                  }, // Engine Capacity
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
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Received at
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
                        borderLeft: `1px solid ${theme.palette.divider}`,
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
                  {leadsLoading ? (
                    <TableSkeletonRows rows={rowsPerPage} columns={9} />
                  ) : currentLeads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          {debouncedSearchTerm
                            ? `No leads found matching "${debouncedSearchTerm}"`
                            : 'No leads available'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <Typography>
                            <TruncatedCell
                              text={lead.name || '-'}
                              highlight={regularSearchTerm}
                            />
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {lead.email ? (
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                              }}
                            >
                              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                                <TruncatedCell
                                  text={lead.email}
                                  highlight={regularSearchTerm}
                                />
                              </Box>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  (window.location.href = `mailto:${lead.email}`)
                                }
                                sx={{
                                  color: 'info.main',
                                  p: 0.5,
                                  ml: 'auto',
                                  flexShrink: 0,
                                }}
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
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                              }}
                            >
                              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                                <TruncatedCell text={lead.number} />
                              </Box>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  window.open(
                                    `https://wa.me/${lead.number.replace(/\D/g, '')}`,
                                    '_blank',
                                  )
                                }
                                sx={{
                                  color: 'success.main',
                                  p: 0.5,
                                  ml: 'auto',
                                  flexShrink: 0,
                                }}
                              >
                                <WhatsAppIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          ) : (
                            '-'
                          )}
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
                        <TableCell>
                          <TruncatedCell
                            text={
                              (
                                lead.vehicle_vrm?.toUpperCase().trim() || '-'
                              ).replace(/\s+/g, '') || '-'
                            }
                            highlight={regularSearchTerm}
                          />
                        </TableCell>
                        <TableCell>
                          <TruncatedCell
                            text={
                              (
                                lead.postcode?.toUpperCase().trim() || '-'
                              ).replace(/\s+/g, '') || '-'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <TruncatedCell text={lead.vehicle_brand || '-'} />
                        </TableCell>
                        <TableCell>
                          <TruncatedCell
                            text={
                              lead.vehicle_model || lead.vehicle_series || '-'
                            }
                            highlight={regularSearchTerm}
                          />
                        </TableCell>
                        <TableCell>
                          <TruncatedCell text={lead.vehicle_reg || '-'} />
                        </TableCell>
                        <TableCell>
                          <TruncatedCell text={lead.description || '-'} />
                        </TableCell>
                        <TableCell>
                          <TruncatedCell text={lead.fuelType || '-'} />
                        </TableCell>
                        <TableCell>
                          <TruncatedCell text={lead.vehicle_title || '-'} />
                        </TableCell>
                        <TableCell>
                          <TruncatedCell
                            text={
                              lead.engin_capacity
                                ? `${lead.engin_capacity}.0L`
                                : '-'
                            }
                          />
                        </TableCell>
                        <TableCell
                          onClick={() => {
                            setSelectedLeadForNotes(lead);
                            setOpenNotesDialog(true);
                          }}
                          sx={{
                            cursor: 'pointer',
                            // '&:hover': {
                            //   backgroundColor: theme.palette.action.hover,
                            // },
                            position: 'sticky',
                            right: ACTION_COL_WIDTH + STATUS_COL_WIDTH,
                            backgroundColor: theme.palette.background.paper,
                            zIndex: 3,
                            minWidth: NOTES_COL_WIDTH,
                            width: NOTES_COL_WIDTH,
                            padding: '12px 8px',
                            borderRight: `1px solid ${theme.palette.divider}`,
                            borderLeft: `1px solid ${theme.palette.divider}`,
                            textAlign: 'center',
                          }}
                        >
                          <Tooltip
                            title={notePreviews.get(lead.id!) || ''}
                            placement="top"
                          >
                            <Typography variant="body2" color="primary">
                              {notePreviews.get(lead.id!)
                                ? notePreviews.get(lead.id!) === '...'
                                  ? '...'
                                  : notePreviews.get(lead.id!)!.length > 5
                                    ? `${notePreviews.get(lead.id!)!.substring(0, 5)}...`
                                    : notePreviews.get(lead.id!)
                                : '...'}
                            </Typography>
                          </Tooltip>
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
                          <Box
                            sx={{
                              display: 'flex',
                              gap: 1,
                              alignItems: 'center',
                            }}
                          >
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
                                      lead.moreInfoFetched
                                        ? 'primary'
                                        : 'disabled'
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
                    ))
                  )}
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
                  onChange={(e) =>
                    handleRowsPerPageChange(Number(e.target.value))
                  }
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

      {/* HQ Leads Accordion - shown if dealer has HQ leads access (determined on initial load) */}
      {showHqSection && (
        <Accordion
          expanded={hqLeadsExpanded}
          onChange={() => setHqLeadsExpanded(!hqLeadsExpanded)}
        >
          <AccordionSummary
            expandIcon={
              <ExpandMoreIcon sx={{ color: theme.palette.common.white }} />
            }
            sx={{
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                width: '100%',
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 'bold', color: theme.palette.common.white }}
              >
                HQ Leads
              </Typography>
              <Chip
                label={`${hqServerTotalLeads} Total`}
                color="default"
                size="small"
                sx={{
                  fontWeight: 'bold',
                  backgroundColor: alpha(theme.palette.common.white, 0.3),
                  color: theme.palette.common.white,
                }}
              />
              <Box
                onClick={(e) => e.stopPropagation()}
                sx={{ ml: 'auto', mr: 2 }}
              >
                <InputBase
                  placeholder="Search HQ Leads..."
                  value={hqSearchTerm}
                  onChange={handleHqSearchChange}
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
                    backgroundColor: theme.palette.background.paper,
                    '& input': { padding: '0 !important' },
                  }}
                />
              </Box>
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
                    '& th:nth-of-type(1), & td:nth-of-type(1)': {
                      minWidth: 180,
                    }, // Name
                    '& th:nth-of-type(2), & td:nth-of-type(2)': {
                      minWidth: 240,
                    }, // Email
                    '& th:nth-of-type(3), & td:nth-of-type(3)': {
                      minWidth: 160,
                    }, // Phone
                    '& th:nth-of-type(4), & td:nth-of-type(4)': {
                      minWidth: 140,
                      textAlign: 'center',
                    }, // Received at
                    '& th:nth-of-type(5), & td:nth-of-type(5)': {
                      minWidth: 140,
                    }, // VRM
                    '& th:nth-of-type(6), & td:nth-of-type(6)': {
                      minWidth: 140,
                    }, // Post Code
                    '& th:nth-of-type(7), & td:nth-of-type(7)': {
                      minWidth: 140,
                    }, // Make
                    '& th:nth-of-type(8), & td:nth-of-type(8)': {
                      minWidth: 160,
                    }, // Model
                    '& th:nth-of-type(9), & td:nth-of-type(9)': {
                      minWidth: 100,
                    }, // Year
                    '& th:nth-of-type(10), & td:nth-of-type(10)': {
                      minWidth: 180,
                      textAlign: 'center',
                    }, // Customer Notes
                    '& th:nth-of-type(11), & td:nth-of-type(11)': {
                      minWidth: 140,
                    }, // Fuel Type
                    '& th:nth-of-type(12), & td:nth-of-type(12)': {
                      minWidth: 140,
                      textAlign: 'center',
                    }, // Engine Title
                    '& th:nth-of-type(13), & td:nth-of-type(13)': {
                      minWidth: 90,
                      textAlign: 'center',
                    }, // Engine Capacity
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
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Received at
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
                          borderLeft: `1px solid ${theme.palette.divider}`,
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
                    {hqLeadsLoading ? (
                      <TableSkeletonRows rows={hqRowsPerPage} columns={9} />
                    ) : currentHqLeads.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                          <Typography variant="body1" color="text.secondary">
                            {debouncedHqSearchTerm
                              ? `No HQ leads found matching "${debouncedHqSearchTerm}"`
                              : 'No HQ leads available'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentHqLeads.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell>
                            <Typography>
                              <TruncatedCell
                                text={lead.name || '-'}
                                highlight={hqSearchTerm}
                              />
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {lead.email ? (
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                }}
                              >
                                <Box sx={{ flex: 1, overflow: 'hidden' }}>
                                  <TruncatedCell
                                    text={lead.email}
                                    highlight={hqSearchTerm}
                                  />
                                </Box>
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    (window.location.href = `mailto:${lead.email}`)
                                  }
                                  sx={{
                                    color: 'info.main',
                                    p: 0.5,
                                    ml: 'auto',
                                    flexShrink: 0,
                                  }}
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
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                }}
                              >
                                <Box sx={{ flex: 1, overflow: 'hidden' }}>
                                  <TruncatedCell text={lead.number} />
                                </Box>
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    window.open(
                                      `https://wa.me/${lead.number.replace(/\D/g, '')}`,
                                      '_blank',
                                    )
                                  }
                                  sx={{
                                    color: 'success.main',
                                    p: 0.5,
                                    ml: 'auto',
                                    flexShrink: 0,
                                  }}
                                >
                                  <WhatsAppIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            ) : (
                              '-'
                            )}
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
                          <TableCell>
                            <TruncatedCell
                              text={
                                (
                                  lead.vehicle_vrm?.toUpperCase().trim() || '-'
                                ).replace(/\s+/g, '') || '-'
                              }
                              highlight={hqSearchTerm}
                            />
                          </TableCell>
                          <TableCell>
                            <TruncatedCell
                              text={
                                (
                                  lead.postcode?.toUpperCase().trim() || '-'
                                ).replace(/\s+/g, '') || '-'
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <TruncatedCell text={lead.vehicle_brand || '-'} />
                          </TableCell>
                          <TableCell>
                            <TruncatedCell
                              text={
                                lead.vehicle_model || lead.vehicle_series || '-'
                              }
                              highlight={hqSearchTerm}
                            />
                          </TableCell>
                          <TableCell>
                            <TruncatedCell text={lead.vehicle_reg || '-'} />
                          </TableCell>
                          <TableCell>
                            <TruncatedCell text={lead.description || '-'} />
                          </TableCell>
                          <TableCell>
                            <TruncatedCell text={lead.fuelType || '-'} />
                          </TableCell>
                          <TableCell>
                            <TruncatedCell text={lead.vehicle_title || '-'} />
                          </TableCell>
                          <TableCell>
                            <TruncatedCell
                              text={
                                lead.engin_capacity
                                  ? `${lead.engin_capacity}.0L`
                                  : '-'
                              }
                            />
                          </TableCell>
                          <TableCell
                            onClick={() => {
                              setSelectedLeadForNotes(lead);
                              setOpenNotesDialog(true);
                            }}
                            sx={{
                              cursor: 'pointer',
                              // '&:hover': {
                              //   backgroundColor: theme.palette.action.hover,
                              // },
                              position: 'sticky',
                              right: ACTION_COL_WIDTH + STATUS_COL_WIDTH,
                              backgroundColor: theme.palette.background.paper,
                              zIndex: 3,
                              minWidth: NOTES_COL_WIDTH,
                              width: NOTES_COL_WIDTH,
                              padding: '12px 8px',
                              borderRight: `1px solid ${theme.palette.divider}`,
                              borderLeft: `1px solid ${theme.palette.divider}`,
                              textAlign: 'center',
                            }}
                          >
                            <Tooltip
                              title={notePreviews.get(lead.id!) || ''}
                              placement="top"
                            >
                              <Typography variant="body2" color="primary">
                                {notePreviews.get(lead.id!)
                                  ? notePreviews.get(lead.id!) === '...'
                                    ? '...'
                                    : notePreviews.get(lead.id!)!.length > 5
                                      ? `${notePreviews.get(lead.id!)!.substring(0, 5)}...`
                                      : notePreviews.get(lead.id!)
                                  : '...'}
                              </Typography>
                            </Tooltip>
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
                            <Box
                              sx={{
                                display: 'flex',
                                gap: 1,
                                alignItems: 'center',
                              }}
                            >
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
                                      handleActionClick(
                                        'vehicle-details',
                                        lead,
                                      );
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
                                        lead.moreInfoFetched
                                          ? 'primary'
                                          : 'disabled'
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
                      ))
                    )}
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
                    onChange={(e) =>
                      handleHqRowsPerPageChange(Number(e.target.value))
                    }
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
