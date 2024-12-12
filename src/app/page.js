"use client";

import React, { useContext } from "react";
import UserContext from "@/utils/UserContext";
import Logo from "../components/Logo";
import SimpleButton from "../components/SimpleButton";
import Link from "next/link";
import RotatingJacket from "@/components/RotatingJacket";

export default function Home() {
  const { theme, inputStyles, placeHolderStyles } = useContext(UserContext);

  return (
    <>
      <div
        className={`max-w-[97%] p-6 mx-auto my-4 rounded-3xl flex flex-col items-center overflow-hidden select-none ${theme.mainTheme}`}
      >
        {/* Top Section */}
        <div
          className={`w-full flex flex-wrap-reverse justify-evenly items-center`}
        >
          {/* Left Section */}
          <div data-aos="fade-right" className="max-w-lg mt-4">
            <h3 className={`text-7xl font-extrabold ${theme.colorText}`}>
              Virtual Tailor
            </h3>
            <p className={`text-lg ${theme.subTextColor}`}>
              AI Enhanced Fitting Experience
            </p>
            <p className={`text-lg mt-8 ${theme.subTextColor}`}>
              Join the platform where tailors create virtual shops and users
              try-on outfits and place orders instantly!
            </p>
            <Link href={"#"}>
              <SimpleButton
                btnText="Get Started Now"
                extraclasses="mt-4 py-3"
              />
            </Link>
          </div>

          {/* Right Section */}
          <div className="relative" data-aos="fade-left">
            <RotatingJacket />
            <p className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] p-4 rounded-2xl text-[#00000040] text-[22rem] font-extrabold -z-10">
              VT
            </p>
          </div>
        </div>

        {/* "Why Choose Us" Section */}
        <div
          className={`mt-16 w-full py-12 px-6 rounded-3xl relative flex flex-col items-center`}
          data-aos="fade-up"
        >
          {/* Heading */}
          <h2 className={`text-4xl font-bold ${theme.colorText}`}>
            Why Choose Us
          </h2>
          <p
            className={`absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-[10rem] font-extrabold -z-10 ${theme.colorText} opacity-[2%] `}
          >
            Benefits
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 w-full max-w-4xl">
            {/* Feature 1 */}
            <div className="flex items-start space-x-4">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full ${theme.colorText} border-2 border-current`}
              >
                <i className="fas fa-check"></i>
              </div>
              <div>
                <h3 className={`text-2xl font-semibold ${theme.colorText}`}>
                  Tailor/Customer Focus
                </h3>
                <p className={`text-sm ${theme.subTextColor}`}>
                  Personalized experiences tailored to meet the unique needs of
                  both tailors and customers.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start space-x-4">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full ${theme.colorText} border-2 border-current`}
              >
                <i className="fas fa-check"></i>
              </div>
              <div>
                <h3 className={`text-2xl font-semibold ${theme.colorText}`}>
                  24/7 AI Chatbot Support
                </h3>
                <p className={`text-sm ${theme.subTextColor}`}>
                  Get assistance anytime with our advanced AI chatbot, always
                  ready to help.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start space-x-4">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full ${theme.colorText} border-2 border-current`}
              >
                <i className="fas fa-check"></i>
              </div>
              <div>
                <h3 className={`text-2xl font-semibold ${theme.colorText}`}>
                  Customizable Products
                </h3>
                <p className={`text-sm ${theme.subTextColor}`}>
                  Choose from a wide range of designs and customize products to
                  suit your style.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-start space-x-4">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full ${theme.colorText} border-2 border-current`}
              >
                <i className="fas fa-check"></i>
              </div>
              <div>
                <h3 className={`text-2xl font-semibold ${theme.colorText}`}>
                  Free Virtual Try-On
                </h3>
                <p className={`text-sm ${theme.subTextColor}`}>
                  Experience a realistic virtual try-on experience for your
                  convenience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`mt-4 mb-10 w-[97%] mx-auto py-12 px-6 rounded-3xl ${theme.mainTheme} ${theme.colorBorder}`}
      >
        <p
          className={`absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-[10rem] font-extrabold -z-10 ${theme.colorText} opacity-[2%] `}
        >
          Footer
        </p>
        {/* Footer Box Wrapper */}
        <div
          className={`w-full flex flex-wrap justify-between space-y-8 md:space-y-0 p-6 rounded-3xl`}
        >
          {/* Left - Logo and Social Links */}
          <div className="flex flex-col space-y-6 w-full md:w-1/3">
            <Logo fontSize={"text-2xl"} />
            <h3 className={`text-3xl font-bold ${theme.colorText}`}>
              Virtual Tailor
            </h3>
            <div className="flex space-x-4">
              {["facebook", "twitter", "linkedin", "instagram", "youtube"].map(
                (platform) => (
                  <div
                    key={platform}
                    className={`w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-800 transition duration-300`}
                  >
                    <i className={`fab fa-${platform} text-xl`}></i>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Center - Quick Links */}
          <div className="flex flex-col space-y-4 w-full md:w-1/3">
            <h3 className={`text-3xl font-bold ${theme.colorText}`}>
              Quick Links
            </h3>
            <div className="flex w-auto">
              <Link
                href="/about-us"
                className={`text-lg ${theme.subTextColor}`}
              >
                About Us
              </Link>
            </div>
            <div className="flex w-auto">
              <Link
                href="/contact-us"
                className={`text-lg ${theme.subTextColor}`}
              >
                Contact Us
              </Link>
            </div>
            <div className="flex w-auto">
              <Link href="/faq" className={`text-lg ${theme.subTextColor}`}>
                Frequently Asked Questions
              </Link>
            </div>
          </div>

          {/* Right - Newsletter Subscription */}
          <div className="flex flex-col space-y-6 w-full md:w-1/3">
            <h3 className={`text-3xl font-bold ${theme.colorText}`}>
              Subscribe to our Newsletter
            </h3>
            <form className="flex items-center space-x-4">
              <div className="relative mb-4">
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`${inputStyles}`}
                  placeholder=" "
                />
                <label className={`${placeHolderStyles}`} htmlFor="email">
                  Email
                </label>
              </div>

              <SimpleButton
                btnText={"Subscribe"}
                extraclasses="mt-4 py-2 -translate-y-3 "
                type="primary-submit"
                disabled={false} // Set to true for disabling
                onClick={() => {}}
              />
            </form>
          </div>
        </div>

        {/* Secondary Footer */}
        <div className={`w-full text-center text-lg`}>
          © 2024 TailorEase. All Rights Reserved.
        </div>
      </div>
    </>
  );
}
