'use client';

import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  Divider,
  FormControlLabel,
  IconButton,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import React, { useCallback, useMemo, useState } from 'react';

const InvoiceDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [sameAddress, setSameAddress] = useState(false);
  const [generated, setGenerated] = useState(false); // 👈 New state

  // Product state
  const [products, setProducts] = useState([
    {
      id: 1,
      name: '',
      details: '',
      price: '',
      quantity: 1,
    },
  ]);

  // Editable charges
  const [taxAmount, setTaxAmount] = useState('0.00');
  const [discountAmount, setDiscountAmount] = useState('0.00');
  const [shippingAmount, setShippingAmount] = useState('0.00');

  // Shipping address fields
  const [shippingName, setShippingName] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');

  // Company info
  const [companyAddress, setCompanyAddress] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [contactNo, setContactNo] = useState('');

  // Bank details (for 3 banks)
  const [bankDetails, setBankDetails] = useState([
    { acc: '', name: '', bank: '' },
    { acc: '', name: '', bank: '' },
    { acc: '', name: '', bank: '' },
  ]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Handle product input changes
  const handleProductChange = (
    id: number,
    field: string,
    value: string | number,
  ) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
  };

  // Handle quantity change (+/-)
  const handleQuantityChange = (id: number, delta: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, quantity: Math.max(0, p.quantity + delta) } : p,
      ),
    );
  };

  // Add new product
  const addProduct = () => {
    const newId = Math.max(...products.map((p) => p.id)) + 1;
    setProducts([
      ...products,
      { id: newId, name: '', details: '', price: '', quantity: 1 },
    ]);
  };

  // Remove product
  const removeProduct = (id: number) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  // Handle bank detail change
  const handleBankChange = (index: number, field: string, value: string) => {
    const newBanks = [...bankDetails];
    newBanks[index] = { ...newBanks[index], [field]: value };
    setBankDetails(newBanks);
  };

  // Calculate amount for a row
  const calculateRowAmount = useCallback(
    (price: string, quantity: number): number => {
      const p = parseFloat(price) || 0;
      return p * quantity;
    },
    [],
  );

  // Totals calculation
  const totals = useMemo(() => {
    let subTotal = 0;
    products.forEach((p) => {
      subTotal += calculateRowAmount(p.price, p.quantity);
    });

    const tax = parseFloat(taxAmount) || 0;
    const discount = parseFloat(discountAmount) || 0;
    const shipping = parseFloat(shippingAmount) || 0;

    const total = subTotal + tax - discount + shipping;

    return {
      subTotal: subTotal.toFixed(2),
      tax: tax.toFixed(2),
      discount: discount.toFixed(2),
      shipping: shipping.toFixed(2),
      total: total.toFixed(2),
    };
  }, [products, taxAmount, discountAmount, shippingAmount, calculateRowAmount]);

  return (
    <>
      <Button variant="contained" color="error" onClick={handleOpen}>
        Send Invoice
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogContent>
          <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
            {/* Header */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  gutterBottom
                  sx={{ fontFamily: 'Arial, sans-serif' }}
                >
                  Invoice
                </Typography>
                <TextField
                  fullWidth
                  label="Company Address"
                  multiline
                  minRows={2}
                  margin="dense"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  sx={{
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: 'divider',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'divider',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="Email Address"
                  margin="dense"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: 'divider',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'divider',
                      },
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Website"
                  margin="dense"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  sx={{
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: 'divider',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'divider',
                      },
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Contact No"
                  margin="dense"
                  value={contactNo}
                  onChange={(e) => setContactNo(e.target.value)}
                  sx={{
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: 'divider',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'divider',
                      },
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Invoice Details */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 3 }}>
                <TextField
                  fullWidth
                  label="Invoice No"
                  value="#VL25000355"
                  disabled
                  sx={{
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: 'divider',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'divider',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 3 }}>
                <TextField
                  fullWidth
                  label="Date"
                  type="datetime-local"
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={{
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: 'divider',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'divider',
                      },
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Shipping Address Only */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  SHIPPING ADDRESS
                </Typography>
                <TextField
                  fullWidth
                  label="Full Name"
                  margin="dense"
                  value={shippingName}
                  onChange={(e) => setShippingName(e.target.value)}
                  sx={{
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: 'divider',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'divider',
                      },
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Address"
                  margin="dense"
                  multiline
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  sx={{
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: 'divider',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'divider',
                      },
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Phone"
                  margin="dense"
                  value={shippingPhone}
                  onChange={(e) => setShippingPhone(e.target.value)}
                  sx={{
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: 'divider',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'divider',
                      },
                    },
                  }}
                />
              </Grid>
            </Grid>

            <FormControlLabel
              control={
                <Checkbox
                  checked={sameAddress}
                  onChange={(e) => setSameAddress(e.target.checked)}
                />
              }
              label="Will your Billing and Shipping address same?"
              sx={{ mt: 1 }}
            />

            <Divider sx={{ my: 3 }} />

            {/* Product Table */}
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                PRODUCTS
              </Typography>

              {products.map((product, index) => (
                <Paper
                  key={product.id}
                  elevation={0}
                  sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1, mb: 2 }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 1 }}>
                      <Typography>{index + 1}</Typography>
                    </Grid>

                    <Grid size={{ xs: 4 }}>
                      <TextField
                        fullWidth
                        placeholder="Product Name"
                        margin="dense"
                        value={product.name}
                        onChange={(e) =>
                          handleProductChange(
                            product.id,
                            'name',
                            e.target.value,
                          )
                        }
                        sx={{
                          bgcolor: 'background.paper',
                          borderRadius: 1,
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': { borderColor: 'divider' },
                            '&.Mui-focused fieldset': {
                              borderColor: 'divider',
                            },
                          },
                        }}
                      />
                      <TextField
                        fullWidth
                        placeholder="Product Details"
                        margin="dense"
                        multiline
                        rows={2}
                        value={product.details}
                        onChange={(e) =>
                          handleProductChange(
                            product.id,
                            'details',
                            e.target.value,
                          )
                        }
                        sx={{
                          bgcolor: 'background.paper',
                          borderRadius: 1,
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': { borderColor: 'divider' },
                            '&.Mui-focused fieldset': {
                              borderColor: 'divider',
                            },
                          },
                        }}
                      />
                    </Grid>

                    <Grid size={{ xs: 2 }}>
                      <TextField
                        fullWidth
                        placeholder="0.00"
                        margin="dense"
                        type="number"
                        slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                        value={product.price}
                        onChange={(e) =>
                          handleProductChange(
                            product.id,
                            'price',
                            e.target.value,
                          )
                        }
                        sx={{
                          bgcolor: 'background.paper',
                          borderRadius: 1,
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': { borderColor: 'divider' },
                            '&.Mui-focused fieldset': {
                              borderColor: 'divider',
                            },
                          },
                        }}
                      />
                    </Grid>

                    <Grid size={{ xs: 2 }}>
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        sx={{ gap: 0.5 }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(product.id, -1)}
                          disabled={product.quantity <= 0}
                          sx={{ bgcolor: 'action.hover', borderRadius: 1 }}
                        >
                          –
                        </IconButton>
                        <Typography
                          variant="body2"
                          sx={{ minWidth: 20, textAlign: 'center' }}
                        >
                          {product.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(product.id, 1)}
                          sx={{ bgcolor: 'action.hover', borderRadius: 1 }}
                        >
                          +
                        </IconButton>
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 2 }}>
                      <TextField
                        fullWidth
                        placeholder="$0.00"
                        margin="dense"
                        value={`$${calculateRowAmount(
                          product.price,
                          product.quantity,
                        ).toFixed(2)}`}
                        disabled
                        sx={{
                          bgcolor: 'background.paper',
                          borderRadius: 1,
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': { borderColor: 'divider' },
                            '&.Mui-focused fieldset': {
                              borderColor: 'divider',
                            },
                          },
                        }}
                      />
                    </Grid>

                    <Grid size={{ xs: 1 }}>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => removeProduct(product.id)}
                        sx={{
                          borderRadius: 1,
                        }}
                      >
                        Delete
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              ))}

              <Button
                variant="outlined"
                color="primary"
                startIcon={<AddIcon />}
                onClick={addProduct}
                sx={{
                  bgcolor: 'primary.light',
                  color: 'primary.main',
                  border: (theme) => `1px solid ${theme.palette.primary.main}`,
                  '&:hover': {
                    bgcolor: 'primary.light',
                    border: (theme) => `1px solid ${theme.palette.primary.main}`,
                  },
                  borderRadius: 1,
                }}
              >
                Add Item
              </Button>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Totals */}
            <Box display="flex" justifyContent="flex-end">
              <Box sx={{ width: 300 }}>
                <Grid container spacing={1}>
                  <Grid size={{ xs: 8 }}>
                    <Typography variant="body2" fontWeight="bold">
                      Sub Total
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <TextField
                      fullWidth
                      value={`$${totals.subTotal}`}
                      margin="dense"
                      disabled
                      sx={{
                        bgcolor: 'action.hover',
                        borderRadius: 1,
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: 'divider' },
                          '&.Mui-focused fieldset': { borderColor: 'divider' },
                        },
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 8 }}>
                    <Typography variant="body2" fontWeight="bold">
                      Tax Amount
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <TextField
                      fullWidth
                      value={taxAmount}
                      onChange={(e) => setTaxAmount(e.target.value)}
                      margin="dense"
                      type="number"
                      slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                      sx={{
                        bgcolor: 'action.hover',
                        borderRadius: 1,
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: 'divider' },
                          '&.Mui-focused fieldset': { borderColor: 'divider' },
                        },
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 8 }}>
                    <Typography variant="body2" fontWeight="bold">
                      Discount Amount
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <TextField
                      fullWidth
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(e.target.value)}
                      margin="dense"
                      type="number"
                      slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                      sx={{
                        bgcolor: 'action.hover',
                        borderRadius: 1,
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: 'divider' },
                          '&.Mui-focused fieldset': { borderColor: 'divider' },
                        },
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 8 }}>
                    <Typography variant="body2" fontWeight="bold">
                      Shipping Charge
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <TextField
                      fullWidth
                      value={shippingAmount}
                      onChange={(e) => setShippingAmount(e.target.value)}
                      margin="dense"
                      type="number"
                      slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                      sx={{
                        bgcolor: 'action.hover',
                        borderRadius: 1,
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: 'divider' },
                          '&.Mui-focused fieldset': { borderColor: 'divider' },
                        },
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 8 }}>
                    <Typography variant="body2" fontWeight="bold">
                      Total Amount
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <TextField
                      fullWidth
                      value={`$${totals.total}`}
                      margin="dense"
                      disabled
                      sx={{
                        bgcolor: 'action.hover',
                        borderRadius: 1,
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: 'divider' },
                          '&.Mui-focused fieldset': { borderColor: 'divider' },
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Payment Details - Bank Only */}
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              PAYMENT DETAILS
            </Typography>

            {[0, 1, 2].map((index) => (
              <Box
                key={index}
                sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1, mb: 2 }}
              >
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Bank Details {index + 1}
                </Typography>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 4 }}>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      sx={{ mb: 0.5 }}
                    >
                      Acc:
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Account Number"
                      margin="dense"
                      value={bankDetails[index].acc}
                      onChange={(e) =>
                        handleBankChange(index, 'acc', e.target.value)
                      }
                      sx={{
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: 'divider' },
                          '&.Mui-focused fieldset': { borderColor: 'divider' },
                        },
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 4 }}>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      sx={{ mb: 0.5 }}
                    >
                      Name:
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Account Holder Name"
                      margin="dense"
                      value={bankDetails[index].name}
                      onChange={(e) =>
                        handleBankChange(index, 'name', e.target.value)
                      }
                      sx={{
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: 'divider' },
                          '&.Mui-focused fieldset': { borderColor: 'divider' },
                        },
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 4 }}>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      sx={{ mb: 0.5 }}
                    >
                      Bank:
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Bank Name"
                      margin="dense"
                      value={bankDetails[index].bank}
                      onChange={(e) =>
                        handleBankChange(index, 'bank', e.target.value)
                      }
                      sx={{
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: 'divider' },
                          '&.Mui-focused fieldset': { borderColor: 'divider' },
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            ))}

            <Divider sx={{ my: 3 }} />

            {/* Notes */}
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              NOTES
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              defaultValue={`All accounts are to be paid within 7 days from receipt of invoice. To be paid by cheque or credit card or direct payment online. If account is not paid within 7 days the credits details supplied as confirmation of work undertaken will be charged the agreed quoted fee noted above.`}
              sx={{
                bgcolor: 'info.light',
                borderRadius: 1,
                '& .MuiInputBase-input': {
                  p: 1.5,
                  fontSize: '0.875rem',
                },
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: 'info.main',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'info.main',
                  },
                },
              }}
            />

            {/* === INVOICE PREVIEW (SLIP STYLE) === */}
            {generated && (
              <Paper
                elevation={2}
                sx={{
                  mt: 4,
                  p: 4,
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  maxWidth: '800px',
                  mx: 'auto',
                }}
              >
                {/* Header */}
                <Box textAlign="center" mb={3}>
                  <Typography variant="h5" fontWeight="bold">
                    INVOICE
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    #VL25000355
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  {/* Company Info */}
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      From:
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {companyAddress || 'Company Address'}
                    </Typography>
                  </Grid>

                  {/* Shipping Address */}
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Bill To:
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {shippingName || '–'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {shippingAddress || ''}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {shippingPhone || ''}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                {/* Products Table */}
                <Box mt={2}>
                  <Grid container sx={{ fontWeight: 'bold', mb: 1 }}>
                    <Grid size={{ xs: 1 }}>#</Grid>
                    <Grid size={{ xs: 4 }}>Description</Grid>
                    <Grid size={{ xs: 2 }} textAlign="right">
                      Rate
                    </Grid>
                    <Grid size={{ xs: 2 }} textAlign="right">
                      Qty
                    </Grid>
                    <Grid size={{ xs: 3 }} textAlign="right">
                      Amount
                    </Grid>
                  </Grid>

                  {products.map((product, index) => (
                    <Grid container key={product.id} sx={{ mb: 1 }}>
                      <Grid size={{ xs: 1 }}>{index + 1}</Grid>
                      <Grid size={{ xs: 4 }}>
                        <Typography variant="body2">
                          {product.name || '–'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {product.details || ''}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 2 }} textAlign="right">
                        ${parseFloat(product.price || '0').toFixed(2)}
                      </Grid>
                      <Grid size={{ xs: 2 }} textAlign="right">
                        {product.quantity}
                      </Grid>
                      <Grid size={{ xs: 3 }} textAlign="right">
                        $
                        {calculateRowAmount(
                          product.price,
                          product.quantity,
                        ).toFixed(2)}
                      </Grid>
                    </Grid>
                  ))}
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Totals */}
                <Box
                  display="flex"
                  justifyContent="flex-end"
                  sx={{ width: '100%' }}
                >
                  <Box sx={{ width: 250 }}>
                    <Grid container>
                      <Grid size={{ xs: 7 }} sx={{ py: 0.5 }}>
                        <Typography variant="body2">Sub Total</Typography>
                      </Grid>
                      <Grid size={{ xs: 5 }} sx={{ py: 0.5 }} textAlign="right">
                        ${totals.subTotal}
                      </Grid>

                      <Grid size={{ xs: 7 }} sx={{ py: 0.5 }}>
                        <Typography variant="body2">Tax Amount</Typography>
                      </Grid>
                      <Grid size={{ xs: 5 }} sx={{ py: 0.5 }} textAlign="right">
                        ${totals.tax}
                      </Grid>

                      <Grid size={{ xs: 7 }} sx={{ py: 0.5 }}>
                        <Typography variant="body2">Discount</Typography>
                      </Grid>
                      <Grid size={{ xs: 5 }} sx={{ py: 0.5 }} textAlign="right">
                        ${totals.discount}
                      </Grid>

                      <Grid size={{ xs: 7 }} sx={{ py: 0.5 }}>
                        <Typography variant="body2">Shipping</Typography>
                      </Grid>
                      <Grid size={{ xs: 5 }} sx={{ py: 0.5 }} textAlign="right">
                        ${totals.shipping}
                      </Grid>

                      <Grid size={{ xs: 12 }}>
                        <Divider sx={{ my: 1 }} />
                      </Grid>

                      <Grid size={{ xs: 7 }} sx={{ py: 0.5 }}>
                        <Typography variant="h6" fontWeight="bold">
                          Total Amount
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 5 }} sx={{ py: 0.5 }} textAlign="right">
                        <Typography variant="h6" fontWeight="bold">
                          ${totals.total}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Payment Details Preview */}
                <Box mt={2}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    Payment Details
                  </Typography>
                  {bankDetails.map((bank, i) => (
                    <Box key={bank.name} mb={1}>
                      <Typography variant="body2" fontWeight="bold">
                        Bank Details {i + 1}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Acc: {bank.acc || '–'} | Name: {bank.name || '–'} |
                        Bank: {bank.bank || '–'}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Box mt={2}>
                  <Typography variant="body2" fontWeight="bold">
                    Notes:
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    All accounts are to be paid within 7 days from receipt of
                    invoice...
                  </Typography>
                </Box>
              </Paper>
            )}

            {/* Footer Buttons */}
            {!generated ? (
              <Box display="flex" justifyContent="flex-end" mt={3}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setGenerated(true)}
                  sx={{
                    bgcolor: 'primary.main',
                    '&:hover': { bgcolor: 'primary.dark' },
                    borderRadius: 1,
                  }}
                >
                  Generate Invoice
                </Button>
              </Box>
            ) : (
              <Box display="flex" justifyContent="center" gap={2} mt={3}>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleClose}
                  sx={{
                    bgcolor: 'error.main',
                    '&:hover': { bgcolor: 'error.dark' },
                    borderRadius: 1,
                  }}
                >
                  Send Invoice
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setGenerated(false)}
                  sx={{
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    '&:hover': { borderColor: 'primary.dark' },
                    borderRadius: 1,
                  }}
                >
                  Edit
                </Button>
              </Box>
            )}
          </Paper>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InvoiceDialog;
