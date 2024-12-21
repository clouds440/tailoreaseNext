"use client";

import React, { useContext } from "react";
import UserContext from "@/utils/UserContext";
import Logo from "@/components/Logo";
import SimpleButton from "@/components/SimpleButton";
import Link from "next/link";
import RotatingJacket from "@/components/RotatingJacket";

export default function Home() {
  const { theme, inputStyles, placeHolderStyles } = useContext(UserContext);

  return (
    <>
      <div
        className={`max-w-[99.5%] mx-auto p-6 mt-3 md:mt-1 mb-2 rounded-lg flex flex-col items-center overflow-hidden select-none ${theme.mainTheme}`}
      >
        {/* Top Section */}
        <div
          className={`w-full flex flex-wrap-reverse justify-evenly items-center`}
        >
          {/* Left Section */}
          <div data-aos="fade-right" className="max-w-lg mt-4">
            <h3 className={`text-7xl font-extrabold ${theme.colorText}`}>
              TailorEase
            </h3>
            <p className={`text-lg ${theme.subTextColor}`}>
              AI Enhanced Fitting Experience
            </p>
            <p className={`text-lg mt-8 ${theme.subTextColor}`}>
              Revolutionize the way you shop and connect with tailors. Virtual
              shops, try-ons, and custom orders – all in one platform.
            </p>
            <Link href={"/market"}>
              <SimpleButton
                btnText="Get Started Now"
                extraclasses="mt-4 py-3"
              />
            </Link>
          </div>

          {/* Right Section */}
          <div className="relative" data-aos="fade-left">
            <RotatingJacket />
            <p className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] p-4 rounded-2xl text-[#00000030] text-[22rem] font-extrabold -z-10">
              TE
            </p>
          </div>
        </div>

        {/* "Why Choose Us" Section */}
        <div
          className={`mt-16 w-full py-12 px-6 rounded-3xl relative flex flex-col items-center`}
          data-aos="fade-up"
        >
          <h2 className={`text-4xl font-bold ${theme.colorText}`}>
            Why Choose TailorEase
          </h2>
          <p
            className={`absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-[10rem] font-extrabold -z-10 ${theme.colorText} opacity-[2%]`}
          >
            Benefits
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 w-full max-w-4xl">
            {[
              {
                title: "Tailor/Customer Focus",
                description:
                  "Personalized experiences tailored to meet the unique needs of both tailors and customers.",
              },
              {
                title: "24/7 AI Chatbot Support",
                description:
                  "Get assistance anytime with our advanced AI chatbot, always ready to help.",
              },
              {
                title: "Customizable Products",
                description:
                  "Choose from a wide range of designs and customize products to suit your style.",
              },
              {
                title: "Free Virtual Try-On",
                description:
                  "Experience a realistic virtual try-on experience for your convenience.",
              },
            ].map(({ title, description }, index) => (
              <div className="flex items-start space-x-4" key={index}>
                <div
                  className={`flex items-center justify-center w-14 h-12 rounded-3xl ${theme.colorText} border-2 border-current`}
                >
                  <i className="fas fa-check"></i>
                </div>
                <div>
                  <h3 className={`text-2xl font-semibold ${theme.colorText}`}>
                    {title}
                  </h3>
                  <p className={`text-sm ${theme.subTextColor}`}>
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className={`max-w-[99.5%] mx-auto mb-2 md:mb-1 py-12 px-6 rounded-lg overflow-x-hidden ${theme.mainTheme} ${theme.colorBorder}`}
      >
        <p
          className={`absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-[10rem] font-extrabold -z-10 ${theme.colorText} opacity-[2%]`}
        >
          Footer
        </p>

        {/* Footer Box Wrapper */}
        <div
          className={`w-full flex flex-wrap justify-between space-y-8 md:space-y-0 p-6 rounded-3xl`}
        >
          <div className="flex flex-col space-y-6 w-full lg:w-1/3">
            <Logo />
            <h3 className={`text-2xl font-bold ${theme.colorText}`}>
              Follow Us
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
          <div className="flex flex-col space-y-4 w-full lg:w-1/3">
            <h3 className={`text-2xl font-bold ${theme.colorText}`}>
              Quick Links
            </h3>
            <ul>
              {[
                { href: "/about-us", text: "About Us" },
                { href: "/contact-us", text: "Contact Us" },
                { href: "/faq", text: "FAQ" },
              ].map(({ href, text }) => (
                <li key={text}>
                  <Link
                    href={href}
                    className={`inline-block text-lg my-2 ${theme.hoverText}`}
                  >
                    {text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Right - Newsletter Subscription */}
          <div className="flex flex-col space-y-6 w-full lg:w-1/3">
            <h3 className={`text-3xl font-bold ${theme.colorText}`}>
              Stay Updated
            </h3>
            <form className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  className={`${inputStyles}`}
                  placeholder=" "
                />
                <label className={`${placeHolderStyles}`} htmlFor="email">
                  Enter Email
                </label>
              </div>
              <SimpleButton
                btnText={"Subscribe"}
                extraclasses="py-2"
                type="primary"
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
