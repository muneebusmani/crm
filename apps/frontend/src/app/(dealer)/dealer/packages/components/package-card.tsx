import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Box, Button, Paper, Typography } from '@mui/material';
import type React from 'react';

interface Feature {
  label: string;
  available: boolean;
}

interface Plan {
  name: string;
  price: number;
  description: string;
  features: Feature[];
  isCurrent?: boolean;
  popular?: boolean;
  buttonText: string;
}

const PackageCard: React.FC<{ plan: Plan }> = ({ plan }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 2,
        border: '1px solid #e0e0e0',
        transition: 'box-shadow 0.3s ease',
        '&:hover': {
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
        },
        position: 'relative',
      }}
    >
      {plan.popular && (
        <Box
          sx={{
            position: 'absolute',
            top: -10,
            right: 0,
            transform: 'translateY(-50%)',
            background: '#f44336',
            color: 'white',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            padding: '4px 12px',
            clipPath: 'polygon(0 0, 100% 0, 90% 100%, 10% 100%)',
            transformOrigin: 'top right',
          }}
        >
          Popular
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          {plan.name}
        </Typography>
        <Typography variant="h5" fontWeight="bold">
          ${plan.price}{' '}
          <Typography variant="body2" color="textSecondary">
            /Month
          </Typography>
        </Typography>
      </Box>

      <Typography variant="body2" color="textSecondary" mb={2}>
        {plan.description}
      </Typography>

      <Box sx={{ mb: 3 }}>
        {plan.features.map((feature) => (
          <Box
            key={feature.label}
            sx={{ display: 'flex', alignItems: 'center', my: 1 }}
          >
            <Box
              sx={{
                mr: 1,
                color: feature.available ? '#4caf50' : '#f44336',
              }}
            >
              {feature.available ? (
                <CheckCircleIcon fontSize="small" />
              ) : (
                <CancelIcon fontSize="small" />
              )}
            </Box>
            <Typography
              variant="body2"
              fontWeight={feature.available ? 'normal' : 'medium'}
            >
              {feature.label}
            </Typography>
          </Box>
        ))}
      </Box>

      <Button
        fullWidth
        variant={plan.isCurrent ? 'contained' : 'outlined'}
        color={plan.isCurrent ? 'error' : 'primary'}
        size="large"
        sx={{
          py: 1.5,
          textTransform: 'none',
          fontWeight: 'medium',
        }}
      >
        {plan.buttonText}
      </Button>
    </Paper>
  );
};

export default PackageCard;
