"use client";
import { useContext } from "react";
import UserContext from "@/utils/UserContext";
import Image from "next/image";
import Link from "next/link";
const Market = () => {
  const { theme } = useContext(UserContext);

  return (
    <div
      className={`max-w-[99.5%] mx-auto items-center p-6 my-4 md:my-1 rounded-lg h-screen overflow-hidden select-none justify-center flex ${theme.mainTheme}`}
    >
      <Link href={"/outfit-customization"}>
        <Image
          className="max-w-full p-12 w-auto cursor-pointer border"
          src="/thumbnails/jacket-thumbnail.png"
          alt="This is the login Image."
          width={100} // Specify the width
          height={100} // Specify the height
          priority // Optional: for high-priority images like login
        />
      </Link>
    </div>
  );
};

export default Market;
