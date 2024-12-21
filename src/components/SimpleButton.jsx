import { useContext } from "react";
import UserContext from "@/utils/UserContext";

function SimpleButton({
  onClick,
  btnText,
  type,
  extraclasses = "",
  disabled,
  icon = null,
}) {
  const { theme } = useContext(UserContext);

  const baseStyles =
    "flex items-center justify-center px-4 py-2 rounded-md font-medium duration-300 select-none focus:outline-none transition-all";

  const themeStyles = {
    "midnight-whisper": {
      primary:
        "bg-gray-700 text-white hover:bg-gray-600 ring-gray-700 hover:ring-2",
      default:
        "bg-gray-400 text-black hover:bg-gray-300 ring-gray-500 hover:ring-2",
    },
    "lunar-glow": {
      primary:
        "bg-sky-800 text-white hover:bg-sky-500 ring-sky-700 hover:ring-2",
      default:
        "bg-white text-gray-900 hover:bg-gray-400 ring-white hover:ring-2",
    },
    "neon-punk": {
      primary:
        "bg-blue-900 text-pink-200 hover:bg-blue-800/75 ring-pink-500 hover:ring-2",
      default:
        "bg-pink-700 text-blue-200 hover:bg-pink-600 ring-blue-500 hover:ring-2",
    },
  };

  const dangerStyles =
    "bg-red-700 text-white hover:bg-red-500/75 ring-red-700 hover:ring-2";

  const disabledStyles = "opacity-50 cursor-not-allowed";

  const getButtonStyle = () => {
    const themeType = themeStyles[theme.mainTheme] || themeStyles["lunar-glow"];
    switch (type) {
      case "primary":
      case "primary-submit":
        return themeType.primary;
      case "danger":
        return dangerStyles;
      default:
        return themeType.default;
    }
  };

  return (
    <button
      type={type === "primary-submit" ? "submit" : "button"}
      className={`${baseStyles} ${getButtonStyle()} ${
        disabled ? disabledStyles : ""
      } ${extraclasses}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {btnText}
    </button>
  );
}

export default SimpleButton;
