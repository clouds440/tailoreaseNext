"use client";

import React, { useRef, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import SimpleButton from "../components/SimpleButton";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useRouter } from "next/navigation";

const QuickView = ({ theme, tailor, onClose }) => {
  const popupRef = useRef(null);
  const router = useRouter();
  const db = getFirestore();
  const [isLoading, setIsLoading] = useState(false); 

  const rating = tailor?.rating || 0;
  const totalRating = tailor?.total_rating || 0;

  const normalizedRating = totalRating ? (rating / totalRating) * 5 : 0;
  const reviewCount = totalRating ? Math.floor(totalRating / 6) : 0;

  const handleOutsideClick = (e) => {
    if (popupRef.current && !popupRef.current.contains(e.target)) {
      onClose();
    }
  };

  useEffect(() => {
    if (tailor) {
      document.addEventListener("click", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [tailor]);

  const handleViewProfile = async () => {
    setIsLoading(true);  // Start the loading state

    try {
      // Reference to the 'tailors' collection
      const tailorsRef = collection(db, "tailors");

      // Query the collection where ownerId matches
      const q = query(tailorsRef, where("ownerId", "==", tailor.ownerId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Get the ID of the first matching document
        const tailorDoc = querySnapshot.docs[0];
        const tailorId = tailorDoc.id; // Firestore document ID

        // Redirect to the dynamic profile page with the document ID
        router.push(`/tailors/profile/${tailorId}`);
      } else {
        console.log("No matching tailor document found.");
      }
    } catch (error) {
      console.error("Error fetching tailor document:", error);
    } finally {
      setIsLoading(false);  // End the loading state
    }
  };

  const popupVariants = {
    hidden: {
      scale: 0,
      opacity: 0,
    },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      scale: 0,
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <AnimatePresence>
      {tailor && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          variants={popupVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div
            ref={popupRef}
            className={`w-11/12 max-w-2xl p-6 rounded-lg shadow-lg ${theme.mainTheme}`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-2xl font-bold ${theme.colorText}`}>
                {tailor.businessName}
              </h3>
              <button
                onClick={onClose}
                className={`text-2xl ${theme.colorText} ${theme.hoverText} rounded-full p-2`}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-x-6 mb-6">
              <img
                src={tailor.businessPictureUrl}
                alt={tailor.businessName}
                className="w-[10rem] h-[6rem] object-cover rounded-lg shadow-md"
                onError={(e) => {
                  e.target.src = "/images/profile/business/default.png";
                }}
              />
              <div className="flex flex-col justify-center space-y-2 mt-4 sm:mt-0">
                <p className={`text-sm ${theme.colorText}`}>
                  Experience: {tailor.experience} years
                </p>
                <p className={`text-sm ${theme.colorText}`}>
                  Working Hours: {tailor.openTime} - {tailor.closeTime}
                </p>
                <p className={`text-sm ${theme.colorText}`}>
                  Address: {tailor.businessAddress || "Not provided"}
                </p>
              </div>
            </div>
            <div className="mb-6">
              <p className={`text-lg mb-2 font-semibold ${theme.colorText}`}>
                Specialities
              </p>
              <div className="flex flex-wrap gap-2">
                {tailor.specialities?.length > 0 ? (
                  tailor.specialities.map((speciality, index) => (
                    <span
                      key={index}
                      className={`px-4 py-2 ${theme.colorText} ${theme.mainTheme} rounded-lg text-sm ${theme.colorBorder}`}
                    >
                      {speciality}
                    </span>
                  ))
                ) : (
                  <span className={`${theme.colorText}`}>
                    No specialities listed
                  </span>
                )}
              </div>
            </div>
            <div className="mb-6">
              <p className={`text-lg font-semibold ${theme.colorText}`}>
                Rating
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-yellow-500 font-bold text-xl">
                  {"★".repeat(Math.floor(normalizedRating))}
                  {"☆".repeat(5 - Math.floor(normalizedRating))}
                </span>
                <span className={`text-sm ${theme.colorText}`}>
                  ({normalizedRating.toFixed(1)})
                </span>
              </div>
              <p className={`text-sm ${theme.colorText}`}>
                Reviews: {reviewCount || 0}{" "}
                {reviewCount === 1 ? "review" : "reviews"}
              </p>
            </div>
            <SimpleButton
              btnText={isLoading ? <LoadingSpinner size={24} /> : "View Complete Profile"}
              type="primary-submit"
              extraclasses={"w-full"}
              onClick={handleViewProfile}
              disabled={isLoading}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuickView;
