"use client";
import { useEffect, useState, useContext } from "react";
import UserContext from "@/utils/UserContext";
import { useParams, useRouter } from "next/navigation";
import SimpleButton from "@/components/SimpleButton";

const BusinessDashboard = () => {
  const { id } = useParams();
  const {
    theme,
    userLoggedIn,
    userData,
    setPopUpMessageTrigger,
    setShowMessage,
  } = useContext(UserContext);
  const router = useRouter();

  useEffect(() => {
    if (!userLoggedIn) {
      setShowMessage({
        type: "info",
        message: "Log in to continue to your business dashboard",
      });
      setPopUpMessageTrigger(true);
      router.push(`/login?redirect=/business-dashboard/${id}`);
      return;
    }
  }, [userLoggedIn, router]);

  return id === userData.bId ? (
    <div
      className={`items-center p-6 mx-auto my-4 rounded-3xl max-w-[97%] max-h-[96%] h-[96%] overflow-hidden select-none justify-center text-3xl text-white flex ${theme.mainTheme}`}
    >
      <div className="flex flex-col mr-3">{id}:</div>
      <div className="flex">Your business dashboard is not ready</div>
    </div>
  ) : (
    <div
      className={`items-center p-6 mx-auto my-4 rounded-3xl max-w-[97%] max-h-[96%] h-[96%] overflow-hidden select-none justify-center text-3xl text-white flex ${theme.mainTheme}`}
    >
      <div>
        <span className={`mr-3 ${theme.colorText}`}>
          This business does NOT belong to you
        </span>
      </div>
      <div>
        <SimpleButton
          btnText={"Go Home"}
          type={"primary"}
          onClick={() => router.push("/")}
        />
      </div>
    </div>
  );
};

export default BusinessDashboard;
