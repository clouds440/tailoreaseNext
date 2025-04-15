"use client";
import React, { useContext, useState } from "react";
import SimpleButton from "./SimpleButton";
import sendNotification from "@/utils/sendNotification";
import DialogBox from "./DialogBox";
import { AnimatePresence } from "framer-motion";
import UserContext from "@/utils/UserContext";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import { db } from "@/utils/firebaseConfig";
import { LoadingSpinner } from "./LoadingSpinner";

const UserProfile = ({ userData }) => {
  const { inputStyles, setShowMessage, setPopUpMessageTrigger } =
    useContext(UserContext);
  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accountNumber, setAccountNumber] = useState("");
  const [allowEdit, setAllowEdit] = useState(false);
  const shareLink = "http://localhost:3000/user?share=" + userData.uid;

  const handleShareProfile = async (phoneNumber) => {
    try {
      setIsLoading(true);
      const tailorCollectionRef = collection(db, "tailors");
      const querySnapshot = await getDocs(tailorCollectionRef);

      const tailors = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((tailor) => tailor.businessPhone === phoneNumber);

      if (tailors.length === 0) {
        setShowMessage({
          message: "No tailor found with this phone number.",
          type: "warning",
        });
        setPopUpMessageTrigger(true);
        return;
      }

      const tailor = tailors[0];

      sendNotification(
        tailor.ownerId,
        "business",
        `${userData.fullName} shared their account with you!`,
        shareLink
      );

      if (allowEdit) {
        const relationshipId = `${tailor.id}_${userData.uid}`;
        const relationshipRef = doc(
          db,
          "userTailorConnections",
          relationshipId
        );

        await setDoc(relationshipRef, {
          tailorId: tailor.id,
          userId: userData.uid,
          timestamp: new Date(),
        });
      }

      setShowMessage({
        message: "Profile shared successfully!",
        type: "success",
      });
      setPopUpMessageTrigger(true);
      setShowDialog(false);
    } catch (err) {
      console.error(err);
      setShowMessage({
        message: "Something went wrong. Please try again.",
        type: "error",
      });
      setPopUpMessageTrigger(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 text-center">
      <h3 className="text-2xl font-bold">User Profile</h3>

      <SimpleButton
        btnText={"Share Profile"}
        icon={<i className="fas fa-share"></i>}
        onClick={() => setShowDialog(true)}
      />

      <AnimatePresence>
        {showDialog && (
          <DialogBox
            title={"Share Profile"}
            type="info"
            showDialog={showDialog}
            setShowDialog={setShowDialog}
            body={() => (
              <div className="select-none">
                <h2 className="mb-2">
                  Please enter the account number (phone) of the business
                  account:
                </h2>
                <input
                  type="text"
                  className={inputStyles}
                  placeholder="Account Number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
                <label className="inline-flex items-center mt-4 space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    value="allowEdit"
                    checked={allowEdit}
                    onChange={(e) => setAllowEdit(e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">
                    Allow Measurements Editing
                  </span>
                </label>
                <span className="flex text-xs">
                  This will also add the tailor to My Tailors
                </span>
              </div>
            )}
            buttons={[
              {
                label: (
                  <>
                    {isLoading ? (
                      <LoadingSpinner size={24} extraClasses={"mr-2"} />
                    ) : (
                      <i className="fas fa-share mr-2"></i>
                    )}
                    Share Now
                  </>
                ),
                type: "primary",
                onClick: () => {
                  if (!accountNumber.trim()) {
                    setShowMessage({
                      message: "Please enter a valid phone number",
                      type: "warning",
                    });
                    setPopUpMessageTrigger(true);
                    return;
                  }
                  handleShareProfile(accountNumber);
                },
              },
              {
                label: (
                  <>
                    <i className="fas fa-link mr-2"></i>
                    Copy Link
                  </>
                ),
                type: "secondary",
                onClick: () => {
                  navigator.clipboard.writeText(shareLink).then(() => {
                    setShowMessage({
                      message: "Link copied to clipboard!",
                      type: "success",
                    });
                    setPopUpMessageTrigger(true);
                    setShowDialog(false);
                  });
                },
              },
            ]}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfile;
