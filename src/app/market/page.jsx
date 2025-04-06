"use client";

import { useState, useEffect, useRef, useContext } from "react";
import { ClipLoader } from "react-spinners";
import UserContext from "@/utils/UserContext";
import SimpleButton from "@/components/SimpleButton";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

const Market = () => {
  const { theme } = useContext(UserContext);

  const categories = [
    { name: "Male", icon: "male" },
    { name: "Female", icon: "female" },
    { name: "Kids", icon: "child" },
  ];

  const sortOptions = [
    { name: "Recommended", icon: "star" },
    { name: "Price: Low to High", icon: "dollar-sign" },
    { name: "Price: High to Low", icon: "dollar-sign" },
  ];

  const [filters, setFilters] = useState({
    sortBy: "Recommended",
    showCount: 60,
    page: 1,
  });
  const [categoryFilter, setCategoryFilter] = useState([]);
  const [appliedFilters, setAppliedFilters] = useState([]);
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchActive, setSearchActive] = useState(false);

  const dropdownRef = useRef(null);
  const dropdownButtonRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // Add Font Awesome to the head
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    link.integrity =
      "sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==";
    link.crossOrigin = "anonymous";
    link.referrerPolicy = "no-referrer";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);
  // Mock data for products
  const mockProducts = [
    {
      id: 1,
      name: "Classic White Shirt",
      image: "/images/products/shirt.png",
      tailor: "Stitch Masters",
      rating: 4.5,
      price: 49.99,
      category: "Male",
    },
  ];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      let products = [...mockProducts];

      // Apply search filter
      if (searchQuery) {
        products = products.filter(
          (product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.tailor.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Apply category filters
      if (appliedFilters.length > 0) {
        products = products.filter((product) =>
          appliedFilters.includes(product.category)
        );
      }

      // Apply sorting
      switch (filters.sortBy) {
        case "Price: Low to High":
          products.sort((a, b) => a.price - b.price);
          break;
        case "Price: High to Low":
          products.sort((a, b) => b.price - a.price);
          break;
        case "Recommended":
        default:
          products.sort((a, b) => b.rating - a.rating);
          break;
      }

      setProductList(products);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters, filters.sortBy, searchQuery]);

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

  const productVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
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

  const handleCategoryChange = (value) => {
    setCategoryFilter((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const applyFilters = () => {
    setAppliedFilters([...categoryFilter]);
    setDropdownOpen(false);
  };

  const clearFilters = () => {
    setCategoryFilter([]);
    setAppliedFilters([]);
    setSearchQuery("");
  };

  const toggleSearch = () => {
    setSearchActive(!searchActive);
    if (searchActive) {
      setSearchQuery("");
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <i
          key={`full-${i}`}
          className="fas fa-star text-yellow-400 text-sm"
        ></i>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <i
          key="half"
          className="fas fa-star-half-alt text-yellow-400 text-sm"
        ></i>
      );
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <i key={`empty-${i}`} className="far fa-star text-gray-400 text-sm"></i>
      );
    }

    return stars;
  };

  return (
    <div
      className={`max-w-[99.5%] mx-auto my-4 md:my-1 overflow-hidden select-none`}
    >
      <div className={`p-4 ${theme.mainTheme} rounded-lg`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${theme.colorText}`}>
            TailorEase Market
          </h2>

          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div
              className={`relative transition-all duration-300 ${
                searchActive ? "w-64" : "w-10"
              }`}
            >
              {searchActive ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center"
                >
                  <i
                    className={`fas fa-search absolute left-3 ${theme.colorText} opacity-70`}
                  ></i>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full p-2 pl-10 pr-8 rounded-lg ${theme.colorBg} ${theme.colorText} border ${theme.colorBorder} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <i
                    className={`fas fa-times absolute right-3 cursor-pointer ${theme.colorText} hover:text-red-500`}
                    onClick={toggleSearch}
                  ></i>
                </motion.div>
              ) : (
                <i
                  className={`fas fa-search cursor-pointer ${theme.colorText} hover:text-blue-500 text-xl`}
                  onClick={toggleSearch}
                ></i>
              )}
            </div>

            {/* Filter Button */}
            <div className="relative" ref={dropdownButtonRef}>
              <SimpleButton
                type={"simple"}
                btnText={
                  <>
                    <i className="fas fa-filter mr-2"></i>
                    Filters
                  </>
                }
                extraclasses={`px-4 py-2 border font-semibold ${theme.colorBorder}`}
                onClick={toggleDropdown}
              />
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {(appliedFilters.length > 0 || searchQuery) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center gap-2 mb-4"
          >
            <span className={`text-sm ${theme.colorText}`}>
              <i className="fas fa-filter mr-1"></i>
              Active filters:
            </span>
            {appliedFilters.map((filter) => (
              <motion.span
                key={filter}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`px-3 py-1 text-xs rounded-full ${theme.colorBg} ${theme.colorText} border ${theme.colorBorder} flex items-center`}
              >
                <i
                  className={`fas fa-${
                    filter === "Male"
                      ? "male"
                      : filter === "Female"
                      ? "female"
                      : "child"
                  } mr-1`}
                ></i>
                {filter}
              </motion.span>
            ))}
            {searchQuery && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`px-3 py-1 text-xs rounded-full ${theme.colorBg} ${theme.colorText} border ${theme.colorBorder} flex items-center`}
              >
                <i className="fas fa-search mr-1"></i>
                Search: "{searchQuery}"
              </motion.span>
            )}
            <button
              onClick={clearFilters}
              className={`ml-2 text-xs underline ${theme.colorText} hover:text-blue-500 flex items-center`}
            >
              <i className="fas fa-broom mr-1"></i>
              Clear all
            </button>
          </motion.div>
        )}

        {/* Sort Options */}
        <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
          {sortOptions.map((option) => (
            <motion.button
              key={option.name}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilters({ ...filters, sortBy: option.name })}
              className={`px-2 m-2 py-2 rounded-full text-sm whitespace-nowrap flex items-center ${
                filters.sortBy === option.name
                  ? `${theme.hoverBg} bg-opacity-50 font-bold`
                  : `${theme.colorBg}`
              } ${theme.colorText} border ${theme.colorBorder}`}
            >
              <i
                className={`fas fa-${option.icon} mr-2 ${
                  filters.sortBy === option.name ? "text-yellow-400" : ""
                }`}
              ></i>
              {option.name}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div
        className={`${theme.mainTheme} w-full rounded-xl overflow-hidden grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4 mt-1 mb-3 md:mb-1 mx-auto`}
      >
        {loading ? (
          <div className="col-span-full flex justify-center items-center h-96">
            <ClipLoader color="#ffffff" size={60} />
          </div>
        ) : (
          <>
            {productList.length <= 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full flex flex-col items-center justify-center h-96"
              >
                <i
                  className={`fas fa-tshirt text-4xl mb-4 ${theme.colorText} opacity-50`}
                ></i>
                <span className={`text-2xl font-bold mb-4 ${theme.colorText}`}>
                  No products found
                </span>
                <button
                  onClick={clearFilters}
                  className={`px-4 py-2 rounded-lg ${theme.hoverBg} ${theme.colorText} flex items-center`}
                >
                  <i className="fas fa-broom mr-2"></i>
                  Clear filters
                </button>
              </motion.div>
            ) : (
              productList.map((product, index) => (
                <motion.div
                  key={product.id}
                  variants={productVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`${theme.mainTheme} cursor-pointer overflow-hidden rounded-xl border transition-all duration-300 ${theme.colorBorder} ${theme.hoverShadow} flex flex-col`}
                >
                  <div className="relative overflow-hidden aspect-square w-full">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      priority={index < 5}
                    />
                  </div>
                  <div
                    className={`p-3 ${theme.colorBg} overflow-hidden flex-grow`}
                  >
                    <h3
                      className={`font-semibold line-clamp-2 ${theme.colorText}`}
                    >
                      {product.name}
                    </h3>
                    <p
                      className={`text-sm mt-1 ${theme.colorText} opacity-80 flex items-center`}
                    >
                      <i
                        className={`fas fa-${
                          product.category === "Male"
                            ? "male"
                            : product.category === "Female"
                            ? "female"
                            : "child"
                        } mr-2 text-xs`}
                      ></i>
                      by {product.tailor}
                    </p>
                    <div className="flex overflow-hidden items-center mt-2">
                      <div className="flex">{renderStars(product.rating)}</div>
                      <span className={`text-xs ml-1 ${theme.colorText}`}>
                        ({product.rating.toFixed(1)})
                      </span>
                    </div>
                    <p
                      className={`mt-2 font-bold text-lg ${theme.colorText} flex items-center`}
                    >
                      <i className="fas fa-dollar-sign mr-1 text-sm"></i>
                      {product.price.toFixed(2)}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </>
        )}
      </div>

      {/* Filter Dropdown */}
      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            ref={dropdownRef}
            className={`absolute top-0 right-[20px] mt-2 p-4 ${theme.mainTheme} rounded-md shadow-lg border ${theme.colorBorder}`}
            style={{
              top: dropdownPosition.top,
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
              <h3
                className={`font-bold text-lg mb-2 ${theme.colorText} flex items-center`}
              >
                <i className="fas fa-filter mr-2"></i>
                Filter by Category
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {categories.map((category) => (
                  <motion.div
                    key={category.name}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCategoryChange(category.name)}
                    className={`p-3 border rounded-lg cursor-pointer flex items-center ${
                      categoryFilter.includes(category.name)
                        ? `${theme.hoverBg} bg-opacity-50`
                        : `${theme.colorBg}`
                    } ${theme.colorBorder}`}
                  >
                    {categoryFilter.includes(category.name) && (
                      <i className="fas fa-check text-green-500 mr-3"></i>
                    )}
                    <i
                      className={`fas fa-${category.icon} mr-3 ${
                        categoryFilter.includes(category.name)
                          ? "text-blue-400"
                          : ""
                      }`}
                    ></i>
                    <span className={theme.colorText}>{category.name}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <SimpleButton
                type={"simple"}
                btnText={
                  <>
                    <i className="fas fa-check mr-2"></i>
                    Apply Filters
                  </>
                }
                extraclasses={`px-4 py-2 rounded-lg flex-grow`}
                onClick={applyFilters}
              />
              <SimpleButton
                type={"simple"}
                btnText={
                  <>
                    <i className="fas fa-broom mr-2"></i>
                    Clear
                  </>
                }
                extraclasses={`px-4 py-2 rounded-lg border ${theme.colorBorder}`}
                onClick={clearFilters}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Market;
