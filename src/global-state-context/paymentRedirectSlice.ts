import { createSlice } from '@reduxjs/toolkit';

interface PaymentRedirectState {
  isRedirectingToPayment: boolean;
}

const initialState: PaymentRedirectState = {
  isRedirectingToPayment: false,
};

const paymentRedirectSlice = createSlice({
  name: 'paymentRedirect',
  initialState,
  reducers: {
    setRedirectingToPayment: (state, action) => {
      state.isRedirectingToPayment = action.payload;
    },
  },
});

export const { setRedirectingToPayment } = paymentRedirectSlice.actions;
export default paymentRedirectSlice.reducer;