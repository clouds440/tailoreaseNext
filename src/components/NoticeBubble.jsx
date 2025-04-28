import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function NoticeBubble({
  text,
  type = "info",
  extraClasses = "",
}) {
  const [isOpen, setIsOpen] = useState(false);

  const typeConfig = {
    info: {
      icon: "ℹ️",
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    warning: {
      icon: "⚠️",
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
    error: {
      icon: "❗",
      color: "text-red-600",
      bg: "bg-red-100",
    },
    success: {
      icon: "✅",
      color: "text-green-600",
      bg: "bg-green-100",
    },
  };

  const { icon, color, bg } = typeConfig[type] || typeConfig.info;

  return (
    <div className={`relative flex items-center space-x-2 ${extraClasses}`}>
      <div
        className={`${color} text-xl cursor-pointer ${
          isOpen ? "opacity-100" : "opacity-40"
        }`}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {icon}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "", stiffness: 300, damping: 10 }}
            className={`overflow-hidden whitespace-nowrap px-2 py-1 rounded shadow-md text-sm ${color} ${bg}`}
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
