"use client";

import { useState, useEffect, useRef, useContext } from "react";
import { createPortal } from "react-dom";
import { db } from "../../utils/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import { PropagateLoader } from "react-spinners";
import UserContext from "@/utils/UserContext";

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
    <div className={`w-[100%] overflow-hidden mx-auto p-6 select-none`}>
      <div
        className={`mb-4 p-4 ${theme.mainTheme} border-b ${theme.colorBorder} rounded-lg`}
      >
        <h2 className={`text-2xl font-bold mb-6 ${theme.colorText}`}>
          All Registered Tailors
        </h2>
        <div
          className={`w-full shadow-md flex justify-between items-center relative`}
        >
          <div className="relative" ref={dropdownButtonRef}>
            <button
              className={`px-4 py-2 rounded-lg border ${theme.colorBorder} ${theme.colorText} bg-${theme.buttonBg} hover:bg-${theme.buttonHoverBg}`}
              onClick={toggleDropdown}
            >
              Sort by: {filters.sortBy}
            </button>
          </div>
          <button
            className={`px-4 py-2 rounded-lg border ${theme.colorBorder} text-white bg-${theme.buttonBg} hover:bg-${theme.buttonHoverBg}`}
            onClick={applyFilters}
          >
            Apply
          </button>
        </div>
      </div>
      <div
        className={`mt-4 rounded-xl z-0 overflow-hidden p-6 ${theme.mainTheme}`}
      >
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <PropagateLoader color="blue" />
          </div>
        ) : (
          tailorList.map((tailor, index) => (
            <div
              key={index}
              className={`cursor-pointer hover:border-yellow-500 relative flex items-center justify-between p-4 mb-4 border rounded-md ${theme.colorBorder}`}
            >
              <div className="flex items-center space-x-4">
                <img
                  src={
                    tailor.businessPictureUrl || "/images/profile/default.jpg"
                  }
                  className="w-32 h-20 object-cover rounded-lg"
                  alt={tailor.businessName}
                />
                <div className="flex flex-col">
                  <h3 className={`text-lg font-bold ${theme.colorText}`}>
                    {tailor.businessName}
                    <span className="text-sm ml-2 text-gray-500">
                      ({tailor.openTime} - {tailor.closeTime})
                    </span>
                  </h3>
                  <span className="text-yellow-500 text-sm">
                    {"★".repeat(Math.floor(tailor.rating))}{" "}
                    {"☆".repeat(5 - Math.floor(tailor.rating))}
                  </span>
                </div>
              </div>
              <div className="flex justify-center items-center">
                <span
                  className=" text-yellow-500 font-bold text-sm px-2 py-3"
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
      {dropdownOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            className={`absolute p-4 w-auto ${theme.mainTheme} text-${theme.colorText} rounded-md shadow-lg border ${theme.colorBorder}`}
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              zIndex: 1000,
              width: "fit-content",
            }}
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
                        ? "bg-blue-500 text-white"
                        : "bg-gray-600"
                    }`}
                  >
                    {specialityFilter.includes(speciality) && (
                      <span className="text-green-500 mr-2">✔</span>
                    )}
                    {speciality}
                  </div>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default TailorListPage;
