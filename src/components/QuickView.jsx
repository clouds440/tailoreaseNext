"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { AnimatePresence, easeIn, motion } from "framer-motion";
import SimpleButton from "../components/SimpleButton";
import { useRouter } from "next/navigation";
import Image from "next/image";

const QuickView = ({ theme, tailor, setPopupVisible, popupVisible }) => {
  const [showPopUp, setShowPopUp] = useState(popupVisible);
  const popupRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    setShowPopUp(popupVisible);
  }, [popupVisible]);

  const rating = tailor?.rating || 0;
  const totalRating = tailor?.total_rating || 0;

  const normalizedRating = totalRating ? (rating / totalRating) * 5 : 0;
  const reviewCount = totalRating ? Math.floor(totalRating / 6) : 0;

  const handleClose = useCallback(() => {
    setShowPopUp(false);
    setTimeout(() => {
      setPopupVisible(false);
    }, 300);
  }, [setShowPopUp, setPopupVisible]);

  const handleOutsideClick = (e) => {
    if (popupRef.current && !popupRef.current.contains(e.target)) {
      handleClose();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleClose(); // Trigger the Cancel button on Esc key press
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleClose]);

  useEffect(() => {
    if (tailor) {
      document.addEventListener("click", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tailor]);

  const handleViewProfile = () => {
    router.push(`/tailors/profile/${tailor.id}`);
  };

  const popupVariants = {
    hidden: {
      scale: 0.7,
      opacity: 0.5,
    },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "linear",
        ease: "linear",
        stiffness: 100,
        damping: 30,
        duration: 0.2,
      },
    },
    exit: {
      scale: 0.7,
      opacity: 0,
      transition: {
        duration: 0.1,
        type: "linear",
        ease: "linear",
        stiffness: 200,
      },
    },
  };

  return (
    <AnimatePresence>
      {showPopUp && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          ></motion.div>

          {/* Popup */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50"
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
                  onClick={handleClose}
                  className={`text-2xl ${theme.colorText} ${theme.hoverText} rounded-full p-2`}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="flex flex-col sm:flex-row items-center space-x-6 mb-6">
                <Image
                  src={
                    tailor.businessPictureUrl ||
                    "/images/profile/business/default.png"
                  }
                  width={192} // Adjust dimensions as needed
                  height={144}
                  alt={`Image of ${tailor.businessName}`}
                  className={`object-cover rounded-lg lg:rounded-xl shadow-md max-h-32 border ${theme.colorBorder}`}
                  priority={false} // Use `priority={true}` if this image is above the fold
                  placeholder="blur" // Optional, for placeholder loading effects
                  blurDataURL="/images/profile/business/default.png" // Add a low-res placeholder image
                />
                <div className="flex flex-col space-y-2">
                  <p className={`text-sm ${theme.colorText}`}>
                    Experience: {tailor.experience} years
                  </p>
                  <p className={`text-sm ${theme.colorText}`}>
                    Working Hours: {tailor.openTime} - {tailor.closeTime}
                  </p>
                  <p className={`text-sm ${theme.colorText}`}>
                    Address: {tailor.businessAddress}
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
                btnText={"View Profile"}
                type="primary-submit"
                extraclasses={"w-full"}
                onClick={handleViewProfile}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QuickView;
