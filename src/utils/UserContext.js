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

  useEffect(() => {
    // Ensure this runs only on the client
    if (typeof window !== "undefined") {
      // Fetch theme
      const savedTheme = localStorage.getItem("theme");
      setTheme(
        savedTheme
          ? JSON.parse(savedTheme)
          : {
              themeName: "default",
              mainTheme: "theme-default",
              colorText: "text-gray-100",
              colorBorder: "border-gray-100",
              iconColor: "text-blue-600",
              hoverText: "hover:text-blue-400",
              hoverBg: "hover:bg-indigo-400 hover:bg-opacity-30",
            }
      );

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

  const resetPopUpMessageTrigger = () => {
    setPopUpMessageTrigger(false);
  };

  return (
    <UserContext.Provider
      value={{
        userData,
        setUserData,
        theme,
        setTheme,
        userLoggedIn,
        setUserLoggedIn,
        popUpMessageTrigger,
        setPopUpMessageTrigger,
        showMessage,
        setShowMessage,
        resetPopUpMessageTrigger,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
