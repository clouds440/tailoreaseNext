"use client";
import React, { useContext, useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "@/utils/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import SimpleButton from "@/components/SimpleButton";
import Link from "next/link";
import UserContext from "@/utils/UserContext";
import { BarLoader } from "react-spinners";
import { useSearchParams, useRouter } from "next/navigation";

const LoginForm = () => {
  const {
    theme,
    setUserData,
    userLoggedIn,
    setUserLoggedIn,
    setShowMessage,
    setPopUpMessageTrigger,
    inputStyles,
    placeHolderStyles,
  } = useContext(UserContext);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleGoogleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = encodeURIComponent(
      process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
    );

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=email%20profile%20phone`;
    window.location.href = authUrl;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      setShowMessage({
        type: "warning",
        message: "Please provide a valid email address",
      });
      setPopUpMessageTrigger(true);
      return;
    }

    try {
      setIsLoading(true);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;
      const q = query(collection(db, "users"), where("uid", "==", user.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        // Store userData in localSession
        sessionStorage.setItem("userData", JSON.stringify(userData));
        localStorage.setItem("userData", JSON.stringify(userData));

        // set the user logged in state to true
        setUserLoggedIn(true);
        setUserData(userData);
      }
    } catch (error) {
      let errorMessage = "An error occurred: " + ` ${error.message}`;
      let errorType = "danger";
      if (error.code === "auth/invalid-credential") {
        errorMessage = "Invalid credentials";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Provide a valid email";
        errorType = "info";
      } else if (error.code === "auth/missing-password") {
        errorMessage = "Enter a password";
        errorType = "info";
      } else if (error.code === "auth/user-disabled") {
        errorMessage = "Account blocked! Please contact support";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later!";
      }
      setShowMessage({ type: errorType, message: errorMessage });
      setPopUpMessageTrigger("true");
    } finally {
      setIsLoading(false);
    }
  };

  // Check for redirect parameter and navigate accordingly
  useEffect(() => {
    if (userLoggedIn) {
      const redirectUrl = searchParams.get("redirect");
      if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.push("/");
      }
    }
  }, [userLoggedIn, router, searchParams]);

  const handlePasswordReset = async () => {
    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      setShowMessage({
        type: "warning",
        message: "Provide a valid email",
      });
      setPopUpMessageTrigger(true);
      return;
    }

    try {
      setIsResetLoading(true);
      await sendPasswordResetEmail(auth, formData.email);
      setShowMessage({
        type: "success",
        message:
          "If you've provided a valid email, you'll receive a password reset email",
      });
      setPopUpMessageTrigger(true);
    } catch (error) {
      setShowMessage({
        type: "danger",
        message: "Error sending password reset email. Please try again",
      });
      setPopUpMessageTrigger(true);
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <div
      className={`max-w-[99.5%] mx-auto p-6 my-4 md:my-1 rounded-lg h-screen overflow-hidden select-none justify-center flex ${theme.mainTheme}`}
    >
      <div className="flex justify-center w-[95%] md:w-[80%] lg:w-[50%] rounded-lg select-none">
        <div
          className={`p-6 rounded-lg ${theme.mainTheme} w-full max-w-md h-full max-h-fit`}
        >
          <h2
            className={`flex text-xl text-${theme.themeColor} font-bold mb-4`}
          >
            Login
          </h2>
          <form onSubmit={handleSubmit} noValidate>
            <div className="relative mb-4">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`${inputStyles}`}
                placeholder=" "
              />
              <label className={`${placeHolderStyles}`} htmlFor="email">
                Email
              </label>
            </div>
            <div className="relative mb-4">
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`${inputStyles}`}
                placeholder=" "
              />
              <label className={`${placeHolderStyles}`} htmlFor="password">
                Password
              </label>
            </div>
            <SimpleButton
              btnText={isLoading ? <LoadingSpinner size={24} /> : "Login"}
              type={"primary-submit"}
              extraclasses={"w-full"}
              disabled={isLoading}
            />
            <div className="my-4 flex items-center justify-center">
              <SimpleButton
                btnText={
                  <div className="flex items-center justify-center gap-2">
                    <i className="fab fa-google"></i>
                    <span>Continue with Google</span>
                  </div>
                }
                type={"simple"}
                extraclasses={`w-full bg-rose-500`}
                onClick={handleGoogleLogin}
              />
            </div>
            <div className="items-center justify-center flex flex-row mt-8">
              <span>Forgot Password? &nbsp;</span>
              {isResetLoading ? (
                <BarLoader color="#0000ff" width={137} />
              ) : (
                <span
                  className={`cursor-pointer ${theme.iconColor} ${theme.hoverText}`}
                  onClick={handlePasswordReset}
                >
                  Reset here
                </span>
              )}
            </div>
            <div className="items-center justify-center flex flex-row mt-8">
              <span>Need to create an &nbsp;</span>
              <Link href={"/signup"}>
                <span className={`${theme.iconColor} ${theme.hoverText}`}>
                  account?
                </span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
