"use client";
import { useState, useEffect, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/utils/firebaseConfig";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import { ClipLoader } from "react-spinners";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import SimpleButton from "@/components/SimpleButton";
import UserContext from "@/utils/UserContext";
import Link from "next/link";
import UpdateTailorRating from "@/components/UpdateTailorRating";
import DialogBox from "@/components/DialogBox";

const TailorProfile = () => {
  const [tailorData, setTailorData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userReview, setUserReview] = useState("");
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const {
    theme,
    userLoggedIn,
    userData,
    setShowMessage,
    setPopUpMessageTrigger,
    inputStyles,
    placeHolderStyles,
  } = useContext(UserContext);
  const { id } = useParams();
  const [statusMessage, setStatusMessage] = useState({
    type: "",
    message: "",
  });
  const [fetchedReviews, setFetchedReviews] = useState([]);

  const [showDialog, setShowDialog] = useState(false);
  const [dialogBoxInfo, setDialogBoxInfo] = useState({
    title: "",
    body: "",
    type: "",
    buttons: [],
  });

  useEffect(() => {
    const fetchTailorData = async () => {
      try {
        setIsLoading(true);

        // Fetch the tailor data
        const tailorDocRef = doc(db, "tailors", id); // Reference to the tailor document
        const docSnap = await getDoc(tailorDocRef); // Get the document snapshot

        if (docSnap.exists()) {
          setTailorData(docSnap.data()); // Update tailorData state with the fetched data

          // Fetch reviews related to this tailor
          const reviewsRef = collection(db, "tailor_reviews");
          const reviewsQuery = query(reviewsRef, where("tailor_id", "==", id)); // Query to get reviews for the tailor
          const reviewsSnap = await getDocs(reviewsQuery); // Get all matching reviews

          const reviewsData = [];
          const userPromises = [];

          reviewsSnap.forEach((reviewDoc) => {
            const reviewData = { ...reviewDoc.data(), userName: null }; // Initialize userName as null
            reviewsData.push(reviewData); // Push the reviewData into the reviewsData array

            // Fetch the user data
            userPromises.push(
              getDocs(
                query(
                  collection(db, "users"),
                  where("uid", "==", reviewData.user_id)
                )
              )
                .then((userSnap) => {
                  if (!userSnap.empty) {
                    const userData = userSnap.docs[0].data(); // Assuming user_id is unique
                    reviewData.userName = userData.fullName || "Unknown User";
                  }
                })
                .catch((err) => console.error("Error fetching user:", err))
            );
          });

          // Wait for all user fetches to complete
          await Promise.all(userPromises);

          // At this point, reviewsData contains all reviews with userNames populated
          setFetchedReviews(reviewsData);
        } else {
          setShowMessage({
            type: "info",
            message: "No Such Tailor",
          });
          setPopUpMessageTrigger(true);
        }
      } catch (error) {
        console.error("Error fetching tailor data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTailorData();
  }, [id]);

  const handleReviewSubmit = async () => {
    if (!userLoggedIn) {
      setDialogBoxInfo({
        body: "You must be logged in to submit a review. Go to log in page now?",
        title: "Login Required!",
        type: "info",
        buttons: [
          {
            label: "Login Now",
            onClick: () =>
              router.push(`/login?redirect=/tailors/profile/${id}`),
            type: "primary",
          },
        ],
      });
      setShowDialog(true);
      return;
    }

    if (rating === 0) {
      setShowMessage({
        type: "info",
        message: "Please select a star rating",
      });
      setPopUpMessageTrigger(true);
      return;
    }

    if (userReview.split(" ").length < 5) {
      setShowMessage({
        type: "info",
        message: "Please write at least 5 words in the review",
      });
      setPopUpMessageTrigger(true);
      return;
    }

    const userId = userData.uid;

    try {
      setIsSubmitting(true);

      await UpdateTailorRating({
        message: userReview,
        stars: rating,
        userId,
        tailorId: id,
        setStatusMessage: (status) => {
          setStatusMessage(status); // Update local state
          setShowMessage(status); // Immediately show the status message
        },
      });
      setPopUpMessageTrigger(true);
      setRating(0);
      setUserReview("");
    } catch (error) {
      console.error("Error submitting review:", error);
      setShowMessage({
        type: "danger",
        message: "Failed to submit review. Please try again later.",
      });
      setPopUpMessageTrigger(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-700 backdrop-blur-md bg-opacity-30">
        <ClipLoader size={60} color="#ffffff" />
      </div>
    );
  }

  const ratingValue = tailorData?.rating || 0;
  const totalRating = tailorData?.total_rating || 0;
  const calculatedRating =
    totalRating > 0 ? (ratingValue / totalRating) * 5 : 0;

  const numberOfReviews = totalRating > 0 ? Math.floor(totalRating / 6) : 0;

  return tailorData ? (
    <div
      className={`max-w-[97%] mx-auto mt-6 my-2 rounded-xl overflow-hidden py-5 md:py-12 px-5 lg:px-10 ${theme.mainTheme} ${theme.colorText}`}
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
            <h1 className={`border-b-[1px] pb-1 w-full text-3xl font-bold `}>
              {tailorData.businessName}
            </h1>
          </div>
          <p className={`text-lg `}>
            Experience:
            {tailorData.experience ? (
              tailorData.experience + " years"
            ) : (
              <i className="text-sm">Not specified</i>
            )}
          </p>
          <p className={`text-lg `}>
            Working Hours: {tailorData.openTime} - {tailorData.closeTime}
          </p>
          <p className={`text-lg `}>
            Address: {tailorData.businessAddress || "Not provided"}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <p className={`text-xl mb-2 border-b-[1px] pb-1 font-semibold `}>
          Description
        </p>
        <p className={`text-lg `}>
          {tailorData.description || <sub>No description available</sub>}
        </p>
      </div>

      <div className="mb-6">
        <p className={`text-xl mb-2 pb-1 font-semibold `}>Specialties</p>
        <div className="flex flex-wrap gap-2">
          {tailorData.specialities?.length > 0 ? (
            tailorData.specialities.map((speciality, index) => (
              <span
                key={index}
                className={`px-4 py-2 rounded-lg text-sm  ${theme.mainTheme} ${theme.colorBorder}`}
              >
                {speciality}
              </span>
            ))
          ) : (
            <span className={`italic`}>No specialties listed</span>
          )}
        </div>
      </div>

      <div className="mb-6">
        <p className={`text-xl font-semibold `}>Rating</p>
        <div className="flex items-center space-x-2">
          <span className="text-yellow-500 font-bold text-xl">
            {"★".repeat(Math.floor(calculatedRating))}
            {"☆".repeat(5 - Math.floor(calculatedRating))}
          </span>
          <span className={`text-sm `}>({calculatedRating.toFixed(1)})</span>
        </div>
        <p className={`text-sm `}>Total Reviews: {numberOfReviews}</p>
      </div>
      <div className="mb-6 flex flex-col md:flex-row justify-between gap-6">
        {/* Left Section: Reviews */}
        <div className="w-full md:w-2/3 overflow-y-auto">
          <p className={`text-xl mb-2 border-b-[1px] pb-1 font-semibold`}>
            Reviews
          </p>
          {fetchedReviews.length > 0 ? (
            fetchedReviews.map((fetchedReview, index) => (
              <div key={index} className="mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-500 font-bold text-xl">
                    {"★".repeat(fetchedReview.stars)}
                    {"☆".repeat(5 - fetchedReview.stars)}
                  </span>
                  <span className="text-sm">{fetchedReview.userName}</span>
                </div>
                <p className="text-sm">{fetchedReview.message}</p>
              </div>
            ))
          ) : (
            <p className="text-sm italic">No reviews yet</p>
          )}
        </div>

        {/* Right Section: Leave a Review */}
        <div className="w-full md:w-1/3">
          <div className="mb-6">
            <p className={`text-xl font-semibold`}>Leave a Review</p>

            <div className="flex items-center space-x-2 my-2">
              {[...Array(5)].map((_, index) => (
                <span
                  key={index}
                  onClick={() => setRating(index + 1)}
                  className={`text-2xl cursor-pointer ${
                    index < rating ? "text-yellow-500" : "text-gray-300"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>

            <div className="relative my-4 w-full">
              <textarea
                value={userReview}
                maxLength={250}
                id="userReview"
                name="userReview"
                onChange={(e) => setUserReview(e.target.value)}
                className={`${inputStyles}  rounded-sm min-h-[100px] max-h-[150px]`}
                rows={4}
                placeholder=""
              />
              <label className={`${placeHolderStyles}`} htmlFor="userReview">
                Write your review here
              </label>
            </div>

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
      </div>

      {showDialog && (
        <DialogBox
          body={dialogBoxInfo.body}
          title={dialogBoxInfo.title}
          type={dialogBoxInfo.type}
          buttons={dialogBoxInfo.buttons}
          showDialog={showDialog}
          setShowDialog={setShowDialog}
        />
      )}
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
