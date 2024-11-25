"use client";

import { useState, useEffect, useContext } from "react";
import { useParams } from "next/navigation";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { ClipLoader } from "react-spinners";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import SimpleButton from "@/components/SimpleButton";
import UserContext from "../../../../utils/UserContext";
import Link from "next/link";

const TailorProfile = () => {
  const [tailorData, setTailorData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const db = getFirestore();
  const { theme, inputStyles, placeHolderStyles } = useContext(UserContext);
  const { id } = useParams();

  useEffect(() => {
    const fetchTailorData = async () => {
      try {
        setIsLoading(true);
        const tailorDocRef = doc(db, "tailors", id);
        const docSnap = await getDoc(tailorDocRef);

        if (docSnap.exists()) {
          setTailorData(docSnap.data());
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching tailor data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTailorData();
  }, [id]);

  const handleReviewSubmit = () => {
    setIsSubmitting(true);
    console.log("Review submitted:", review);
    setTimeout(() => {
      setIsSubmitting(false);
      setReview("");
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full bg-gray-700 backdrop-blur-md bg-opacity-30">
        <ClipLoader size={60} color="#ffffff" />
      </div>
    ); // Loading indicator while checking
  }

  const rating = tailorData?.rating || 0;
  const totalRating = tailorData?.total_rating || 0;
  const calculatedRating = totalRating > 0 ? (rating / totalRating) * 5 : 0;

  const numberOfReviews = totalRating > 0 ? Math.floor(totalRating / 6) : 0;

  return tailorData ? (
    <div
      className={`max-w-[97%] mx-auto mt-8 my-2 rounded-xl overflow-hidden p-12 ${theme.mainTheme}`}
    >
      <div className="flex flex-col sm:flex-row items-center space-x-6 mb-6">
        <img
          src={tailorData.businessPictureUrl}
          alt={tailorData.businessName}
          className="w-[16rem] h-[14rem] object-cover rounded-lg shadow-md"
          onError={(e) => {
            if (!e.target.dataset.fallback) {
              e.target.dataset.fallback = true;
              e.target.src = "/images/profile/business/default.png";
            }
          }}
        />
        <div className="flex w-full flex-col mt-4 sm:mt-0">
          <div className="flex w-full justify-between items-center mb-6">
            <h1
              className={`border-b-[1px] pb-1 w-full text-3xl font-bold ${theme.colorText}`}
            >
              {tailorData.businessName}
            </h1>
          </div>
          <p className={`text-lg ${theme.colorText}`}>
            Experience: {tailorData.experience} years
          </p>
          <p className={`text-lg ${theme.colorText}`}>
            Working Hours: {tailorData.openTime} - {tailorData.closeTime}
          </p>
          <p className={`text-lg ${theme.colorText}`}>
            Address: {tailorData.businessAddress || "Not provided"}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <p
          className={`text-xl mb-2 border-b-[1px] pb-1 font-semibold ${theme.colorText}`}
        >
          Description
        </p>
        <p className={`text-lg ${theme.colorText}`}>
          {tailorData.description || <sub>No discription available</sub>}
        </p>
      </div>

      <div className="mb-6">
        <p className={`text-xl mb-2 pb-1 font-semibold ${theme.colorText}`}>
          Specialities
        </p>
        <div className="flex flex-wrap gap-2">
          {tailorData.specialities?.length > 0 ? (
            tailorData.specialities.map((speciality, index) => (
              <span
                key={index}
                className={`px-4 py-2 rounded-lg text-sm ${theme.colorText} ${theme.mainTheme} ${theme.colorBorder}`}
              >
                {speciality}
              </span>
            ))
          ) : (
            <span className={`${theme.colorText}`}>No specialities listed</span>
          )}
        </div>
      </div>

      <div className="mb-6">
        <p className={`text-xl font-semibold ${theme.colorText}`}>Rating</p>
        <div className="flex items-center space-x-2">
          <span className="text-yellow-500 font-bold text-xl">
            {"★".repeat(Math.floor(calculatedRating))}
            {"☆".repeat(5 - Math.floor(calculatedRating))}
          </span>
          <span className={`text-sm ${theme.colorText}`}>
            ({calculatedRating.toFixed(1)})
          </span>
        </div>
        <p className={`text-sm ${theme.colorText}`}>
          Reviews: {numberOfReviews}
        </p>
      </div>

      <div className="mb-6">
        <p className={`text-xl font-semibold ${theme.colorText}`}>
          Leave a Review
        </p>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Write your review here"
          className={`${theme.mainTheme} ${theme.colorText} ${theme.hoverShadow} my-3 w-full p-4 border rounded-lg text-lg focus:outline-none`}
          rows={4}
        />
        <SimpleButton
          btnText={
            isSubmitting ? <LoadingSpinner size={24} /> : "Submit Review"
          }
          type="primary-submit"
          extraclasses={"w-full"}
          disabled={isSubmitting}
          onClick={handleReviewSubmit}
        />
      </div>
    </div>
  ) : (
    <div
      className={`max-w-[97%] mt-8 mx-auto my-2 rounded-xl p-12 ${theme.mainTheme}`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-center space-x-6 mb-6">
        <div className="flex flex-col items-center">
          <span className="text-3xl mb-4">
            <h1>Tailor Not Found!</h1>
          </span>
          <Link href={"/tailors"}>
            <SimpleButton btnText={"See All Tailors"} type={"primary"} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TailorProfile;
