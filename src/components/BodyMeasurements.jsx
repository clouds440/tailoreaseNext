"use client";
import { useState, useEffect, useContext } from "react";
import { db, auth } from "@/utils/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import UserContext from "@/utils/UserContext";
import { ClipLoader } from "react-spinners";
import SimpleButton from "./SimpleButton";
import { AiIcon, MeasurementIcon } from "../../public/icons/svgIcons";
import { LoadingSpinner } from "./LoadingSpinner";
import DialogBox from "./DialogBox";
import MeasurementFormAI from "./MeasurementFormAI";

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
  { key: "thigh", label: "Thigh Circumference" },
  { key: "legOpening", label: "Leg Opening Circumference" },
];

const BodyMeasurements = ({ measurements, setMeasurements, uid }) => {
  const { theme, setShowMessage, setPopUpMessageTrigger } =
    useContext(UserContext);
  const [editingField, setEditingField] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savingMeasurements, setSavingMeasurements] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [userInfo, setUserInfo] = useState({
    age: "",
    gender: "",
    height: "",
    weight: "",
  });

  // Fetch measurements from Firestore
  useEffect(() => {
    try {
      const fetchData = async () => {
        const docRef = doc(
          db,
          "settings",
          uid,
          "user_settings",
          "measurements"
        );
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setMeasurements(docSnap.data());
        }
      };

      fetchData();
    } catch (error) {
      console.log(error.message);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 3000);
    }
  }, [setMeasurements, uid]);

  const handleSaveMeasurements = async () => {
    try {
      setSavingMeasurements(true);
      const docRef = doc(db, "settings", uid, "user_settings", "measurements");
      await setDoc(docRef, measurements, { merge: true });
      setShowMessage({
        type: "success",
        message: "Measurements saved!",
      });
      setPopUpMessageTrigger(true);
    } catch (error) {
      setShowMessage({
        type: "danger",
        message: "Something went wrong: " + error.message,
      });
      setPopUpMessageTrigger(true);
    } finally {
      setSavingMeasurements(false);
    }
  };

  const isGenerationFormValid = () => {
    const { age, gender, height, weight } = userInfo;

    if (!gender || !age || !height || !weight) return false;

    return (
      age >= 3 &&
      age <= 110 &&
      height >= 40 &&
      height <= 250 &&
      weight >= 5 &&
      weight <= 200
    );
  };

  const { GoogleGenerativeAI } = require("@google/generative-ai");

  // Setup
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);

  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 5500,
    responseMimeType: "application/json",
  };

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig,
  });

  const measurementsPrompt = `
Generate estimated body measurements using the given user details (user weight is in KG and height is in centimeters).
Your response should ONLY contain a raw JavaScript object using this format with one exact value for each:

{
  chest: number,
  shoulder: number,
  torso: number,
  sleeve: number,
  neck: number,
  armhole: number,
  cuff: number,
  waist: number,
  hips: number,
  legs: number,
  thigh: number,
  legOpening: number
}

Guidelines:
- Units: All in centimeters (cm).
- Values should be logical, proportionate, and realistic.
- DO NOT add any explanation or extra text.
- DO NOT wrap the response in quotes or Markdown.
`;

  async function generateResponse(userInput) {
    const result = await model.generateContent(
      `${measurementsPrompt}\n\nUser Info:\n${JSON.stringify(userInput)}`
    );

    const responseText = result.response.text();

    try {
      const measurements = JSON.parse(responseText);
      return measurements;
    } catch (err) {
      console.error("Failed to parse AI response:", err);
      return null;
    }
  }

  const handleGenerate = async () => {
    setShowDialog(false);
    try {
      setIsLoading(true);
      const generated = await generateResponse(userInfo); // 👈 wait for the result
      if (generated) {
        setMeasurements(generated);
        setShowMessage({
          type: "success",
          message: "Measurements Generated. Edit them or click 'Save' now",
        });
        setPopUpMessageTrigger(true);
      }
    } catch (error) {
      console.log(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle editing
  const handleEdit = (key) => {
    setEditingField(key);
  };

  // Handle input change
  const handleChange = (e, key) => {
    setMeasurements((prev) => ({ ...prev, [key]: e.target.value }));
  };

  return (
    <div className={`mt-8 rounded-lg shadow-md ${theme.colorText}`}>
      <div className="inline-block sm:flex sm:justify-between items-center mb-4 rounded-md">
        <h2 className={`flex text-xl font-semibold`}>
          Body Measurements (cm)
          <MeasurementIcon
            color={`${theme.iconColor}`}
            extraClasses={"mt-1 ml-2"}
          />
        </h2>
        <div className="mt-3 sm:mt-0 flex space-x-2">
          <SimpleButton
            btnText="Generate with AI"
            type="accent"
            icon={<AiIcon />}
            onClick={() => setShowDialog(true)}
          />
          <SimpleButton
            btnText={
              savingMeasurements ? (
                <LoadingSpinner size={24} extraClasses={"px-[4.8px]"} />
              ) : (
                "Save"
              )
            }
            type="primary"
            extraclasses="px-5"
            disabled={isLoading || savingMeasurements}
            onClick={handleSaveMeasurements}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-1">
        {measurementFields.map(({ key, label }) => (
          <div
            key={key}
            className={`p-2 border rounded-md ${theme.colorBorder} ${theme.hoverShadow}`}
          >
            <label className="block text-sm font-medium">{label}</label>
            {editingField === key ? (
              <input
                type="number"
                value={measurements[key] || ""}
                onChange={(e) => handleChange(e, key)}
                className={`w-full p-2 mt-1 rounded-md ${theme.colorBg} ${theme.colorText} ${theme.colorBorder} focus:outline-none focus:ring-2`}
                autoFocus
                onBlur={() => setEditingField(null)}
              />
            ) : isLoading ? (
              <div className="flex justify-center items-center p-2 mt-1">
                <ClipLoader size={24} color={`${theme.colorText}`} />
              </div>
            ) : (
              <p
                className={`cursor-pointer p-2 mt-1 rounded-md ${theme.hoverText}`}
                onClick={() => handleEdit(key)}
              >
                {measurements[key] || "Click to enter"}
              </p>
            )}
          </div>
        ))}
      </div>
      {showDialog && (
        <DialogBox
          title="Generate Measurements with AI"
          type="info"
          showDialog={showDialog}
          setShowDialog={setShowDialog}
          body={() => (
            <MeasurementFormAI userInfo={userInfo} setUserInfo={setUserInfo} />
          )}
          buttons={[
            {
              label: "Generate",
              type: "primary",
              onClick: () => {
                if (!isGenerationFormValid()) {
                  setShowMessage({
                    message: "Please correctly fill in all the values",
                    type: "warning",
                  });
                  setPopUpMessageTrigger(true);
                  return;
                }

                // Proceed to AI generation
                handleGenerate(userInfo);
              },
            },
          ]}
        />
      )}
    </div>
  );
};

export default BodyMeasurements;
