"use client";
import { Box, Typography } from "@mui/material";
import type { JSX } from "react";

// biome-ignore lint/suspicious/noExplicitAny: <no reason>
const Header = ({ theme }: { theme: any }): JSX.Element => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 3,
        borderBottom: `1px solid ${theme.palette.divider}`,
        pb: 1,
      }}
    >
      <Typography variant="h5" fontWeight="bold">
        DEALERS
      </Typography>
      <Typography variant="body2" color={theme.palette.text.secondary}>
        CRM &gt; Dealers
      </Typography>
    </Box>
  );
};

export default Header;
