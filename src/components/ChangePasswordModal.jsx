import React, { useState, useEffect, useContext } from "react";
import SimpleButton from "./SimpleButton";
import LoadingSpinner from "./LoadingSpinner";
import { EditIcon } from "../../public/icons/svgIcons";
import UserContext from "@/utils/UserContext";

function ChangePasswordModal({ onClose, onSave, isLoading }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { theme, setShowMessage, setPopUpMessageTrigger } =
    useContext(UserContext);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "newPassword") {
      setNewPassword(value);
    }
    if (name === "confirmPassword") {
      setConfirmPassword(value);
    }
    if (name === "currentPassword") {
      setCurrentPassword(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let errorMessage = "";

    if (newPassword !== confirmPassword) {
      errorMessage = "New passwords donot match";
    } else if (newPassword === currentPassword) {
      errorMessage = "New password cannot be the same as the old password";
    } else if (newPassword.length < 6) {
      errorMessage = "Password must be at least 6 characters";
    }

    if (errorMessage) {
      setShowMessage({
        type: "info",
        message: errorMessage,
      });
      setPopUpMessageTrigger("true");
      return;
    }
    onSave(formData);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose(); // Trigger the Cancel button on Esc key press
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const inputStyles = `w-full p-1 mt-4 peer ${theme.colorText} border-b-2 z-10 ${theme.colorBorder} outline-none focus:border-blue-500 transition-all duration-300 bg-transparent`;

  const placeHolderStyles = `absolute top-5 pointer-events-none left-1 ${theme.colorText} duration-300 transform -translate-y-7 scale-75 origin-left peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:${theme.colorText} peer-focus:-translate-y-7 peer-focus:scale-75 peer-focus:text-blue-500`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center rounded-md z-40">
      <div
        className={`${theme.mainTheme} p-6 rounded-lg w-full max-w-md relative`}
      >
        <h2 className={`flex text-xl text-${theme.themeColor} font-bold mb-4`}>
          Change Password
          <EditIcon
            size={"6"}
            color={`${theme.iconColor}`}
            extraClasses={"ml-3"}
          />
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="relative mb-4">
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className={`${inputStyles}`}
              placeholder=" "
              required
            />
            <label className={`${placeHolderStyles}`}>Current Password</label>
          </div>
          <div className="relative mb-4">
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className={`${inputStyles}`}
              placeholder=" "
              required
            />
            <label className={`${placeHolderStyles}`}>New Password</label>
          </div>
          <div className="relative mb-4">
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`${inputStyles}`}
              placeholder=" "
              required
            />
            <label className={`${placeHolderStyles}`}>Confirm Password</label>
          </div>
          <div className="flex justify-end space-x-2 rtl:space-x-reverse">
            <SimpleButton
              btnText={"Cancel"}
              onClick={onClose}
              type={"cancel"}
            />
            <SimpleButton
              btnText={
                isLoading ? <LoadingSpinner size={24} /> : "Change Password"
              }
              type={"primary-submit"}
              extraclasses={"w-full"}
              disabled={isLoading}
            />
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordModal;
