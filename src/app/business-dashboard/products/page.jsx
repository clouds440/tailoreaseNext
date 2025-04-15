"use client";
import { useState, useEffect, useContext } from "react";
import Image from "next/image";
import { db } from "@/utils/firebaseConfig";
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc 
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { ClipLoader } from "react-spinners";
import SimpleButton from "@/components/SimpleButton";
import UserContext from "@/utils/UserContext";
import DialogBox from "@/components/DialogBox";

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

  const {
    theme,
    userData,
    setShowMessage,
    setPopUpMessageTrigger,
    inputStyles,
    placeHolderStyles,
  } = useContext(UserContext);

  const [formData, setFormData] = useState({
    price: "",
    deliveryTime: "7",
    description: "",
    has3DTryOn: false,
    isActive: true,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get tailor's bId from userData
        if (!userData?.bId) {
          throw new Error("Tailor business ID not found");
        }

        // Fetch predefined products
        const predefinedQuery = query(
          collection(db, "predefinedProducts"),
          where("isActive", "==", true)
        );
        const predefinedSnapshot = await getDocs(predefinedQuery);
        
        if (predefinedSnapshot.empty) {
          setPredefinedProducts([]);
        } else {
          const products = predefinedSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setPredefinedProducts(products);
        }

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
      price: "",
      deliveryTime: "7",
      description: "",
      has3DTryOn: false,
      isActive: true,
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedProduct) {
      showDialogMessage(
        "No Product Selected",
        "Please select a product from the list before submitting.",
        "warning"
      );
      return;
    }

    try {
      setIsSubmitting(true);

      // Validate form data
      if (!formData.price || isNaN(formData.price)) {
        throw new Error("Please enter a valid price");
      }

      const productData = {
        tailorId: userData.bId, // Using bId instead of uid
        productId: selectedProduct.id,
        price: parseFloat(formData.price),
        deliveryTime: `${formData.deliveryTime} days`,
        description: formData.description || `${selectedProduct.name} stitching service`,
        isActive: formData.isActive,
        has3DTryOn: formData.has3DTryOn,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        baseProductData: {
          name: selectedProduct.name,
          category: selectedProduct.category,
          material: selectedProduct.material,
          imageUrl: selectedProduct.imageUrl,
        },
      };

      // Add to tailorProducts collection
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

      // Show success message
      showSuccessMessage("Product added successfully!");
      
      // Reset form
      setSelectedProduct(null);
      setFormData({
        price: "",
        deliveryTime: "7",
        description: "",
        has3DTryOn: false,
        isActive: true,
      });
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
      
      // Update local state
      setTailorProducts(tailorProducts.filter(product => product.id !== productId));
      
      showSuccessMessage("Product deleted successfully!");
    } catch (error) {
      console.error("Error deleting product:", error);
      showErrorMessage(`Failed to delete product: ${error.message}`);
    } finally {
      setIsDeleting(false);
      setActiveDropdown(null); // Close any open dropdown
    }
  };

  const handleToggleStatus = async (product) => {
    try {
      await updateDoc(doc(db, "tailorProducts", product.id), {
        isActive: !product.isActive,
        updatedAt: new Date().toISOString(),
      });
      
      // Update local state
      setTailorProducts(tailorProducts.map(p => 
        p.id === product.id ? { ...p, isActive: !p.isActive } : p
      ));
      
      showSuccessMessage(`Product ${!product.isActive ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error("Error updating product status:", error);
      showErrorMessage(`Failed to update product status: ${error.message}`);
    } finally {
      setActiveDropdown(null); // Close any open dropdown
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
          <span>{options.find(opt => opt.value === value)?.label}</span>
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
                  whileHover={{ scale: 1.02, backgroundColor: theme.colorBgHover }}
                  className={`px-4 py-2 cursor-pointer ${theme.colorText} ${value === option.value ? theme.colorPrimaryBg : ''}`}
                  onClick={() => {
                    onChange({ target: { name: "deliveryTime", value: option.value } });
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
              className={`px-4 py-2 rounded-md transition-all ${selectedTab === 'add' ? `${theme.colorPrimaryBg} ${theme.colorPrimaryText}` : `${theme.colorText} opacity-80 hover:opacity-100`}`}
              onClick={() => setSelectedTab('add')}
            >
              <i className="fas fa-plus mr-2"></i> Add Product
            </button>
            <button
              className={`px-4 py-2 rounded-md transition-all ${selectedTab === 'manage' ? `${theme.colorPrimaryBg} ${theme.colorPrimaryText}` : `${theme.colorText} opacity-80 hover:opacity-100`}`}
              onClick={() => setSelectedTab('manage')}
            >
              <i className="fas fa-list mr-2"></i> My Products ({tailorProducts.length})
            </button>
          </motion.div>
        </div>

        {/* Main Content */}
        {selectedTab === 'add' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Predefined Products List */}
            <motion.div
              className={`lg:col-span-1 rounded-2xl shadow-xl overflow-hidden ${theme.colorBg} border ${theme.colorBorder}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <i className={`fas fa-boxes mr-2 ${theme.iconColor}`}></i>
                  Base Products
                </h2>
                
                {predefinedProducts.length > 0 ? (
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
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
                          <motion.div 
                            className="relative w-16 h-16 rounded-md overflow-hidden"
                            whileHover={{ scale: 1.05 }}
                          >
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              layout="fill"
                              objectFit="cover"
                              className="transition-transform duration-300 hover:scale-105"
                            />
                          </motion.div>
                          <div>
                            <h3 className="font-medium">{product.name}</h3>
                            <p className="text-sm opacity-80">{product.category}</p>
                            <p className="text-xs opacity-60">{product.material}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    className="flex flex-col items-center justify-center py-8 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className={`text-5xl mb-4 ${theme.iconColor}`}>
                      <i className="fas fa-box-open"></i>
                    </div>
                    <h3 className="text-lg font-medium mb-2">No Base Products Available</h3>
                    <p className="opacity-80">There are currently no predefined products in the system.</p>
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
                {selectedProduct ? (
                  <>
                    <h2 className="text-xl font-semibold mb-6 flex items-center">
                      <i className={`fas fa-cog mr-2 ${theme.iconColor}`}></i>
                      Customize Product
                    </h2>
                    
                    <div className="flex flex-col md:flex-row gap-6 mb-8">
                      {/* Product Image */}
                      <motion.div 
                        className="relative w-full md:w-1/3 h-48 rounded-lg overflow-hidden"
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Image
                          src={selectedProduct.imageUrl}
                          alt={selectedProduct.name}
                          layout="fill"
                          objectFit="cover"
                          className="transition-transform duration-300 hover:scale-105"
                        />
                      </motion.div>
                      
                      {/* Product Info */}
                      <motion.div 
                        className="flex-1"
                        initial={{ x: 20 }}
                        animate={{ x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <h3 className="text-2xl font-bold mb-2">{selectedProduct.name}</h3>
                        <div className="flex flex-wrap gap-2 mb-4">
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
                        </div>
                        <p className={`${theme.colorText} opacity-80`}>
                          {selectedProduct.description || "No description available"}
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
                        
                        {/* 3D Try On */}
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
                            className="w-4 h-4 rounded mr-3"
                          />
                          <label htmlFor="has3DTryOn" className={`${theme.colorText}`}>
                            Enable 3D Try-On for this product
                          </label>
                        </motion.div>
                        
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
                          <label htmlFor="isActive" className={`${theme.colorText}`}>
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
                                  <ClipLoader size={18} color="#ffffff" className="mr-2" />
                                  Adding...
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-plus mr-2"></i> Add to My Products
                                </>
                              )
                            }
                            type="primary-submit"
                            fullWidth
                            disabled={isSubmitting}
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
                    <h3 className="text-xl font-semibold mb-2">No Product Selected</h3>
                    <p className={`${theme.colorText} opacity-80 max-w-md`}>
                      Please select a product from the list to customize and add to your profile.
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
                      className={`p-4 rounded-lg ${theme.colorBgSecondary} border ${theme.colorBorder} ${!product.isActive ? 'opacity-70' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <motion.div 
                            className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0"
                            whileHover={{ scale: 1.05 }}
                          >
                            <Image
                              src={product.baseProductData?.imageUrl || "/images/default-product.png"}
                              alt={product.baseProductData?.name || "Product"}
                              layout="fill"
                              objectFit="cover"
                            />
                          </motion.div>
                          
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h3 className="font-medium mr-2">{product.baseProductData?.name}</h3>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                product.isActive 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              }`}>
                                {product.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <p className="text-sm opacity-80 mb-1">{product.description}</p>
                            <div className="flex flex-wrap gap-2 text-sm">
                              <span className={`px-2 py-1 rounded-full ${theme.colorBgTertiary}`}>
                                ₹{product.price}
                              </span>
                              <span className={`px-2 py-1 rounded-full ${theme.colorBgTertiary}`}>
                                {product.deliveryTime}
                              </span>
                              {product.has3DTryOn && (
                                <span className={`px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`}>
                                  3D Try-On
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
                                    <i className={`fas fa-toggle-${product.isActive ? 'on' : 'off'} mr-2`}></i>
                                    {product.isActive ? 'Deactivate' : 'Activate'}
                                  </motion.button>
                                  <motion.button
                                    className={`w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30`}
                                    onClick={() => handleDeleteProduct(product.id)}
                                    whileHover={{ x: 5 }}
                                    disabled={isDeleting}
                                  >
                                    {isDeleting ? (
                                      <>
                                        <ClipLoader size={14} color="#ef4444" className="mr-2" />
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
                  <h3 className="text-xl font-semibold mb-2">No Products Added Yet</h3>
                  <p className={`${theme.colorText} opacity-80 max-w-md`}>
                    You haven't added any products yet. Go to the "Add Product" tab to get started.
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