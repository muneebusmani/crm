// store/quotationSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { quotationsApi } from '@/services/quotation.service';

export interface Quotation {
  id: number;
  leadId: number;
  subject: string;
  message: string;
  quotationPrice: number;
  createdAt?: string;
  updatedAt?: string;
}

interface QuotationState {
  items: Quotation[];
  loading: boolean;
  error: string | null;
}

const initialState: QuotationState = {
  items: [],
  loading: false,
  error: null,
};

// ✅ Fetch quotations for a lead
export const fetchQuotations = createAsyncThunk<
  Quotation[],
  number | undefined
>('quotations/fetchQuotations', async (leadId, { rejectWithValue }) => {
  try {
    const response = await quotationsApi.getQuotations(leadId);
    return response.data as Quotation[];
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to fetch quotations');
  }
});

// ✅ Send quotation and refresh
export const createQuotation = createAsyncThunk<
  Quotation,
  { leadId: number; subject: string; message: string; quotationPrice: number }
>('quotations/createQuotation', async (params, { dispatch, rejectWithValue }) => {
  try {
    const response = await quotationsApi.createQuotation(params);
    // After creating, fetch all for that lead
    dispatch(fetchQuotations(params.leadId));
    return response as Quotation;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to create quotation');
  }
});

const quotationSlice = createSlice({
  name: 'quotations',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchQuotations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchQuotations.fulfilled,
        (state, action: PayloadAction<Quotation[]>) => {
          state.loading = false;
          state.items = action.payload;
        },
      )
      .addCase(fetchQuotations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create
      .addCase(createQuotation.fulfilled, (state, action) => {
        // optional: you can push immediately for optimism
        state.items.push(action.payload);
      });
  },
});

export default quotationSlice.reducer;
