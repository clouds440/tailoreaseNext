import { useEffect } from "react";

const useOutsideClick = (ref, callback, active = true) => {
  useEffect(() => {
    if (!active) return;
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [ref, callback, active]);
};

export default useOutsideClick;
