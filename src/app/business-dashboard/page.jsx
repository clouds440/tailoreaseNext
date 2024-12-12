"use client";
import { useEffect, useContext } from "react";
import UserContext from "@/utils/UserContext";
import { useRouter } from "next/navigation";
import SimpleButton from "@/components/SimpleButton";

const BusinessDashboard = () => {
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
      router.push(`/login?redirect=/business-dashboard`);
      return;
    }
  }, [userLoggedIn, router]);

  // when the business data is being fetched, the "Approved" status will be checked each time and the below userData.bId will be changed with approved ?
  return userData.bId ? (
    <div
      className={`items-center p-6 mx-auto my-4 rounded-3xl max-w-[97%] max-h-[96%] h-[96%] overflow-hidden select-none justify-center text-3xl text-white flex ${theme.mainTheme}`}
    >
      {/* Business content displayed here */}
      <div className="flex flex-col mr-3">Business Name:</div>
      <div className="flex">Your business dashboard is not ready</div>
    </div>
  ) : (
    router.push("/become-tailor")
  );
};

export default BusinessDashboard;
