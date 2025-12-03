import { useDispatch } from 'react-redux';
import { setLoading, setNotification } from '../../global-state-context/commonPopUpSlice';

export const useGlobalUI = () => {
    const dispatch = useDispatch();

    const showLoadingContent = (setStatus: boolean) => {
        dispatch(setLoading(setStatus));
    };

    const openNotificationPopUpMessage = (notificationMessage: string) => {
        dispatch(setNotification({
            isVisible: true,
            message: notificationMessage,
            type: 'info'
        }));
    };

    return {
        showLoadingContent,
        openNotificationPopUpMessage
    };
};

