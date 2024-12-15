"use client";
import { useEffect, useContext, useState } from "react";
import UserContext from "@/utils/UserContext";
import { useRouter } from "next/navigation";
import { ClipLoader } from "react-spinners";
import { db, collection, query, where, getDocs } from "@/utils/firebaseConfig";

const BusinessDashboard = () => {
  const {
    theme,
    userLoggedIn,
    userData,
    setPopUpMessageTrigger,
    setShowMessage,
  } = useContext(UserContext);
  const router = useRouter();
  const [businessData, setBusinessData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkBusinessAccount = async () => {
      if (!userLoggedIn) {
        setShowMessage({
          type: "info",
          message: "Log in to continue to your business dashboard",
        });
        setPopUpMessageTrigger(true);
        router.push(`/login?redirect=/business-dashboard`);
        return;
      }
      if (!userData.bId) {
        router.push("/become-tailor");
        return;
      }
      try {
        const userQuery = query(
          collection(db, "tailors"),
          where("ownerId", "==", userData.uid)
        );
        const querySnapshot = await getDocs(userQuery);

        if (!querySnapshot.empty) {
          const tailorDoc = querySnapshot.docs[0];
          setBusinessData(tailorDoc.data());
          const { approved } = tailorDoc.data();
          if (!approved) {
            router.push("/become-tailor");
            return null;
          }
        }
      } catch (error) {
        console.error("Error checking business account:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkBusinessAccount();
  }, [userLoggedIn, router, userData, setPopUpMessageTrigger, setShowMessage]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full bg-gray-700 backdrop-blur-md bg-opacity-30">
        <ClipLoader size={60} color="#ffffff" />
      </div>
    ); // Loading indicator while checking
  }

  return businessData.status === "active" ? (
    <div
      className={`items-center p-6 mx-auto my-4 rounded-3xl max-w-[97%] max-h-[96%] h-[96%] overflow-hidden select-none justify-center text-3xl text-white flex ${theme.mainTheme}`}
    >
      {/* Business account is approved and active. Dashboard content displayed here */}
      <div className="flex flex-col mr-3">{businessData.businessName}:</div>
      <div className="flex">Your business dashboard is not ready</div>
    </div>
  ) : (
    <div
      className={`items-center p-6 mx-auto my-4 rounded-3xl max-w-[97%] max-h-[96%] h-[96%] overflow-hidden select-none justify-center text-3xl text-white flex ${theme.mainTheme}`}
    >
      {/* Business account is suspended */}
      <div className="flex flex-col mr-3">{businessData.businessName}:</div>
      <div className="flex">
        Your business account is suspended. Please contact customer support for
        more information
      </div>
    </div>
  );
};

export default BusinessDashboard;
