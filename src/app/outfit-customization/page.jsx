"use client";
import { useContext, useState } from "react";
import UserContext from "@/utils/UserContext";
import CustomizationScene from "@/components/3d components/CustomizationScene";

const OutfitCustomization = () => {
  const { theme } = useContext(UserContext);
  const [morphTargets, setMorphTargets] = useState([]); // Dynamically set based on outfit
  const [morphValues, setMorphValues] = useState([]);

  const handleMorphChange = (index, value) => {
    const updatedValues = [...morphValues];
    updatedValues[index] = value;
    setMorphValues(updatedValues);
  };

  return (
    <div
      className={`max-w-[99.5%] mx-auto items-center p-6 my-4 md:my-1 rounded-lg h-screen overflow-hidden select-none justify-center flex ${theme.mainTheme}`}
    >
      {/* Sliders dynamically adjust to loaded outfit */}
      <div className="absolute top-5 left-5 bg-white p-4 shadow-lg rounded-lg z-10">
        {morphTargets.map((target, index) => (
          <div key={index} className="mb-3">
            <label className="block text-sm font-medium text-gray-700">
              {target}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={morphValues[index] || 0}
              onChange={(e) =>
                handleMorphChange(index, parseFloat(e.target.value))
              }
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-500 
             [&::-webkit-slider-thumb]:appearance-none 
             [&::-webkit-slider-thumb]:w-4 
             [&::-webkit-slider-thumb]:h-4 
             [&::-webkit-slider-thumb]:bg-blue-500 
             [&::-webkit-slider-thumb]:rounded-full"
            />
          </div>
        ))}
      </div>

      {/* Scene handles outfit selection */}
      <CustomizationScene
        morphValues={morphValues}
        setMorphValues={setMorphValues}
        setMorphTargets={setMorphTargets}
      />
    </div>
  );
};

export default OutfitCustomization;
