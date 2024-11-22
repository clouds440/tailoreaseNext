"use client";
import {
  auth,
  db,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  doc,
} from "@/utils/firebaseConfig";

import React, { useContext, useState, useEffect } from "react";
import EditFieldModal from "@/components/EditFieldModal";
import ChangePasswordModal from "@/components/ChangePasswordModal";
import Optionselector from "@/components/OptionSelector";
import UserContext from "@/utils/UserContext";
import { useRouter } from "next/navigation";
import {
  AdjustmentsIcon,
  EditIcon,
  SettingsIcon,
  UserIcon,
} from "../../../public/icons/svgIcons";
import SimpleButton from "@/components/SimpleButton";
import DialogBox from "@/components/DialogBox";

function AccountSettings() {
  const {
    userData,
    theme,
    userLoggedIn,
    setUserData,
    setTheme,
    setShowMessage,
    setPopUpMessageTrigger,
  } = useContext(UserContext);

  const router = useRouter();
  const [modalInfo, setModalInfo] = useState({
    isOpen: false,
    field: "",
    value: "",
  });
  const [DialogBoxInfo, setDialogBoxInfo] = useState({
    title: "",
    message: "",
    type: "",
    buttons: [],
  });

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const fieldLabels = {
    fullName: "Full Name",
    phone: "Phone Number",
  };

  const handleFieldClick = (field) => {
    if (field === "password") {
      setIsPasswordModalOpen(true);
    } else {
      setModalInfo({
        isOpen: true,
        field: field,
        value: typeof userData[field] !== "object" ? userData[field] : "",
      });
    }
  };

  const handleFieldSave = async (field, newValue) => {
    try {
      setIsLoading(true);
      // Check if the new value is different
      if (
        (field === "fullName" && newValue === userData.fullName) ||
        (field === "phone" && newValue === userData.phone)
      ) {
        setModalInfo({ isOpen: false, field: "", value: "" });
        return;
      }
      if (field === "phone") {
        if (!/^\d*$/.test(newValue)) {
          setShowMessage({
            type: "warning",
            message: "Phone number can only contain digits",
          });
          setPopUpMessageTrigger("true");
          return;
        }
      }

      // Query Firestore to find the document with the matching UID
      const userQuery = query(
        collection(db, "users"),
        where("uid", "==", userData.uid)
      );
      const querySnapshot = await getDocs(userQuery);

      if (querySnapshot.empty) {
        throw new Error("No document found for the given UID.");
      }

      const docId = querySnapshot.docs[0].id;
      const userDocRef = doc(db, "users", docId);

      // Update the document
      await updateDoc(userDocRef, {
        [field]: newValue,
      });

      // Update only the changed field in userData
      setUserData((prevUserData) => ({
        ...prevUserData,
        [field]: newValue,
      }));

      userData[field] = newValue;

      // Save the updated userData back to sessionStorage
      sessionStorage.setItem("userData", JSON.stringify(userData));
      localStorage.setItem("userData", JSON.stringify(userData));

      setUserData({ ...userData, [field]: newValue });
      setModalInfo({ isOpen: false, field: "", value: "" });

      setShowMessage({
        type: "success",
        message: `${fieldLabels[field]} ` + "updated successfully!",
      });
      setPopUpMessageTrigger("true");
    } catch (error) {
      setShowMessage({
        type: "danger",
        message:
          "Failed to update " + ` ${fieldLabels[field]}. ${error.message}`,
      });
      setPopUpMessageTrigger("true");
    } finally {
      setIsLoading(false);
    }
  };

  const hadleChangePassword = async (data) => {
    try {
      setIsLoading(true);
      const user = auth.currentUser;

      // Re-authenticate the user with the current password
      const credential = EmailAuthProvider.credential(
        userData.email,
        data.currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Update the user's password
      await updatePassword(user, data.newPassword);
      setShowMessage({
        type: "success",
        message: "Password saved!",
      });
      setPopUpMessageTrigger("true");

      setIsPasswordModalOpen(false); // Close the modal
    } catch (error) {
      let errorMessage = "An error Occured: " + ` ${error.message}`;
      if (error.code === "auth/invalid-credential") {
        errorMessage = "Invalid current password";
      } else if (error.code === "auth/missing-password") {
        errorMessage = "Enter a password";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later!";
      }
      setShowMessage({ type: "danger", message: errorMessage });
      setPopUpMessageTrigger("true");
    } finally {
      setIsLoading(false);
    }
  };

  const themeOptions = [
    { value: "default", label: "Default" },
    { value: "light", label: "Light" },
    { value: "azure", label: "Azure" },
  ];

  const [selectedTheme, setSelectedTheme] = useState(theme.themeName);
  const savedLanguage = JSON.parse(localStorage.getItem("lang")) || "en";
  const [selectedLanguage, setSelectedLanguage] = useState(savedLanguage);

  const handleThemeChange = (e) => {
    const themeName = e.target.value;
    setSelectedTheme(themeName);

    if (themeName === "default") {
      setTheme({
        themeName: "default",
        mainTheme: "theme-default",
        colorText: "text-gray-100",
        colorBorder: "border-gray-100",
        iconColor: "text-blue-500",
        hoverText: "hover:text-blue-400",
        hoverBg: "hover:bg-indigo-400 hover:bg-opacity-30",
      });
    } else if (themeName === "light") {
      setTheme({
        themeName: "light",
        mainTheme: "theme-light",
        colorText: "text-black",
        colorBorder: "border-black",
        iconColor: "text-blue-600",
        hoverText: "hover:text-gray-600",
        hoverBg: "hover:bg-gray-300 hover:bg-opacity-70",
      });
    } else if (themeName === "azure") {
      setTheme({
        themeName: "azure",
        mainTheme: "theme-azure",
        colorText: "text-sky-200",
        colorBorder: "border-sky-200",
        iconColor: "text-amber-400",
        hoverText: "hover:text-amber-300",
        hoverBg: "hover:bg-amber-300 hover:bg-opacity-50",
      });
    }
  };

  const handleSavePreferences = () => {
    localStorage.setItem("theme", JSON.stringify(theme));
    localStorage.setItem("lang", JSON.stringify(selectedLanguage));
    setShowMessage({
      type: "success",
      message: "Changes saved!",
    });
    setPopUpMessageTrigger(true);
    // Code to save the changes to the account here
  };

  const handleDiscardChanges = () => {
    router.push("/");
  };
  const handleCancel = () => {
    setShowDialog(false);
  };

  useEffect(() => {
    if (!userLoggedIn) {
      router.push("/login");
    }
  }, [userLoggedIn, router]);

  return (
    <div
      className={`mt-8 max-w-[97%] w-auto mx-auto p-6 rounded-3xl select-none ${theme.mainTheme}`}
    >
      <h2
        className={`flex text-2xl font-bold mb-6 pt-6 border-b ${theme.colorBorder}`}
      >
        Account Settings
        <SettingsIcon
          color={`${theme.iconColor}`}
          extraClasses={"ml-3 rtl:mr-3 mt-1"}
        />
      </h2>
      <div className="md:flex md:space-x-5 lg:space-x-14">
        <div className="space-y-4 w-full md:w-1/2">
          <h2 className="flex text-xl font-semibold  mb-6">
            Personal Information
            <UserIcon color={`${theme.iconColor}`} extraClasses={"ml-3 mt-1"} />
          </h2>
          <div className="flex justify-between items-center">
            <span>Full Name</span>
            <span
              className={`flex  cursor-pointer ${theme.hoverText}`}
              onClick={() => handleFieldClick("fullName")}
            >
              {userData.fullName}
              <EditIcon
                color={`${theme.iconColor}`}
                extraClasses={"ml-3 mt-1"}
              />
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Email</span>
            <span
              className={`flex  cursor-pointer ${theme.hoverText}`}
              onClick={() => {
                setShowDialog(true);
                setDialogBoxInfo({
                  title: "Information!",
                  message: "Email address cannot be changed!",
                  type: "info",
                });
              }}
            >
              {userData.email}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Phone Number</span>
            <span
              className={`flex  cursor-pointer ${theme.hoverText}`}
              onClick={() => handleFieldClick("phone")}
            >
              {userData.phone !== "" ? (
                userData.phone
              ) : (
                <span
                  className={`italic ${theme.colorText} ${theme.hoverText}`}
                >
                  <sub>click to add phone number</sub>
                </span>
              )}
              <EditIcon
                color={`${theme.iconColor}`}
                extraClasses={"ml-3 mt-1"}
              />
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Password</span>
            <span
              className={`flex cursor-pointer ${theme.hoverText}`}
              onClick={() => handleFieldClick("password")}
            >
              ●●●●●●●●
              <EditIcon
                color={`${theme.iconColor}`}
                extraClasses={"ml-3 mt-1"}
              />
            </span>
          </div>
        </div>
        <div className={`w-0 border-r ${theme.colorBorder}`}></div>{" "}
        {/* divider line */}
        <div className="space-y-4 w-full md:w-1/2 mt-8 md:mt-0">
          <h2 className={`flex text-xl font-semibold  mb-6`}>
            Preferrences
            <AdjustmentsIcon
              color={`${theme.iconColor}`}
              extraClasses={"ml-3 mt-1"}
            />
          </h2>
          <div className="flex justify-between items-center">
            <label htmlFor="select-options">Theme</label>
            <Optionselector
              options={themeOptions}
              value={selectedTheme}
              onChange={handleThemeChange}
              theme={theme}
            />
          </div>
        </div>
      </div>
      <div className="flex mt-8">
        <div className="flex items-center mx-auto justify-center space-x-3">
          <SimpleButton
            onClick={() => {
              setShowDialog(true);
              setDialogBoxInfo({
                title: "Warning!",
                message: "Are you sure you want to discard all changes?",
                type: "warning",
                buttons: [
                  { label: "Yes, Discard", onClick: handleDiscardChanges },
                ],
              });
            }}
            btnText={"Discard Changes"}
            type={"simple"}
            extraclasses={"w-auto"}
          />
          <SimpleButton
            onClick={handleSavePreferences}
            btnText={"Save Changes"}
            type={"primary"}
            extraclasses={"w-auto px-6"}
          />
        </div>
      </div>

      {modalInfo.isOpen && (
        <EditFieldModal
          field={modalInfo.field}
          value={modalInfo.value}
          onClose={() => setModalInfo({ isOpen: false, field: "", value: "" })}
          onSave={handleFieldSave}
          isLoading={isLoading}
        />
      )}

      {isPasswordModalOpen && (
        <ChangePasswordModal
          onClose={() => setIsPasswordModalOpen(false)}
          onSave={hadleChangePassword}
          isLoading={isLoading}
        />
      )}
      {showDialog && (
        <DialogBox
          title={DialogBoxInfo.title}
          message={DialogBoxInfo.message}
          type={DialogBoxInfo.type}
          showDialog={showDialog}
          setShowDialog={setShowDialog}
          buttons={DialogBoxInfo.buttons}
        />
      )}
    </div>
  );
}

export default AccountSettings;
