"use client";
import React, { useContext, useState, useEffect, useRef } from "react";
import Logo from "./Logo";
import SimpleButton from "./SimpleButton";
import { auth, signOut } from "@/utils/firebaseConfig";
import UserContext from "@/utils/UserContext";
import { useRouter } from "next/navigation";
import {
  SettingsIcon,
  LogoutIcon,
  MenuIcon,
  HomeIcon,
  CartIcon,
  ServicesIcon,
  ContactIcon,
  LoginIcon,
  InfoIcon,
  ShirtIcon,
  TailorIcon,
} from "../../public/icons/svgIcons";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const {
    userData,
    theme,
    userLoggedIn,
    setUserLoggedIn,
    setShowmessage,
    setPopUpMessageTrigger,
  } = useContext(UserContext);
  const [userFullName, setUserFullName] = useState(userData.fullName);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("userData");
      sessionStorage.removeItem("userData");
      setUserLoggedIn(false);
      setDropdownOpen(false);
      router.push("/");
    } catch (error) {
      setShowmessage({
        type: "danger",
        message: "Couldn't log out. Please try again!",
      });
      setPopUpMessageTrigger("true");
    }
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (dropdownOpen) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    setUserFullName(userData.fullName);
  }, [userData]);

  const dropdownOptions = [
    {
      text: "Settings",
      icon: <SettingsIcon size={"5"} color={`${theme.iconColor}`} />,
      onClick: () => {
        router.push("/settings");
        setDropdownOpen(false);
      },
    },
    {
      text: "Logout",
      icon: <LogoutIcon size={"5"} color={`${theme.iconColor}`} />,
      onClick: handleLogout,
    },
    // Add more options here as needed
  ];

  const [windowWidth, setWindowWidth] = useState(undefined);
  const [windowHeight, setWindowHeight] = useState(undefined);

  useEffect(() => {
    // Only execute on the client side
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };

    // Initial window size on mount
    handleResize();

    // Add event listener to handle window resizing
    window.addEventListener("resize", handleResize);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const animate = windowWidth >= 768 ? 10 : -10;
  const linkStyles = `flex items-center justify-center md:justify-start cursor-pointer px-4 py-2 rounded-xl w-auto md:w-full duration-500 ${theme.hoverBg}`;

  return (
    <div className="flex">
      <nav
        className={`flex-shrink-0 fixed top-0 md:left-0 h-24 md:h-screen w-screen md:w-40 rounded-md ${theme.mainTheme}`}
      >
        <div className="justify-between h-full">
          <div>
            <div
              className={`flex md:block h-12 md:h-auto justify-between mt-1`}
            >
              <Logo
                fontSize={"text-2xl"}
                classes={`md:my-5 md:pb-5 mx-5 pr-4 md:mx-0 md:pr-0 items-center justify-center ${theme.colorBorder}`}
              />
              {userLoggedIn ? (
                <div className="py-1 mt-3 text-center mx-5 md:mx-0 select-none">
                  <span>{userFullName}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <SimpleButton
                    onClick={() => router.push("/login")}
                    btnText={"Log In"}
                    type={"simple"}
                    extraclasses="w-full mx-2"
                    icon={<LoginIcon size={"5"} />}
                  />
                </div>
              )}
            </div>
            <div
              className={`flex items-center justify-between ${
                windowHeight >= 500 ? "md:mt-10" : "md:mt-3"
              }`}
            >
              <ul className="md:space-y-2 justify-evenly select-none w-full md:inline grid grid-flow-col">
                <li onClick={() => router.push("/")} className={linkStyles}>
                  <HomeIcon size={"5"} color={`${theme.iconColor}`} />
                  <span className={"hidden md:inline-block md:ml-2"}>Home</span>
                </li>
                <li className={linkStyles}>
                  <CartIcon size={"5"} color={`${theme.iconColor}`} />
                  <span className={"hidden md:inline-block md:ml-2"}>
                    Market
                  </span>
                </li>
                <li
                  className={linkStyles}
                  onClick={() => router.push("/tailors")}
                >
                  <TailorIcon size={"5"} color={`${theme.iconColor}`} />
                  <span className={"hidden md:inline-block md:ml-2"}>
                    Tailors
                  </span>
                </li>
                {userLoggedIn && (
                  <li
                    onClick={() => router.push("/become-tailor")}
                    className={`${
                      windowHeight >= 420 ? "" : "md:hidden"
                    } ${linkStyles}`}
                  >
                    <ServicesIcon size={"5"} color={`${theme.iconColor}`} />
                    <span className={"hidden md:inline-block md:ml-2"}>
                      Business
                    </span>
                  </li>
                )}
                <li
                  onClick={() => router.push("/contact-us")}
                  className={`${
                    windowHeight >= 470 ? "" : "md:hidden"
                  } ${linkStyles}`}
                >
                  <ContactIcon size={"5"} color={`${theme.iconColor}`} />
                  <span className={"hidden md:inline-block md:ml-2"}>
                    Contact
                  </span>
                </li>
                {!userLoggedIn && (
                  <li
                    onClick={() => router.push("/about-us")}
                    className={`${
                      windowHeight >= 420 ? "" : "md:hidden"
                    } ${linkStyles}`}
                  >
                    <InfoIcon size={"5"} color={`${theme.iconColor}`} />
                    <span className={"hidden md:inline-block md:ml-2"}>
                      About
                    </span>
                  </li>
                )}
                {userLoggedIn && (
                  <div>
                    <div className="relative md:absolute md:bottom-1 w-full">
                      <div
                        className={linkStyles}
                        ref={dropdownRef}
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                      >
                        <div className="flex">
                          <span className="flex items-center select-none">
                            <MenuIcon size={"5"} color={"text-yellow-600"} />
                            <span className={"hidden md:inline-block ml-2"}>
                              Menu
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </ul>
            </div>
          </div>
        </div>
      </nav>
      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            className={`absolute w-auto md:w-40 z-50 ${
              windowWidth >= 768
                ? "md:pt-4 md:bottom-14"
                : "right-1 top-[100px] px-2 py-2 rounded-md " + theme.mainTheme
            }`}
            initial={{ opacity: 0, y: animate }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: animate }}
            transition={{ duration: 0.3 }}
          >
            <motion.ul
              className={`md:space-y-2 justify-center select-none w-full`}
              initial={{ opacity: 0, y: animate }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: animate }}
              transition={{ duration: 0.3 }}
            >
              {dropdownOptions.map((option, index) => (
                <li
                  key={index}
                  onClick={option.onClick}
                  className={`justify-between ${linkStyles} ${theme.colorText}`}
                >
                  {option.icon}
                  <span className={"ml-2"}>{option.text}</span>
                </li>
              ))}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;
