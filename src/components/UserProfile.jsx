"use client";
import React, { useContext, useState } from "react";
import SimpleButton from "./SimpleButton";
import sendNotification from "@/utils/sendNotification";
import DialogBox from "./DialogBox";
import { AnimatePresence } from "framer-motion";
import UserContext from "@/utils/UserContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/utils/firebaseConfig";
import { LoadingSpinner } from "./LoadingSpinner";

const UserProfile = ({ userData }) => {
  const { inputStyles, setShowMessage, setPopUpMessageTrigger } =
    useContext(UserContext);
  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accountNumber, setAccountNumber] = useState("");

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
        `${userData.fullName} shared their account with you!`,
        `http://localhost:3000/user?share=${userData.uid}`
      );

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
              <div>
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
            ]}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfile;
