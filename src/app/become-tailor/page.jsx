"use client";
import { useContext, useState, useEffect } from "react";
import TailorApplicationForm from "@/components/TailorApplicationForm";
import TailorSpecialitiesForm from "@/components/TailorSpecialitiesForm";
import ProgressBar from "@/components/ProgressBar";
import UserContext from "@/utils/UserContext";
import { MoonLoader } from "react-spinners";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  db,
  auth,
  collection,
  query,
  getDoc,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  sendEmailVerification,
} from "@/utils/firebaseConfig";
import SimpleButton from "@/components/SimpleButton";

const BecomeTailor = () => {
  const [step, setStep] = useState(1);
  const { userData, userLoggedIn, setPopUpMessageTrigger, setShowMessage } =
    useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const router = useRouter();

  const [hasBusinessAccount, setHasBusinessAccount] = useState(null);

  useEffect(() => {
    const checkBusinessAccount = async () => {
      if (!userLoggedIn) {
        router.push("/signup");
        return;
      } // Exit if userData or uid is not available

      try {
        const userQuery = query(
          collection(db, "users"),
          where("uid", "==", userData.uid)
        );
        const querySnapshot = await getDocs(userQuery);

        const docId = querySnapshot.docs[0].id;
        const userDocRef = doc(db, "users", docId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists() && userDocSnap.data().bId) {
          setHasBusinessAccount(true); // User has a business account
        } else {
          setHasBusinessAccount(false); // No business account found
        }
      } catch (error) {
        console.error("Error checking business account:", error);
      }
    };

    checkBusinessAccount();
  }, [userData, userLoggedIn, router]);

  const stepNames = ["Business Info", "Additional Info", "Submitting"];

  // Handle next step: collect form data and move to step 2
  const handleNext = (data) => {
    setFormData({ ...formData, ...data }); // Combine form data
    setTimeout(() => {
      setStep(step + 1); // Move to the next step
    }, 300); // Delay to allow animation time
  };

  // Handle back to step 1
  const handleBack = () => {
    setStep(1); // Go back to step 1
  };

  // Final submit: combine data and handle form submission
  const handleSubmit = async (finalData) => {
    const combinedData = { ...formData, ...finalData };
    console.log("Combined form data (before removing picture):", combinedData);

    // Extract `businessPicture` from `combinedData` to avoid storing it directly in Firestore
    const { businessPicture, ...dataWithoutPicture } = combinedData;

    setIsLoading(true);
    try {
      // 1. Upload the image to a local directory in the project at "./images/profile"

      // 2. Add business details to the "tailors" collection in Firestore
      const tailorsRef = collection(db, "tailors");
      const tailorDocRef = await addDoc(tailorsRef, {
        ...dataWithoutPicture,
        businessPictureUrl: "imageUrl", // change this to the local image url and unique name
        approved: false,
        ownerId: userData.uid,
      });

      // Get the newly created document ID
      const bId = tailorDocRef.id;

      // 3. Update the user document with the new business ID (bId)
      const userQuery = query(
        collection(db, "users"),
        where("uid", "==", userData.uid)
      );
      const querySnapshot = await getDocs(userQuery);

      const docId = querySnapshot.docs[0].id;
      const userDocRef = doc(db, "users", docId);
      await updateDoc(userDocRef, {
        bId: bId,
      });

      // 4. Send a verification email to the user
      await sendEmailVerification(auth.currentUser);

      setShowMessage({
        type: "success",
        message:
          "A verification email has been sent. Please verify to activate your business account.",
      });
      setPopUpMessageTrigger(true);
      router.push("/");
    } catch (error) {
      console.error("Error submitting business application:", error);
      setShowMessage({
        type: "error",
        message:
          "There was an error submitting your application. Please try again.",
      });
      setPopUpMessageTrigger(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (hasBusinessAccount === null) {
    return (
      <div className="flex justify-center items-center h-full bg-gray-700 backdrop-blur-md bg-opacity-30">
        <MoonLoader size={60} color="#ffffff" />
      </div>
    ); // Loading indicator while checking
  }

  return hasBusinessAccount ? (
    <div className="flex flex-col justify-center items-center h-full bg-gray-700 backdrop-blur-md bg-opacity-30">
      <div className="text-white max-w-xl mb-4 flex flex-col items-center text-center">
        <span className="text-2xl">You already have a business account!</span>
        <span>
          If you don't see your business dashboard, please check your email for
          a confirmation email from TailorEase.
        </span>
      </div>
      <Link href={"/"}>
        <SimpleButton
          btnText={"Go home"}
          type={"primary"}
          extraclasses={"py-3 px-8 text-xl"}
        />
      </Link>
    </div>
  ) : (
    <div className="h-full relative overflow-y-auto overflow-x-hidden">
      <ProgressBar steps={3} currentStep={step} stepNames={stepNames} />
      {/* Step Forms */}
      <div
        className={`w-full h-full absolute transition-transform duration-500 ease-in-out ${
          step === 1 ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <TailorApplicationForm onNext={handleNext} />
      </div>
      <div
        className={`w-full h-full absolute transition-transform duration-500 ease-in-out ${
          step >= 2 ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <TailorSpecialitiesForm
          formData={formData}
          onBack={handleBack}
          onNext={handleNext}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default BecomeTailor;
