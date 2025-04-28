"use client";
import { useState, useEffect, useContext } from "react";
import Image from "next/image";
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
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
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
        const tailorDocRef = doc(db, "tailors", id);
        const docSnap = await getDoc(tailorDocRef);

        if (docSnap.exists()) {
          setTailorData(docSnap.data());

          // Fetch reviews related to this tailor
          const reviewsRef = collection(db, "tailor_reviews");
          const reviewsQuery = query(reviewsRef, where("tailor_id", "==", id));
          const reviewsSnap = await getDocs(reviewsQuery);

          const reviewsData = [];
          const userPromises = [];

          reviewsSnap.forEach((reviewDoc) => {
            const reviewData = { ...reviewDoc.data(), userName: null };
            reviewsData.push(reviewData);

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
                    const userData = userSnap.docs[0].data();
                    reviewData.userName = userData.fullName || "Unknown User";
                  }
                })
                .catch((err) => console.error("Error fetching user:", err))
            );
          });

          await Promise.all(userPromises);

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
  }, [id, setPopUpMessageTrigger, setShowMessage]);

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

    if (userData.uid === tailorData.ownerId) {
      setShowMessage({
        type: "warning",
        message: "You cannot review your own business account",
      });
      setPopUpMessageTrigger(true);
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
          setStatusMessage(status);
          setShowMessage(status);
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

  const handleClickContact = () => {
    const message =
      `Hi, I'm interested in your services from TailorEase.` +
      (userData?.uid
        ? ` Here is my profile link on the TailorEase Platform: https://tailorease.vercel.app/user?share=${userData.uid}`
        : "");

    const url = `https://wa.me/${
      tailorData.countryCode + tailorData.businessPhone
    }?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  if (isLoading) {
    return (
      <div
        className={`max-w-[99.5%] mx-auto my-4 md:my-1 flex justify-center items-center h-screen ${theme.mainTheme}`}
      >
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
    <div className="h-full overflow-y-auto">
      <div
        className={`max-w-[99.5%] mx-auto my-4 md:my-1 rounded-lg h-fit py-5 md:py-12 px-5 lg:px-10 ${theme.mainTheme} ${theme.colorText}`}
      >
        <div className="flex flex-col sm:flex-row items-center space-x-6 mb-6">
          <Image
            src={
              tailorData.businessPictureUrl ||
              "/images/profile/business/default.png"
            }
            alt={tailorData.businessName || "Business Name"}
            width={256} // 16rem = 256px
            height={256}
            className={`object-cover rounded-lg lg:rounded-xl shadow-md max-h-40 border ${theme.colorBorder}`}
            placeholder="blur"
            blurDataURL="/images/profile/business/default.png" // For fallback blur effect
          />
          <div className="flex w-full flex-col mt-4 sm:mt-0">
            <div className="flex w-full justify-between items-center mb-6">
              <h1 className={`border-b-[1px] pb-1 w-full text-3xl font-bold `}>
                {tailorData.businessName}
              </h1>
            </div>
            <p className={`text-lg `}>
              Experience:{" "}
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
            <div>
              <p>
                Contact:{" "}
                <span
                  onClick={handleClickContact}
                  className={`cursor-pointer ${theme.hoverText}`}
                >
                  {" "}
                  <i className="fab fa-whatsapp text-green-700"></i>{" "}
                  {tailorData.countryCode}-{tailorData.businessPhone}
                </span>
              </p>
            </div>
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

        <div className="mb-6 select-none">
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

        <div className="mb-6">
          {/* Common Heading */}
          <div className=" w-full text-center md:text-left md:w-auto md:mb-0">
            <p className="mb-6 text-2xl font-bold border-b-2 border-gray-300 pb-1">
              Reviews & Feedback
            </p>
          </div>

          <div className="w-full flex flex-col md:flex-row justify-between gap-6">
            {/* Reviews Section */}
            <div className="w-full md:w-[65%] lg:w-[70%]">
              {fetchedReviews.length > 0 ? (
                <>
                  <div
                    key={fetchedReviews[currentReviewIndex].userName}
                    className={`relative w-full mt-8 border p-6 rounded-lg shadow-md ${theme.mainTheme}`}
                  >
                    <div
                      className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex justify-center items-center w-16 h-16 rounded-full overflow-hidden bg-opacity-100 ${theme.colorBg}`}
                    >
                      <i
                        className={`fas fa-user ${theme.colorText} text-3xl`}
                      ></i>
                    </div>
                    <div className="mt-8 flex flex-col items-center">
                      <p className="font-bold text-lg text-center">
                        {fetchedReviews[currentReviewIndex].userName}
                      </p>
                      <span className="text-yellow-500 text-base">
                        {"★".repeat(fetchedReviews[currentReviewIndex].stars)}
                        {"☆".repeat(
                          5 - fetchedReviews[currentReviewIndex].stars
                        )}
                      </span>
                    </div>
                    <p className={`text-center ${theme.colorText} mt-4`}>
                      {fetchedReviews[currentReviewIndex].message}
                    </p>
                  </div>

                  {/* Navigation buttons */}
                  <div className="flex justify-center mt-6 space-x-4">
                    <button
                      onClick={() => {
                        setCurrentReviewIndex((prevIndex) =>
                          prevIndex === 0
                            ? fetchedReviews.length - 1
                            : prevIndex - 1
                        );
                      }}
                      className={`p-3 w-12 h-12 ${theme.mainTheme} ${theme.colorText} ${theme.hoverShadow} rounded-full flex justify-center items-center`}
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    <button
                      onClick={() => {
                        setCurrentReviewIndex((prevIndex) =>
                          prevIndex === fetchedReviews.length - 1
                            ? 0
                            : prevIndex + 1
                        );
                      }}
                      className={`p-3 w-12 h-12 ${theme.mainTheme} ${theme.colorText} ${theme.hoverShadow} rounded-full flex justify-center items-center`}
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-sm italic text-gray-500">No reviews yet</p>
              )}
            </div>

            {/* Right Section: Leave a Review */}
            <div className="w-full md:w-[35%] lg:w-[30%]">
              <div className={`${theme.mainTheme} p-6 rounded-lg shadow-md`}>
                <p className="text-xl font-semibold mb-4">Leave a Review</p>
                <div className="flex items-center space-x-2 mb-4">
                  {[...Array(5)].map((_, index) => (
                    <span
                      key={index}
                      onClick={() => setRating(index + 1)}
                      className={`text-2xl cursor-pointer transition-colors duration-200 ${
                        index < rating ? "text-yellow-500" : "text-gray-300"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <div className="relative mb-4">
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
                  <label
                    className={`${placeHolderStyles}`}
                    htmlFor="userReview"
                  >
                    Write your review here
                  </label>
                </div>
                <SimpleButton
                  btnText={
                    isSubmitting ? (
                      <LoadingSpinner size={24} />
                    ) : (
                      "Submit Review"
                    )
                  }
                  type="primary-submit"
                  extraclasses="w-full"
                  disabled={isSubmitting}
                  onClick={handleReviewSubmit}
                />
              </div>
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
    </div>
  ) : (
    <div
      className={`max-w-[99.5%] mx-auto my-4 md:my-1 rounded-lg p-10 h-screen ${theme.mainTheme}`}
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
