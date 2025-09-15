"use client";
import {
  Box,
  Button,
  ButtonGroup,
  Chip,
  Container,
  Grid,
  Typography,
} from "@mui/material";
import { useState } from "react";
import PackageCard from "../components/PackageCard";

const PricingPage = () => {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">(
    "monthly",
  );

  const plans: Array<{
    name: string;
    price: number;
    description: string;
    features: Array<{ label: string; available: boolean }>;
    isCurrent?: boolean;
    popular?: boolean;
    buttonText: string;
  }> = [
    {
      name: "Starter",
      price: billingPeriod === "monthly" ? 19 : 14.25,
      description: "The perfect way to get started and get used to our tools.",
      features: [
        { label: "3 Projects", available: true },
        { label: "299 Customers", available: true },
        { label: "Scalable Bandwidth", available: true },
        { label: "5 FTP Login", available: true },
        { label: "24/7 Support", available: false },
        { label: "Unlimited Storage", available: false },
        { label: "Domain", available: false },
      ],
      isCurrent: true,
      buttonText: "Your Current Plan",
    },
    {
      name: "Professional",
      price: billingPeriod === "monthly" ? 29 : 21.75,
      description:
        "Excellent for scaling teams to build culture. Special plan for professional business.",
      features: [
        { label: "8 Projects", available: true },
        { label: "449 Customers", available: true },
        { label: "Scalable Bandwidth", available: true },
        { label: "7 FTP Login", available: true },
        { label: "24/7 Support", available: true },
        { label: "Unlimited Storage", available: false },
        { label: "Domain", available: false },
      ],
      buttonText: "Change Plan",
    },
    {
      name: "Enterprise",
      price: billingPeriod === "monthly" ? 39 : 29.25,
      description:
        "This plan is for those who have a team already and running a large business.",
      features: [
        { label: "15 Projects", available: true },
        { label: "Unlimited Customers", available: true },
        { label: "Scalable Bandwidth", available: true },
        { label: "12 FTP Login", available: true },
        { label: "24/7 Support", available: true },
        { label: "35GB Storage", available: true },
        { label: "Domain", available: false },
      ],
      popular: true,
      buttonText: "Change Plan",
    },
    {
      name: "Unlimited",
      price: billingPeriod === "monthly" ? 49 : 36.75,
      description: "For most businesses that want to optimize web queries.",
      features: [
        { label: "Unlimited Projects", available: true },
        { label: "Unlimited Customers", available: true },
        { label: "Scalable Bandwidth", available: true },
        { label: "Unlimited FTP Login", available: true },
        { label: "24/7 Support", available: true },
        { label: "Unlimited Storage", available: true },
        { label: "Domain", available: true },
      ],
      buttonText: "Change Plan",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f9f9f9",
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        <Box textAlign="center" mb={6}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Plans & Pricing
          </Typography>
          <Typography variant="body1" color="textSecondary" component={"p"}>
            Simple pricing. No hidden fees. Advanced features for your business.
          </Typography>

          <ButtonGroup
            variant="outlined"
            color="primary"
            aria-label="pricing period"
            sx={{ mt: 2, justifyContent: "center" }}
          >
            <Button
              variant={billingPeriod === "monthly" ? "contained" : "outlined"}
              onClick={() => setBillingPeriod("monthly")}
              sx={{ textTransform: "none", fontWeight: 500 }}
            >
              Monthly
            </Button>
            <Button
              variant={billingPeriod === "annually" ? "contained" : "outlined"}
              onClick={() => setBillingPeriod("annually")}
              sx={{ textTransform: "none", fontWeight: 500 }}
            >
              Annually
              <Chip
                size="small"
                label="25% off"
                color="success"
                sx={{ ml: 1, fontSize: "0.7rem" }}
              />
            </Button>
          </ButtonGroup>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {plans.map((plan) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={plan.name}>
              <PackageCard plan={plan} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default PricingPage;
