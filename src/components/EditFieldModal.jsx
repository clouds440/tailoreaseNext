import React, { useState, useEffect, useContext } from "react";
import SimpleButton from "./SimpleButton";
import { EditIcon } from "../../public/icons/svgIcons";
import LoadingSpinner from "./LoadingSpinner";
import UserContext from "@/utils/UserContext";

function EditFieldModal({ field, value, onClose, onSave, isLoading }) {
  const [inputValue, setInputValue] = useState(value);
  const { theme, setShowMessage, setPopUpMessageTrigger } =
    useContext(UserContext);

  const fieldLabels = {
    fullName: "Full Name",
    phone: "Phone Number",
  };

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (field === "fullName") {
      if (!inputValue.trim()) {
        setShowMessage({
          type: "info",
          message: "Enter your full Name",
        });
        setPopUpMessageTrigger("true");
        return;
      } else if (inputValue.length < 3) {
        setShowMessage({
          type: "info",
          message: "Name must be at least 3 characters",
        });
        setPopUpMessageTrigger("true");
        return;
      }
    }
    if (field === "phone") {
      if (!/^\d*$/.test(inputValue)) {
        setShowMessage({
          type: "warning",
          message: "Phone number can only contain digits",
        });
        setPopUpMessageTrigger("true");
        return;
      }
    }

    // Call the onSave function if validation passes
    onSave(field, inputValue);
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
        className={`${theme.mainTheme} rounded-lg p-6 w-full max-w-md relative`}
      >
        <h2 className={`flex text-xl text-${theme.themeColor} font-bold mb-4`}>
          Change ${field}
          <EditIcon
            size={"6"}
            color={`${theme.iconColor}`}
            extraClasses={"ml-3 rtl:mr-3"}
          />
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="relative mb-4">
            <input
              type="text"
              name={field}
              value={inputValue}
              onChange={handleChange}
              className={`${inputStyles}`}
              placeholder=" "
            />
            <label className={`${placeHolderStyles}`}>
              {fieldLabels[field]}
            </label>
          </div>
          <div className="flex justify-center space-x-2 rtl:space-x-reverse">
            <SimpleButton
              btnText={"Cancel"}
              type={"cancel"}
              onClick={onClose}
            />
            <SimpleButton
              btnText={
                isLoading ? <LoadingSpinner size={24} /> : "Save Changes"
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

export default EditFieldModal;
