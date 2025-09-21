// "use client";
//
// import AddIcon from "@mui/icons-material/Add";
// import CallIcon from "@mui/icons-material/Call";
// import DeleteIcon from "@mui/icons-material/Delete";
// import EditIcon from "@mui/icons-material/Edit";
// import FilterListIcon from "@mui/icons-material/FilterList";
// import InfoIcon from "@mui/icons-material/Info";
// import MessageIcon from "@mui/icons-material/Message";
// import SearchIcon from "@mui/icons-material/Search";
// import {
//   Box,
//   Button,
//   Checkbox,
//   IconButton,
//   InputBase,
//   Pagination,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   useTheme,
//   Typography,
// } from "@mui/material";
// import type React from "react";
// import { useState } from "react";
//
// interface Lead {
//   id: number;
//   name: string;
//   phone: string;
//   location: string;
//   tags: string[];
//   recievedAt: string;
//   email?: string;
// }
//
// const LeadsTable: React.FC = () => {
//   const theme = useTheme();
//   const [searchTerm, setSearchTerm] = useState("");
//   const [page, setPage] = useState(1);
//   const [selectedRows, setSelectedRows] = useState<number[]>([]);
//
//   // Sample data
//   const leads: Lead[] = [
//     {
//       id: 1,
//       name: "Tonya Noble",
//       phone: "745-321-9874",
//       location: "London, UK",
//       tags: ["Lead", "Partner"],
//       recievedAt: "23 Nov, 2021",
//     },
//     {
//       id: 2,
//       name: "Thomas Taylor",
//       phone: "536-480-8536",
//       location: "Windhoek, Namibia",
//       tags: ["Lead"],
//       recievedAt: "28 Feb, 2019",
//     },
//     {
//       id: 3,
//       name: "Charles Kubik",
//       phone: "231-480-8536",
//       location: "Brasilia, Brazil",
//       tags: ["Partner"],
//       recievedAt: "25 Sep, 2021",
//     },
//     {
//       id: 4,
//       name: "Glen Matney",
//       phone: "515-395-1069",
//       location: "Berlin, Germany",
//       tags: ["Lead", "Partner"],
//       recievedAt: "19 May, 2021",
//     },
//     {
//       id: 5,
//       name: "Herbert Stokes",
//       phone: "414-453-5725",
//       location: "Windhoek, Namibia",
//       tags: ["Exiting", "Lead", "Partner"],
//       recievedAt: "07 Jun, 2020",
//     },
//     {
//       id: 6,
//       name: "Kevin Dawson",
//       phone: "213-741-4294",
//       location: "Bogota, Colombia",
//       tags: ["Exiting"],
//       recievedAt: "14 Apr, 2021",
//     },
//     {
//       id: 7,
//       name: "Michael Morris",
//       phone: "856-253-9927",
//       location: "Damascus, Syria",
//       tags: ["Lead"],
//       recievedAt: "19 May, 2021",
//     },
//     {
//       id: 8,
//       name: "Nancy Martino",
//       phone: "786-253-9927",
//       location: "London, UK",
//       tags: ["Lead", "Partner"],
//       recievedAt: "02 Jan, 2022",
//     },
//   ];
//
//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchTerm(e.target.value);
//   };
//
//   const handlePageChange = (
//     _event: React.ChangeEvent<unknown>,
//     value: number,
//   ) => {
//     setPage(value);
//   };
//
//   const handleRowSelect = (id: number) => {
//     setSelectedRows((prev) =>
//       prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
//     );
//   };
//
//   const filteredLeads = leads.filter((lead) =>
//     lead.name.toLowerCase().includes(searchTerm.toLowerCase()),
//   );
//
//   const rowsPerPage = 7;
//   const totalPages = Math.ceil(filteredLeads.length / rowsPerPage);
//   const startIndex = (page - 1) * rowsPerPage;
//   const currentLeads = filteredLeads.slice(
//     startIndex,
//     startIndex + rowsPerPage,
//   );
//
//   return (
//     <Box sx={{ width: "100%", p: 2 }}>
//       <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
//         {/* Header */}
//         <Box
//           sx={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             p: 2,
//             backgroundColor: theme.palette.grey[100],
//             borderBottom: `1px solid ${theme.palette.divider}`,
//           }}
//         >
//           <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//             <InputBase
//               placeholder="Search for..."
//               value={searchTerm}
//               onChange={handleSearchChange}
//               startAdornment={
//                 <SearchIcon
//                   sx={{ color: theme.palette.text.secondary, ml: 1 }}
//                   fontSize="small"
//                 />
//               }
//               sx={{
//                 width: 300,
//                 border: `1px solid ${theme.palette.divider}`,
//                 borderRadius: 1,
//                 px: 2,
//                 py: 1,
//                 "& input": { padding: "0 !important" },
//               }}
//             />
//           </Box>
//
//           <Box sx={{ display: "flex", gap: 1 }}>
//             <Button
//               variant="outlined"
//               startIcon={<FilterListIcon />}
//               sx={{
//                 borderColor: theme.palette.primary.main,
//                 color: theme.palette.primary.main,
//                 "&:hover": {
//                   backgroundColor: theme.palette.primary.light,
//                   borderColor: theme.palette.primary.dark,
//                   color: theme.palette.primary.contrastText,
//                 },
//               }}
//             >
//               Filters
//             </Button>
//             <Button
//               variant="contained"
//               startIcon={<AddIcon />}
//               sx={{
//                 backgroundColor: theme.palette.success.main,
//                 color: theme.palette.success.contrastText,
//                 "&:hover": { backgroundColor: theme.palette.success.dark },
//               }}
//             >
//               Add Leads
//             </Button>
//             <IconButton
//               sx={{
//                 backgroundColor: theme.palette.primary.light,
//                 color: theme.palette.primary.contrastText,
//                 "&:hover": {
//                   backgroundColor: theme.palette.primary.main,
//                   color: theme.palette.primary.contrastText,
//                 },
//               }}
//             >
//               <InfoIcon />
//             </IconButton>
//           </Box>
//         </Box>
//
//         {/* Table */}
//         <TableContainer>
//           <Table stickyHeader aria-label="leads table">
//             <TableHead>
//               <TableRow>
//                 <TableCell padding="checkbox">
//                   <Checkbox
//                     indeterminate={
//                       selectedRows.length > 0 &&
//                       selectedRows.length < currentLeads.length
//                     }
//                     checked={
//                       currentLeads.length > 0 &&
//                       selectedRows.length === currentLeads.length
//                     }
//                     onChange={() => {
//                       if (selectedRows.length === currentLeads.length) {
//                         setSelectedRows([]);
//                       } else {
//                         setSelectedRows(currentLeads.map((lead) => lead.id));
//                       }
//                     }}
//                   />
//                 </TableCell>
//                 <TableCell sortDirection="asc">
//                   <Typography variant="subtitle2" fontWeight="bold">
//                     Name
//                   </Typography>
//                 </TableCell>
//                 <TableCell>
//                   <Typography variant="subtitle2" fontWeight="bold">
//                     Phone
//                   </Typography>
//                 </TableCell>
//                 <TableCell>
//                   <Typography variant="subtitle2" fontWeight="bold">
//                     Location
//                   </Typography>
//                 </TableCell>
//                 <TableCell>
//                   <Typography variant="subtitle2" fontWeight="bold">
//                     Tags
//                   </Typography>
//                 </TableCell>
//                 <TableCell>
//                   <Typography variant="subtitle2" fontWeight="bold">
//                     Create Date
//                   </Typography>
//                 </TableCell>
//                 <TableCell>
//                   <Typography variant="subtitle2" fontWeight="bold">
//                     Action
//                   </Typography>
//                 </TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {currentLeads.map((lead) => (
//                 <TableRow key={lead.id}>
//                   <TableCell padding="checkbox">
//                     <Checkbox
//                       checked={selectedRows.includes(lead.id)}
//                       onChange={() => handleRowSelect(lead.id)}
//                     />
//                   </TableCell>
//                   <TableCell>
//                     <Typography>{lead.name}</Typography>
//                   </TableCell>
//                   <TableCell>{lead.phone}</TableCell>
//                   <TableCell>{lead.location}</TableCell>
//                   <TableCell>
//                     <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
//                       {lead.tags.map((tag) => (
//                         <Box
//                           key={tag}
//                           sx={{
//                             backgroundColor: theme.palette.primary.light,
//                             color: theme.palette.primary.contrastText,
//                             fontSize: "0.75rem",
//                             px: 1,
//                             py: 0.5,
//                             borderRadius: 1,
//                             textTransform: "capitalize",
//                           }}
//                         >
//                           {tag}
//                         </Box>
//                       ))}
//                     </Box>
//                   </TableCell>
//                   <TableCell>{lead.recievedAt}</TableCell>
//                   <TableCell>
//                     <Box sx={{ display: "flex", gap: 1 }}>
//                       <IconButton size="small">
//                         <CallIcon fontSize="small" />
//                       </IconButton>
//                       <IconButton size="small">
//                         <MessageIcon fontSize="small" />
//                       </IconButton>
//                       <IconButton size="small">
//                         <InfoIcon fontSize="small" />
//                       </IconButton>
//                       <IconButton size="small">
//                         <EditIcon fontSize="small" />
//                       </IconButton>
//                       <IconButton size="small">
//                         <DeleteIcon fontSize="small" />
//                       </IconButton>
//                     </Box>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </TableContainer>
//
//         {/* Pagination */}
//         <Box
//           sx={{
//             display: "flex",
//             justifyContent: "flex-end",
//             p: 2,
//             borderTop: `1px solid ${theme.palette.divider}`,
//           }}
//         >
//           <Pagination
//             count={totalPages}
//             page={page}
//             onChange={handlePageChange}
//             color="primary"
//             showFirstButton
//             showLastButton
//             siblingCount={1}
//             boundaryCount={1}
//             shape="rounded"
//           />
//         </Box>
//       </Paper>
//     </Box>
//   );
// };
//
// export default LeadsTable;
// "use client";
// import AddIcon from "@mui/icons-material/Add";
// import CallIcon from "@mui/icons-material/Call";
// import DeleteIcon from "@mui/icons-material/Delete";
// import EditIcon from "@mui/icons-material/Edit";
// import EmailIcon from "@mui/icons-material/Email";
// import FilterListIcon from "@mui/icons-material/FilterList";
// import InfoIcon from "@mui/icons-material/Info";
// import MessageIcon from "@mui/icons-material/Message";
// import SearchIcon from "@mui/icons-material/Search";
// import {
//   Alert,
//   Box,
//   Button,
//   Checkbox,
//   IconButton,
//   InputBase,
//   Pagination,
//   Paper,
//   Snackbar,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Typography,
//   useTheme,
// } from "@mui/material";
// import type React from "react";
// import { useState } from "react";
// import LeadCallDialog from "./LeadCallDialog";
// import LeadEditDialog from "./LeadEditDialog";
// import LeadEmailDialog from "./LeadEmailDialog";
// import LeadInfoDialog from "./LeadInfoDialog";
// import LeadMessageDialog from "./LeadMessageDialog";
//
// interface Lead {
//   id: number;
//   name: string;
//   phone: string;
//   location: string;
//   tags: string[];
//   createDate: string;
//   email?: string;
// }
//
// const LeadsTable: React.FC = () => {
//   const theme = useTheme();
//   const [searchTerm, setSearchTerm] = useState("");
//   const [page, setPage] = useState(1);
//   const [selectedRows, setSelectedRows] = useState<number[]>([]);
//
//   // Dialog states
//   const [openCallDialog, setOpenCallDialog] = useState(false);
//   const [openMessageDialog, setOpenMessageDialog] = useState(false);
//   const [openEmailDialog, setOpenEmailDialog] = useState(false);
//   const [openEditDialog, setOpenEditDialog] = useState(false);
//   const [openInfoDialog, setOpenInfoDialog] = useState(false);
//   const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
//
//   // Snackbar state
//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: "",
//     severity: "success" as "success" | "error" | "warning" | "info",
//   });
//
//   // Sample data with email added
//   const leads: Lead[] = [
//     {
//       id: 1,
//       name: "Tonya Noble",
//       phone: "745-321-9874",
//       location: "London, UK",
//       tags: ["Lead", "Partner"],
//       createDate: "23 Nov, 2021",
//       email: "tonya.noble@example.com",
//     },
//     {
//       id: 2,
//       name: "Thomas Taylor",
//       phone: "536-480-8536",
//       location: "Windhoek, Namibia",
//       tags: ["Lead"],
//       createDate: "28 Feb, 2019",
//       email: "thomas.taylor@example.com",
//     },
//     {
//       id: 3,
//       name: "Charles Kubik",
//       phone: "231-480-8536",
//       location: "Brasilia, Brazil",
//       tags: ["Partner"],
//       createDate: "25 Sep, 2021",
//       email: "charles.kubik@example.com",
//     },
//     {
//       id: 4,
//       name: "Glen Matney",
//       phone: "515-395-1069",
//       location: "Berlin, Germany",
//       tags: ["Lead", "Partner"],
//       createDate: "19 May, 2021",
//       email: "glen.matney@example.com",
//     },
//     {
//       id: 5,
//       name: "Herbert Stokes",
//       phone: "414-453-5725",
//       location: "Windhoek, Namibia",
//       tags: ["Exiting", "Lead", "Partner"],
//       createDate: "07 Jun, 2020",
//       email: "herbert.stokes@example.com",
//     },
//     {
//       id: 6,
//       name: "Kevin Dawson",
//       phone: "213-741-4294",
//       location: "Bogota, Colombia",
//       tags: ["Exiting"],
//       createDate: "14 Apr, 2021",
//       email: "kevin.dawson@example.com",
//     },
//     {
//       id: 7,
//       name: "Michael Morris",
//       phone: "856-253-9927",
//       location: "Damascus, Syria",
//       tags: ["Lead"],
//       createDate: "19 May, 2021",
//       email: "michael.morris@example.com",
//     },
//     {
//       id: 8,
//       name: "Nancy Martino",
//       phone: "786-253-9927",
//       location: "London, UK",
//       tags: ["Lead", "Partner"],
//       createDate: "02 Jan, 2022",
//       email: "nancy.martino@example.com",
//     },
//   ];
//
//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchTerm(e.target.value);
//   };
//
//   const handlePageChange = (
//     _event: React.ChangeEvent<unknown>,
//     value: number,
//   ) => {
//     setPage(value);
//   };
//
//   const handleRowSelect = (id: number) => {
//     setSelectedRows((prev) =>
//       prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
//     );
//   };
//
//   const handleActionClick = (action: string, lead: Lead) => {
//     setSelectedLead(lead);
//     switch (action) {
//       case "call":
//         setOpenCallDialog(true);
//         break;
//       case "message":
//         setOpenMessageDialog(true);
//         break;
//       case "email":
//         setOpenEmailDialog(true);
//         break;
//       case "edit":
//         setOpenEditDialog(true);
//         break;
//       case "info":
//         setOpenInfoDialog(true);
//         break;
//       default:
//         break;
//     }
//   };
//
//   const handleCallInitiated = (phoneNumber: string) => {
//     setSnackbar({
//       open: true,
//       message: `Call initiated to ${phoneNumber}`,
//       severity: "success",
//     });
//   };
//
//   const handleMessageSent = (messageData: {
//     recipient: string;
//     message: string;
//     channel: string;
//   }) => {
//     setSnackbar({
//       open: true,
//       message: `Message sent to ${messageData.recipient} via ${messageData.channel}`,
//       severity: "success",
//     });
//   };
//
//   const handleEmailSent = (emailData: {
//     to: string;
//     subject: string;
//     body: string;
//     cc?: string[];
//     attachments: File[];
//   }) => {
//     setSnackbar({
//       open: true,
//       message: `Email sent to ${emailData.to} with subject: "${emailData.subject}"`,
//       severity: "success",
//     });
//   };
//
//   const handleLeadSave = (updatedLead: Lead) => {
//     setSnackbar({
//       open: true,
//       message: `Lead "${updatedLead.name}" updated successfully`,
//       severity: "success",
//     });
//   };
//
//   const handleLeadDelete = (leadId: number) => {
//     setSnackbar({
//       open: true,
//       message: `Lead #${leadId} deleted successfully`,
//       severity: "success",
//     });
//   };
//
//   const handleCloseSnackbar = () => {
//     setSnackbar((prev) => ({ ...prev, open: false }));
//   };
//
//   const filteredLeads = leads.filter((lead) =>
//     lead.name.toLowerCase().includes(searchTerm.toLowerCase()),
//   );
//
//   const rowsPerPage = 7;
//   const totalPages = Math.ceil(filteredLeads.length / rowsPerPage);
//   const startIndex = (page - 1) * rowsPerPage;
//   const currentLeads = filteredLeads.slice(
//     startIndex,
//     startIndex + rowsPerPage,
//   );
//
//   return (
//     <Box sx={{ width: "100%", p: 2 }}>
//       <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
//         {/* Header */}
//         <Box
//           sx={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             p: 2,
//             backgroundColor: theme.palette.grey[100],
//             borderBottom: `1px solid ${theme.palette.divider}`,
//           }}
//         >
//           <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//             <InputBase
//               placeholder="Search for..."
//               value={searchTerm}
//               onChange={handleSearchChange}
//               startAdornment={
//                 <SearchIcon
//                   sx={{ color: theme.palette.text.secondary, ml: 1 }}
//                   fontSize="small"
//                 />
//               }
//               sx={{
//                 width: 300,
//                 border: `1px solid ${theme.palette.divider}`,
//                 borderRadius: 1,
//                 px: 2,
//                 py: 1,
//                 "& input": { padding: "0 !important" },
//               }}
//             />
//           </Box>
//           <Box sx={{ display: "flex", gap: 1 }}>
//             <Button
//               variant="outlined"
//               startIcon={<FilterListIcon />}
//               sx={{
//                 borderColor: theme.palette.primary.main,
//                 color: theme.palette.primary.main,
//                 "&:hover": {
//                   backgroundColor: theme.palette.primary.light,
//                   borderColor: theme.palette.primary.dark,
//                   color: theme.palette.primary.contrastText,
//                 },
//               }}
//             >
//               Filters
//             </Button>
//             <Button
//               variant="contained"
//               startIcon={<AddIcon />}
//               sx={{
//                 backgroundColor: theme.palette.success.main,
//                 color: theme.palette.success.contrastText,
//                 "&:hover": { backgroundColor: theme.palette.success.dark },
//               }}
//             >
//               Add Leads
//             </Button>
//             <IconButton
//               sx={{
//                 backgroundColor: theme.palette.primary.light,
//                 color: theme.palette.primary.contrastText,
//                 "&:hover": {
//                   backgroundColor: theme.palette.primary.main,
//                   color: theme.palette.primary.contrastText,
//                 },
//               }}
//             >
//               <InfoIcon />
//             </IconButton>
//           </Box>
//         </Box>
//         {/* Table */}
//         <TableContainer>
//           <Table stickyHeader aria-label="leads table">
//             <TableHead>
//               <TableRow>
//                 <TableCell padding="checkbox">
//                   <Checkbox
//                     indeterminate={
//                       selectedRows.length > 0 &&
//                       selectedRows.length < currentLeads.length
//                     }
//                     checked={
//                       currentLeads.length > 0 &&
//                       selectedRows.length === currentLeads.length
//                     }
//                     onChange={() => {
//                       if (selectedRows.length === currentLeads.length) {
//                         setSelectedRows([]);
//                       } else {
//                         setSelectedRows(currentLeads.map((lead) => lead.id));
//                       }
//                     }}
//                   />
//                 </TableCell>
//                 <TableCell sortDirection="asc">
//                   <Typography variant="subtitle2" fontWeight="bold">
//                     Name
//                   </Typography>
//                 </TableCell>
//                 <TableCell>
//                   <Typography variant="subtitle2" fontWeight="bold">
//                     Phone
//                   </Typography>
//                 </TableCell>
//                 <TableCell>
//                   <Typography variant="subtitle2" fontWeight="bold">
//                     Location
//                   </Typography>
//                 </TableCell>
//                 <TableCell>
//                   <Typography variant="subtitle2" fontWeight="bold">
//                     Tags
//                   </Typography>
//                 </TableCell>
//                 <TableCell>
//                   <Typography variant="subtitle2" fontWeight="bold">
//                     Create Date
//                   </Typography>
//                 </TableCell>
//                 <TableCell>
//                   <Typography variant="subtitle2" fontWeight="bold">
//                     Action
//                   </Typography>
//                 </TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {currentLeads.map((lead) => (
//                 <TableRow key={lead.id}>
//                   <TableCell padding="checkbox">
//                     <Checkbox
//                       checked={selectedRows.includes(lead.id)}
//                       onChange={() => handleRowSelect(lead.id)}
//                     />
//                   </TableCell>
//                   <TableCell>
//                     <Typography>{lead.name}</Typography>
//                   </TableCell>
//                   <TableCell>{lead.phone}</TableCell>
//                   <TableCell>{lead.location}</TableCell>
//                   <TableCell>
//                     <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
//                       {lead.tags.map((tag) => (
//                         <Box
//                           key={tag}
//                           sx={{
//                             backgroundColor: theme.palette.primary.light,
//                             color: theme.palette.primary.contrastText,
//                             fontSize: "0.75rem",
//                             px: 1,
//                             py: 0.5,
//                             borderRadius: 1,
//                             textTransform: "capitalize",
//                           }}
//                         >
//                           {tag}
//                         </Box>
//                       ))}
//                     </Box>
//                   </TableCell>
//                   <TableCell>{lead.createDate}</TableCell>
//                   <TableCell>
//                     <Box sx={{ display: "flex", gap: 1 }}>
//                       <IconButton
//                         size="small"
//                         onClick={() => handleActionClick("call", lead)}
//                         title="Call"
//                       >
//                         <CallIcon fontSize="small" />
//                       </IconButton>
//                       <IconButton
//                         size="small"
//                         onClick={() => handleActionClick("message", lead)}
//                         title="Send Message"
//                       >
//                         <MessageIcon fontSize="small" />
//                       </IconButton>
//                       <IconButton
//                         size="small"
//                         onClick={() => handleActionClick("email", lead)}
//                         title="Send Email"
//                       >
//                         <EmailIcon fontSize="small" />
//                       </IconButton>
//                       <IconButton
//                         size="small"
//                         onClick={() => handleActionClick("info", lead)}
//                         title="View Info"
//                       >
//                         <InfoIcon fontSize="small" />
//                       </IconButton>
//                       <IconButton
//                         size="small"
//                         onClick={() => handleActionClick("edit", lead)}
//                         title="Edit"
//                       >
//                         <EditIcon fontSize="small" />
//                       </IconButton>
//                       <IconButton
//                         size="small"
//                         color="error"
//                         onClick={() => handleActionClick("edit", lead)} // In real app, this might be a delete confirmation
//                         title="Delete"
//                       >
//                         <DeleteIcon fontSize="small" />
//                       </IconButton>
//                     </Box>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </TableContainer>
//         {/* Pagination */}
//         <Box
//           sx={{
//             display: "flex",
//             justifyContent: "flex-end",
//             p: 2,
//             borderTop: `1px solid ${theme.palette.divider}`,
//           }}
//         >
//           <Pagination
//             count={totalPages}
//             page={page}
//             onChange={handlePageChange}
//             color="primary"
//             showFirstButton
//             showLastButton
//             siblingCount={1}
//             boundaryCount={1}
//             shape="rounded"
//           />
//         </Box>
//       </Paper>
//
//       {/* Dialog Components */}
//       {selectedLead && (
//         <>
//           <LeadCallDialog
//             open={openCallDialog}
//             onClose={() => setOpenCallDialog(false)}
//             lead={selectedLead}
//             onCallInitiated={handleCallInitiated}
//           />
//
//           <LeadMessageDialog
//             open={openMessageDialog}
//             onClose={() => setOpenMessageDialog(false)}
//             lead={selectedLead}
//             onMessageSent={handleMessageSent}
//           />
//
//           <LeadEmailDialog
//             open={openEmailDialog}
//             onClose={() => setOpenEmailDialog(false)}
//             lead={selectedLead}
//             onEmailSent={handleEmailSent}
//           />
//
//           <LeadEditDialog
//             open={openEditDialog}
//             onClose={() => setOpenEditDialog(false)}
//             lead={selectedLead}
//             onSave={handleLeadSave}
//             onDelete={handleLeadDelete}
//           />
//
//           <LeadInfoDialog
//             open={openInfoDialog}
//             onClose={() => setOpenInfoDialog(false)}
//             lead={selectedLead}
//           />
//         </>
//       )}
//
//       {/* Snackbar for notifications */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={6000}
//         onClose={handleCloseSnackbar}
//         anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
//       >
//         <Alert
//           onClose={handleCloseSnackbar}
//           severity={snackbar.severity}
//           sx={{ width: "100%" }}
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };
//
// export default LeadsTable;
"use client";

import type { Lead } from "@crm/types";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  FilterList as FilterListIcon,
  Info as InfoIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { io, Socket } from "socket.io-client";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  IconButton,
  InputBase,
  Pagination,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import { leadsApi } from "@/services/leads.service";
import { socketService } from "@/services/socket.service";
import LeadEditDialog from "./lead-edit-dialog";
import LeadEmailDialog from "./lead-email-dialog";
import LeadInfoDialog from "./lead-info-dialog";

const LeadsTable: React.FC = () => {
  const theme = useTheme();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openEmailDialog, setOpenEmailDialog] = useState(false);
  const [openInfoDialog, setOpenInfoDialog] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning" | "info",
  });

  // Fetch leads from API
 const fetchLeads = async () => {
  setLoading(true); // start loading
  try {
    const leadsData = await leadsApi.getAll();
    setLeads(leadsData);
  } catch (error) {
    setSnackbar({
      open: true,
      message:
        error instanceof Error ? error.message : "Failed to fetch leads",
      severity: "error",
    });
  } finally {
    setLoading(false);
  }
};


  // Set up socket connection and event listeners
  useEffect(() => {
    const socket = socketService.connect();

    socketService.onLeadCreated((newLead: Lead) => {
      setLeads((prev) => [...prev, newLead]);
      setSnackbar({
        open: true,
        message: `New lead created: ${newLead.name || "Unknown"}`,
        severity: "success",
      });
    });

    socketService.onLeadUpdated((updatedLead: Lead) => {
      setLeads((prev) =>
        prev.map((lead) => (lead.id === updatedLead.id ? updatedLead : lead)),
      );
      setSnackbar({
        open: true,
        message: `Lead updated: ${updatedLead.name || "Unknown"}`,
        severity: "success",
      });
    });

   // Service
   socketService.onLeadDeleted((id) => {
      setLeads((prev) =>
        prev.filter((lead) => String(lead.id) !== String(id))
      );
      setSnackbar({
        open: true,
        message: "Lead deleted successfully",
        severity: "success",
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

  const handleActionClick = (action: string, lead: Lead) => {
    setSelectedLead(lead);
    switch (action) {
      case "email":
        setOpenEmailDialog(true);
        break;
      case "edit":
        setOpenEditDialog(true);
        break;
      case "info":
        setOpenInfoDialog(true);
        break;
      default:
        break;
    }
  };

  const handleLeadSave = async (updatedLead: Lead) => {
    try {
      await leadsApi.update({
        // id: updatedLead.id,
        ...updatedLead,
      });
      setSnackbar({
        open: true,
        message: `Lead "${updatedLead.name}" updated successfully`,
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message:
          error instanceof Error ? error.message : "Failed to update lead",
        severity: "error",
      });
    }
  };

  const handleLeadDelete = async (leadId: number) => {
    try {
      await leadsApi.delete(leadId);
      setSnackbar({
        open: true,
        message: `Lead #${leadId} deleted successfully`,
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message:
          error instanceof Error ? error.message : "Failed to delete lead",
        severity: "error",
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
      severity: "success",
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // const formatDate = (date: Date) => {
  //   return new Date(date).toLocaleDateString();
  // };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "New":
        return "primary";
      case "Contacted":
        return "info";
      case "Qualified":
        return "warning";
      case "Converted":
        return "success";
      case "Lost":
        return "error";
      default:
        return "default";
    }
  };

  const filteredLeads = leads.filter(
    (lead) =>
      (lead.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.vehicle_model || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (lead.vehicle_reg || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const rowsPerPage = 7;
  const totalPages = Math.ceil(filteredLeads.length / rowsPerPage);
  const startIndex = (page - 1) * rowsPerPage;
  const currentLeads = filteredLeads.slice(
    startIndex,
    startIndex + rowsPerPage,
  );

  if (loading) {
    return <Typography>Loading leads...</Typography>;
  }

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
            backgroundColor: theme.palette.grey[100],
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
                "& input": { padding: "0 !important" },
              }}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              sx={{
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                "&:hover": {
                  backgroundColor: theme.palette.primary.light,
                  borderColor: theme.palette.primary.dark,
                  color: theme.palette.primary.contrastText,
                },
              }}
            >
              Filters
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                backgroundColor: theme.palette.success.main,
                color: theme.palette.success.contrastText,
                "&:hover": { backgroundColor: theme.palette.success.dark },
              }}
            >
              Add Leads
            </Button>
            <IconButton
              sx={{
                backgroundColor: theme.palette.primary.light,
                color: theme.palette.primary.contrastText,
                "&:hover": {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                },
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
                    indeterminate={
                      selectedRows.length > 0 &&
                      selectedRows.length < currentLeads.length
                    }
                    checked={
                      currentLeads.length > 0 &&
                      selectedRows.length === currentLeads.length
                    }
                    onChange={() => {
                      if (selectedRows.length === currentLeads.length) {
                        setSelectedRows([]);
                      } else {
                        setSelectedRows(currentLeads.map((lead) => lead.id));
                      }
                    }}
                  />
                </TableCell>
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
                    Vehicle Model
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Registration
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Status
                  </Typography>
                </TableCell>
                {/* <TableCell> */}
                {/*   <Typography variant="subtitle2" fontWeight="bold"> */}
                {/*     Created Date */}
                {/*   </Typography> */}
                {/* </TableCell> */}
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
                    <Typography>{lead.name || "N/A"}</Typography>
                  </TableCell>
                  <TableCell>{lead.email || "N/A"}</TableCell>
                  <TableCell>{lead.vehicle_model || "N/A"}</TableCell>
                  <TableCell>{lead.vehicle_reg || "N/A"}</TableCell>
                  <TableCell>
                    <Chip
                      label={lead.status || "Unknown"}
                      color={getStatusColor(lead.status)}
                      size="small"
                    />
                  </TableCell>
                  {/* <TableCell>{formatDate(lead.createdAt)}</TableCell> */}
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleActionClick("email", lead)}
                        title="Send Email"
                        disabled={!lead.email}
                      >
                        <EmailIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleActionClick("edit", lead)}
                        title="Edit"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleActionClick("info", lead)}
                        title="View Info"
                      >
                        <InfoIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleLeadDelete(lead.id)}
                        title="Delete"
                      >
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
            display: "flex",
            justifyContent: "flex-end",
            p: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
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

      {/* Dialog Components */}
      {selectedLead && (
        <>
          <LeadEmailDialog
            open={openEmailDialog}
            onClose={() => setOpenEmailDialog(false)}
            lead={{
              id: selectedLead.id,
              name: selectedLead.name || "",
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
          />
        </>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LeadsTable;
