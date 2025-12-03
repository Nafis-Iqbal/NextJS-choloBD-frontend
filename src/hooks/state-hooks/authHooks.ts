import { useDispatch, useSelector } from 'react-redux';
import store  from '../../global-state-context/globalStateStore';
import type {AuthState} from '../../global-state-context/authSlice';

// Custom hooks to use in components
export const useAuthDispatch = () => useDispatch<typeof store.dispatch>();
export const useAuthSelector = <TSelected>(selector: (state: { auth: AuthState }) => TSelected): TSelected =>
  useSelector(selector);