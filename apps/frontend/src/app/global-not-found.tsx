"use client";

import { Box, Button, Container, Typography, useTheme } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Your website description here" />
        <meta name="keywords" content="keyword1, keyword2, keyword3" />
        <meta name="author" content="Your Name" />
        <meta name="robots" content="index, follow" />
      </head>
      <body>
        <Container
          component="main"
          maxWidth="md"
          sx={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "center",
            alignItems: "center",
            textAlign: { xs: "center", md: "left" },
            py: 4,
            gap: 4,
          }}
        >
          {/* Illustration */}
          <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <Box sx={{ position: "relative", width: 300, height: 300 }}>
              {/* Cloud */}
              <Box
                sx={{
                  position: "absolute",
                  top: 50,
                  left: 50,
                  width: 200,
                  height: 80,
                  background: theme.palette.grey[300],
                  borderRadius: "100px",
                  opacity: 0.8,
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: 30,
                  left: 90,
                  width: 120,
                  height: 120,
                  background: theme.palette.grey[300],
                  borderRadius: "50%",
                  opacity: 0.8,
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: 70,
                  left: 130,
                  width: 100,
                  height: 100,
                  background: theme.palette.grey[300],
                  borderRadius: "50%",
                  opacity: 0.8,
                }}
              />

              {/* Question Mark */}
              <Typography
                sx={{
                  position: "absolute",
                  top: 80,
                  left: 150,
                  fontSize: "6rem",
                  fontWeight: "bold",
                  color: theme.palette.primary.main,
                  textShadow: `0 0 20px ${theme.palette.primary.light}`,
                  zIndex: 1,
                  animation: "pulse 2s infinite",
                }}
              >
                ?
              </Typography>

              {/* Floating Elements */}
              <Box
                sx={{
                  position: "absolute",
                  top: 20,
                  right: 20,
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: theme.palette.secondary.light,
                  animation: "float 6s ease-in-out infinite",
                }}
              />

              <Box
                sx={{
                  position: "absolute",
                  bottom: 40,
                  left: 30,
                  width: 15,
                  height: 15,
                  borderRadius: "50%",
                  background: theme.palette.primary.light,
                  animation: "float 8s ease-in-out infinite reverse",
                }}
              />
            </Box>
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, maxWidth: 500 }}>
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontWeight: 800,
                mb: 2,
                fontSize: { xs: "3rem", sm: "4rem" },
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Lost in Space?
            </Typography>

            <Typography
              variant="h6"
              component="p"
              color="text.secondary"
              sx={{ mb: 4, lineHeight: 1.6 }}
            >
              The page you're looking for doesn't exist or has been moved to
              another galaxy. Let us help you find your way back home.
            </Typography>

            {/* Action Buttons */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => router.back()}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  boxShadow: 3,
                  "&:hover": {
                    boxShadow: 6,
                    transform: "translateY(-2px)",
                    transition: "all 0.2s ease",
                  },
                }}
              >
                Go Back
              </Button>

              <Button
                variant="outlined"
                size="large"
                component={Link}
                href="/"
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  borderWidth: 2,
                  "&:hover": {
                    borderWidth: 2,
                    transform: "translateY(-2px)",
                    transition: "all 0.2s ease",
                  },
                }}
              >
                Return Home
              </Button>
            </Box>
          </Box>

          <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
        </Container>
      </body>
    </html>
  );
}
