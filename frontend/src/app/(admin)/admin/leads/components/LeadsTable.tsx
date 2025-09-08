"use client"

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  InputBase,
  Button,
  TextField,
  Pagination,
  Checkbox,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CallIcon from '@mui/icons-material/Call';
import MessageIcon from '@mui/icons-material/Message';
import InfoIcon from '@mui/icons-material/Info';

// Define types
interface Lead {
  id: number;
  name: string;
  company: string;
  score: number;
  phone: string;
  location: string;
  tags: string[];
  createDate: string;
}

const LeadsTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  // Sample data
  const leads: Lead[] = [
    {
      id: 1,
      name: 'Tonya Noble',
      company: 'Micro Design',
      score: 193,
      phone: '745-321-9874',
      location: 'London, UK',
      tags: ['Lead', 'Partner'],
      createDate: '23 Nov, 2021',
    },
    {
      id: 2,
      name: 'Thomas Taylor',
      company: 'Digitech Galaxy',
      score: 754,
      phone: '536-480-8536',
      location: 'Windhoek, Namibia',
      tags: ['Lead'],
      createDate: '28 Feb, 2019',
    },
    {
      id: 3,
      name: 'Charles Kubik',
      company: 'Syntce Solutions',
      score: 236,
      phone: '231-480-8536',
      location: 'Brasilia, Brazil',
      tags: ['Partner'],
      createDate: '25 Sep, 2021',
    },
    {
      id: 4,
      name: 'Glen Matney',
      company: 'Moetic Fashion',
      score: 365,
      phone: '515-395-1069',
      location: 'Berlin, Germany',
      tags: ['Lead', 'Partner'],
      createDate: '19 May, 2021',
    },
    {
      id: 5,
      name: 'Herbert Stokes',
      company: 'Zoetic Fashion',
      score: 85,
      phone: '414-453-5725',
      location: 'Windhoek, Namibia',
      tags: ['Exiting', 'Lead', 'Partner'],
      createDate: '07 Jun, 2020',
    },
    {
      id: 6,
      name: 'Kevin Dawson',
      company: 'Nesta Technologies',
      score: 78,
      phone: '213-741-4294',
      location: 'Bogota, Colombia',
      tags: ['Exiting'],
      createDate: '14 Apr, 2021',
    },
    {
      id: 7,
      name: 'Michael Morris',
      company: 'Micro Design',
      score: 352,
      phone: '856-253-9927',
      location: 'Damascus, Syria',
      tags: ['Lead'],
      createDate: '19 May, 2021',
    },
    {
      id: 8,
      name: 'Nancy Martino',
      company: 'Syntce Solutions',
      score: 159,
      phone: '786-253-9927',
      location: 'London, UK',
      tags: ['Lead', 'Partner'],
      createDate: '02 Jan, 2022',
    },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleRowSelect = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const filteredLeads = leads.filter((lead) =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const rowsPerPage = 7;
  const totalPages = Math.ceil(filteredLeads.length / rowsPerPage);
  const startIndex = (page - 1) * rowsPerPage;
  const currentLeads = filteredLeads.slice(startIndex, startIndex + rowsPerPage);

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
            backgroundColor: '#f5f7fa',
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <InputBase
              placeholder="Search for..."
              value={searchTerm}
              onChange={handleSearchChange}
              startAdornment={
                <SearchIcon sx={{ color: '#999', ml: 1 }} fontSize="small" />
              }
              sx={{
                width: 300,
                border: '1px solid #ccc',
                borderRadius: 1,
                px: 2,
                py: 1,
                '& input': { padding: '0 !important' },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              sx={{
                borderColor: '#2196F3',
                color: '#2196F3',
                '&:hover': { backgroundColor: '#e3f2fd' },
              }}
            >
              Filters
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                backgroundColor: '#00b894',
                color: 'white',
                '&:hover': { backgroundColor: '#00a37d' },
              }}
            >
              Add Leads
            </Button>
            <IconButton
              sx={{
                backgroundColor: '#e3f2fd',
                color: '#2196F3',
                '&:hover': { backgroundColor: '#bbdefb' },
              }}
            >
              <InfoIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Table */}
        <TableContainer>
          <Table stickyHeader aria-label="leads table">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedRows.length > 0 && selectedRows.length < currentLeads.length}
                    checked={currentLeads.length > 0 && selectedRows.length === currentLeads.length}
                    onChange={() => {
                      if (selectedRows.length === currentLeads.length) {
                        setSelectedRows([]);
                      } else {
                        setSelectedRows(currentLeads.map((lead) => lead.id));
                      }
                    }}
                  />
                </TableCell>
                <TableCell sortDirection="asc">
                  <Typography variant="subtitle2" fontWeight="bold">
                    Name
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Company
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Leads Score
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Phone
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Location
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Tags
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Create Date
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Action
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedRows.includes(lead.id)}
                      onChange={() => handleRowSelect(lead.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <img
                        src={`https://randomuser.me/api/portraits/women/${lead.id % 10}.jpg`}
                        alt={lead.name}
                        style={{ width: 32, height: 32, borderRadius: '50%' }}
                      />
                      <Typography>{lead.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{lead.company}</TableCell>
                  <TableCell>{lead.score}</TableCell>
                  <TableCell>{lead.phone}</TableCell>
                  <TableCell>{lead.location}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {lead.tags.map((tag) => (
                        <Box
                          key={tag}
                          sx={{
                            backgroundColor: '#e3f2fd',
                            color: '#2196F3',
                            fontSize: '0.75rem',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            textTransform: 'capitalize',
                          }}
                        >
                          {tag}
                        </Box>
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>{lead.createDate}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton size="small">
                        <CallIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small">
                        <MessageIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small">
                        <InfoIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small">
                        <DeleteIcon fontSize="small" />
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
            justifyContent: 'flex-end',
            p: 2,
            borderTop: '1px solid #e0e0e0',
          }}
        >
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
    </Box>
  );
};

export default LeadsTable;