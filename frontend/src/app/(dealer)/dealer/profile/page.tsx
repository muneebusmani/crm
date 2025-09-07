// "use client";
// import { Close, LocationOn, Person, Settings, Web } from "@mui/icons-material";
// import {
//   Avatar,
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   Divider,
//   Grid,
//   IconButton,
//   TextField,
//   Typography,
// } from "@mui/material";
// import { useTheme } from "@mui/material/styles";
// import type React from "react";
// import { useState } from "react";
//
// const ProfilePage: React.FC = () => {
//   const theme = useTheme();
//   const [openEditDialog, setOpenEditDialog] = useState(false);
//
//   // State for editable fields
//   const [profileData, setProfileData] = useState({
//     fullName: "Anna Adame",
//     mobile: "+1 987 6543",
//     email: "daveadame@verizon.com",
//     location: "California, United States",
//     joiningDate: "24 Nov 2021",
//     about:
//       "Hi I'm Anna Adame, It will be as simple as Occidental; in fact, it will be Occidental. To an English person, it will seem like simplified English, as a skeptical Cambridge friend of mine told me what Occidental is European languages are members of the same family.",
//     designation: "Lead Designer / Developer",
//     website: "www.verizon.com",
//   });
//
//   const handleOpenEditDialog = () => {
//     setOpenEditDialog(true);
//   };
//
//   const handleCloseEditDialog = () => {
//     setOpenEditDialog(false);
//   };
//
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setProfileData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };
//
//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     // Here you would typically send the updated data to your API
//     console.log("Updated profile:", profileData);
//     setOpenEditDialog(false);
//   };
//
//   return (
//     <Box sx={{ p: 3 }}>
//       {/* Header Section */}
//       <Box
//         sx={{
//           position: "relative",
//           height: 200,
//           background: "linear-gradient(135deg, #4a6fa5, #5b87d0)",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           color: "white",
//           px: 3,
//           pb: 3,
//           borderBottomLeftRadius: 16,
//           borderBottomRightRadius: 16,
//           overflow: "hidden",
//           marginBottom: 4,
//         }}
//       >
//         <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//           <Avatar
//             src="/static/images/avatar/anna.jpg"
//             alt="Anna Adame"
//             sx={{
//               width: 80,
//               height: 80,
//               border: "4px solid white",
//               boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
//             }}
//           />
//           <Box>
//             <Typography variant="h4" fontWeight="bold">
//               Anna Adame
//             </Typography>
//             <Typography variant="subtitle1" color="textSecondary">
//               Owner & Founder
//             </Typography>
//             <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
//               <LocationOn sx={{ fontSize: 14 }} />
//               <Typography variant="body2" color="textSecondary">
//                 California, United States
//               </Typography>
//               <Typography variant="body2" color="textSecondary">
//                 Themesbrand
//               </Typography>
//             </Box>
//           </Box>
//         </Box>
//
//         <Box sx={{ display: "flex", gap: 4 }}>
//           <Box textAlign="center">
//             <Typography variant="h6">24.3K</Typography>
//             <Typography variant="body2" color="textSecondary">
//               Followers
//             </Typography>
//           </Box>
//           <Box textAlign="center">
//             <Typography variant="h6">1.3K</Typography>
//             <Typography variant="body2" color="textSecondary">
//               Following
//             </Typography>
//           </Box>
//           <Button
//             variant="contained"
//             color="primary"
//             startIcon={<Settings />}
//             onClick={handleOpenEditDialog}
//             sx={{ ml: 2 }}
//           >
//             Edit Profile
//           </Button>
//         </Box>
//       </Box>
//
//       {/* Navigation Tabs */}
//       <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
//         <Button variant="outlined" color="primary" size="small">
//           Overview
//         </Button>
//         <Button variant="outlined" color="secondary" size="small">
//           Activities
//         </Button>
//         <Button variant="outlined" color="secondary" size="small">
//           Projects
//         </Button>
//         <Button variant="outlined" color="secondary" size="small">
//           Documents
//         </Button>
//       </Box>
//
//       {/* Main Content Grid */}
//       <Grid container spacing={3}>
//         {/* Left Column */}
//         <Grid xs={12} md={4}>
//           <Card sx={{ mb: 2 }}>
//             <CardContent>
//               <Typography variant="h6" gutterBottom>
//                 Complete Your Profile
//               </Typography>
//               <Box sx={{ width: "100%", mb: 2 }}>
//                 <Box
//                   sx={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     mb: 1,
//                   }}
//                 >
//                   <Typography variant="body2">30%</Typography>
//                   <Typography variant="body2">Progress</Typography>
//                 </Box>
//                 <Box
//                   sx={{
//                     width: "100%",
//                     height: 8,
//                     bgcolor: "#e0e0e0",
//                     borderRadius: 1,
//                   }}
//                 >
//                   <Box
//                     sx={{
//                       width: "30%",
//                       height: "100%",
//                       bgcolor: theme.palette.primary.main,
//                       borderRadius: 1,
//                     }}
//                   />
//                 </Box>
//               </Box>
//             </CardContent>
//           </Card>
//
//           <Card>
//             <CardContent>
//               <Typography variant="h6" gutterBottom>
//                 Info
//               </Typography>
//               <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//                 <Box sx={{ display: "flex", justifyContent: "space-between" }}>
//                   <Typography variant="body2" fontWeight="bold">
//                     Full Name:
//                   </Typography>
//                   <Typography variant="body2" color="textSecondary">
//                     {profileData.fullName}
//                   </Typography>
//                 </Box>
//                 <Box sx={{ display: "flex", justifyContent: "space-between" }}>
//                   <Typography variant="body2" fontWeight="bold">
//                     Mobile:
//                   </Typography>
//                   <Typography variant="body2" color="textSecondary">
//                     {profileData.mobile}
//                   </Typography>
//                 </Box>
//                 <Box sx={{ display: "flex", justifyContent: "space-between" }}>
//                   <Typography variant="body2" fontWeight="bold">
//                     E-mail:
//                   </Typography>
//                   <Typography variant="body2" color="textSecondary">
//                     {profileData.email}
//                   </Typography>
//                 </Box>
//                 <Box sx={{ display: "flex", justifyContent: "space-between" }}>
//                   <Typography variant="body2" fontWeight="bold">
//                     Location:
//                   </Typography>
//                   <Typography variant="body2" color="textSecondary">
//                     {profileData.location}
//                   </Typography>
//                 </Box>
//                 <Box sx={{ display: "flex", justifyContent: "space-between" }}>
//                   <Typography variant="body2" fontWeight="bold">
//                     Joining Date:
//                   </Typography>
//                   <Typography variant="body2" color="textSecondary">
//                     {profileData.joiningDate}
//                   </Typography>
//                 </Box>
//               </Box>
//             </CardContent>
//           </Card>
//         </Grid>
//
//         {/* Right Column */}
//         <Grid item xs={12} md={8}>
//           <Card sx={{ mb: 3 }}>
//             <CardContent>
//               <Typography variant="h6" gutterBottom>
//                 About
//               </Typography>
//               <Typography variant="body1" paragraph>
//                 {profileData.about}
//               </Typography>
//
//               <Box sx={{ display: "flex", gap: 4, mt: 3 }}>
//                 <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                   <Person sx={{ color: theme.palette.text.secondary }} />
//                   <Box>
//                     <Typography variant="body2" color="textSecondary">
//                       Designation:
//                     </Typography>
//                     <Typography variant="body1">
//                       {profileData.designation}
//                     </Typography>
//                   </Box>
//                 </Box>
//                 <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                   <Web sx={{ color: theme.palette.text.secondary }} />
//                   <Box>
//                     <Typography variant="body2" color="textSecondary">
//                       Website:
//                     </Typography>
//                     <Typography
//                       variant="body1"
//                       color="primary.main"
//                       component="a"
//                       href={`https://${profileData.website}`}
//                     >
//                       {profileData.website}
//                     </Typography>
//                   </Box>
//                 </Box>
//               </Box>
//             </CardContent>
//           </Card>
//
//           {/* Recent Activity */}
//           <Card>
//             <CardContent>
//               <Box
//                 sx={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   alignItems: "center",
//                   mb: 2,
//                 }}
//               >
//                 <Typography variant="h6">Recent Activity</Typography>
//                 <Box>
//                   <Button size="small">Today</Button>
//                   <Button size="small">Weekly</Button>
//                   <Button size="small">Monthly</Button>
//                 </Box>
//               </Box>
//               <Divider sx={{ my: 2 }} />
//
//               <Box sx={{ display: "flex", gap: 2, alignItems: "start", mb: 2 }}>
//                 <Avatar
//                   src="/static/images/avatar/jacqueline.jpg"
//                   alt="Jacqueline Steve"
//                 />
//                 <Box>
//                   <Typography variant="subtitle2">Jacqueline Steve</Typography>
//                   <Typography variant="body2" color="textSecondary">
//                     We has changed 2 attributes on 05:16PM
//                   </Typography>
//                 </Box>
//               </Box>
//
//               <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
//                 In an awareness campaign, it is vital for people to begin put 2
//                 and 2 together and begin to recognize your cause. Too much or
//                 too little spacing, as in the example below, can make things
//                 unpleasant for the reader. The goal is to...
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>
//
//       {/* Edit Profile Dialog */}
//       <Dialog
//         open={openEditDialog}
//         onClose={handleCloseEditDialog}
//         maxWidth="md"
//         fullWidth
//       >
//         <DialogTitle>
//           <Box
//             sx={{
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//             }}
//           >
//             <Typography variant="h6">Edit Profile</Typography>
//             <IconButton onClick={handleCloseEditDialog}>
//               <Close />
//             </IconButton>
//           </Box>
//         </DialogTitle>
//         <DialogContent>
//           <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
//             <Grid container spacing={3}>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Full Name"
//                   name="fullName"
//                   value={profileData.fullName}
//                   onChange={handleInputChange}
//                   required
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Mobile"
//                   name="mobile"
//                   value={profileData.mobile}
//                   onChange={handleInputChange}
//                   required
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Email"
//                   name="email"
//                   value={profileData.email}
//                   onChange={handleInputChange}
//                   required
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Location"
//                   name="location"
//                   value={profileData.location}
//                   onChange={handleInputChange}
//                   required
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Joining Date"
//                   name="joiningDate"
//                   value={profileData.joiningDate}
//                   onChange={handleInputChange}
//                   required
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="About"
//                   name="about"
//                   value={profileData.about}
//                   onChange={handleInputChange}
//                   multiline
//                   rows={4}
//                   required
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Designation"
//                   name="designation"
//                   value={profileData.designation}
//                   onChange={handleInputChange}
//                   required
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Website"
//                   name="website"
//                   value={profileData.website}
//                   onChange={handleInputChange}
//                   required
//                 />
//               </Grid>
//             </Grid>
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseEditDialog}>Cancel</Button>
//           <Button
//             type="submit"
//             variant="contained"
//             color="primary"
//             onClick={handleSubmit}
//           >
//             Save Changes
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// };
//
// export default ProfilePage;
//
"use client";
import { Close, LocationOn, Person, Settings, Web } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import type React from "react";
import { useState } from "react";

const ProfilePage: React.FC = () => {
  const theme = useTheme();
  const [openEditDialog, setOpenEditDialog] = useState(false);

  // State for editable fields
  const [profileData, setProfileData] = useState({
    fullName: "Anna Adame",
    mobile: "+1 987 6543",
    email: "daveadame@verizon.com",
    location: "California, United States",
    joiningDate: "24 Nov 2021",
    about:
      "Hi I'm Anna Adame, It will be as simple as Occidental; in fact, it will be Occidental. To an English person, it will seem like simplified English, as a skeptical Cambridge friend of mine told me what Occidental is European languages are members of the same family.",
    designation: "Lead Designer / Developer",
    website: "www.verizon.com",
  });

  const handleOpenEditDialog = () => {
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the updated data to your API
    console.log("Updated profile:", profileData);
    setOpenEditDialog(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box
        sx={{
          position: "relative",
          height: 200,
          background: "linear-gradient(135deg, #4a6fa5, #5b87d0)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "white",
          px: 3,
          pb: 3,
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
          overflow: "hidden",
          marginBottom: 4,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            src="/static/images/avatar/anna.jpg"
            alt="Anna Adame"
            sx={{
              width: 80,
              height: 80,
              border: "4px solid white",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}
          />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Anna Adame
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Owner & Founder
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
              <LocationOn sx={{ fontSize: 14 }} />
              <Typography variant="body2" color="textSecondary">
                California, United States
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Themesbrand
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 4 }}>
          <Box textAlign="center">
            <Typography variant="h6">24.3K</Typography>
            <Typography variant="body2" color="textSecondary">
              Followers
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="h6">1.3K</Typography>
            <Typography variant="body2" color="textSecondary">
              Following
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Settings />}
            onClick={handleOpenEditDialog}
            sx={{ ml: 2 }}
          >
            Edit Profile
          </Button>
        </Box>
      </Box>

      {/* Navigation Tabs */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Button variant="outlined" color="primary" size="small">
          Overview
        </Button>
        <Button variant="outlined" color="secondary" size="small">
          Activities
        </Button>
        <Button variant="outlined" color="secondary" size="small">
          Projects
        </Button>
        <Button variant="outlined" color="secondary" size="small">
          Documents
        </Button>
      </Box>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Complete Your Profile
              </Typography>
              <Box sx={{ width: "100%", mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2">30%</Typography>
                  <Typography variant="body2">Progress</Typography>
                </Box>
                <Box
                  sx={{
                    width: "100%",
                    height: 8,
                    bgcolor: "#e0e0e0",
                    borderRadius: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: "30%",
                      height: "100%",
                      bgcolor: theme.palette.primary.main,
                      borderRadius: 1,
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Info
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" fontWeight="bold">
                    Full Name:
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {profileData.fullName}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" fontWeight="bold">
                    Mobile:
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {profileData.mobile}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" fontWeight="bold">
                    E-mail:
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {profileData.email}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" fontWeight="bold">
                    Location:
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {profileData.location}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" fontWeight="bold">
                    Joining Date:
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {profileData.joiningDate}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                About
              </Typography>
              <Typography variant="body1" component="p" gutterBottom>
                {profileData.about}
              </Typography>

              <Box sx={{ display: "flex", gap: 4, mt: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Person sx={{ color: theme.palette.text.secondary }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Designation:
                    </Typography>
                    <Typography variant="body1">
                      {profileData.designation}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Web sx={{ color: theme.palette.text.secondary }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Website:
                    </Typography>
                    <Typography
                      variant="body1"
                      color="primary.main"
                      component="a"
                      href={`https://${profileData.website}`}
                    >
                      {profileData.website}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">Recent Activity</Typography>
                <Box>
                  <Button size="small">Today</Button>
                  <Button size="small">Weekly</Button>
                  <Button size="small">Monthly</Button>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "flex", gap: 2, alignItems: "start", mb: 2 }}>
                <Avatar
                  src="/static/images/avatar/jacqueline.jpg"
                  alt="Jacqueline Steve"
                />
                <Box>
                  <Typography variant="subtitle2">Jacqueline Steve</Typography>
                  <Typography variant="body2" color="textSecondary">
                    We has changed 2 attributes on 05:16PM
                  </Typography>
                </Box>
              </Box>

              <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                In an awareness campaign, it is vital for people to begin put 2
                and 2 together and begin to recognize your cause. Too much or
                too little spacing, as in the example below, can make things
                unpleasant for the reader. The goal is to...
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Edit Profile</Typography>
            <IconButton onClick={handleCloseEditDialog}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="fullName"
                  value={profileData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Mobile"
                  name="mobile"
                  value={profileData.mobile}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={profileData.location}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Joining Date"
                  name="joiningDate"
                  value={profileData.joiningDate}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="About"
                  name="about"
                  value={profileData.about}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Designation"
                  name="designation"
                  value={profileData.designation}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Website"
                  name="website"
                  value={profileData.website}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            onClick={handleSubmit}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePage;
// "use client";
// import { Close, LocationOn, Person, Settings, Web } from "@mui/icons-material";
// import {
//   Avatar,
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   Divider,
//   Grid,
//   IconButton,
//   TextField,
//   Typography,
// } from "@mui/material";
// import { useTheme } from "@mui/material/styles";
// import type React from "react";
// import { useState } from "react";
//
// export interface Dealer {
//   id: number;
//   name: string;
//   email: string;
//   username: string;
//   owner: string;
//   location: string;
//   logo: string;
//   website: string;
//   contactEmail: string;
//   tierId?: number;
// }
//
// const ProfilePage: React.FC<{ dealer: Dealer }> = ({ dealer }) => {
//   const theme = useTheme();
//   const [openEditDialog, setOpenEditDialog] = useState(false);
//
//   // State for editable fields - initialized with dealer data
//   const [profileData, setProfileData] = useState<Dealer>({ ...dealer });
//
//   const handleOpenEditDialog = () => {
//     setOpenEditDialog(true);
//   };
//
//   const handleCloseEditDialog = () => {
//     setOpenEditDialog(false);
//     // Reset to original data if cancel is clicked
//     setProfileData({ ...dealer });
//   };
//
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setProfileData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };
//
//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     // Here you would typically send the updated data to your API
//     console.log("Updated dealer profile:", profileData);
//     setOpenEditDialog(false);
//     // In a real app, you might want to update the parent component's dealer state here
//   };
//
//   return (
//     <Box sx={{ p: 3 }}>
//       {/* Header Section */}
//       <Box
//         sx={{
//           position: "relative",
//           height: 200,
//           background: "linear-gradient(135deg, #4a6fa5, #5b87d0)",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           color: "white",
//           px: 3,
//           pb: 3,
//           borderBottomLeftRadius: 16,
//           borderBottomRightRadius: 16,
//           overflow: "hidden",
//           marginBottom: 4,
//         }}
//       >
//         <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//           <Avatar
//             src={profileData.logo || "/static/images/avatar/anna.jpg"}
//             alt={profileData.name}
//             sx={{
//               width: 80,
//               height: 80,
//               border: "4px solid white",
//               boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
//             }}
//           />
//           <Box>
//             <Typography variant="h4" fontWeight="bold">
//               {profileData.name}
//             </Typography>
//             <Typography variant="subtitle1" color="textSecondary">
//               {profileData.owner} (Owner)
//             </Typography>
//             <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
//               <LocationOn sx={{ fontSize: 14 }} />
//               <Typography variant="body2" color="textSecondary">
//                 {profileData.location}
//               </Typography>
//               <Typography variant="body2" color="textSecondary">
//                 @{profileData.username}
//               </Typography>
//             </Box>
//           </Box>
//         </Box>
//
//         <Box sx={{ display: "flex", gap: 4 }}>
//           <Box textAlign="center">
//             <Typography variant="h6">24.3K</Typography>
//             <Typography variant="body2" color="textSecondary">
//               Followers
//             </Typography>
//           </Box>
//           <Box textAlign="center">
//             <Typography variant="h6">1.3K</Typography>
//             <Typography variant="body2" color="textSecondary">
//               Following
//             </Typography>
//           </Box>
//           <Button
//             variant="contained"
//             color="primary"
//             startIcon={<Settings />}
//             onClick={handleOpenEditDialog}
//             sx={{ ml: 2 }}
//           >
//             Edit Profile
//           </Button>
//         </Box>
//       </Box>
//
//       {/* Navigation Tabs */}
//       <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
//         <Button variant="outlined" color="primary" size="small">
//           Overview
//         </Button>
//         <Button variant="outlined" color="secondary" size="small">
//           Activities
//         </Button>
//         <Button variant="outlined" color="secondary" size="small">
//           Projects
//         </Button>
//         <Button variant="outlined" color="secondary" size="small">
//           Documents
//         </Button>
//       </Box>
//
//       {/* Main Content Grid */}
//       <Grid container spacing={3}>
//         {/* Left Column */}
//         <Grid size={{ xs: 12, md: 4 }}>
//           <Card sx={{ mb: 2 }}>
//             <CardContent>
//               <Typography variant="h6" gutterBottom>
//                 Complete Your Profile
//               </Typography>
//               <Box sx={{ width: "100%", mb: 2 }}>
//                 <Box
//                   sx={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     mb: 1,
//                   }}
//                 >
//                   <Typography variant="body2">30%</Typography>
//                   <Typography variant="body2">Progress</Typography>
//                 </Box>
//                 <Box
//                   sx={{
//                     width: "100%",
//                     height: 8,
//                     bgcolor: "#e0e0e0",
//                     borderRadius: 1,
//                   }}
//                 >
//                   <Box
//                     sx={{
//                       width: "30%",
//                       height: "100%",
//                       bgcolor: theme.palette.primary.main,
//                       borderRadius: 1,
//                     }}
//                   />
//                 </Box>
//               </Box>
//             </CardContent>
//           </Card>
//
//           <Card>
//             <CardContent>
//               <Typography variant="h6" gutterBottom>
//                 Info
//               </Typography>
//               <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//                 <Box sx={{ display: "flex", justifyContent: "space-between" }}>
//                   <Typography variant="body2" fontWeight="bold">
//                     Dealer Name:
//                   </Typography>
//                   <Typography variant="body2" color="textSecondary">
//                     {profileData.name}
//                   </Typography>
//                 </Box>
//                 <Box sx={{ display: "flex", justifyContent: "space-between" }}>
//                   <Typography variant="body2" fontWeight="bold">
//                     Username:
//                   </Typography>
//                   <Typography variant="body2" color="textSecondary">
//                     {profileData.username}
//                   </Typography>
//                 </Box>
//                 <Box sx={{ display: "flex", justifyContent: "space-between" }}>
//                   <Typography variant="body2" fontWeight="bold">
//                     Owner:
//                   </Typography>
//                   <Typography variant="body2" color="textSecondary">
//                     {profileData.owner}
//                   </Typography>
//                 </Box>
//                 <Box sx={{ display: "flex", justifyContent: "space-between" }}>
//                   <Typography variant="body2" fontWeight="bold">
//                     E-mail:
//                   </Typography>
//                   <Typography variant="body2" color="textSecondary">
//                     {profileData.email}
//                   </Typography>
//                 </Box>
//                 <Box sx={{ display: "flex", justifyContent: "space-between" }}>
//                   <Typography variant="body2" fontWeight="bold">
//                     Contact Email:
//                   </Typography>
//                   <Typography variant="body2" color="textSecondary">
//                     {profileData.contactEmail}
//                   </Typography>
//                 </Box>
//                 <Box sx={{ display: "flex", justifyContent: "space-between" }}>
//                   <Typography variant="body2" fontWeight="bold">
//                     Location:
//                   </Typography>
//                   <Typography variant="body2" color="textSecondary">
//                     {profileData.location}
//                   </Typography>
//                 </Box>
//                 {profileData.tierId !== undefined && (
//                   <Box
//                     sx={{ display: "flex", justifyContent: "space-between" }}
//                   >
//                     <Typography variant="body2" fontWeight="bold">
//                       Tier ID:
//                     </Typography>
//                     <Typography variant="body2" color="textSecondary">
//                       {profileData.tierId}
//                     </Typography>
//                   </Box>
//                 )}
//               </Box>
//             </CardContent>
//           </Card>
//         </Grid>
//
//         {/* Right Column */}
//         <Grid size={{ xs: 12, md: 8 }}>
//           <Card sx={{ mb: 3 }}>
//             <CardContent>
//               <Typography variant="h6" gutterBottom>
//                 About
//               </Typography>
//               <Typography variant="body1" component="p" gutterBottom>
//                 Welcome to {profileData.name}'s profile. We are a premier dealer
//                 located in {profileData.location}, owned by {profileData.owner}.
//                 Contact us at {profileData.contactEmail} for any inquiries.
//               </Typography>
//
//               <Box sx={{ display: "flex", gap: 4, mt: 3 }}>
//                 <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                   <Person sx={{ color: theme.palette.text.secondary }} />
//                   <Box>
//                     <Typography variant="body2" color="textSecondary">
//                       Owner:
//                     </Typography>
//                     <Typography variant="body1">{profileData.owner}</Typography>
//                   </Box>
//                 </Box>
//                 <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                   <Web sx={{ color: theme.palette.text.secondary }} />
//                   <Box>
//                     <Typography variant="body2" color="textSecondary">
//                       Website:
//                     </Typography>
//                     <Typography
//                       variant="body1"
//                       color="primary.main"
//                       component="a"
//                       href={
//                         profileData.website.startsWith("http")
//                           ? profileData.website
//                           : `https://${profileData.website}`
//                       }
//                     >
//                       {profileData.website}
//                     </Typography>
//                   </Box>
//                 </Box>
//               </Box>
//             </CardContent>
//           </Card>
//
//           {/* Recent Activity */}
//           <Card>
//             <CardContent>
//               <Box
//                 sx={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   alignItems: "center",
//                   mb: 2,
//                 }}
//               >
//                 <Typography variant="h6">Recent Activity</Typography>
//                 <Box>
//                   <Button size="small">Today</Button>
//                   <Button size="small">Weekly</Button>
//                   <Button size="small">Monthly</Button>
//                 </Box>
//               </Box>
//               <Divider sx={{ my: 2 }} />
//
//               <Box sx={{ display: "flex", gap: 2, alignItems: "start", mb: 2 }}>
//                 <Avatar
//                   src="/static/images/avatar/jacqueline.jpg"
//                   alt="Jacqueline Steve"
//                 />
//                 <Box>
//                   <Typography variant="subtitle2">Jacqueline Steve</Typography>
//                   <Typography variant="body2" color="textSecondary">
//                     We has changed 2 attributes on 05:16PM
//                   </Typography>
//                 </Box>
//               </Box>
//
//               <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
//                 In an awareness campaign, it is vital for people to begin put 2
//                 and 2 together and begin to recognize your cause. Too much or
//                 too little spacing, as in the example below, can make things
//                 unpleasant for the reader. The goal is to...
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>
//
//       {/* Edit Profile Dialog */}
//       <Dialog
//         open={openEditDialog}
//         onClose={handleCloseEditDialog}
//         maxWidth="md"
//         fullWidth
//       >
//         <DialogTitle>
//           <Box
//             sx={{
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//             }}
//           >
//             <Typography variant="h6">Edit Dealer Profile</Typography>
//             <IconButton onClick={handleCloseEditDialog}>
//               <Close />
//             </IconButton>
//           </Box>
//         </DialogTitle>
//         <DialogContent>
//           <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
//             <Grid container spacing={3}>
//               <Grid size={{ xs: 12 }}>
//                 <TextField
//                   fullWidth
//                   label="Dealer Name"
//                   name="name"
//                   value={profileData.name}
//                   onChange={handleInputChange}
//                   required
//                 />
//               </Grid>
//               <Grid size={{ xs: 12 }}>
//                 <TextField
//                   fullWidth
//                   label="Username"
//                   name="username"
//                   value={profileData.username}
//                   onChange={handleInputChange}
//                   required
//                 />
//               </Grid>
//               <Grid size={{ xs: 12 }}>
//                 <TextField
//                   fullWidth
//                   label="Owner Name"
//                   name="owner"
//                   value={profileData.owner}
//                   onChange={handleInputChange}
//                   required
//                 />
//               </Grid>
//               <Grid size={{ xs: 12 }}>
//                 <TextField
//                   fullWidth
//                   label="Email"
//                   name="email"
//                   value={profileData.email}
//                   onChange={handleInputChange}
//                   required
//                   type="email"
//                 />
//               </Grid>
//               <Grid size={{ xs: 12 }}>
//                 <TextField
//                   fullWidth
//                   label="Contact Email"
//                   name="contactEmail"
//                   value={profileData.contactEmail}
//                   onChange={handleInputChange}
//                   required
//                   type="email"
//                 />
//               </Grid>
//               <Grid size={{ xs: 12 }}>
//                 <TextField
//                   fullWidth
//                   label="Location"
//                   name="location"
//                   value={profileData.location}
//                   onChange={handleInputChange}
//                   required
//                 />
//               </Grid>
//               <Grid size={{ xs: 12 }}>
//                 <TextField
//                   fullWidth
//                   label="Logo URL"
//                   name="logo"
//                   value={profileData.logo}
//                   onChange={handleInputChange}
//                 />
//               </Grid>
//               <Grid size={{ xs: 12 }}>
//                 <TextField
//                   fullWidth
//                   label="Website"
//                   name="website"
//                   value={profileData.website}
//                   onChange={handleInputChange}
//                   required
//                 />
//               </Grid>
//               {profileData.tierId !== undefined && (
//                 <Grid size={{ xs: 12 }}>
//                   <TextField
//                     fullWidth
//                     label="Tier ID"
//                     name="tierId"
//                     value={profileData.tierId}
//                     onChange={(e) =>
//                       setProfileData((prev) => ({
//                         ...prev,
//                         tierId: parseInt(e.target.value) || undefined,
//                       }))
//                     }
//                     type="number"
//                   />
//                 </Grid>
//               )}
//             </Grid>
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseEditDialog}>Cancel</Button>
//           <Button
//             type="submit"
//             variant="contained"
//             color="primary"
//             onClick={handleSubmit}
//           >
//             Save Changes
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// };
//
// export default ProfilePage;
