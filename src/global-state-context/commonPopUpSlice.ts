import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CommonPopupState{
    isLoading: boolean;
    notification: {
        message: string;
        type: 'success' | 'error' | 'info' | null;
        isVisible: boolean;
    };
}

const initialState: CommonPopupState = {
    isLoading: false,
    notification: {
        message: '',
        type: 'info',
        isVisible: false,
    }
}

const commonPopUpSlice = createSlice({
    name: 'popUps',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setNotification: (
            state, 
            action: PayloadAction<{
                message: string; 
                type: 'success' | 'error' | 'info'; 
                isVisible: boolean;
            }>
        ) => {
            state.notification = action.payload;
        }
    },
});

export const {setLoading, setNotification} = commonPopUpSlice.actions;
export default commonPopUpSlice.reducer;