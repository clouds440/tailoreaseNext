"use client";
import { useEffect, useContext, useState } from "react";
import UserContext from "@/utils/UserContext";
import { useRouter } from "next/navigation";
import { ClipLoader } from "react-spinners";
import { db } from "@/utils/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import TailorAddProductPage from "../add-product/page";

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
          const tailorData = tailorDoc.data();
          setBusinessData(tailorData);

          if (!tailorData || !tailorData.approved) {
            router.push("/become-tailor");
            return;
          }
        } else {
          router.push("/become-tailor");
          return;
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
      <div
        className={`max-w-[99.5%] mx-auto my-4 md:my-1 flex justify-center items-center h-full ${theme.mainTheme}`}
      >
        <ClipLoader size={60} color="#ffffff" />
      </div>
    ); // Loading indicator while checking
  }

  if (!businessData) {
    return null; // To prevent rendering issues
  }

  return businessData.status === "active" ? (
    <div className="h-full overflow-y-auto">
      <div
        className={`max-w-[99.5%] mx-auto items-center p-6 my-4 md:my-1 rounded-lg h-fit min-h-full select-none justify-center flex ${theme.mainTheme}`}
      >
        {/* Business account is approved and active. Dashboard content displayed here */}
        <TailorAddProductPage />
      </div>
    </div>
  ) : (
    <div
      className={`max-w-[99.5%] mx-auto items-center p-6 my-4 md:my-1 rounded-lg h-full overflow-hidden select-none justify-center flex ${theme.mainTheme}`}
    >
      {/* Business account is suspended */}
      <div className="flex flex-col mr-3 text-3xl">
        {businessData.businessName}:
      </div>
      <div className="flex text-3xl">
        Your business account is suspended. Please contact customer support for
        more information
      </div>
    </div>
  );
};

export default BusinessDashboard;
