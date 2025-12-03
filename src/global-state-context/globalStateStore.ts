import { configureStore } from '@reduxjs/toolkit';
import {authReducer} from './authSlice';
import commonPopUpReducer from './commonPopUpSlice'
import paymentRedirectReducer from './paymentRedirectSlice';


// Configure the store
const store = configureStore({
    reducer: {
      auth: authReducer,
      popUps: commonPopUpReducer,
      paymentRedirect: paymentRedirectReducer,
    },
  });
  
// Export the store
export default store;