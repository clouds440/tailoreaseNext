"use client";

import React, { useContext } from "react";
import UserContext from "@/utils/UserContext";
import Logo from "@/components/Logo";
import SimpleButton from "@/components/SimpleButton";
import Link from "next/link";

export default function Home() {
  const { theme, inputStyles, placeHolderStyles } = useContext(UserContext);

  return (
    <div className="h-full overflow-y-auto">
      <div
        className={`max-w-[99.5%] mx-auto p-6 mt-3 md:mt-1 mb-1 rounded-lg flex flex-col items-center overflow-hidden select-none ${theme.mainTheme}`}
      >
        {/* Top Section */}
        <div className="w-full flex flex-wrap-reverse justify-evenly items-center gap-6">
          {/* Left Section */}
          <div data-aos="fade-right" className="max-w-xl mt-4 space-y-5">
            <h3
              className={`text-6xl md:text-7xl font-extrabold leading-tight ${theme.colorText}`}
            >
              TailorEase
            </h3>
            <p className={`text-xl ${theme.subTextColor}`}>
              AI Enhanced Fitting Experience
            </p>
            <p className={`text-md md:text-lg mt-6 ${theme.subTextColor}`}>
              Revolutionize the way you shop and connect with tailors. Virtual
              shops, try-ons, and custom orders – all in one platform.
            </p>
            <Link href="/market">
              <SimpleButton
                btnText="Get Started Now"
                extraclasses="mt-6 py-3"
              />
            </Link>
          </div>

          {/* Right Section */}
          <div
            className="relative flex justify-center items-center"
            data-aos="fade-left"
          >
            <p className="absolute text-[22rem] font-extrabold -z-10 text-[#00000030]">
              TE
            </p>
            {/* You can add an illustration/model here later */}
          </div>
        </div>

        {/* Why Choose Us */}
        <div
          className="mt-20 w-full py-12 px-6 rounded-3xl relative flex flex-col items-center"
          data-aos="fade-up"
        >
          <h2
            className={`text-4xl md:text-5xl font-bold text-center ${theme.colorText}`}
          >
            Why Choose TailorEase
          </h2>
          <p
            className={`absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] text-[10rem] font-extrabold -z-10 ${theme.colorText} opacity-[2%]`}
          >
            Benefits
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-12 w-full max-w-5xl">
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
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-2xl border border-white/10 hover:shadow-md transition-all duration-300"
              >
                <div
                  className={`w-14 h-12 flex items-center justify-center rounded-3xl border-2 ${theme.colorText}`}
                >
                  <i className="fas fa-check"></i>
                </div>
                <div>
                  <h3 className={`text-2xl font-semibold ${theme.colorText}`}>
                    {title}
                  </h3>
                  <p className={`text-sm mt-1 ${theme.subTextColor}`}>
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className={`max-w-[99.5%] mx-auto mb-3 md:mb-1 py-12 px-6 rounded-lg overflow-x-hidden ${theme.mainTheme} ${theme.colorBorder}`}
      >
        <p
          className={`absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] text-[10rem] font-extrabold -z-10 ${theme.colorText} opacity-[2%]`}
        >
          Footer
        </p>

        <div className="w-full flex flex-wrap justify-between gap-y-10 md:gap-y-0 p-6 rounded-3xl">
          {/* Logo + Socials */}
          <div className="flex flex-col gap-6 w-full lg:w-1/3">
            <Logo />
            <h3 className={`text-2xl font-bold ${theme.colorText}`}>
              Follow Us
            </h3>
            <div className="flex gap-4">
              {["facebook", "twitter", "linkedin", "instagram", "youtube"].map(
                (platform) => (
                  <div
                    key={platform}
                    className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-800 transition duration-300"
                  >
                    <i className={`fab fa-${platform} text-xl`}></i>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4 w-full lg:w-1/3">
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

          {/* Newsletter */}
          <div className="flex flex-col gap-6 w-full lg:w-1/3">
            <h3 className={`text-3xl font-bold ${theme.colorText}`}>
              Stay Updated
            </h3>
            <form className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  className={`${inputStyles}`}
                  placeholder=" "
                />
                <label htmlFor="email" className={`${placeHolderStyles}`}>
                  Enter Email
                </label>
              </div>
              <SimpleButton
                btnText="Subscribe"
                extraclasses="py-2"
                type="primary"
              />
            </form>
          </div>
        </div>

        <div
          className={`w-full text-center text-lg mt-10 ${theme.subTextColor}`}
        >
          © 2024 TailorEase. All Rights Reserved.
        </div>
      </div>
    </div>
  );
}
