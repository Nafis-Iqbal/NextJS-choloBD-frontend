"use client";

import Image from 'next/image';
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, redirect } from 'next/navigation';
import { AuthApi } from '@/services/api';
import { API_BASE_URL } from '@/lib/apiConfig';
import { queryClient } from '@/services/apiInstance';

import SuspenseFallback from "@/components/page-content/SuspenseFallback";
import DivGap, {HorizontalDividerWithText, Logo} from "@/components/custom-elements/UIUtilities"

function LoginContent() {
    const router = useRouter();
    const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    
    const searchParams = useSearchParams();
    const [isSignUpPage, setIsSignUpPage] = useState<boolean>(false);
    const [isEmailSignUp, setIsEmailSignUp] = useState<boolean>(false);
    const [signInFailureWarning, setSignInFailureWarning] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const [formData, setFormData] = useState<UserData>({
        userName: '',
        email: '',
        password: '',
        passwordConfirmation: ''
    });

    // Check for error in URL params (from NextAuth)
    useEffect(() => {
        const error = searchParams.get('error');
        if (error) {
            setSignInFailureWarning(true);
            switch (error) {
                case 'CredentialsSignin':
                    setErrorMessage('Wrong email or password. Please try again.');
                    break;
                case 'EmailNotVerified':
                    setErrorMessage('Please verify your email before signing in.');
                    break;
                default:
                    setErrorMessage('An error occurred during sign in. Please try again.');
            }
        }
    }, [searchParams]);

    const {mutate: createUserMutate} = AuthApi.useCreateUserRQ(
        (responseData) => {
            if(responseData.status === "success")
            {
                router.push("/");
            }
            else{
                onSignUpFailure();
            }
        },
        () => {
            onSignUpFailure();
        }
    );

    const {mutate: loginUserMutate} = AuthApi.useLoginUserRQ(
        (responseData) => {
            console.log("Login response data:", responseData);
            if(responseData.status === "success")
            {
                console.log("Login successful, redirecting to dashboard");
                router.push("/dashboard");
                //redirect("/");
            }
            else{
                console.log("Login failed with status:", responseData.status);
                onSignInFailure(responseData.message || 'Login failed. Please check your credentials.');
            }
        },
        () => {
            console.log("Login error occurred");
            onSignInFailure('An error occurred during login. Please try again.');
        }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const{name, value} = e.target;
       
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const onAccountSignUp = () => {
        createUserMutate(formData);
    }

    const onAccountLogIn = () => {
        // Create login data object with only email and password
        const loginData: LoginData = {
            email: formData.email,
            password: formData.password
        };
        loginUserMutate(loginData);
    }

    const onGoogleSignIn = () => {
        //loginGoogleMutate();
        window.location.href = `${API_BASE_URL}/auth/google`;
    }

    const onFacebookSignIn = () => {
        //loginFacebookMutate();
        window.location.href = `${API_BASE_URL}/auth/facebook`;
    }

    const onSignUpFailure = () => {
        setSignInFailureWarning(true);
        setErrorMessage('An error occurred during sign up. Please try again.');
    }

    const onSignInFailure = (message: string = 'An error occurred during sign in. Please try again.') => {
        setSignInFailureWarning(true);
        setErrorMessage(message);
    }

    // Use useEffect for redirect to avoid hydration issues
    useEffect(() => {
        if(isAuthenticated === true){
            router.push("/");
        }
    }, [isAuthenticated, router]);

    return (
        <div className="flex flex-col items-left w-[100%] md:w-auto md:min-h-[60vh] md:min-w-[50vh] text-white
            md:border-x-4 md:border-b-4 md:border-t-2 md:shadow-[0_5px_20px_#00FF99] md:rounded-xl ">
            <DivGap customHeightGap="h-[20px] rounded-lg"/>
            
            <Logo textSize="self-center md:self-start p-4 text-4xl md:text-xl lg:text-2xl" position="md:ml-7"/>

            <div className="flex flex-grow flex-col justify-between mx-8 mt-8 space-y-2 font-sans">
                {
                    isSignUpPage ? (
                        <div className="flex flex-col justify-between">
                            <p className="text-xl md:text-2xl mb-2">Get started</p>
                            <p className="font-light text-sm">Create a Cholo BD account!!</p>
                        </div>
                    ) : (
                        <div className="flex flex-col justify-between">
                            <p className="text-xl md:text-2xl mb-2">Log in</p>
                            <p className="font-light text-sm">Get a tailored tour experience!!</p>
                        </div>
                    )
                }
                
                <DivGap customHeightGap="h-[10px]"/>

                {
                    isSignUpPage ? (
                        isEmailSignUp ? (
                            <form 
                                className="flex flex-col space-y-1 mb-2" 
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    onAccountSignUp();
                                }}
                            >
                                <label className=" md:text-lg">Email</label>

                                <input className="bg-white border border-gray-300 px-4 py-2 font-sans placeholder-gray-400 text-gray-800 rounded-md
                                    focus:outline-none focus:ring-2 focus:ring-green-600" type="text" name="email" onChange={handleChange}
                                />

                                <label className="md:text-lg">User Name</label>

                                <input className="bg-white border border-gray-300 px-4 py-2 font-sans placeholder-gray-400 text-gray-800 rounded-md
                                    focus:outline-none focus:ring-2 focus:ring-green-600" type="text" name="userName" onChange={handleChange}
                                />

                                <label className="md:text-lg">Password</label>

                                <input className="bg-white border border-gray-300 px-4 py-2 font-sans placeholder-gray-400 text-gray-800 rounded-md
                                    focus:outline-none focus:ring-2 focus:ring-green-600" type="password" name="password" onChange={handleChange}
                                />

                                <label className="md:text-lg">Confirm Password</label>

                                <input className="bg-white border border-gray-300 px-4 py-2 font-sans placeholder-gray-400 text-gray-800 rounded-md
                                    focus:outline-none focus:ring-2 focus:ring-green-600" 
                                    type="password" name="passwordConfirmation" placeholder="Confirm Password" autoComplete="new-password" onChange={handleChange}
                                />

                                <button className="w-full p-2 mt-5 mx-auto bg-green-600 hover:bg-green-500 rounded-sm" type="submit">Create Account</button>

                                <HorizontalDividerWithText className="mt-5">OR</HorizontalDividerWithText>
                            </form>
                        ) : (
                            <>
                                <div className="flex flex-col space-y-2 items-center">
                                    <button className="flex justify-center p-2 w-full bg-gray-500 hover:bg-gray-400 rounded-sm" onClick={() => setIsEmailSignUp(true)}>
                                        <Image src="/icons8-email-48.png" alt="Email Logo" width={20} height={20}/>
                                    </button>

                                    <button className="flex justify-center p-2 w-full bg-gray-500 hover:bg-gray-400 rounded-sm" onClick={() => onGoogleSignIn()}>
                                        <Image src="./icons8-google.svg" alt="Google Logo" width={20} height={20}/>
                                    </button>

                                    <button className="flex justify-center p-2 w-full bg-gray-500 hover:bg-gray-400 rounded-sm" onClick={() => onFacebookSignIn()}>
                                        <Image src="./icons8-facebook.svg" alt="Facebook Logo" width={20} height={20}/>
                                    </button>
                                </div>

                                <HorizontalDividerWithText className="mt-5">OR</HorizontalDividerWithText>
                            </>
                        )
                    ) : (
                        <>
                            <div className="flex flex-col space-y-2 justify-center">
                                <label className="md:text-lg">Email</label>

                                <input className="bg-white border border-gray-300 px-4 py-2 font-sans placeholder-gray-400 text-gray-800 rounded-md
                                    focus:outline-none focus:ring-2 focus:ring-green-600" type="text" name="email" onChange={handleChange}/>

                                <label className="md:text-lg">Password</label>

                                <input className="bg-white border border-gray-300 px-4 py-2 font-sans placeholder-gray-400 text-gray-800 rounded-md
                                    focus:outline-none focus:ring-2 focus:ring-green-600" type="password" name="password" onChange={handleChange}/>

                                {signInFailureWarning && (<div className="text-red-600">{errorMessage || 'An error occurred during sign in. Please try again.'}</div>)}

                                <button className="w-full p-2 mx-auto bg-green-600 hover:bg-green-500 rounded-sm" onClick={() => onAccountLogIn()}>Proceed with Email</button>
                            </div>

                            <HorizontalDividerWithText className="mt-5">OR</HorizontalDividerWithText>
                            
                            <div className="flex justify-between">
                                <button className="flex justify-center p-2 w-[45%] bg-gray-500 hover:bg-gray-400 rounded-sm" onClick={() => onGoogleSignIn()}>
                                    <Image src="./icons8-google.svg" alt="Google Logo" width={20} height={20}/>
                                </button>

                                <button className="flex justify-center p-2 w-[45%] bg-gray-500 hover:bg-gray-400 rounded-sm" onClick={() => onFacebookSignIn()}>
                                    <Image src="./icons8-facebook.svg" alt="Facebook Logo" width={20} height={20}/>
                                </button>
                            </div>
                        </>
                    )
                }
                
                <div className="flex flex-col justify-between mt-3">
                    {
                        isSignUpPage ? (<p>Already registered? <button className="text-green-500 ml-2" onClick={() => setIsSignUpPage(false)}>Log in!</button></p>) :
                        (<p>New to Suit Up? <button className="text-green-500 ml-2" onClick={() => {
                                setIsSignUpPage(true);
                                setIsEmailSignUp(false);
                            }
                        }>Sign up!</button></p>)
                    }
                    
                    <div className="flex flex-col mb-5 space-y-2">
                        <div>Developed by <span className="font-bold text-green-500">Nafis Iqbal</span></div>

                        <div className="flex justify-between w-[45%]">
                            <button className="flex justify-center p-2 w-[25%] bg-gray-500 hover:bg-gray-400 rounded-sm">
                                <Image src="./icons8-github.svg" alt="Github Logo" width={20} height={20}/>
                            </button>

                            <button className="flex justify-center p-2 w-[25%] bg-gray-500 hover:bg-gray-400 rounded-sm">
                                <Image src="./icons8-linkedin.svg" alt="LinkedIn Logo" width={20} height={20}/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<SuspenseFallback />}>
            <LoginContent />
        </Suspense>
    );
}