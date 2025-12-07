/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import { AuthApi } from "@/services/api";

export default function ConfirmOnRefresh() {
    const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ("", true);

    const shouldConfirm = false;

    useEffect(() => {
        if (!shouldConfirm) return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = ""; 
            return "";
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [shouldConfirm]);

    return null;
}
