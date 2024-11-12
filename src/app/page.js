import React from "react";
import SimpleButton from "@/components/SimpleButton";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex justify-center items-center h-full">
      <Link href={"/become-tailor"}>
        <SimpleButton
          btnText={"Become a Tailor"}
          type={"primary"}
          extraclasses={"py-5 text-3xl select-none"}
        />
      </Link>
    </div>
  );
}
