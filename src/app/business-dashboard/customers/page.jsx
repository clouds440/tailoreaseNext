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

  const handleViewCustomer = (uid) => {
    router.push(`/user?share=${uid}`);
  };

  const handleClickContact = (customer) => {
    const message = "";

    const url = `https://wa.me/${
      customer.countryCode + customer.phone
    }?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className={`h-full overflow-y-auto rounded-md ${theme.mainTheme}`}>
      <div className="mx-auto my-4 p-4">
        <h3 className={`text-2xl font-bold mb-4 ${theme.colorText}`}>
          My Customers
        </h3>

        <SimpleButton
          btnText={showForm ? "Hide Form" : "Add New Customer"}
          type="primary"
          onClick={() => setShowForm((prev) => !prev)}
        />

        <AnimatePresence>
          {showForm && (
            <motion.form
              onSubmit={handleAddCustomer}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mt-6 max-w-2xl"
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
                      setFormData({ ...formData, countryCode: e.target.value })
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
                icon={<i className="fas fa-add"></i>}
              />
            </motion.form>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <ClipLoader size={35} color="white" />
          </div>
        ) : customers.length === 0 ? (
          <p className={`text-center ${theme.colorText} opacity-70`}>
            No customers found.
          </p>
        ) : (
          <div className="space-y-4 mt-10">
            {customers.map((customer) => (
              <div
                key={customer.id}
                className={`p-4 rounded-lg flex justify-between items-center ${theme.colorBg}`}
              >
                <div>
                  <p className={`font-medium ${theme.colorText}`}>
                    {customer.fullName}
                  </p>
                  <span
                    className="text-sm opacity-70 cursor-pointer"
                    onClick={() => handleClickContact(customer)}
                  >
                    {customer.countryCode}-{customer.phone}
                  </span>
                </div>
                <div className="flex gap-2">
                  <SimpleButton
                    btnText="View"
                    type="primary"
                    disabled={deleting}
                    onClick={() => handleViewCustomer(customer.id)}
                  />
                  <SimpleButton
                    btnText="Delete"
                    icon={
                      deleting ? (
                        <LoadingSpinner size={20} />
                      ) : (
                        <i className="fas fa-trash"></i>
                      )
                    }
                    type="danger"
                    disabled={deleting}
                    onClick={() => handleDeleteCustomer(customer.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TailorCustomers;
