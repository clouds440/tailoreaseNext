"use client";
import { useState, useEffect, useContext, useRef } from "react";
import Image from "next/image";
import { db, storage } from "@/utils/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { motion, AnimatePresence } from "framer-motion";
import { ClipLoader } from "react-spinners";
import SimpleButton from "@/components/SimpleButton";
import UserContext from "@/utils/UserContext";
import DialogBox from "@/components/DialogBox";
import { v4 as uuidv4 } from "uuid";

const TailorProductDashboard = () => {
  const [predefinedProducts, setPredefinedProducts] = useState([]);
  const [tailorProducts, setTailorProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedTab, setSelectedTab] = useState("add"); // 'add' or 'manage'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogBoxInfo, setDialogBoxInfo] = useState({
    title: "",
    body: "",
    type: "",
    buttons: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [customProductImages, setCustomProductImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [viewMode, setViewMode] = useState("predefined"); // 'predefined' or 'custom'
  const fileInputRef = useRef(null);

  const {
    theme,
    userData,
    setShowMessage,
    setPopUpMessageTrigger,
    inputStyles,
    placeHolderStyles,
  } = useContext(UserContext);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    material: "",
    price: "",
    deliveryTime: "7",
    description: "",
    has3DTryOn: false,
    isActive: true,
    gender: "unisex",
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!userData?.bId) {
          throw new Error("Tailor business ID not found");
        }

        // Fetch predefined products
        const predefinedQuery = query(
          collection(db, "predefinedProducts"),
          where("isActive", "==", true)
        );
        const predefinedSnapshot = await getDocs(predefinedQuery);

        const products = predefinedSnapshot.empty
          ? []
          : predefinedSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
        setPredefinedProducts(products);

        // Fetch tailor's products
        const tailorQuery = query(
          collection(db, "tailorProducts"),
          where("tailorId", "==", userData.bId)
        );
        const tailorSnapshot = await getDocs(tailorQuery);

        const tailorProductsData = tailorSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTailorProducts(tailorProductsData);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError(`Failed to load products: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [userData]);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name || "",
      category: product.category || "",
      material: product.material || "",
      price: "",
      deliveryTime: "7",
      description: "",
      has3DTryOn: product.has3DTryOn || false,
      isActive: true,
      gender: product.gender || "unisex",
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
  
    try {
      setIsUploading(true);
      setUploadProgress(0);
  
      // Convert files to base64 and upload
      const uploadPromises = files.map(async (file) => {
        const reader = new FileReader();
        const base64Image = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
  
        const fileName = `product-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.jpg`;
        const targetPath = "images/products";
  
        const response = await fetch("/api/imageUpload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageData: base64Image,
            fileName,
            targetPath,
          }),
        });
  
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Image upload failed: ${errorText}`);
        }
  
        const { url } = await response.json();
        return "/" + url; // Return the public URL
      });
  
      const imageUrls = await Promise.all(uploadPromises);
      setCustomProductImages((prev) => [...prev, ...imageUrls]);
    } catch (error) {
      console.error("Error uploading images:", error);
      showErrorMessage("Failed to upload images. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  const removeImage = (index) => {
    setCustomProductImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (viewMode === "predefined" && !selectedProduct) {
      showDialogMessage(
        "No Product Selected",
        "Please select a product from the list before submitting.",
        "warning"
      );
      return;
    }

    if (viewMode === "custom" && (!formData.name || !formData.category)) {
      showDialogMessage(
        "Incomplete Information",
        "Please provide at least a name and category for custom products.",
        "warning"
      );
      return;
    }

    try {
      setIsSubmitting(true);

      if (!formData.price || isNaN(formData.price)) {
        throw new Error("Please enter a valid price");
      }

      const isCustom = viewMode === "custom";
      const productData = {
        tailorId: userData.bId,
        price: parseFloat(formData.price),
        deliveryTime: `${formData.deliveryTime} days`,
        description: formData.description || (isCustom 
          ? `${formData.name} custom product` 
          : `${selectedProduct.name} stitching service`),
        isActive: formData.isActive,
        has3DTryOn: isCustom ? false : formData.has3DTryOn,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isCustom,
        images: isCustom ? customProductImages : [],
        baseProductData: isCustom
          ? {
              name: formData.name,
              category: formData.category,
              material: formData.material,
              imageUrl: customProductImages[0] || "",
              gender: formData.gender,
              isPredefined: false
            }
          : {
              name: selectedProduct.name,
              category: selectedProduct.category,
              material: selectedProduct.material,
              imageUrl: selectedProduct.imageUrl,
              gender: selectedProduct.gender,
              isPredefined: true
            },
        productId: isCustom ? uuidv4() : selectedProduct.id
      };

      await addDoc(collection(db, "tailorProducts"), productData);

      // Refresh tailor products
      const tailorQuery = query(
        collection(db, "tailorProducts"),
        where("tailorId", "==", userData.bId)
      );
      const tailorSnapshot = await getDocs(tailorQuery);
      const updatedTailorProducts = tailorSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTailorProducts(updatedTailorProducts);

      showSuccessMessage(
        `Product ${isCustom ? "created" : "added"} successfully!`
      );

      // Reset form
      if (isCustom) {
        setFormData({
          name: "",
          category: "",
          material: "",
          price: "",
          deliveryTime: "7",
          description: "",
          has3DTryOn: false,
          isActive: true,
          gender: "unisex",
        });
        setCustomProductImages([]);
      } else {
        setSelectedProduct(null);
        setFormData({
          price: "",
          deliveryTime: "7",
          description: "",
          has3DTryOn: false,
          isActive: true,
          gender: "unisex",
        });
      }
    } catch (error) {
      console.error("Error adding product:", error);
      showErrorMessage(`Failed to add product: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      setIsDeleting(true);
      await deleteDoc(doc(db, "tailorProducts", productId));

      setTailorProducts(
        tailorProducts.filter((product) => product.id !== productId)
      );

      showSuccessMessage("Product deleted successfully!");
    } catch (error) {
      console.error("Error deleting product:", error);
      showErrorMessage(`Failed to delete product: ${error.message}`);
    } finally {
      setIsDeleting(false);
      setActiveDropdown(null);
    }
  };

  const handleToggleStatus = async (product) => {
    try {
      await updateDoc(doc(db, "tailorProducts", product.id), {
        isActive: !product.isActive,
        updatedAt: new Date().toISOString(),
      });

      setTailorProducts(
        tailorProducts.map((p) =>
          p.id === product.id ? { ...p, isActive: !p.isActive } : p
        )
      );

      showSuccessMessage(
        `Product ${!product.isActive ? "activated" : "deactivated"} successfully!`
      );
    } catch (error) {
      console.error("Error updating product status:", error);
      showErrorMessage(`Failed to update product status: ${error.message}`);
    } finally {
      setActiveDropdown(null);
    }
  };

  const showDialogMessage = (title, body, type) => {
    setDialogBoxInfo({
      title,
      body,
      type,
      buttons: [{ text: "OK", action: () => setShowDialog(false) }],
    });
    setShowDialog(true);
  };

  const showSuccessMessage = (message) => {
    setShowMessage({
      type: "success",
      message,
    });
    setPopUpMessageTrigger(true);
  };

  const showErrorMessage = (message) => {
    setShowMessage({
      type: "danger",
      message,
    });
    setPopUpMessageTrigger(true);
  };

  const toggleDropdown = (productId) => {
    setActiveDropdown(activeDropdown === productId ? null : productId);
  };

  const DeliveryTimeDropdown = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const options = [
      { value: "3", label: "3 days (Express)" },
      { value: "7", label: "7 days (Standard)" },
      { value: "14", label: "14 days (Economy)" },
      { value: "21", label: "21 days (Custom)" },
    ];

    return (
      <div className="relative">
        <motion.button
          type="button"
          className={`${inputStyles} flex items-center justify-between`}
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>{options.find((opt) => opt.value === value)?.label}</span>
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <i className="fas fa-chevron-down"></i>
          </motion.span>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`absolute z-10 mt-1 w-full rounded-md shadow-lg ${theme.colorBg} border ${theme.colorBorder}`}
            >
              {options.map((option) => (
                <motion.div
                  key={option.value}
                  whileHover={{
                    scale: 1.02,
                    backgroundColor: theme.colorBgHover,
                  }}
                  className={`px-4 py-2 cursor-pointer ${theme.colorText} ${
                    value === option.value ? theme.colorPrimaryBg : ""
                  }`}
                  onClick={() => {
                    onChange({
                      target: { name: "deliveryTime", value: option.value },
                    });
                    setIsOpen(false);
                  }}
                >
                  {option.label}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const GenderDropdown = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const options = [
      { value: "male", label: "Male" },
      { value: "female", label: "Female" },
      { value: "kids", label: "Kids" },
      { value: "unisex", label: "Unisex" },
    ];

    return (
      <div className="relative">
        <motion.button
          type="button"
          className={`${inputStyles} flex items-center justify-between`}
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>{options.find((opt) => opt.value === value)?.label}</span>
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <i className="fas fa-chevron-down"></i>
          </motion.span>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`absolute z-10 mt-1 w-full rounded-md shadow-lg ${theme.colorBg} border ${theme.colorBorder}`}
            >
              {options.map((option) => (
                <motion.div
                  key={option.value}
                  whileHover={{
                    scale: 1.02,
                    backgroundColor: theme.colorBgHover,
                  }}
                  className={`px-4 py-2 cursor-pointer ${theme.colorText} ${
                    value === option.value ? theme.colorPrimaryBg : ""
                  }`}
                  onClick={() => {
                    onChange({
                      target: { name: "gender", value: option.value },
                    });
                    setIsOpen(false);
                  }}
                >
                  {option.label}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-full ${theme.mainTheme}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-t-transparent border-blue-500 rounded-full"
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-lg"
          >
            Loading your products...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-full ${theme.mainTheme}`}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center p-6 max-w-md"
        >
          <motion.div
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`text-5xl mb-4 ${theme.iconColor}`}
          >
            <i className="fas fa-exclamation-triangle"></i>
          </motion.div>
          <h1 className="text-2xl font-bold mb-4">Loading Failed</h1>
          <p className="mb-6">{error}</p>
          <SimpleButton
            btnText="Try Again"
            type="primary"
            onClick={() => window.location.reload()}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`h-full overflow-y-auto ${theme.mainTheme} ${theme.colorText} py-8 px-4 sm:px-6 lg:px-8`}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header with Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <motion.h1
            className="text-3xl md:text-4xl font-bold mb-4 md:mb-0"
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            transition={{ delay: 0.2 }}
          >
            Product Dashboard
          </motion.h1>

          <motion.div
            className="flex rounded-lg p-1 bg-gray-200 dark:bg-gray-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <button
              className={`px-4 py-2 rounded-md transition-all ${
                selectedTab === "add"
                  ? `${theme.colorPrimaryBg} ${theme.colorPrimaryText}`
                  : `${theme.colorText} opacity-80 hover:opacity-100`
              }`}
              onClick={() => setSelectedTab("add")}
            >
              <i className="fas fa-plus mr-2"></i> Add Product
            </button>
            <button
              className={`px-4 py-2 rounded-md transition-all ${
                selectedTab === "manage"
                  ? `${theme.colorPrimaryBg} ${theme.colorPrimaryText}`
                  : `${theme.colorText} opacity-80 hover:opacity-100`
              }`}
              onClick={() => setSelectedTab("manage")}
            >
              <i className="fas fa-list mr-2"></i> My Products (
              {tailorProducts.length})
            </button>
          </motion.div>
        </div>

        {/* Main Content */}
        {selectedTab === "add" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Products List */}
            <motion.div
              className={`lg:col-span-1 rounded-2xl shadow-xl overflow-hidden ${theme.colorBg} border ${theme.colorBorder}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold flex items-center">
                    <i className={`fas fa-boxes mr-2 ${theme.iconColor}`}></i>
                    {viewMode === "predefined" ? "Base Products" : "Custom Product"}
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      className={`px-3 py-1 rounded-md text-sm ${
                        viewMode === "predefined"
                          ? `${theme.colorPrimaryBg} ${theme.colorPrimaryText}`
                          : `${theme.colorBgSecondary}`
                      }`}
                      onClick={() => setViewMode("predefined")}
                    >
                      Predefined
                    </button>
                    <button
                      className={`px-3 py-1 rounded-md text-sm ${
                        viewMode === "custom"
                          ? `${theme.colorPrimaryBg} ${theme.colorPrimaryText}`
                          : `${theme.colorBgSecondary}`
                      }`}
                      onClick={() => setViewMode("custom")}
                    >
                      Custom
                    </button>
                  </div>
                </div>

                {viewMode === "predefined" ? (
                  predefinedProducts.length > 0 ? (
                    <motion.div className="space-y-4">
                      {predefinedProducts.map((product) => (
                        <motion.div
                          key={product.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-4 rounded-lg cursor-pointer transition-all ${
                            selectedProduct?.id === product.id
                              ? `${theme.colorPrimaryBg} ${theme.colorPrimaryText}`
                              : `${theme.colorBgSecondary} hover:${theme.colorBgHover}`
                          }`}
                          onClick={() => handleProductSelect(product)}
                          layout
                        >
                          <div className="flex items-center space-x-4">
                            <motion.div className="relative w-16 h-16 rounded-md overflow-hidden">
                              <Image
                                src={product.imageUrl}
                                alt={product.name}
                                width={300}
                                height={300}
                                style={{ objectFit: "cover" }}
                                className="transition-transform duration-300 hover:scale-105"
                              />
                            </motion.div>
                            <div>
                              <h3 className="font-medium">{product.name}</h3>
                              <p className="text-sm opacity-80">
                                {product.category}
                              </p>
                              <p className="text-xs opacity-60">
                                {product.material} • {product.gender}
                              </p>
                              {product.has3DTryOn && (
                                <span className="text-xs text-blue-500">
                                  3D Try-On Available
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className={`text-5xl mb-4 ${theme.iconColor}`}>
                        <i className="fas fa-box-open"></i>
                      </div>
                      <h3 className="text-lg font-medium mb-2">
                        No Base Products Available
                      </h3>
                      <p className="opacity-80">
                        There are currently no predefined products in the system.
                      </p>
                    </motion.div>
                  )
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="space-y-4">
                      {/* Product Name */}
                      <div className="relative">
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className={`${inputStyles}`}
                          placeholder=" "
                          required
                        />
                        <label className={`${placeHolderStyles}`}>
                          Product Name
                        </label>
                      </div>

                      {/* Category */}
                      <div className="relative">
                        <input
                          type="text"
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className={`${inputStyles}`}
                          placeholder=" "
                          required
                        />
                        <label className={`${placeHolderStyles}`}>
                          Category (e.g., Shirt, Dress)
                        </label>
                      </div>

                      {/* Material */}
                      <div className="relative">
                        <input
                          type="text"
                          name="material"
                          value={formData.material}
                          onChange={handleInputChange}
                          className={`${inputStyles}`}
                          placeholder=" "
                        />
                        <label className={`${placeHolderStyles}`}>
                          Material (optional)
                        </label>
                      </div>

                      {/* Gender */}
                      <div className="relative">
                        <label className={`block mb-2 ${theme.colorText}`}>
                          Gender
                        </label>
                        <GenderDropdown
                          value={formData.gender}
                          onChange={handleInputChange}
                        />
                      </div>

                      {/* Image Upload */}
                      <div>
                        <label className={`block mb-2 ${theme.colorText}`}>
                          Product Images (First image will be main image)
                        </label>
                        <div
                          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer ${theme.colorBorder} hover:${theme.colorPrimaryBorder}`}
                          onClick={() => fileInputRef.current.click()}
                        >
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            className="hidden"
                            multiple
                            accept="image/*"
                          />
                          <i className={`fas fa-cloud-upload-alt text-3xl mb-2 ${theme.iconColor}`}></i>
                          <p className="mb-1">Click or drag images to upload</p>
                          <p className="text-sm opacity-70">
                            Upload multiple images (max 5MB each)
                          </p>
                        </div>

                        {/* Upload Progress */}
                        {isUploading && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                              <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-right mt-1">
                              Uploading... {uploadProgress}%
                            </p>
                          </div>
                        )}

                        {/* Image Previews */}
                        {customProductImages.length > 0 && (
                          <div className="mt-4">
                            <div className="flex flex-wrap gap-2">
                              {customProductImages.map((img, index) => (
                                <motion.div
                                  key={index}
                                  className="relative group"
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <div className="w-16 h-16 rounded-md overflow-hidden">
                                    <Image
                                      src={img}
                                      alt={`Product preview ${index + 1}`}
                                      width={64}
                                      height={64}
                                      className="object-cover w-full h-full"
                                    />
                                  </div>
                                  <motion.button
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeImage(index);
                                    }}
                                    whileHover={{ scale: 1.1 }}
                                  >
                                    <i className="fas fa-times text-xs"></i>
                                  </motion.button>
                                </motion.div>
                              ))}
                            </div>
                            <p className="text-xs mt-1">
                              {customProductImages.length} image(s) selected
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Product Customization Form */}
            <motion.div
              className={`lg:col-span-2 rounded-2xl shadow-xl overflow-hidden ${theme.colorBg} border ${theme.colorBorder}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
            >
              <div className="p-6">
                {(viewMode === "predefined" && selectedProduct) ||
                viewMode === "custom" ? (
                  <>
                    <h2 className="text-xl font-semibold mb-6 flex items-center">
                      <i className={`fas fa-cog mr-2 ${theme.iconColor}`}></i>
                      {viewMode === "predefined"
                        ? "Customize Product"
                        : "Create Custom Product"}
                    </h2>

                    <div className="flex flex-col md:flex-row gap-6 mb-8">
                      {/* Product Image */}
                      <motion.div
                        className="relative w-full md:w-1/3 h-48 rounded-lg overflow-hidden"
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {viewMode === "predefined" ? (
                          <Image
                            src={selectedProduct.imageUrl}
                            alt={selectedProduct.name}
                            width={300}
                            height={300}
                            style={{ objectFit: "cover" }}
                            className="transition-transform duration-300 hover:scale-105"
                          />
                        ) : customProductImages.length > 0 ? (
                          <Image
                            src={customProductImages[0]}
                            alt={formData.name || "Custom product"}
                            width={300}
                            height={300}
                            style={{ objectFit: "cover" }}
                            className="transition-transform duration-300 hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                            <i className={`fas fa-image text-4xl ${theme.iconColor}`}></i>
                          </div>
                        )}
                      </motion.div>

                      {/* Product Info */}
                      <motion.div
                        className="flex-1"
                        initial={{ x: 20 }}
                        animate={{ x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <h3 className="text-2xl font-bold mb-2">
                          {viewMode === "predefined"
                            ? selectedProduct.name
                            : formData.name || "Custom Product"}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {viewMode === "predefined" ? (
                            <>
                              <motion.span
                                className={`px-3 py-1 rounded-full text-sm ${theme.colorBgSecondary}`}
                                whileHover={{ y: -2 }}
                              >
                                {selectedProduct.category}
                              </motion.span>
                              <motion.span
                                className={`px-3 py-1 rounded-full text-sm ${theme.colorBgSecondary}`}
                                whileHover={{ y: -2 }}
                              >
                                {selectedProduct.material}
                              </motion.span>
                              <motion.span
                                className={`px-3 py-1 rounded-full text-sm ${theme.colorBgSecondary}`}
                                whileHover={{ y: -2 }}
                              >
                                {selectedProduct.gender}
                              </motion.span>
                              {selectedProduct.has3DTryOn && (
                                <motion.span
                                  className={`px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`}
                                  whileHover={{ y: -2 }}
                                >
                                  3D Try-On
                                </motion.span>
                              )}
                            </>
                          ) : (
                            <>
                              {formData.category && (
                                <motion.span
                                  className={`px-3 py-1 rounded-full text-sm ${theme.colorBgSecondary}`}
                                  whileHover={{ y: -2 }}
                                >
                                  {formData.category}
                                </motion.span>
                              )}
                              {formData.material && (
                                <motion.span
                                  className={`px-3 py-1 rounded-full text-sm ${theme.colorBgSecondary}`}
                                  whileHover={{ y: -2 }}
                                >
                                  {formData.material}
                                </motion.span>
                              )}
                              {formData.gender && (
                                <motion.span
                                  className={`px-3 py-1 rounded-full text-sm ${theme.colorBgSecondary}`}
                                  whileHover={{ y: -2 }}
                                >
                                  {formData.gender}
                                </motion.span>
                              )}
                            </>
                          )}
                        </div>
                        <p className={`${theme.colorText} opacity-80`}>
                          {viewMode === "predefined"
                            ? selectedProduct.description ||
                              "No description available"
                            : formData.description ||
                              "Custom product description will appear here"}
                        </p>
                      </motion.div>
                    </div>

                    {/* Customization Form */}
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-6">
                        {/* Price */}
                        <motion.div
                          className="relative"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            className={`${inputStyles}`}
                            placeholder=" "
                            required
                            min="0"
                            step="0.01"
                          />
                          <label className={`${placeHolderStyles}`}>
                            Price (in your currency)
                          </label>
                        </motion.div>

                        {/* Delivery Time */}
                        <motion.div
                          className="relative"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <label className={`block mb-2 ${theme.colorText}`}>
                            Delivery Time
                          </label>
                          <DeliveryTimeDropdown
                            value={formData.deliveryTime}
                            onChange={handleInputChange}
                          />
                        </motion.div>

                        {/* Description */}
                        <motion.div
                          className="relative"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className={`${inputStyles} min-h-[100px]`}
                            placeholder=" "
                            rows={4}
                          />
                          <label className={`${placeHolderStyles}`}>
                            Custom Description (optional)
                          </label>
                        </motion.div>

                        {/* 3D Try On - Only for predefined products */}
                        {viewMode === "predefined" && (
                          <motion.div
                            className="flex items-center"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                          >
                            <input
                              type="checkbox"
                              name="has3DTryOn"
                              id="has3DTryOn"
                              checked={formData.has3DTryOn}
                              onChange={handleInputChange}
                              disabled={!selectedProduct?.has3DTryOn}
                              className="w-4 h-4 rounded mr-3"
                            />
                            <label
                              htmlFor="has3DTryOn"
                              className={`${theme.colorText} ${
                                !selectedProduct?.has3DTryOn
                                  ? "opacity-50"
                                  : ""
                              }`}
                            >
                              Enable 3D Try-On for this product
                              {!selectedProduct?.has3DTryOn &&
                                " (Not available for this product)"}
                            </label>
                          </motion.div>
                        )}

                        {/* Status */}
                        <motion.div
                          className="flex items-center"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                        >
                          <input
                            type="checkbox"
                            name="isActive"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={handleInputChange}
                            className="w-4 h-4 rounded mr-3"
                          />
                          <label
                            htmlFor="isActive"
                            className={`${theme.colorText}`}
                          >
                            Active (visible to customers)
                          </label>
                        </motion.div>

                        {/* Submit Button */}
                        <motion.div
                          className="pt-4"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                        >
                          <SimpleButton
                            btnText={
                              isSubmitting ? (
                                <>
                                  <ClipLoader
                                    size={18}
                                    color="#ffffff"
                                    className="mr-2"
                                  />
                                  {viewMode === "predefined"
                                    ? "Adding..."
                                    : "Creating..."}
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-plus mr-2"></i>
                                  {viewMode === "predefined"
                                    ? "Add to My Products"
                                    : "Create Custom Product"}
                                </>
                              )
                            }
                            type="primary-submit"
                            fullWidth
                            disabled={
                              isSubmitting ||
                              (viewMode === "predefined" && !selectedProduct) ||
                              (viewMode === "custom" &&
                                (!formData.name ||
                                  !formData.category ||
                                  customProductImages.length === 0))
                            }
                          />
                        </motion.div>
                      </div>
                    </form>
                  </>
                ) : (
                  <motion.div
                    className="flex flex-col items-center justify-center py-12 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <motion.div
                      animate={{ y: [-5, 5, -5] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className={`text-5xl mb-6 ${theme.iconColor}`}
                    >
                      <i className="fas fa-box-open"></i>
                    </motion.div>
                    <h3 className="text-xl font-semibold mb-2">
                      {viewMode === "predefined"
                        ? "No Product Selected"
                        : "Create Custom Product"}
                    </h3>
                    <p className={`${theme.colorText} opacity-80 max-w-md`}>
                      {viewMode === "predefined"
                        ? "Please select a product from the list to customize and add to your profile."
                        : "Fill in the details on the left to create a custom product."}
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        ) : (
          <motion.div
            className={`rounded-2xl shadow-xl overflow-hidden ${theme.colorBg} border ${theme.colorBorder}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <i className={`fas fa-list mr-2 ${theme.iconColor}`}></i>
                My Products ({tailorProducts.length})
              </h2>

              {tailorProducts.length > 0 ? (
                <div className="space-y-4 h-screen overflow-y-auto">
                  {tailorProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`p-4 rounded-lg ${
                        theme.colorBgSecondary
                      } border ${theme.colorBorder} ${
                        !product.isActive ? "opacity-70" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <motion.div
                            className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0"
                            whileHover={{ scale: 1.05 }}
                          >
                            <Image
                              src={
                                product.isCustom && product.images?.length > 0
                                  ? product.images[0]
                                  : product.baseProductData?.imageUrl ||
                                    "/images/default-product.png"
                              }
                              alt={product.baseProductData?.name || "Product"}
                              width={300}
                              height={300}
                              style={{ objectFit: "cover" }}
                            />
                          </motion.div>

                          <div className="flex-1">
                            <div className="flex items-center">
                              <h3 className="font-medium mr-2">
                                {product.baseProductData?.name}
                                {product.isCustom && (
                                  <span className="ml-2 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2 py-1 rounded-full">
                                    Custom
                                  </span>
                                )}
                              </h3>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  product.isActive
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                }`}
                              >
                                {product.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                            <p className="text-sm opacity-80 mb-1">
                              {product.description}
                            </p>
                            <div className="flex flex-wrap gap-2 text-sm">
                              <span
                                className={`px-2 py-1 rounded-full ${theme.colorBgTertiary}`}
                              >
                                ₹{product.price}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full ${theme.colorBgTertiary}`}
                              >
                                {product.deliveryTime}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full ${theme.colorBgTertiary}`}
                              >
                                {product.baseProductData?.gender || "Unisex"}
                              </span>
                              {product.has3DTryOn && (
                                <span
                                  className={`px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`}
                                >
                                  3D Try-On
                                </span>
                              )}
                              {product.isCustom && product.images?.length > 1 && (
                                <span
                                  className={`px-2 py-1 rounded-full ${theme.colorBgTertiary}`}
                                >
                                  {product.images.length} photos
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="relative">
                          <motion.button
                            className={`p-2 rounded-full ${theme.colorText} hover:${theme.colorBgHover}`}
                            onClick={() => toggleDropdown(product.id)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <i className="fas fa-ellipsis-v"></i>
                          </motion.button>

                          <AnimatePresence>
                            {activeDropdown === product.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.15 }}
                                className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg z-10 ${theme.colorBg} border ${theme.colorBorder}`}
                              >
                                <div className="py-1">
                                  <motion.button
                                    className={`w-full text-left px-4 py-2 ${theme.colorText} hover:${theme.colorBgHover}`}
                                    onClick={() => handleToggleStatus(product)}
                                    whileHover={{ x: 5 }}
                                  >
                                    <i
                                      className={`fas fa-toggle-${
                                        product.isActive ? "on" : "off"
                                      } mr-2`}
                                    ></i>
                                    {product.isActive
                                      ? "Deactivate"
                                      : "Activate"}
                                  </motion.button>
                                  <motion.button
                                    className={`w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30`}
                                    onClick={() =>
                                      handleDeleteProduct(product.id)
                                    }
                                    whileHover={{ x: 5 }}
                                    disabled={isDeleting}
                                  >
                                    {isDeleting ? (
                                      <>
                                        <ClipLoader
                                          size={14}
                                          color="#ef4444"
                                          className="mr-2"
                                        />
                                        Deleting...
                                      </>
                                    ) : (
                                      <>
                                        <i className="fas fa-trash mr-2"></i>
                                        Delete
                                      </>
                                    )}
                                  </motion.button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  className="flex flex-col items-center justify-center py-12 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.div
                    animate={{ y: [-5, 5, -5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className={`text-5xl mb-6 ${theme.iconColor}`}
                  >
                    <i className="fas fa-box-open"></i>
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2">
                    No Products Added Yet
                  </h3>
                  <p className={`${theme.colorText} opacity-80 max-w-md`}>
                    You haven&apos;t added any products yet. Go to the
                    &lsquo;Add Product&lsquo; tab to get started.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Dialog Box */}
      <AnimatePresence>
        {showDialog && (
          <DialogBox
            body={dialogBoxInfo.body}
            title={dialogBoxInfo.title}
            type={dialogBoxInfo.type}
            buttons={dialogBoxInfo.buttons}
            showDialog={showDialog}
            setShowDialog={setShowDialog}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TailorProductDashboard;