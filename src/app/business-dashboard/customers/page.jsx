"use client";
import React, { useEffect, useState, useContext } from "react";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import DialogBox from "@/components/DialogBox";
import { db } from "@/utils/firebaseConfig";
import UserContext from "@/utils/UserContext";
import { useRouter } from "next/navigation";
import { ClipLoader } from "react-spinners";
import SimpleButton from "@/components/SimpleButton";
import { motion, AnimatePresence } from "framer-motion";
import Fuse from "fuse.js";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const TailorCustomers = () => {
  const {
    userLoggedIn,
    userData,
    theme,
    inputStyles,
    placeHolderStyles,
    setShowMessage,
    setPopUpMessageTrigger,
  } = useContext(UserContext);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [addingCustomer, setAddingCustomer] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState(customers);
  const [formData, setFormData] = useState({
    fullName: "",
    countryCode: "+92",
    phone: "",
    gender: "",
    age: "",
  });
  const router = useRouter();

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!userLoggedIn || !userData?.bId) return;
      setLoading(true);
      try {
        const connectionsQuery = query(
          collection(db, "userTailorConnections"),
          where("tailorId", "==", userData.bId)
        );
        const connectionsSnap = await getDocs(connectionsQuery);
        const userIds = connectionsSnap.docs.map((doc) => doc.data().userId);

        const userFetches = userIds.map(async (uid) => {
          const userDoc = await getDoc(doc(db, "users", uid));
          return userDoc.exists() ? { id: uid, ...userDoc.data() } : null;
        });

        const usersData = await Promise.all(userFetches);
        setCustomers(usersData.filter(Boolean));
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [userLoggedIn, userData?.bId]);

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    // Validate Name
    if (!formData.fullName.trim()) {
      setShowMessage({
        type: "info",
        message: "Enter customer's full name",
      });
      setPopUpMessageTrigger("true");
      return;
    } else if (formData.fullName.length < 3) {
      setShowMessage({
        type: "info",
        message: "Customer's name must be at least 3 characters",
      });
      setPopUpMessageTrigger("true");
      return;
    }
    // Validate Phone
    if (!formData.phone.trim()) {
      setShowMessage({
        type: "warning",
        message: "Customer's phone number is required",
      });
      setPopUpMessageTrigger("true");
      return;
    }
    if (!/^\d*$/.test(formData.phone)) {
      setShowMessage({
        type: "warning",
        message: "Phone number can only contain digits",
      });
      setPopUpMessageTrigger("true");
      return;
    }
    if (
      (formData.phone && formData.phone.length < 7) ||
      formData.phone.length > 10
    ) {
      setShowMessage({
        type: "warning",
        message: "Please enter a valid phone number",
      });
      setPopUpMessageTrigger("true");
      return;
    }
    if (formData.phone.startsWith("0")) {
      setShowMessage({
        type: "warning",
        message: "Please remove prefix (0) from phone number",
      });
      setPopUpMessageTrigger(true);
      return;
    }

    // Validate Gender
    if (!formData.gender || formData.gender === "") {
      setShowMessage({
        type: "info",
        message: "Please select a gender",
      });
      setPopUpMessageTrigger("true");
      return;
    }
    // Validate Age
    const ageValue = formData.age.trim();
    if (!ageValue || isNaN(ageValue) || +ageValue < 10 || +ageValue > 100) {
      setShowMessage({
        type: "info",
        message: "Enter a valid age between 1 and 100 with no spaces",
      });
      setPopUpMessageTrigger("true");
      return;
    }

    setAddingCustomer(true);
    try {
      const userRef = doc(collection(db, "users"));
      const uid = userRef.id;

      await setDoc(userRef, {
        uid,
        fullName: formData.fullName,
        countryCode: formData.countryCode,
        phone: formData.phone,
        gender: formData.gender,
        age: formData.age,
        createdByTailor: true,
      });

      const connectionRef = doc(
        db,
        "userTailorConnections",
        `${userData.bId}_${uid}`
      );
      await setDoc(connectionRef, {
        tailorId: userData.bId,
        userId: uid,
      });

      setFormData({ fullName: "", phone: "", gender: "", age: "" });
      setShowMessage({ message: "Customer added.", type: "success" });
      setPopUpMessageTrigger(true);
      router.push(`/user?share=${uid}`);
    } catch (error) {
      console.error("Error adding customer:", error);
      setShowMessage({ message: "Failed to add customer.", type: "danger" });
      setPopUpMessageTrigger(true);
    } finally {
      setAddingCustomer(false);
    }
  };

  const handleDeleteCustomer = async (uid) => {
    setDeleting(true);
    try {
      const connectionId = `${userData.bId}_${uid}`;
      await deleteDoc(doc(db, "userTailorConnections", connectionId));

      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists() && userDoc.data().createdByTailor) {
        await deleteDoc(userDocRef);
      }

      setCustomers((prev) => prev.filter((c) => c.id !== uid));
      setShowMessage({ message: "Customer removed.", type: "success" });
      setPopUpMessageTrigger(true);
    } catch (error) {
      console.error("Error deleting customer:", error);
      setShowMessage({ message: "Failed to remove customer.", type: "danger" });
      setPopUpMessageTrigger(true);
    } finally {
      setDeleting(false);
    }
  };

  const toggleSearch = () => {
    setSearchActive(!searchActive);
    setShowForm(false);
    if (searchActive) {
      setSearchQuery("");
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  // Search Query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredCustomers(customers);
      return;
    }

    const fuse = new Fuse(customers, {
      keys: ["fullName", "phone"],
      threshold: 0.3, // lower = stricter, higher = more fuzzy
    });

    const result = fuse.search(searchQuery);
    const matched = result.map((r) => r.item);
    setFilteredCustomers(matched);
  }, [searchQuery, customers]);

  const handleViewCustomer = (uid) => {
    router.push(`/user?share=${uid}`);
  };

  const handleClickContact = (customer) => {
    const message = `Hello ${customer.fullName}, this is your tailor! 👋`;

    const url = `https://wa.me/${
      customer.countryCode + customer.phone
    }?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className={`max-w-[99.5%] mx-auto my-4 md:my-1 h-auto select-none`}>
        <div className={`p-4 ${theme.mainTheme} h-full rounded-lg shadow-xl`}>
          <div className="mx-auto my-4 p-4">
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-between items-center mb-6 pb-4 border-b"
            >
              <div className="flex items-center space-x-3">
                <i className={`fas fa-users text-3xl ${theme.iconColor}`}></i>
                <h2
                  className={`text-2xl font-bold ${theme.colorText} ${
                    searchActive ? "hidden md:block" : "block"
                  }`}
                >
                  My Customers
                  <span className="text-sm ml-2 ${theme.subTextColor}">
                    ({filteredCustomers.length})
                  </span>
                </h2>
              </div>

              {/* Search Controls */}
              <div className="flex items-center gap-4">
                <div
                  className={`relative transition-all duration-200 ${
                    searchActive ? "w-64" : "w-10"
                  }`}
                >
                  {searchActive ? (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center"
                    >
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i
                          className={`fas fa-search ${theme.iconColor} opacity-80`}
                        ></i>
                      </div>
                      <input
                        type="text"
                        placeholder="Search customers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full p-2 pl-10 pr-8 rounded-lg transition-all ${theme.colorBg} ${theme.colorText} border ${theme.colorBorder} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      />
                      <button
                        onClick={toggleSearch}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <i
                          className={`fas fa-times ${theme.iconColor} hover:text-red-500 transition-colors`}
                        ></i>
                      </button>
                    </motion.div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={toggleSearch}
                      className={`p-2 ${theme.iconColor} ${theme.hoverText}`}
                    >
                      <i className="fas fa-search text-xl"></i>
                    </motion.button>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={clearSearch}
                  className={`flex items-center space-x-1 ${theme.colorText} hover:text-blue-500 transition-colors`}
                >
                  <i className="fas fa-eraser"></i>
                  <span className="text-sm hidden md:block">Clear</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Add Customer Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6"
            >
              <SimpleButton
                btnText={showForm ? "Hide Form" : "Add New Customer"}
                icon={
                  <i
                    className={`fas fa-${showForm ? "minus" : "user-plus"}`}
                  ></i>
                }
                type="primary"
                onClick={() => {
                  setShowForm((prev) => !prev);
                  setSearchActive(false);
                }}
              />
            </motion.div>

            {/* Add Customer Form */}
            <AnimatePresence>
              {showForm && (
                <motion.form
                  onSubmit={handleAddCustomer}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`mt-6 border p-8 rounded-lg backdrop-blur-lg ${theme.colorBorder} ${theme.hoverShadow}`}
                  noValidate
                >
                  <div className="relative mb-4">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder=" "
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      required
                      className={inputStyles}
                    />
                    <label htmlFor="name" className={placeHolderStyles}>
                      Full Name
                    </label>
                  </div>
                  <div className="relative mb-4">
                    <div className="flex">
                      <select
                        id="countryCode"
                        name="countryCode"
                        value={formData.countryCode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            countryCode: e.target.value,
                          })
                        }
                        className={`border-b-2 bg-transparent p-2 ${theme.colorText} ${theme.colorBorder} focus:border-blue-600 outline-none`}
                      >
                        <option value="+92" className={theme.colorBg}>
                          🇵🇰 +92
                        </option>
                        <option value="+1" className={theme.colorBg}>
                          🇺🇸 +1
                        </option>
                        <option value="+44" className={theme.colorBg}>
                          🇬🇧 +44
                        </option>
                        <option value="+61" className={theme.colorBg}>
                          🇦🇺 +61
                        </option>
                      </select>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className={`ml-3 ${inputStyles}`}
                        placeholder=" "
                      />
                      <label
                        className={`ml-24 ${placeHolderStyles}`}
                        htmlFor="phone"
                      >
                        Phone Number
                      </label>
                    </div>
                  </div>
                  <div className="relative mb-4">
                    <select
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                      required
                      className={inputStyles}
                    >
                      <option value="" className={theme.colorBg}>
                        Select Gender
                      </option>
                      <option value="male" className={theme.colorBg}>
                        Male
                      </option>
                      <option value="female" className={theme.colorBg}>
                        Female
                      </option>
                      <option value="other" className={theme.colorBg}>
                        Other
                      </option>
                    </select>
                  </div>
                  <div className="relative mb-4">
                    <input
                      type="number"
                      id="age"
                      name="age"
                      placeholder=" "
                      value={formData.age}
                      onChange={(e) =>
                        setFormData({ ...formData, age: e.target.value })
                      }
                      required
                      className={inputStyles}
                    />
                    <label htmlFor="age" className={placeHolderStyles}>
                      Age
                    </label>
                  </div>
                  <SimpleButton
                    type="primary-submit"
                    btnText={"Add Customer"}
                    icon={
                      addingCustomer ? (
                        <LoadingSpinner size={20} />
                      ) : (
                        <i className="fas fa-user-check" />
                      )
                    }
                  />
                </motion.form>
              )}
            </AnimatePresence>

            {/* Customer List */}
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <ClipLoader size={35} color="white" />
              </div>
            ) : filteredCustomers.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center p-8"
              >
                <i
                  className={`fas fa-user-slash text-4xl mb-4 ${theme.iconColor}`}
                ></i>
                <p className={`${theme.colorText} opacity-70`}>
                  No customers found
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
              </motion.div>
            ) : (
              <motion.div
                className="space-y-2 mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <AnimatePresence>
                  {filteredCustomers.map((customer) => (
                    <motion.div
                      key={customer.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`p-4 rounded-lg flex justify-between items-center transition-all ${theme.colorBg} ${theme.hoverShadow} group`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${theme.colorBg}`}>
                          <i
                            className={`fas fa-user ${theme.iconColor} text-lg px-1`}
                          ></i>
                        </div>
                        <div>
                          <p className={`font-semibold ${theme.colorText}`}>
                            {customer.fullName}
                            <span
                              className={`ml-2 text-sm ${theme.subTextColor}`}
                            >
                              • {customer.gender} • {customer.age}
                            </span>
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <i
                              className={`fas fa-phone ${theme.iconColor} text-sm`}
                            ></i>
                            <span
                              className={`text-sm ${theme.subTextColor} hover:text-blue-500 cursor-pointer`}
                              onClick={() => handleClickContact(customer)}
                            >
                              {customer.countryCode}-{customer.phone}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 opacity-70 md:opacity-20 group-hover:opacity-100 transition-opacity">
                        <SimpleButton
                          btnText="View"
                          icon={<i className="fas fa-eye mr-2" />}
                          type="primary"
                          onClick={() => handleViewCustomer(customer.id)}
                        />
                        <SimpleButton
                          btnText="Delete"
                          icon={
                            deleting && selectedCustomer?.id === customer.id ? (
                              <LoadingSpinner size={20} />
                            ) : (
                              <i className="fas fa-trash"></i>
                            )
                          }
                          type="danger"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setShowWarningDialog(true);
                          }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      {showWarningDialog && (
        <DialogBox
          title={
            <div className="flex items-center space-x-2">
              <i className="fas fa-exclamation-triangle text-red-500" />
              <span>Delete {selectedCustomer?.fullName}?</span>
            </div>
          }
          body={
            <div className="flex items-center space-x-2">
              <i className="fas fa-trash text-red-500" />
              <span>This action cannot be undone!</span>
            </div>
          }
          type="danger"
          showDialog={showWarningDialog}
          setShowDialog={setShowWarningDialog}
          buttons={[
            {
              label: "Confirm Delete",
              onClick: () => {
                handleDeleteCustomer(selectedCustomer.id);
                setShowWarningDialog(false);
              },
              type: "danger",
              icon: <i className="fas fa-trash mr-2" />,
            },
          ]}
        />
      )}
    </div>
  );
};

export default TailorCustomers;
