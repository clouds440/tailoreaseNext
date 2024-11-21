"use client";
import React, { useContext, useState, useEffect } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import SimpleButton from "@/components/SimpleButton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import UserContext from "@/utils/UserContext";
import {
  auth,
  db,
  createUserWithEmailAndPassword,
  collection,
  addDoc,
} from "@/utils/firebaseConfig";

const SignUpForm = () => {
  const {
    theme,
    setUserData,
    userLoggedIn,
    setUserLoggedIn,
    setShowMessage,
    setPopUpMessageTrigger,
  } = useContext(UserContext);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      setShowMessage({
        type: "info",
        message: "Enter your full name",
      });
      setPopUpMessageTrigger("true");
      return;
    } else if (formData.fullName.length < 3) {
      setShowMessage({
        type: "info",
        message: "Name must be at least 3 characters",
      });
      setPopUpMessageTrigger("true");
      return;
    }

    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      setShowMessage({
        type: "warning",
        message: "Enter a valid email",
      });
      setPopUpMessageTrigger(true);
      return;
    }

    if (!/^\d*$/.test(formData.phone)) {
      setShowMessage({
        type: "warning",
        message: "Phone number can only contain digits",
      });
      setPopUpMessageTrigger("true");
      return;
    }

    try {
      setIsLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      await addDoc(collection(db, "users"), {
        uid: user.uid,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
      });
      setShowMessage({
        type: "success",
        message: "Registration successful!",
      });
      setPopUpMessageTrigger("true");
      setUserLoggedIn(true);

      const userData = {
        uid: user.uid,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
      };
      sessionStorage.setItem("userData", JSON.stringify(userData));
      localStorage.setItem("userData", JSON.stringify(userData));
      setUserData(userData);
      router.push("/");
    } catch (error) {
      let errorMessage = "An error occurred: " + ` ${error.message}`;
      let errorType = "danger";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already in use";
        errorType = "warning";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password must be at least 6 characters";
        errorType = "warning";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Enter a valid email";
        errorType = "info";
      } else if (error.code === "auth/missing-password") {
        errorMessage = "Enter a password";
        errorType = "info";
      }
      setShowMessage({ type: errorType, message: errorMessage });
      setPopUpMessageTrigger("true");
    } finally {
      setIsLoading(false);
    }
  };

  const {inputStyles, placeHolderStyles } = useContext(UserContext);

  useEffect(() => {
    if (userLoggedIn) {
      router.push("/");
    }
  }, [userLoggedIn, router]);

  return (
    <div className="flex items-center justify-center mt-8 max-w-2xl w-auto mx-auto p-6 rounded-md select-none">
      <div
        className={`p-6 rounded-lg ${theme.mainTheme} w-full max-w-md relative`}
      >
        <h2 className={`flex text-xl text-${theme.themeColor} font-bold mb-4`}>
          Create Account
        </h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="relative mb-4">
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`${inputStyles}`}
              placeholder=" "
            />
            <label className={`${placeHolderStyles}`} htmlFor="fullName">
              Full Name
            </label>
          </div>
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
          <div className="relative mb-4">
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`${inputStyles}`}
              placeholder=" "
            />
            <label className={`${placeHolderStyles}`} htmlFor="phone">
              Phone <span className="text-xs">(Optional)</span>
            </label>
          </div>
          <SimpleButton
            btnText={isLoading ? <LoadingSpinner size={24} /> : "Sign Up"}
            type={"primary-submit"}
            extraclasses={"w-full"}
            disabled={isLoading}
          />
          <div className="items-center justify-center flex flex-row mt-8">
            <Link href={"/login"}>
              <span className={`${theme.iconColor} ${theme.hoverText}`}>
                Login
              </span>
            </Link>
            <span>&nbsp; to an existing account</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpForm;
