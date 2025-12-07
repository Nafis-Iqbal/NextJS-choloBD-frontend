import { useAuthDispatch } from "../state-hooks";
import { logout } from "../../global-state-context/authSlice";
import {useRouter} from "next/navigation";
import { queryClient } from "../../services/apiInstance";
import { AuthApi } from "../../services/api";

const useLogout = () => {
    const dispatch = useAuthDispatch(); // ✅ Call inside another hook
    const router = useRouter();

    const { mutate: logoutMutate } = AuthApi.useLogoutUserRQ(
        (responseData) => {
            // On successful logout from backend
            if(responseData.status === "success") {
                queryClient.invalidateQueries();
                queryClient.clear();
                
                dispatch(logout());
                router.push("/");
            }
        },
        () => {
            // On error, still clear local state as fallback
            queryClient.invalidateQueries();
            queryClient.clear();
            
            dispatch(logout());
            router.push("/");
        }
    );

    return () => {
        // Call the logout mutation
        logoutMutate();
    };
};

export default useLogout;