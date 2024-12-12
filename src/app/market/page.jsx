"use client";
import { useContext } from "react";
import UserContext from "@/utils/UserContext";

const Market = () => {
  const { theme } = useContext(UserContext);

  return (
    <div
      className={`items-center p-6 mx-auto my-4 rounded-3xl max-w-[97%] max-h-[96%] h-[96%] overflow-hidden select-none justify-center text-3xl text-white flex ${theme.mainTheme}`}
    >
      <div className="flex">Market is not ready</div>
      <div className="flex flex-col ml-3"></div>
    </div>
  );
};

export default Market;
