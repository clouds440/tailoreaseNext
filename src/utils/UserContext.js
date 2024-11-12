"use client";
import React, { createContext, useState } from "react";

// Create the context
export const UserContext = createContext();

// Create the provider component
export const UserProvider = ({ children }) => {
  // Initialize the theme
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme
      ? JSON.parse(savedTheme)
      : {
          themeName: "default",
          mainTheme: "theme-default",
          colorText: "text-gray-100",
          colorBorder: "border-gray-100",
          iconColor: "text-blue-600",
          hoverText: "hover:text-blue-400",
          hoverBg: "hover:bg-indigo-400 hover:bg-opacity-30",
        };
  });

  // Initialize user data
  const [userData, setUserData] = useState(() => {
    const savedUser =
      sessionStorage.getItem("userData") || localStorage.getItem("userData");
    return savedUser
      ? JSON.parse(savedUser)
      : { uid: "", fullName: "", email: "", password: "" };
  });

  // Determine if the user is logged in
  const [userLoggedIn, setUserLoggedIn] = useState(!!userData.uid);

  const [popUpMessageTrigger, setPopUpMessageTrigger] = useState(false);
  const [showMessage, setShowMessage] = useState({
    type: "",
    message: "",
  });

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
