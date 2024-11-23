"use client";

import { useState, useEffect, useRef, useContext } from "react";
import { db } from "@/utils/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import { PropagateLoader } from "react-spinners";
import UserContext from "@/utils/UserContext";
import SimpleButton from "@/components/SimpleButton";
import { AnimatePresence, motion } from "framer-motion";

const TailorListPage = () => {
  const { theme } = useContext(UserContext);

  // Specialities filter options
  const specialities = [
    "Men Specialist",
    "Women Specialist",
    "Kids Specialist",
    "Alterations",
    "Custom Tailoring",
    "Other",
  ];

  // State for filters and dropdowns
  const [filters, setFilters] = useState({
    sortBy: "Top Rated",
    showCount: 60,
    page: 1,
  });
  const [specialityFilter, setSpecialityFilter] = useState([]);
  const [appliedFilters, setAppliedFilters] = useState([]);
  const [tailorList, setTailorList] = useState([]);
  const [loading, setLoading] = useState(true);

  const dropdownRef = useRef(null);
  const dropdownButtonRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  const fetchTailors = async () => {
    setLoading(true);
    try {
      const tailorCollectionRef = collection(db, "tailors");
      let q = query(tailorCollectionRef);

      // Match all selected specialities
      if (appliedFilters.length > 0) {
        q = query(
          tailorCollectionRef,
          where("specialities", "array-contains-any", appliedFilters)
        );

        const querySnapshot = await getDocs(q);
        const filteredTailors = querySnapshot.docs
          .map((doc) => doc.data())
          .filter((tailor) =>
            appliedFilters.every((filter) =>
              tailor.specialities.includes(filter)
            )
          );

        setTailorList(filteredTailors);
      } else {
        const querySnapshot = await getDocs(q);
        const tailors = querySnapshot.docs.map((doc) => doc.data());
        setTailorList(tailors);
      }
    } catch (error) {
      console.error("Error fetching tailors:", error);
    }
    setLoading(false);
  };

  // Initial fetch and when filters change
  useEffect(() => {
    fetchTailors();
  }, [appliedFilters]);

  // Dropdown outside click
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !dropdownButtonRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  const dropdownVariants = {
    hidden: { scaleY: 0, transformOrigin: "top" },
    visible: { scaleY: 1, transformOrigin: "top" },
    exit: { scaleY: 0, transformOrigin: "top" },
  };

  const toggleDropdown = () => {
    if (!dropdownOpen && dropdownButtonRef.current) {
      const rect = dropdownButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
    setDropdownOpen(!dropdownOpen);
  };

  const handleChange = (value) => {
    setSpecialityFilter((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const applyFilters = () => {
    setAppliedFilters([...specialityFilter]);
    setDropdownOpen(false);
  };

  return (
    <div className={`w-full overflow-hidden mx-auto p-6 select-none`}>
      <div className={`mb-4 p-4 ${theme.mainTheme} rounded-lg`}>
        <h2 className={`text-2xl font-bold mb-6 ${theme.colorText}`}>
          All Registered Tailors
        </h2>
        <div className={`w-full flex justify-between items-center relative`}>
          <div className="relative" ref={dropdownButtonRef}>
            <SimpleButton
              type={"simple"}
              btnText={`Sort by: ${filters.sortBy}`}
              extraclasses={`px-4 py-2 border font-semibold ${theme.colorBorder}`}
              onClick={toggleDropdown}
            />
          </div>
        </div>
      </div>
      <div
        className={`mt-4 rounded-lg z-0 overflow-hidden p-6 ${theme.mainTheme}`}
      >
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <PropagateLoader color="#1976d2" />
          </div>
        ) : (
          tailorList.map((tailor, index) => (
            <div
              key={index}
              className={`cursor-pointer relative flex items-center justify-between p-4 mb-4 rounded-lg border transition-all duration-300 transform hover:scale-[1.01] ${theme.hoverShadow} ${theme.colorBorder}`}
            >
              <div className="flex items-center space-x-4">
                <img
                  src={tailor.businessPictureUrl}
                  className="w-32 h-24 object-cover rounded-lg"
                  alt={tailor.businessName}
                  onError={(e) => {
                    if (!e.target.dataset.fallback) {
                      e.target.dataset.fallback = true; // Mark that fallback is being used
                      e.target.src = "/images/profile/business/default.png";
                    } else {
                      console.error(
                        "Both original and default business images failed to load."
                      );
                    }
                  }}
                />

                <div className="flex flex-col">
                  <h3 className={`text-lg font-bold ${theme.colorText}`}>
                    {tailor.businessName}
                    <span className="text-sm ml-2 text-gray-500">
                      ({tailor.openTime} - {tailor.closeTime})
                    </span>
                  </h3>
                  <span className="text-yellow-600 text-lg">
                    {"★".repeat(Math.floor(tailor.rating))}
                    {"☆".repeat(5 - Math.floor(tailor.rating))}
                  </span>
                </div>
              </div>
              <div className="flex justify-center items-center">
                <span
                  className="text-yellow-600 font-bold text-sm px-2 py-3 bg-gray-200 rounded-full shadow-md"
                  style={{
                    minWidth: "40px",
                    textAlign: "center",
                  }}
                >
                  {index + 1}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            ref={dropdownRef}
            className={`absolute mt-1 p-4 w-auto ${theme.mainTheme} text-${theme.colorText} rounded-md shadow-lg border ${theme.colorBorder}`}
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              zIndex: 1000,
              width: "fit-content",
            }}
            initial="hidden"
            animate={dropdownOpen ? "visible" : "hidden"}
            exit="exit"
            variants={dropdownVariants}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <div className="relative min-w-[18rem] mb-4">
              <h3 className="font-bold text-lg mb-2">Select Filters</h3>
              <div className="grid grid-cols-2 gap-2">
                {specialities.map((speciality) => (
                  <div
                    key={speciality}
                    onClick={() => handleChange(speciality)}
                    className={`p-2 border rounded-lg cursor-pointer ${
                      specialityFilter.includes(speciality)
                        ? "bg-blue-500"
                        : `bg-gray-600 ${theme.hoverBg}`
                    }`}
                  >
                    {specialityFilter.includes(speciality) && (
                      <span className="text-green-500 absolute -translate-y-4 -translate-x-3">
                        ✔
                      </span>
                    )}
                    {speciality}
                  </div>
                ))}
              </div>
            </div>
            <SimpleButton
              type={"simple"}
              btnText={"Apply Filters"}
              extraclasses={`px-4 py-2 rounded-lg`}
              onClick={applyFilters}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TailorListPage;
