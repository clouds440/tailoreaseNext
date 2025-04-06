"use client";
import { useState, useContext } from "react";
import UserContext from "@/utils/UserContext";
import { motion } from "framer-motion";
import SimpleButton from "@/components/SimpleButton";

const TailorProductsPage = () => {
  const { theme } = useContext(UserContext);
  const [productData, setProductData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    gender: "",
    images: [],
    measurementsRequired: false,
    customizationOptions: []
  });

  const categories = ["Shirt", "Pants", "Dress", "Suit", "Jacket", "Skirt", "Other"];
  const genderOptions = ["Male", "Female", "Unisex", "Kids"];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (e) => {
    // In a real app, you would handle file uploads here
    const files = Array.from(e.target.files);
    setProductData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index) => {
    setProductData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addCustomizationOption = () => {
    setProductData(prev => ({
      ...prev,
      customizationOptions: [...prev.customizationOptions, { name: "", price: "" }]
    }));
  };

  const handleCustomizationChange = (index, e) => {
    const { name, value } = e.target;
    const updatedOptions = [...productData.customizationOptions];
    updatedOptions[index][name] = value;
    
    setProductData(prev => ({
      ...prev,
      customizationOptions: updatedOptions
    }));
  };

  const removeCustomizationOption = (index) => {
    setProductData(prev => ({
      ...prev,
      customizationOptions: prev.customizationOptions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Form submission logic would go here
    console.log("Product Data:", productData);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`p-6 rounded-xl ${theme.colorBg} bg-opacity-80 shadow-lg`}
    >
      <div className="flex items-center mb-8">
        <i className={`fas fa-tshirt text-3xl mr-3 ${theme.iconColor}`}></i>
        <h1 className={`text-2xl font-bold ${theme.colorText}`}>Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className={`p-6 rounded-lg ${theme.colorBg} bg-opacity-50`}>
            <h2 className={`text-lg font-semibold mb-4 flex items-center ${theme.colorText}`}>
              <i className="fas fa-info-circle mr-2"></i>
              Basic Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme.colorText}`}>
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={productData.name}
                  onChange={handleInputChange}
                  required
                  className={`w-full p-3 rounded-lg ${theme.colorBg} ${theme.colorText} border ${theme.colorBorder} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="e.g., Classic White Shirt"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${theme.colorText}`}>
                  Description *
                </label>
                <textarea
                  name="description"
                  value={productData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className={`w-full p-3 rounded-lg ${theme.colorBg} ${theme.colorText} border ${theme.colorBorder} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Describe your product in detail..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme.colorText}`}>
                    Category *
                  </label>
                  <select
                    name="category"
                    value={productData.category}
                    onChange={handleInputChange}
                    required
                    className={`w-full p-3 rounded-lg ${theme.colorBg} ${theme.colorText} border ${theme.colorBorder} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme.colorText}`}>
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={productData.gender}
                    onChange={handleInputChange}
                    required
                    className={`w-full p-3 rounded-lg ${theme.colorBg} ${theme.colorText} border ${theme.colorBorder} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  >
                    <option value="">Select Gender</option>
                    {genderOptions.map(gender => (
                      <option key={gender} value={gender}>{gender}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${theme.colorText}`}>
                  Price (USD) *
                </label>
                <div className="relative">
                  <span className={`absolute left-3 top-3 ${theme.colorText}`}>$</span>
                  <input
                    type="number"
                    name="price"
                    value={productData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className={`w-full pl-8 p-3 rounded-lg ${theme.colorBg} ${theme.colorText} border ${theme.colorBorder} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Product Images */}
          <div className={`p-6 rounded-lg ${theme.colorBg} bg-opacity-50`}>
            <h2 className={`text-lg font-semibold mb-4 flex items-center ${theme.colorText}`}>
              <i className="fas fa-images mr-2"></i>
              Product Images *
            </h2>
            
            <div className="space-y-4">
              <div className={`border-2 border-dashed ${theme.colorBorder} rounded-lg p-6 text-center cursor-pointer hover:bg-opacity-30 ${theme.hoverBg} transition-colors`}>
                <label className="cursor-pointer">
                  <i className={`fas fa-cloud-upload-alt text-3xl mb-2 ${theme.iconColor}`}></i>
                  <p className={`text-sm ${theme.colorText}`}>Click to upload or drag and drop</p>
                  <p className={`text-xs ${theme.colorText} opacity-70`}>PNG, JPG (max. 5MB each)</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {productData.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {productData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-gray-200 rounded-md overflow-hidden">
                        {/* In a real app, you'd display the actual image */}
                        <div className="w-full h-full flex items-center justify-center">
                          <i className="fas fa-image text-gray-400 text-xl"></i>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <i className="fas fa-times text-xs"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Customization Options */}
          <div className={`p-6 rounded-lg ${theme.colorBg} bg-opacity-50 md:col-span-2`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-lg font-semibold flex items-center ${theme.colorText}`}>
                <i className="fas fa-sliders-h mr-2"></i>
                Customization Options
              </h2>
              <button
                type="button"
                onClick={addCustomizationOption}
                className={`text-sm flex items-center ${theme.colorText} hover:text-blue-500`}
              >
                <i className="fas fa-plus-circle mr-1"></i> Add Option
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="measurementsRequired"
                  name="measurementsRequired"
                  checked={productData.measurementsRequired}
                  onChange={handleInputChange}
                  className={`mr-2 rounded ${theme.colorBorder} focus:ring-blue-500`}
                />
                <label htmlFor="measurementsRequired" className={`text-sm ${theme.colorText}`}>
                  This product requires customer measurements
                </label>
              </div>

              {productData.customizationOptions.map((option, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme.colorText}`}>
                      Option Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={option.name}
                      onChange={(e) => handleCustomizationChange(index, e)}
                      className={`w-full p-2 rounded-lg ${theme.colorBg} ${theme.colorText} border ${theme.colorBorder}`}
                      placeholder="e.g., Fabric Type"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme.colorText}`}>
                      Additional Price
                    </label>
                    <div className="relative">
                      <span className={`absolute left-2 top-2 ${theme.colorText}`}>$</span>
                      <input
                        type="number"
                        name="price"
                        value={option.price}
                        onChange={(e) => handleCustomizationChange(index, e)}
                        min="0"
                        step="0.01"
                        className={`w-full pl-6 p-2 rounded-lg ${theme.colorBg} ${theme.colorText} border ${theme.colorBorder}`}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCustomizationOption(index)}
                    className={`p-2 rounded-lg ${theme.colorBg} hover:bg-opacity-70 transition-colors`}
                  >
                    <i className={`fas fa-trash ${theme.colorText}`}></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <SimpleButton
            type="primary"
            btnText={
              <>
                <i className="fas fa-plus-circle mr-2"></i>
                Add Product
              </>
            }
            extraclasses="px-6 py-3"
          />
        </div>
      </form>
    </motion.div>
  );
};

export default TailorProductsPage;