"use client";
import React, { createContext, useState, useEffect } from "react";

// Create the context
export const UserContext = createContext();

// Create the provider component
export const UserProvider = ({ children }) => {
  // Initialize the theme
  const [theme, setTheme] = useState(null); // Initialize as `null` to indicate data is loading
  const [userData, setUserData] = useState(null); // Same for userData
  const [userLoggedIn, setUserLoggedIn] = useState(false); // Will be determined later
  const [isReady, setIsReady] = useState(false); // Track readiness of app
  const [popUpMessageTrigger, setPopUpMessageTrigger] = useState(false);
  const [showMessage, setShowMessage] = useState({
    type: "",
    message: "",
  });

  const themes = {
    midnightWhisper: {
      themeName: "midnightWhisper",
      mainTheme: "midnight-whisper",
      colorText: "text-gray-100",
      colorBorder: "border-gray-100",
      iconColor: "text-blue-500",
      hoverText: "hover:text-blue-400",
      hoverBg: "hover:bg-indigo-400 hover:bg-opacity-30",
      hoverShadow: "hover:shadow-md hover:shadow-amber-400",
    },
    lunarGlow: {
      themeName: "lunarGlow",
      mainTheme: "lunar-glow",
      colorText: "text-black",
      colorBorder: "border-black",
      iconColor: "text-blue-600",
      hoverText: "hover:text-gray-600",
      hoverBg: "hover:bg-gray-300 hover:bg-opacity-70",
      hoverShadow: "hover:shadow-md hover:shadow-gray-800",
    },
    oceanHaze: {
      themeName: "oceanHaze",
      mainTheme: "ocean-haze",
      colorText: "text-sky-200",
      colorBorder: "border-sky-200",
      iconColor: "text-amber-400",
      hoverText: "hover:text-amber-300",
      hoverBg: "hover:bg-amber-300 hover:bg-opacity-50",
      hoverShadow: "hover:shadow-md hover:shadow-cyan-400",
    },
  };

  const handleSetTheme = (themeName) => {
    if (themeName === "systemDefault") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setTheme(prefersDark ? themes.midnightWhisper : themes.lunarGlow);
    } else {
      setTheme(themes[themeName]);
    }
  };

  useEffect(() => {
    // Ensure this runs only on the client
    if (typeof window !== "undefined") {
      // Fetch theme
      const savedTheme = localStorage.getItem("TailorEaseTheme");
      handleSetTheme(savedTheme ? JSON.parse(savedTheme) : "systemDefault");

      // Fetch user data
      const savedUser =
        sessionStorage.getItem("userData") || localStorage.getItem("userData");
      const parsedUser = savedUser
        ? JSON.parse(savedUser)
        : { uid: "", fullName: "", email: "", password: "" };
      setUserData(parsedUser);

      // Determine if the user is logged in
      setUserLoggedIn(!!parsedUser.uid);

      // Mark app as ready
      setIsReady(true);
    }
  }, []); // Runs only once after the initial render

  // Show a loader until the app is ready
  if (!isReady) {
    return; // Replace with your app's loading indicator
  }

  const inputStyles = `w-full p-1 mt-4 peer ${theme.colorText} border-b-2 z-10 ${theme.colorBorder} outline-none focus:border-blue-500 transition-all duration-300 bg-transparent`;

  const placeHolderStyles = `absolute top-5 pointer-events-none left-1 ${theme.colorText} duration-300 transform -translate-y-7 scale-75 origin-left peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:${theme.colorText} peer-focus:-translate-y-7 peer-focus:scale-75 peer-focus:text-blue-500`;

  return (
    <UserContext.Provider
      value={{
        setUserData,
        setShowMessage,
        handleSetTheme,
        setPopUpMessageTrigger,
        setUserLoggedIn,
        setTheme,
        theme,
        userData,
        userLoggedIn,
        popUpMessageTrigger,
        showMessage,
        inputStyles,
        placeHolderStyles,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
