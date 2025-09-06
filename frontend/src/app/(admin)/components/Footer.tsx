"use client";
import { Box, Typography } from "@mui/material";
import type { JSX } from "react";

// biome-ignore lint/suspicious/noExplicitAny: <no reason>
const Footer = ({ theme }: { theme: any }): JSX.Element => {
  return (
    <Box
      sx={{
        mt: 4,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        pt: 2,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Typography variant="caption" color={theme.palette.text.secondary}>
        2025 © Velzon.
      </Typography>
      <Typography variant="caption" color={theme.palette.text.secondary}>
        Design & Develop by Themesbrand
      </Typography>
    </Box>
  );
};

export default Footer;
