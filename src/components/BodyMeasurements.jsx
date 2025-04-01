"use client";
import { useState, useEffect, useContext } from "react";
import { db, auth } from "@/utils/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import UserContext from "@/utils/UserContext";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const measurementFields = [
  { key: "chest", label: "Chest" },
  { key: "shoulder", label: "Shoulder Width" },
  { key: "torso", label: "Torso Length" },
  { key: "sleeve", label: "Sleeve Length" },
  { key: "neck", label: "Neck Circumference" },
  { key: "armhole", label: "Armhole Circumference" },
  { key: "cuff", label: "Cuffs" },

  { key: "waist", label: "Waist" },
  { key: "hips", label: "Hips" },
  { key: "legs", label: "Legs Length" },
  { key: "thigh", label: "Thigh Circumference" }, // Added for pants fit
  { key: "legOpening", label: "Leg Opening Circumference" },
];

const BodyMeasurements = ({ measurements, setMeasurements }) => {
  const { theme, userData } = useContext(UserContext);
  const [editingField, setEditingField] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch measurements from Firestore
  useEffect(() => {
    try {
      const fetchData = async () => {
        const uid = userData.uid;

        const docRef = doc(db, "users", uid, "settings", "measurements");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setMeasurements(docSnap.data());
        }
      };

      fetchData();
    } catch (error) {
      setShowMessage({
        type: "danger",
        message: "Something went wrong: " + error.message,
      });
      setPopUpMessageTrigger(true);
    } finally {
      setIsLoading(false);
    }
  }, [setMeasurements, userData.uid]);

  // Handle editing
  const handleEdit = (key) => {
    setEditingField(key);
  };

  // Handle input change
  const handleChange = (e, key) => {
    setMeasurements((prev) => ({ ...prev, [key]: e.target.value }));
  };

  return (
    <div className={`mt-6 rounded-lg shadow-md ${theme.colorText}`}>
      <h2 className="text-xl font-semibold mb-4">Body Measurements (cm)</h2>
      <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-1">
        {measurementFields.map(({ key, label }) => (
          <div
            key={key}
            className={`p-2 border rounded-md ${theme.colorBorder} ${theme.hoverShadow}`}
          >
            <label className="block text-sm font-medium">{label}</label>
            {editingField === key ? (
              isLoading ? (
                <div className="flex justify-center items-center p-2 mt-1">
                  <LoadingSpinner size={24} />
                </div>
              ) : (
                <input
                  type="number"
                  value={measurements[key] || ""}
                  onChange={(e) => handleChange(e, key)}
                  className={`w-full p-2 mt-1 rounded-md ${theme.colorBg} ${theme.colorText} ${theme.colorBorder} focus:outline-none focus:ring-2`}
                  autoFocus
                  onBlur={() => setEditingField(null)}
                />
              )
            ) : (
              !isLoading && (
                <p
                  className={`cursor-pointer p-2 mt-1 rounded-md ${theme.hoverText}`}
                  onClick={() => handleEdit(key)}
                >
                  {measurements[key] || "Click to enter"}
                </p>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BodyMeasurements;
