"use client";
import { useContext } from "react";
import UserContext from "@/utils/UserContext";

const Market = () => {
  const { theme } = useContext(UserContext);

  return (
    <div
      className={`max-w-[99.5%] mx-auto items-center p-6 my-4 md:my-1 rounded-lg h-[96%] overflow-hidden select-none justify-center flex ${theme.mainTheme}`}
    >
      <div className="flex text-3xl">Market is not ready</div>
    </div>
  );
};

export default Market;
