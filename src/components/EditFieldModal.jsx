import React, { useState, useEffect, useContext } from "react";
import SimpleButton from "./SimpleButton";
import { EditIcon } from "../../public/icons/svgIcons";
import { LoadingSpinner } from "./LoadingSpinner";
import UserContext from "@/utils/UserContext";
import { motion, AnimatePresence } from "framer-motion";

function EditFieldModal({
  field,
  value,
  onSave,
  isLoading,
  setModalInfo,
  modalInfo,
}) {
  const [inputValue, setInputValue] = useState(value);
  const { theme, setShowMessage, setPopUpMessageTrigger } =
    useContext(UserContext);
  const [isVisible, setIsVisible] = useState(modalInfo.isOpen);
  useEffect(() => {
    setIsVisible(modalInfo.isOpen);
  }, [modalInfo.isOpen]);

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

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setModalInfo({ isOpen: false, field: "", value: "" });
    }, 300);
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

  const { inputStyles, placeHolderStyles } = useContext(UserContext);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed inset-0 flex items-center justify-center`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className={`bg-black bg-opacity-70 fixed inset-0 rounded-3xl`}
          ></div>
          <motion.div
            className={`bg-white rounded-xl shadow-lg w-11/12 max-w-md z-50 ${theme.mainTheme}`}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className={`${theme.mainTheme} rounded-lg p-6 w-full max-w-md relative`}
            >
              <h2
                className={`flex text-xl text-${theme.themeColor} font-bold mb-4`}
              >
                Change {fieldLabels[field]}
                <EditIcon
                  size={"6"}
                  color={`${theme.iconColor}`}
                  extraClasses={"ml-3"}
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
                    onClick={handleClose}
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default EditFieldModal;
