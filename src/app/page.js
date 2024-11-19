"use client";

import React, { useContext } from "react";
import UserContext from "@/utils/UserContext";
import SimpleButton from "../components/SimpleButton";

export default function Home() {
  const { theme } = useContext(UserContext); // Access theme from UserContext

  return (
    <div
      className={`max-w-[97%] p-8 mx-auto my-4 border rounded-3xl flex flex-wrap-reverse justify-evenly items-center overflow-hidden relative ${theme.mainTheme} ${theme.colorBorder}`}
    >
      {/* Left Section */}
      <div
        data-aos="fade-right"
        className="max-w-lg mt-4"
      >
        <h3
          className={`text-7xl font-extrabold ${theme.colorText}`}
        >
          Virtual Tailor
        </h3>
        <p className={`text-lg ${theme.subTextColor}`}>
          AI Enhanced Fitting Experience
        </p>
        <p className={`text-lg mt-8 ${theme.subTextColor}`}>
          "Join the platform where tailors create virtual shops and users try on outfits and place orders instantly!"
        </p>
        <SimpleButton
        btnText="Get Started Now"
        extraclasses="mt-4"
      />
      </div>

      {/* Right Section */}
      <div className="relative" data-aos="fade-left">
        <img
          className="tailor"
          src="https://raw.githubusercontent.com/sraghuvanshi/vue-quiz/master/dist/animation-2.gif"
          alt="This is the 3D animation of a tailor."
        />
        <p
          className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] p-4 rounded-2xl text-[#00000017] text-[22rem] font-extrabold -z-10"
        >
          VT
        </p>
      </div>
    </div>
  );
}
