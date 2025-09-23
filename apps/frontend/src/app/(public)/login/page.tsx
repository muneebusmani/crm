import {
  Box,
  Button,
  Container,
  CssBaseline,
  TextField,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { loginAction } from "@/actions/loginAction";

const Logo = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      mb: 4,
    }}
  >
    <Image
      src="/images/enginefinders.jpg"
      alt="Engine Finders Logo"
      width={180}
      height={180}
      style={{ objectFit: "contain" }}
    />
  </Box>
);

export default function LoginPage() {
  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
      >
        {/* Background Image */}
        <Image
          src="/images/garage_background_1.jpg" // Placeholder background image
          alt="Garage background"
          fill
          style={{ objectFit: "cover" }}
          priority
        />

        {/* Overlay to darken background slightly */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
          }}
        />

        {/* Login Card */}
        <Container maxWidth="xl" sx={{ position: "relative", zIndex: 2 }}>
          <Box
            sx={{
              p: 4,
              borderRadius: 2,
              boxShadow: 24,
              bgcolor: "white",
              maxWidth: 400,
            }}
          >
            <Logo />

            <Typography variant="body1" color="textPrimary" mb={3}>
              Welcome to Customer relationship management system
            </Typography>

            <form action={loginAction}>
              <TextField
                label="Email *"
                type="email"
                name="email"
                id="email"
                fullWidth
                margin="normal"
                slotProps={{ inputLabel: { shrink: true } }}
                autoComplete="email"
              />

              <TextField
                label="Password *"
                type="password"
                name="password"
                id="password"
                fullWidth
                margin="normal"
                slotProps={{ inputLabel: { shrink: true } }}
                autoComplete="current-password"
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 3, py: 1.5 }}
              >
                Sign in
              </Button>
            </form>
          </Box>
        </Container>
      </Box>
    </>
  );
}
