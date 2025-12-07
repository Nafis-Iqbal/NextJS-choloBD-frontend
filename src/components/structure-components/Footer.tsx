"use client";

import { Github, Linkedin } from "lucide-react";
import Image from "next/image";
import { AuthApi } from "@/services/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

import DivGap, {HorizontalDivider, VerticalDivider} from "../custom-elements/UIUtilities";
import { AboutSection } from "../page-content/AboutSection";

const Footer: React.FC = () => {
    const router = useRouter();
    
    const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;

    const onLogInClick = () => {
        router.push("/login");
    }

    const onLogOutClick = () => {
        // TODO: Implement your custom logout logic here
        router.push("/");
    }

    return (
        <div className="flex flex-col bg-[#00FF99]">
            <DivGap customHeightGap="h-[30px] bg-inherit"/>

            <div className="flex flex-col md:flex-row p-1 bg-inherit">
                <AboutSection/>

                <VerticalDivider className="hidden md:block my-auto border-green-700" height="h-[250px]"/>

                <HorizontalDivider className="sm:hidden w-[80%] mx-auto border-green-700"/>

                <div className="flex flex-col justify-center w-full sm:w-[50%] text-center sm:text-start text-sm text-green-800 font-sans font-semibold bg-inherit">
                    <Link className="sm:ml-10 p-2 mt-5 hover:underline hover:text-green-700" href="#experience">Language</Link>
                    <Link className="sm:ml-10 p-2 hover:underline hover:text-green-700" href="#projectLinks">Special Deals</Link>
                    <Link className="sm:ml-10 p-2 hover:underline hover:text-green-700" href="/cart">Cart</Link>
                    {isAuthenticated ? (
                        <a className="sm:ml-10 p-2 cursor-pointer hover:underline hover:text-green-500" onClick={onLogOutClick}>Log Out</a>
                    ) : (
                        <Link className="sm:ml-10 p-2 hover:underline hover:text-green-700" href="/login">Log In</Link>
                    )}
                </div>
            </div>

            <DivGap customHeightGap="h-[80px] sm:h-[30px] bg-inherit"/>
        </div>
    );
}

export default Footer;