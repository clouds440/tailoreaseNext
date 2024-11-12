import { useState, useContext } from "react";
import UserContext from "@/utils/UserContext";
import { t } from "i18next";
import SimpleButton from "./SimpleButton";
import { LinkIcon } from "../../public/icons/svgIcons";

const TailorApplicationForm = ({ onNext }) => {
  const [formData, setFormData] = useState({
    businessName: "",
    businessPhone: "",
    businessAddress: "",
    description: "",
  });

  const { theme, setShowMessage, setPopUpMessageTrigger } =
    useContext(UserContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNext = (e) => {
    e.preventDefault();

    if (!formData.businessName.trim()) {
      setShowMessage({
        type: "info",
        message: "Enter your business name",
      });
      setPopUpMessageTrigger("true");
      return;
    } else if (formData.businessName.length < 3) {
      setShowMessage({
        type: "info",
        message: "Business Name too short",
      });
      setPopUpMessageTrigger("true");
      return;
    }

    if (!formData.businessPhone.trim()) {
      setShowMessage({
        type: "warning",
        message: "Business phone number is required",
      });
      setPopUpMessageTrigger(true);
      return;
    }

    if (!/^\d*$/.test(formData.businessPhone)) {
      setShowMessage({
        type: "warning",
        message: "Phone number can only contain digits",
      });
      setPopUpMessageTrigger("true");
      return;
    }
    if (!formData.businessAddress.trim()) {
      setShowMessage({
        type: "warning",
        message: "Business address is required",
      });
      setPopUpMessageTrigger(true);
      return;
    }
    onNext(formData); // Pass form data to the next component
  };

  const inputStyles = `w-full p-1 mt-4 peer ${theme.colorText} border-b-2 z-10 ${theme.colorBorder} outline-none focus:border-blue-500 transition-all duration-300 bg-transparent`;
  const placeHolderStyles = `absolute top-5 pointer-events-none left-1 ${theme.colorText} duration-300 transform -translate-y-7 scale-75 origin-left peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:${theme.colorText} peer-focus:-translate-y-7 peer-focus:scale-75 peer-focus:text-blue-500`;

  return (
    <div className="flex items-center justify-center mt-4 max-w-2xl w-auto mx-auto p-6 rounded-md select-none">
      <div
        className={`p-6 rounded-lg ${theme.mainTheme} w-full max-w-md relative`}
      >
        <h2 className={`flex text-xl text-${theme.themeColor} font-bold mb-4`}>
          Become A Tailor
        </h2>
        <form onSubmit={handleNext} noValidate>
          <div className="relative mb-4">
            <input
              type="text"
              id="businessName"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              className={`${inputStyles}`}
              placeholder=" "
            />
            <label className={`${placeHolderStyles}`} htmlFor="businessName">
              Business Name
            </label>
          </div>
          <div className="relative mb-4">
            <input
              type="tel"
              id="businessPhone"
              name="businessPhone"
              value={formData.businessPhone}
              onChange={handleChange}
              className={`${inputStyles}`}
              placeholder=" "
            />
            <label className={`${placeHolderStyles}`} htmlFor="businessPhone">
              Business Phone
            </label>
          </div>
          <div className="relative mb-4">
            <input
              type="text"
              id="businessAddress"
              name="businessAddress"
              value={formData.businessAddress}
              onChange={handleChange}
              className={`${inputStyles}`}
              placeholder=" "
            />
            <label className={`${placeHolderStyles}`} htmlFor="businessAddress">
              Business Address
            </label>
          </div>
          <div className="relative mb-4">
            <textarea
              maxLength={250}
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`${inputStyles} min-h-9 max-h-[130px]`}
              placeholder=" "
            />
            <label className={`${placeHolderStyles}`} htmlFor="description">
              Decription
              <span className="text-xs">(Optional)</span>
            </label>
          </div>
          <SimpleButton
            btnText={"Next"}
            type={"primary-submit"}
            extraclasses={"w-full"}
          />
          <div className="items-center justify-center flex flex-row mt-4">
            <span
              className={`${theme.iconColor} ${theme.hoverText} flex cursor-pointer`}
              onClick={() => window.open("/terms/tailors", "_blank")}
            >
              Read terms for tailors &nbsp;
              <LinkIcon color={theme.iconColor} size={"5"} />
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TailorApplicationForm;
