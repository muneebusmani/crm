'use client';
import {
  UserType,
  type Dealer,
  type DealerFlatData,
  type User,
} from '@crm/types';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FilterList as FilterListIcon,
  ImportExport as ImportExportIcon,
  Mail as MailIcon,
  MoreVert as MoreVertIcon,
  Phone as PhoneIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  type SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import axios from 'axios';
import Image from 'next/image';
import type React from 'react';
import { type ChangeEvent, useEffect, useState } from 'react';
import AddDealerDialog from './add-dealer-dialog';
import { get } from '@/lib/api';

type Dealers = User & { dealer: Dealer };

const Dealers = ({ token }: { token: string }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [dealers, setDealers] = useState<DealerFlatData[]>([]);
  const [selectedDealer, setSelectedDealer] = useState<DealerFlatData | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Name');
  const [page, setPage] = useState(1);
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<DealerFlatData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchDealers = async () => {
      try {
        setLoading(true);
        const data = await get<Dealers[]>(`/dealers`);
        console.log('Data ===>', data);
        // if (response) throw new Error(response.error);

        // flatten structure
        const flatData: DealerFlatData[] = data
          .filter((u) => u.type !== UserType.ADMIN)
          .map(
            (u): DealerFlatData => ({
              id: u.id,
              email: u.email,
              username: u.username,
              name: u.dealer?.name ?? '',
              owner: u.dealer?.owner ?? '',
              location: u.dealer?.location ?? '',
              logo: u.dealer?.logo ?? '',
              website: u.dealer?.website ?? '',
              contactEmail: u.dealer?.contactEmail ?? '',
              tierId: u.dealer?.tierId ?? undefined,
              tierName: u.dealer?.tier?.name ?? undefined,
              password: '', // required by type, default empty
              logoFile: null, // required by type, default null
            }),
          );
        setDealers(flatData);

        // Remove auto-selection of first dealer
        // if (flatData.length > 0) {
        //   setSelectedDealer(flatData[0]);
        // }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDealers();
  }, []);

  // Handle dealer addition
  const handleAddDealer = async (data: {
    name: string;
    email: string;
    username: string;
    password: string;
    owner: string;
    location: string;
    logo: string;
    logoFile: File | null;
    website: string;
    contactEmail: string;
    tierId?: number;
  }) => {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('username', data.username);
      formData.append('password', data.password);
      formData.append('owner', data.owner);
      formData.append('location', data.location);
      if (data.logo) formData.append('logo', data.logo);
      if (data.logoFile) formData.append('logoFile', data.logoFile); // actual file
      formData.append('website', data.website);
      formData.append('contactEmail', data.contactEmail);
      if (data.tierId) formData.append('tierId', data.tierId.toString());

      const { data: newDealer } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/dealers`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token} `,
          },
        },
      );

      // setDealers([...dealers, newDealer]);
      const flatDealer: DealerFlatData = {
        id: newDealer.id,
        email: newDealer.email,
        username: newDealer.username,
        name: newDealer.name ?? newDealer.dealer?.name ?? '',
        owner: newDealer.owner ?? newDealer.dealer?.owner ?? '',
        location: newDealer.location ?? newDealer.dealer?.location ?? '',
        logo: newDealer.logo ?? newDealer.dealer?.logo ?? '',
        website: newDealer.website ?? newDealer.dealer?.website ?? '',
        contactEmail:
          newDealer.contactEmail ?? newDealer.dealer?.contactEmail ?? '',
        tierId: newDealer.tierId ?? newDealer.dealer?.tierId ?? undefined,
        tierName:
          newDealer.tierName ?? newDealer.dealer?.tier?.name ?? undefined,
        password: '', // required by type, default empty
        logoFile: null, // required by type, default null
      };
      setDealers([...dealers, flatDealer]);
      setSelectedDealer(flatDealer);
      setOpen(false);
      setSelectedDealer(newDealer);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add dealer');
    }
  };

  // Handle dealer selection (only for checkbox selection)
  const handleSelectDealer = (dealer: DealerFlatData) => {
    setSelectedDealer(dealer);
  };

  // Handle view click
  const handleViewClick = (dealer: DealerFlatData) => {
    console.log('selected dealer:', dealer);
    setSelectedDealer(dealer);
    setShowDetails(true);
  };

  // Handle edit click
  const handleEditClick = (dealer: DealerFlatData) => {
    setIsEditing(true);
    setEditData(dealer);
    setSelectedDealer(dealer);
  };

  // Handle edit save
  const handleEditSave = async (data: {
    name?: string;
    email?: string;
    username?: string;
    password?: string | null;
    owner?: string;
    location?: string;
    logo?: string;
    logoFile?: File | null; // include actual file
    website?: string;
    contactEmail?: string;
    tierId?: number;
  }) => {
    try {
      if (!editData) return;

      const formData = new FormData();

      if (data.name) formData.append('name', data.name);
      if (data.email) formData.append('email', data.email);
      if (data.username) formData.append('username', data.username);
      if (data.owner) formData.append('owner', data.owner);
      if (data.location) formData.append('location', data.location);
      if (data.logo) formData.append('logo', data.logo);
      if (data.logoFile) formData.append('logoFile', data.logoFile); // actual file
      if (data.website) formData.append('website', data.website);
      if (data.contactEmail) formData.append('contactEmail', data.contactEmail);
      if (data.tierId) formData.append('tierId', data.tierId.toString());

      // Only append password if it's not empty
      if (data.password && data.password.trim() !== '') {
        formData.append('password', data.password);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/dealers/${editData.id}`,
        {
          method: 'PUT',
          body: formData, // send as FormData
        },
      );

      if (!response.ok) throw new Error('Failed to update dealer');

      const updatedDealer = await response.json();

      setDealers(
        dealers.map((d) => (d.id === updatedDealer.id ? updatedDealer : d)),
      );
      setSelectedDealer(updatedDealer);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update dealer');
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/dealers/${id}`,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) throw new Error('Failed to delete dealer');

      const updatedDealers = dealers.filter((dealer) => dealer.id !== id);
      setDealers(updatedDealers);

      if (selectedDealer?.id === id) {
        if (updatedDealers.length > 0) {
          setSelectedDealer(updatedDealers[0]);
        } else {
          setSelectedDealer(null);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete dealer');
    }
  };

  // Handle export to CSV
  const handleExportCSV = () => {
    if (dealers.length === 0) return;

    const headers = Object.keys(dealers[0]).join(',');
    const rows = dealers
      .map((dealer) =>
        Object.values(dealer)
          .map((value) => (typeof value === 'string' ? `"${value}"` : value))
          .join(','),
      )
      .join('\n');

    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'dealers.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter and sort dealers
  const filteredAndSorted = dealers
    .filter((dealer) => {
      const matchesSearch = searchTerm
        ? dealer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dealer.owner.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      const matchesLocation = locationFilter
        ? dealer.location.includes(locationFilter)
        : true;
      return matchesSearch && matchesLocation;
    })
    .sort((a, b) => {
      if (sortBy === 'Owner') return a.owner.localeCompare(b.owner);
      if (sortBy === 'Name') return a.name.localeCompare(b.name);
      return a.name.localeCompare(b.name);
    });

  // Pagination
  const itemsPerPage = 7;
  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);
  const paginatedData = filteredAndSorted.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  // Handle page change
  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // Handle search change
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  // Handle sort change
  const handleSortChange = (e: SelectChangeEvent<string>) => {
    setSortBy(e.target.value);
  };

  // Handle location filter change
  const handleLocationFilterChange = (e: SelectChangeEvent<string>) => {
    setLocationFilter(e.target.value);
    setPage(1);
  };

  // Get unique locations for filter dropdown
  const locations = Array.from(
    new Set(
      dealers
        .map((d) => {
          // Handle undefined or empty location
          const location = d.location || '';
          if (!location.trim()) return '';

          const parts = location.split(', ');
          return parts[parts.length - 1]; // Get country
        })
        .filter((location) => location !== ''), // Remove empty strings
    ),
  );

  if (loading) {
    return <Typography>Loading dealers...</Typography>;
  }

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  return (
    <Box sx={{ p: 5 }}>
      {/* Top Controls */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          color="primary"
          onClick={() => setOpen(true)}
          sx={{
            backgroundColor: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
          }}
        >
          Add Dealer
        </Button>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<FilterListIcon />}
            variant="outlined"
            color="error"
            sx={{
              borderColor: theme.palette.error.main,
              color: theme.palette.error.main,
              '&:hover': {
                backgroundColor: theme.palette.error.light,
              },
            }}
          >
            Filters
          </Button>
          <Button
            startIcon={<ImportExportIcon />}
            variant="outlined"
            color="success"
            onClick={handleExportCSV}
            sx={{
              borderColor: theme.palette.success.main,
              color: theme.palette.success.main,
              '&:hover': {
                backgroundColor: theme.palette.success.light,
              },
            }}
          >
            Export CSV
          </Button>
          <Button
            startIcon={<MoreVertIcon />}
            variant="outlined"
            color="info"
            sx={{
              borderColor: theme.palette.info.main,
              color: theme.palette.info.main,
              '&:hover': {
                backgroundColor: theme.palette.info.light,
              },
            }}
          >
            ...
          </Button>
        </Box>
      </Box>

      {/* Search and Filters */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <TextField
          placeholder="Search for dealer..."
          value={searchTerm}
          onChange={handleSearchChange}
          variant="outlined"
          size="small"
          slotProps={{
            input: {
              startAdornment: (
                <Box sx={{ mr: 1, display: 'flex' }}>
                  <SearchIcon />
                </Box>
              ),
            },
          }}
          sx={{
            width: 300,
            '& .MuiOutlinedInput-root': {
              fieldset: {
                borderColor: theme.palette.divider,
              },
              '&:hover fieldset': {
                borderColor: theme.palette.primary.main,
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main,
              },
            },
          }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Location</InputLabel>
            <Select
              value={locationFilter}
              onChange={handleLocationFilterChange}
              label="Location"
              sx={{
                '& .MuiOutlinedInput-root': {
                  fieldset: {
                    borderColor: theme.palette.divider,
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                },
              }}
            >
              <MenuItem value="">All Locations</MenuItem>
              {locations.map((location) => (
                <MenuItem key={location} value={location}>
                  {location}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color={theme.palette.text.secondary}>
              Sort by:
            </Typography>
            <Select
              value={sortBy}
              onChange={handleSortChange}
              variant="outlined"
              size="small"
              sx={{
                minWidth: 150,
                '& .MuiOutlinedInput-root': {
                  fieldset: {
                    borderColor: theme.palette.divider,
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                },
              }}
            >
              <MenuItem value="Name">Name</MenuItem>
              <MenuItem value="Owner">Owner</MenuItem>
            </Select>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Table */}
        <Box flex={1}>
          {dealers.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: 400,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                p: 3,
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                No dealers found
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ mb: 3, textAlign: 'center' }}
              >
                Get started by adding your first dealer
              </Typography>
              <Button
                startIcon={<AddIcon />}
                variant="contained"
                color="primary"
                onClick={() => setOpen(true)}
              >
                Add Dealer
              </Button>
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} elevation={2}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox" />
                      <TableCell>Dealer Name</TableCell>
                      <TableCell>Owner</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  {/* <TableBody> */}
                  {/*   {paginatedData.map((dealer) => ( */}
                  {/*     <TableRow */}
                  {/*       key={dealer.id} */}
                  {/*       hover */}
                  {/*       // Remove the onClick handler from the row to prevent selection on click */}
                  {/*       sx={{ */}
                  {/*         cursor: "pointer", */}
                  {/*         "&:hover": { */}
                  {/*           backgroundColor: theme.palette.action.hover, */}
                  {/*         }, */}
                  {/*         "&.Mui-selected": { */}
                  {/*           backgroundColor: theme.palette.action.selected, */}
                  {/*         }, */}
                  {/*       }} */}
                  {/*     > */}
                  {/*       <TableCell padding="checkbox"> */}
                  {/*         <Checkbox */}
                  {/*           checked={selectedDealer?.id === dealer.id} */}
                  {/*           onChange={(e) => { */}
                  {/*             e.stopPropagation(); */}
                  {/*             if (e.target.checked) { */}
                  {/*               handleSelectDealer(dealer); */}
                  {/*             } else { */}
                  {/*               setSelectedDealer(null); */}
                  {/*             } */}
                  {/*           }} */}
                  {/*           onClick={(e) => { */}
                  {/*             e.stopPropagation(); */}
                  {/*           }} */}
                  {/*         /> */}
                  {/*       </TableCell> */}
                  {/*       <TableCell> */}
                  {/*         <Box */}
                  {/*           sx={{ */}
                  {/*             display: "flex", */}
                  {/*             alignItems: "center", */}
                  {/*             gap: 1, */}
                  {/*           }} */}
                  {/*         > */}
                  {/*           <Box */}
                  {/*             sx={{ */}
                  {/*               width: 24, */}
                  {/*               height: 24, */}
                  {/*               position: "relative", */}
                  {/*             }} */}
                  {/*           > */}
                  {/*             <Image */}
                  {/*               src={dealer?.logo} */}
                  {/*               alt={dealer.name} */}
                  {/*               width={24} */}
                  {/*               height={24} */}
                  {/*               style={{ borderRadius: "50%" }} */}
                  {/*             /> */}
                  {/*           </Box> */}
                  {/*           <Typography>{dealer.name}</Typography> */}
                  {/*         </Box> */}
                  {/*       </TableCell> */}
                  {/*       <TableCell>{dealer.owner}</TableCell> */}
                  {/*       <TableCell>{dealer.location}</TableCell> */}
                  {/*       <TableCell> */}
                  {/*         <Box sx={{ display: "flex", gap: 1 }}> */}
                  {/*           <Tooltip title="Call"> */}
                  {/*             <IconButton size="small" color="primary"> */}
                  {/*               <PhoneIcon /> */}
                  {/*             </IconButton> */}
                  {/*           </Tooltip> */}
                  {/*           <Tooltip title="Chat"> */}
                  {/*             <IconButton size="small" color="primary"> */}
                  {/*               <MailIcon /> */}
                  {/*             </IconButton> */}
                  {/*           </Tooltip> */}
                  {/*           <Tooltip title="View"> */}
                  {/*             <IconButton */}
                  {/*               size="small" */}
                  {/*               color="primary" */}
                  {/*               onClick={(e) => { */}
                  {/*                 e.stopPropagation(); */}
                  {/*                 handleViewClick(dealer); */}
                  {/*               }} */}
                  {/*             > */}
                  {/*               <VisibilityIcon /> */}
                  {/*             </IconButton> */}
                  {/*           </Tooltip> */}
                  {/*           <Tooltip title="Edit"> */}
                  {/*             <IconButton */}
                  {/*               size="small" */}
                  {/*               color="primary" */}
                  {/*               onClick={(e) => { */}
                  {/*                 e.stopPropagation(); */}
                  {/*                 handleEditClick(dealer); */}
                  {/*               }} */}
                  {/*             > */}
                  {/*               <EditIcon /> */}
                  {/*             </IconButton> */}
                  {/*           </Tooltip> */}
                  {/*           <Tooltip title="Delete"> */}
                  {/*             <IconButton */}
                  {/*               size="small" */}
                  {/*               color="error" */}
                  {/*               onClick={(e) => { */}
                  {/*                 e.stopPropagation(); */}
                  {/*                 handleDelete(dealer.id); */}
                  {/*               }} */}
                  {/*             > */}
                  {/*               <DeleteIcon /> */}
                  {/*             </IconButton> */}
                  {/*           </Tooltip> */}
                  {/*         </Box> */}
                  {/*       </TableCell> */}
                  {/*     </TableRow> */}
                  {/*   ))} */}
                  {/* </TableBody> */}
                  <TableBody>
                    {paginatedData.map((dealer) => (
                      <TableRow
                        key={dealer.id}
                        hover
                        sx={{
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: theme.palette.action.hover,
                          },
                          '&.Mui-selected': {
                            backgroundColor: theme.palette.action.selected,
                          },
                        }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedDealer?.id === dealer.id}
                            onChange={(e) => {
                              e.stopPropagation();
                              if (e.target.checked) {
                                handleSelectDealer(dealer);
                              } else {
                                setSelectedDealer(null);
                              }
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                position: 'relative',
                              }}
                            >
                              <Image
                                src={
                                  dealer.logo ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(dealer.name || dealer.owner || 'John Doe')}&background=3f51b5&color=ffffff&type=png`
                                }
                                alt={dealer.name}
                                width={24}
                                height={24}
                                style={{ borderRadius: '50%' }}
                              />
                            </Box>
                            <Typography>{dealer.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{dealer.owner}</TableCell>
                        <TableCell>{dealer.location}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Call">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <PhoneIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Chat">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MailIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="View">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewClick(dealer);
                                }}
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditClick(dealer);
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(dealer.id as number);
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
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
                  justifyContent: 'flex-end',
                  mt: 2,
                  gap: 1,
                }}
              >
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  siblingCount={1}
                  boundaryCount={1}
                />
              </Box>
            </>
          )}
        </Box>

        {/* Sidebar */}
        {selectedDealer && showDetails && (
          <Box
            sx={{
              width: 300,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              p: 3,
              bgcolor: theme.palette.background.paper,
              boxShadow: theme.shadows[2],
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  position: 'relative',
                  margin: '0 auto 8px',
                }}
              >
                <Image
                  src={
                    selectedDealer.logo ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedDealer.name || selectedDealer.owner || 'John Doe')}&background=3f51b5&color=ffffff&type=png`
                  }
                  alt={selectedDealer.name}
                  width={60}
                  height={60}
                  style={{ borderRadius: '50%' }}
                />
              </Box>
              <Typography variant="h6">{selectedDealer.name}</Typography>
              <Typography
                variant="subtitle2"
                color={theme.palette.text.secondary}
              >
                {selectedDealer.owner}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 1,
                  mt: 2,
                }}
              >
                <IconButton size="small" color="primary">
                  <VisibilityIcon />
                </IconButton>
                <IconButton size="small" color="secondary">
                  <MailIcon />
                </IconButton>
                <IconButton size="small" color="info">
                  <PhoneIcon />
                </IconButton>
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle2"
                color={theme.palette.text.primary}
              >
                DEALER INFORMATION
              </Typography>
              <Typography
                variant="body2"
                color={theme.palette.text.secondary}
                sx={{ mt: 1 }}
              >
                Authorized dealer with verified credentials and business
                license.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography
                  variant="body2"
                  color={theme.palette.text.secondary}
                >
                  Location
                </Typography>
                <Typography variant="body2">
                  {selectedDealer.location}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography
                  variant="body2"
                  color={theme.palette.text.secondary}
                >
                  Website
                </Typography>
                <Typography
                  variant="body2"
                  component="a"
                  href={`http://${selectedDealer.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  color="primary"
                >
                  {selectedDealer.website}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography
                  variant="body2"
                  color={theme.palette.text.secondary}
                >
                  Contact Email
                </Typography>
                <Typography variant="body2">
                  {selectedDealer.contactEmail}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography
                  variant="body2"
                  color={theme.palette.text.secondary}
                >
                  Tier
                </Typography>
                <Typography variant="body2">
                  {selectedDealer.tierId
                    ? `Tier ${selectedDealer.tierId}`
                    : 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {/* Add/Edit Dealer Dialog */}
      <AddDealerDialog
        open={open || isEditing}
        onClose={() => {
          setOpen(false);
          setIsEditing(false);
        }}
        onSubmit={isEditing ? handleEditSave : handleAddDealer}
        initialData={isEditing && editData ? editData : undefined}
        isEditing={isEditing}
      />
    </Box>
  );
};

export default Dealers;
