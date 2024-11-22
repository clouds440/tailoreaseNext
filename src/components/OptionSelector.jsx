import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const OptionSelector = ({ options, value, onChange, theme, classes }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const dropdownVariants = {
    hidden: { scaleY: 0, transformOrigin: "top" },
    visible: { scaleY: 1, transformOrigin: "top" },
    exit: { scaleY: 0, transformOrigin: "top" },
  };

  const handleSelect = (optionValue) => {
    onChange({ target: { value: optionValue } });
    setIsOpen(false);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className={`relative inline-block text-left ${classes}`}
      ref={dropdownRef}
    >
      <div
        className={`p-2 flex items-center justify-between outline-none rounded-md cursor-pointer ${theme.mainTheme} ${theme.hoverBg}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>
          {options.find((option) => option.value === value)?.label || "Select"}
        </span>
        {options.find((option) => option.value === value)?.img && (
          <img
            src={options.find((option) => option.value === value).img}
            alt={`${
              options.find((option) => option.value === value).label
            } flag`}
            className="w-6 h-6 flex"
          />
        )}
        <span>{isOpen ? "▲" : "▼"}</span>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.ul
            className={`absolute mt-2 p-2 items-center justify-center rounded-md w-full ${theme.mainTheme} z-10`}
            initial="hidden"
            animate={isOpen ? "visible" : "hidden"}
            exit="exit"
            variants={dropdownVariants}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {options.map((option, index) => (
              <li
                key={index}
                className={`flex justify-between cursor-pointer p-2 rounded-md ${theme.hoverBg}`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
                {option.img && (
                  <img
                    src={option.img}
                    alt={`${option.label} flag`}
                    className="w-6 h-6 flex"
                  />
                )}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OptionSelector;
