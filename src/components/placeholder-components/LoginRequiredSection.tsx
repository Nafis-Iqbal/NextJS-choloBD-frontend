"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaUserPlus } from "react-icons/fa";

interface LoginRequiredSectionProps {
    message?: string;
    buttonLabel?: string;
    redirectTo?: string;
}

export const LoginRequiredSection = ({
    message = "You need to login to use this feature.",
    buttonLabel = "Sign Up",
    redirectTo,
}: LoginRequiredSectionProps) => {
    const pathname = usePathname();
    const afterLogin = redirectTo ?? pathname ?? "/";
    const loginHref = `/login?redirect=${encodeURIComponent(afterLogin)}`;

    return (
        <div
            className="flex w-full items-center justify-center px-4 py-16 font-sans"
            role="status"
        >
            <div className="theme-section flex w-full max-w-md flex-col items-center gap-4 rounded-xl px-6 py-10 text-center">
                <div
                    className="flex h-14 w-14 items-center justify-center rounded-full"
                    style={{
                        backgroundColor:
                            "color-mix(in srgb, var(--theme-teal) 16%, transparent)",
                    }}
                >
                    <FaUserPlus className="text-3xl theme-text-teal" aria-hidden />
                </div>
                <h2 className="text-xl font-semibold theme-text">{message}</h2>
                <Link
                    href={loginHref}
                    className="theme-btn-teal mt-2 rounded-lg px-6 py-2.5 text-sm font-semibold"
                >
                    {buttonLabel}
                </Link>
            </div>
        </div>
    );
};
