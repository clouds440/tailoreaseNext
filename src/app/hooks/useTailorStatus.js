import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/utils/firebaseConfig";

const useTailorStatus = (userLoggedIn, userData) => {
  const [isVerifiedTailor, setIsVerifiedTailor] = useState(false);
  const [activeDashboard, setActiveDashboard] = useState("user");

  useEffect(() => {
    const checkTailorStatus = async () => {
      if (!userLoggedIn || !userData.uid) {
        setIsVerifiedTailor(false);
        setActiveDashboard("user");
        return;
      }

      try {
        const tailorsRef = collection(db, "tailors");
        const q = query(tailorsRef, where("ownerId", "==", userData.uid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const tailorData = querySnapshot.docs[0].data();
          setIsVerifiedTailor(tailorData.approved === true);
        } else {
          setIsVerifiedTailor(false);
        }
        // Always start with user dashboard by default
        setActiveDashboard("user");
      } catch (error) {
        console.error("Error checking tailor status:", error);
        setIsVerifiedTailor(false);
        setActiveDashboard("user");
      }
    };

    checkTailorStatus();
  }, [userLoggedIn, userData]);

  return { isVerifiedTailor, activeDashboard, setActiveDashboard };
};

export default useTailorStatus;
