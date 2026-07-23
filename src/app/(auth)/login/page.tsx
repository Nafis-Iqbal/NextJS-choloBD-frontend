"use client";

import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AuthApi } from "@/services/api";
import { API_BASE_URL } from "@/lib/apiConfig";

import SuspenseFallback from "@/components/page-content/SuspenseFallback";
import DivGap, { Logo } from "@/components/custom-elements/UIUtilities";

/** Theme-independent divider — does not use globals.css data-theme vars */
function LoginDivider({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex my-4 items-center">
      <hr className="flex-grow border-t border-gray-300" />
      <span className="mx-4 text-gray-500 text-sm">{children}</span>
      <hr className="flex-grow border-t border-gray-300" />
    </div>
  );
}

const inputClassName =
  "bg-white border border-gray-300 px-4 py-2 font-sans placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600";

const primaryButtonClassName =
  "w-full p-2 mt-5 mx-auto bg-green-600 hover:bg-green-500 text-white rounded-sm disabled:opacity-50 disabled:cursor-not-allowed";

const oauthButtonClassName =
  "flex justify-center items-center p-2.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

function LoginContent() {
  const router = useRouter();
  const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
  const isAuthenticated = authResponse?.data?.isAuthenticated || false;

  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const [isSignUpPage, setIsSignUpPage] = useState<boolean>(false);
  const [isEmailSignUp, setIsEmailSignUp] = useState<boolean>(false);
  const [signInFailureWarning, setSignInFailureWarning] =
    useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [formData, setFormData] = useState<UserData>({
    userName: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  });

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      setSignInFailureWarning(true);
      switch (error) {
        case "CredentialsSignin":
          setErrorMessage("Wrong email or password. Please try again.");
          break;
        case "EmailNotVerified":
          setErrorMessage("Please verify your email before signing in.");
          break;
        default:
          setErrorMessage(
            "An error occurred during sign in. Please try again."
          );
      }
    }
  }, [searchParams]);

  const { mutate: createUserMutate } = AuthApi.useCreateUserRQ(
    (responseData) => {
      setIsLoading(false);
      console.log("Sign Up response data:", responseData);
      if (responseData.status === "success") {
        router.push("/");
      } else {
        onSignUpFailure();
      }
    },
    () => {
      setIsLoading(false);
      onSignUpFailure();
    }
  );

  const { mutate: loginUserMutate } = AuthApi.useLoginUserRQ(
    (responseData) => {
      setIsLoading(false);
      console.log("Login response data:", responseData);
      if (responseData.status === "success") {
        console.log("Login successful, redirecting");
        router.push(
          redirectTo.startsWith("/") ? redirectTo : "/dashboard"
        );
      } else {
        console.log("Login failed with status:", responseData.status);
        onSignInFailure(
          responseData.message ||
            "Login failed. Please check your credentials."
        );
      }
    },
    () => {
      setIsLoading(false);
      console.log("Login error occurred");
      onSignInFailure(
        "An error occurred during login. Please try again."
      );
    }
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const onAccountSignUp = () => {
    setIsLoading(true);
    createUserMutate(formData);
  };

  const onAccountLogIn = () => {
    const loginData: LoginData = {
      email: formData.email,
      password: formData.password,
    };
    setIsLoading(true);
    loginUserMutate(loginData);
  };

  const onGoogleSignIn = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  const onFacebookSignIn = () => {
    window.location.href = `${API_BASE_URL}/auth/facebook`;
  };

  const onSignUpFailure = () => {
    setSignInFailureWarning(true);
    setErrorMessage(
      "An error occurred during sign up. Please try again."
    );
  };

  const onSignInFailure = (
    message: string = "An error occurred during sign in. Please try again."
  ) => {
    setSignInFailureWarning(true);
    setErrorMessage(message);
  };

  useEffect(() => {
    if (isAuthenticated === true) {
      router.push(redirectTo.startsWith("/") ? redirectTo : "/");
    }
  }, [isAuthenticated, router, redirectTo]);

  return (
    <div
      className="flex flex-col w-[100%] md:w-auto md:min-h-[60vh] md:min-w-[50vh] bg-white text-gray-900
            md:border md:border-gray-200 md:shadow-[0_5px_20px_rgba(156,163,175,0.55)] md:rounded-xl"
      style={{
        backgroundColor: "#ffffff",
        color: "#111827",
      }}
    >
      <DivGap customHeightGap="h-[20px] rounded-lg" />

      <Logo position="mx-auto md:ml-7" height={80} width={150} />

      <div className="flex flex-grow flex-col justify-between mx-8 mt-8 space-y-2 font-sans text-gray-900">
        {isSignUpPage ? (
          <div className="flex flex-col justify-between">
            <p className="text-xl md:text-2xl mb-2 text-gray-900">
              Get started
            </p>
            <p className="font-light text-sm text-gray-600">
              Create a Cholo BD account!!
            </p>
          </div>
        ) : (
          <div className="flex flex-col justify-between">
            <p className="text-xl md:text-2xl mb-2 text-gray-900">Log in</p>
            <p className="font-light text-sm text-gray-600">
              Get a tailored tour experience!!
            </p>
          </div>
        )}

        <DivGap customHeightGap="h-[10px]" />

        {isSignUpPage ? (
          isEmailSignUp ? (
            <form
              className="flex flex-col space-y-1 mb-2"
              onSubmit={(e) => {
                e.preventDefault();
                onAccountSignUp();
              }}
            >
              <label className="md:text-lg text-gray-900">Email</label>
              <input
                className={inputClassName}
                type="text"
                name="email"
                onChange={handleChange}
              />

              <label className="md:text-lg text-gray-900">User Name</label>
              <input
                className={inputClassName}
                type="text"
                name="userName"
                onChange={handleChange}
              />

              <label className="md:text-lg text-gray-900">Password</label>
              <input
                className={inputClassName}
                type="password"
                name="password"
                onChange={handleChange}
              />

              <label className="md:text-lg text-gray-900">
                Confirm Password
              </label>
              <input
                className={inputClassName}
                type="password"
                name="passwordConfirmation"
                placeholder="Confirm Password"
                autoComplete="new-password"
                onChange={handleChange}
              />

              <button
                className={primaryButtonClassName}
                type="submit"
                disabled={isLoading}
              >
                Create Account
              </button>

              {isLoading && (
                <div className="text-green-600 text-center mt-2 font-semibold">
                  Loading, Please Wait...
                </div>
              )}
              {!isLoading && signInFailureWarning && (
                <div className="text-red-600">
                  {errorMessage ||
                    "An error occurred during sign up. Please try again."}
                </div>
              )}

              <LoginDivider>OR</LoginDivider>
            </form>
          ) : (
            <>
              <div className="flex flex-col space-y-2 items-center">
                <button
                  className={`w-full ${oauthButtonClassName}`}
                  onClick={() => setIsEmailSignUp(true)}
                  disabled={isLoading}
                >
                  <Image
                    src="/icons8-email-48.png"
                    alt="Email Logo"
                    width={20}
                    height={20}
                  />
                </button>

                <button
                  className={`w-full ${oauthButtonClassName}`}
                  onClick={() => onGoogleSignIn()}
                  disabled={isLoading}
                >
                  <Image
                    src="./icons8-google.svg"
                    alt="Google Logo"
                    width={20}
                    height={20}
                  />
                </button>

                <button
                  className={`w-full ${oauthButtonClassName}`}
                  onClick={() => onFacebookSignIn()}
                  disabled={isLoading}
                >
                  <Image
                    src="./icons8-facebook.svg"
                    alt="Facebook Logo"
                    width={20}
                    height={20}
                  />
                </button>
              </div>

              <LoginDivider>OR</LoginDivider>
            </>
          )
        ) : (
          <>
            <div className="flex flex-col space-y-2 justify-center">
              <label className="md:text-lg text-gray-900">Email</label>
              <input
                className={inputClassName}
                type="text"
                name="email"
                onChange={handleChange}
              />

              <label className="md:text-lg text-gray-900">Password</label>
              <input
                className={inputClassName}
                type="password"
                name="password"
                onChange={handleChange}
              />

              {isLoading && (
                <div className="text-green-600 text-center mt-2 font-semibold">
                  Loading, Please Wait...
                </div>
              )}
              {!isLoading && signInFailureWarning && (
                <div className="text-red-600">
                  {errorMessage ||
                    "An error occurred during sign in. Please try again."}
                </div>
              )}

              <button
                className={`${primaryButtonClassName} mt-0`}
                onClick={() => onAccountLogIn()}
                disabled={isLoading}
              >
                Proceed with Email
              </button>
            </div>

            <LoginDivider>OR</LoginDivider>

            <div className="flex justify-between">
              <button
                className={`w-[45%] ${oauthButtonClassName}`}
                onClick={() => onGoogleSignIn()}
                disabled={isLoading}
              >
                <Image
                  src="./icons8-google.svg"
                  alt="Google Logo"
                  width={20}
                  height={20}
                />
              </button>

              <button
                className={`w-[45%] ${oauthButtonClassName}`}
                onClick={() => onFacebookSignIn()}
                disabled={isLoading}
              >
                <Image
                  src="./icons8-facebook.svg"
                  alt="Facebook Logo"
                  width={20}
                  height={20}
                />
              </button>
            </div>
          </>
        )}

        <div className="flex flex-col justify-between my-6 text-gray-900">
          {isSignUpPage ? (
            <p>
              Already registered?
              <button
                className="bg-white font-semibold text-green-600 ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setIsSignUpPage(false)}
                disabled={isLoading}
              >
                Log in!
              </button>
            </p>
          ) : (
            <p>
              New to Cholo BD?
              <button
                className="bg-white font-semibold text-green-600 ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  setIsSignUpPage(true);
                  setIsEmailSignUp(false);
                }}
                disabled={isLoading}
              >
                Sign up!
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <LoginContent />
    </Suspense>
  );
}
